import { _decorator, Node, tween, v3 } from 'cc';

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
const { ccclass, property } = _decorator;

@ccclass('settingGameView')
export class settingGameView extends BaseDialog {

    btnSoundON: Node = null;
    btnSoundOFF: Node = null;
    btnMusicON: Node = null;
    btnMusicOFF: Node = null;

    onLoad() {
        super.onLoad();
        this.btnSoundON = this.viewList.get('animNode/content/btnSound/on');
        this.btnSoundOFF = this.viewList.get('animNode/content/btnSound/off');
        this.btnMusicON = this.viewList.get('animNode/content/btnMusic/on');
        this.btnMusicOFF = this.viewList.get('animNode/content/btnMusic/off');
        // 初始化音效和音乐状态
        this.setSoundStatus(GameData.loadData(GameData.SoundOn, true));
        this.setMusicStatus(GameData.loadData(GameData.MusicOn, true));
    }

    onClick_btnSound() {
        AudioManager.getInstance().playSound('button_click');
        const isOn = !GameData.loadData(GameData.SoundOn, true);
        GameData.saveData(GameData.SoundOn, isOn);
        this.setSoundStatus(isOn);
    }
    onClick_btnMusic() {
        AudioManager.getInstance().playSound('button_click');
        const isOn = !GameData.loadData(GameData.MusicOn, true);
        GameData.saveData(GameData.MusicOn, isOn);
        this.setMusicStatus(isOn);
    }

    setSoundStatus(isOn: boolean) {
        this.btnSoundON.active = isOn;
        this.btnSoundOFF.active = !isOn;
    }

    setMusicStatus(isOn: boolean) {
        this.btnMusicON.active = isOn;
        this.btnMusicOFF.active = !isOn;
    }

    onClick_closeBtn() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }
    onClick_homeBtn() {
        AudioManager.getInstance().playSound('button_click');
        App.backStart();
    }

    onClick_ProceedBtn() {
        AudioManager.getInstance().playSound('button_click');
        App.gameCtr.setPause(false);
        this.dismiss();
    }

}
