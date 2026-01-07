import { _decorator, Component, Node, Prefab, Vec3, v3, instantiate } from 'cc';
import { Constant } from '../../Tools/enumConst';
import { App } from '../../Controller/app';
import LoaderManeger from '../../sysloader/LoaderManeger';
import { blockCmpt } from '../item/blockCmpt';

const { ccclass, property } = _decorator;

@ccclass('gridManagerCmpt')
export class gridManagerCmpt extends Component {
    private blockPre: Prefab = null;
    private obstacleArr = [];
    private blockArr: Node[][] = [];
    private blockPosArr: Vec3[][] = [];
    /** 行列数 */
    private H: number = Constant.layCount;
    private V: number = Constant.layCount;
    private rectWidth: number = Constant.Width;
    private hideList = [];
    /** 对象池相关 */
    private blockPool: Node[] = [];
    private poolCapacity: number = 100;
    public async initGrid() {
        await this.loadLinePre();
        this.initLayout();
    }

    async loadLinePre() {
        // this.blockPre = await ResLoadHelper.loadPieces(ViewName.Pieces.block);
        this.blockPre = await LoaderManeger.instance.loadPrefab('prefab/pieces/block');
    }

    initLayout() {
        this.hideList = App.gameCtr.hideList;
        this.clearData();
        let gap = 0;
        let width = this.rectWidth;
        for (let i = 0; i < this.H; i++) {
            this.blockArr.push([]);
            this.blockPosArr.push([]);
            for (let j = 0; j < this.V; j++) {
                let xx = (width + gap) * (i + 0) - (width + gap) * (this.H - 1) / 2;
                let yy = (width + gap) * (j + 0) - (width + gap) * (this.V - 1) / 2;
                let pos = v3(xx, yy, 1);
                this.blockPosArr[i][j] = pos;
                if (App.gameCtr.checkInHideList(i, j)) {
                    this.blockArr[i][j] = null;
                    continue;
                }
                let block = this.addBlock(i, j, pos);
                this.blockArr[i][j] = block;
            }
        }
        /** 边框设置 */
        this.setMapBorders();
    }

    /** 边框设置 - 仅在初始化时调用一次，已优化 */
    setMapBorders() {
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let block = this.blockArr[i][j];
                if (block) {
                    // 优化：直接在条件判断中赋值，减少变量声明
                    const top = j + 1 < this.V ? this.blockArr[i][j + 1] : null;
                    const down = j - 1 >= 0 ? this.blockArr[i][j - 1] : null;
                    const left = i - 1 >= 0 ? this.blockArr[i - 1][j] : null;
                    const right = i + 1 < this.H ? this.blockArr[i + 1][j] : null;
                    
                    block.getComponent(blockCmpt).handleBorders(top, down, left, right);
                }
            }
        }
    }

    addBlock(i: number, j: number, pos: Vec3 = null) {
        let block: Node;
        if (this.blockPool.length > 0) { // 从对象池获取
            block = this.blockPool.pop();
            block.parent = this.node;
            block.active = true;
        } else { // 创建新对象
            block = instantiate(this.blockPre);
            this.node.addChild(block);
        }
        block.getComponent(blockCmpt).initData(i, j);
        if (pos) {
            block.setPosition(pos);
        }
        return block;
        /* 原代码保留
        let block = instantiate(this.blockPre);
        this.node.addChild(block);
        block.getComponent(blockCmpt).initData(i, j);
        if (pos) {
            block.setPosition(pos);
        }
        return block;
        */
    }

    clearData() {
        if (this.blockArr.length < 1) return;
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let block = this.blockArr[i][j];
                if (block) {
                    if (this.blockPool.length < this.poolCapacity) { // 回收至对象池
                        block.active = false;
                        block.removeFromParent();
                        this.blockPool.push(block);
                    } else { // 池满则销毁
                        block.destroy();
                    }
                }
            }
        }
        this.obstacleArr.forEach(item => item.destroy());
        this.obstacleArr = [];
        this.blockArr = [];
        this.blockPosArr = [];
        /* 原代码保留
        if (this.blockArr.length < 1) return;
        for (let i = 0; i < this.H; i++) {
            for (let j = 0; j < this.V; j++) {
                let block = this.blockArr[i][j];
                if (block) {
                    block.destroy();
                }
            }
        }
        this.obstacleArr.forEach(item => item.destroy());
        this.obstacleArr = [];
        this.blockArr = [];
        this.blockPosArr = [];
        */
    }
}


