import { js, JsonAsset } from "cc";
import { App } from "../Controller/app";
import { Constant, LevelData, mapData } from "./enumConst";
import GameData from "../Common/GameData";
import LoaderManeger from "../sysloader/LoaderManeger";

class config {
    /** 下一关，并本地缓存已通过关卡 */
    nextLevel() {
        let lv = +this.getCurLevel();
        const nextLv = lv + 1;
        GameData.saveData(GameData.Level, nextLv);
        GameData.updateMaxLevel(nextLv);
        App.gameCtr.curLevel = nextLv;
        return App.gameCtr.curLevel;
    }

    getCurLevel() {
        return GameData.loadData(GameData.Level, 1);
    }
    setCurLevel(lv: number) {
        App.gameCtr.curLevel = lv;
        GameData.saveData(GameData.Level, lv);
        GameData.updateMaxLevel(lv);
    }

    async getLevelData(id: number | string): Promise<LevelData> {
        let data = await this.getGridData(id);
        let list = [];
        for (let i = 0; i < data.mapData[0].m_id.length; i++) {
            let item = data.mapData[0].m_id[i];
            if (item > 5) {
                data.mapData[0].m_id[i] = this.handleIdArr(item);
            }
            let idx = list.indexOf(data.mapData[0].m_id[i]);
            if (idx < 0) {
                list.push(data.mapData[0].m_id[i])
            }
        };
        data.mapData[0].m_id = list;
        return data;
    }
  //"201": 201,//3,
    handleIdArr(id: number) {
        let numObj = {
            "201": 3,
            "410": 4,
            "50": 0,
            "51": 1,
            "100": 2,
            "208": 4,
            "420": 0,
            "400": 1,
            "404": 2,
            "409": 3,
            "411": 0,
            "412": 1,
            "413": 2,
            "415": 3,
            "416": 4,
            "417": 0,
            "418": 1,
            "423": 2,
        }
        return numObj[`${id}`] || 0;
    }

    async getGridData(id: number | string): Promise<LevelData> {
        if (+id > 1700) id = (+id % 1700) + 1;
        // let json: JsonAsset = await ResLoadHelper.loadCommonAssetSync(`config/${id}`, JsonAsset);
        let json: JsonAsset = await LoaderManeger.instance.loadJSON(`config/${id}`) as JsonAsset;
        let loadData = json['json'] as LevelData;
        return loadData;
    }

    getLevelTargetCount() {//list: mapData[], idx
        // 确保至少有一个
        const lv = Math.max(1, App.gameCtr.curLevel || 1);
        const base = 30;          // 第一关基础目标数量，确保游戏时间约 2 分钟
        let count: number;
        
        if (lv <= 5) {
            // 前 5 关：较慢的线性增长
            // 每关增加 5 个目标，确保增长平稳
            count = base + (lv - 1) * 200;
        } else {
            // 5 关之后：较快的指数增长
            // 以第 5 关的目标数量为基础，之后每关 15% 的增长率
            const level10Count = base + 5 * 200; // 第 5 关的目标数量
            const growthRate = 1.35; // 15% 的增长率
            count = Math.ceil(level10Count * Math.pow(growthRate, lv - 5));
        }
        
        // 确保目标数量至少为基础值
        count = Math.max(base, count);
        return count;
    }
}

export let LevelConfig = new config();
