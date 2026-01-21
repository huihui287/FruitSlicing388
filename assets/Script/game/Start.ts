import { _decorator, BaseNode, Component, instantiate, Node, ProgressBar } from 'cc';
import CM from '../channel/CM';
import LoaderManeger from '../sysloader/LoaderManeger';
import { App } from '../Controller/app';
import { LevelConfig } from '../Tools/levelConfig';
import GameData from '../Common/GameData';
import { BaseNodeCom } from './BaseNode';
import AudioManager from '../Common/AudioManager';
import ViewManager from '../Common/view/ViewManager';
const { ccclass, property } = _decorator;

@ccclass('Start')
export class Start extends BaseNodeCom {

    start() {

    }

    protected onLoad(): void {
        super.onLoad();
        
    }

    onClick_startBtn() {
        LoaderManeger.instance.loadPrefab('prefab/ui/levelSelect').then((prefab) => {
            let levelSelect = instantiate(prefab);
            ViewManager.show({
                node: levelSelect,
                name: "LevelSelect"
            });
        });
        // App.gameCtr.curLevel = LevelConfig.getCurLevel();
        // App.GoGame();
    }
    onClick_shopBtn() {
        AudioManager.getInstance().playSound('button_click');
        // App.view.openView(ViewName.Single.eBuyView);
        LoaderManeger.instance.loadPrefab('prefab/ui/getGold').then((prefab) => {
            let getGold = instantiate(prefab);
            ViewManager.show({
                node: getGold,
                name: "GetGold"
            });
        });
    }

    onClick_settingBtn() {
        AudioManager.getInstance().playSound('button_click');
        // App.view.openView(ViewName.Single.eSettingView);
        LoaderManeger.instance.loadPrefab('prefab/ui/settingGameView').then((prefab) => {
            let setting = instantiate(prefab);
            ViewManager.show({
                node: setting,
                name: "SettingGameView"
            });
        });
    }
    onClick_uppaotaBtn() {
        AudioManager.getInstance().playSound('button_click');
        // App.view.openView(ViewName.Single.eSettingView);
        LoaderManeger.instance.loadPrefab('prefab/ui/UpTurret').then((prefab) => {
            let uppaota = instantiate(prefab);
            ViewManager.show({
                node: uppaota,
                name: "UpTurret"
            });
        });
    }

    onClick_upgradeFruitBtn() {
        AudioManager.getInstance().playSound('button_click');
        LoaderManeger.instance.loadPrefab('prefab/ui/upgradeFruit').then((prefab) => {
            let upgradeFruit = instantiate(prefab);
            ViewManager.show({
                node: upgradeFruit,
                name: "UpgradeFruit"
            });
        });
    }

    onClick_levelBtn() {
        AudioManager.getInstance().playSound('button_click');
        LoaderManeger.instance.loadPrefab('prefab/ui/levelSelect').then((prefab) => {
            let levelSelect = instantiate(prefab);
            ViewManager.show({
                node: levelSelect,
                name: "LevelSelect"
            });
        });
    }
}


