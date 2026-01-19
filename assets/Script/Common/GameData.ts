import { _decorator } from 'cc';
import { DEV } from 'cc/env';
import CM from '../channel/CM';
import { Bomb, GridType } from '../Tools/enumConst';
const { ccclass } = _decorator;

@ccclass
export default class GameData {
    /** 炸弹 */
    public static BombHor = 0;
    public static BombVer = 0;
    public static BombBomb = 0;
    public static BombAllSame = 0;
    public static Level = 0;
    public static NewPlayerKey = 0;
    public static gold = 0;
    public static LVAttack0 = 0;
    public static LVAttack1 = 0;
    public static LVAttack2 = 0;
    public static LVAttack3 = 0;

    private static parseData(dataStr: string | null, defaultValue: any): any {
        if (dataStr === null || dataStr === undefined) {
            return defaultValue;
        }
        try {
            return JSON.parse(dataStr);
        } catch {
            const num = Number(dataStr);
            return isNaN(num) ? dataStr : num;
        }
    }

    static saveData(key: string, value: any): void {
        try {
            let dataStr: string;
            if (typeof value === 'object' && value !== null) {
                dataStr = JSON.stringify(value);
            } else {
                dataStr = String(value);
            }

            if (CM.mainCH && (CM.mainCH as any).setUserCloudStorage) {
                CM.mainCH.setUserCloudStorage();
            }
        } catch (error) {
            DEV && console.error('保存数据失败:', error);
        }
    }

    //    static getBomb(type: Bomb) {
    //         const cacheVal = this._bombCache[type];
    //         if (cacheVal !== undefined) {
    //             return cacheVal;
    //         }
    //         let key = "";
    //         switch (type) {
    //             case Bomb.hor:
    //                 key = GameData.BombHor;
    //                 break;
    //             case Bomb.ver:
    //                 key = GameData.BombVer;
    //                 break;
    //             case Bomb.bomb:
    //                 key = GameData.BombBomb;
    //                 break;
    //             case Bomb.allSame:
    //                 key = GameData.BombAllSame;
    //                 break;
    //         }
    //         const val = +GameData.GetData(key, 0);
    //         this._bombCache[type] = val;
    //         return val;
    //     }

    //    static setBomb(type: Bomb, count: number) {
    //         let baseNum = this.getBomb(type);
    //         let ct = baseNum + count >= 0 ? baseNum + count : 0;
    //         switch (type) {
    //             case Bomb.hor:
    //                 GameData.saveData(GameData.BombHor, ct + "");
    //                 break;
    //             case Bomb.ver:
    //                 GameData.saveData(GameData.BombVer, ct + "");   
    //                 break;
    //             case Bomb.bomb:
    //                 GameData.saveData(GameData.BombBomb, ct + "");
    //                 break;
    //             case Bomb.allSame:
    //                 GameData.saveData(GameData.BombAllSame, ct + "");
    //                 break;
    //         }
    //         this._bombCache[type] = ct;
    //     }

    //进入游戏加载一次云数据保存给这个对象的成员变量赋值
    static GetDataOne() {
        if (CM.mainCH && CM.mainCH.getUserCloudStorage) {
            CM.mainCH.getUserCloudStorage((list: {}) => {
                       this.gold = this.parseData(list["gold"], 0);
                       this.Level = this.parseData(list["Level"], 0);
            })
        }
    }
    // /**
    //  * 添加金币
    //  * @param amount 要添加的金币数量
    //  * @returns 更新后的金币数量
    //  */
    // static addGold(amount: number): number {
    //     const currentGold = this.getGold();
    //     const newGold = currentGold + amount;
    //     this.setGold(newGold);
    //     return newGold;
    // }

    // /**
    //  * 花费金币
    //  * @param amount 要花费的金币数量
    //  * @returns 是否花费成功（金币是否足够）
    //  */
    // static spendGold(amount: number): boolean {
    //     const currentGold = this.getGold();
    //     if (currentGold >= amount) {
    //         const newGold = currentGold - amount;
    //         this.setGold(newGold);
    //         return true;
    //     }
    //     return false;
    // }

    // /**
    //  * 获取当前金币数量
    //  * @returns 当前金币数量
    //  */
    // static getGold(): number {
    //     if (this._goldCache === null) {
    //         this._goldCache = this.GetData(this.GOLD_KEY, 0);
    //     }
    //     return this._goldCache;
    // }

   
    

}
