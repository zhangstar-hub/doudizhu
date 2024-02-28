import { _decorator, Component, Label, resources, Texture2D, SpriteFrame, Sprite, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HallClient')
export class HallClient extends Component {
    @property(Label)
    public ID: Label = null!;

    @property(Label)
    public Name: Label = null!;

    @property(Sprite)
    public Avatar: Sprite = null!;

    @property(Node)
    public CreationRoom: Node = null!;

    @property(Node)
    public JoinRoom: Node = null!;

    start() {
        console.log("hall");
        
        this.ID.string = "ID:" + globalThis.UserInfo.id;
        this.Name.string = globalThis.UserInfo.usernname;
        
        const avatarUrl = `img/avatar/${globalThis.UserInfo.avatar}/texture`
        resources.load(avatarUrl, Texture2D, (err: any, texture: Texture2D) => {
            if (err) {
                console.error(err);
                return;
            }
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            this.Avatar.spriteFrame = spriteFrame;
          });
    }

    update(deltaTime: number) {
        
    }

    public onCreateRoom(){
        this.CreationRoom.active = true;
    }

    public onJoinRoom() {
        director.loadScene("RoomScence");
    }
}

