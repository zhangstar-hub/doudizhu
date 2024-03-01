import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Poker')
export class Poker extends Component {
    private value: number = 0;
    private backSp: SpriteFrame = null!;
    private valueSp: SpriteFrame = null!;
    private sprite: Sprite  = null!;
    public selected: boolean = false;

    public Init(value: number, backSp: SpriteFrame, valueSp: SpriteFrame ): void {
        this.value = value;
        this.backSp = backSp;
        this.valueSp = valueSp; 
        this.sprite = this.node.getComponent(Sprite);
    }

    public ShowBack() {
        this.sprite.spriteFrame = this.backSp; 
    }

    public ShowValue() { 
        this.sprite.spriteFrame = this.valueSp; 
    }

    public PokerValue() { 
        return this.value;
    }
}

