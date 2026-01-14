import { _decorator, Component, Label, Node } from 'cc';
import GameData from '../Common/GameData';
const { ccclass, property } = _decorator;

@ccclass('slefGold')
export class slefGold extends Component {
    @property(Label)
    Labeln: Label = null;
    start() {
        this.Labeln.string = GameData.getGold().toString();
    }

    update(deltaTime: number) {
        
    }
}


