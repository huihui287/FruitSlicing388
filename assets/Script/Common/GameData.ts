import { _decorator, Component, Node, sys } from 'cc';
import { DEV } from 'cc/env';
import { Bomb } from '../Tools/enumConst';
const { ccclass, property } = _decorator;

@ccclass
export default class GameData {

    /** 炸弹 */
    public static BombHor = "BombHor";
    public static BombVer = "BomVerr";
    public static BombBomb = "BombBomb";
    public static BombAllSame = "BombAllSame";
    public static Level = 'Level';
    public static IsNewPlayer = 'IsNewPlayer';
    public static Gold = 'Gold';
    public static TurretLevel = 'TurretLevel';
    public static MusicOn = 'MusicOn';
    public static SoundOn = 'SoundOn';
    /**
     * 保存游戏数据
     * @param key 数据键名
     * @param value 数据值（支持单个值和JSON对象/数组）
     */
    static saveData(key: string, value: any): void {
        try {
        let dataStr: string;
        // 如果是对象或数组，使用JSON序列化
        if (typeof value === 'object' && value !== null) {
            dataStr = JSON.stringify(value);
        } else {
            // 单个值直接保存
            dataStr = String(value);
        }
        sys.localStorage.setItem(key, dataStr);
    } catch (error) {
       DEV &&console.error('保存数据失败:', error);
    }
}

/**
 * 加载游戏数据
 * @param key 数据键名
 * @param defaultValue 默认值
 * @returns 加载的数据
 */
static loadData(key: string, defaultValue: any): any {
    try {
        const dataStr = sys.localStorage.getItem(key);
        if (dataStr === null) {
            return defaultValue;
        }
        
        // 尝试解析为JSON对象/数组
        try {
            return JSON.parse(dataStr);
        } catch (e) {
            // 如果解析失败，返回原始字符串值并尝试转换为数字
            const num = Number(dataStr);
            return isNaN(num) ? dataStr : num;
        }
    } catch (error) {
       DEV && console.error('加载数据失败:', error);
        return defaultValue;
    }
    
}

   static getBomb(type: Bomb) {
        switch (type) {
            case Bomb.hor:
                return +GameData.loadData(GameData.BombHor,0);
            case Bomb.ver:
                return +GameData.loadData(GameData.BombVer,0);
            case Bomb.bomb:
                return +GameData.loadData(GameData.BombBomb,0);
            case Bomb.allSame:
                return +GameData.loadData(GameData.BombAllSame,0);
        }
    }

   static setBomb(type: Bomb, count: number) {
        let baseNum = this.getBomb(type);
        let ct = baseNum + count >= 0 ? baseNum + count : 0;
        switch (type) {
            case Bomb.hor:
                GameData.saveData(GameData.BombHor, ct + "");
                break;
            case Bomb.ver:
                GameData.saveData(GameData.BombVer, ct + "");   
                break;
            case Bomb.bomb:
                GameData.saveData(GameData.BombBomb, ct + "");
                break;
            case Bomb.allSame:
                GameData.saveData(GameData.BombAllSame, ct + "");
                break;
        }
    }
    
    /**
 * 检查是否为新玩家
 * @returns 如果是新玩家则返回true，否则返回false
 */
    static isNewPlayer() {
        return GameData.loadData(GameData.IsNewPlayer, true);
    }
    /**
 * 设置是否为新玩家
 * @param isNew 是否为新玩家
 */
        static setNewPlayer(isNew: boolean) {
        GameData.saveData(GameData.IsNewPlayer, isNew);
    }
    /**
 * 消耗金币
 * @param cost 消耗的金币数量
 */
    static spendGold(cost: number) {
        let gold = GameData.loadData(GameData.Gold, 0);
        if (gold < cost) {
            return false;
        }
        GameData.saveData(GameData.Gold, gold - cost);
        return true;
    }
    /**
 * 获取当前金币数量
 * @returns 当前金币数量
 */
    static getGold() {
        return GameData.loadData(GameData.Gold, 0);
    }
    /**
 * 设置当前金币数量
 * @param gold 新的金币数量
 */
    static setGold(gold: number) {
        GameData.saveData(GameData.Gold, gold);
    }

    static addGold(goldReward: number) {
        let currentGold = Number(GameData.loadData(GameData.Gold, 0));
        currentGold += goldReward;
        GameData.saveData(GameData.Gold, currentGold);
    }
}
