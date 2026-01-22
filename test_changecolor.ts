
// Mock Enums and Constants
enum Bomb {
    ver = 8,
    hor = 9,
    bomb = 10,
    allSame = 11,
    changecolor = 12,
}

const Constant = {
    NormalType: 13, // Updated value
};

// Mock Classes
class MockNode {
    worldPosition = { x: 0, y: 0 };
    isValid = true;
}

class GridCmptMock {
    h: number;
    v: number;
    type: number;
    node: MockNode = new MockNode();
    isValid: boolean = true;

    constructor(h: number, v: number, type: number) {
        this.h = h;
        this.v = v;
        this.type = type;
    }

    getComponent(type: any) { return this; }

    setType(type: number) {
        console.log(`   [Grid (${this.h},${this.v})] Type changed from ${this.type} to ${type}`);
        this.type = type;
    }
}

class AudioManagerMock {
    static instance = new AudioManagerMock();
    static getInstance() { return this.instance; }
    playSound(name: string) { console.log(`   [Audio] Playing sound: ${name}`); }
}

class AppMock {
    static gameCtr = {
        blockCount: 6
    };
}

class ToolsHelperMock {
    static delayTime(time: number) {
        return Promise.resolve();
    }
}

// Mock Game Class
class GameMock {
    H = 5;
    V = 5;
    blockArr: any[][] = [];
    isChecking = false;

    constructor() {
        // Initialize 5x5 grid with random types 0-5
        for (let i = 0; i < this.H; i++) {
            this.blockArr[i] = [];
            for (let j = 0; j < this.V; j++) {
                this.blockArr[i][j] = new GridCmptMock(i, j, Math.floor(Math.random() * 6));
            }
        }
    }

    isBomb(bc: GridCmptMock) {
        return bc.type >= 8 && bc.type <= 12;
    }

    async checkAgain(isResult: boolean) {
        console.log("   [Game] checkAgain called. Logic would check for matches now.");
    }

    // The Logic to Test
    async handleBomb(bc: GridCmptMock, isResult: boolean = false) {
        console.log(`\n[handleBomb] Processing Bomb at (${bc.h},${bc.v}) Type: ${bc.type}`);
        
        if (this.isBomb(bc)) {
            // 2026-01-22: 处理变色道具逻辑
            if (bc.type === Bomb.changecolor) {
                this.isChecking = true;
                console.log("   [Logic] Detected Bomb.changecolor");
                
                // 1. 随机选择一个普通水果类型
                let maxType = AppMock.gameCtr.blockCount || 5;
                let targetType = Math.floor(Math.random() * maxType);
                console.log(`   [Logic] Selected Target Type: ${targetType}`);
                
                // 2. 获取九宫格范围内的方块
                let list: GridCmptMock[] = [];
                for (let i = bc.h - 1; i <= bc.h + 1; i++) {
                    for (let j = bc.v - 1; j <= bc.v + 1; j++) {
                        if (i >= 0 && i < this.H && j >= 0 && j < this.V) {
                            let item = this.blockArr[i][j];
                            if (item) {
                                let gc = item; // In mock, item is GridCmptMock
                                // 只改变普通方块和炸弹本身
                                if (gc && gc.isValid && gc.type < Constant.NormalType) {
                                     list.push(gc);
                                }
                            }
                        }
                    }
                }
                console.log(`   [Logic] Found ${list.length} neighbors (including self)`);

                AudioManagerMock.getInstance().playSound("prop_bomb");
                
                // 3. 执行变色
                for(let item of list) {
                     item.setType(targetType);
                }

                // 4. 延迟后重新检查消除
                await ToolsHelperMock.delayTime(0.3);
                this.isChecking = false;
                await this.checkAgain(isResult);
                return true;
            }
        }
        return false;
    }
}

// Run Test
async function runTest() {
    let game = new GameMock();
    
    // Set a block to be changecolor bomb
    let centerBlock = game.blockArr[2][2];
    centerBlock.setType(Bomb.changecolor); // Set to 12

    // Verify neighbors before
    console.log("Before:");
    console.log(`(1,1): ${game.blockArr[1][1].type}, (1,2): ${game.blockArr[1][2].type}, (1,3): ${game.blockArr[1][3].type}`);
    console.log(`(2,1): ${game.blockArr[2][1].type}, (2,2): ${game.blockArr[2][2].type}, (2,3): ${game.blockArr[2][3].type}`);
    console.log(`(3,1): ${game.blockArr[3][1].type}, (3,2): ${game.blockArr[3][2].type}, (3,3): ${game.blockArr[3][3].type}`);

    // Trigger handleBomb
    await game.handleBomb(centerBlock);

    // Verify neighbors after
    console.log("After:");
    let newType = game.blockArr[2][2].type;
    console.log(`Target Type should be: ${newType}`);
    
    let allMatch = true;
    for(let i=1; i<=3; i++) {
        for(let j=1; j<=3; j++) {
             if (game.blockArr[i][j].type !== newType) {
                 console.error(`Mismatch at (${i},${j}): ${game.blockArr[i][j].type}`);
                 allMatch = false;
             }
        }
    }
    
    if (allMatch) {
        console.log("SUCCESS: All 3x3 blocks changed to the same type!");
    } else {
        console.log("FAILURE: Some blocks did not change.");
    }
}

runTest();
