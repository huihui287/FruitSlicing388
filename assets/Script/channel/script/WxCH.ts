import BaseCH from "./BaseCH";
import { BaseINT } from "./BaseINT";
import ChannelDB from "../ChannelDB";

/**
 * oppo渠道
 */
export default class WxCH extends BaseCH implements BaseINT {

    //视频
    public videoAd = null;
    public videoId = "adunit-09683c162d6d860f";
    //banner
    public bannerAd = null;
    public banIndex = 0;
    public bannerId = ["adunit-f41e43c0ef97e349", "adunit-7071fda069ba5bed","adunit-bcd7c8a9f2bb4406","adunit-c1a6287208b9f21e","adunit-24ed064f25396cf4","adunit-5217ce8d1749b493"];
    //插屏广告
    public insertAd = null;
    public insertId = "adunit-4b9ebda4f0b36a86";

    //分享 开始的时间
    private share_start_time: number = 0;
    //分享 结束的时间
    private share_end_time: number = 0;
    //分享延时时间
    private share_interval_time: number = 3000;

    //banner是否是显示中
    public isBannerShow = false;

    //显示视频回调
    public videoCallback = null;

    constructor(ch) {
        super(ch);
        this.getSystem();
        this.getLaunchOptions();
        this.onShowAlways();
        this.createBannerAd();
        this.createVideoAd();
        this.createInterstitialAd();
        this.setShareAppMessage();
        this.checkUpdate();
        this.onHide();
        console.log("微信渠道初始化完成");
    }

    /**创建视频广告*/
    createVideoAd() {
        if (this.ch) {
            this.videoAd = this.ch.createRewardedVideoAd({ adUnitId: this.videoId });
            this.videoAd.onLoad(() => {
                console.log("视频创建成功");
                ChannelDB.videoEnable = true;
                this.videoAd.offLoad();
            });
            this.videoAd.onError(err => {
                console.log("视频创建错误：", err);
                ChannelDB.videoEnable = false;
            });
            this.videoAd.load();

            //关闭视频回调
            let call = (res) => {
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    console.info("视频观看成功");
                    if (this.videoCallback) this.videoCallback(true);
                } else {
                    // 播放中途退出，不下发游戏奖励
                    console.log("视频观看失败");
                    if (this.videoCallback) this.videoCallback(false)
                }
            }
            this.videoAd.onClose(call);
        }
    }

    /***显示视频*/
    showVideoAd(callback = null) {
        if (this.ch && this.videoAd) {
            this.videoCallback = callback;
            this.videoAd.show().catch((err) => {
                this.showToast("暂无广告，请稍后再试");
                if (callback) callback(false);
            });
        }
    }

    /**创建banner*/
    createBannerAd() {
        if (this.ch) {
            let banId = this.refreshBanId();
            this.bannerAd = this.ch.createBannerAd({
                adUnitId: banId,
                adIntervals: 30,
                style: {
                    left: 80,
                    top: ChannelDB.screenHeight - 80,
                    width: 300,
                }
            });
            this.bannerAd.onLoad(() => {
                console.log("banner创建成功 id=", banId)
                this.bannerAd.offLoad();
            });
            this.bannerAd.onResize(() => {
                console.log("Resize", this.bannerAd);
                this.bannerAd.style.left = (ChannelDB.screenWidth - this.bannerAd.style.realWidth) / 2;
                this.bannerAd.style.top = ChannelDB.screenHeight - this.bannerAd.style.realHeight;
                this.bannerAd.offResize();
            });
            this.bannerAd.onError(err => {
                console.log("创建banner失败: ", err)
            });
            if (this.isBannerShow) {
                this.showBannerAd();
            } else {
                this.hideBannerAd();
            }

        }
    }

    /**刷新BannerId*/
    private refreshBanId() {
        this.banIndex++;
        this.banIndex > this.bannerId.length - 1 && (this.banIndex = 0);
        return this.bannerId[this.banIndex];
    }

    /**销毁banner*/
    destroyBannerAd() {
        if (this.bannerAd) {
            console.log("销毁 banner");
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }

    /**刷新显示banner*/
    resetBannerAd() {
        if (this.ch) {
            console.log("刷新 banner");
            this.destroyBannerAd();
            this.createBannerAd();
        }
    }

    /**显示banner*/
    showBannerAd() {
        this.isBannerShow = true;
        //&& SwitchManager.game_banner
        if (this.ch && this.bannerAd ) {
            console.log("显示 banner");
            this.bannerAd.show();
        }
    }

    /**隐藏banner*/
    hideBannerAd() {
        this.isBannerShow = false;
        if (this.ch && this.bannerAd) {
            console.log("隐藏 banner");
            this.bannerAd.hide();
        }
    }


    /**创建插屏广告*/
    createInterstitialAd() {
        if (this.ch) {
            this.insertAd = this.ch.createInterstitialAd({
                adUnitId: this.insertId
            });
            this.insertAd.onLoad(() => {
                this.insertAd.offLoad();
                console.log("插屏广告加载完毕");
            })
            this.insertAd.onError((err) => {
                this.insertAd.offError();
                console.log("插屏广告错误", err);
            })

        }
    }

    /**展示插屏广告*/
    showInterstitialAd(callback = null) {
        console.log("显示插屏广告")
        if (this.ch && this.insertAd) {
            if (callback) {
                this.insertAd.onClose(() => {
                    console.log("插屏广告关闭");
                    this.insertAd.offClose();
                    if (callback) callback();
                })
            }
            let promise = this.insertAd.show();
            promise.catch((reject) => {
                console.log("创建插屏广告失败");
                console.log(`errCode:${reject.errMsg},errMsg:${reject.errCode}`);
            });
        }
    }

    //显转发按钮
    showShareMenu() {
        if (this.ch) {
            this.setShareAppMessage();
            this.ch.showShareMenu({
                withShareTicket: false,
            });
            console.log("显示转发按钮");
        }
    }

    //设置转发信息（右上角按钮点击->转发）
    public setShareAppMessage() {
        if (this.ch) {
            console.log("设置转发信息");
            this.ch.onShareAppMessage(() => {
                return {
                    title: "好玩的水果消除游戏，快来挑战吧！",
                    imageUrl: "", // 默认分享图
                    success: (res) => {
                        console.log("转发成功");
                    },
                    fail: (res) => {
                        console.log("转发失败");
                    }
                }
            });
        }
    }


    /**普通分享*/
    share(callback = null) {
        if (this.ch) {
            //记录分享开始时间
            this.share_start_time = Date.now();
            
            //设置分享后回调行为 (通过 onShow 检测)
            let call: Function = (res) => {
                //记录分享结束时间
                this.share_end_time = Date.now();
                if (this.share_end_time - this.share_start_time >= this.share_interval_time) {
                    //分享成功 (模拟)
                    if (callback) callback(true);
                } else {
                    //分享失败
                    if (callback) callback(false);
                }
            }
            this.onShow(call);

            //拉起分享
            let sn = Date.now() + "" + ~~((0.1 + Math.random() / 2) * 10000);
            this.ch.shareAppMessage({
                title: "好玩的水果消除游戏，快来挑战吧！",
                imageUrl: "",
                query: "&sn=" + sn,
            });
        }
    }

    /**检查更新*/
    checkUpdate() {
        if (this.ch) {
            //获取全局唯一的版本更新管理器，用于管理小程序更新
            let updateManager = this.ch.getUpdateManager();
            //监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发。
            updateManager.onCheckForUpdate((res) => {
                //请求完新版本信息的回调
                console.log("是否有新版本:", res.hasUpdate);
            });
            //监听小程序更新失败事件。小程序有新版本，客户端主动触发下载（无需开发者触发），下载失败（可能是网络原因等）后回调
            updateManager.onUpdateFailed(() => {
                this.showToast("新版本下载失败");
            });
            //监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
            updateManager.onUpdateReady(() => {
                this.showModal('更新提示', '新版本已经准备好，是否重启应用？', true, (res) => {
                    if (res) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                });
            })
        }
    }

    /**导航到其他小程序*/
    gotoOther(adv_id: string, pkgName: string, path: string, callback = null) {
        if (this.ch) {
            if (pkgName) {
                this.ch.navigateToMiniProgram({
                    appId: pkgName,
                    path: path,
                    success(res) {
                        console.log('打开成功: appid = ', pkgName);
                        if (callback) callback(true);
                    },
                    fail(err) {
                        console.log('打开失败: appid = ', pkgName);
                        if (callback) callback(false);
                    },
                })
            }
        }
    }

    /**
     * 分包加载
     * @param name 分包名称
     * @param callback 加载完成回调
     */
    loadSubPackages(name: string, callback: Function, progressCallback?: Function) {
        console.log("WxCH loadSubPackages:", name);
        if (!this.ch) {
            if (callback) callback(false, "channel not available");
            return;
        }

        let loadAttempts = 0;
        const maxAttempts = 3;
        const load = () => {
            loadAttempts++;
            console.log(`WxCH loadSubPackages attempt ${loadAttempts}/${maxAttempts}: ${name}`);
            
            const loadTask = this.ch.loadSubpackage({
                name: name,
                success: (res) => {
                    console.log(`WxCH loadSubPackages success: ${name}, errMsg: ${res.errMsg}`);
                    if (callback) callback(true, null, 100);
                },
                fail: (res) => {
                    console.error(`WxCH loadSubPackages failed (${loadAttempts}/${maxAttempts}):`, res);
                    if (loadAttempts < maxAttempts) {
                        setTimeout(load, 1000);
                    } else {
                        console.error(`WxCH loadSubPackages failed after ${maxAttempts} attempts: ${name}`);
                        if (callback) callback(false, res);
                    }
                }
            });
            
            // 使用loadTask.onProgressUpdate方式监听进度
            if (loadTask && loadTask.onProgressUpdate) {
                loadTask.onProgressUpdate(res => {
                    console.log(`WxCH loadSubPackages progress: ${name} - ${res.progress}%`);
                    console.log(`WxCH loadSubPackages bytes: ${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`);
                    if (progressCallback) {
                        // 传递更详细的进度信息
                        progressCallback(res.progress, res.totalBytesWritten, res.totalBytesExpectedToWrite);
                    }
                });
            }
        };
        
        load();
    }

}
