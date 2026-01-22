import { _decorator, Component, Node, Vec3, UITransform, Label } from 'cc';
import { App } from '../../Controller/app';
import { ToolsHelper } from '../../Tools/toolsHelper';
import { GridType } from '../../Tools/enumConst';
import EventManager from '../../Common/view/EventManager';
import { EventName } from '../../Tools/eventName';
import { LevelConfig } from '../../Tools/levelConfig';

const { ccclass, property } = _decorator;

@ccclass('gridDownCmpt')
export class gridDownCmpt extends Component {

    /** 水果方块类型：用于标识不同种类的水果方块 */
    public type: GridType = GridType.STRAWBERRY;

    /** 血量：用于标识水果方块的生命值 */
    public health: number = 1;
    /** 虚拟血量：用于被选中时扣除 */
    public virtualHealth: number = 5;

    private healthBl: Label = null;

    private ArmorPlating: Node = null;
    /**
     * 增加血量
     * @param amount 增加的血量值
     */
    public addHealth(amount: number): void {
        this.health += amount;
        this.updateHealthDisplay();
    }

    showDamageAm() {

    }
    /**
     * 受到伤害
     * @param damage 受到的伤害值
     * @returns 是否可以被回收（血量小于等于0）
     */
    public takeDamage(damage: number,callback:()=>void) {
        this.health -= damage;
        this.updateHealthDisplay();
        if (this.health <= 0) {
            callback();
        }
   
    }
    
    /**
     * 组件加载时调用
     */
    onLoad(): void {
        // 初始化healthBl引用
        this.healthBl = this.node.getChildByName('healthBl')?.getComponent(Label);
        this.ArmorPlating = this.node.getChildByName('ArmorPlating');
    }

    /**
     * 根据当前等级设置血量
     * @param level 等级
     * @param baseHealth 基础血量
     * @param levelCoefficient 等级系数
     * @returns 计算后的血量（整数）
     */
    public setHealthByLevel(level: number = LevelConfig.getCurLevel(), baseHealth: number = 1, levelCoefficient: number = 0.5): void {
        // 计算血量：基础血量 + (等级-1) * 系数，结果取整
        const calculatedHealth = Math.round(baseHealth + ((level-1) * levelCoefficient));
        // 确保血量至少为基础血量
        const maxHealth = Math.max(baseHealth, calculatedHealth);
        // 在 baseHealth 和 maxHealth 之间取随机整数
        const finalHealth = Math.floor(Math.random() * (maxHealth - baseHealth + 1)) + baseHealth;
        
        this.setHealth(finalHealth);
        this.virtualHealth = finalHealth;

      //    this.setHealth(1);
    }

    /**
     * 初始化水果方块数据
     * @param type 水果方块类型
     */
    public initData(type: GridType = GridType.STRAWBERRY): void {
        this.type = type;
        // 根据当前等级设置血量
        this.setHealthByLevel();
        this.virtualHealth = this.health;
        
        this._showIconByType(this.type);
        // 初始化血量显示
        this.updateHealthDisplay();
    }
    
    /**
     * 组件禁用时调用
     */
    onDisable(): void {
        this.type = GridType.STRAWBERRY;

        // 清除所有定时器，避免内存泄漏
        this.unscheduleAllCallbacks();
    }
    
    setHealth(health: number) {
        this.health = health;
        this.updateHealthDisplay();
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
     * 更新血量显示
     */
    private updateHealthDisplay(): void {
        if (this.healthBl) {
            // 2026-01-22: 用户需求，同时显示血量数值
            this.healthBl.node.active = false;
        }

        if (this.ArmorPlating) {
            let children = this.ArmorPlating.children;
            
            // 2026-01-22: 按照用户需求优化护甲显示逻辑
            // 模式变更：互斥显示模式（Single Image Per Stage）
            // 每一个阶段只有一个UI图片显示，不同阶段显示不同的图片
            // 例如：剩余护甲越多，显示越“高级”或“完整”的图片（通常是索引较大的图片）
            // 护甲减少时，切换到索引较小的图片
            
            let totalPlates = children.length;
            
            // 修正：如果当前血量大于记录的虚拟血量，说明虚拟血量数据过期或未同步
            // 必须更新 this.virtualHealth 以“记住”这个新的最大值，
            // 否则在掉血过程中，分母会随着分子一起减小，导致比例永远为 1
            if (this.health > this.virtualHealth) {
                this.virtualHealth = this.health;
            }

            // 计算最大护甲值 (例如9血 -> 8护甲)
            let maxArmor = Math.max(1, this.virtualHealth - 1); 
            // 计算当前护甲值 (例如当前5血 -> 4护甲)
            let currentArmor = Math.max(0, this.health - 1);
            
            // 特殊处理：如果总护甲量(maxArmor)小于护甲片数量(totalPlates)
            // 说明血量很低(例如2血只有1护甲)，此时无法支撑显示所有护甲片
            // 规则：最大只能显示 maxArmor 个护甲片
            let limitPlates = Math.min(totalPlates, maxArmor);

            let ratio = currentArmor / maxArmor;
            
            // 根据比例计算显示等级 (1 ~ totalPlates)
            // 示例 (totalPlates=3):
            // ratio > 0.66 -> level 3 (显示children[2])
            // 0.33 < ratio <= 0.66 -> level 2 (显示children[1])
            // 0 < ratio <= 0.33 -> level 1 (显示children[0])
            // ratio <= 0 -> level 0 (都不显示)
            let displayLevel = Math.ceil(ratio * totalPlates);
            
            // 应用限制：不能超过实际拥有的护甲点数
            if (displayLevel > limitPlates) {
                displayLevel = limitPlates;
            }
            
            // 互斥显示逻辑：只显示对应等级的那一张图片
            // 数组索引 = displayLevel - 1
            // 例如 displayLevel=1 -> 显示 children[0]
            //      displayLevel=2 -> 显示 children[1]
            for (let i = 0; i < children.length; i++) {
                if (displayLevel > 0 && i === (displayLevel - 1)) {
                    children[i].active = true;
                } else {
                    children[i].active = false;
                }
            }
        }
    }

    /**
     * 重置水果方块状态
     */
    public reset(): void {
        this.type = GridType.STRAWBERRY;
        this.setHealth(1);
        this.virtualHealth = this.health;

        // 清除所有定时器，避免内存泄漏
        this.unscheduleAllCallbacks();
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
