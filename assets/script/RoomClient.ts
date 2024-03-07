import { _decorator, AssetManager, assetManager, view, Component, director, Label, Node, Prefab, resources, Sprite, SpriteAtlas, SpriteFrame, Texture2D, NodeEventType, EventTouch, Button, UITransform, log, instantiate, Color } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
import { CNet } from './network/Network';
import { PokerFactory } from './component/PokerFactory';
import { Poker } from './component/Poker';
const { ccclass, property } = _decorator;


interface Player {
    id?: number;
    name?: string;
    coin?: number;
    avatar?: string;
    desk_id?: number;
    call_score?: number;
    role?: number;
    card_num?: number;
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
    @property({group: {name: 'user_0'}, type: Node})
    ReadyBtn_0: Node = null!;
    @property({group: {name: 'user_0'}, type: Label})
    ReadyBtnText_0: Label = null!;
    @property({group: {name: 'user_0'}, type: Label})
    CallScoreText_0: Label = null!;
    @property({group: {name: 'user_0'}, type: Node})
    Arrow_0: Node = null!;
    @property({group: {name: 'user_0'}, type: Node})
    PokerArea_0: Node = null!;

    @property({group: {name: 'user_1'}, type: Sprite})
    user_1_avatar: Sprite = null!;
    @property({group: {name: 'user_1'}, type: Label})
    user_1_name: Label = null!;
    @property({group: {name: 'user_1'}, type: Label})
    user_1_coin: Label = null!;
    @property({group: {name: 'user_1'}, type: Node})
    ReadyBtn_1: Node = null!;
    @property({group: {name: 'user_1'}, type: Label})
    ReadyBtnText_1: Label = null!;
    @property({group: {name: 'user_1'}, type: Label})
    CallScoreText_1: Label = null!;
    @property({group: {name: 'user_1'}, type: Node})
    Arrow_1: Node = null!;
    @property({group: {name: 'user_1'}, type: Node})
    PokerArea_1: Node = null!;

    @property({group: {name: 'user_2'}, type: Sprite})
    user_2_avatar: Sprite = null!;
    @property({group: {name: 'user_2'}, type: Label})
    user_2_name: Label = null!;
    @property({group: {name: 'user_2'}, type: Label})
    user_2_coin: Label = null!;
    @property({group: {name: 'user_2'}, type: Node})
    ReadyBtn_2: Node = null!;
    @property({group: {name: 'user_2'}, type: Label})
    ReadyBtnText_2: Label = null!;
    @property({group: {name: 'user_2'}, type: Label})
    CallScoreText_2: Label = null!;
    @property({group: {name: 'user_2'}, type: Node})
    Arrow_2: Node = null!;
    @property({group: {name: 'user_2'}, type: Node})
    PokerArea_2: Node = null!;

    // 叫分按钮 1-3分
    @property(Node)
    CallScoreBtn_0: Node = null!;
    @property(Node)
    CallScoreBtn_1: Node = null!;
    @property(Node)
    CallScoreBtn_2: Node = null!;
    @property(Node)
    CallScoreBtn_3: Node = null!;

    // 出牌按钮
    @property(Node)
    PlayPoker: Node = null!;
    // 不出牌按钮
    @property(Node)
    NoPlayPoker: Node = null!;
    // 公共出牌区域
    @property(Node)
    PublicPokerArea: Node = null!;
    // 底牌区域
    @property(Node)
    LastPokerArea: Node = null!;
    // 积分倍数展示
    @property(Label)
    ScoreMultiLabel: Label = null!;

    // 结算弹出
    @property(Node)
    SettleView: Node = null!

    room_id: number = 0;    // 房间ID
    game_status: number = 0;    // 游戏状态 0：准备 1：叫分 2：进行
    score: number = 0;  // 分数
    call_desk: number = 0;  // 出手的座位号
    max_call_score: number = 0;     // 当前最大叫份

    my_cards = [];  // 我的卡片
    played_cards = []; // 最近一次的出牌
    players: Player[] = []; // 全部玩家信息

    private play_cards_lock: boolean = false;
    private default_player: Player = {
        coin: 0,
        name: '',
        avatar: '0',
        card_num: 0,
    };

    private gameGundle: AssetManager.Bundle = null!;
    private pokerAtlas: SpriteAtlas = null!;
    private pokerViewPrefab: Prefab = null!;
    private pokerBackSp: SpriteFrame = null!;

    public onLoad(): void {
        assetManager.loadBundle('resources', (error, bundle: AssetManager.Bundle) => { 
            this.gameGundle = bundle;
            this.gameGundle.load("/img/back/spriteFrame", SpriteFrame, (err, pokerBackSp: SpriteFrame) => {
                console.log("pokerBackSp", pokerBackSp);
                this.pokerBackSp = pokerBackSp;
                this.onLoadPokerAtlas();
            })
        });
    }

    private onLoadPokerAtlas(): void { 
        this.gameGundle.load("img/poker", SpriteAtlas, (err, altas: SpriteAtlas) => { 
            this.pokerAtlas = altas;
            this.onLoadPokerPrefab();
        });
    }

    private onLoadPokerPrefab() {
        this.gameGundle.load("prefabs/PokerView", Prefab, (err, prefab: Prefab) => { 
            this.pokerViewPrefab = prefab;
            this.enterGame();
        });
    }

    private enterGame() {
        EventCenter.on(GameEvent.ReqEnterRoom, this.ReqEnterRoom, this);
        EventCenter.on(GameEvent.ReqEnterNewRoom, this.ReqEnterRoom, this);
        EventCenter.on(GameEvent.ReqLeaveRoom, this.ReqLeaveRoom, this);
        EventCenter.on(GameEvent.ReqRoomReady, this.ReqRoomReady, this);
        EventCenter.on(GameEvent.ReqCallScore, this.ReqCallScore, this);
        EventCenter.on(GameEvent.ReqWatchCards, this.ReqWatchCards, this);
        EventCenter.on(GameEvent.ReqPlayCards, this.ReqPlayCards, this);
        EventCenter.on(GameEvent.ReqEnterRoomUpdate, this.ReqEnterRoomUpdate, this);
        EventCenter.on(GameEvent.ReqLeaveRoomUpdate, this.ReqLeaveRoomUpdate, this);
        EventCenter.on(GameEvent.ReqRoomReadyUpdate, this.ReqRoomReadyUpdate, this);
        EventCenter.on(GameEvent.ReqCallScoreUpdate, this.ReqCallScoreUpdate, this);
        EventCenter.on(GameEvent.ReqPlayCardsUpdate, this.ReqPlayCardsUpdate, this);

        if (globalThis.RoomBaseScore == undefined) {
            CNet.send({
                cmd: 'ReqEnterRoom',
                data: {} 
            })
        }else {
            CNet.send({
                cmd: 'ReqEnterNewRoom',
                data: {
                    "base_score": globalThis.RoomBaseScore,
                } 
            })
        }
    }

    // init player
    private initPlayer(players: Player[]){
        for (let i = 0; i < this.players.length; i++) {
            for (const p of players) {
                if (p.id == this.players[i].id) {
                    this.players[i] = p;
                    break;
                }
            }
        }
    }

    // 回到房间事件
    public onClickBackHall() {
        CNet.send({
            cmd: 'ReqLeaveRoom',
            data: {}
        })
    }

    // 准备
    public onClickReady() {
        const my_player = this.players[0];
        my_player.is_ready = !my_player.is_ready;
        CNet.send({
            cmd: 'ReqRoomReady',
            data: {
                'is_ready': my_player.is_ready,
            }
        })
    }

    // 叫分
    public onClickCallScore(event:Event,custom:string) {
        CNet.send({
            cmd: 'ReqCallScore',
            data: {
                'score': parseInt(custom),
            }
        })
    }

    // 出牌
    public onClickPlayPoker(event:Event) {
        const played_cards = [];
        this.PokerArea_0.children.forEach((node: Node) => {
            const poker = node.getComponent(Poker);
            if (poker.selected) {
                played_cards.push(poker.PokerValue());
            }
        });
        if (played_cards.length <= 0) {
            return;
        }
        if (this.play_cards_lock) {
            return
        }
        this.play_cards_lock = true;
        CNet.send({
            cmd: 'ReqPlayCards',
            data: {
                'cards': played_cards,
            }
        })
    }

    // 不出牌
    public onClickNoPlayPoker(event:Event) {
        if (this.play_cards_lock) {
            return
        }
        this.play_cards_lock = true;
        CNet.send({
            cmd: 'ReqPlayCards',
            data: {
                'cards': [],
            }
        })
    }

    // 关闭结算弹出 重置数据
    public onClickCloseSettle() {
        this.SettleView.active = false;
        this.game_status = 0;
        this.my_cards = [];
        this.max_call_score = 0;
        this.players.forEach((p, idx) => {
            if (p.id) {
                this.renderPlayer(p)
            }
        })
        this.renderPublicCards([]);
        this.showReadyBtn();
        this.showArrow();
        this.showPlayCardBtn();
        this.showCallScore();
        this.renderLastCards([]);
        this.node.getChildByName("Mask").active = false;
    }

    // 进入房间
    public ReqEnterRoom(data: {[key:string]:any}): void {
        console.log(data);
        const room_data = data.room;
        this.room_id = room_data.room_id;
        this.game_status = room_data.game_status;
        this.score = room_data.score;
        this.call_desk = room_data.call_desk;
        this.my_cards = room_data.cards;
        this.played_cards = room_data.played_cards;
        this.max_call_score = room_data.max_call_score;

        let index = 0;
        for (var i = 0; i < room_data.players.length; i++) {
            if (room_data.players[i].id === globalThis.UserInfo.id) {
                index = i;
                break;
            }
        }
        this.players.push(...room_data.players.slice(index, room_data.players.length));
        this.players.push(...room_data.players.slice(0, index));
        
        this.players.forEach((v)=>{
            if (v.id) {
                this.renderPlayer(v)
            }
        })
        this.showReadyBtn();
        this.showCallScore();
        this.showArrow();
        this.showPlayCardBtn();
        this.renderPublicCards(this.played_cards);
        this.renderLastCards(room_data.last_cards);
        this.renderScoreMulti(room_data.score_multi);
    }

    // 离开房间
    public ReqLeaveRoom(data: {[key:string]:any}) {
        director.loadScene("HallScence");
    }

    // 准备
    public ReqRoomReady(data: {[key:string]:any}) {
        if (data.error) {
            console.error("Error: " + data.error);
            return
        }
        this.game_status = data.game_status;
        this.call_desk = data.call_desk;
        this.showReadyBtn();
        this.showCallScore();
        this.showArrow();
        if (this.game_status == 1) {
            CNet.send({
                cmd: 'ReqWatchCards',
                data: {}
            })
            this.renderLastCards([]);
        }
    }

    // 叫分
    public ReqCallScore(data: {[key:string]:any}) {
        if (data.error) {
            return
        }
        this.game_status = data.game_status;
        this.call_desk = data.call_desk;
        this.max_call_score = Math.max(data.max_call_score, this.max_call_score);
        for (const player of this.players) {
            if (globalThis.UserInfo.id == player.id) {
                player.call_score = data.call_score;
                break;
            }
        }
        if (this.game_status == 2) {
            this.renderLastCards(data.last_cards);
            CNet.send({
                cmd: 'ReqWatchCards',
                data: {}
            })
        }
        this.showCallScore();
        this.showArrow();
        this.showPlayCardBtn();
        this.renderScoreMulti(data.score_multi);
    }

    // 看牌
    public ReqWatchCards(data: {[key:string]:any}) {
        if (data.error) {
            return
        }
        this.game_status = data.game_status;
        this.my_cards = data.cards;
        this.initPlayer(data.players);
        this.players.forEach((val, idx)=>{
            if (idx == 0) {
                this.renderHoldCards(idx, this.my_cards)
            }else {
                this.renderHoldCards(idx, Array(val.card_num).fill(101))
            }
        })
        this.showArrow();
    }

    // 出牌
    public ReqPlayCards(data: {[key:string]:any}) {
        this.play_cards_lock = false;
        if (data.error) {
            return
        }
        this.game_status = data.game_status;
        this.my_cards = data.cards;
        this.call_desk = data.call_desk;
        this.played_cards = data.played_cards;
        this.PokerArea_0.removeAllChildren();

        // 游戏结束
        if (this.game_status == 3) {
            for (const p of data.players_cards) {
                this.renderHoldCards(p.desk_id, p.cards);
            }
            const win_coins = data.settle_info.win_coins_data[`${this.players[0].id}`].win_coins;
            const win_role = data.settle_info.win_role;
            this.renderSettle(win_role, win_coins);
            this.initPlayer(data.settle_info.players);
            this.showPlayCardBtn();
        } else {
            this.renderHoldCards(0, this.my_cards);
        }
        this.renderPublicCards(this.played_cards);
        this.showArrow();
        this.renderScoreMulti(data.score_multi);
    }

    // 其他人进入房间 更新信息
    public ReqEnterRoomUpdate(data: {[key:string]:any}): void {
        const message = data.message;
        const position: number = this.getPosition(message.desk_id);
        this.players[position] = data.message;
        this.renderPlayer(this.players[position]);
    }

    // 其他人离开房间 更新信息
    public ReqLeaveRoomUpdate(data: {[key:string]:any}): void {
        const from_uid = data.from_uid;
        console.log(this.players);
        for (var i = 0; i < this.players.length; i++) {
            console.log(i, from_uid, this.players[i].id);
            if (from_uid == this.players[i].id) {
                this.renderPlayer(this.default_player, i);
                this.players[i] = {};
                break;
            }
        }
    }

    // 其他人准备 更新信息
    public ReqRoomReadyUpdate(data: {[key:string]:any}): void {
        const from_uid = data.from_uid;
        const is_ready = data.message.is_ready;
        this.game_status = data.message.game_status;
        this.call_desk = data.message.call_desk;

        if (this.game_status == 1) {
            CNet.send({
                cmd: 'ReqWatchCards',
                data: {}
            })
            this.renderLastCards([]);
        }
        for (const player of this.players) {
            if (player.id == from_uid) {
                player.is_ready = is_ready;
                break;
            }
        }
        this.showReadyBtn();
        this.showArrow();
        this.showCallScore();
    }

    // 其他人叫分 更新信息
    public ReqCallScoreUpdate(data: {[key:string]:any}) {
        if (data.error) {
            console.error("Error: " + data.error);
            return
        }
        this.game_status = data.message.game_status;
        this.call_desk = data.message.call_desk;
        this.max_call_score = Math.max(data.message.max_call_score, this.max_call_score);
        for (const player of this.players) {
            if (player.id == data.from_uid) {
                player.call_score = data.message.call_score;
                break;
            }
        }
        if (this.game_status == 2) {
            this.renderLastCards(data.message.last_cards);
            CNet.send({
                cmd: 'ReqWatchCards',
                data: {}
            })
        }
        this.showCallScore();
        this.showArrow();
        this.showPlayCardBtn();
        this.renderScoreMulti(data.message.score_multi);
    }

    // 其他人出牌 更新信息
    public ReqPlayCardsUpdate(data: {[key:string]:any}) {
        if (data.error) {
            return
        }
        console.log("ReqPlayCardsUpdate: ", data);
        this.game_status = data.message.game_status;
        this.call_desk = data.message.call_desk;
        this.played_cards = data.message.played_cards;
        for (const player of this.players) {
            if (player.id == data.from_uid){
                player.card_num = data.message.card_num;
                const position = this.getPosition(player.desk_id);
                this.renderHoldCards(position, Array(player.card_num).fill(101));
                break;
            }
        }
        if (this.played_cards.length > 0) {
            this.renderPublicCards(this.played_cards);            
        }

        // 游戏结束
        if (this.game_status == 3) {
            for (const p of data.message.players_cards) {
                this.renderHoldCards(p.desk_id, p.cards);
            }
            this.initPlayer(data.message.settle_info.players);
            const win_coins = data.message.settle_info.win_coins_data[`${this.players[0].id}`].win_coins;
            const win_role = data.message.settle_info.win_role;
            this.renderSettle(win_role, win_coins);
            this.showPlayCardBtn();
        }
        this.showArrow();
        this.renderScoreMulti(data.message.score_multi);
    }

    // 渲染用戶信息
    private renderPlayer(player: Player, position?: number): void {
        if (position == undefined) {
            position = this.getPosition(player.desk_id);
        }
        const user_name: Label = this[`user_${position}_name`];
        const user_coin: Label = this[`user_${position}_coin`];
        const user_avatar: Sprite = this[`user_${position}_avatar`];
        const ReadyBtnText: Label = this[`ReadyBtnText_${position}`];

        const avatarUrl = `img/avatar/${player.avatar}/spriteFrame`
        this.gameGundle.load(avatarUrl, SpriteFrame, (err, spriteFrame: SpriteFrame) => {
            user_avatar.spriteFrame = spriteFrame;
        })
        user_name.string = `Name: ${player.name}`;
        user_coin.string = `Coin: ${player.coin}`;
        
        if (player.is_ready) {
            ReadyBtnText.string = "已准备"
        } else {
            ReadyBtnText.string = "未准备"
        }
        if (position === 0) {
            this.renderHoldCards(position, this.my_cards)
        }else {
            this.renderHoldCards(position, Array(player.card_num).fill(101))
        }
    }

    // 渲染卡牌
    private renderHoldCards(position: number, cards: number[]) {
        const pokerArea = this[`PokerArea_${position}`];
        pokerArea.removeAllChildren();
        pokerArea.addComponent(PokerFactory).Init(this.pokerAtlas, this.pokerViewPrefab, this.pokerBackSp);
        var xpos = 0;
        var ypos = 0;
        if (position == 0) {
            var width = pokerArea.getComponent(UITransform).width;
            var xpos = Math.floor((width - (cards.length * 25)) / 2);
        }
        for (var i = 0; i < cards.length; i++) { 
            var poker = PokerFactory.Instance.CreatePoker(cards[i]); 
            if (position == 0) {
                poker.ShowValue();
                poker.node.setPosition(xpos, ypos);
                // 卡片监听 出牌选中
                poker.node.on(NodeEventType.TOUCH_END, function(event: EventTouch){
                    const {x:x, y:y} = this.node.getPosition();
                    if (this.selected == true) {
                        this.node.setPosition(x, y - 20)
                    }else {
                        this.node.setPosition(x, y + 20)
                    }
                    this.selected = !this.selected;
                }, poker)
                xpos += 25;
            }else{
                if (this.game_status == 3) {
                    poker.ShowValue();
                }else{
                    poker.ShowBack();
                }
                poker.node.setPosition(xpos, ypos);
                xpos += 18;
            }
        }
    }

    // 渲染公告区域的卡
    private renderPublicCards(cards: number[]) {
        this.PublicPokerArea.removeAllChildren();
        this.PublicPokerArea.addComponent(PokerFactory).Init(
            this.pokerAtlas, this.pokerViewPrefab, this.pokerBackSp
        );
        var xpos = 0;
        var ypos = 0;
        this.PublicPokerArea.getScale
        var width = this.PublicPokerArea.getComponent(UITransform).width;
        var xpos = Math.floor((width - (cards.length * 25)) / 2);
        for (var i = 0; i < cards.length; i++) { 
            var poker = PokerFactory.Instance.CreatePoker(cards[i]); 
            poker.ShowValue();
            poker.node.setPosition(xpos, ypos);
            xpos += 25;
        }
    }

    // 渲染结算弹出
    private renderSettle(winRole: number, winCoin: number) {
        this.SettleView.active = true;
        const descCom = this.SettleView.getChildByName("Desc").getComponent(Label);
        if (winRole == this.players[0].role) {
            descCom.string = `你赢了${winCoin}!`;
        }else {
            descCom.string = `你输了${winCoin}!`;
        }
        this.node.getChildByName("Mask").active = true;
    }

    // 渲染底牌区域
    private renderLastCards(cards: number[]) {
        if (this.game_status > 0 && cards.length == 0) {
            cards = [301, 301, 301]
        }
        this.LastPokerArea.removeAllChildren();
        this.LastPokerArea.addComponent(PokerFactory).Init(
            this.pokerAtlas, this.pokerViewPrefab, this.pokerBackSp
        );
        var xpos = 0;
        var ypos = 0;
        this.LastPokerArea.getScale
        var width = this.LastPokerArea.getComponent(UITransform).width;
        var xpos = Math.floor((width - (cards.length * 25)) / 2);
        for (var i = 0; i < cards.length; i++) { 
            var poker = PokerFactory.Instance.CreatePoker(cards[i]); 
            if (this.game_status >= 2) {
                poker.ShowValue();
            }else {
                poker.ShowBack();
            }
            poker.node.setPosition(xpos, ypos);
            xpos += 70;
        }
    }

    // 渲染分数区
    private renderScoreMulti(value: number) {
        this.ScoreMultiLabel.string = value + '';
    }

    // 获取玩家的位置
    private getPosition(desk_id: number) {
        return (desk_id - this.players[0].desk_id + 3) % 3
    }

    // 展示ready button
    private showReadyBtn() {
        if (this.game_status != 0) {
            this.ReadyBtn_0.active = false;
            this.ReadyBtn_1.active = false;
            this.ReadyBtn_2.active = false;
            return;
        }
        this.ReadyBtn_0.active = true;
        this.ReadyBtn_1.active = true;
        this.ReadyBtn_2.active = true;

        this.players.forEach((v, idx) => {
            if (v.is_ready) {
                this[`ReadyBtnText_${idx}`].string = "已准备"
            }else {
                this[`ReadyBtnText_${idx}`].string = "未准备"
            }
        })
    }

    // 展示当前操作的人
    private showArrow() {
        if (this.game_status == 0) {
            this.Arrow_0.active = false;
            this.Arrow_1.active = false;
            this.Arrow_2.active = false;
            return
        }
        this.players.forEach((val, idx)=>{
            if (val.id && val.desk_id == this.call_desk) {
                this[`Arrow_${idx}`].active = true;
            }else {
                this[`Arrow_${idx}`].active = false;
            }
        })
    }

    // 展示叫分
    private showCallScore() {
        if (this.game_status != 1) {
            this.CallScoreBtn_0.active = false;
            this.players.forEach((v, idx) => {
                this[`CallScoreBtn_${idx + 1}`].active = false;
                this[`CallScoreText_${idx}`].node.active = false;
            });
            return;
        }
        this.CallScoreBtn_0.active = true;
        this.players.forEach((v, idx) => {
            const text = this[`CallScoreText_${idx}`];
            text.node.active = true;
            const btn = this[`CallScoreBtn_${idx + 1}`];
            btn.active = true;
            if (v.call_score == -1) {
                text.getComponent(Label).string = "";
            }else if (v.call_score == 0) {
                text.getComponent(Label).string = "不叫";
            }else {
                text.getComponent(Label).string = v.call_score + '分';
            }
            console.log(this.max_call_score, v.call_score);
            if (this.max_call_score > idx) {
                btn.getComponent(Button).interactable = false;
            }else {
                btn.getComponent(Button).interactable = true;
            }
        })
    }

    // 展示出牌按钮
    private showPlayCardBtn() {
        if (this.game_status != 2) {
            this.PlayPoker.active = false;
            this.NoPlayPoker.active = false;
            return;
        }
        this.PlayPoker.active = true;
        this.NoPlayPoker.active = true;
    }
}
