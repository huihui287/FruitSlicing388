import { _decorator, Node, tween, v3, instantiate } from 'cc';
import { App } from '../Controller/app';
import { LevelConfig } from '../Tools/levelConfig';
import { gridCmpt } from '../game/item/gridCmpt';
import { EventName } from '../Tools/eventName';
import CM from '../channel/CM';
import ChannelDB from '../channel/ChannelDB';
import BaseDialog from '../Common/view/BaseDialog';
import AudioManager from '../Common/AudioManager';
import EventManager from '../Common/view/EventManager';
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
    }

    initbtn() {
        // 绑定按钮事件 - 为4个道具按钮绑定点击事件
        for (let i = 0; i < 5; i++) {
            this[`onClick_add${i}`] = this.onClickAddButton.bind(this);
        }
    }

    /** 购买攻击提升 */
    onClickAddButton(btnNode: Node) {
        AudioManager.getInstance().playSound('button_click');
        
        // 定义购买价格
        const buyPrice = 100;
        
        // 检查金币是否足够
        const currentGold = GameData.getGold();
        if (currentGold < buyPrice) {
            console.log("金币不足，无法购买");
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
            console.log("购买失败");
            return;
        }
        
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
                type = GridType.YELLOW_LEMON;
            case "add4":
                type = GridType.ORANGE;
                break;
        }
        
        // 提升攻击等级
        const gridTypeTemp = 'LVAttack' + type;
        const currentLevel = GameData.loadData(gridTypeTemp, 1);
        GameData.saveData(gridTypeTemp, currentLevel + 1);
        console.log(`购买成功，水果类型 ${type} 攻击提升到等级 ${currentLevel + 1}`);
        
        // 更新界面显示
        this.updateLbData();
    }

    /** 更新 lb 数据 */
    private updateLbData() {
        // 重新初始化数据以更新 lb 显示
        this.initData();
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