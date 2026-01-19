import { _decorator, Label, Node, tween, v3 } from 'cc';
        
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

@ccclass('resultViewCmpt')
export class ResultViewCmpt extends BaseDialog  {
    private isWin: boolean = false;
    private level: number = 0;
    private rewardBombs: {type: number, count: number}[] = [];

    goldnumlb: Node = null;
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
        
        let { level, isWin, rewardBombs } = this._data;
        this.level = level;
        this.rewardBombs = rewardBombs || [];
        this.isWin = isWin;
        
        if (isWin) {
            AudioManager.getInstance().playSound('win');
        } else {
            AudioManager.getInstance().playSound('lose');
        }
        
        this.viewList.get('animNode/win').active = isWin;
        this.viewList.get('animNode/lose').active = !isWin;
        this.goldnumlb = this.viewList.get('animNode/win/coin8/goldnumlb');
        if (isWin) {
            // LevelConfig.setLevelStar(lv, starCount);
            this.handleWin(this.rewardBombs);
        } else {
            this.handleLose();
        }
    }
    
    showgoldnum() {
        let goldnum = 100 * GameData.loadData(GameData.Level, 1);
        this.goldnumlb.getComponent(Label).string = goldnum.toString();
    }

    handleLose() {
        // 失败处理逻辑
    }

    onClick_guanbiBtn_End() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }
    
    onClick_SendReward_End() {
        AudioManager.getInstance().playSound('button_click');
        // 发送事件
        EventManager.emit(EventName.Game.SendReward);
        this.dismiss();
    }

    handleWin(rewardBombs: {type: number, count: number}[]) {
        let target = this.viewList.get('animNode/win/target');
        target.active=false;
        // target.children.forEach((item, idx) => {
        //     if (!rewardBombs) return;
        //     item.active = idx < rewardBombs.length;
        //     if (idx < rewardBombs.length) {
        //         item.getComponent(gridCmpt).setType(rewardBombs[idx].type);
        //         item.getComponent(gridCmpt).setCount(rewardBombs[idx].count);
        //     }
        // });
        this.showgoldnum();
    }

    /** 分享 */
    onClick_shareBtn() {
        AudioManager.getInstance().playSound('button_click');
        EventManager.emit(EventName.Game.Share, this.level);
    }

    /** 看视频继续游戏 */
    onClick_continueVideoBtn() {
        AudioManager.getInstance().playSound('button_click');
        
        // 检查渠道广告是否可用
        if (CM.mainCH && CM.mainCH.createVideoAd && CM.mainCH.showVideoAd) {
            // 创建视频广告实例
            if (!CM.mainCH.videoAd) {
                CM.mainCH.createVideoAd();
            }
            
            // 显示视频广告
            CM.mainCH.showVideoAd((isSuccess: boolean) => {
                if (isSuccess) {
                    // 视频观看成功，继续游戏
                    EventManager.emit(EventName.Game.ContinueGame);
                    this.dismiss();
                } else {
                    // 视频观看失败或中途退出
                    console.log('视频观看失败');
                }
            });
        } else {
            // 渠道广告不可用，直接继续游戏（作为兼容方案）
            console.log('广告不可用，直接继续游戏');
            EventManager.emit(EventName.Game.ContinueGame);
            this.dismiss();
        }
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
    onClick_RestartGameBtn() {
        AudioManager.getInstance().playSound('button_click');
        EventManager.emit(EventName.Game.RestartGame);
        this.dismiss();
    }
    
}