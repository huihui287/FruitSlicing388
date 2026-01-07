/**
 * 基础弹窗
 */
import PopupView from "./PopupView";
import ViewManager from "./ViewManager";
// 原始导入语句
// import GameCtr from "../../Controller/GameCtr";
// import AudioManager from "../AudioManager";
// import AudioConfig from "./AudioConfig";
// import GameData from "../GameData";
// import EventManager from "./EventManager";

// 修改后的导入语句 - 添加了WXCtr导入
//import WXCtr from "../../Controller/WXCtr";
import AudioManager from "../AudioManager";
import AudioConfig from "./AudioConfig";
import GameData from "../GameData";
import EventManager from "./EventManager";

// 原始导入语句
// import { _decorator, Component, Node } from 'cc';
// const { ccclass, property } = _decorator;

// 修改后的导入语句 - 添加了必要的类型
import { _decorator, Component, Node, Button, isValid, Event, EventHandler } from 'cc';
import { GameCtr } from "../../Controller/GameCtr";
const { ccclass, property } = _decorator;

@ccclass("BaseDialog")
export default class BaseDialog extends Component {

    protected static readonly ButtonTag = {
        SURE: "button_sure",
        CANCEL: "button_cancel",
        CLOSE: "button_close",
        POS:"pos",
        ZI:"zi",
        video:"vi",
    }

    // 修改后的类型声明
    protected _sureButton: Button;
    protected _cancelButton: Button;
    private _closeButton: Button;
    protected _data: any;//传入数据

    public pos: Node=null;
    public NextUI: BaseDialog;
    public isHall=false;
    ziPos=null;
    showBanner() {

        // if (this.pos!=null) {
        //     WXCtr.showBannerAdZC();   
        // }
        // WXCtr.CreatInterstitialAd();

    }

    onLoad() {
        // 修改后的getComponent调用
        let node = ViewManager.findChildByName(BaseDialog.ButtonTag.SURE, this.node);
        if (node) {
            this._sureButton = node.getComponent(Button);
        }
        node = ViewManager.findChildByName(BaseDialog.ButtonTag.CANCEL, this.node);
        if (node) {
            this._cancelButton = node.getComponent(Button);
        }
        node = ViewManager.findChildByName(BaseDialog.ButtonTag.CLOSE, this.node);
        if (node) {
            this._closeButton = node.getComponent(Button);
        }

        this.initButton(this._sureButton, BaseDialog.ButtonTag.SURE);
        this.initButton(this._cancelButton, BaseDialog.ButtonTag.CANCEL);
        this.initButton(this._closeButton, BaseDialog.ButtonTag.CLOSE);

        this.initData();

        this.pos = ViewManager.findChildByName(BaseDialog.ButtonTag.POS, this.node);
        this.showBanner();

        // 修改后的图集显示逻辑 - 调用提取的方法
        this._updateShareUI();

        EventManager.on("QHUAN", this.QHUAN, this);
    }

    // 修改后的QHUAN方法 - 调用提取的方法
    QHUAN()
    {
        this._updateShareUI();
    }

    // 提取的图集显示逻辑方法
    private _updateShareUI() {
        let video = ViewManager.findChildByName(BaseDialog.ButtonTag.video, this.node);
        let zi = ViewManager.findChildByName(BaseDialog.ButtonTag.ZI, this.node); 
        
        if (zi != null) {
            this.ziPos = zi.getPosition();
        }
        
        // if (GameCtr.AppConfg.share == "1" && GameCtr.isip == 0) {
        //     if (GameData.shareNUm >= 6) {
        //         if (zi != null) {
        //             zi.active = true;
        //             zi.setPosition(this.ziPos);
        //         }
        //         if (video != null) {
        //             video.active = true;
        //         }
        //     } else {
        //         if (zi != null) {
        //             zi.active = true;
        //             zi.setPosition(0, 0);
        //         }
        //         if (video != null) {
        //             video.active = false;
        //         }
        //     }
        // } else {
        //     if (zi != null) {
        //         zi.active = true;
        //     }
        //     if (video != null) {
        //         video.active = true;
        //     }
        // }
    }

    protected initData() {

    }

    
    // 原始setData方法
    // setData(data) {
    //     this._data = data;
    // }

    // 修改后的setData方法 - 添加了类型注释
    setData(data: any) {
        this._data = data;
    }

    // 原始dismiss方法
    // dismiss() {
    //     if (!this.node.parent) {
    //         return;
    //     }
    //     if (this.NextUI != null) {
    //       //  this.NextUI.showBanner();
    //     } else if (this.isHall == true) {
    //      //   GameCtr.ins.mHall.showBanner();
    //     }
    //     else {
    //         WXCtr.hideBannerAdZC();
    //     }
    //     let PopupView = this.node.parent.getComponent("PopupView");
    //     if (!!PopupView) {
    //         PopupView.dismiss();
    //     } else {
    //        
    //         this.node.destroy();
    //     }
    //     EventManager.off("QHUAN", this.QHUAN, this);
    // }

    // 修改后的dismiss方法 - 使用类型安全的PopupView获取方式
    dismiss() {
        if (!this.node.parent) {
            return;
        }
        if (this.NextUI != null) {
            // this.NextUI.showBanner();
        } else if (this.isHall == true) {
            // GameCtr.ins.mHall.showBanner();
        }
        else {
         //   WXCtr.hideBannerAdZC();
        }
        // 使用类型安全的方法获取PopupView组件
        let popupView = this.node.parent.getComponent(PopupView);
        if (!!popupView) {
            popupView.dismiss();
        } else {
            this.node.destroy();
        }
        EventManager.off("QHUAN", this.QHUAN, this);
    }

    // 修改后的onButtonClick方法 - 添加了类型注释
    protected onButtonClick(event: Event, customData: string) {
        switch (customData) {
            case BaseDialog.ButtonTag.SURE:
                break;
            case BaseDialog.ButtonTag.CANCEL:
                this.dismiss();
                break;
            case BaseDialog.ButtonTag.CLOSE:
                AudioManager.getInstance().playSound(AudioConfig.common_click);
                this.dismiss();
                break;
            default:
                break;
        }
    }

    // 修改后的initButton方法
    private initButton(button: Button, tag: string) {
        if (!isValid(button)) {
            return;
        }
        let clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;//这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "BaseDialog";//这个是代码文件名
        clickEventHandler.handler = "onButtonClick";
        clickEventHandler.customEventData = tag;
        button.clickEvents.push(clickEventHandler);
    }

}
