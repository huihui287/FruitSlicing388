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
        // let ctArr = list[0].m_ct;
        // //let idArr = list[0].m_id;
        // // if (idArr[idx] > Constant.NormalType) {//是障碍物
        // //     return ctArr[idx];
        // // }
        // // 几何增长：基数 * (增长率 ^ (关卡-1)) * 系数
        // // 增长率设为 1.15，确保后期难度提升，同时前期不会太难
        // let count = Math.floor(ctArr[idx] * Math.pow(growthRate, App.gameCtr.curLevel - 1) * 2);

        // 确保至少有一个
        // 比如：Level 1 = 1, Level 10 ≈ 3.5, Level 20 ≈ 14, Level 50 ≈ 900 (对比原线性的 100)
        const lv = Math.max(1, App.gameCtr.curLevel || 1);
        const base = 20;          // 第一关基础目标数量
        const growthRate = 3.12;  // 每关 12% 几何增长
        let count = Math.ceil(base * Math.pow(growthRate, lv - 1));
        return count;
    }
}

export let LevelConfig = new config();
