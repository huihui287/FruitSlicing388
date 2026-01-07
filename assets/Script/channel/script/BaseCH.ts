import ChannelDB from "../ChannelDB";
// import Global from "../../global/Global";
// // import TotalTypeManager from "../../script/TotalTypeManager";
// import TotalTypeManager from "../../dbmodule/TotalTypeManager";
/**
 * 通用渠道接口
 */
export default class BaseCH {

    /**当前渠道 */
    ch = null;

    private loadingTimeoutId = null;

    constructor(channel) {
        this.ch = channel;
    }

    /**登录微信*/
    login(callback = null) {
        if (this.ch) {
            this.ch.login({
                success: (res) => {
                    if (callback) callback(true, res);
                    console.log("登录成功", res);
                },
                fail: (res) => {
                    if (callback) callback(false, res);
                    console.log("登录失败", res);
                }
            })
        }
    }

    /**获取系统参数*/
    getSystem() {
        if (this.ch) {
            let data = ChannelDB.systemInfo = this.ch.getSystemInfoSync();
            ChannelDB.platform = data.platform;
            ChannelDB.appName = ChannelDB.systemInfo.appName;
            ChannelDB.screenWidth = data.screenWidth;
            ChannelDB.screenHeight = data.screenHeight;
            ChannelDB.devicePixelRatio = data.devicePixelRatio;
            console.log("系统参数：", data);
        }
    }

    /**获取小程序启动参数*/
    getLaunchOptions() {
        if (this.ch) {
            let data = ChannelDB.launchOption = this.ch.getLaunchOptionsSync();
            console.log("启动参数：", data);

            if (data) {
                data.referrerInfo || (data.referrerInfo = {}); //补全
                ChannelDB.sourceScene = ChannelDB.launchOption.scene;
                ChannelDB.sourceAppId = ChannelDB.launchOption.query.source_appid ? ChannelDB.launchOption.query.source_appid : ChannelDB.launchOption.referrerInfo.appId;
            }
        }
    }

    /**监听小游戏回到前台的事件 总是*/
    onShowAlways() {
        if (this.ch) {
            let call = (res) => {
                console.log("监听回到前台事件 总是:", res);
                // AddPhysical.initData();
            };
            this.ch.onShow(call);
        }
    }

    /**监听小游戏回到前台的事件 单次*/
    onShow(callback = null) {
        if (this.ch) {
            let call = (res) => {
                console.log("监听回到前台事件 单次:", res);
                this.ch.offShow(call);//移除有回调的监听事件 避免监听堆积
                if (callback) callback();
            };
            this.ch.offShow(call);
            this.ch.onShow(call);
        }
    }

    /**监听小游戏退出前台 总是*/
    onHide(callback = null) {
        if (this.ch) {
            this.ch.onHide(() => {
                console.log("监听退出事件");
                // TotalTypeManager.setLastLeavlTime();
                // TotalTypeManager.setOffTime();
                // TotalTypeManager.saveData();
                if (callback) callback();
            });
        }
    }

    /**显示加载框*/
    showLoading(time = 3000, callback = null) {
        if (this.ch) {
            this.ch.showLoading({
                title: '加载中...',
                success(res) {
                    this.loadTimeoutId = setTimeout(() => {
                        this.hideLoading();
                        if (callback) callback();
                    }, time);
                },
            })
        }
    }

    /**隐藏加载框*/
    hideLoading() {
        if (this.ch) {
            this.ch.hideLoading({
                success(res) {
                    if (this.loadingTimeoutId) {
                        clearTimeout(this.loadingTimeoutId);
                        this.loadingTimeoutId = null;
                    }
                },
            })
        }
    }

    /**
    * 显示lToast提示框
    * @param title 
    * @param icon  success成功图标  loading加载图标  none不显示图标
    */
    showToast(title: string, icon: string = 'none', time = 2000) {
        if (this.ch) {
            this.ch.showToast({
                title: title,
                icon: icon,
                duration: time
            })
        }
    }

    /**显示模拟对话框*/
    showModal(title: string, content: string, showCancel = true, callback = null) {
        if (this.ch) {
            this.ch.showModal({
                title: title,
                content: content,
                showCancel: showCancel,
                success(res) {
                    if (res.confirm) {
                        console.log("玩家点击确定");
                        if (callback) callback(true);
                    }
                    else if (res.cancel) {
                        console.log("玩家点击取消");
                        if (callback) callback(false);
                    }
                }
            })
        }
    }

    /**手机振动 15ms*/
    vibrateShort() {
        // if (this.ch && Global.shake_switch) {
        //     this.ch.vibrateShort({
        //         success() { },
        //         fail() { },
        //         complete() { }
        //     });
        // }
    }

    /**手机振动 400ms*/
    vibrateLong() {
        // if (this.ch && Global.shake_switch) {
        //     this.ch.vibrateLong({
        //         success() { },
        //         fail() { },
        //         complete() { }
        //     });
        // }
    }

    /**
     * 分包加载
     * @param name 分包名称
     * @param callback 加载完成回调
     * @param progressCallback 进度更新回调 (progress: number, totalBytesWritten: number, totalBytesExpectedToWrite: number)
     */
    loadSubPackages(name: string, callback: Function, progressCallback?: Function) {
        console.log("BaseCH loadSubPackages:", name);
        if (callback) callback(true, null, 100);
    }

}

