import { _decorator, Component } from "cc";
import { DouyinSideBar } from "./DouyinSideBar";

const { ccclass, property } = _decorator;

@ccclass
export default class GuideView extends Component {

    onButtonOkClick() {
        DouyinSideBar.navigateToDouyin((success) => {
            console.log('Jump to Douyin side bar:', success);
        });
    }
}
