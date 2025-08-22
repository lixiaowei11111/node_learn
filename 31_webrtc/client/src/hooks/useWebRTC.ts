import { useState, useRef, useCallback, useEffect } from 'react';
import { message } from 'antd';
import {
  Client,
  FileTransfer,
  ConnectionState,
  UseWebRTCOptions,
  UseWebRTCReturn,
  SignalingMessage,
  RegisterMessage,
  RegisteredMessage,
  ClientListMessage,
  OfferMessage,
  AnswerMessage,
  IceCandidateMessage,
  FileInfoMessage,
  FileChunkMessage,
} from '../types/webRTC';

const DEFAULT_OPTIONS: Required<UseWebRTCOptions> = {
  serverUrl: 'ws://localhost:3000/ws',
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  chunkSize: 65536, // 64KB - 更稳定的块大小，避免缓冲区问题
};

export const useWebRTC = (options: UseWebRTCOptions = {}): UseWebRTCReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // 状态管理
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    clientId: '',
    clientName: '',
    clientIP: '',
    error: null,
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const currentTransferRef = useRef<Partial<FileTransfer> | null>(null);
  const currentTargetIdRef = useRef<string>('');

  // 处理数据通道消息 - 优化版本
  const handleDataChannelMessage = useCallback((data: string | ArrayBuffer) => {
    if (typeof data === 'string') {
      try {
        const message = JSON.parse(data) as FileInfoMessage | FileChunkMessage;

        if (message.type === 'file-info') {
          const transfer: FileTransfer = {
            id: Date.now().toString(),
            fileName: message.fileName,
            fileSize: message.fileSize,
            fileType: message.fileType,
            chunks: new Array(message.totalChunks),
            receivedChunks: 0,
            totalChunks: message.totalChunks,
            progress: 0,
            status: 'transferring',
            direction: 'receive',
            timestamp: Date.now(),
          };

          currentTransferRef.current = transfer;
          setTransfers((prev) => [...prev, transfer]);
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    } else if (data instanceof ArrayBuffer && currentTransferRef.current) {
      // 处理合并的消息头和文件块数据
      const transfer = currentTransferRef.current as FileTransfer;

      try {
        // 查找换行符分隔头部和数据
        const dataView = new Uint8Array(data);
        let headerEnd = -1;
        for (let i = 0; i < Math.min(dataView.length, 1000); i++) {
          if (dataView[i] === 10) {
            // '\n' 的ASCII码
            headerEnd = i;
            break;
          }
        }

        if (headerEnd === -1) {
          console.error('无法找到消息头分隔符');
          return;
        }

        // 解析头部信息
        const headerBuffer = data.slice(0, headerEnd);
        const headerText = new TextDecoder().decode(headerBuffer);
        const chunkInfo = JSON.parse(headerText) as FileChunkMessage;

        // 提取实际文件数据
        const fileData = data.slice(headerEnd + 1);

        // 存储块数据
        transfer.chunks[chunkInfo.chunkIndex] = fileData;
        transfer.receivedChunks++;

        // 批量更新进度，减少重渲染
        const progress = (transfer.receivedChunks / transfer.totalChunks) * 100;

        // 使用 requestAnimationFrame 优化UI更新
        requestAnimationFrame(() => {
          setTransfers((prev) =>
            prev.map((t) => (t.id === transfer.id ? { ...t, progress } : t)),
          );
        });

        // 检查是否接收完成
        if (transfer.receivedChunks === transfer.totalChunks) {
          transfer.status = 'completed';
          setTransfers((prev) =>
            prev.map((t) =>
              t.id === transfer.id
                ? { ...t, status: 'completed', progress: 100 }
                : t,
            ),
          );
          message.success(`文件接收完成: ${transfer.fileName}`);
          currentTransferRef.current = null;
        }
      } catch (error) {
        console.error('Error processing file chunk:', error);
      }
    }
  }, []);

  // 设置数据通道
  const setupDataChannel = useCallback(
    (channel: RTCDataChannel) => {
      channel.binaryType = 'arraybuffer';

      channel.onmessage = (event) => {
        handleDataChannelMessage(event.data);
      };

      channel.onopen = () => {
        console.log('Data channel opened');
      };

      channel.onclose = () => {
        console.log('Data channel closed');
      };

      channel.onerror = (error) => {
        console.error('Data channel error:', error);
      };
    },
    [handleDataChannelMessage],
  );

  // 初始化PeerConnection
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: config.iceServers,
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        const message: IceCandidateMessage = {
          type: 'ice-candidate',
          candidate: event.candidate,
          fromId: connectionState.clientId,
          targetId: currentTargetIdRef.current,
        };
        wsRef.current.send(JSON.stringify(message));
      }
    };

    peerConnectionRef.current.ondatachannel = (event) => {
      setupDataChannel(event.channel);
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      console.log(
        'Connection state:',
        peerConnectionRef.current?.connectionState,
      );
    };
  }, [config.iceServers, connectionState.clientId, setupDataChannel]);

  // 处理Offer
  const handleOffer = useCallback(
    async (data: OfferMessage) => {
      if (!peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(data.offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        const message: AnswerMessage = {
          type: 'answer',
          answer: answer,
          fromId: connectionState.clientId,
          targetId: data.fromId,
        };

        wsRef.current?.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    },
    [connectionState.clientId],
  );

  // 处理Answer
  const handleAnswer = useCallback(async (data: AnswerMessage) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // 处理ICE候选
  const handleIceCandidate = useCallback(async (data: IceCandidateMessage) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  // WebSocket消息处理
  const handleWebSocketMessage = useCallback(
    async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as SignalingMessage;

        switch (data.type) {
          case 'registered': {
            const msg = data as RegisteredMessage;
            setConnectionState((prev) => ({
              ...prev,
              isConnected: true,
              clientId: msg.clientId,
              clientName: msg.name,
              clientIP: msg.ip,
              error: null,
            }));
            break;
          }

          case 'client-list': {
            const msg = data as ClientListMessage;
            setClients(
              msg.clients.filter((c) => c.id !== connectionState.clientId),
            );
            break;
          }

          case 'offer': {
            const msg = data as OfferMessage;
            await handleOffer(msg);
            break;
          }

          case 'answer': {
            const msg = data as AnswerMessage;
            await handleAnswer(msg);
            break;
          }

          case 'ice-candidate': {
            const msg = data as IceCandidateMessage;
            await handleIceCandidate(msg);
            break;
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    },
    [connectionState.clientId, handleAnswer, handleIceCandidate, handleOffer],
  );

  // 连接到服务器
  const connect = useCallback(
    async (name: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          wsRef.current = new WebSocket(config.serverUrl);

          wsRef.current.onopen = () => {
            const message: RegisterMessage = {
              type: 'register',
              name: name,
            };
            wsRef.current!.send(JSON.stringify(message));
            initializePeerConnection();
          };

          wsRef.current.onmessage = handleWebSocketMessage;

          wsRef.current.onerror = (error) => {
            setConnectionState((prev) => ({
              ...prev,
              error: 'WebSocket连接错误',
            }));
            reject(error);
          };

          wsRef.current.onclose = () => {
            setConnectionState((prev) => ({
              ...prev,
              isConnected: false,
              error: '连接已断开',
            }));
          };

          // 监听连接状态变化来resolve Promise
          const checkConnection = () => {
            if (connectionState.isConnected) {
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          setTimeout(checkConnection, 100);
        } catch (error) {
          reject(error);
        }
      });
    },
    [
      config.serverUrl,
      handleWebSocketMessage,
      initializePeerConnection,
      connectionState.isConnected,
    ],
  );

  // 断开连接
  const disconnect = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState({
      isConnected: false,
      clientId: '',
      clientName: '',
      error: null,
    });

    setClients([]);
    currentTransferRef.current = null;
  }, []);

  // 传输文件 - 优化版本
  const transferFile = useCallback(
    async (file: File): Promise<void> => {
      if (!dataChannelRef.current) {
        throw new Error('Data channel not available');
      }

      const channel = dataChannelRef.current;

      // 检查数据通道状态
      if (channel.readyState !== 'open') {
        throw new Error(
          `Data channel is not open. Current state: ${channel.readyState}`,
        );
      }

      const totalChunks = Math.ceil(file.size / config.chunkSize);
      const transferId = Date.now().toString();

      // 添加发送记录
      const transfer: FileTransfer = {
        id: transferId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        chunks: [],
        receivedChunks: 0,
        totalChunks: totalChunks,
        progress: 0,
        status: 'transferring',
        direction: 'send',
        timestamp: Date.now(),
      };

      setTransfers((prev) => [...prev, transfer]);

      // 发送文件元信息
      const fileInfo: FileInfoMessage = {
        type: 'file-info',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks: totalChunks,
      };

      channel.send(JSON.stringify(fileInfo));

      // 优化的分块发送 - 使用并发控制和缓冲区管理
      const MAX_BUFFER_SIZE = 1 * 1024 * 1024; // 1MB 缓冲区限制，更保守的设置
      let currentChunk = 0;
      let lastProgressUpdate = 0;

      const sendNextChunk = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
          const processChunk = async () => {
            if (currentChunk >= totalChunks) {
              resolve();
              return;
            }

            // 检查缓冲区大小，避免内存溢出
            if (channel.bufferedAmount > MAX_BUFFER_SIZE) {
              // 等待缓冲区清空
              setTimeout(processChunk, 10);
              return;
            }

            try {
              const i = currentChunk++;
              const start = i * config.chunkSize;
              const end = Math.min(start + config.chunkSize, file.size);
              const chunk = file.slice(start, end);
              const buffer = await chunk.arrayBuffer();

              // 合并消息头和数据，减少发送次数
              const chunkInfo = JSON.stringify({
                type: 'file-chunk',
                chunkIndex: i,
                totalChunks: totalChunks,
              });

              // 创建一个包含头信息和数据的单一消息
              const headerBuffer = new TextEncoder().encode(chunkInfo + '\n');
              const combinedBuffer = new ArrayBuffer(
                headerBuffer.byteLength + buffer.byteLength,
              );
              const combinedView = new Uint8Array(combinedBuffer);
              combinedView.set(new Uint8Array(headerBuffer), 0);
              combinedView.set(new Uint8Array(buffer), headerBuffer.byteLength);

              channel.send(combinedBuffer);

              // 优化的进度更新 - 减少频率和使用requestAnimationFrame
              const now = Date.now();
              if (now - lastProgressUpdate > 100 || i === totalChunks - 1) {
                lastProgressUpdate = now;
                requestAnimationFrame(() => {
                  const progress = ((i + 1) / totalChunks) * 100;
                  setTransfers((prev) =>
                    prev.map((t) =>
                      t.id === transferId ? { ...t, progress } : t,
                    ),
                  );
                });
              }

              // 继续处理下一个块
              if (currentChunk < totalChunks) {
                // 使用 setTimeout 避免调用栈溢出
                setTimeout(processChunk, 0);
              } else {
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          };

          processChunk();
        });
      };

      await sendNextChunk();

      // 标记完成
      setTransfers((prev) =>
        prev.map((t) =>
          t.id === transferId
            ? { ...t, status: 'completed', progress: 100 }
            : t,
        ),
      );
    },
    [config.chunkSize],
  );

  // 发送文件
  const sendFile = useCallback(
    async (targetId: string, file: File): Promise<void> => {
      if (!peerConnectionRef.current) {
        throw new Error('PeerConnection not initialized');
      }

      currentTargetIdRef.current = targetId;

      // 创建数据通道
      dataChannelRef.current = peerConnectionRef.current.createDataChannel(
        'fileTransfer',
        {
          ordered: true,
        },
      );

      setupDataChannel(dataChannelRef.current);

      // 创建并发送offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      const message: OfferMessage = {
        type: 'offer',
        offer: offer,
        fromId: connectionState.clientId,
        targetId: targetId,
      };

      wsRef.current?.send(JSON.stringify(message));

      // 等待连接建立并传输文件
      return new Promise((resolve, reject) => {
        if (!dataChannelRef.current) {
          reject(new Error('Data channel not created'));
          return;
        }

        const channel = dataChannelRef.current;

        // 设置超时机制
        const timeout = setTimeout(() => {
          reject(new Error('Data channel connection timeout'));
        }, 30000); // 30秒超时

        channel.onopen = async () => {
          clearTimeout(timeout);
          console.log('Data channel opened, ready to transfer file');

          // 确保通道真正准备好
          if (channel.readyState === 'open') {
            try {
              // 稍微延迟一下确保连接稳定
              await new Promise((resolve) => setTimeout(resolve, 100));
              await transferFile(file);
              resolve();
            } catch (error) {
              console.error('File transfer error:', error);
              reject(error);
            }
          } else {
            reject(
              new Error(
                `Data channel state is ${channel.readyState}, expected 'open'`,
              ),
            );
          }
        };

        channel.onerror = (error) => {
          clearTimeout(timeout);
          console.error('Data channel error:', error);
          reject(error);
        };

        channel.onclose = () => {
          clearTimeout(timeout);
          reject(new Error('Data channel closed unexpectedly'));
        };

        // 如果通道已经打开，直接传输
        if (channel.readyState === 'open') {
          clearTimeout(timeout);
          transferFile(file).then(resolve).catch(reject);
        }
      });
    },
    [connectionState.clientId, setupDataChannel, transferFile],
  );

  // 下载文件
  const downloadFile = useCallback(
    (transferId: string) => {
      const transfer = transfers.find((t) => t.id === transferId);
      if (
        !transfer ||
        transfer.direction !== 'receive' ||
        transfer.status !== 'completed'
      ) {
        return;
      }

      const blob = new Blob(transfer.chunks, { type: transfer.fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = transfer.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [transfers],
  );

  // 清除所有传输记录
  const clearTransfers = useCallback(() => {
    setTransfers([]);
  }, []);

  // 移除单个传输记录
  const removeTransfer = useCallback((transferId: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== transferId));
  }, []);

  // 清理副作用
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    clients,
    transfers,
    connect,
    disconnect,
    sendFile,
    downloadFile,
    clearTransfers,
    removeTransfer,
  };
};
