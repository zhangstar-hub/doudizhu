import { _decorator, Component, Node, Button, EventTouch, tween, Vec3, director } from 'cc';
import { CNet } from './network/Network';
const { ccclass, property } = _decorator;

@ccclass('CreateRoomWindow')
export class CreateRoomWindow extends Component {

    @property(Button)
    buttons: Button[] = [];

    start() {
        this.buttons.forEach(button => {
            button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        });
    }

    public onCloseRoomBtnClick(){
        this.node.active = false;
    }

    public onCreateRoomBtnClick() {
        console.log(globalThis.RoomBaseScore);
        director.loadScene("RoomScence");
    }

    public onButtonClick(event: EventTouch) {
        this.buttons.forEach((btn, index) => {
            if (event.target === btn.node) {
                globalThis.RoomBaseScore = [1,5,10][index];
                tween(btn.node).to(0.1, {scale: new Vec3(1.2, 1.2, 1)}).start();
            }else {
                tween(btn.node).to(0.1, {scale: new Vec3(1, 1, 1)}).start();
            }
        });
    }
}

