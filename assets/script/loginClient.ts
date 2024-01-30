import { _decorator, Component, EventTarget, EditBox, director } from 'cc';
import { CNet } from "./network/Network";
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
const { ccclass, property } = _decorator;


@ccclass('loginClient')
export class loginClient extends Component {

    @property(EditBox)
    public AccountEditBox: EditBox = null!;

    @property(EditBox)
    public PwsEditBox: EditBox = null!;

    start() {
        CNet.connect('127.0.0.1', 8080);
        EventCenter.on(GameEvent.ReqLogin, this.ReqLogin, this);
        this.onKeepAlive();
    }

    public ReqLogin(data: {[key:string]:any}): void {
        if (data.error) {
            return;
        }
        const userData = data.user;
        globalThis.UserInfo.id = userData.id;
        globalThis.UserInfo.usernname = userData.name;
        globalThis.UserInfo.avatar = userData.avatar;
        globalThis.UserInfo.coin = userData.coin;
        director.loadScene("HallSence");
    }

    /**
     * 登陆请求
     */
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

    /**
     * 开启心跳检测
     */
    public onKeepAlive() {
        if (globalThis.startKeepAlive) {
            return;
        }
        globalThis.startKeepAlive = setInterval(() => {
            CNet.send({
                cmd: GameEvent.ReqKeepAlive,
                data: {},
            })
        }, 5000)
    }

    /**
     * 心跳处理函数
     */
    public ReqKeepAlive(data: {}) { 
        console.log(data);
    }
    
}

