import { _decorator, Component, Node, instantiate, Prefab, Vec3, tween, v3, director } from 'cc';
import { BaseNodeCom } from '../BaseNode';
import { DownGridManager } from './DownGridManager';
import { gridDownCmpt } from '../item/gridDownCmpt';
import StateMachine, { IState } from '../../Common/StateMachine';
import { GridData } from '../../Tools/enumConst';
const { ccclass, property } = _decorator;

/**
 * 炮塔状态枚举
 * 定义炮塔的不同状态
 */
export enum TurretState {
    /** 空闲状态：炮塔未激活 */
    IDLE = 'idle',
    /** 活跃状态：炮塔正在攻击 */
    ACTIVE = 'active',
    /** 重新装填状态：炮塔正在重新装填 */
    RELOADING = 'reloading',
    /** 升级状态：炮塔正在升级 */
    UPGRADING = 'upgrading',
    /** 禁用状态：炮塔被禁用 */
    DISABLED = 'disabled'
}

/**
 * 炮塔数据接口
 */
interface TurretData {
    turret: Turret;
    isAttacking: boolean;
    reloadTime: number;
    upgradeTime: number;
}

/**
 * 空闲状态
 */
class IdleState implements IState {
    readonly name: string = TurretState.IDLE;
    private _data: TurretData;
    
    constructor(data: TurretData) {
        this._data = data;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._data.isAttacking = false;
        this._data.turret.unscheduleAllCallbacks();
        console.log('Turret is now idle');
    }
    
    onUpdate(dt: number) {
        // 空闲状态下的更新逻辑
    }
    
    onExit(toState: IState | null) {
        console.log('Turret is leaving idle state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'activate':
                // 激活炮塔
                return true;
            case 'disable':
                // 禁用炮塔
                return true;
            case 'upgrade':
                // 开始升级
                return true;
            default:
                return false;
        }
    }
}

/**
 * 活跃状态
 */
class ActiveState implements IState {
    readonly name: string = TurretState.ACTIVE;
    private _data: TurretData;
    
    constructor(data: TurretData) {
        this._data = data;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._data.isAttacking = true;
        this._data.turret.startAttack();
        console.log('Turret is now active and attacking');
    }
    
    onUpdate(dt: number) {
        // 活跃状态下的更新逻辑
    }
    
    onExit(toState: IState | null) {
        this._data.turret.stopAttack();
        console.log('Turret is leaving active state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'deactivate':
                // 停用炮塔
                return true;
            case 'reload':
                // 开始重新装填
                return true;
            case 'upgrade':
                // 开始升级
                return true;
            case 'disable':
                // 禁用炮塔
                return true;
            default:
                return false;
        }
    }
}

/**
 * 重新装填状态
 */
class ReloadingState implements IState {
    readonly name: string = TurretState.RELOADING;
    private _data: TurretData;
    
    constructor(data: TurretData) {
        this._data = data;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._data.isAttacking = false;
        this._data.turret.unscheduleAllCallbacks();
        this._data.reloadTime = 2; // 2秒重新装填时间
        
        // 开始重新装填倒计时
        this._data.turret.scheduleOnce(() => {
            this._data.turret.activate();
        }, this._data.reloadTime);
        
        console.log('Turret is now reloading');
    }
    
    onUpdate(dt: number) {
        // 重新装填状态下的更新逻辑
        this._data.reloadTime -= dt;
    }
    
    onExit(toState: IState | null) {
        console.log('Turret is leaving reloading state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'cancel_reload':
                // 取消重新装填
                return true;
            case 'disable':
                // 禁用炮塔
                return true;
            default:
                return false;
        }
    }
}

/**
 * 升级状态
 */
class UpgradingState implements IState {
    readonly name: string = TurretState.UPGRADING;
    private _data: TurretData;
    
    constructor(data: TurretData) {
        this._data = data;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._data.isAttacking = false;
        this._data.turret.unscheduleAllCallbacks();
        this._data.upgradeTime = 3; // 3秒升级时间
        
        // 开始升级倒计时
        this._data.turret.scheduleOnce(() => {
            this._data.turret.activate();
        }, this._data.upgradeTime);
        
        console.log('Turret is now upgrading');
    }
    
    onUpdate(dt: number) {
        // 升级状态下的更新逻辑
        this._data.upgradeTime -= dt;
    }
    
    onExit(toState: IState | null) {
        console.log('Turret is leaving upgrading state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'cancel_upgrade':
                // 取消升级
                return true;
            case 'disable':
                // 禁用炮塔
                return true;
            default:
                return false;
        }
    }
}

/**
 * 禁用状态
 */
class DisabledState implements IState {
    readonly name: string = TurretState.DISABLED;
    private _data: TurretData;
    
    constructor(data: TurretData) {
        this._data = data;
    }
    
    onEnter(fromState: IState | null, params?: any) {
        this._data.isAttacking = false;
        this._data.turret.unscheduleAllCallbacks();
        console.log('Turret is now disabled');
    }
    
    onUpdate(dt: number) {
        // 禁用状态下的更新逻辑
    }
    
    onExit(toState: IState | null) {
        console.log('Turret is leaving disabled state');
    }
    
    onEvent(eventName: string, data?: any): boolean {
        switch (eventName) {
            case 'enable':
                // 启用炮塔
                return true;
            default:
                return false;
        }
    }
}

/**
 * 炮塔类
 * 继承自BaseNodeCom，负责发射攻击并击中DownGridManager中的gridDown
 * @description 炮塔系统，具有攻击速度、攻击范围和伤害属性，可从多个grid节点发射攻击
 */
@ccclass('Turret')
export class Turret extends BaseNodeCom {
    
    /** 存储的grid数据数组：用于发射攻击的grid数据 */
    public gridDataList: GridData[] = [];
    
    /** 攻击间隔时间（秒）：控制炮塔的攻击速度 */
    @property({
        type: Number,
        tooltip: "攻击间隔时间（秒）"
    })
    public attackInterval: number = 1.0;
    
    /** 发射的grid预制体：炮塔发射的子弹预制体 */
    public bulletPrefab: Prefab = null;
    
    /** 攻击伤害值：每次攻击对目标造成的伤害 */
    @property({
        type: Number,
        tooltip: "攻击伤害值"
    })
    public attackDamage: number = 1;
    
    /** 下落方块管理器引用：用于获取和攻击活跃的gridDown */
    @property(DownGridManager)
    private DownGridMgr: DownGridManager = null;
    
    /** 状态机实例 */
    private _stateMachine: StateMachine = new StateMachine();
    
    /** 炮塔数据 */
    private _turretData: TurretData;
    
    /**
     * 组件加载时调用
     * 初始化DownGridManager引用
     * @description 炮塔初始化时获取必要的组件引用
     */
    protected onLoad(): void {
        // 调用父类的onLoad方法
        super.onLoad();
        
        // 初始化炮塔数据
        this._turretData = {
            turret: this,
            isAttacking: false,
            reloadTime: 0,
            upgradeTime: 0
        };
        
        // 初始化状态机
        this.initStateMachine();
        
        // 检查DownGridManager是否获取成功
        if (!this.DownGridMgr) {
            console.error('Turret: 无法获取DownGridManager组件');
            this.disable();
        }
    }
    
    /**
     * 组件启用时调用
     * 开始攻击循环
     * @description 炮塔启用后开始自动攻击
     */
    protected start(): void {
        // 默认激活炮塔
        this.activate();
    }
    update(dt: number) {
        this.updateStateMachine(dt);
    }
    /**
     * 组件销毁时调用
     * 停止攻击循环
     * @description 炮塔销毁前清理资源和定时器
     */
    public onDestroy(): void {
        super.onDestroy();
        this.deactivate();
    }
    
    /**
     * 组件禁用时调用
     * 停止攻击循环
     * @description 炮塔禁用时暂停攻击
     */
    protected onDisable(): void {
        this.deactivate();
    }
    
    /**
     * 初始化状态机
     */
    private initStateMachine(): void {
        // 启用调试模式
        this._stateMachine.debugMode = true;
        
        // 设置状态变化回调
        this._stateMachine.onStateChange = this.onStateChange.bind(this);
        
        // 创建状态实例
        const idleState = new IdleState(this._turretData);
        const activeState = new ActiveState(this._turretData);
        const reloadingState = new ReloadingState(this._turretData);
        const upgradingState = new UpgradingState(this._turretData);
        const disabledState = new DisabledState(this._turretData);
        
        // 添加所有状态
        this._stateMachine.addStates([idleState, activeState, reloadingState, upgradingState, disabledState]);
        
        // 初始状态设为空闲
        this._stateMachine.changeState(TurretState.IDLE);
    }
    
    /**
     * 更新状态机
     * @param dt 时间间隔
     */
    private updateStateMachine(dt: number): void {
        this._stateMachine.update(dt);
    }
    
    /**
     * 状态变化回调
     * @param fromState 上一个状态
     * @param toState 下一个状态
     * @param params 参数
     */
    private onStateChange(fromState: IState | null, toState: IState | null, params?: any): void {
        console.log(`Turret state changed: ${fromState?.name || 'None'} -> ${toState?.name || 'None'}`, params);
    }
    
    /**
     * 激活炮塔
     * 将炮塔设置为活跃状态
     */
    public activate(): void {
        if (this._stateMachine.currentStateName !== TurretState.DISABLED) {
            this._stateMachine.changeState(TurretState.ACTIVE);
        }
    }
    
    /**
     * 停用炮塔
     * 将炮塔设置为空闲状态
     */
    public deactivate(): void {
        this._stateMachine.changeState(TurretState.IDLE);
    }
    
    /**
     * 禁用炮塔
     * 将炮塔设置为禁用状态
     */
    public disable(): void {
        this._stateMachine.changeState(TurretState.DISABLED);
    }
    
    /**
     * 开始攻击循环
     * 启动攻击计时器，定期执行攻击
     * @description 开始炮塔的自动攻击行为
     */
    public startAttack(): void {
        if (this._stateMachine.currentStateName !== TurretState.ACTIVE) return;
        
        // 清除所有计时器
        this.unscheduleAllCallbacks();
        
        // 开始攻击
        this.attack();
    }
    
    /**
     * 停止攻击循环
     * 清除所有计时器，停止攻击行为
     * @description 停止炮塔的自动攻击行为
     */
    public stopAttack(): void {
        this.unscheduleAllCallbacks();
    }
    
    /**
     * 攻击方法
     * 寻找目标并发射攻击
     * @description 炮塔的核心攻击逻辑，定期执行
     */
    private attack(): void {
        // 检查状态
        if (this._stateMachine.currentStateName !== TurretState.ACTIVE) return;
        
        // 延迟执行下一次攻击
        this.scheduleOnce(() => {
            // 再次检查状态
            if (this._stateMachine.currentStateName !== TurretState.ACTIVE) return;
            
            // 执行攻击
            this.fireAttack();
            
            // 递归调用，继续攻击循环
            this.attack();
        }, this.attackInterval);
    }
    
    /**
     * 执行攻击
     * 遍历所有存储的grid数据，为每个数据寻找目标并发射攻击
     * @description 执行实际的攻击操作，从每个grid数据发射攻击
     */
    private fireAttack(): void {
        // 遍历所有存储的grid数据
        for (const gridData of this.gridDataList) {
            // 寻找攻击目标
            const target = this.findTarget();
            
            // 如果找到目标，则发射攻击
            if (target) {
                this.fire(target, gridData);
            }
        }
    }
    
    /**
     * 寻找攻击目标
     * 在攻击范围内寻找最近的活跃gridDown
     * @returns 找到的目标节点，如果没有找到则返回null
     * @description 在DownGridManager中寻找可攻击的目标
     */
    private findTarget(): Node | null {

        
        // 返回找到的最近目标
        return null;
    }
    
    /**
     * 发射攻击
     * 从指定的grid数据发射子弹到目标
     * @param target 目标节点
     * @param gridData 发射攻击的grid数据
     * @description 从源grid数据向目标发射子弹
     */
    private fire(target: Node, gridData: GridData): void {
        // 检查子弹预制体是否存在
        if (!this.bulletPrefab) return;
        
        // 创建子弹实例
        const bullet = instantiate(this.bulletPrefab);
        
        // 设置子弹的父节点
        bullet.setParent(this.node.parent);
        
        // 设置子弹的初始位置为炮塔的位置
        bullet.setWorldPosition(this.node.worldPosition);
        
        // 获取目标的位置
        const targetPos = target.worldPosition;
        
        // 创建子弹飞行的动画
        tween(bullet)
            .to(0.5, { worldPosition: targetPos }) // 子弹飞行时间为0.5秒
            .call(() => {
                // 子弹到达目标后，击中目标
                this.hitTarget(target);
                
                // 销毁子弹
                bullet.destroy();
            })
            .start();

            console.log('Fire bullet to target:', target);
    }
    
    /**
     * 击中目标
     * 对目标造成伤害
     * @param target 被击中的目标节点
     * @description 处理子弹击中目标的逻辑，造成伤害
     */
    private hitTarget(target: Node): void {
        // 检查目标节点是否有效
        if (!target || !target.isValid) return;
        
        // 获取目标的gridDownCmpt组件
        const gridDownCmptcom = target.getComponent(gridDownCmpt);
        
        // 如果目标有gridDownCmpt组件，则造成伤害
        if (gridDownCmptcom) {
            gridDownCmptcom.takeDamage(this.attackDamage);
        }
    }
    
    /**
     * 添加grid数据
     * 向存储的grid数据数组中添加新的grid数据
     * @param gridData 新的grid数据
     * @description 动态添加发射点到炮塔
     */
    public addGridData(gridData: GridData): void {
        // 检查grid数据是否有效且不在数组中
        if (gridData) {
            // 添加数据到数组
            this.gridDataList.push(gridData);
        }
    }
    
    /**
     * 移除grid数据
     * 从存储的grid数据数组中移除指定的grid数据
     * @param gridData 要移除的grid数据
     * @description 动态移除炮塔的发射点
     */
    public removeGridData(gridData: GridData): void {

        // 如果数据在数组中，则移除
        if (this.gridDataList.length >= 0) {
            this.gridDataList.splice(0, 1);
        }
    }
    
    /**
     * 设置攻击间隔
     * 调整炮塔的攻击速度
     * @param interval 新的攻击间隔时间（秒）
     * @description 动态调整炮塔的攻击速度
     */
    public setAttackInterval(interval: number): void {
        // 确保攻击间隔不小于0.1秒
        this.attackInterval = Math.max(0.1, interval);
    }
    
    /**
     * 设置攻击伤害
     * 调整炮塔的攻击伤害值
     * @param damage 新的攻击伤害值
     * @description 动态调整炮塔的攻击威力
     */
    public setAttackDamage(damage: number): void {
        // 确保攻击伤害不小于1
        this.attackDamage = Math.max(1, damage);
    }
        
    /**
     * 获取当前状态
     * @returns 当前的炮塔状态名称
     */
    public getCurrentState(): string {
        return this._stateMachine.currentStateName;
    }
    
    /**
     * 开始升级
     * 将炮塔设置为升级状态
     */
    public startUpgradeProcess(): void {
        if (this._stateMachine.currentStateName !== TurretState.DISABLED) {
            this._stateMachine.changeState(TurretState.UPGRADING);
        }
    }
    
    /**
     * 开始重新装填
     * 将炮塔设置为重新装填状态
     */
    public startReloadProcess(): void {
        if (this._stateMachine.currentStateName === TurretState.ACTIVE) {
            this._stateMachine.changeState(TurretState.RELOADING);
        }
    }
    
    /**
     * 发送事件给状态机
     * @param eventName 事件名称
     * @param data 事件数据
     * @returns 事件是否被处理
     */
    public sendEvent(eventName: string, data?: any): boolean {
        return this._stateMachine.sendEvent(eventName, data);
    }
}
