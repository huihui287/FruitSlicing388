## 任务目标
修复使用炸弹道具后滑动水果导致的 Game.ts:2044 `Cannot read properties of null (reading 'h')` 运行时崩溃。

## 技术方案
### 1. 修复 startChangeCurTwoPos (Game.ts)
- 在所有 await 异步点（setTimeout 等待、handleBomb 调用）后增加 `isValid(one) && isValid(two)` 校验。
- 只有在节点依然有效时才执行 `changeData` 或后续的 `handleBomb` 逻辑。

### 2. 修复 changeData (Game.ts)
- 增加防御性编程：检查 `item1.data` 和 `item2.data` 是否为 null。
- 只有在数据完整时才进行 blockArr 数组的索引更新。

### 3. 修复下落逻辑动画同步 (Game.ts)
- 重构 `checkMoveDown` 和 `checkReplenishBlock` 的 Promise 返回逻辑。
- 确保必须等待**所有**下落方块的 Tween 动画完成后，再 resolve 结果，防止下落过程中玩家提前操作导致的数据不一致。

### 4. 触摸事件安全过滤 (Game.ts)
- 在 `evtTouchMove` 中，在执行 `isNeighbor` 判断前，先校验 `this.curTwo[0]` 是否依然有效。

## 验证计划
- 连续使用 Bomb.bomb 道具，并在爆炸动画期间尝试疯狂滑动屏幕上的水果。
- 观察控制台是否还有 TypeError 报错，确认游戏是否能稳定运行并正常进入下落补位流程。