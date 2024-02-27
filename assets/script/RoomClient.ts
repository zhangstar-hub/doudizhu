import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame, Texture2D } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
import { CNet } from './network/Network';
const { ccclass, property } = _decorator;


interface Player {
    id?: number;
    name?: string;
    coin?: number;
    avatar?: string;
    desk_id?: number;
    call_score?: number;
    role?: number;
    card_number?: number;
    is_ready?: boolean;
};


@ccclass('RoomClient')
export class RoomClient extends Component {

    @property({group: {name: 'user_0'}, type: Sprite})
    public user_0_avatar: Sprite = null!;
    @property({group: {name: 'user_0'}, type: Label})
    public user_0_name: Label = null!;
    @property({group: {name: 'user_0'}, type: Label})
    public user_0_coin: Label = null!;

    @property({group: {name: 'user_1'}, type: Sprite})
    user_1_avatar: Sprite = null!;
    @property({group: {name: 'user_1'}, type: Label})
    user_1_name: Label = null!;
    @property({group: {name: 'user_1'}, type: Label})
    user_1_coin: Label = null!;

    @property({group: {name: 'user_2'}, type: Sprite})
    user_2_avatar: Sprite = null!;
    @property({group: {name: 'user_2'}, type: Label})
    user_2_name: Label = null!;
    @property({group: {name: 'user_2'}, type: Label})
    user_2_coin: Label = null!;

    room_id: number = 0;
    game_stauts: number = 0;
    score: number = 0;
    call_desk: number = 0;
    
    my_cards = [];
    my_player: Player = null;
    players: Player[] = [];

    start() {
        EventCenter.on(GameEvent.ReqEnterRoom, this.ReqEnterRoom, this);
        EventCenter.on(GameEvent.ReqEnterRoomUpdate, this.ReqEnterRoomUpdate, this);
        EventCenter.on(GameEvent.ReqLeaveRoomUpdate, this.ReqLeaveRoomUpdate, this);
        CNet.send({
            cmd: 'ReqEnterRoom',
            data: {}
        })
    }

    update(deltaTime: number) {
    }

    // 进入房间
    public ReqEnterRoom(data: {[key:string]:any}): void {
        const room_data = data.room;
        
        this.room_id = room_data.room_id;
        this.game_stauts = room_data.game_stauts;
        this.score = room_data.score;
        this.call_desk = room_data.call_desk;
        this.my_cards = room_data.cards;
        
        let index = 0;
        for (var i = 0; i < room_data.players.length; i++) {
            if (room_data.players[i].id === globalThis.UserInfo.id) {
                index = i;
                break;
            }
        }
        this.my_player = this.players[index];
        this.players.push(...room_data.players.slice(index, room_data.players.length));
        this.players.push(...room_data.players.slice(0, Math.max(0, index - 1)));
        this.players.forEach((v, idx)=>{
            if (v.id) {
                console.log(v.id);
                this.initPlayer(v.id, v.coin, v.avatar, v.name, idx)
            }
        })
    }

    // 其他人进入房间 更新信息
    public ReqEnterRoomUpdate(data: {[key:string]:any}): void {
        const message = data.message;
        this.players[message.desk_id] = data.message;
        this.initPlayer(message.id, message.coin, message.avatar, message.name, message.desk_id);
    }

    // 其他人离开房间 更新信息
    public ReqLeaveRoomUpdate(data: {[key:string]:any}): void {
        const from_uid = data.from_uid;
        for (var i = 0; i < this.players.length; i++) {
            if (from_uid == this.players[i].id) {
                this.initPlayer(from_uid, 0, "0", "", i);
                this.players[i] = {};
                break;
            }
        }
    }

    // 渲染用戶信息
    initPlayer(uid: number, coin: number, avatar: string, name: string, position: number) {
        var user_name: Label = this[`user_${position}_name`];
        var user_coin: Label = this[`user_${position}_coin`];
        var user_avatar: Sprite = this[`user_${position}_avatar`];

        const avatarUrl = `img/avatar/${avatar}/texture`
        resources.load(avatarUrl, Texture2D, (err: any, texture: Texture2D) => {
            if (err) {
                console.error(err);
                return;
            }
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            user_avatar.spriteFrame = spriteFrame;
        });
        user_name.string = `Name: ${name}`;
        user_coin.string = `Coin: ${coin}`;
    }
}
