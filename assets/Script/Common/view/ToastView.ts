import PopupView from "./PopupView";


// 原始导入语句
// const {ccclass, property} = cc._decorator;

// 修改后的导入语句 - 使用新版本的Cocos API
import { _decorator, Label, Color, Node, tween, v3, UIOpacity, Vec3, Tween } from 'cc';
const {ccclass, property} = _decorator;

@ccclass
export default class ToastView extends PopupView {

    @property(Label)
    messageLabel: Label = null;

    private message: string;
    private _showTime = 1.5;//显示时长
    private _initialPos: Vec3 = null; // 记录初始位置

    onLoad() {
        super.onLoad();
        // 记录初始坐标，用于复用时重置
        this._initialPos = this.node.position.clone();
    }

    setMessage(message) {
        this.message = message || "提示";
        if (this.messageLabel) {
            this.messageLabel.string = this.message;
        }
    }

    setFontSize(fontSize: number = 0) {
        if (this.messageLabel && fontSize > 0) {
            this.messageLabel.fontSize = fontSize;
            this.messageLabel.lineHeight = fontSize;
        }
    }

    // 修改后的代码 - 使用新版本的Cocos API
    setTextColor(textColor: Color = null) {
        if (textColor && this.messageLabel) {
            this.messageLabel.color = textColor;
        }
    }

    setShowTime(time: number = null) {
        if(time) {
            this._showTime = time;
        }
    }

    // 修改后的代码 - 使用新版本的Cocos API
    show(parent: Node) {
        super.show(parent);
        this.unscheduleAllCallbacks();
        
        // 获取或添加 UIOpacity 组件用于控制透明度消失
        let uiOpacity = this.node.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = this.node.addComponent(UIOpacity);
        }
        
        // --- 核心修复：重置状态 ---
        // 1. 停止该节点和透明度组件上的所有正在运行的动画
        Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(uiOpacity);

        // 2. 恢复初始位置和透明度
        if (this._initialPos) {
            this.node.setPosition(this._initialPos);
        }
        uiOpacity.opacity = 255;

        // --- 重新开始动画逻辑 ---
        const currentPos = this.node.position;
        
        // tween(uiOpacity)
        //     .delay(this._showTime) // 停留时长
        //     .parallel(
        //         tween().to(0.8, { opacity: 0 }, { easing: 'sineOut' }), // 逐渐消失
        //         tween(this.node).to(0.8, { position: v3(currentPos.x, currentPos.y + 150, currentPos.z) }, { easing: 'sineOut' }) // 向上飘动
        //     )
        //     .call(() => {
        //         this.dismiss(); // 动画结束后调用 dismiss 销毁或回收
        //     })
        //     .start();
    }

    private delayDismiss() {
        this.dismiss();
    }
}
