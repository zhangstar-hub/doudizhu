import { _decorator, Component, EventTarget, EditBox } from 'cc';
import { CNet } from "./network/Network";

const { ccclass, property } = _decorator;

const eventTraget = new EventTarget()
globalThis._eventTraget = eventTraget;

@ccclass('loginClient')
export class loginClient extends Component {

    @property(EditBox)
    public AccountEditBox: EditBox = null!;

    @property(EditBox)
    public PwsEditBox: EditBox = null!;

    start() {
        this._init();
    }

    update(deltaTime: number) {
    }

    private _init(){
        CNet.connect('172.30.22.135', 8080);
    }

    public handleMessage({ cmd, data }: { cmd: string; data: { [key: string]: any } }): void {
        globalThis._eventTraget.emit(cmd, data);
    }

    public onLoginBtnClick() { 
        const name = this.AccountEditBox.string;
        const password = this.PwsEditBox.string;
        CNet.send({
            cmd: 'ReqLogin',
            data: {
                name: name,
                password: password
            }
        })
    }
    
}

