/**
 * 弹窗管理
 */


// 原始导入语句
// import PromptDialog from "./PromptDialog";
// import ToastView from "./ToastView";
// import AudioManager from "../AudioManager";
// import PopupView from "./PopupView";



// 修改后的导入语句 - 添加了所有必要的Cocos API导入和类型声明
import PromptDialog from "./PromptDialog";
import ToastView from "./ToastView";
import AudioManager from "../AudioManager";
import PopupView from "./PopupView";
import { _decorator, Component, Node, Prefab, Color, isValid, instantiate, director, Director, tween, TweenAction, Vec3, Tween } from 'cc';
import BaseDialog from "./BaseDialog";
// 原始导入语句
// import { _decorator, Component, Node, EventTouch, isValid, Rect, Vec2 } from 'cc';

// 修改后的导入语句
//import { _decorator, Component, Node, EventTouch, isValid, Rect, Vec2, FiniteTimeAction, sequence, callFunc } from 'cc';
const { ccclass, property } = _decorator;


@ccclass("ViewManager")
export default class ViewManager extends Component {
    private static mViewManager: ViewManager;

    private static LocalZOrder = {
        PromptDialog: 1000,
        Loading: 1001,
        Toast: 1002
    }

    static readonly View = {
        PromptDialog: "PromptDialog",//提示弹窗
        ToastView: "ToastView",//Toast提示
        Revive: "Revive",
        ResultView: "ResultView",
    }

    @property( Prefab)
    PopupView:  Prefab = null;//基础弹出界面

    @property( Prefab)
    promptDialog:  Prefab = null;//提示弹窗

    @property( Prefab)
    toastView:  Prefab = null;

    @property( Prefab)
    pRevive:  Prefab = null;

    @property( Prefab)
    pGetTiLi:  Prefab = null;

    @property( Prefab)
    pOffLine:  Prefab = null;
    
    @property( Prefab)
    pSetting:  Prefab = null;
    
    @property( Prefab)
    pNewBao:  Prefab = null;
    
    @property( Prefab)
    pGoldTip:  Prefab = null;
    
    @property( Prefab)
    pOver:  Prefab = null;

    @property( Prefab)
    pBaoXiang:  Prefab = null;

    private PopupViewList: Array<PopupView> = new Array<PopupView>();
    private PopupViewMap = {};

    onLoad() {
        ViewManager.mViewManager = this;
         director.on( Director.EVENT_BEFORE_SCENE_LAUNCH, (event) => {
            AudioManager.getInstance().stopAll();
        });
    }

    onDestroy() {
    }

    //弹出界面销毁回调
    private onPopupViewDestroy(PopupView: PopupView) {
        this.removeFromMap(PopupView);
        this.removeFromArray(PopupView);
    }

    private show(PopupView: PopupView, parent = null as  Node) {
        if (! isValid(PopupView)) {
            return;
        }
        if (PopupView.closeOnKeyBack) {
            this.PopupViewList.push(PopupView);
        }
        let oo = ViewManager.getPopupView(PopupView.name);
        if (oo != null && oo.name != PopupView.name) {
            ViewManager.dismiss(PopupView.name);
        }
        if (PopupView.name) {
            this.PopupViewMap[PopupView.name] = PopupView;
        }
        PopupView.setOnDestroyCallback(this.onPopupViewDestroy.bind(this));
        PopupView.show(parent || ViewManager.getRoot());
    }

    private removeFromMap(PopupView: PopupView) {
        if (!PopupView) {
            return;
        }
        if (PopupView.name) {
            this.PopupViewMap[PopupView.name] = null;
        }
    }

    private removeFromArray(PopupView: PopupView) {
        if (!PopupView) {
            return;
        }
        let position = this.PopupViewList.indexOf(PopupView);
        if (position >= 0) {
            this.PopupViewList.splice(position, 1);
        }
    }

    private static checkValid(): boolean {
        return !!ViewManager.mViewManager;
    }

    static show({
        node = null as  Node,//需要显示的界面
        name = null as string,//界面名称，标识界面的唯一性
        parent = null as  Node,//弹出父节点
        localZOrder = 0,//节点局部 Z 轴顺序
        data = {} as any,//传入数据
        closeOnTouchOutside = false,//是否点击外面空白区域关闭界面
        closeOnKeyBack = false,//是否响应返回键关闭界面
        mask = true,//是否有蒙层覆盖
        maskOpacity = 155,//蒙层不透明度
        transitionShow = false,//是否显示打开过渡动画
        transitionDismiss = true,//是否显示关闭过渡动画
        showAction = null as Tween<Node>,
        showActionTarget = null as  Node,
        dismissAction = null as Tween<Node>,
        dismissActionTarget = null as  Node
    }): PopupView {
        if (! isValid(node)) {
            return;
        }
        if (!ViewManager.checkValid() || ! isValid(ViewManager.mViewManager.PopupView)) {
            return;
        }
        // 修改后的PopupView获取方式 - 使用类型安全的组件访问
        let popupView: PopupView = node.getComponent(PopupView);
        if (!popupView) {
            let popupViewNode = instantiate(ViewManager.mViewManager.PopupView);
            popupView = popupViewNode.getComponent(PopupView);
            popupView.contentNode = node;
            popupView.contentNode.parent = popupView.node;
        } else {
            popupView.contentNode = popupView.contentNode
                || popupView.node.getChildByName("ContentNode")
                || popupView.node;
        }
       // 将data参数传递给具体的界面组件
        if (popupView.contentNode && data && Object.keys(data).length > 0) {
            let contentComponent = popupView.contentNode.getComponent(BaseDialog);
            if (contentComponent) {
                contentComponent.setData(data);
            }
        }
        // 修复参数传递，使用修改后的popupView变量
        ViewManager.showPopupView({
            popupView: popupView,
            name,
            parent,
            localZOrder,
            closeOnTouchOutside,
            closeOnKeyBack,
            mask,
            maskOpacity,
            transitionShow,
            transitionDismiss,
            showAction,
            showActionTarget,
            dismissAction,
            dismissActionTarget
        });

        return popupView;
    }

    // 修改后的showPopupView函数 - 修复参数名称混淆问题
    static showPopupView({
        popupView = null as PopupView,
        name = null as string,//界面名称，标识界面的唯一性
        parent = null as Node,//弹出父节点
        localZOrder = 0,//节点局部 Z 轴顺序
        closeOnTouchOutside = false,//是否点击外面空白区域关闭界面
        closeOnKeyBack = false,//是否响应返回键关闭界面
        mask = true,//是否有蒙层覆盖
        maskOpacity = 155,//蒙层不透明度
        transitionShow = false,//是否显示打开过渡动画
        transitionDismiss = true,//是否显示关闭过渡动画
        showAction = null as Tween<Node>,
        showActionTarget = null as Node,
        dismissAction = null as Tween<Node>,
        dismissActionTarget = null as Node
    }) {
        if (!ViewManager.checkValid() || !isValid(popupView)) {
            return;
        }

        //蒙层
        if (closeOnTouchOutside) {
            mask = true;
        }
        popupView.setMask(mask, maskOpacity);

        //打开动画
        showActionTarget = showActionTarget || popupView.contentNode;
        if (transitionShow && isValid(showActionTarget)) {
            // 原始默认动画实现（基于旧动画系统）
            // showAction = showAction || sequence(
            //     callFunc(() => { showActionTarget.scale = 0; }),
            //     scaleTo(0.1, 1, 1).easing(easeOut(3.0))
            // );
            
            // 修改后的默认动画实现 - 使用tween动画系统
            showAction = showAction || tween(showActionTarget)
                .call(() => { showActionTarget.scale = new Vec3(0, 0, 0); })
                .to(5, { scale: new Vec3(1, 1, 1) }, { easing: 'cubicOut' });
        }
        popupView.setShowAction(showAction, showActionTarget);

        //关闭动画
        dismissActionTarget = dismissActionTarget || popupView.contentNode;
        if (transitionDismiss) {
            // 原始默认关闭动画实现（基于旧动画系统）
            // dismissAction = dismissAction || null;
            
            // 修改后的默认关闭动画实现 - 使用tween动画系统
            dismissAction = dismissAction || tween(dismissActionTarget)
                .to(0.1, { scale: new Vec3(0, 0, 0) }, { easing: 'cubicOut' });
        }
        popupView.setDismissAction(dismissAction, dismissActionTarget);

        popupView.closeOnTouchOutside = closeOnTouchOutside;
        popupView.closeOnKeyBack = closeOnKeyBack;
        popupView.name = name || popupView.name;
        popupView.localZOrder = localZOrder || 0;

        ViewManager.mViewManager.show(popupView, parent);
    }

    // 原始dismissPopupView函数
    // private static dismissPopupView(PopupView: PopupView) {
    //     if (!PopupView) {
    //         return;
    //     }
    //     if ( isValid(PopupView)) {
    //         PopupView.dismiss();
    //     }
    //     if (!ViewManager.checkValid()) {
    //         return;
    //     }
    //     ViewManager.mViewManager.removeFromMap(PopupView);
    //     ViewManager.mViewManager.removeFromArray(PopupView);
    // }

    // 修改后的dismissPopupView函数 - 修复参数名称
    private static dismissPopupView(popupView: PopupView) {
        if (!popupView) {
            return;
        }
        if (isValid(popupView)) {
            popupView.dismiss();
        }
        if (!ViewManager.checkValid()) {
            return;
        }
        ViewManager.mViewManager.removeFromMap(popupView);
        ViewManager.mViewManager.removeFromArray(popupView);
    }

    static dismiss(name: string) {
        if (!name) {
            return;
        }
        if (!ViewManager.checkValid()) {
            return;
        }
        let PopupView = ViewManager.mViewManager.PopupViewMap[name];
        if ( isValid(PopupView)) {
            PopupView.dismiss();
        }
        ViewManager.mViewManager.PopupViewMap[name] = null;
        ViewManager.mViewManager.removeFromMap(PopupView);
        ViewManager.mViewManager.removeFromArray(PopupView);
    }

    static isShow(name: string): boolean {
        if (!name) {
            return false;
        }
        if (!ViewManager.checkValid()) {
            return false;
        }
        return  isValid(ViewManager.mViewManager.PopupViewMap[name]);
    }

    /**
     * 获取当前正在显示的弹出界面
     * 
     * @param name 弹出界面名称
     */
    public static getPopupView(name: string) {
        if (!name) {
            return null;
        }
        if (!ViewManager.checkValid()) {
            return null;
        }
        if ( isValid(ViewManager.mViewManager.PopupViewMap[name])) {
            return ViewManager.mViewManager.PopupViewMap[name];
        } else if (ViewManager.mViewManager.PopupViewMap[name]) {
            ViewManager.mViewManager.PopupViewMap[name] = null;
        }
        return null;
    }

    /**
     * 显示通用提示弹窗
     * 
     * @param data 
     */
    static showPromptDialog(data: {
        node?:  Node,
        title?: string,             //标题  
        closeButton?: boolean,      //是否只显示关闭文字按钮
        transition: boolean   //
    }) {
        if (!ViewManager.checkValid()) {
            return;
        }
        let prompt =  instantiate(ViewManager.mViewManager.promptDialog);
        let promptDialog = prompt.getComponent(PromptDialog);
        promptDialog.setData(data);
        ViewManager.show({
            node: prompt,
            name: data.title || ViewManager.View.PromptDialog,
            localZOrder: ViewManager.LocalZOrder.PromptDialog,
            mask: true,
            maskOpacity: 155,
            transitionShow: data.transition
        });
    }

    /**
     * 显示文字提示
     */
    // 原始toast函数
    // static toast(message: string, textColor:  Color =  color(255, 255, 255), showTime = 1.5, fontSize = 0) {

    // 修改后的toast函数 - 修复color函数使用
    static toast(message: string, textColor: Color = new Color(255, 255, 255), showTime = 1.5, fontSize = 0) {
        if (!ViewManager.checkValid()) {
            return;
        }
        let old = ViewManager.getPopupView(ViewManager.View.ToastView);
        let toast;
        let toastView: ToastView
        if (old instanceof ToastView) {
            toast = old.node;
            toastView = old;
        } else {
            toast =  instantiate(ViewManager.mViewManager.toastView);
            toastView = toast.getComponent(ToastView);
        }
        toastView.setMessage(message);
        toastView.setFontSize(fontSize);
        toastView.setTextColor(textColor);
        toastView.setShowTime(showTime);
        ViewManager.show({
            node: toast,
            name: ViewManager.View.ToastView,
            localZOrder: ViewManager.LocalZOrder.Toast,
            mask: false,
            transitionDismiss: false
        });
    }

    static getRoot() {
        return  director.getScene().getChildByName("Canvas");
    }

    // 原始findChildByName函数
    // static findChildByName(name: string, node:  Node):  Node {

    // 修改后的findChildByName函数 - 修复参数类型
    static findChildByName(name: string, node: Node): Node {
        if (!name || !node || !node.children) {
            return null;
        }
        let result = node.getChildByName(name);
        if (result) {
            return result;
        }
        let children = node.children;
        for (let index = 0; index < children.length; index++) {
            result = ViewManager.findChildByName(name, children[index]);
            if (result) {
                return result;
            }
        }
        return null;
    }

    static showRevive() {
        let nd = instantiate(ViewManager.mViewManager.pRevive);
        ViewManager.show({
            node: nd,
            closeOnKeyBack: false,
            transitionShow: false,
            maskOpacity: 155
        });
    }

}
