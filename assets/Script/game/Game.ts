import { _decorator, Node, v3, UITransform, instantiate, Vec3, tween, Prefab, Vec2, Sprite, ParticleSystem2D, Quat } from 'cc';
// 如果 enumConst.ts 已改名或迁移，请根据实际路径调整
// 例如：'../../const/EnumConst' 或 '../../const/Enum'
//import { Advertise } from '../../wx/advertise';//广告
import { gridCmpt } from './item/gridCmpt';
import { rocketCmpt } from './item/rocketCmpt';
import { BaseNodeCom } from './BaseNode';
import { gridManagerCmpt } from './Manager/gridManagerCmpt';
import { ToolsHelper } from '../Tools/toolsHelper';
import { App } from '../Controller/app';
import { CocosHelper } from '../Tools/cocosHelper';
import { LevelConfig } from '../Tools/levelConfig';
import { EventName } from '../Tools/eventName';
import { Bomb, Constant, LevelData, PageIndex } from '../Tools/enumConst';
import AudioManager from '../Common/AudioManager';
import EventManager from '../Common/view/EventManager';
import GameData from '../Common/GameData';
import LoaderManeger from '../sysloader/LoaderManeger';
import ViewManager from '../Common/view/ViewManager';
import { DownGridManager } from './Manager/DownGridManager';
import { ParticleManager } from './Manager/ParticleManager';
import { MoveManager } from './Manager/MoveManager';
import { gridDownCmpt } from './item/gridDownCmpt';

const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends BaseNodeCom {
    /** UI引用：网格管理器组件 */
    private gridMgr: gridManagerCmpt = null;
    /** UI引用：下落方块管理器组件 */
    private DownGridMgr: DownGridManager = null;
    /** UI引用：特效管理器 */
    private particleManager: ParticleManager = null;
    
    /** UI引用：网格容器节点 */
    private gridNode: Node = null;
    /** UI引用：特效容器节点 */
    private effNode: Node = null;
    /** UI引用：目标显示节点1（适用于2个及以下目标） */
    private target1: Node = null;
    /** UI引用：目标显示节点2（适用于3个及以上目标） */
    private target2: Node = null;
    /** UI引用：目标背景节点 */
    private targetBg: Node = null;
    /** UI引用：步数显示节点 */
    private lbStep: Node = null;
    /** UI引用：进度条显示节点 */
    private spPro: Node = null;
    /** UI引用：星级显示节点 */
    private star: Node = null;
    /** UI引用：道具1数量显示节点 */
    private lbTool1: Node = null;
    /** UI引用：道具2数量显示节点 */
    private lbTool2: Node = null;
    /** UI引用：道具3数量显示节点 */
    private lbTool3: Node = null;
    /** UI引用：道具4数量显示节点 */
    private lbTool4: Node = null;
    /** UI引用：道具1添加按钮 */
    private addBtn1: Node = null;
    /** UI引用：道具2添加按钮 */
    private addBtn2: Node = null;
    /** UI引用：道具3添加按钮 */
    private addBtn3: Node = null;
    /** UI引用：道具4添加按钮 */
    private addBtn4: Node = null;
    /** UI引用：道具1视频按钮 */
    private video1: Node = null;
    /** UI引用：道具2视频按钮 */
    private video2: Node = null;
    /** UI引用：道具3视频按钮 */
    private video3: Node = null;
    /** UI引用：道具4视频按钮 */
    private video4: Node = null;
    /** 预制体引用：网格方块预制体 */
    private gridPre: Prefab = null;    
    /** 预制体引用：火箭特效预制体 */
    private rocketPre: Prefab = null;
    /** 游戏网格：二维数组存储所有方块节点 */
    private blockArr: Node[][] = []
    /** 网格位置：二维数组存储所有方块的目标位置 */
    private blockPosArr: Vec3[][] = [];
    /** 隐藏列表：存储需要隐藏的网格位置 */
    private hideList = [];
    /** 网格行列数 */
    private H: number = Constant.layCount;
    /** 网格列数 */
    private V: number = Constant.layCount;
    /** 游戏状态：是否开始触摸 */
    private isStartTouch: boolean = false;
    /** 当前选中的两个方块 */
    private curTwo: gridCmpt[] = [];
    /** 游戏状态：是否开始交换方块 */
    private isStartChange: boolean = false;
    /** 游戏数据：关卡配置数据 */
    private data: LevelData = null;
    /** 游戏数据：目标消除数量数组 */
    private AchievetheGoal: any[] = [];
    /** 游戏数据：当前得分 */
    private curScore: number = 0; 
    /** 游戏状态：是否胜利 */
    private isWin: boolean = false;
    /** 奖励炸弹数据：存储生成的炸弹类型和数量 */
    private rewardBombs: {type: number, count: number}[] = [];
    /** 火箭对象池 */
    private rocketPool: Node[] = [];
    /** 火箭池容量 */
    private rocketPoolCapacity: number = 20;
    onLoad() {
        for (let i = 1; i < 5; i++) {
            this[`onClick_addBtn${i}`] = this.onClickAddButton.bind(this);
            this[`onClick_toolBtn${i}`] = this.onClickToolButton.bind(this);
            this[`onClick_video${i}`] = this.onClickVideoButton.bind(this);
        }
        super.onLoad();
        AudioManager.getInstance().playMusic('background1', true);

        this.gridMgr = this.viewList.get('center/gridManager').getComponent(gridManagerCmpt);
        this.DownGridMgr = this.viewList.get('center/DownGridManager').getComponent(DownGridManager);
        this.particleManager = this.viewList.get('center/ParticleManager').getComponent(ParticleManager);
        
        this.gridNode = this.viewList.get('center/gridNode');
        this.effNode = this.viewList.get('center/ParticleManager');
        this.targetBg = this.viewList.get('top/content/targetBg');
        this.target1 = this.viewList.get('top/target1');
        this.target2 = this.viewList.get('top/target2');
        this.lbStep = this.viewList.get('top/lbStep');
        this.spPro = this.viewList.get('top/probg/spPro');
        this.star = this.viewList.get('top/star');
        this.lbTool1 = this.viewList.get('bottom/proppenal/tool1/prompt/lbTool1');
        this.lbTool2 = this.viewList.get('bottom/proppenal/tool2/prompt/lbTool2');
        this.lbTool3 = this.viewList.get('bottom/proppenal/tool3/prompt/lbTool3');
        this.lbTool4 = this.viewList.get('bottom/proppenal/tool4/prompt/lbTool4');
        this.addBtn1 = this.viewList.get('bottom/proppenal/tool1/addBtn1');
        this.addBtn2 = this.viewList.get('bottom/proppenal/tool2/addBtn2');
        this.addBtn3 = this.viewList.get('bottom/proppenal/tool3/addBtn3');
        this.addBtn4 = this.viewList.get('bottom/proppenal/tool4/addBtn4');
        this.video1 = this.viewList.get('bottom/proppenal/tool1/video1');
        this.video2 = this.viewList.get('bottom/proppenal/tool2/video2');
        this.video3 = this.viewList.get('bottom/proppenal/tool3/video3');
        this.video4 = this.viewList.get('bottom/proppenal/tool4/video4');
        this.scheduleOnce(() => {
            this.handleTimePro();
        }, 3);
        LevelConfig.setCurLevel(1);
        this.loadExtraData(LevelConfig.getCurLevel());
        this.addEvents();
        this.startDownGrid();


/////////////////////////////

    }
    /** 开始下落 */
    async startDownGrid() {
        // 初始化DownCubeManager
        try {
            await this.DownGridMgr.createGrid();
            if (!this.DownGridMgr['gridDownPre']) {
                return;
            }
            this.DownGridMgr.clearAllGrids();

            // 配置参数
            this.DownGridMgr.totalGridCount = 1000;
            this.DownGridMgr.fallSpeed = 20;

            // 开始生成
            this.DownGridMgr.startGenerate();
              
              // 动态调整参数
            //   setTimeout(() => {
            //       this.DownGridMgr.setFallSpeed(200); // 加快下落速度           
            //   }, 3000);
              
            //   // 暂停下落
            //   setTimeout(() => {
            //       this.DownGridMgr.pauseFall(); // 暂停所有grid的下落
            //   }, 15000);
              
            //   // 继续下落
            //   setTimeout(() => {
            //       this.DownGridMgr.resumeFall(); // 继续所有grid的下落
            //   }, 20000);
              
            //   // 停止生成
            //   setTimeout(() => {
            //       this.DownGridMgr.stopGenerate();
            //   }, 30000);
        } catch (error) {
            console.error("初始化DownCubeManager失败:", error);
        }
      
      
    }

    addEvents() {
       // super.addEvents();
         console.log("步数不足");
 
        EventManager.on(EventName.Game.TouchStart, this.evtTouchStart, this);
        EventManager.on(EventName.Game.TouchMove, this.evtTouchMove, this);
        EventManager.on(EventName.Game.TouchEnd, this.evtTouchEnd, this);
        EventManager.on(EventName.Game.ContinueGame, this.evtContinueGame, this);
        EventManager.on(EventName.Game.Restart, this.evtRestart, this);

        /** 接收奖励消息 */
        EventManager.on(EventName.Game.SendReward, this.handleRewardAnim, this);
        /** 接收游戏失败消息 */
        EventManager.on(EventName.Game.GameOver, this.evtGameOver, this);
    }

    /** 初始化 */
    async loadExtraData(lv: number) {
        // Advertise.showInterstitialAds();
        this.data = await LevelConfig.getLevelData(lv);
        App.gameCtr.blockCount = this.data.blockCount;
        this.setLevelInfo();
        if (!this.gridPre) {
            this.gridPre = await LoaderManeger.instance.loadPrefab('prefab/pieces/grid');
            this.rocketPre = await LoaderManeger.instance.loadPrefab('prefab/pieces/rocket');
             await this.initLayout();
        }
        this.isWin = false;
    }
    /*********************************************  UI information *********************************************/
    /*********************************************  UI information *********************************************/
    /*********************************************  UI information *********************************************/

    /** 倒计时时间：用于控制提示显示的倒计时 */
    private downTime: number = 1;
    /** 提示计时器索引：用于清除提示计时器 */
    private intervalTipsIndex: number = 0;
    /** 玩家5秒不操作就给提示 */
    handleTimePro() {
        this.schedule(() => {
            this.downTime -= 0.1;
            if (this.downTime > -0.01 && this.downTime < 0.01) {
                this.intervalTipsIndex = setInterval(() => {
                    if (!this.isValid) return;
                    this.onClick_tipsBtn();
                }, 5000);
            }
        }, 0.06);
    }

    resetTimeInterval() {
        clearInterval(this.intervalTipsIndex);
        this.downTime = 1;
    }
    getTimeInterval() {
        return this.downTime;
    }

    /** 设置关卡信息 */
    setLevelInfo() {
        let data = this.data;
        let idArr = data.mapData[0].m_id;
        this.AchievetheGoal = [];
        for (let i = 0; i < idArr.length; i++) {
            let count = LevelConfig.getLevelTargetCount(data.mapData, i);
            let temp = [idArr[i], count];
            this.AchievetheGoal.push(temp);
        }
        console.log("this.AchievetheGoal",this.AchievetheGoal)
    
        this.updateTargetCount();
        this.updateToolsInfo();
    }
    /** 道具信息 */
    updateToolsInfo() {
        let bombCount = GameData.loadData(GameData.BombHor, 0);
        let horCount = GameData.loadData(GameData.BombVer, 0);
        let verCount = GameData.loadData(GameData.BombBomb, 0);
        let allCount = GameData.loadData(GameData.BombAllSame, 0);
        CocosHelper.updateLabelText(this.lbTool1, bombCount);
        CocosHelper.updateLabelText(this.lbTool2, horCount);
        CocosHelper.updateLabelText(this.lbTool3, verCount);
        CocosHelper.updateLabelText(this.lbTool4, allCount);
        this.addBtn1.active = bombCount <= 0;
        this.addBtn2.active = horCount <= 0;
        this.addBtn3.active = verCount <= 0;
        this.addBtn4.active = allCount <= 0;
        this.video1.active = false;// bombCount <= 0;
        this.video2.active = false;// horCount <= 0;
        this.video3.active = false;// verCount <= 0;
        this.video4.active = false;// allCount <= 0;
    }

    /** 更新消除目标数量 */
    updateTargetCount() {
        let arr = this.AchievetheGoal;
        this.target1.active = arr.length <= 2;
        this.target2.active = arr.length > 2;
        let target = arr.length <= 2 ? this.target1 : this.target2;
        target.children.forEach((item, idx) => {
            item.active = idx < arr.length;
            if (idx < arr.length) {
                item.getComponent(gridCmpt).setType(arr[idx][0]);
                item.getComponent(gridCmpt).setCount(arr[idx][1]);
            }
        });
        this.checkResult();
    }

    /** 结束检测 */
    checkResult() {
        if (this.isWin) return;
        let count = 0;
        for (let i = 0; i < this.AchievetheGoal.length; i++) {
            if (this.AchievetheGoal[i][1] == 0) {
                count++;
            }
        }
        //达成游戏目标，胜利
        if (count == this.AchievetheGoal.length) {
            this.isWin = true;
            this.DownGridMgr.pauseFall();
            this.getRewardBombs();
            LoaderManeger.instance.loadPrefab('prefab/ui/resultView').then((prefab) => {
                let resultNode = instantiate(prefab);
                ViewManager.show({
                    node: resultNode,
                    name: "ResultView",
                    data: { level: LevelConfig.getCurLevel(), isWin: true, rewardBombs: this.rewardBombs }
                });
            });
        }

    }

    getRewardBombs() {
        // 清空之前的奖励炸弹数据
        this.rewardBombs = [];
        for (let i = 0; i < this.data.RewardCount; i++) {
            // 生成随机炸弹类型 (8-11对应Bomb枚举的四种炸弹类型)
            let bombType = Math.floor(Math.random() * 4) + 8;
            // 保存炸弹类型和数量
            const existingBomb = this.rewardBombs.find(b => b.type === bombType);
            if (existingBomb) {
                existingBomb.count++;
            } else {
                this.rewardBombs.push({ type: bombType, count: 1 });
            }
        }
    }

    /** 过关，处理奖励炸弹 */
    async handleRewardAnim() {
        this.DownGridMgr.resumeFall();
        this.loadExtraData(LevelConfig.nextLevel());
        for (let i = 0; i < this.rewardBombs.length; i++) {
            let bomb = this.rewardBombs[i];
            for (let j = 0; j < bomb.count; j++) {
                await ToolsHelper.delayTime(0.1);
                this.throwTools(bomb.type);
            }
        }

        await ToolsHelper.delayTime(1);
        this.checkAllBomb();

    }

    /** 检测网格中是否还有炸弹 */
    async checkAllBomb() {
        if (!this.isValid) return;
        let isHaveBomb: boolean = false;
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let item = this.blockArr[i][j];
                if (item && this.isBomb(item.getComponent(gridCmpt))) {
                    isHaveBomb = true;
                    this.handleBomb(item.getComponent(gridCmpt), true);
                }
            }
        }
        await ToolsHelper.delayTime(1);
        if (!isHaveBomb) {
            console.log("没有炸弹了，一切都结束了")

        }

    }

    throwTools(bombType: number = -1, worldPosition: Vec3 = null) {
        AudioManager.getInstance().playSound("prop_missle")
        let originPos = worldPosition || this.lbStep.worldPosition;
        let p1 = this.effNode.getComponent(UITransform).convertToNodeSpaceAR(originPos);
        
        // 使用ParticleManager播放特效，替代原有的粒子池逻辑
        // 参数说明：
        // 'gameParticle' - 特效标识（与预加载时的key对应）
        // p1 - 播放位置
        // Quat.IDENTITY - 播放旋转（默认无旋转）
        // this.effNode - 父节点（特效容器）
        // 1 - 生命周期（秒），与原动画时长一致
        const particle = this.particleManager.playParticle('particle', p1, Quat.IDENTITY, null);
        
        let item: gridCmpt = this.getRandomBlock();
        if (item) {
            let p2 = this.effNode.getComponent(UITransform).convertToNodeSpaceAR(item.node.worldPosition);
            this.resetTimeInterval();
            tween(particle).to(1, { position: p2 }).call(() => {
                // 特效播放完成后，手动回收特效
                if (particle && particle.parent) {
                    this.particleManager.releaseParticle('particle', particle);
                }
                let rand = bombType == -1 ? Math.floor(Math.random() * 3) + 8 : bombType;
                item && item.setType(rand);
            }).start();
        } else {
            // 如果没有找到合适的方块，1秒后回收特效
            this.particleManager.ParticleWithTimer('particle', particle);
        }
    }

    getRandomBlock(maxAttempts: number = 100) {
        // 随机尝试一定次数
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            let h = Math.floor(Math.random() * this.H);
            let v = Math.floor(Math.random() * this.V);
            if (this.blockArr[h][v] && this.blockArr[h][v].getComponent(gridCmpt).type < 7) {
                return this.blockArr[h][v].getComponent(gridCmpt);
            }
        }
        
        // 如果随机尝试失败，遍历整个网格寻找合适的方块
        for (let h = 0; h < this.H; h++) {
            for (let v = 0; v < this.V; v++) {
                if (this.blockArr[h][v] && this.blockArr[h][v].getComponent(gridCmpt).type < 7) {
                    return this.blockArr[h][v].getComponent(gridCmpt);
                }
            }
        }
        
        // 如果没有找到合适的方块，返回null
        return null;
    }

    evtContinueGame() {
        // this.stepCount += 5;
        this.isStartChange = false;
        this.isStartTouch = false;
        // this.updateStep();
        this.updateToolsInfo();
        
        // 恢复水果下落
        if (this.DownGridMgr) {
            this.DownGridMgr.resumeFall();
        }
    }
    
    /** 处理游戏失败事件 */
    evtGameOver() {
        console.log("Game over: Handling game failure");
        this.isWin = false;
        this.DownGridMgr.pauseFall();
        this.getRewardBombs();
        // 加载并显示结果界面
        LoaderManeger.instance.loadPrefab('prefab/ui/resultView').then((prefab) => {
            let resultNode = instantiate(prefab);
            ViewManager.show({
                node: resultNode,
                name: "ResultView",
                data: { level: LevelConfig.getCurLevel(), isWin: false ,rewardBombs:this.rewardBombs}
            });
        });
    }

    /*********************************************  gameLogic *********************************************/
    /*********************************************  gameLogic *********************************************/
    /*********************************************  gameLogic *********************************************/
    /** 触控事件（开始） */
    async evtTouchStart(p: Vec2) {
        console.log(this.isStartTouch, this.isStartChange)
        if (this.getTimeInterval() > 0) 
            return;
        this.handleProtected();
        if (this.isStartChange) return;
        if (this.isStartTouch) return;
        // if (this.stepCount <= 0) {
        //     ViewManager.toast("步数不足");
        //     // App.view.openView(ViewName.Single.eResultView, this.level, false);
        //     LoaderManeger.instance.loadPrefab('prefab/ui/resultView').then((prefab) => {
        //         let resultNode = instantiate(prefab);
        //         ViewManager.show({
        //             node: resultNode,
        //             name: "ResultView",
        //             data: { level: this.level, isWin: false }
        //         });
        //     });
        //     return;
        // }
        let pos = this.gridNode.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(p.x, p.y, 1));
        let bc = this.checkClickOnBlock(pos);
        this.curTwo = [];
        if (bc) {
            bc.setSelected(true);
            this.curTwo.push(bc);
            console.log(bc.data);
            this.isStartTouch = true;
        }
        // await this.checkMoveDown();
    }
    /** 触控事件（滑动） */
    evtTouchMove(p: Vec2) {
        if (this.isStartChange) return;
        if (!this.isStartTouch) return;
        let pos = this.gridNode.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(p.x, p.y, 1));
        let bc = this.checkClickOnBlock(pos);
        if (bc && App.gameCtr.isNeighbor(bc, this.curTwo[0])) {
            bc.setSelected(true);
            this.curTwo.push(bc);
            this.isStartChange = true;
            this.startChangeCurTwoPos();
        }
    }
    /** 触控事件（结束 ） */
    async evtTouchEnd(p: Vec2) {
        if (this.isStartChange) return;
        if (!this.isStartTouch) return;
        let pos = this.gridNode.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(p.x, p.y, 1));
        let bc = this.checkClickOnBlock(pos);
        /** 点到炸弹 */
        if (bc && (this.isBomb(bc)) && this.curTwo.length == 1) {
            await this.handleBomb(bc);
        }
        this.isStartTouch = false;
        this.isStartChange = false;
        this.resetSelected();
    }

    /** 保护状态：防止玩家快速操作的保护标记 */
    private isRecording: boolean = false;
    /** 这里做一层保护措施，以防玩家预料之外的骚操作引起的游戏中断 */
    handleProtected() {
        if ((this.isStartChange || this.isStartTouch) && !this.isRecording) {
            this.isRecording = true;
            this.scheduleOnce(() => {
                if (this.isValid) {
                    this.isRecording = false;
                    this.isStartChange = false;
                    this.isStartTouch = false;
                }
            }, 5)
        }
    }
    /** 是否是炸弹 */
    isBomb(bc: gridCmpt) {
        return bc.type >= 8 && bc.type <= 11
    }

    /** 是否是炸弹 */
    async handleBomb(bc: gridCmpt, isResult: boolean = false) {
        if (this.isBomb(bc)) {
            let bombList = [];
            let list2 = [];
            let list: gridCmpt[] = await this.getBombList(bc);
            bombList.push(list);
            for (let i = 0; i < list.length; i++) {
                if (list[i].h == bc.h && list[i].v == bc.v) continue;
                if (this.isBomb(list[i])) {
                    bombList.push(await this.getBombList(list[i]));
                }
            }
            let func = (pc: gridCmpt) => {
                for (let i = 0; i < list2.length; i++) {
                    if (list2[i].h == pc.h && list2[i].v == pc.v) {
                        return true;
                    }
                }
                return false;
            }
            for (let i = 0; i < bombList.length; i++) {
                for (let j = 0; j < bombList[i].length; j++) {
                    let item = bombList[i][j];
                    if (!func(item)) {
                        list2.push(item);
                    }
                }
            }

            await this.handleSamelistBomb(list2);
            await this.checkAgain(isResult);
            return true;
        }
        return false;
    }

    /** 获取炸弹炸掉的糖果列表 */
    async getBombList(bc: gridCmpt): Promise<gridCmpt[]> {
        let list: gridCmpt[] = [];
        switch (bc.type) {
            case Bomb.hor:
                for (let i = 0; i < this.H; i++) {
                    let item = this.blockArr[i][bc.v];
                    if (item) {
                        list.push(item.getComponent(gridCmpt));
                    }
                }
                AudioManager.getInstance().playSound("prop_line")
                // let rocket1 = instantiate(this.rocketPre);
                let rocket1 = this.getRocketFromPool();
                this.effNode.addChild(rocket1);
                rocket1.setPosition(bc.node.position);
                rocket1.getComponent(rocketCmpt).initData(bc.type);
                break;
            case Bomb.ver:
                for (let i = 0; i < this.V; i++) {
                    let item = this.blockArr[bc.h][i];
                    if (item) {
                        list.push(item.getComponent(gridCmpt));
                    }
                }
                AudioManager.getInstance().playSound("prop_line")
                // let rocket = instantiate(this.rocketPre);
                let rocket = this.getRocketFromPool();
                this.effNode.addChild(rocket);
                rocket.setPosition(bc.node.position);
                rocket.getComponent(rocketCmpt).initData(bc.type);
                break;
            case Bomb.bomb:
                for (let i = bc.h - 2; i < bc.h + 2 && i < this.V; i++) {
                    for (let j = bc.v - 2; j < bc.v + 2 && j < this.V; j++) {
                        if (i < 0 || j < 0) continue;
                        let item = this.blockArr[i][j];
                        if (item) {
                            list.push(item.getComponent(gridCmpt));
                        }
                    }
                }
                AudioManager.getInstance().playSound("prop_bomb")
                break;
            case Bomb.allSame:
                let curType: number = -1;
                for (let i = 0; i < this.curTwo.length; i++) {
                    if (this.curTwo[i].type != bc.type && this.curTwo[i].type < Constant.NormalType) {
                        curType = this.curTwo[i].type;
                    }
                }
                if (curType < 0) {//炸弹四周随机找一个
                    for (let i = bc.h - 1; i < bc.h + 1 && i < this.V; i++) {
                        for (let j = bc.v - 1; j < bc.v + 1 && j < this.V; j++) {
                            if (i < 0 || j < 0) continue;
                            let item = this.blockArr[i][j];
                            if (item && curType < 0 && item.getComponent(gridCmpt).type < Constant.NormalType) {
                                curType = item.getComponent(gridCmpt).type;
                                break;
                            }
                        }
                    }
                }
                let node = bc.node.getChildByName('icon').getChildByName('Match11');
                node.getComponent(Sprite).enabled = false;
                node.getChildByName('a').active = true;
                if (curType < 0) curType = Math.floor(Math.random() * App.gameCtr.blockCount);
                AudioManager.getInstance().playSound("prop_missle")
                for (let i = 0; i < this.H; i++) {
                    for (let j = 0; j < this.V; j++) {
                        let item = this.blockArr[i][j];
                        if (item && item.getComponent(gridCmpt).type == curType) {
                            list.push(item.getComponent(gridCmpt));
                            // let particle = instantiate(this.particlePre);
                       let particle = this.particleManager.playParticle('particle', bc.node.position);
                            particle.children.forEach(item => {
                                item.active = item.name == "move";
                                item.getComponent(ParticleSystem2D).resetSystem();
                            });

                            this.resetTimeInterval();
                            tween(particle).to(0.5, { position: item.position }).call(async (particle: Node) => {
                                // 特效播放完成后，手动回收特效
                                if (particle && particle.parent) {
                                    this.particleManager.releaseParticle('particle', particle);
                                }
                            }).start();
                        }
                    }
                }
                list.push(bc);
                await ToolsHelper.delayTime(0.7);
                break;
        }
        return list;
    }

    /** 选中状态还原 */
    resetSelected() {
        if (!this.isValid) {
            return;
        }
        this.curTwo.forEach(item => {
            if (item) {
                item.setSelected(false);
            }
        })
    }

    /** 开始交换连个选中的方块 */
    async startChangeCurTwoPos(isBack: boolean = false) {
        let time = Constant.changeTime;
        let one = this.curTwo[0], two = this.curTwo[1];
        if (!isBack) {
            AudioManager.getInstance().playSound("ui_banner_down_show")
        }
        else {
            AudioManager.getInstance().playSound("ui_banner_up_hide")
        }
        if (!one || !two) return;
        tween(one.node).to(time, { position: this.blockPosArr[two.h][two.v] }).start();
        tween(two.node).to(time, { position: this.blockPosArr[one.h][one.v] }).call(async () => {
            if (!isBack) {
                this.changeData(one, two);
                let isbomb1 = await this.handleBomb(one);
                let isbomb2 = await this.handleBomb(two);
                let bool = await this.startCheckThree((bl) => {
                    // if (bl) {
                    //     this.stepCount--;
                    //     this.updateStep();
                    // }
                });
                if (bool || (isbomb1 || isbomb2)) {
                    this.checkAgain()
                }
                else {
                    console.log(this.curTwo);
                    this.startChangeCurTwoPos(true);
                }
            }
            else {
                this.changeData(one, two);
                this.isStartChange = false;
                this.isStartTouch = false;
                this.resetSelected();
            }
        }).start();
    }

    /**
     * 是否已经加入到列表中了
     */
    private checkExist(item: gridCmpt, samelist: any[]) {
        for (let i = 0; i < samelist.length; i++) {
            for (let j = 0; j < samelist[i].length; j++) {
                let ele: gridCmpt = samelist[i][j];
                if (ele.data.h == item.data.h && ele.data.v == item.data.v) {
                    return true;
                }
            }
        }
        return false;
    }
    /** 反复检查 */
    async checkAgain(isResult: boolean = false) {
        let bool = await this.startCheckThree();
        if (bool) {
            this.checkAgain(isResult);
        }
        else {
            this.resetSelected();
            this.isStartChange = false;
            this.isStartTouch = false;
            if (isResult) {
                console.log(isResult);
                this.checkAllBomb();
            }
        }
    }
    /**
     * 开始检测是否有满足消除条件的存在
     * @returns bool
     */
    async startCheckThree(cb: Function = null): Promise<boolean> {
        return new Promise(async resolve => {
            let samelist = [];
            for (let i = 0; i < this.H; i++) {
                for (let j = 0; j < this.V; j++) {
                    if (!this.isValid) {
                        resolve(false);
                        return;
                    }
                    let item = this.blockArr[i][j];
                    if (!item || item.getComponent(gridCmpt).getMoveState()) continue;
                    if (this.checkExist(item.getComponent(gridCmpt), samelist)) continue;
                    let hor: gridCmpt[] = this._checkHorizontal(item.getComponent(gridCmpt));
                    let ver: gridCmpt[] = this._checkVertical(item.getComponent(gridCmpt));
                    if (hor.length >= 3 && ver.length >= 3) {
                        hor = hor.slice(1, hor.length);//将自己去掉一个（重复）
                        hor = hor.concat(ver);
                        samelist.push(hor);
                    }
                }
            }
            for (let i = 0; i < this.H; i++) {
                for (let j = 0; j < this.V; j++) {
                    let item = this.blockArr[i][j];
                    if (!item || item.getComponent(gridCmpt).getMoveState()) continue;
                    if (this.checkExist(item.getComponent(gridCmpt), samelist)) continue;
                    let hor: gridCmpt[] = this._checkHorizontal(item.getComponent(gridCmpt));
                    let ver: gridCmpt[] = this._checkVertical(item.getComponent(gridCmpt));
                    if (hor.length >= 3) {
                        samelist.push(hor);
                    }
                    else if (ver.length >= 3) {
                        samelist.push(ver);
                    }
                }
            }
            cb && cb(!!samelist.length);
            await this.handleSamelist(samelist);
            let bool = !!samelist.length;
            resolve(bool);
        })
    }

    /**
     * 结果列表，进一步判断每一组元素是否合法
     * @param samelist [Element[]]
     * @returns 
     */
    private async handleSamelist(samelist: any[]) {
        return new Promise(async resolve => {
            if (samelist.length < 1) {
                resolve("");
                return;
            }
            this._deleteDuplicates(samelist);
            //0:去掉不合法的
            samelist = this.jugetLegitimate(samelist);
            let soundList = ['combo_cool', 'combo_excellent', 'combo_good', 'combo_great', 'combo_perfect'];
            let rand = Math.floor(Math.random() * soundList.length);
            //1:移除
            for (let i = 0; i < samelist.length; i++) {
                let item = samelist[i];
                if (item.length < 3) continue;
                if (item.length > 3) {
                    this.synthesisBomb(item);
                    continue;
                }
                if (item.length > 3) {
                    AudioManager.getInstance().playSound(soundList[rand])
                } else {
                    AudioManager.getInstance().playSound('combo');
                }

                for (let j = 0; j < item.length; j++) {
                    let ele: gridCmpt = item[j];
                    /** 在这里检测糖果四周的障碍物 */
                    let listAround = this.getAroundGrid(ele)
                    let obstacleList = this.getObstacleList(listAround);
                    if (obstacleList.length > 0) {
                        for (let m = 0; m < obstacleList.length; m++) {
                            this.destroyGridAndGetScore(obstacleList[m].getComponent(gridCmpt));
                        }
                    }
                    this.destroyGridAndGetScore(ele);
    
                }
            }
            await ToolsHelper.delayTime(0.2);
            await this.checkMoveDown();
            resolve("");
        });
    }

    /** 消除并获得积分 */
    destroyGridAndGetScore(ele: gridCmpt) {
   
        let particle = this.particleManager.playParticle('particle', this.blockPosArr[ele.h][ele.v]);
        particle.children.forEach(item => {
            item.active = +item.name == ele.type;
            item.getComponent(ParticleSystem2D).resetSystem();
        })
        // 粒子特效播放完成后回收
        this.particleManager.ParticleWithTimer('particle', particle);

        // 查找上面的水果方块能找到没有被锁定 同类型的水果方块
        let node2 = this.DownGridMgr.getFrontGridByType(ele.type);
        if (node2) {
            //每消除一个grid都会向上面飞一个子弹 击中上面移动下来的gridDown
            let bulletParticle = this.particleManager.playParticle('bulletParticle', this.blockPosArr[ele.h][ele.v]);
            // particle.children.forEach(item => {
            //     item.active = +item.name == ele.type;
            //     item.getComponent(ParticleSystem2D).resetSystem();
            // })

            MoveManager.getInstance().moveToTargetWithBezier(bulletParticle, node2, 1, () => {
                // 子弹击中目标，回收目标节点
                if (node2) {
                    // 检查目标节点是否还有父节点（确保它还存在）
                    if (node2.parent) {
                        //子弹击中目标粒子
                        let particle = this.particleManager.playParticle('particle', node2.getPosition());
                        let ttype = node2.getComponent(gridDownCmpt);
                        particle.children.forEach(item => {
                            item.active = +item.name == ttype.type;
                            item.getComponent(ParticleSystem2D).resetSystem();
                        })
                        // 粒子特效播放完成后回收
                        this.particleManager.ParticleWithTimer('particle', particle);
                        // 回收目标节点
                        this.DownGridMgr.recycleGridByNode(node2);
                        console.log("Target node recycled");
                    }
                }
                // 子弹粒子指定回收（用户要求的显式回收）
                this.particleManager.releaseParticle('bulletParticle', bulletParticle);
            });
        }
        
  
        //飞需要果子
        let tp = ele.type;
        let worldPosition = ele.node.worldPosition
        this.flyItem(tp, worldPosition);
       // this.addScoreByType(tp);
        
        this.blockArr[ele.h][ele.v] = null;
        ele.node.destroy();
        
    }

    /** 获取障碍物列表 */
    getObstacleList(list: Node[]) {
        let obstacleList = [];
        for (let i = 0; i < list.length; i++) {
            let type = list[i].getComponent(gridCmpt).type;
            if (App.gameCtr.sideObstacleList.indexOf(type) > -1) {
                obstacleList.push(list[i]);
            }
        }
        return obstacleList;
    }

    /** 获取一颗糖果四周的糖果 */
    getAroundGrid(grid: gridCmpt) {
        if (grid.type > Constant.NormalType) return [];
        let h = grid.h;
        let v = grid.v;
        let left = h - 1;
        let right = h + 1;
        let up = v + 1;
        let down = v - 1;
        let list = [];
        if (left >= 0 && this.blockArr[left][v]) {
            list.push(this.blockArr[left][v]);
        }
        if (right < Constant.layCount && this.blockArr[right][v]) {
            list.push(this.blockArr[right][v]);
        }
        if (down >= 0 && this.blockArr[h][down]) {
            list.push(this.blockArr[h][down]);
        }
        if (up < Constant.layCount && this.blockArr[h][up]) {
            list.push(this.blockArr[h][up]);
        }
        return list;
    }

    /** 炸弹消除 */
    private async handleSamelistBomb(samelist: any[]) {
        return new Promise(async resolve => {
            if (samelist.length < 1) {
                resolve("");
                return;
            }
            let soundList = ['combo_cool', 'combo_excellent', 'combo_good', 'combo_great', 'combo_perfect'];
            let rand = Math.floor(Math.random() * soundList.length);
            this.scheduleOnce(() => {
                if (this.isValid) {
                    AudioManager.getInstance().playSound(soundList[rand])
                }
            }, 0.2);
            // 移除
            for (let i = 0; i < samelist.length; i++) {
                let ele: gridCmpt = samelist[i];
                if (!ele || !ele.node) continue;
                /** 在这里检测糖果四周的障碍物 */
                let listAround = this.getAroundGrid(ele)
                let obstacleList = this.getObstacleList(listAround);
                if (obstacleList.length > 0) {
                    for (let m = 0; m < obstacleList.length; m++) {
                        this.destroyGridAndGetScore(obstacleList[m].getComponent(gridCmpt));
                    }
                }
                this.destroyGridAndGetScore(ele);

            }

            await ToolsHelper.delayTime(0.2);
            await this.checkMoveDown();
            resolve("");
        });
    }
    /** 合成炸弹 */
    synthesisBomb(item: gridCmpt[]) {
        /** 先找当前item中是否包含curTwo,包含就以curTwo为中心合成 */
        let center: gridCmpt = null;
        for (let j = 0; j < item.length; j++) {
            for (let m = 0; m < this.curTwo.length; m++) {
                if (item[j].h == this.curTwo[m].h && item[j].v == this.curTwo[m].v) {
                    center = item[j];
                    break;
                }
            }
        }
        if (!center) {
            center = item[Math.floor(item.length / 2)];
        }
        let bombType = App.gameCtr.getBombType(item);
        AudioManager.getInstance().playSound("ui_banner_up_hide");
        for (let j = 0; j < item.length; j++) {
            let ele: gridCmpt = item[j];
            let tp = ele.type;
            let worldPosition = ele.node.worldPosition
            // this.flyItem(tp, worldPosition);
           // this.addScoreByType(tp);
            tween(ele.node).to(0.1, { position: this.blockPosArr[center.h][center.v] }).call((target) => {
                let gt = target.getComponent(gridCmpt);
                console.log(gt.h, gt.v)
                if (gt.h == center.h && gt.v == center.v) {
                    gt.setType(bombType);
                }
                else {
                    this.blockArr[gt.h][gt.v] = null;
                    gt.node.destroy();
                }
            }).start();

        }
    }
    /**
     * 去掉不合法的
     * @param samelist  [Element[]]
     */
    private jugetLegitimate(samelist: any[]) {
        let arr: any[] = [];
        for (let i = 0; i < samelist.length; i++) {
            let itemlist = samelist[i];
            let bool: boolean = this.startJuge(itemlist);
            if (bool) {
                arr.push(itemlist);
            }
        }
        return arr;
    }

    private startJuge(list: gridCmpt[]): boolean {
        let bool = false;
        let len = list.length;
        switch (len) {
            case 3:
                bool = this._atTheSameHorOrVer(list);
                break;

            case 4:
                bool = this._atTheSameHorOrVer(list);
                break;

            case 5:
                bool = this._atTheSameHorOrVer(list);
                if (!bool) {
                    bool = this._atLeastThreeSameHorAndVer(list);
                }
                break;

            case 6:
                bool = this._atLeastThreeSameHorAndVer(list);
                break;

            case 7:
                bool = this._atLeastThreeSameHorAndVer(list);
                break;

            default://全在行或者列
                bool = this._atLeastThreeSameHorAndVer(list);
                break;

        }
        return bool;
    }

    /**
     * 至少有三个同行且三个同列
     * @param list 
     * @returns 
     */
    private _atLeastThreeSameHorAndVer(list: gridCmpt[]): boolean {
        let bool = false;
        let count = 0;
        //同一列
        for (let i = 0; i < list.length; i++) {
            let item1 = list[i];
            for (let j = 0; j < list.length; j++) {
                let item2 = list[j];
                if (item1.data.h == item2.data.h) {
                    count++;
                    break;
                }
            }
        }
        if (count < 3) return bool;
        count = 0;
        //同一行
        for (let i = 0; i < list.length; i++) {
            let item1 = list[i];
            for (let j = 0; j < list.length; j++) {
                let item2 = list[j];
                if (item1.data.v == item2.data.v) {
                    count++;
                    break;
                }
            }
        }
        if (count < 3) return bool;
        return true;
    }

    /**
     * 处在同一行/或者同一列
     * @param list 
     * @returns 
     */
    private _atTheSameHorOrVer(list: gridCmpt[]): boolean {
        let item = list[0];
        let bool = true;
        //同一列
        for (let i = 0; i < list.length; i++) {
            if (item.data.h != list[i].data.h) {
                bool = false;
                break;
            }
        }
        if (bool) return bool;
        bool = true;
        //同一行
        for (let i = 0; i < list.length; i++) {
            if (item.data.v != list[i].data.v) {
                bool = false;
                break;
            }
        }
        return bool;
    }
    /**
     * 去重复
     */
    private _deleteDuplicates(samelist: any[]) {
        for (let i = 0; i < samelist.length; i++) {
            let itemlist = samelist[i];
            let bool = true;
            do {
                let count = 0;
                for (let m = 0; m < itemlist.length - 1; m++) {
                    for (let n = m + 1; n < itemlist.length; n++) {
                        if (itemlist[m].data.h == itemlist[n].data.h && itemlist[m].data.v == itemlist[n].data.v) {
                            samelist[i].splice(i, 1);
                            count++;
                            console.log('------------repeat----------');
                            break;
                        }
                    }
                }
                bool = count > 0 ? true : false;
            } while (bool);
        }
    }
    /**
     * 以当前滑块为中心沿水平方向检查
     * @param {gridCmpt} item 
     */
    private _checkHorizontal(item: gridCmpt): gridCmpt[] {
        let arr: gridCmpt[] = [item];
        let startX = item.data.h;
        let startY = item.data.v;
        // 右边
        for (let i = startX + 1; i < this.H; i++) {
            if (!this.blockArr[i][startY]) break;
            let ele = this.blockArr[i][startY].getComponent(gridCmpt);
            if (!ele || item.getMoveState()) break;
            if (ele.type == item.type && ele.type < Constant.NormalType) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        // 左边
        for (let i = startX - 1; i >= 0; i--) {
            if (i < 0) break;
            if (!this.blockArr[i][startY]) break;
            let ele = this.blockArr[i][startY].getComponent(gridCmpt);
            if (!ele || item.getMoveState()) break;
            if (ele.type == item.type && ele.type < Constant.NormalType) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        if (arr.length < 3) return [];
        return arr;
    }

    /**
     * 以当前滑块为中心沿竖直方向检查
     * @param {gridCmpt} item 
     */
    private _checkVertical(item: gridCmpt): gridCmpt[] {
        let arr: gridCmpt[] = [item];
        let startX = item.data.h;
        let startY = item.data.v;
        // 上边
        for (let i = startY + 1; i < this.V; i++) {
            if (!this.blockArr[startX][i]) break;
            let ele = this.blockArr[startX][i].getComponent(gridCmpt);
            if (!ele || item.getMoveState()) break;
            if (ele.type == item.type && ele.type < Constant.NormalType) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        // 下边
        for (let i = startY - 1; i >= 0; i--) {
            if (i < 0) break;
            if (!this.blockArr[startX][i]) break;
            let ele = this.blockArr[startX][i].getComponent(gridCmpt);
            if (!ele || item.getMoveState()) break;
            if (ele.type == item.type && ele.type < Constant.NormalType) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        if (arr.length < 3) return [];
        return arr;
    }

    /** 数据交换，网格位置交换 */
    changeData(item1: gridCmpt, item2: gridCmpt) {
        /** 数据交换 */
        let temp = item1.data;
        item1.data = item2.data;
        item2.data = temp;

        /** 位置交换 */
        let x1 = item1.data.h;
        let y1 = item1.data.v;
        let x2 = item2.data.h;
        let y2 = item2.data.v;
        let pTemp = this.blockArr[x1][y1];
        this.blockArr[x1][y1] = this.blockArr[x2][y2]
        this.blockArr[x2][y2] = pTemp;
        this.blockArr[x1][y1].getComponent(gridCmpt).initData(this.blockArr[x1][y1].getComponent(gridCmpt).data.h, this.blockArr[x1][y1].getComponent(gridCmpt).data.v);
        this.blockArr[x2][y2].getComponent(gridCmpt).initData(this.blockArr[x2][y2].getComponent(gridCmpt).data.h, this.blockArr[x2][y2].getComponent(gridCmpt).data.v);
    }

    /** 是否点击在方块上 */
    checkClickOnBlock(pos: Vec3): gridCmpt {
        if (!this.isValid) return;
        if (this.blockArr.length < 1) return;
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let block = this.blockArr[i][j];
                if (block && block.getComponent(gridCmpt).type < Constant.NormalType) {
                    if (block.getComponent(gridCmpt).isInside(pos)) {
                        return block.getComponent(gridCmpt);
                    }
                }
            }
        }
        return null;
    }

    /** 消除后向下滑动 */
    async checkMoveDown() {
        return new Promise(async resolve => {
            for (let i = 0; i < this.H; i++) {
                let count = 0;
                for (let j = 0; j < this.V; j++) {
                    if (!this.isValid) return;
                    let block = this.blockArr[i][j];
                    let isHide = App.gameCtr.checkInHideList(i, j);
                    if (!block) {
                        if (!isHide) {
                            count++;
                        } else {
                            //当前格子以下是不是全是边界空的，是边界空的就忽略，否则就+1
                            let bool = App.gameCtr.checkAllInHideList(i, j);
                            if (!bool && count > 0) {
                                count++;
                            }
                        }
                    }
                    else if (block && count > 0) {
                        let count1 = await this.getDownLastCount(i, j, count);
                        this.blockArr[i][j] = null;
                        this.blockArr[i][j - count1] = block;
                        block.getComponent(gridCmpt).initData(i, j - count1);
                        this.resetTimeInterval();
                        tween(block).to(0.5, { position: this.blockPosArr[i][j - count1] }, { easing: 'backOut' }).call(resolve).start();
                    }
                }
            }
            // await ToolsHelper.delayTime(0.2);
            await this.checkReplenishBlock();
            resolve("");
        });
    }

    /** 获取最终下落的格子数 */
    async getDownLastCount(i, j, count): Promise<number> {
        return new Promise(resolve => {
            let tempCount = 0;
            let func = (i, j, count) => {
                tempCount = count;
                let bool = App.gameCtr.checkInHideList(i, j - count);
                if (bool || this.blockArr[i][j - count]) {
                    func(i, j, count - 1);
                }
            }
            func(i, j, count);
            resolve(tempCount);
        })
    }

    /** 补充新方块填补空缺 */
    async checkReplenishBlock() {
        return new Promise(async resolve => {
            for (let i = 0; i < this.H; i++) {
                for (let j = 0; j < this.V; j++) {
                    let block = this.blockArr[i][j];
                    let isHide = App.gameCtr.checkInHideList(i, j);
                    if (!block && !isHide) {
                        let pos = this.blockPosArr[i][this.V - 1]
                        let block = this.addBlock(i, j, v3(pos.x, pos.y + Constant.Width + 20, 1));
                        this.blockArr[i][j] = block;
                        this.resetTimeInterval();
                        tween(block).to(0.5, { position: this.blockPosArr[i][j] }, { easing: 'backOut' }).call(resolve).start();
                    }
                }
            }
            await ToolsHelper.delayTime(0.5);
            resolve("");
        });
    }

    async initLayout() {
        this.clearData();
        await this.gridMgr.initGrid();
        this.hideList = App.gameCtr.hideList;
        let gap = 0;
        let count = 0;
        let width = Constant.Width;

        /** 先初始化网格坐标 */
        for (let i = 0; i < this.H; i++) {
            this.blockPosArr.push([]);
            this.blockArr.push([]);
            for (let j = 0; j < this.V; j++) {
                let xx = (width + gap) * (i + 0) - (width + gap) * (this.H - 1) / 2;
                let yy = (width + gap) * (j + 0) - (width + gap) * (this.V - 1) / 2;
                let pos = v3(xx, yy, 1);
                this.blockPosArr[i][j] = pos;
                this.blockArr[i][j] = null;
            }
        }
        /** 先初始化障碍物 */
        let obsList = this.AchievetheGoal[0];
        let count2 = 0;
        if (obsList[0] > Constant.NormalType) {
            let len = obsList[1];
            let c1 = Math.ceil(Math.sqrt(len));
            let start = Math.floor((Constant.layCount - c1) / 2);
            let end = start + c1;
            console.log("start=============== " + start);
            console.log("end=============== " + end);
            for (let m = start; m < end; m++) {
                for (let n = start; n < end; n++) {
                    if (count2 < len) {
                        let pos = this.blockPosArr[m][n];
                        let block = this.addBlock(m, n, pos, obsList[0]);
                        block.setScale(v3(0, 0, 0));
                        tween(block).to(0.5, { scale: v3(1, 1, 1) }).start();
                        this.blockArr[m][n] = block;
                    }
                    count2++;
                }
            }

        }

        /** 普通糖果 */
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                if (App.gameCtr.hideFullList.length < this.H * this.V) {
                    App.gameCtr.hideFullList.push([i, j]);
                }
                let xx = (width + gap) * (i + 0) - (width + gap) * (this.H - 1) / 2;
                let yy = (width + gap) * (j + 0) - (width + gap) * (this.V - 1) / 2;
                let pos = v3(xx, yy, 1);
                if (App.gameCtr.checkInHideList(i, j)) {
                    this.blockArr[i][j] = null;
                    continue;
                }
                count++;
                let type = -1;
                if (this.blockArr[i][j]) 
                    continue;
                let block = this.addBlock(i, j, pos, type);
                block.setScale(v3(0, 0, 0));
                tween(block).to(count / 100, { scale: v3(1, 1, 1) }).start();
                this.blockArr[i][j] = block;
            }
        }
        await ToolsHelper.delayTime(0.8);
        // this.checkAgain();
        /** 进入游戏选择的道具炸弹 */
        let list = App.gameCtr.toolsArr;
        for (let i = 0; i < list.length; i++) {
            this.throwTools(list[i]);
        }
        App.gameCtr.toolsArr = [];
    }

    addBlock(i: number, j: number, pos: Vec3 = null, type: number = -1) {
        let block = instantiate(this.gridPre);
        this.gridNode.addChild(block);
        block.getComponent(gridCmpt).initData(i, j, type);
        if (pos) {
            block.setPosition(pos);
        }
        return block;
    }

    clearData() {
        App.gameCtr.resetHdeList(LevelConfig.getCurLevel());
        if (this.blockArr.length < 1) return;
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let block = this.blockArr[i][j];
                if (block) {
                    block.destroy();
                }
            }
        }
        this.blockArr = [];
        this.blockPosArr = [];
        this.isStartChange = false;
        this.isStartTouch = false;
        this.curScore = 0;
        this.isWin = false;
    }
    
    // /** 加积分 */
    // addScoreByType(type: number) {
    //     if (type > this.data.blockRatio.length - 1) {
    //         type = this.data.blockRatio.length - 1;
    //     }
    //     let score = this.data.blockRatio[type];
    //     this.curScore += score;
    //     this.updateScorePercent();
    // }
    /** 飞舞动画 */
    async flyItem(type: number, pos: Vec3) {
        let idx = this.data.mapData[0].m_id.indexOf(type);
        if (idx < 0) return;
        let item = instantiate(this.gridPre);
        let tempPos = new Vec3();
        let targetPos = new Vec3();
        /** 空间坐标转节点坐标 */
        this.node.getComponent(UITransform).convertToNodeSpaceAR(pos, tempPos)
        this.node.getComponent(UITransform).convertToNodeSpaceAR(this.targetBg.worldPosition, targetPos)
        item.setPosition(tempPos);
        this.node.addChild(item);
        item.getComponent(gridCmpt).setType(type);

        let time = 0.5 + Math.random() * 1;
        item.setScale(0.5, 0.5, 0.5);
        tween(item).to(time, { position: targetPos }, { easing: 'backIn' }).call(() => {
            this.handleLevelTarget(type);
            item.destroy();
            // AudioManager.getInstance().playSound('Full');
        }).start();
    }

    handleLevelTarget(type: number) {
        for (let i = 0; i < this.AchievetheGoal.length; i++) {
            if (type == this.AchievetheGoal[i][0]) {
                this.AchievetheGoal[i][1]--
                if (this.AchievetheGoal[i][1] < 0) {
                    this.AchievetheGoal[i][1] = 0;
                }
            }
        }
        this.updateTargetCount();
    }

    /*********************************************  btn *********************************************/
    /*********************************************  btn *********************************************/
    /*********************************************  btn *********************************************/
    evtRestart() {
        this.loadExtraData(LevelConfig.getCurLevel());
    }
    onClick_testBtn() {
        this.loadExtraData(LevelConfig.getCurLevel());
        // this.handleLastSteps();
    }

    /** 设置 */
    onClick_setBtn() {
        // App.view.openView(ViewName.Single.esettingGameView);
        LoaderManeger.instance.loadPrefab('prefab/ui/settingGameView').then((prefab) => {
            let settingNode = instantiate(prefab);
            ViewManager.show({
                node: settingNode,
                name: "SettingGameView"
            });
        });
    }

    /** 购买金币 */
    onClick_buyBtn() {
        AudioManager.getInstance().playSound('button_click');
        // App.view.openView(ViewName.Single.eBuyView);
        LoaderManeger.instance.loadPrefab('prefab/ui/buyView').then((prefab) => {
            let buyNode = instantiate(prefab);
            ViewManager.show({
                node: buyNode,
                name: "BuyView"
            });
        });
    }

    /** 暂停 */
    async onClick_pauseBtn() {
        AudioManager.getInstance().playSound('button_click');
        // App.view.openView(ViewName.Single.esettingGameView);
        LoaderManeger.instance.loadPrefab('prefab/ui/settingGameView').then((prefab) => {
            let settingNode = instantiate(prefab);
            ViewManager.show({
                node: settingNode,
                name: "SettingGameView"
            });
        });
    }

    /** 添加道具，广告位 */
    onClickAddButton(btnNode: Node) {
        AudioManager.getInstance().playSound('button_click');
        let type: number = -1;
        switch (btnNode.name) {
            case "addBtn1":
                type = Bomb.bomb;
                break;
            case "addBtn2":
                type = Bomb.hor;
                break;
            case "addBtn3":
                type = Bomb.ver;
                break;
            case "addBtn4":
                type = Bomb.allSame;
                break;
        }
        App.backStart(false, PageIndex.shop);
        // GlobalFuncHelper.setBomb(type,1);
    }

    onClickVideoButton(btnNode: Node) {
        AudioManager.getInstance().playSound('button_click');
        let type: number = -1;
        switch (btnNode.name) {
            case "video1":
                type = Bomb.bomb;
                break;
            case "video2":
                type = Bomb.hor;
                break;
            case "video3":
                type = Bomb.ver;
                break;
            case "video4":
                type = Bomb.allSame;
                break;
        }
       // Advertise.showVideoAds();

    }
    /** 道具使用状态：防止道具重复使用的标记 */
    private isUsingBomb: boolean = false;
    /** 道具 */
    onClickToolButton(btnNode: Node) {
        if (this.getTimeInterval() > 0) {
            ViewManager.toast("操作太快")
            return;
        }
        AudioManager.getInstance().playSound('button_click');
        if (this.isUsingBomb) return;
        this.isUsingBomb = true;
        this.scheduleOnce(() => {
            this.isUsingBomb = false;
            this.isStartChange = false;
            this.isStartTouch = false;
        }, 1);
        let type: number = -1;
        switch (btnNode.name) {
            case "toolBtn1":
                type = Bomb.bomb;
                break;
            case "toolBtn2":
                type = Bomb.hor;
                break;
            case "toolBtn3":
                type = Bomb.ver;
                break;
            case "toolBtn4":
                type = Bomb.allSame;
                break;
        }
        let bombCount = GameData.getBomb(type);
        if (bombCount <= 0) {
            ViewManager.toast("道具数量不足");
            return;
        }
        GameData.setBomb(type, -1); 
        let pos = btnNode.worldPosition;
        this.throwTools(type, pos);
        this.updateToolsInfo();
    }

    /** 提示道具 */
    onClick_tipsBtn() {
        let list = [];
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let item = this.blockArr[i][j];
                if (item) {
                    let arr = App.gameCtr.checkTipsGroup(item.getComponent(gridCmpt), this.blockArr);
                    if (arr.length > 0) {
                        let count = 0;
                        for (let m = 0; m < arr.length; m++) {
                            if (arr[m].getComponent(gridCmpt).type > Constant.NormalType) {
                                count++;
                            }
                        }
                        if (count == 0) {
                            list.push(arr);
                        }
                    }
                }
            }
        }
        if (list.length > 0) {
            let rand = Math.floor(Math.random() * list.length);
            let tipsList = list[rand];
            tipsList.forEach(item => {
                item.getComponent(gridCmpt).showTips();
            })
        }
        else {
            ViewManager.toast("没有可以交换的糖果了");
        }
    }

    /**
     * 从对象池获取火箭效果
     */
    private getRocketFromPool(): Node {
        if (this.rocketPool.length > 0) {
            let rocket = this.rocketPool.pop();
            rocket.active = true;
            return rocket;
        } else {
            return instantiate(this.rocketPre);
        }
    }

    /**
     * 回收火箭效果到对象池
     */
    private recycleRocket(rocket: Node) {
        if (this.rocketPool.length < this.rocketPoolCapacity) {
            rocket.active = false;

            // 重置位置到初始点，避免下次使用时位置错误
            rocket.setPosition(v3(0, 0, 0));
            this.rocketPool.push(rocket);
        } else {
            rocket.destroy();
        }
    }
}