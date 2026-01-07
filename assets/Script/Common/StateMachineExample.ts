import { _decorator, Component, Node, director } from 'cc';
import StateMachine, { IState } from './StateMachine';

const { ccclass, property } = _decorator;

/**
 * 角色状态示例 - 展示如何使用状态机
 */
@ccclass
export class CharacterStateMachineExample extends Component {
    /** 状态机实例 */
    private _stateMachine: StateMachine = new StateMachine();
    
    /** 角色数据 */
    private _characterData = {
        position: 0,
        velocity: 0,
        animation: 'idle',
        jumpCount: 0,
        isGrounded: true
    };
    
    protected start() {
        // 启用调试模式
        this._stateMachine.debugMode = true;
        
        // 设置状态变化回调
        this._stateMachine.onStateChange = this.onStateChange.bind(this);
        
        // 创建状态实例
        const idleState = new IdleState(this._characterData);
        const walkState = new WalkState(this._characterData);
        const runState = new RunState(this._characterData);
        const jumpState = new JumpState(this._characterData);
        
        // 添加所有状态
        this._stateMachine.addStates([idleState, walkState, runState, jumpState]);
        
        // 初始状态设为空闲
        this._stateMachine.changeState('idle');
        
        // 每帧更新状态机
        director.on('update', this.updateStateMachine, this);
        
        // 模拟状态变化
        this.simulateStateChanges();
    }
    
    /**
     * 更新状态机
     * @param dt 时间间隔
     */
    private updateStateMachine(dt: number) {
        this._stateMachine.update(dt);
    }
    
    /**
     * 状态变化回调
     * @param fromState 上一个状态
     * @param toState 下一个状态
     * @param params 参数
     */
    private onStateChange(fromState: IState | null, toState: IState | null, params?: any) {
        console.log(`Character state changed: ${fromState?.name || 'None'} -> ${toState?.name || 'None'}`, params);
    }
    
    /**
     * 模拟状态变化
     */
    private simulateStateChanges() {
        // 模拟角色状态变化
        setTimeout(() => {
            this._stateMachine.changeState('walk');
        }, 1000);
        
        setTimeout(() => {
            this._stateMachine.changeState('run');
        }, 3000);
        
        setTimeout(() => {
            this._stateMachine.changeState('jump', { jumpForce: 10 });
        }, 5000);
        
        setTimeout(() => {
            // 发送事件给当前状态
            this._stateMachine.sendEvent('land');
        }, 7000);
        
        setTimeout(() => {
            // 切换回空闲状态
            this._stateMachine.changeState('idle');
        }, 9000);
    }
    
    /**
     * 手动触发状态变化（可用于UI按钮）
     * @param stateName 状态名称
     */
    public changeCharacterState(stateName: string) {
        this._stateMachine.changeState(stateName);
    }
    
    /**
     * 发送事件给角色状态机
     * @param eventName 事件名称
     * @param data 事件数据
     */
    public sendCharacterEvent(eventName: string, data?: any) {
        this._stateMachine.sendEvent(eventName, data);
    }
    
    protected onDestroy() {
        // 移除更新事件监听
        director.off('update', this.updateStateMachine, this);
    }
}

/**
 * 空闲状态
 */
class IdleState implements IState {
    readonly name: string = 'idle';
    private _character: any;
    
    constructor(character: any) {
        this._character = character;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._character.animation = 'idle';
        this._character.velocity = 0;
        console.log('Character is now idle');
    }
    
    onUpdate(dt: number) {
        // 空闲状态下的更新逻辑
    }
    
    onExit(toState: IState | null) {
        console.log('Character is leaving idle state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        // 处理事件
        switch (eventName) {
            case 'move':
                // 接收到移动事件，切换到行走状态
                return true;
            default:
                return false;
        }
    }
}

/**
 * 行走状态
 */
class WalkState implements IState {
    readonly name: string = 'walk';
    private _character: any;
    private _speed: number = 2;
    
    constructor(character: any) {
        this._character = character;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._character.animation = 'walk';
        this._character.velocity = this._speed;
        console.log('Character is now walking');
    }
    
    onUpdate(dt: number) {
        // 行走状态下的更新逻辑
        this._character.position += this._character.velocity * dt;
    }
    
    onExit(toState: IState | null) {
        console.log('Character is leaving walk state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'stop':
                // 停止移动，切换到空闲状态
                return true;
            case 'run':
                // 开始跑步，切换到跑步状态
                return true;
            case 'jump':
                // 跳跃，切换到跳跃状态
                return true;
            default:
                return false;
        }
    }
}

/**
 * 跑步状态
 */
class RunState implements IState {
    readonly name: string = 'run';
    private _character: any;
    private _speed: number = 5;
    
    constructor(character: any) {
        this._character = character;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._character.animation = 'run';
        this._character.velocity = this._speed;
        console.log('Character is now running');
    }
    
    onUpdate(dt: number) {
        // 跑步状态下的更新逻辑
        this._character.position += this._character.velocity * dt;
    }
    
    onExit(toState: IState | null) {
        console.log('Character is leaving run state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'stop':
                // 停止移动，切换到空闲状态
                return true;
            case 'walk':
                // 改为行走，切换到行走状态
                return true;
            case 'jump':
                // 跳跃，切换到跳跃状态
                return true;
            default:
                return false;
        }
    }
}

/**
 * 跳跃状态
 */
class JumpState implements IState {
    readonly name: string = 'jump';
    private _character: any;
    private _jumpForce: number = 8;
    private _gravity: number = -0.2;
    
    constructor(character: any) {
        this._character = character;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._character.animation = 'jump';
        this._character.isGrounded = false;
        this._character.jumpCount++;
        
        // 如果有跳跃力参数，使用它
        if (params && params.jumpForce) {
            this._jumpForce = params.jumpForce;
        }
        
        this._character.velocity = this._jumpForce;
        console.log('Character is now jumping');
    }
    
    onUpdate(dt: number) {
        // 跳跃状态下的更新逻辑 - 应用重力
        this._character.velocity += this._gravity;
        this._character.position += this._character.velocity * dt;
        
        // 落地检测
        if (this._character.position <= 0 && this._character.velocity < 0) {
            this._character.position = 0;
            this._character.velocity = 0;
            this._character.isGrounded = true;
            
            // 发送落地事件
            // 注意：实际使用时，事件应该由外部系统发送，而不是状态内部
            console.log('Character landed');
        }
    }
    
    onExit(toState: IState | null) {
        console.log('Character is leaving jump state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'land':
                // 落地事件，切换到空闲状态
                console.log('JumpState received land event');
                return true;
            default:
                return false;
        }
    }
}
