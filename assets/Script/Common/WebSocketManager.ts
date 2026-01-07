import { _decorator } from 'cc';
import EventManager from './view/EventManager';

const { ccclass } = _decorator;

/**
 * WebSocket 连接状态枚举
 */
export enum WebSocketState {
    DISCONNECTED = 0,  // 未连接
    CONNECTING = 1,    // 连接中
    CONNECTED = 2,     // 已连接
    DISCONNECTING = 3  // 断开中
}

/**
 * WebSocket 事件类型
 */
export enum WebSocketEvent {
    CONNECT = 'websocket_connect',          // 连接成功
    DISCONNECT = 'websocket_disconnect',    // 连接断开
    ERROR = 'websocket_error',              // 连接错误
    MESSAGE = 'websocket_message',          // 收到消息
    RECONNECT = 'websocket_reconnect',      // 正在重连
    RECONNECT_SUCCESS = 'websocket_reconnect_success' // 重连成功
}

/**
 * WebSocket 消息接口
 */
export interface WebSocketMessage {
    type: string;   // 消息类型
    data: any;      // 消息数据
}

/**
 * WebSocket 配置接口
 */
export interface WebSocketConfig {
    url: string;                    // WebSocket 服务器地址
    heartbeatInterval?: number;     // 心跳间隔（毫秒）
    heartbeatMsg?: any;             // 心跳消息内容
    reconnectInterval?: number;     // 重连间隔（毫秒）
    maxReconnectAttempts?: number;  // 最大重连次数
    debug?: boolean;                // 是否启用调试模式
}

/**
 * WebSocket 管理器类
 * 封装 Cocos Creator 自带的 WebSocket 操作，提供事件回调、心跳检测、自动重连等功能
 */
@ccclass
export default class WebSocketManager {
    private static _instance: WebSocketManager;
    private _ws: WebSocket | null = null;
    private _config: WebSocketConfig = {
        url: '',
        heartbeatInterval: 30000,  // 默认30秒心跳
        heartbeatMsg: { type: 'heartbeat' },
        reconnectInterval: 5000,   // 默认5秒重连
        maxReconnectAttempts: 5,   // 默认最多重连5次
        debug: false
    };
    private _state: WebSocketState = WebSocketState.DISCONNECTED;
    private _heartbeatTimer: number | null = null;
    private _reconnectTimer: number | null = null;
    private _reconnectAttempts: number = 0;
    private _isManualDisconnect: boolean = false;

    /**
     * 获取单例实例
     */
    public static get instance(): WebSocketManager {
        if (!this._instance) {
            this._instance = new WebSocketManager();
        }
        return this._instance;
    }

    /**
     * 获取当前连接状态
     */
    public get state(): WebSocketState {
        return this._state;
    }

    /**
     * 获取当前连接状态名称
     */
    public get stateName(): string {
        return WebSocketState[this._state];
    }

    /**
     * 是否连接中
     */
    public get isConnecting(): boolean {
        return this._state === WebSocketState.CONNECTING;
    }

    /**
     * 是否已连接
     */
    public get isConnected(): boolean {
        return this._state === WebSocketState.CONNECTED;
    }

    /**
     * 是否已断开
     */
    public get isDisconnected(): boolean {
        return this._state === WebSocketState.DISCONNECTED;
    }

    /**
     * 是否正在断开
     */
    public get isDisconnecting(): boolean {
        return this._state === WebSocketState.DISCONNECTING;
    }

    /**
     * 连接到 WebSocket 服务器
     * @param config WebSocket 配置
     */
    public connect(config: WebSocketConfig): void {
        // 更新配置
        this._config = { ...this._config, ...config };
        
        // 如果正在连接或已连接，不重复连接
        if (this.isConnecting || this.isConnected) {
            this.debugLog(`WebSocket is already ${this.stateName}`);
            return;
        }

        this.debugLog(`Connecting to ${this._config.url}...`);
        this._isManualDisconnect = false;
        this._reconnectAttempts = 0;
        this._state = WebSocketState.CONNECTING;

        try {
            // 创建 WebSocket 连接
            this._ws = new WebSocket(this._config.url);
            
            // 设置事件监听
            this._ws.onopen = this.onOpen.bind(this);
            this._ws.onmessage = this.onMessage.bind(this);
            this._ws.onerror = this.onError.bind(this);
            this._ws.onclose = this.onClose.bind(this);
        } catch (error) {
            this.handleError(`Failed to create WebSocket: ${error}`);
        }
    }

    /**
     * 断开 WebSocket 连接
     */
    public disconnect(): void {
        this.debugLog('Disconnecting WebSocket...');
        
        // 如果未连接，直接返回
        if (this.isDisconnected) {
            this.debugLog('WebSocket is already disconnected');
            return;
        }

        this._isManualDisconnect = true;
        this._state = WebSocketState.DISCONNECTING;

        // 清除定时器
        this.clearTimers();

        // 关闭 WebSocket 连接
        if (this._ws) {
            this._ws.close();
            this._ws = null;
        }

        this._state = WebSocketState.DISCONNECTED;
        this.debugLog('WebSocket disconnected');
        
        // 发送断开连接事件
        EventManager.emit(WebSocketEvent.DISCONNECT);
    }

    /**
     * 发送消息
     * @param message 要发送的消息
     */
    public send(message: any): void {
        if (!this.isConnected || !this._ws) {
            this.debugLog('Cannot send message: WebSocket is not connected');
            return;
        }

        try {
            const msgString = typeof message === 'string' ? message : JSON.stringify(message);
            this._ws.send(msgString);
            this.debugLog(`Sent message: ${msgString}`);
        } catch (error) {
            this.handleError(`Failed to send message: ${error}`);
        }
    }

    /**
     * 发送 JSON 消息
     * @param type 消息类型
     * @param data 消息数据
     */
    public sendJSON(type: string, data: any): void {
        const message: WebSocketMessage = { type, data };
        this.send(message);
    }

    /**
     * 连接成功回调
     */
    private onOpen(): void {
        this.debugLog(`WebSocket connected to ${this._config.url}`);
        this._state = WebSocketState.CONNECTED;
        this._reconnectAttempts = 0;

        // 启动心跳检测
        this.startHeartbeat();

        // 发送连接成功事件
        EventManager.emit(WebSocketEvent.CONNECT);
    }

    /**
     * 收到消息回调
     * @param event 消息事件
     */
    private onMessage(event: MessageEvent): void {
        this.debugLog(`Received message: ${event.data}`);
        
        try {
            // 尝试解析 JSON 消息
            const message = JSON.parse(event.data);
            EventManager.emit(WebSocketEvent.MESSAGE, message);
        } catch (error) {
            // 如果不是 JSON 消息，直接传递
            EventManager.emit(WebSocketEvent.MESSAGE, event.data);
        }
    }

    /**
     * 连接错误回调
     * @param event 错误事件
     */
    private onError(event: Event): void {
        this.handleError(`WebSocket error: ${event}`);
    }

    /**
     * 连接关闭回调
     * @param event 关闭事件
     */
    private onClose(event: CloseEvent): void {
        this.debugLog(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
        this._state = WebSocketState.DISCONNECTED;

        // 清除定时器
        this.clearTimers();

        // 发送断开连接事件
        EventManager.emit(WebSocketEvent.DISCONNECT, { code: event.code, reason: event.reason });

        // 如果不是手动断开连接，尝试重连
        if (!this._isManualDisconnect) {
            this.attemptReconnect();
        }
    }

    /**
     * 尝试重连
     */
    private attemptReconnect(): void {
        if (this._config.maxReconnectAttempts && this._reconnectAttempts >= this._config.maxReconnectAttempts) {
            this.debugLog(`Max reconnect attempts reached (${this._reconnectAttempts}), stopping`);
            return;
        }

        this._reconnectAttempts++;
        this.debugLog(`Attempting to reconnect (${this._reconnectAttempts}/${this._config.maxReconnectAttempts})...`);

        // 发送重连事件
        EventManager.emit(WebSocketEvent.RECONNECT, { attempts: this._reconnectAttempts });

        // 设置重连定时器
        this._reconnectTimer = window.setTimeout(() => {
            this.connect(this._config);
        }, this._config.reconnectInterval);
    }

    /**
     * 启动心跳检测
     */
    private startHeartbeat(): void {
        this.clearTimers();

        if (this._config.heartbeatInterval && this._config.heartbeatMsg) {
            this._heartbeatTimer = window.setInterval(() => {
                if (this.isConnected) {
                    this.send(this._config.heartbeatMsg!);
                }
            }, this._config.heartbeatInterval);
        }
    }

    /**
     * 清除所有定时器
     */
    private clearTimers(): void {
        if (this._heartbeatTimer !== null) {
            clearInterval(this._heartbeatTimer);
            this._heartbeatTimer = null;
        }

        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }

    /**
     * 处理错误
     * @param error 错误信息
     */
    private handleError(error: string): void {
        this.debugLog(`WebSocket error: ${error}`);
        this._state = WebSocketState.DISCONNECTED;
        
        // 清除定时器
        this.clearTimers();

        // 发送错误事件
        EventManager.emit(WebSocketEvent.ERROR, error);
    }

    /**
     * 调试日志
     * @param message 日志消息
     */
    private debugLog(message: string): void {
        if (this._config.debug) {
            console.log(`[WebSocketManager] ${message}`);
        }
    }

    /**
     * 启用/禁用调试模式
     * @param enabled 是否启用
     */
    public setDebugMode(enabled: boolean): void {
        this._config.debug = enabled;
        this.debugLog(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * 获取当前配置
     */
    public get config(): WebSocketConfig {
        return { ...this._config };
    }
}
