import { director } from "cc";

export namespace DouyinSideBar {
    /**
     * 判断是否为抖音环境
     * @returns 返回true或false
     */
    export function isDouyinPlatform(): boolean {
        //@ts-ignore
        if (typeof BYTEDANCE !== 'undefined') {
            //@ts-ignore
            return BYTEDANCE;
        }
        //@ts-ignore
        return window.tt !== null && window.tt !== undefined;
    }

    /**
     * 本游戏在抖音环境下启动监控，保证能第一时间启动。因为可能监听抖音失败（抖音小游戏官方的说明）！
     * @param onResult 包含一个boolean参数的函数
     * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
     */
    export function listenFromDouyin(onResult: (success: boolean) => void, target?: any) {
        if (!isDouyinPlatform()) {
            onResult?.call(target, false);
            return;
        }
        // @ts-ignore
        tt.onShow((res: any) => {
            console.log('onShow launch res:', res);
            if (res.scene === '021036') {
                onResult?.call(target, true);
                director.resume();
                console.log('launch from sidebar');
            } else {
                onResult?.call(target, false);
                
                console.log('NOT launch from douyin sidebar!');
            }
        });

        // @ts-ignore
        let options = tt.getLaunchOptionsSync();
        if (options && options.scene === '021036') {
            // if (onResult!=null) {
            //     onResult(true);     
            // }
            onResult?.call(target, true);
        }
    }

    /**
     * 检测抖音侧边栏是否存在
     * @param onResult 包含一个boolean参数的函数
     * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
     * @returns 
     */
    export function checkSideBar(onResult: (success: boolean) => void, target?: any) {
        if (!isDouyinPlatform()) {
            onResult?.call(target, false);
            return;
        }

        if (tt.checkScene != null) {
            //@ts-ignore
            tt.checkScene({
                scene: "sidebar",
                success: (res: any) => {
                    console.log("check scene success: ", res.isExist);
                    onResult?.call(target, <boolean>res.isExist);
                },
                fail: (res: any) => {
                    console.log("check scene fail:", res);
                    onResult?.call(target, false);
                }
            });
        }
        else
        {
            onResult?.call(target, false);
        }

    }

    /**
     * 跳转到抖音侧边栏
     * @param onResult 包含一个boolean参数的函数
     * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
     * @returns 
     */
    export function navigateToDouyin(onResult: (success: boolean) => void, target?: any) {
        if (!isDouyinPlatform()) {
            console.log("not douyin platform!");
            onResult?.call(target, false);
            return;
        }

        // @ts-ignore
        tt.navigateToScene({
            scene: "sidebar",
            success: () => {
                console.log("navigate success");
                onResult?.call(target, true);
            },
            fail: (res: any) => {
                console.log("navigate failed reason:", res);
                onResult?.call(target, false);
            },
        });
    }
}