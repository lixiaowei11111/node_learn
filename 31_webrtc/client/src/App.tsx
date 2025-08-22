import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Card,
  Button,
  Upload,
  List,
  Progress,
  Input,
  message,
  Space,
  Tag,
  Typography,
  Tooltip,
  Popconfirm,
  Drawer,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  UserOutlined,
  WifiOutlined,
  DisconnectOutlined,
  DeleteOutlined,
  ClearOutlined,
  MenuOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useWebRTC } from './hooks/useWebRTC';
import { useMobile, mobileUtils } from './hooks/useMobile';
import { FileTransfer, ExtendedClient } from './types/webRTC';
import './App.css';
import './mobile.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [clientName, setClientName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const mobileInfo = useMobile();
  const { isMobile, isIOS } = mobileInfo;

  // 移动端优化初始化
  useEffect(() => {
    if (isMobile) {
      // 应用移动端性能优化
      mobileUtils.optimizePerformance();

      // iOS Safari特殊处理
      if (isIOS) {
        mobileUtils.hideAddressBar();
      }

      // 防止页面缩放
      document.addEventListener('gesturestart', (e) => e.preventDefault());
      document.addEventListener('gesturechange', (e) => e.preventDefault());
      document.addEventListener('gestureend', (e) => e.preventDefault());
    }
  }, [isMobile, isIOS]);

  const {
    connectionState,
    clients,
    transfers,
    connect,
    disconnect,
    sendFile,
    downloadFile,
    clearTransfers,
    removeTransfer,
  } = useWebRTC({
    serverUrl: 'ws://localhost:3000/ws',
  });

  const handleConnect = useCallback(async () => {
    if (!clientName.trim()) {
      message.error('请输入客户端名称');
      return;
    }

    try {
      await connect(clientName);
      message.success('连接成功');
    } catch (error) {
      message.error('连接失败');
      console.error(error);
    }
  }, [clientName, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    message.info('已断开连接');
  }, [disconnect]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    return false; // 阻止自动上传
  }, []);

  const handleSendFile = useCallback(
    async (targetId: string) => {
      if (!selectedFile) {
        message.error('请先选择文件');
        return;
      }

      try {
        await sendFile(targetId, selectedFile);
        message.success('文件发送完成');
        setSelectedFile(null);
        if (isMobile) {
          setDrawerVisible(false);
        }
      } catch (error) {
        message.error('文件发送失败');
        console.error(error);
      }
    },
    [selectedFile, sendFile, isMobile],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: FileTransfer['status']): string => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'transferring':
        return 'processing';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: FileTransfer['status']): string => {
    switch (status) {
      case 'completed':
        return '完成';
      case 'transferring':
        return '传输中';
      case 'failed':
        return '失败';
      case 'pending':
        return '等待';
      default:
        return '未知';
    }
  };

  // 优化客户端名称输入处理
  const handleClientNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setClientName(e.target.value);
    },
    [],
  );

  // 稳定的样式对象，避免重复创建
  const connectionCardStyle = useMemo(() => ({ width: '100%' }), []);
  const clientItemStyle = useMemo(
    () => ({
      width: '100%',
    }),
    [],
  );
  const clientNameStyle = useMemo(
    () => ({
      fontSize: isMobile ? '14px' : '16px',
    }),
    [isMobile],
  );
  const clientIdStyle = useMemo(() => ({ fontSize: '12px' }), []);
  const clientListPadding = useMemo(
    () => ({
      padding: isMobile ? '8px 0' : '16px 0',
    }),
    [isMobile],
  );

  // 生成显示用的客户端列表，包含本设备
  const displayClients = useMemo((): ExtendedClient[] => {
    if (!connectionState.isConnected || !connectionState.clientId) {
      return [];
    }

    // 过滤掉服务器返回的本地设备，避免重复显示
    const otherClients: ExtendedClient[] = clients.filter(
      (client) => client.id !== connectionState.clientId,
    );

    // 添加本设备到列表顶部
    const allClients: ExtendedClient[] = [
      {
        id: connectionState.clientId,
        name: connectionState.clientName,
        ip: connectionState.clientIP,
        isCurrentDevice: true,
      },
      ...otherClients,
    ];

    return allClients;
  }, [
    clients,
    connectionState.isConnected,
    connectionState.clientId,
    connectionState.clientName,
    connectionState.clientIP,
  ]);

  // 控制面板组件 - 使用 useMemo 优化，避免组件重新创建
  const controlPanelContent = useMemo(
    () => (
      <Space direction="vertical" style={connectionCardStyle} size="middle">
        <Card title="连接设置" size={isMobile ? 'small' : 'default'}>
          <Space direction="vertical" style={connectionCardStyle}>
            <Input
              placeholder="输入客户端名称"
              value={clientName}
              onChange={handleClientNameChange}
              prefix={<UserOutlined />}
              disabled={connectionState.isConnected}
              size={isMobile ? 'large' : 'middle'}
            />
            {!connectionState.isConnected ? (
              <Button
                type="primary"
                onClick={handleConnect}
                block
                loading={false}
                size={isMobile ? 'large' : 'middle'}
              >
                连接服务器
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                block
                danger
                size={isMobile ? 'large' : 'middle'}
              >
                断开连接
              </Button>
            )}
          </Space>
        </Card>

        {connectionState.isConnected && (
          <Card
            title={
              <Space>
                <TeamOutlined />
                设备列表 ({displayClients.length})
              </Space>
            }
            size={isMobile ? 'small' : 'default'}
          >
            <List
              size="small"
              dataSource={displayClients}
              renderItem={(client) => {
                const isCurrentDevice = client.isCurrentDevice ?? false;
                return (
                  <List.Item style={clientListPadding}>
                    <div style={clientItemStyle}>
                      <div style={{ marginBottom: 8 }}>
                        <Space>
                          <Text strong style={clientNameStyle}>
                            {client.name}
                          </Text>
                          {isCurrentDevice && <Tag color="blue">本设备</Tag>}
                        </Space>
                        <br />
                        <Text type="secondary" style={clientIdStyle}>
                          {client.id.substring(0, 8)}...
                        </Text>
                        {client.ip && (
                          <>
                            <br />
                            <Text type="secondary" style={clientIdStyle}>
                              IP: {client.ip}
                            </Text>
                          </>
                        )}
                      </div>
                      <Button
                        size={isMobile ? 'large' : 'small'}
                        type={isCurrentDevice ? 'default' : 'primary'}
                        onClick={() => handleSendFile(client.id)}
                        disabled={!selectedFile || isCurrentDevice}
                        block
                        title={
                          isCurrentDevice ? '不能向自己发送文件' : '发送文件'
                        }
                      >
                        {isCurrentDevice ? '本设备' : '发送文件'}
                      </Button>
                    </div>
                  </List.Item>
                );
              }}
              locale={{ emptyText: '暂无其他客户端在线' }}
            />
          </Card>
        )}
      </Space>
    ),
    [
      connectionCardStyle,
      isMobile,
      clientName,
      handleClientNameChange,
      connectionState.isConnected,
      handleConnect,
      handleDisconnect,
      displayClients,
      handleSendFile,
      selectedFile,
      clientItemStyle,
      clientNameStyle,
      clientIdStyle,
      clientListPadding,
    ],
  );

  // 移动端布局
  if (isMobile) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header
          style={{
            background: '#001529',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  style={{ color: 'white' }}
                  size="large"
                />
                <Title
                  level={4}
                  style={{
                    color: 'white',
                    margin: 0,
                    fontSize: '16px',
                  }}
                >
                  文件传输
                </Title>
              </Space>
            </Col>
            <Col>
              {connectionState.isConnected ? (
                <Tag icon={<WifiOutlined />} color="success">
                  {displayClients.length - 1}
                </Tag>
              ) : (
                <Tag icon={<DisconnectOutlined />} color="default">
                  离线
                </Tag>
              )}
            </Col>
          </Row>
        </Header>

        <Content style={{ padding: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="文件选择" size="small">
              <Upload
                beforeUpload={handleFileSelect}
                showUploadList={false}
                accept="*/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  block
                  size="large"
                  type="dashed"
                >
                  选择文件
                </Button>
              </Upload>
              {selectedFile && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 6,
                    fontSize: '14px',
                  }}
                >
                  <Text strong>已选择文件：</Text>
                  <br />
                  <Text ellipsis>名称：{selectedFile.name}</Text>
                  <br />
                  <Text>大小：{formatFileSize(selectedFile.size)}</Text>
                </div>
              )}
            </Card>

            <Card
              title="传输记录"
              size="small"
              extra={
                transfers.length > 0 && (
                  <Popconfirm
                    title="确定要清除所有传输记录吗？"
                    onConfirm={clearTransfers}
                  >
                    <Button icon={<ClearOutlined />} size="small" type="text">
                      清除
                    </Button>
                  </Popconfirm>
                )
              }
            >
              <List
                dataSource={transfers}
                renderItem={(transfer) => (
                  <List.Item
                    style={{ padding: '12px 0' }}
                    actions={[
                      transfer.direction === 'receive' &&
                      transfer.status === 'completed' ? (
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={() => downloadFile(transfer.id)}
                          size="small"
                          type="primary"
                        />
                      ) : null,
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => removeTransfer(transfer.id)}
                        size="small"
                        type="text"
                        danger
                      />,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ fontSize: '14px' }}>
                          <Text ellipsis style={{ maxWidth: '200px' }}>
                            {transfer.fileName}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Tag
                              color={
                                transfer.direction === 'send' ? 'blue' : 'green'
                              }
                            >
                              {transfer.direction === 'send' ? '发送' : '接收'}
                            </Tag>
                            <Tag color={getStatusColor(transfer.status)}>
                              {getStatusText(transfer.status)}
                            </Tag>
                          </div>
                        </div>
                      }
                      description={
                        <div style={{ fontSize: '12px' }}>
                          <Text type="secondary">
                            {formatFileSize(transfer.fileSize)} |{' '}
                            {new Date(transfer.timestamp).toLocaleTimeString()}
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Progress
                              percent={Math.round(transfer.progress)}
                              size="small"
                              status={
                                transfer.status === 'failed'
                                  ? 'exception'
                                  : transfer.status === 'completed'
                                    ? 'success'
                                    : 'active'
                              }
                            />
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无传输记录' }}
              />
            </Card>
          </Space>
        </Content>

        <Drawer
          title="控制面板"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
        >
          {controlPanelContent}
        </Drawer>
      </Layout>
    );
  }

  // 桌面端布局
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              局域网文件传输
            </Title>
          </Col>
          <Col>
            <Space>
              {connectionState.isConnected ? (
                <Tag icon={<WifiOutlined />} color="success">
                  已连接 ({displayClients.length - 1} 个其他客户端在线)
                </Tag>
              ) : (
                <Tag icon={<DisconnectOutlined />} color="default">
                  未连接
                </Tag>
              )}
              {connectionState.error && (
                <Tag color="error">{connectionState.error}</Tag>
              )}
            </Space>
          </Col>
        </Row>
      </Header>

      <Layout>
        <Layout.Sider
          width={320}
          style={{ background: '#fff', padding: '24px' }}
        >
          {controlPanelContent}
        </Layout.Sider>

        <Content style={{ padding: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="文件选择">
              <Upload
                beforeUpload={handleFileSelect}
                showUploadList={false}
                accept="*/*"
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              {selectedFile && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: '#f5f5f5',
                    borderRadius: 6,
                  }}
                >
                  <Text strong>已选择文件：</Text>
                  <br />
                  <Text>名称：{selectedFile.name}</Text>
                  <br />
                  <Text>大小：{formatFileSize(selectedFile.size)}</Text>
                  <br />
                  <Text>类型：{selectedFile.type || '未知'}</Text>
                </div>
              )}
            </Card>

            <Card
              title="传输记录"
              extra={
                transfers.length > 0 && (
                  <Space>
                    <Popconfirm
                      title="确定要清除所有传输记录吗？"
                      onConfirm={clearTransfers}
                    >
                      <Button icon={<ClearOutlined />} size="small" type="text">
                        清除所有
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              }
            >
              <List
                dataSource={transfers}
                renderItem={(transfer) => (
                  <List.Item
                    actions={[
                      transfer.direction === 'receive' &&
                      transfer.status === 'completed' ? (
                        <Tooltip title="下载文件">
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={() => downloadFile(transfer.id)}
                            size="small"
                            type="primary"
                          >
                            下载
                          </Button>
                        </Tooltip>
                      ) : null,
                      <Tooltip title="删除记录">
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => removeTransfer(transfer.id)}
                          size="small"
                          type="text"
                          danger
                        />
                      </Tooltip>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text>{transfer.fileName}</Text>
                          <Tag
                            color={
                              transfer.direction === 'send' ? 'blue' : 'green'
                            }
                          >
                            {transfer.direction === 'send' ? '发送' : '接收'}
                          </Tag>
                          <Tag color={getStatusColor(transfer.status)}>
                            {getStatusText(transfer.status)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">
                            大小: {formatFileSize(transfer.fileSize)} | 时间:{' '}
                            {new Date(transfer.timestamp).toLocaleTimeString()}
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            <Progress
                              percent={Math.round(transfer.progress)}
                              size="small"
                              status={
                                transfer.status === 'failed'
                                  ? 'exception'
                                  : transfer.status === 'completed'
                                    ? 'success'
                                    : 'active'
                              }
                            />
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无传输记录' }}
              />
            </Card>
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
