import ChannelDB from "../ChannelDB";
import { BaseINT } from "./BaseINT";
// import Global from "../../global/Global";
// // import TotalTypeManager from "../../script/TotalTypeManager";
// import TotalTypeManager from "../../dbmodule/TotalTypeManager";
/**
 * 通用渠道接口
 */
export default class BaseCH implements BaseINT {
    startGameRecorderManager() {
        throw new Error('Method not implemented.');
    }
    stopGameRecorderManager() {
        throw new Error('Method not implemented.');
    }
    setImRankData_Num(level: number) {
        throw new Error('Method not implemented.');
    }
    getImRankList_Num() {
        throw new Error('Method not implemented.');
    }
    recordShare(call: (resp: any) => void) {
        throw new Error('Method not implemented.');
    }

    /**当前渠道 */
    ch = null;
    
    /**视频广告实例 */
    videoAd = null;

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
                if (res && res.scene) {
                    ChannelDB.sourceScene = res.scene;
                }
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
    }
    
    /**创建视频广告*/
    createVideoAd() {
    }
    
    /**显示视频广告*/
    showVideoAd(callback = null) {
    }
    
    /**创建banner广告*/
    createBannerAd() {
    }
    
    /**销毁banner广告*/
    destroyBannerAd() {
    }
    
    /**显示banner广告*/
    showBannerAd() {
    }
    
    /**隐藏banner广告*/
    hideBannerAd() {
    }
    /**分享*/
    share(callback: Function = null) {}
    
    /**分包加载*/
    loadSubPackages(name: string, callback: Function, progressCallback?: Function) {
        if (this.ch) {
            // 调用渠道的分包加载方法
            if (this.ch.loadSubpackage) {
                this.ch.loadSubpackage({
                    name: name,
                    success: () => {
                        console.log('分包加载成功:', name);
                        if (callback) callback(true);
                    },
                    fail: (err) => {
                        console.error('分包加载失败:', name, err);
                        if (callback) callback(false, err);
                    },
                    progress: (res) => {
                        if (progressCallback) {
                            progressCallback(res.progress, res.totalBytesWritten, res.totalBytesExpectedToWrite);
                        }
                    }
                });
            } else {
                // 没有分包加载方法，直接调用回调
                console.warn('当前渠道不支持分包加载');
                if (callback) callback(true);
            }
        } else {
            // 渠道未初始化
            console.error('渠道未初始化，无法加载分包');
            if (callback) callback(false, 'channel not initialized');
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
        if (this.ch && this.ch.vibrateShort) {
            this.ch.vibrateShort({
                success() { },
                fail() { },
                complete() { }
            });
        }
    }

    /**手机振动 400ms*/
    vibrateLong() {
        if (this.ch && this.ch.vibrateLong) {
            this.ch.vibrateLong({
                success() { },
                fail() { },
                complete() { }
            });
        }
    }

    /**
     * 写入用户云存储数据
     * @param kvData 要写入的键值对对象，value 可以是字符串或可序列化对象
     */
    //     kvData: {
    //     "score": 100,
    //     "progress": 10
    // }
    setUserCloudStorage(kvData?: { }) {
        if (!this.ch || !this.ch.setUserCloudStorage) {
            return;
        }

        this.ch.setUserCloudStorage({
            KVDataList: [
                {
                    key: "ONE",
                    value: JSON.stringify(kvData),
                },
            ],
            success: (res) => {
                console.log("setUserCloudStorage success", res);
            },
            fail: (res) => {
                console.log("setUserCloudStorage fail", res);
            },
            complete: (res) => {
                console.log("setUserCloudStorage complete", res);
            },
        });
    }

    /**
     * 读取用户云存储数据
     * @param keyList 需要读取的 key 列表
     * @param callback 读取完成回调，参数为平台返回的 KVDataList 或 null
     */

    // KVDataList: {
    //     "score": 100,
    //     "progress": 10
    // }

    getUserCloudStorage( callback?: (data:string) => void) {
        if (!this.ch || !this.ch.getUserCloudStorage ) {
            if (callback) {
                callback(null);
                console.log(" callback(null)");
            }
            return;
        }
         console.log(" callback(null)22222");
        this.ch.getUserCloudStorage({
           keyList: ["ONE"],
            success: (res) => {
                console.log("getUserCloudStorage success", res);
                if (callback) {
                    callback(res.KVDataList || null);
                }
            },
            fail: (res) => {
                console.log("getUserCloudStorage fail", res);
                if (callback) {
                    callback(null);
                }
            },
            complete: (res) => {
                console.log("getUserCloudStorage complete", res);
            },
        });
    }

    /**
     * 检测侧边栏是否存在 (Douyin only)
     * @param callback 
     */
    checkSideBar(callback: (isExist: boolean) => void) {
        console.log("BaseCH checkSideBar: not implemented");
        if (callback) callback(false);
    }

    /**
     * 跳转到侧边栏 (Douyin only)
     * @param callback 
     */
    navigateToSideBar(callback: (success: boolean) => void) {
        console.log("BaseCH navigateToSideBar: not implemented");
        if (callback) callback(false);
    }

}
