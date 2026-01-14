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

@ccclass('getGold')
export class getGold extends BaseDialog {
    onLoad() {
        super.onLoad();
    }

    onClick_guanbiBtn_End() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }

    onClick_SendReward_End() {
        AudioManager.getInstance().playSound('button_click');

        this.dismiss();
    }
    /** 分享 */
    onClick_shareBtn() {
        AudioManager.getInstance().playSound('button_click');

        // 检查渠道分享是否可用
        if (CM.mainCH && CM.mainCH.share) {
            CM.mainCH.share((isSuccess: boolean) => {
                if (isSuccess) {
                    // 分享成功，给予金币奖励
                    const goldReward = 100; // 可以根据实际需求调整奖励数量
                    GameData.addGold(goldReward);
                    console.log(`分享成功，获得 ${goldReward} 金币`);
                    // 可以在这里添加获得金币的动画或提示
                    this.dismiss();
                }
            });
        } else {
            console.error("分享功能不可用");
        }
    }

    /** 看视频获得金币 */
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
                    // 视频观看成功，给予金币奖励
                    const goldReward = 200; // 可以根据实际需求调整奖励数量
                    GameData.addGold(goldReward);
                    console.log(`视频观看成功，获得 ${goldReward} 金币`);
                    // 可以在这里添加获得金币的动画或提示
                    this.dismiss();
                } else {
                    // 视频观看失败或中途退出
                    console.log('视频观看失败');
                }
            });
        } else {
            // 渠道广告不可用，直接给予金币（作为兼容方案）
            console.log('广告不可用，直接获得金币');
            const goldReward = 100;
            const currentGold = GameData.loadData('gold', 0);
            GameData.saveData('gold', currentGold + goldReward);
            this.dismiss();
        }
    }

    onClick_guanbiBtn() {

        this.dismiss();
    }
    onClick_close() {
        AudioManager.getInstance().playSound('button_click');
        this.dismiss();
    }

}