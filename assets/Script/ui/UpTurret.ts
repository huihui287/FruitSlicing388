import { _decorator, Label, Node, tween, v3, instantiate } from 'cc';

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
import ViewManager from '../Common/view/ViewManager';
import LoaderManeger from '../sysloader/LoaderManeger';
const { ccclass, property } = _decorator;

@ccclass('getGold')
export class getGold extends BaseDialog {
    Label001: Node = null;
maxCapacity=50;
    description: Node = null;
    onLoad() {
        super.onLoad();
        this.Label001= this.viewList.get('bg/Label001');
        this.description = this.viewList.get('bg/description');
        this.upTurretLevel();
    }

    upTurretLevel() {
        let turretLevel = GameData.loadData(GameData.TurretLevel, 1);
        this.Label001.getComponent(Label).string = '当前炮塔等级：' + turretLevel;
        this.description.getComponent(Label).string = '下一级可以炮塔容量可以增加'+this.maxCapacity*turretLevel;
    }
    onClick_upBtn() {
        AudioManager.getInstance().playSound('button_click');
        
        if (GameData.spendGold(100)) {
            // 升级炮塔
            this.setupTurretLevel();
            
            // 提示成功
            ViewManager.toast("升级成功");
        } else {
            // 金币不足
            ViewManager.toast("金币不足");
            LoaderManeger.instance.loadPrefab('prefab/ui/getGold').then((prefab) => {
                let getGold = instantiate(prefab);
                ViewManager.show({
                    node: getGold,
                    name: "GetGold"
                });
            });
        }
    }
    
    setupTurretLevel() {
        let turretLevel = GameData.loadData(GameData.TurretLevel, 1);
        turretLevel++;
        GameData.saveData(GameData.TurretLevel, turretLevel);

        this.upTurretLevel();
    }

    onClick_closeBtn() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }
}
