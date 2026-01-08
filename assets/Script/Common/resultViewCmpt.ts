import { _decorator, Node, tween, v3 } from 'cc';
import BaseDialog from './view/BaseDialog';
import { App } from '../Controller/app';
import { LevelConfig } from '../Tools/levelConfig';
import { gridCmpt } from '../game/item/gridCmpt';
import EventManager from './view/EventManager';
import GameData from './GameData';
import AudioManager from './AudioManager';
import { EventName } from '../Tools/eventName';
const { ccclass, property } = _decorator;

@ccclass('resultViewCmpt')
export class ResultViewCmpt extends BaseDialog  {
    private isWin: boolean = false;
    private level: number = 0;
    private starCount: number = 0;
    private AchievetheGoal: any[] = [];

    onLoad() {
        super.onLoad();
      
        // 处理数据
        if (this._data) {
            this.handleData();
        }
    }

    setData(data: any) {
        super.setData(data);
        
        // 如果 viewList 已经初始化，立即处理数据
        if (this.viewList.size > 0) {
            this.handleData();
        }
    }

    private handleData() {
        if (!this._data) return;
        
        let { level, isWin, AchievetheGoal, starCount } = this._data;
        this.level = level;
        this.starCount = starCount;
        this.AchievetheGoal = AchievetheGoal;
        this.isWin = isWin;
        
        if (isWin) {
            AudioManager.getInstance().playSound('win');
        } else {
            AudioManager.getInstance().playSound('lose');
        }
        
        this.viewList.get('animNode/win').active = isWin;
        this.viewList.get('animNode/lose').active = !isWin;
        
        if (isWin) {
            // LevelConfig.setLevelStar(lv, starCount);
            this.handleWin(AchievetheGoal);
        } else {
            this.handleLose();
        }
    }

    // async loadExtraData(lv: number, isWin: boolean, AchievetheGoal: any[] = [], starCount: number = 0) {
    //     if (isWin) {
    //         AudioManager.getInstance().playSound('win');
    //     }
    //     else {
    //         AudioManager.getInstance().playSound('lose');
    //     }
    //     this.level = lv;
    //     this.starCount = starCount;
    //     this.AchievetheGoal = AchievetheGoal;
    //     this.isWin = isWin;
    //     this.viewList.get('animNode/win').active = isWin;
    //     this.viewList.get('animNode/lose').active = !isWin;
    //     if (isWin) {
    //         // LevelConfig.setLevelStar(lv, starCount);
    //         this.handleWin(AchievetheGoal);
    //     }
    //     else {
    //         this.handleLose();
    //     }
    // }

    handleLose() {
        // 失败处理逻辑
    }

    handleWin(coutArr: any[]) {
        let target = this.viewList.get('animNode/win/target');
        target.children.forEach((item, idx) => {
            if (!coutArr) return;
            item.active = idx < coutArr.length;
            if (idx < coutArr.length) {
                item.getComponent(gridCmpt).setType(coutArr[idx][0]);
                let count = coutArr[idx][1]
                if (count == 0) {
                    item.getComponent(gridCmpt).showGou(true);
                }
                else {
                    item.getComponent(gridCmpt).setCount(count);
                }
            }
        });

    }


    /** 下一关 */
    onClick_nextBtn() {
        AudioManager.getInstance().playSound('button_click');
        // GlobalFuncHelper.setGold(App.gameLogic.rewardGold);
        if (this.level == LevelConfig.getCurLevel()) {
            LevelConfig.nextLevel();
        }
        // App.view.closeView(ViewName.Single.eGameView);
        // App.view.openView(ViewName.Single.eHomeView, true);
        this.dismiss();
    }
    /** 分享 */
    onClick_shareBtn() {
        AudioManager.getInstance().playSound('button_click');
        // Advertise.showVideoAds();
        EventManager.emit(EventName.Game.Share, this.level);
    }

    /** 购买次数继续游戏 */
    onClick_continueBtn() {
        AudioManager.getInstance().playSound('button_click');
        // let count = +GlobalFuncHelper.getGold();
        // if (count < 200) {
        //     let lv = LevelConfig.getCurLevel();
        //     App.event.emit(EventName.Game.Share, lv);
        //     App.view.showMsgTips("金币不足")
        //     Advertise.showVideoAds();
        //     return;
        // }
        // GlobalFuncHelper.setGold(-200);
        // App.event.emit(EventName.Game.UpdataGold);
        EventManager.emit(EventName.Game.ContinueGame);
        // App.view.showMsgTips("步骤数 +5")
        this.dismiss();
    }

    onClick_guanbiBtn() {
        if (this.isWin) {
            if (this.level == LevelConfig.getCurLevel()) {
                LevelConfig.nextLevel();
            }
        }
        // App.backHome(true);
        this.dismiss();
    }
}