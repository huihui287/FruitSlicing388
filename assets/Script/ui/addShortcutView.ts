import { _decorator, Component, Node } from 'cc';
import BaseDialog from '../Common/view/BaseDialog';
import AudioManager from '../Common/AudioManager';
import CM from '../channel/CM';
import GameData from '../Common/GameData';
import ViewManager from '../Common/view/ViewManager';
const { ccclass, property } = _decorator;

@ccclass('addShortcutView')
export class addShortcutView extends BaseDialog {

    start() {

    }

    update(deltaTime: number) {

    }

    onLoad() {
        super.onLoad();
    }

    onClick_addShortBtn() {
        AudioManager.getInstance().playSound('button_click');
        let self = this;
        let call = (resp: any) => {
            if (resp) {
                const goldReward = 200; // 可以根据实际需求调整奖励数量
                GameData.addGold(goldReward);
                ViewManager.toast(`添加成功，获得 ${goldReward} 金币`);
                self.dismiss();
            } else {

            }
        }
        CM.mainCH.addShortcut(call, null);
    }

    onClick_guanbiBtn() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }

}


