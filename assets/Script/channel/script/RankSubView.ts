import { _decorator, Component, Node, Label, SubContextView } from 'cc';
import CM from '../../channel/CM';
import GameData from '../../Common/GameData';
import { LevelConfig } from '../../Tools/levelConfig';
const { ccclass, property } = _decorator;

/**
 * 微信渠道排行榜子视图
 * 使用微信开放数据域实现好友排行榜功能
 */
@ccclass('RankSubView')
export class RankSubView extends Component {
    
    @property(Node)
    rankSubView: Node = null; // 绑定 SubContextView 所在节点

    @property(Label)
    rankTitleLabel: Label = null; // 排行榜标题

    @property(Node)
    emptyTipNode: Node = null; // 空数据提示节点

  //  private wx: any = window.wx;
   private wx: any = null;
    private openDataContext: any = null;

    @property(SubContextView)
    ndSubContextView: SubContextView  = null;

    start() {

    }

    update(deltaTime: number) {

    }

    onLoad() {
        // 初始化微信排行榜
        this.initWechatRank();
    }

    /**
     * 初始化微信排行榜
     */
    private initWechatRank() {
        // 检查是否为微信渠道
        if (!CM.isPlatform(CM.CH_WEIXIN)) {
            console.log('当前不是微信渠道，跳过排行榜初始化');
            return;
        }

        // 检查微信环境是否可用
        if (!this.wx) {
            console.error('微信环境不可用');
            this.showEmptyTip();
            return;
        }

        // 初始化微信开放数据域实例
        this.openDataContext = this.wx.getOpenDataContext();
        if (!this.openDataContext) {
            console.error('微信开放数据域初始化失败');
            this.showEmptyTip();
            return;
        }

        // 默认隐藏排行榜
        if (this.rankSubView) {
            this.rankSubView.active = false;
        }

        // 设置排行榜标题
        if (this.rankTitleLabel) {
            this.rankTitleLabel.string = '好友排行榜';
        }

        console.log('微信排行榜初始化成功');
    }

    /**
     * 显示排行榜
     */
    showFriendRank() {
        // 检查是否为微信渠道
        if (!CM.isPlatform(CM.CH_WEIXIN)) {
            console.log('当前不是微信渠道，无法显示排行榜');
            return;
        }

        // 检查微信环境是否可用
        if (!this.wx || !this.openDataContext) {
            console.error('微信环境或开放数据域不可用');
            this.showEmptyTip();
            return;
        }

        // 1. 上传当前用户分数
        this.uploadScore();

        // 2. 显示 SubContextView 节点
        if (this.rankSubView) {
            this.rankSubView.active = true;
        }

        // 3. 通知开放域拉取并渲染排行榜
        this.openDataContext.postMessage({
            type: 'showFriendRank',
            key: 'game_score'
        });

        console.log('显示微信排行榜');
    }

    /**
     * 上传分数到微信云托管
     */
    private uploadScore() {
        if (!this.wx) {
            console.error('微信环境不可用，无法上传分数');
            return;
        }

        // 获取当前关卡数作为分数
        const currentLevel = LevelConfig.getCurLevel() || 1;
        
        this.wx.setUserCloudStorage({
            KVDataList: [{
                key: 'game_score',
                value: currentLevel.toString() // 必须为字符串
            }],
            success: () => {
                console.log('微信分数上传成功：', currentLevel);
            },
            fail: (err) => {
                console.error('微信分数上传失败：', err);
            }
        });
    }

    /**
     * 显示空数据提示
     */
    private showEmptyTip() {
        if (this.emptyTipNode) {
            this.emptyTipNode.active = true;
        }
    }

    /**
     * 隐藏排行榜
     */
    hideFriendRank() {
        if (this.rankSubView) {
            this.rankSubView.active = false;
        }
        if (this.emptyTipNode) {
            this.emptyTipNode.active = false;
        }
    }

    /**
     * 刷新排行榜数据
     */
    refreshFriendRank() {
        if (!this.wx || !this.openDataContext) {
            console.error('微信环境或开放数据域不可用');
            return;
        }

        // 重新上传分数
        this.uploadScore();

        // 通知开放域刷新排行榜
        this.openDataContext.postMessage({
            type: 'refreshFriendRank',
            key: 'game_score'
        });

        console.log('刷新微信排行榜');
    }

    /**
     * 清除排行榜数据
     */
    clearFriendRank() {
        if (!this.wx || !this.openDataContext) {
            console.error('微信环境或开放数据域不可用');
            return;
        }

        // 通知开放域清除排行榜
        this.openDataContext.postMessage({
            type: 'clearFriendRank'
        });

        console.log('清除微信排行榜数据');
    }
}