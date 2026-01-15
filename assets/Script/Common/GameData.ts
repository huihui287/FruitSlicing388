import { _decorator, Component, Node, sys } from 'cc';
import { DEV } from 'cc/env';
import { Bomb, GridType } from '../Tools/enumConst';
const { ccclass, property } = _decorator;

@ccclass
export default class GameData {

    public static _TiLi = 2;
   



    
    /** 炸弹 */
    public static BombHor = "BombHor";
    public static BombVer = "BomVerr";
    public static BombBomb = "BombBomb";
    public static BombAllSame = "BombAllSame";
    public static Level = 'Level';
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
     * 添加金币
     * @param amount 要添加的金币数量
     * @returns 更新后的金币数量
     */
    static addGold(amount: number): number {
        const currentGold = this.loadData('gold', 0);
        const newGold = currentGold + amount;
        this.saveData('gold', newGold);
        return newGold;
    }
    
    /**
     * 花费金币
     * @param amount 要花费的金币数量
     * @returns 是否花费成功（金币是否足够）
     */
    static spendGold(amount: number): boolean {
        const currentGold = this.loadData('gold', 0);
        if (currentGold >= amount) {
            const newGold = currentGold - amount;
            this.saveData('gold', newGold);
            return true;
        }
        return false;
    }
    
    /**
     * 获取当前金币数量
     * @returns 当前金币数量
     */
    static getGold(): number {
        return this.loadData('gold', 0);
    }
    
    static setGold(gold: number) {
        this.saveData('gold', gold);
    }
    
    /**
     * 重置所有游戏数据为默认值
     */
    static resetAllData(): void {
        try {
            // 重置金币
            this.saveData('gold', 0);
            
            // 重置炸弹数量
            this.saveData(GameData.BombHor, 0);
            this.saveData(GameData.BombVer, 0);
            this.saveData(GameData.BombBomb, 0);
            this.saveData(GameData.BombAllSame, 0);
            
            // 重置等级
            this.saveData(GameData.Level, 1);
            
            // 重置所有攻击等级
            const gridTypes = Object.values(GridType).filter(value => typeof value === 'number') as number[];
            gridTypes.forEach(type => {
                this.saveData('LVAttack' + type, 1);
            });
            
            // 重置其他可能的游戏数据
            // 这里可以根据实际游戏中添加的其他数据键名进行扩展
            
            console.log('所有游戏数据已重置为默认值');
        } catch (error) {
            DEV && console.error('重置数据失败:', error);
        }
    }
    
}
// // 保存单个值
// GameData.saveData('Level', 10);

// // 保存JSON数组
// GameData.saveData('pifu', [0, 1, 2]);

// // 保存JSON对象
// GameData.saveData('userInfo', { name: 'Player', level: 5 });

// // 加载数据
// const level = GameData.loadData('Level', 0);
// const pifu = GameData.loadData('pifu', [0]);
// const userInfo = GameData.loadData('userInfo', { name: 'Guest', level: 1 });
