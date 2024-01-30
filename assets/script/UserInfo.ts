import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UserInfo')
export class UserInfo extends Component {
    public id: number;
    public usernname: string;
    public avatar: string;
    public coin: number;

    public static _inst: UserInfo;
    public static get getInstance(){
        return this._inst || (this._inst = new UserInfo());
    }

    start() {
        globalThis.UserInfo = UserInfo.getInstance
    }

    update(deltaTime: number) {
        
    }
}

