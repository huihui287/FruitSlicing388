import { _decorator, Component, Node, Prefab, v3, instantiate, tween } from 'cc';
import { Constant, GridType } from '../../Tools/enumConst';
import { gridCmpt } from '../item/gridCmpt';
import LoaderManeger from '../../sysloader/LoaderManeger';
import { gridDownCmpt } from '../item/gridDownCmpt';
import EventManager from '../../Common/view/EventManager';
import { EventName } from '../../Tools/eventName';

const { ccclass, property } = _decorator;

@ccclass('DownGridManager')
export class DownGridManager extends Component {
    /** 预制体引用：水果方块预制体 */
    private gridDownPre: Prefab = null;
    /** 预制体引用：粒子特效预制体 */
    private particlePre: Prefab = null;

    //出生点位合集里面有9个children分别是9个出生点位
    @property({
        type: Node,
        tooltip: "出生点位合集"
    })
    public BirthPoint: Node = null;
    
    // 配置属性
    @property({
        type: Number,
        tooltip: "总共生成的水果方块数量"
    })
    public totalGridCount: number = 50;

    @property({
        type: Number,
        tooltip: "下落速度(像素/秒)"
    })
    public fallSpeed: number = 100;

    // 内部变量
    /** 已生成的水果方块总数：跟踪当前已生成的水果方块数量 */
    private generatedCount: number = 0;
    /** 水果方块对象池：存储可复用的水果方块节点，用于优化性能 */
    private gridPool: Node[] = [];
    /** 活跃水果方块数组：存储当前正在屏幕上活跃的水果方块 */
    private activeGrids: Node[] = [];
    /** 锁定的水果方块集合：存储已被选中的水果方块，防止重复选择 */
    private lockedGrids: Set<Node> = new Set();
    /** 生成状态标志：控制水果方块是否正在生成 */
    private isGenerating: boolean = false;
    
    // 暂停功能相关变量
    /** 暂停状态标志：控制水果方块的下落是否暂停 结束和暂停都是它 */
    private isPaused: boolean = false;
    
    /** 路径可用性检查定时器ID */
    private pathCheckIntervalId: any = null;
    
    /**
     * 下落进度映射：跟踪每个水果方块是否正在下落
     */
    private fallProgressMap: Map<Node, boolean> = new Map();
    
    /**
     * 路径最后一个水果方块映射：存储每个下落路径（出生点位）的最后一个水果方块节点
     * 键：出生点位的索引
     * 值：该路径上最后生成的水果方块节点
     */
    private pathLastGridMap: Map<number, Node> = new Map();
    
    /**
     * 水果方块高度：单个水果方块的高度，用于计算下落距离阈值
     */
    private gridHeight: number = Constant.Height + 1;

    /**
     * 生命周期方法：组件销毁时调用
     */
    onDestroy() {
        // 移除事件监听
        EventManager.off(EventName.Game.Pause, this.pauseFall, this);
        EventManager.off(EventName.Game.Resume, this.resumeFall, this);
        this.clearAllGrids();
    }

    protected onLoad(): void {
        // 监听暂停事件
        EventManager.on(EventName.Game.Pause, this.pauseFall, this);
        // 监听继续事件
        EventManager.on(EventName.Game.Resume, this.resumeFall, this);
    }
    /**
     * 加载水果方块预制体
     * 异步从resources目录加载水果方块预制体资源
     */
    async createGrid() {
        // 修复预制体路径，resources.load会自动从assets/resources目录开始查找
        this.gridDownPre = await LoaderManeger.instance.loadPrefab('prefab/pieces/gridDown');
    }
    
    /**
     * 开始生成水果方块
     */
    startGenerate() {
        if (this.isGenerating) {
            return;
        }

        this.isGenerating = true;
        this.generatedCount = 0;
        
        // 立即生成第一批
        this.generateBatch();
        
        // 启动路径可用性检查定时器（每0.1秒检查一次）
        if (!this.pathCheckIntervalId) {
            this.pathCheckIntervalId = this.schedule(this.checkAllPathsAvailability, 0.1);
        }
    }

    
    /**
     * 停止生成水果方块
     */
    stopGenerate() {
        this.isGenerating = false;
        this.unschedule(this.generateBatch);
        
        // 停止路径可用性检查定时器
        if (this.pathCheckIntervalId) {
            this.unschedule(this.pathCheckIntervalId);
            this.pathCheckIntervalId = null;
        }
    }

    /**
     * 生成一批水果方块（一排）
     */
    private generateBatch() {
        if (this.generatedCount >= this.totalGridCount) {
            this.stopGenerate();
            return;
        }

        // 计算本次生成的数量：一次生成一排（9个），不超过剩余数量
        const batchSize = Math.min(this.BirthPoint.children.length, this.totalGridCount - this.generatedCount);
        
        // 检查是否可以生成一排：所有路径都必须可用
        let canGenerateRow = true;
        for (let pathIndex = 0; pathIndex < this.BirthPoint.children.length; pathIndex++) {
            if (!this.isPathAvailable(pathIndex)) {
                canGenerateRow = false;
                break;
            }
        }
        
        // 如果所有路径都可用，生成一排水果方块
        if (canGenerateRow) {
            for (let pathIndex = 0; pathIndex < this.BirthPoint.children.length && this.generatedCount < this.totalGridCount; pathIndex++) {
                this.generateSingleGrid(pathIndex);
            }
        }
    }

    /**
     * 生成单个水果方块
     * @param pathIndex 出生点位索引
     */
    private generateSingleGrid(pathIndex: number) {
        if (!this.gridDownPre) {
            console.error("水果方块预制体未加载");
            return;
        }

        // 检查路径是否可用
        if (!this.isPathAvailable(pathIndex)) {
            console.log(`路径${pathIndex}不可用，跳过本次生成`);
            return;
        }

        // 获取指定路径的出生点位
        const selectedBirthPoint = this.BirthPoint.children[pathIndex];

        // 从对象池获取或创建新水果方块
        let gridNode: Node;
        if (this.gridPool.length > 0) {
            gridNode = this.gridPool.pop();
            gridNode.active = true;
        } else {
            gridNode = instantiate(this.gridDownPre);
            this.node.addChild(gridNode);
        //    console.log("创建新的水果方块节点", gridNode);
        }
        const randomType = Math.floor(Math.random() * 5); // GridType有6种类型（0-5）
        const gridComponent = gridNode.getComponent(gridDownCmpt);
        if (gridComponent) {
            gridComponent.initData(randomType as GridType);
        }
        // 设置生成位置：使用世界坐标
        const worldPosition = selectedBirthPoint.worldPosition;
        gridNode.worldPosition = worldPosition;
        //console.log("生成位置:", worldPosition, "路径索引:", pathIndex);

        // 开始下落
        this.startFall(gridNode);

        // 更新路径最后一个水果方块记录
        this.pathLastGridMap.set(pathIndex, gridNode);

        // 更新计数
        this.activeGrids.push(gridNode);
        this.generatedCount++;

       // console.log("当前活跃水果方块数量:", this.activeGrids.length, "已生成总数:", this.generatedCount);
    }
    
    /**
     * 检查路径是否可用
     * 如果路径上没有水果方块，或者最后一个水果方块已经下落到距离起始点大于等于一个水果方块高度的位置，则路径可用
     */
    private isPathAvailable(pathIndex: number): boolean {
        // 如果路径上没有水果方块，直接可用
        if (!this.pathLastGridMap.has(pathIndex)) {
            return true;
        }
        
        // 获取路径上的最后一个水果方块
        const lastGrid = this.pathLastGridMap.get(pathIndex);
        if (!lastGrid) {
            return true;
        }
        
        // 检查水果方块是否仍然活跃
        if (this.activeGrids.indexOf(lastGrid) === -1) {
            // 如果水果方块不在活跃列表中，说明已经被回收，路径可用
            this.pathLastGridMap.delete(pathIndex);
            return true;
        }
        
        // 获取出生点位的世界坐标
        const birthPoint = this.BirthPoint.children[pathIndex];
        const startY = birthPoint.worldPosition.y;
        
        // 计算当前下落距离（使用世界坐标）
        const currentY = lastGrid.worldPosition.y;
        const fallDistance = startY - currentY;
        
        // 检查下落距离是否大于等于一个水果方块高度
        const isAvailable = fallDistance >= this.gridHeight;
       // console.log(`路径${pathIndex}可用性检查: 下落距离=${fallDistance.toFixed(2)}, 水果方块高度=${this.gridHeight}, 可用=${isAvailable}`);
        
        return isAvailable;
    }
    
    /**
     * 检查所有路径是否都可用
     * 当所有路径都可用时，返回true，表示可以生成下一批
     */
    private areAllPathsAvailable(): boolean {
        // 如果没有BirthPoint或children，返回false
        if (!this.BirthPoint || this.BirthPoint.children.length === 0) {
            return false;
        }
        
        // 检查每个路径是否都可用
        for (let pathIndex = 0; pathIndex < this.BirthPoint.children.length; pathIndex++) {
            if (!this.isPathAvailable(pathIndex)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 定期检查路径可用性并生成水果方块
     * 当上一排下落距离达到一个GridDown高度时生成下一排
     */
    private checkAllPathsAvailability() {
        if (this.isGenerating && this.generatedCount < this.totalGridCount) {
            // 检查所有路径是否都可用
            if (this.areAllPathsAvailable()) {
                this.generateBatch();
            }
        }
    }

    /**
     * 开始下落
     */
    public startFall(gridNode: Node) {
        
        // 标记为正在下落
        this.fallProgressMap.set(gridNode, true);
    }

    /**
     * 每帧更新
     * 处理所有活跃水果方块的下落
     */
    update(deltaTime: number) {
        // 检查是否暂停或游戏已经失败
        if (this.isPaused) return;
        
        // 首先检查最靠近底部的水果（索引为0的元素），优化性能
        if (this.activeGrids.length > 0) {
            const lowestGrid = this.activeGrids[0];
            if (this.fallProgressMap.has(lowestGrid)) {
                const currentY = lowestGrid.position.y;
                if (currentY < 130) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // 遍历所有活跃的水果方块
        for (const gridNode of this.activeGrids) {
            // 检查是否在下落中
            if (this.fallProgressMap.has(gridNode)) {
                // 计算当前下落距离
                const currentPosition = gridNode.position;
                const newY = currentPosition.y - (this.fallSpeed * deltaTime);
                           
                // 更新位置
                gridNode.setPosition(v3(currentPosition.x, newY, 0));
                
            }
        }
    }

    /**
     * 游戏失败处理
     */
    private gameOver() {
        if (this.isPaused) return;
        this.isPaused = true;
        console.log("Game over: Fruit reached the bottom line!");
        // 发送游戏失败事件
        EventManager.emit(EventName.Game.GameOver);
    }

    /**
     * 暂停所有水果方块的下落
     */
    public pauseFall() {
        if (this.isPaused) return;
        
        this.isPaused = true;
    }

    /**
     * 继续所有水果方块的下落
     */
    public resumeFall() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
    }

    /**
     * 设置下落速度
     */
    public setFallSpeed(speed: number) {
        this.fallSpeed = speed;
    }

    /**
     * 获取当前活跃的水果方块数量
     */
    public getActiveGridCount(): number {
        return this.activeGrids.length;
    }

    /**
     * 回收水果方块到对象池
     */
    private recycleGrid(gridNode: Node) {
        // 从活跃列表中移除
        const index = this.activeGrids.indexOf(gridNode);
        if (index > -1) {
            this.activeGrids.splice(index, 1);
        }

        // 从锁定集合中移除
        this.lockedGrids.delete(gridNode);

        // 检查并移除路径最后一个水果方块记录
        for (const [pathIndex, lastGrid] of this.pathLastGridMap.entries()) {
            if (lastGrid === gridNode) {
                this.pathLastGridMap.delete(pathIndex);
                console.log(`路径${pathIndex}的最后一个水果方块已被回收，移除记录`);
                break;
            }
        }

        // 重置状态
        gridNode.active = false;
        gridNode.setPosition(v3(0, 0, 0));
        
        // 清空子节点或重置组件状态
        const gridComponent = gridNode.getComponent(gridCmpt);
        if (gridComponent) {
            // 重置水果方块组件状态
            gridComponent.reset();
        }
        
        // 移除下落进度信息
        this.fallProgressMap.delete(gridNode);
        
        // 添加到对象池
        this.gridPool.push(gridNode);
    }

    /**
     * 清空所有水果方块
     */
    public clearAllGrids() {
        // 停止生成
        this.stopGenerate();
        
        // 回收所有活跃水果方块
        for (const grid of this.activeGrids) {
            this.recycleGrid(grid);
        }
        this.activeGrids = [];
        
        // 清空对象池
        for (const grid of this.gridPool) {
            grid.destroy();
        }
        this.gridPool = [];
        
        // 清空下落进度信息
        this.fallProgressMap.clear();
        
        // 清空路径最后一个水果方块记录
        this.pathLastGridMap.clear();
        
        // 清空锁定的水果方块集合
        this.lockedGrids.clear();
        
        // 重置计数
        this.generatedCount = 0;
        
        // 重置暂停状态
        this.isPaused = false;
        
    }

    /**
     * 获取指定类型的最前面的水果方块节点
     * 最前面的定义：Y坐标最小（最靠近底部）的水果方块
     * @param type 水果方块类型
     * @returns 最前面的水果方块节点，未找到则返回null
     */
    public getFrontGridByType(type: number): Node | null {
        let frontGrid: Node | null = null;
        let minY: number = Number.MAX_VALUE;

        for (const gridNode of this.activeGrids) {
            // 跳过已锁定的水果方块
            if (this.lockedGrids.has(gridNode)) {
                continue;
            }

            const gridComponent = gridNode.getComponent(gridDownCmpt);
            if (!gridComponent) continue;

            if (gridComponent.type === type) {
                const currentY = gridNode.position.y;
                if (currentY < minY) {
                    minY = currentY;
                    frontGrid = gridNode;
                }
            }
        }

        // 如果找到合适的水果方块，将其锁定
        if (frontGrid) {
            this.lockedGrids.add(frontGrid);
        }

        return frontGrid;
    }

    /**
     * 回收指定的水果方块
     * @param gridNode 要回收的水果方块节点
     */
    public recycleGridByNode(gridNode: Node) {
        if (gridNode && this.activeGrids.indexOf(gridNode) !== -1) {
            this.recycleGrid(gridNode);
        }
    }

}