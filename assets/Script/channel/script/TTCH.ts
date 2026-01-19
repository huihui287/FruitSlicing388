import BaseCH from "./BaseCH";
import { BaseINT } from "./BaseINT";
import ChannelDB from "../ChannelDB";
// import OperationManager from "../../dbmodule/OperationManager";
// import SwitchManager from "../../global/SwitchManager";
/**
 * 头条渠道
 */
export default class TTCH extends BaseCH implements BaseINT {

    //视频
    public videoAd = null;
    public videoId = "2rqd5wdjpp40bmff4d";
    //banner
    public bannerAd = null;
    public banIndex = 0;
    public bannerId = ["d5qmn16ddbf2j3m7ia"];
    //插屏广告
    public insertAd = null;
    public insertId = "35e9gsqo2nt1iqvov0";

    //更多游戏组件
    public btnMoreGame = null;

    //录屏组件
    public gameRecorderManager = null;
    //是否正在录制
    public isRecording = false;
    //录制起始时间
    public recordingBeginTime = 0;
    //录制结束时间
    public recordingEndTime = 0;
    //剪辑索引列表
    public clipIndexList = [];
    //录制结束时获得的视频信息
    public recordResp = null;

    //录屏总时长
    public recordTime = 0;

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
        this.getGameRecorderManager();
        this.checkUpdate();
        this.onHide();
        console.log("头条渠道初始化完成");
    }

    /**
     * 分享
     */
    public share(callback = null, channel = "article", extra = {}): void {
        // if (this.ch) {
        //     let sdb = OperationManager.getOneShareData();
        //     let sn = Date.now() + "" + ~~((0.1 + Math.random() / 2) * 10000);
        //     //正常分享
        //     if (channel == "article") {
        //         this.ch.shareAppMessage({
        //             title: sdb.title,
        //             imageUrl: sdb.img_url,
        //             // desc: sdb.desc,
        //             query: "&sn=" + sn + "&share_id=" + sdb.id,
        //             extra: extra,
        //             success() {
        //                 //console.log("分享成功");
        //                 if (callback) callback(true);
        //             },
        //             fail(e) {
        //                 //console.log("分享失败");
        //                 if (callback) callback(false);
        //             },
        //         });
        //     }
        //     //斗音特殊处理，不能带channel参数，否则无法拉起分享 
        //     else {
        //         this.ch.shareAppMessage({
        //             channel: channel,
        //             title: sdb.title,
        //             imageUrl: sdb.img_url,
        //             // desc: sdb.desc,
        //             query: "&sn=" + sn + "&share_id=" + sdb.id,
        //             extra: extra,
        //             success() {
        //                 //console.log("分享成功");
        //                 if (callback) callback(true);
        //             },
        //             fail(e) {
        //                 //console.log("分享失败");
        //                 if (callback) callback(false);
        //             },
        //         });
        //     }
        //     // });
        // }
    }

    /**创建视频广告*/
    createVideoAd() {
        if (this.ch) {
            this.videoAd = this.ch.createRewardedVideoAd({ adUnitId: this.videoId });
            this.videoAd.onLoad(() => {
                //console.log("视频创建成功");
                ChannelDB.videoEnable = true;
            });
            this.videoAd.onError(err => {
                //console.log("视频创建错误：", err);
                ChannelDB.videoEnable = false;
            });
            this.videoAd.load();

            //关闭视频回调
            let call = (res) => {
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    //console.log("视频观看成功");
                    if (this.videoCallback) this.videoCallback(true);
                } else {
                    // 播放中途退出，不下发游戏奖励
                    //console.log("视频观看失败");
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
                this.showToast("暂无视频，请稍后再试");
                this.videoAd.load();
                // if (callback) callback(false);
            });
        }else{
            this.showToast("暂无视频，请稍后再试");
             if (callback) callback(false);
        }
    }

    /**创建banner*/
    createBannerAd() {
        if (this.ch) {
            let banId = this.refreshBanId();

            let width = 150;
            // Laya.Browser.width / Laya.Browser.height < 0.5 ? width = 250 : width = 150;
            ChannelDB.screenWidth / ChannelDB.screenHeight < 0.5 ? width = 250 : width = 150;

            this.bannerAd = this.ch.createBannerAd({
                adUnitId: banId,
                style: {
                    width: width,
                    top: ChannelDB.screenHeight - (width / 16 * 9), // 根据系统约定尺寸计算出广告高度
                },
            });

            this.bannerAd.onLoad(() => {
                //console.log("创建banner成功")
                this.hideBannerAd();
            });

            this.bannerAd.onError(err => {
                //console.log("创建banner广告报错: ", err)
            });

            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = ChannelDB.screenHeight - res.height
                this.bannerAd.style.left = (ChannelDB.screenWidth - res.width) / 2 // 水平居中
            })
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
            //console.log("销毁 banner");
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }

    /**刷新显示banner*/
    resetBannerAd() {
        if (this.ch) {
            //console.log("刷新 banner");
            this.destroyBannerAd();
            this.createBannerAd();
            this.showBannerAd();
        }
    }

    /**显示banner*/
    showBannerAd() {
        if (this.ch && this.bannerAd) {
            //console.log("显示 banner");
            this.bannerAd.show();
        }
    }

    /**隐藏banner*/
    hideBannerAd() {
        if (this.bannerAd) {
            //console.log("隐藏 banner");
            this.bannerAd.hide();
        }
    }

    /**创建插屏广告*/
    createInterstitialAd() {
        const isToutiaio = ChannelDB.appName === "Toutiao";
        //console.log("ChannelDB.appName:", ChannelDB.appName)
        //console.log("isToutiaio:", isToutiaio)
        // 插屏广告仅今日头条安卓客户端支持
        if (this.ch && isToutiaio) {
            this.insertAd = this.ch.createInterstitialAd({
                adUnitId: this.insertId
            });
            this.insertAd.onLoad(() => {
                this.insertAd.offLoad();
                //console.log("插屏广告加载完毕");
            })
            this.insertAd.onError((err) => {
                this.insertAd.offError();
                //console.log("插屏广告错误", err);
            })

        }
    }

    /**展示插屏广告*/
    showInterstitialAd(callback?) {
        //console.log("显示插屏广告")
        if (this.ch && this.insertAd) {
            if (callback) {
                this.insertAd.onClose(() => {
                    //console.log("插屏广告关闭");
                    this.insertAd.offClose();
                    callback();
                })
            }
            let promise = this.insertAd.show();
            promise.catch((reject) => {
                //console.log("创建插屏广告失败");
                //console.log(`errCode:${reject.errMsg},errMsg:${reject.errCode}`);
            });
        } else {
            if (callback) callback();
        }
    }

    /**获取录屏组件*/
    getGameRecorderManager() {
        if (this.ch) {
            this.gameRecorderManager = this.ch.getGameRecorderManager();
            //console.log("获取录屏组件：", this.gameRecorderManager);

            this.gameRecorderManager.onError(res => {
                //console.log('获取录屏组件错误', res);
            });

            this.gameRecorderManager.onInterruptionBegin(res => {
                this.showToast("录屏中断");
            });

            this.gameRecorderManager.onInterruptionEnd(res => {
                this.showToast("录屏中断");
            });

            this.gameRecorderManager.onStart(res => {
                //console.log('录屏开始');
                this.isRecording = true;
                this.recordingBeginTime = new Date().getTime();
            })

            this.gameRecorderManager.onStop(resp => {
                //console.log('录屏结束');
                this.recordResp = resp;
                this.isRecording = false;
                this.recordingEndTime = new Date().getTime();
                this.recordClip();
            });
        }
    }

    /**开始录屏*/
    startGameRecorderManager() {
        if (this.ch) {
            this.gameRecorderManager.start({
                duration: 300,
            })
        }
    }

    /**结束录屏*/
    stopGameRecorderManager() {
        if (this.ch) {
            this.gameRecorderManager.stop();
        }
    }

    /**剪辑录屏*/
    recordClip() {
        if (this.ch) {
            this.recordTime = Math.floor((this.recordingEndTime - this.recordingBeginTime) / 1000);
            //console.log("录屏总时间：", this.recordTime);
            this.gameRecorderManager.recordClip({
                timeRange: [this.recordTime, 0],
            });
        }
    }


    /**录屏分享*/
    recordShare(callback = null) {
        if (this.ch) {
            //console.log("录屏分享：", this.recordResp)
            //发起视频分享
            if (this.recordTime > 3) {
                this.share((res) => { if (callback) callback(res) }, "video", { videoPath: this.recordResp.videoPath });
            } else {
                this.showToast("录屏时间不足")
            }

        };
    }

    /**
     * 创建更多游戏按钮
     * @param imgUrl  图片路径 图片打包类型=不打包 "img/tt/more_games_btn.png"
     * @param width   宽度
     * @param height  高度
     */
    createBtnMoreGame(imgUrl: string, width: number, height: number) {
        //头条不支持iOS 屏蔽
        if (this.ch) {
            //console.log("创建更多游戏按钮");
            // let ratiox = Laya.Browser.width / 640;
            let ratiox = ChannelDB.screenWidth / 640;
            let y = 450;
            // Laya.Browser.width / Laya.Browser.height < 0.5 ? y = 550 : y = 450;
            ChannelDB.screenWidth / ChannelDB.screenHeight < 0.5 ? y = 550 : y = 450;

            this.btnMoreGame = this.ch.createMoreGamesButton({
                type: "image",
                image: imgUrl,//
                style: {
                    left: 0,
                    // top: y * ratiox / Laya.Browser.pixelRatio,
                    top: y * ratiox / ChannelDB.devicePixelRatio,
                    // width: width * ratiox / Laya.Browser.pixelRatio,
                    width: width * ratiox / ChannelDB.devicePixelRatio,
                    // height: height * ratiox / Laya.Browser.pixelRatio,
                    height: height * ratiox / ChannelDB.devicePixelRatio,
                    lineHeight: 0,
                    backgroundColor: "#00000000",
                    textColor: "#00000000",
                    textAlign: "center",
                    fontSize: 16,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#00000000'
                },
                appLaunchOptions: [],
                onNavigateToMiniGame(res) {
                    //console.log("跳转其他小游戏", res)
                }
            });

            this.btnMoreGame.onTap(() => {
                //console.log("点击更多游戏")
            });
        }
    }

    showBtnMoreGame() {
        if (this.ch && this.btnMoreGame) {
            //console.log("显示更多游戏按钮");
            this.btnMoreGame.show();
        }
    }

    /**
     * 弹出互跳弹窗
     */
    showMoreGamesModal() {
        if (this.ch ) {
            //console.log("打开互跳弹窗")
            // 打开互跳弹窗
            this.ch.showMoreGamesModal({
                appLaunchOptions: [
                    // {
                    // appId: "tt39374f8aa61d459b",
                    // query: "foo=bar&baz=qux",
                    // extraData: {}
                    // }
                    // {...}
                ],
                success(res) {
                    //console.log("success", res.errMsg);
                },
                fail(res) {
                    //console.log("fail", res.errMsg);
                },
                onNavigateToMiniGame(res) {
                    //console.log("跳转其他小游戏", res)
                }
            });
        }
    }

    hideBtnMoreGame() {
        if (this.ch && this.btnMoreGame) {
            //console.log("隐藏更多游戏按钮");
            this.btnMoreGame.hide()
        }
    }

    //检查更新
    checkUpdate() {
        if (this.ch) {
            //获取全局唯一的版本更新管理器，用于管理小程序更新
            let updateManager = this.ch.getUpdateManager();
            //监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发。
            updateManager.onCheckForUpdate((res) => {
                //请求完新版本信息的回调
                //console.log("是否有新版本:", res.hasUpdate);
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

    /**
     * 分包加载
     * @param name 分包名称
     * @param callback 加载完成回调
     */
    loadSubPackages(name: string, callback: Function, progressCallback?: Function) {
        console.log("TTCH loadSubPackages:", name);
        if (!this.ch) {
            if (callback) callback(false, "channel not available");
            return;
        }

        let loadAttempts = 0;
        const maxAttempts = 3;
        const load = () => {
            loadAttempts++;
            console.log(`TTCH loadSubPackages attempt ${loadAttempts}/${maxAttempts}: ${name}`);
            
            const loadTask = this.ch.loadSubpackage({
                name: name,
                success: (res) => {
                    console.log(`TTCH loadSubPackages success: ${name}, errMsg: ${res.errMsg}`);
                    if (callback) callback(true, null, 100);
                },
                fail: (res) => {
                    console.error(`TTCH loadSubPackages failed (${loadAttempts}/${maxAttempts}):`, res);
                    if (loadAttempts < maxAttempts) {
                        setTimeout(load, 1000);
                    } else {
                        console.error(`TTCH loadSubPackages failed after ${maxAttempts} attempts: ${name}`);
                        if (callback) callback(false, res);
                    }
                }
            });
            
            // 使用loadTask.onProgressUpdate方式监听进度
            if (loadTask && loadTask.onProgressUpdate) {
                loadTask.onProgressUpdate(res => {
                    console.log(`TTCH loadSubPackages progress: ${name} - ${res.progress}%`);
                    console.log(`TTCH loadSubPackages bytes: ${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`);
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
