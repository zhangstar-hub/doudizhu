import { _decorator, Component, Node } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
import { CNet } from './network/Network';
const { ccclass, property } = _decorator;

@ccclass('Desk')
export class Desk extends Component {
    start() {
        EventCenter.on(GameEvent.ReqEnterRoom, this.ReqEnterRoom, this);
        CNet.send({
            cmd: 'ReqEnterRoom',
            data: {}
        })
        console.log("enterRoom");
    }

    update(deltaTime: number) {
        
    }

    public ReqEnterRoom(data: {[key:string]:any}): void {
        console.log(data);
    }
}

