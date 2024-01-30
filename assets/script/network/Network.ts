import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import Socket from "./Socket";

type Message = {cmd:string, data: {[key:string]:any}}
// 是否输出日志
const LOG_ENABLED: boolean = true;

@ccclass
export class Network {

    // 单例
    private static _inst: Network;
    public static get inst() {
        return Network._inst || (Network._inst = new Network());
    }

    // 连接超时时间
    private readonly timeout: number;
    // 最大重连次数
    private readonly reConnectMaxCount: number;
    // 尝试重连时间间隔
    private readonly reConnectTimeInterval: number;

    // socket
    private m_socket: Socket;
    // ip
    private m_ip: string;
    // port
    private m_port: number;
    // 重连次数
    private m_reConnectCount: number;
    // 重连Handle
    private m_reConnectHandle: any;

    constructor() {
        /**
         *  config
         */
        // 连接超时时间
        this.timeout = 30000;
        // 最大重连次数
        this.reConnectMaxCount = 3;
        // 尝试重连时间间隔
        this.reConnectTimeInterval = 2000;

        /**
          *  init
          */
        this.m_socket = null;
        this.m_reConnectCount = 0;
    }

    /**
     * 连接状态
     */
    public get connectState() {
        if (this.m_socket) {
            return this.m_socket.state;
        }
        return -1;
    }

    /**
     * 建立连接
     * @param ip ip
     * @param port port
     */
    public connect(ip: string, port: number, connectCallback?: Function) {
        this.m_ip = ip;
        this.m_port = port;

        if (this.connectState == -1 || this.connectState == WebSocket.CLOSED) {
            if (!this.m_socket) {
                if (connectCallback) {
                    connectCallback = this.onConnect;
                }
                this.m_socket = new Socket(this, connectCallback, this.onClose, this.onMessage, this.onError, this.onTimeout);
            }
            this.m_socket.connect(ip, port, this.timeout);
        }
    }

    /**
     * 重新连接
     */
    public reConnect() {
        if (LOG_ENABLED) console.log(`network -> reConnect count:${this.m_reConnectCount}`);

        if (this.m_reConnectCount <= this.reConnectMaxCount) {
            this.m_reConnectCount++;
            this.connect(this.m_ip, this.m_port, this.onReConnect);
        }
        else {
            if (LOG_ENABLED) console.log("network -> reConnect failed");

            // 重置重连次数
            this.m_reConnectCount = 0;

            // TODO 弹出提示是否再次重新连接
        }
    }

    /**
     * 自动重连
     */
    private autoReConnect() {
        // 清理重连Handle
        if (this.m_reConnectHandle) {
            clearTimeout(this.m_reConnectHandle);
        }
        // 启动定时重连
        let self = this;
        this.m_reConnectHandle = setTimeout(() => {
            self.reConnect();
        }, this.reConnectTimeInterval);
    }

    public send(msg: Message) {
        if(LOG_ENABLED) console.log(`network -> message: ${JSON.stringify(msg)}`);
        console.log(this.connectState);
        
        if (this.connectState == WebSocket.OPEN) {
            this.m_socket.send(JSON.stringify(msg));
        }
        else {
            // 回收销毁
            this.disponse();
            // 重新连接
            this.reConnect();
        }
    }

    /**
     * 回收销毁
     */
    private disponse() {
        // 清理重连Handle
        if (this.m_reConnectHandle) {
            clearTimeout(this.m_reConnectHandle);
        }

        // 清理socket 对象
        if (this.m_socket) {
            this.m_socket.disponse();
        }
        this.m_socket = null;
    }

    private onConnect(e: Event) {
        if (LOG_ENABLED) console.log(`network -> onConnect succeed! ip:${this.m_ip} port:${this.m_port}`);

        // 重置重连次数
        this.m_reConnectCount = 0;
    }

    private onReConnect(e: Event) {
        if (LOG_ENABLED) console.log(`network -> onReConnect succeed! ip:${this.m_ip} port:${this.m_port}`);

        // 重置重连次数
        this.m_reConnectCount = 0;
    }

    private onMessage(e: MessageEvent) {
        console.log(e.data);
        if (LOG_ENABLED) console.log(`network -> onMessage! data:${e.data}`);
    }

    private onClose(e: CloseEvent) {
        if (LOG_ENABLED) console.log("network -> onClose!");
        // 回收销毁
        this.disponse();

        // 自动重连
        this.autoReConnect();
    }

    private onError(e: Event) {
        if (LOG_ENABLED) console.log(`network -> onError! error:${e}`);
        // 回收销毁
        this.disponse();

        // 自动重连
        this.autoReConnect();
    }

    private onTimeout() {
        if (LOG_ENABLED) console.log("network -> onTimeout!");

        // 回收销毁
        this.disponse();

        // 自动重连
        this.autoReConnect();
    }
}

export var CNet = Network.inst;