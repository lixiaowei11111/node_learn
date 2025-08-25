import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '../lib/toast';
import { FileStorageService } from '../services/fileStorageService';
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
  autoFetchICEServers: true, // 默认自动从服务器获取 ICE 服务器配置
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
  const clientIdRef = useRef<string>('');

  // 文件存储服务
  const fileStorage = useRef<FileStorageService>(
    FileStorageService.getInstance(),
  );

  // 初始化文件存储服务
  useEffect(() => {
    fileStorage.current.initialize().catch(console.error);
  }, []);

  // 处理数据通道消息 - 优化版本（使用 IndexedDB）
  const handleDataChannelMessage = useCallback(
    async (data: string | ArrayBuffer) => {
      if (typeof data === 'string') {
        try {
          const message = JSON.parse(data) as
            | FileInfoMessage
            | FileChunkMessage;

          if (message.type === 'file-info') {
            const now = Date.now();
            const transfer: FileTransfer = {
              id: now.toString(),
              fileName: message.fileName,
              fileSize: message.fileSize,
              fileType: message.fileType,
              // chunks: new Array(message.totalChunks), // 移除内存存储
              receivedChunks: 0,
              totalChunks: message.totalChunks,
              progress: 0,
              status: 'transferring',
              direction: 'receive',
              timestamp: now,
              startTime: now,
              lastUpdateTime: now,
              transferredBytes: 0,
              speed: 0,
              avgSpeed: 0,
              estimatedTimeRemaining: undefined,
              useOptimizedStorage: true,
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

          // 使用 IndexedDB 存储块数据，而不是内存
          await fileStorage.current.storeChunk(
            transfer.id,
            chunkInfo.chunkIndex,
            fileData,
          );
          transfer.receivedChunks++;

          // 计算传输速度
          const now = Date.now();
          const chunkSize = fileData.byteLength;
          transfer.transferredBytes += chunkSize;

          // 计算当前速度（每秒字节数）
          const timeDiff =
            (now - (transfer.lastUpdateTime || transfer.startTime || now)) /
            1000;
          if (timeDiff > 0) {
            transfer.speed = chunkSize / timeDiff;
          }

          // 计算平均速度
          const totalTimeDiff = (now - (transfer.startTime || now)) / 1000;
          if (totalTimeDiff > 0) {
            transfer.avgSpeed = transfer.transferredBytes / totalTimeDiff;
          }

          // 计算预估剩余时间
          const remainingBytes = transfer.fileSize - transfer.transferredBytes;
          if (transfer.avgSpeed > 0 && remainingBytes > 0) {
            transfer.estimatedTimeRemaining =
              remainingBytes / transfer.avgSpeed;
          }

          transfer.lastUpdateTime = now;

          // 批量更新进度，减少重渲染
          const progress =
            (transfer.receivedChunks / transfer.totalChunks) * 100;

          // 使用 requestAnimationFrame 优化UI更新
          requestAnimationFrame(() => {
            setTransfers((prev) =>
              prev.map((t) =>
                t.id === transfer.id
                  ? {
                      ...t,
                      progress,
                      transferredBytes: transfer.transferredBytes,
                      speed: transfer.speed,
                      avgSpeed: transfer.avgSpeed,
                      estimatedTimeRemaining: transfer.estimatedTimeRemaining,
                      lastUpdateTime: transfer.lastUpdateTime,
                    }
                  : t,
              ),
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
            toast.success(`文件接收完成: ${transfer.fileName}`);
            currentTransferRef.current = null;
          }
        } catch (error) {
          console.error('Error processing file chunk:', error);
          // 如果存储失败，将传输标记为失败
          if (currentTransferRef.current) {
            const transfer = currentTransferRef.current as FileTransfer;
            setTransfers((prev) =>
              prev.map((t) =>
                t.id === transfer.id ? { ...t, status: 'failed' } : t,
              ),
            );
          }
        }
      }
    },
    [],
  );

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

  // 从服务器获取 ICE 服务器配置
  const fetchICEServers = useCallback(async (): Promise<RTCIceServer[]> => {
    if (!config.autoFetchICEServers) {
      return config.iceServers;
    }

    try {
      const serverBaseUrl = config.serverUrl
        .replace('ws://', 'http://')
        .replace('wss://', 'https://')
        .replace('/ws', '');
      const response = await fetch(`${serverBaseUrl}/api/webrtc-config`);

      if (!response.ok) {
        console.warn(
          'Failed to fetch ICE servers from server, using default config',
        );
        return config.iceServers;
      }

      const data = await response.json();
      console.log('Fetched ICE servers from server:', data.iceServers);

      return data.iceServers || config.iceServers;
    } catch (error) {
      console.warn('Error fetching ICE servers from server:', error);
      return config.iceServers;
    }
  }, [config.autoFetchICEServers, config.iceServers, config.serverUrl]);

  // 初始化PeerConnection
  const initializePeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // 获取最新的 ICE 服务器配置
    const iceServers = await fetchICEServers();

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: iceServers,
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (
        event.candidate &&
        wsRef.current &&
        clientIdRef.current &&
        currentTargetIdRef.current
      ) {
        const message: IceCandidateMessage = {
          type: 'ice-candidate',
          candidate: event.candidate,
          fromId: clientIdRef.current,
          targetId: currentTargetIdRef.current,
        };
        console.log(
          `[Client] Sending ICE candidate to ${currentTargetIdRef.current}`,
          message,
        );
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
  }, [fetchICEServers, connectionState.clientId, setupDataChannel]);

  // 处理Offer
  const handleOffer = useCallback(async (data: OfferMessage) => {
    if (!peerConnectionRef.current) return;

    // 使用 ref 获取 clientId，确保立即可用
    const clientId = clientIdRef.current;
    if (!clientId) {
      console.error('[Client] Cannot handle offer: clientId is not available');
      return;
    }

    try {
      currentTargetIdRef.current = data.fromId; // 设置当前目标ID

      await peerConnectionRef.current.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      const message: AnswerMessage = {
        type: 'answer',
        answer: answer,
        fromId: clientId,
        targetId: data.fromId,
      };

      console.log(`[Client] Sending answer to ${data.fromId}`, message);
      console.log(`[Client] My clientId: "${clientId}"`);
      wsRef.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, []);

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
            console.log('Client registered successfully:', {
              clientId: msg.clientId,
              name: msg.name,
              ip: msg.ip,
              roomId: msg.roomId,
            });

            // 保存到 ref 中，确保立即可用
            clientIdRef.current = msg.clientId;

            setConnectionState((prev) => ({
              ...prev,
              isConnected: true,
              clientId: msg.clientId,
              clientName: msg.name,
              clientIP: msg.ip,
              error: null,
            }));

            // 如果需要，可以将房间ID更新到URL中
            if (msg.roomId && msg.roomId !== 'default') {
              const url = new URL(window.location.href);
              url.searchParams.set('room', msg.roomId);
              window.history.replaceState({}, '', url.toString());
            }
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
            console.log(`[Client] Received offer from ${msg.fromId}`);
            await handleOffer(msg);
            break;
          }

          case 'answer': {
            const msg = data as AnswerMessage;
            console.log(`[Client] Received answer from ${msg.fromId}`);
            await handleAnswer(msg);
            break;
          }

          case 'ice-candidate': {
            const msg = data as IceCandidateMessage;
            console.log(`[Client] Received ICE candidate from ${msg.fromId}`);
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
    async (name: string, roomId?: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          // 创建一个标志来跟踪这次连接尝试
          let connectionResolved = false;

          wsRef.current = new WebSocket(config.serverUrl);

          wsRef.current.onopen = () => {
            // 从URL参数获取房间ID，如果没有则使用传入的roomId
            const urlParams = new URLSearchParams(window.location.search);
            const urlRoomId = urlParams.get('room');
            const finalRoomId = urlRoomId || roomId || 'default';

            const message: RegisterMessage = {
              type: 'register',
              name: name,
              roomId: finalRoomId,
            };
            wsRef.current!.send(JSON.stringify(message));
            initializePeerConnection();
          };

          // 修改消息处理逻辑，直接监听 registered 消息
          wsRef.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data) as SignalingMessage;

              // 如果收到注册成功消息且还没有解析，则解析 Promise
              if (data.type === 'registered' && !connectionResolved) {
                connectionResolved = true;
                resolve();
              }

              // 继续处理其他消息
              handleWebSocketMessage(event);
            } catch (error) {
              console.error(
                'Error handling WebSocket message in connect:',
                error,
              );
            }
          };

          wsRef.current.onerror = (error) => {
            if (!connectionResolved) {
              connectionResolved = true;
              setConnectionState((prev) => ({
                ...prev,
                error: 'WebSocket连接错误',
              }));
              reject(error);
            }
          };

          wsRef.current.onclose = () => {
            if (!connectionResolved) {
              connectionResolved = true;
              reject(new Error('WebSocket连接关闭'));
            }
            setConnectionState((prev) => ({
              ...prev,
              isConnected: false,
              error: '连接已断开',
            }));
          };

          // 设置超时
          setTimeout(() => {
            if (!connectionResolved) {
              connectionResolved = true;
              reject(new Error('连接超时'));
            }
          }, 10000); // 10秒超时
        } catch (error) {
          reject(error);
        }
      });
    },
    [config.serverUrl, handleWebSocketMessage, initializePeerConnection],
  );

  // 断开连接
  const disconnect = useCallback(() => {
    // 立即设置断开状态，避免UI卡顿
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      error: null,
    }));

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

    // 清理其他状态
    setTimeout(() => {
      setConnectionState({
        isConnected: false,
        clientId: '',
        clientName: '',
        clientIP: '',
        error: null,
      });
      setClients([]);
      currentTransferRef.current = null;
    }, 0);
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
      const now = Date.now();
      const transfer: FileTransfer = {
        id: transferId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        receivedChunks: 0,
        totalChunks: totalChunks,
        progress: 0,
        status: 'transferring',
        direction: 'send',
        timestamp: now,
        startTime: now,
        lastUpdateTime: now,
        transferredBytes: 0,
        speed: 0,
        avgSpeed: 0,
        estimatedTimeRemaining: undefined,
        useOptimizedStorage: true,
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
      let transferredBytes = 0;
      let lastSpeedUpdate = now;

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

              // 计算传输速度
              const currentTime = Date.now();
              const chunkSize = buffer.byteLength;
              transferredBytes += chunkSize;

              // 计算当前速度（每秒字节数）
              const timeDiff = (currentTime - lastSpeedUpdate) / 1000;
              let currentSpeed = 0;
              if (timeDiff > 0) {
                currentSpeed = chunkSize / timeDiff;
              }

              // 计算平均速度
              const totalTimeDiff = (currentTime - now) / 1000;
              let avgSpeed = 0;
              if (totalTimeDiff > 0) {
                avgSpeed = transferredBytes / totalTimeDiff;
              }

              // 计算预估剩余时间
              const remainingBytes = file.size - transferredBytes;
              let estimatedTimeRemaining: number | undefined;
              if (avgSpeed > 0 && remainingBytes > 0) {
                estimatedTimeRemaining = remainingBytes / avgSpeed;
              }

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
              if (
                currentTime - lastProgressUpdate > 100 ||
                i === totalChunks - 1
              ) {
                lastProgressUpdate = currentTime;
                lastSpeedUpdate = currentTime;
                requestAnimationFrame(() => {
                  const progress = ((i + 1) / totalChunks) * 100;
                  setTransfers((prev) =>
                    prev.map((t) =>
                      t.id === transferId
                        ? {
                            ...t,
                            progress,
                            transferredBytes,
                            speed: currentSpeed,
                            avgSpeed,
                            estimatedTimeRemaining,
                            lastUpdateTime: currentTime,
                          }
                        : t,
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
      console.log(`[Client] Sending file "${file.name}" to ${targetId}`);

      if (!peerConnectionRef.current) {
        throw new Error('PeerConnection not initialized');
      }

      currentTargetIdRef.current = targetId;

      // 创建数据通道
      console.log('[Client] Creating data channel...');
      dataChannelRef.current = peerConnectionRef.current.createDataChannel(
        'fileTransfer',
        {
          ordered: true,
        },
      );

      setupDataChannel(dataChannelRef.current);

      // 创建并发送offer
      console.log('[Client] Creating offer...');
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      const message: OfferMessage = {
        type: 'offer',
        offer: offer,
        fromId: clientIdRef.current,
        targetId: targetId,
      };

      console.log(`[Client] Sending offer to ${targetId}`, message);
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
          console.error('[Client] Data channel connection timeout');
          reject(new Error('Data channel connection timeout'));
        }, 30000); // 30秒超时

        channel.onopen = async () => {
          clearTimeout(timeout);
          console.log('[Client] Data channel opened, ready to transfer file');

          // 确保通道真正准备好
          if (channel.readyState === 'open') {
            try {
              // 稍微延迟一下确保连接稳定
              await new Promise((resolve) => setTimeout(resolve, 100));
              await transferFile(file);
              console.log('[Client] File transfer completed successfully');
              resolve();
            } catch (error) {
              console.error('[Client] File transfer error:', error);
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
          console.error('[Client] Data channel error:', error);
          reject(error);
        };

        channel.onclose = () => {
          clearTimeout(timeout);
          console.error('[Client] Data channel closed unexpectedly');
          reject(new Error('Data channel closed unexpectedly'));
        };

        // 如果通道已经打开，直接传输
        if (channel.readyState === 'open') {
          clearTimeout(timeout);
          console.log(
            '[Client] Data channel already open, starting transfer immediately',
          );
          transferFile(file).then(resolve).catch(reject);
        }
      });
    },
    [setupDataChannel, transferFile],
  );

  // 下载文件 - 使用 IndexedDB
  const downloadFile = useCallback(
    async (transferId: string) => {
      const transfer = transfers.find((t) => t.id === transferId);
      if (
        !transfer ||
        transfer.direction !== 'receive' ||
        transfer.status !== 'completed'
      ) {
        return;
      }

      try {
        // 从 IndexedDB 组装文件
        const blob = await fileStorage.current.assembleFile(
          transferId,
          transfer.totalChunks,
          transfer.fileType,
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = transfer.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 立即释放 URL 对象
        URL.revokeObjectURL(url);

        toast.success(`文件下载完成: ${transfer.fileName}`);
      } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('文件下载失败，请重试');
      }
    },
    [transfers],
  );

  // 清除所有传输记录
  const clearTransfers = useCallback(() => {
    setTransfers([]);
  }, []);

  // 移除单个传输记录
  const removeTransfer = useCallback(async (transferId: string) => {
    // 从 IndexedDB 删除相关数据
    try {
      await fileStorage.current.deleteTransfer(transferId);
    } catch (error) {
      console.error('Error deleting transfer from storage:', error);
    }

    setTransfers((prev) => {
      return prev.filter((t) => t.id !== transferId);
    });
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
