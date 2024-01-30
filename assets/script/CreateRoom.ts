import { _decorator, Component, Node, Button, EventTouch, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CreateRoomWindow')
export class CreateRoomWindow extends Component {

    @property(Button)
    buttons: Button[] = [];

    // 选中的挡位
    public choseSection: number = 0;

    start() {
        this.buttons.forEach(button => {
            button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        });
    }

    public onCloseRoomBtnClick(){
        this.node.active = false;
    }

    public onCreateRoomBtnClick(){
        console.log("onCreateRoomBtnClick");
    }

    onButtonClick(event: EventTouch) {
        this.buttons.forEach((btn, index) => {
            if (event.target === btn.node) {
                this.choseSection = index;
                tween(btn.node).to(0.1, {scale: new Vec3(1.2, 1.2, 1)}).start();
            }else {
                tween(btn.node).to(0.1, {scale: new Vec3(1, 1, 1)}).start();
            }
        });
    }
}

