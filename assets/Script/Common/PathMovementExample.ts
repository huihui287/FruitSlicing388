import { _decorator, Component, Node, Vec3, Button, Label } from 'cc';
import PathMovement, { MovementState, PathMovementConfig, PathMovementEvents } from './PathMovement';
const { ccclass, property } = _decorator;

@ccclass
export default class PathMovementExample extends Component {
    @property(Node) // 目标节点
    private targetNode: Node = null;
    
    @property([Node]) // 路径点节点数组
    private pathNodes: Node[] = [];
    
    @property(Button) // 开始按钮
    private startButton: Button = null;
    
    @property(Button) // 暂停按钮
    private pauseButton: Button = null;
    
    @property(Button) // 继续按钮
    private resumeButton: Button = null;
    
    @property(Button) // 停止按钮
    private stopButton: Button = null;
    
    @property(Button) // 重置按钮
    private resetButton: Button = null;
    
    @property(Label) // 状态显示标签
    private statusLabel: Label = null;
    
    private pathMovement: PathMovement = null;
    
    protected onLoad(): void {
        this.initPathMovement();
        this.initUI();
    }
    
    /**
     * 初始化路径移动
     */
    private initPathMovement(): void {
        // 配置路径移动参数
        const config: PathMovementConfig = {
            speed: 50, // 移动速度
            loop: false, // 不循环移动
            easing: 'cubicOut', // 缓动类型
            autoStart: false // 不自动开始移动
        };
        
        // 配置事件回调
        const events: PathMovementEvents = {
            onStart: (target) => {
                console.log('PathMovementExample: 移动开始');
                this.updateStatusLabel();
            },
            onWaypointReached: (target, waypointIndex) => {
                console.log(`PathMovementExample: 到达路径点 ${waypointIndex}`);
            },
            onComplete: (target) => {
                console.log('PathMovementExample: 移动完成');
                this.updateStatusLabel();
            },
            onLoopComplete: (target) => {
                console.log('PathMovementExample: 循环完成');
            },
            onStop: (target) => {
                console.log('PathMovementExample: 移动停止');
                this.updateStatusLabel();
            }
        };
        
        // 创建PathMovement实例
        this.pathMovement = new PathMovement(this.targetNode, this.pathNodes, config, events);
    }
    
    /**
     * 初始化UI
     */
    private initUI(): void {
        // 绑定按钮事件
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartButtonClick, this);
        }
        
        if (this.pauseButton) {
            this.pauseButton.node.on(Button.EventType.CLICK, this.onPauseButtonClick, this);
        }
        
        if (this.resumeButton) {
            this.resumeButton.node.on(Button.EventType.CLICK, this.onResumeButtonClick, this);
        }
        
        if (this.stopButton) {
            this.stopButton.node.on(Button.EventType.CLICK, this.onStopButtonClick, this);
        }
        
        if (this.resetButton) {
            this.resetButton.node.on(Button.EventType.CLICK, this.onResetButtonClick, this);
        }
        
        // 更新初始状态
        this.updateStatusLabel();
    }
    
    /**
     * 更新状态标签
     */
    private updateStatusLabel(): void {
        if (!this.statusLabel) return;
        
        const state = this.pathMovement.getState();
        let statusText = '';
        
        switch (state) {
            case MovementState.IDLE:
                statusText = '状态: 空闲';
                break;
            case MovementState.MOVING:
                statusText = '状态: 移动中';
                break;
            case MovementState.PAUSED:
                statusText = '状态: 已暂停';
                break;
            case MovementState.COMPLETED:
                statusText = '状态: 已完成';
                break;
        }
        
        const currentWaypoint = this.pathMovement.getCurrentWaypointIndex();
        const totalWaypoints = this.pathNodes.length;
        
        statusText += ` | 当前路径点: ${currentWaypoint}/${totalWaypoints - 1}`;
        this.statusLabel.string = statusText;
    }
    
    /**
     * 开始按钮点击事件
     */
    private onStartButtonClick(): void {
        console.log('PathMovementExample: 点击开始按钮');
        this.pathMovement.start();
    }
    
    /**
     * 暂停按钮点击事件
     */
    private onPauseButtonClick(): void {
        console.log('PathMovementExample: 点击暂停按钮');
        this.pathMovement.pause();
        this.updateStatusLabel();
    }
    
    /**
     * 继续按钮点击事件
     */
    private onResumeButtonClick(): void {
        console.log('PathMovementExample: 点击继续按钮');
        this.pathMovement.resume();
        this.updateStatusLabel();
    }
    
    /**
     * 停止按钮点击事件
     */
    private onStopButtonClick(): void {
        console.log('PathMovementExample: 点击停止按钮');
        this.pathMovement.stop();
        this.updateStatusLabel();
    }
    
    /**
     * 重置按钮点击事件
     */
    private onResetButtonClick(): void {
        console.log('PathMovementExample: 点击重置按钮');
        this.pathMovement.reset();
        
        // 重置目标节点位置到起点
        if (this.targetNode && this.pathNodes.length > 0) {
            this.targetNode.position = this.pathNodes[0].position;
        }
        
        this.updateStatusLabel();
    }
    
    /**
     * 动态添加路径点示例
     */
    private addPathPointExample(): void {
        // 创建一个新的路径点节点
        const newPathNode = new Node('NewPathPoint');
        newPathNode.position = new Vec3(100, 200, 0);
        this.node.addChild(newPathNode);
        
        // 更新路径点数组
        this.pathNodes.push(newPathNode);
        
        // 更新PathMovement的路径点
        if (this.pathMovement) {
            this.pathMovement.setPathNodes(this.pathNodes);
        }
    }
    
    /**
     * 修改移动速度示例
     */
    private changeSpeedExample(newSpeed: number): void {
        if (this.pathMovement) {
            this.pathMovement.setSpeed(newSpeed);
        }
    }
    
    protected onDestroy(): void {
        // 销毁PathMovement实例
        if (this.pathMovement) {
            this.pathMovement.destroy();
        }
    }
}
