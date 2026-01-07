import LoaderManeger from './LoaderManeger';
import { Sprite, Node } from 'cc';

/**
 * LoaderManeger 使用示例
 */
export default class LoaderManegerExample {
    
    /**
     * 示例：加载本地JSON文件（通过本地路径）
     */
    public static async loadLocalJSONExample() {
        try {
            // 加载本地resources/json目录下的config.json文件
            const config = await LoaderManeger.instance.loadJSON('config.json');
            console.log('本地JSON加载成功:', config);
        } catch (error) {
            console.error('本地JSON加载失败:', error);
        }
    }
    
    /**
     * 示例：加载本地JSON文件（通过file:// URL）
     */
    public static async loadJSONByURLExample() {
        try {
            // 加载本地文件系统中的JSON文件
            const data = await LoaderManeger.instance.loadJSON('file:///D:/work/work/NewProject/assets/resources/json/data.json');
            console.log('URL JSON加载成功:', data);
        } catch (error) {
            console.error('URL JSON加载失败:', error);
        }
    }
    
    /**
     * 示例：加载纹理图片
     */
    public static async loadTextureExample() {
        try {
            // 加载resources/textures目录下的icon.png图片
            const texture = await LoaderManeger.instance.loadTexture('textures/icon');
            console.log('纹理加载成功:', texture);
        } catch (error) {
            console.error('纹理加载失败:', error);
        }
    }
    
    /**
     * 示例：加载图集并获取精灵帧
     */
    public static async loadAtlasExample() {
        try {
            // 加载resources/atlas目录下的ui.atlas图集
            const atlas = await LoaderManeger.instance.loadAtlas('atlas/ui');
            console.log('图集加载成功:', atlas);
            
            // 从图集中获取精灵帧
            const spriteFrame = await LoaderManeger.instance.getSpriteFrameFromAtlas('atlas/ui', 'button_normal');
            console.log('精灵帧获取成功:', spriteFrame);
        } catch (error) {
            console.error('图集加载失败:', error);
        }
    }
    
    /**
     * 示例：直接设置精灵帧到Sprite组件
     * @param sprite Sprite组件实例
     */
    public static async setSpriteFrameExample(sprite: Sprite) {
        try {
            // 从图集中获取精灵帧并直接设置到Sprite组件
            await LoaderManeger.instance.setSpriteFrameFromAtlas(sprite, 'atlas/ui', 'button_pressed');
            console.log('精灵帧设置成功');
        } catch (error) {
            console.error('精灵帧设置失败:', error);
        }
    }
    
    /**
     * 示例：加载预制体
     */
    public static async loadPrefabExample() {
        try {
            // 加载resources/prefabs目录下的Player预制体
            const playerPrefab = await LoaderManeger.instance.loadPrefab('prefabs/Player');
            console.log('预制体加载成功:', playerPrefab);
            
            // 这里可以使用预制体进行实例化
            // const playerNode = instantiate(playerPrefab);
            // this.node.addChild(playerNode);
        } catch (error) {
            console.error('预制体加载失败:', error);
        }
    }
    
    /**
     * 示例：批量加载资源
     */
    public static async loadBatchExample() {
        try {
            // 定义需要加载的资源列表
            const resourcesList = [
                { type: 'json', path: 'config.json' },
                { type: 'texture', path: 'textures/background' },
                { type: 'atlas', path: 'atlas/ui' },
                { type: 'prefab', path: 'prefabs/Enemy' }
            ];
            
            // 批量加载资源，带进度回调
            const results = await LoaderManeger.instance.loadBatch(resourcesList, (progress) => {
                console.log('批量加载进度:', (progress * 100).toFixed(2) + '%');
            });
            
            console.log('批量加载完成:', results);
        } catch (error) {
            console.error('批量加载失败:', error);
        }
    }
    
    /**
     * 示例：释放资源
     */
    public static releaseResourcesExample() {
        // 释放指定资源
        LoaderManeger.instance.release('json', 'config.json');
        LoaderManeger.instance.release('texture', 'textures/icon');
        
        // 释放图集（会同时释放图集中的所有精灵帧）
        LoaderManeger.instance.release('atlas', 'atlas/ui');
        
        console.log('资源释放完成');
    }
    
    /**
     * 示例：释放所有资源
     */
    public static releaseAllResourcesExample() {
        // 释放所有缓存的资源
        LoaderManeger.instance.releaseAll();
    }
    
    /**
     * 运行所有示例
     * @param sprite 用于测试精灵帧设置的Sprite组件
     */
    public static async runAllExamples(sprite?: Sprite) {
        console.log('开始运行LoaderManeger示例...');
        
        // 按顺序运行示例
        await this.loadLocalJSONExample();
        await this.loadJSONByURLExample();
        await this.loadTextureExample();
        await this.loadAtlasExample();
        
        if (sprite) {
            await this.setSpriteFrameExample(sprite);
        }
        
        await this.loadPrefabExample();
        await this.loadBatchExample();
        
        this.releaseResourcesExample();
        
        console.log('所有LoaderManeger示例运行完成');
    }
}