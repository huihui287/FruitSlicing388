import { _decorator, Component, Node } from 'cc';
import WebSocketManager, { WebSocketEvent, WebSocketState } from './WebSocketManager';
import EventManager from './view/EventManager';

const { ccclass, property } = _decorator;

/**
 * WebSocketManager 使用示例
 * 展示如何使用 WebSocketManager 类进行 WebSocket 通信
 */
@ccclass
export class WebSocketManagerExample extends Component {
    /** WebSocket 服务器地址 */
    @property({ type: String, tooltip: 'WebSocket 服务器地址' })
    private wsUrl: string = 'ws://localhost:8080';

    protected onLoad() {
        // 添加 WebSocket 事件监听
        this.addWebSocketListeners();
    }

    protected onDestroy() {
        // 移除 WebSocket 事件监听
        this.removeWebSocketListeners();
        
        // 断开 WebSocket 连接
        WebSocketManager.instance.disconnect();
    }

    /**
     * 添加 WebSocket 事件监听
     */
    private addWebSocketListeners(): void {
        EventManager.on(WebSocketEvent.CONNECT, this.onConnect, this);
        EventManager.on(WebSocketEvent.DISCONNECT, this.onDisconnect, this);
        EventManager.on(WebSocketEvent.ERROR, this.onError, this);
        EventManager.on(WebSocketEvent.MESSAGE, this.onMessage, this);
        EventManager.on(WebSocketEvent.RECONNECT, this.onReconnect, this);
        EventManager.on(WebSocketEvent.RECONNECT_SUCCESS, this.onReconnectSuccess, this);
    }

    /**
     * 移除 WebSocket 事件监听
     */
    private removeWebSocketListeners(): void {
        EventManager.off(WebSocketEvent.CONNECT, this.onConnect, this);
        EventManager.off(WebSocketEvent.DISCONNECT, this.onDisconnect, this);
        EventManager.off(WebSocketEvent.ERROR, this.onError, this);
        EventManager.off(WebSocketEvent.MESSAGE, this.onMessage, this);
        EventManager.off(WebSocketEvent.RECONNECT, this.onReconnect, this);
        EventManager.off(WebSocketEvent.RECONNECT_SUCCESS, this.onReconnectSuccess, this);
    }

    /**
     * 连接到 WebSocket 服务器
     */
    public connectToServer(): void {
        console.log('Connecting to WebSocket server...');
        
        // 配置 WebSocket
        const config = {
            url: this.wsUrl,
            heartbeatInterval: 30000,  // 30秒心跳
            heartbeatMsg: { type: 'ping' },
            reconnectInterval: 5000,   // 5秒重连
            maxReconnectAttempts: 5,   // 最多重连5次
            debug: true                 // 启用调试模式
        };
        
        // 连接到服务器
        WebSocketManager.instance.connect(config);
    }

    /**
     * 断开 WebSocket 连接
     */
    public disconnectFromServer(): void {
        console.log('Disconnecting from WebSocket server...');
        WebSocketManager.instance.disconnect();
    }

    /**
     * 发送文本消息
     */
    public sendTextMessage(): void {
        const message = 'Hello, WebSocket!';
        console.log(`Sending text message: ${message}`);
        WebSocketManager.instance.send(message);
    }

    /**
     * 发送 JSON 消息
     */
    public sendJsonMessage(): void {
        const message = {
            type: 'chat',
            data: {
                userId: 'user123',
                username: 'TestUser',
                content: 'Hello from WebSocketManager!'
            }
        };
        console.log(`Sending JSON message:`, message);
        WebSocketManager.instance.sendJSON('chat', message.data);
    }

    /**
     * WebSocket 连接成功回调
     */
    private onConnect(): void {
        console.log('WebSocket connected!');
        console.log('Current state:', WebSocketState[WebSocketManager.instance.state]);
        
        // 连接成功后可以发送初始化消息
        this.sendJsonMessage();
    }

    /**
     * WebSocket 连接断开回调
     */
    private onDisconnect(reason?: any): void {
        console.log('WebSocket disconnected:', reason);
        console.log('Current state:', WebSocketState[WebSocketManager.instance.state]);
    }

    /**
     * WebSocket 错误回调
     */
    private onError(error: any): void {
        console.error('WebSocket error:', error);
    }

    /**
     * WebSocket 收到消息回调
     */
    private onMessage(message: any): void {
        console.log('Received WebSocket message:', message);
        
        // 根据消息类型处理不同的消息
        if (typeof message === 'object' && message.type) {
            switch (message.type) {
                case 'chat':
                    this.handleChatMessage(message);
                    break;
                case 'heartbeat':
                    this.handleHeartbeat(message);
                    break;
                case 'system':
                    this.handleSystemMessage(message);
                    break;
                default:
                    console.log('Unhandled message type:', message.type);
                    break;
            }
        }
    }

    /**
     * WebSocket 重连回调
     */
    private onReconnect(data: any): void {
        console.log(`WebSocket reconnecting... Attempt ${data.attempts}`);
    }

    /**
     * WebSocket 重连成功回调
     */
    private onReconnectSuccess(): void {
        console.log('WebSocket reconnected successfully!');
    }

    /**
     * 处理聊天消息
     */
    private handleChatMessage(message: any): void {
        console.log(`Chat message from ${message.data.username}: ${message.data.content}`);
    }

    /**
     * 处理心跳消息
     */
    private handleHeartbeat(message: any): void {
        console.log('Received heartbeat response');
    }

    /**
     * 处理系统消息
     */
    private handleSystemMessage(message: any): void {
        console.log(`System message: ${message.data.content}`);
    }

    /**
     * 获取当前 WebSocket 状态
     */
    public getCurrentState(): string {
        return WebSocketState[WebSocketManager.instance.state];
    }

    /**
     * 检查是否已连接
     */
    public isConnected(): boolean {
        return WebSocketManager.instance.isConnected;
    }
}
