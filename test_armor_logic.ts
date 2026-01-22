
class MockNode {
    active: boolean = true;
    name: string;
    constructor(name: string) { this.name = name; }
}

class GridDownCmptMock {
    health: number = 1;
    virtualHealth: number = 1;
    children: MockNode[] = [new MockNode("inner"), new MockNode("outer")]; // 2个护甲片

    constructor(initialHealth: number, initialVirtual: number) {
        this.health = initialHealth;
        this.virtualHealth = initialVirtual;
        console.log(`[初始化] Health: ${this.health}, VirtualHealth: ${this.virtualHealth}`);
    }

    // 核心逻辑
    updateHealthDisplay() {
        let totalPlates = this.children.length;

        // 修正逻辑
        if (this.health > this.virtualHealth) {
            console.log(`   [修正触发] Health(${this.health}) > Virtual(${this.virtualHealth}), 更新 VirtualHealth -> ${this.health}`);
            this.virtualHealth = this.health;
        }

        let maxArmor = Math.max(1, this.virtualHealth - 1);
        let currentArmor = Math.max(0, this.health - 1);
        let ratio = currentArmor / maxArmor;
        let platesToShow = Math.ceil(ratio * totalPlates);

        console.log(`   [状态] Health: ${this.health}/${this.virtualHealth}, Armor: ${currentArmor}/${maxArmor}, Ratio: ${ratio.toFixed(2)}, Show: ${platesToShow}`);

        // 模拟显示
        let visual = "[";
        for (let i = 0; i < this.children.length; i++) {
            if (i < platesToShow) visual += "O"; // 显示
            else visual += "_"; // 隐藏
        }
        visual += "]";
        console.log(`   [UI] ${visual}`);
    }

    takeDamage(amount: number) {
        console.log(`\n[受到伤害] -${amount}`);
        this.health -= amount;
        this.updateHealthDisplay();
    }
}

console.log("=== 测试场景 1: 正常初始化 (9血) ===");
let t1 = new GridDownCmptMock(9, 9);
t1.updateHealthDisplay();
t1.takeDamage(1); // 8
t1.takeDamage(3); // 5 (50% 临界点)
t1.takeDamage(1); // 4 (应该掉一片)

console.log("\n=== 测试场景 2: 异常初始化 (用户遇到的情况: 5血, Virtual=1) ===");
// 模拟: 血量被设为5，但virtualHealth还是默认值1
let t2 = new GridDownCmptMock(5, 1); 

// 第一次刷新（通常在初始化或第一次掉血前会调用）
console.log("[第一次刷新UI]");
t2.updateHealthDisplay(); 

// 开始掉血
t2.takeDamage(1); // 4
t2.takeDamage(1); // 3
t2.takeDamage(1); // 2
t2.takeDamage(1); // 1
