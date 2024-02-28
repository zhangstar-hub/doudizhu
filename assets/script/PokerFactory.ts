import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import { Poker } from './network/Poker';
const { ccclass, property } = _decorator;

@ccclass('PokerFactory')
export class PokerFactory extends Component {
    public static Instance: PokerFactory = null!;

    private pokerAtlas: SpriteAtlas = null!;
    private pokerPrefab: Prefab = null!;
    private pokerBackSp: SpriteFrame = null!;

    public Init(pokerAtlas: SpriteAtlas, pokerPrefab: Prefab, pokerBackSp: SpriteFrame): void {
        PokerFactory.Instance = this;
        this.pokerAtlas = pokerAtlas;
        this.pokerPrefab = pokerPrefab;
        this.pokerBackSp = pokerBackSp;
    }

    private valueToName(value: number): string { 
        const val = value % 100;
        const suit = Math.floor(value / 100);;
        return `${suit}_${val}`;
    }

    public CreatePoker(pokerValue: number):  Poker {
        var poker = instantiate(this.pokerPrefab);
        this.node.addChild(poker);

        var pokerCtrl = poker.addComponent(Poker); 
        var pokerName: string = this.valueToName(pokerValue);
        var valueSp = this.pokerAtlas.getSpriteFrame(pokerName); 
        pokerCtrl.Init(pokerValue, this.pokerBackSp, valueSp);
        return pokerCtrl;
    }
}

