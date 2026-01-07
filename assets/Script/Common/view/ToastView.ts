import PopupView from "./PopupView";


// 原始导入语句
// const {ccclass, property} = cc._decorator;

// 修改后的导入语句 - 使用新版本的Cocos API
import { _decorator, Label, Color, Node } from 'cc';
const {ccclass, property} = _decorator;

@ccclass
export default class ToastView extends PopupView {

    // 原始代码
    // @property(cc.Label)
    // messageLabel: cc.Label = null;
    
    // 修改后的代码 - 使用新版本的Cocos API
    @property(Label)
    messageLabel: Label = null;

    private message: string;
    private _showTime = 1.5;//显示时长

    onLoad() {
        super.onLoad();
    }

    setMessage(message) {
        this.message = message || "提示";
        this.messageLabel.string = message;
    }

    setFontSize(fontSize: number = 0) {
        if (fontSize > 0) {
            this.messageLabel.fontSize = fontSize;
            this.messageLabel.lineHeight = fontSize;
        }
    }

    // 原始代码
    // setTextColor(textColor: cc.Color = null) {
    //     if (textColor) {
    //         this.messageLabel.node.color = textColor;
    //     }
    // }
    
    // 修改后的代码 - 使用新版本的Cocos API
    setTextColor(textColor: Color = null) {
        if (textColor) {
            (this.messageLabel.node as any).color = textColor;
        }
    }

    setShowTime(time: number = null) {
        if(time) {
            this._showTime = time;
        }
    }

    // 原始代码
    // show(parent: cc.Node) {
    //     super.show(parent);
    //     this.unscheduleAllCallbacks();
    //     this.schedule(this.delayDismiss.bind(this), this._showTime);
    // }
    
    // 修改后的代码 - 使用新版本的Cocos API
    show(parent: Node) {
        super.show(parent);
        this.unscheduleAllCallbacks();
        this.schedule(this.delayDismiss.bind(this), this._showTime);
    }

    private delayDismiss() {
        this.dismiss();
    }
}
