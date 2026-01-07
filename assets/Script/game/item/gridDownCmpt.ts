import { _decorator, Component, Node, Vec3, UITransform, Label } from 'cc';
import { App } from '../../Controller/app';
import { ToolsHelper } from '../../Tools/toolsHelper';
import { GridType } from '../../Tools/enumConst';

const { ccclass, property } = _decorator;

@ccclass('gridDownCmpt')
export class gridDownCmpt extends Component {

    /** 水果方块类型：用于标识不同种类的水果方块 */
    public type: GridType = GridType.STRAWBERRY;
    /**
     * 初始化水果方块数据
     * @param type 水果方块类型
     */
    public initData(type: GridType = GridType.STRAWBERRY): void {
        this.type = type;
        
        this._showIconByType(this.type);
    }
    
    /**
     * 组件禁用时调用
     */
    onDisable(): void {
        this.type = GridType.STRAWBERRY;
    }

    /**
     * 显示位置信息（预留方法）
     */
    showPos(): void {
        // 预留方法，用于调试或显示位置信息
    }

    /**
     * 判断位置是否在水果方块内
     * @param pos 位置坐标
     * @returns 是否在水果方块内
     */
    isInside(pos: Vec3): boolean {
        const transform = this.node.getComponent(UITransform);
        if (!transform) return false;
        
        const width = transform.width;
        const curPos = this.node.position;
        
        return Math.abs(pos.x - curPos.x) <= width / 2 && Math.abs(pos.y - curPos.y) <= width / 2;
    }

    /**
     * 设置选中状态
     * @param bool 是否选中
     */
    setSelected(bool: boolean): void {
        if (!this.isValid) return;
        
        const iconNode = this.node.getChildByName('icon');
        if (iconNode) {
            iconNode.children.forEach(item => {
                if (item.active) {
                    const selectedNode = item.getChildByName('s');
                    if (selectedNode) {
                        selectedNode.active = bool;
                        selectedNode.scale = bool ? new Vec3(1.08, 1.08, 1) : new Vec3(1.0, 1.0, 1);
                    }
                }
            });
        }
    }

    /**
     * 获取移动状态
     * @returns 移动状态，当前始终返回false
     */
    getMoveState(): boolean {
        return false;
    }

    /**
     * 设置水果方块类型
     * @param type 水果方块类型
     */
    setType(type: GridType): void {
        if (!this.isValid) return;
        
        this.type = type;
        this._showIconByType(type);
    }

    /**
     * 显示提示
     */
    async showTips(): Promise<void> {
        const selectedNode = this.node.getChildByName("selected");
        if (selectedNode) {
            selectedNode.active = true;
            await ToolsHelper.delayTime(2);
            if (this.isValid) {
                selectedNode.active = false;
            }
        }
    }

    /**
     * 重置水果方块状态
     */
    public reset(): void {
        this.type = GridType.STRAWBERRY;
        
        // 隐藏所有图标
        const iconNode = this.node.getChildByName('icon');
        if (iconNode) {
            iconNode.children.forEach(item => {
                item.active = false;
            });
        }
        
        // 隐藏标签和勾
        const uiElements = ['lb', 'ok', 'gou', 'selected'];
        uiElements.forEach(name => {
            const node = this.node.getChildByName(name);
            if (node) {
                node.active = false;
            }
        });
        
        // 重置选中状态
        this.setSelected(false);
    }

    /**
     * 根据类型显示对应的图标
     * @param type 水果方块类型
     */
    private _showIconByType(type: GridType): void {
        const iconNode = this.node.getChildByName('icon');
        if (!iconNode) return;
        
        iconNode.children.forEach(item => {
            item.active = false;
            if (item.name === `Match${type}` || item.name === `${type}`) {
                item.active = true;
            }
        });
    }
}