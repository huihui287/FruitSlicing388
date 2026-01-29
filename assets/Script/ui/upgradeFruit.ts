import { _decorator, Node, tween, v3, instantiate, Label } from 'cc';
import { gridCmpt } from '../game/item/gridCmpt';
import BaseDialog from '../Common/view/BaseDialog';
import AudioManager from '../Common/AudioManager';
import GameData from '../Common/GameData';
import { GridType } from '../Tools/enumConst';
import ViewManager from '../Common/view/ViewManager';
import LoaderManeger from '../sysloader/LoaderManeger';

const { ccclass, property } = _decorator;
@ccclass('upgradeFruit')
export class upgradeFruit extends BaseDialog {

    gridNodeS: Node = null;
    btns: Node = null;

    onLoad() {
        this.initbtn();
        super.onLoad();
        this.gridNodeS = this.viewList.get('win/target');
        this.btns = this.viewList.get('win/btns');
        this.initData();
        this.initLb();
    }

    initbtn() {
        // 绑定按钮事件 - 为4个道具按钮绑定点击事件
        for (let i = 0; i < 5; i++) {
            this[`onClick_add${i}`] = this.onClickAddButton.bind(this);
        }
    }

    initLb() {
        // 初始化攻击等级 lb
           for (let i = 0; i < 5; i++) {
            // 显示下一级所需金币
            const btnName = `add${i}`;
            const btnNode = this.btns.getChildByName(btnName);
            if (btnNode) {
                this.showLastAttackLevelSpendSuccessLb(btnNode);
            }
        }
    }
    /** 购买攻击提升 */
    onClickAddButton(btnNode: Node) {
        AudioManager.getInstance().playSound('button_click');
        
        // 确定水果类型
        let type: number = -1;
        switch (btnNode.name) {
            case "add0":
                type = GridType.STRAWBERRY;
                break;
            case "add1":
                type = GridType.GREEN_LEMON;
                break;
            case "add2":
                type = GridType.BLUEBERRY;
                break;
            case "add3":
                type = GridType.CHERRY;
                break;
            case "add4":
                type = GridType.ORANGE;
                break;
        }
        
        // 获取当前攻击等级
        const gridTypeTemp = 'LVAttack' + type;
        const currentLevel = GameData.loadData(gridTypeTemp, 1);
        
        // 根据等级计算购买价格（等级 * 基数）
        const basePrice = 100;
        const buyPrice = currentLevel * basePrice;
        
        // 检查金币是否足够
        const currentGold = GameData.getGold();
        if (currentGold < buyPrice) {
            ViewManager.toast(`金币不足，需要 ${buyPrice} 金币`);
            // 弹出购买金币界面
            LoaderManeger.instance.loadPrefab('prefab/ui/getGold').then((prefab) => {
                let getGoldNode = instantiate(prefab);
                ViewManager.show({
                    node: getGoldNode,
                    name: "GetGold"
                });
            });
            return;
        }
        
        // 花费金币
        const spendSuccess = GameData.spendGold(buyPrice);
        if (!spendSuccess) {
            ViewManager.toast("购买失败");
            return;
        }
        
        // 提升攻击等级
        GameData.saveData(gridTypeTemp, currentLevel + 1);
        ViewManager.toast(`购买成功，攻击提升到等级 ${currentLevel + 1}，花费 ${buyPrice} 金币`);
        
        // 更新界面显示
        this.updateLbData();
    }

    //显示下一个等级 所需要的花费金币
    showLastAttackLevelSpendSuccessLb(btnNode: Node) {
        // 确定水果类型
        let type: number = -1;
        switch (btnNode.name) {
            case "add0":
                type = GridType.STRAWBERRY;
                break;
            case "add1":
                type = GridType.GREEN_LEMON;
                break;
            case "add2":
                type = GridType.BLUEBERRY;
                break;
            case "add3":
                type = GridType.CHERRY;
                break;
            case "add4":
                type = GridType.ORANGE;
                break;
        }
        
        // 获取当前攻击等级
        const gridTypeTemp = 'LVAttack' + type;
        const currentLevel = GameData.loadData(gridTypeTemp, 1);
        
        // 计算下一个等级需要的金币数量
        const basePrice = 100;
        const nextLevelPrice = currentLevel * basePrice;
        
        // 更新显示
        let lb = btnNode.getChildByName('fnt').getComponent(Label);
        if (lb) {
            lb.string = `${nextLevelPrice}`;
        }
    }
    /** 更新 lb 数据 */
    private updateLbData() {
        // 重新初始化数据以更新 lb 显示
        this.initData();
        
        // 更新按钮上显示的下一级所需金币数量
        for (let i = 0; i < 5; i++) {
            const btnName = `add${i}`;
            const btnNode = this.btns.getChildByName(btnName);
            if (btnNode) {
                this.showLastAttackLevelSpendSuccessLb(btnNode);
            }
        }
    }

    protected initData(): void {
        // 获取所有 GridType 的数值枚举值
        const gridTypeValues = Object.values(GridType).filter(value => typeof value === 'number') as number[];

        this.gridNodeS.children.forEach((item, idx) => {
            // 检查索引是否越界
            if (idx >= gridTypeValues.length) {
                console.warn(`GridType index out of bounds: ${idx}`);
                return;
            }

            // 获取对应索引的数值枚举值
            const gridTypeValue = gridTypeValues[idx];

            // 修正变量名拼写，使用数值枚举值
            let gridTypeTemp = 'LVAttack' + gridTypeValue;
            let LVAttack = "攻击等级" + ":X" + GameData.loadData(gridTypeTemp, 1);

            // 获取并检查 gridCmpt 组件
            let gridComponent = item.getComponent(gridCmpt);
            if (gridComponent) {
                gridComponent.setType(gridTypeValue);
                gridComponent.setCount(LVAttack);
            } else {
                console.warn(`Item at index ${idx} missing gridCmpt component`);
            }
        });
    }

    onClick_guanbiBtn_End() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }

    onClick_SendReward_End() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }

    onClick_guanbiBtn() {

        // App.backHome(true);
        this.dismiss();
    }

}
