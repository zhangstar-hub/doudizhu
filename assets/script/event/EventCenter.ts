import { _decorator, Component, EventTarget, Node } from 'cc';
import { GameEvent } from './GameEvent';
const { ccclass, property } = _decorator;

@ccclass('EventCenter')
export class EventCenter extends EventTarget {
    private static __instance: EventCenter = null;
    public static getInstance(): EventCenter {
        if(EventCenter.__instance === null) {
            EventCenter.__instance = new EventCenter();
        }
        return EventCenter.__instance;
    }

    public static on(type: GameEvent, callback: (...args: any[]) => void, target?: any) {
        this.getInstance().on(type, callback, target);
    }

    public static once(type: GameEvent, callback: (...args: any[]) => void, target?: any) {
        this.getInstance().once(type, callback, target);
    }

    public static off(type: GameEvent, callback?: (...args: any[]) => void, target?: any) {
        this.getInstance().off(type, callback, target);
    }

    public static targetOff(target: Object) {
        this.getInstance().targetOff(target);
    }

    public static emit(type: GameEvent, args0?: any, args1?: any, args2?: any, args3?: any, args4?: any) {
        this.getInstance().emit(type, args0, args1, args2, args3, args4);
    }

}

