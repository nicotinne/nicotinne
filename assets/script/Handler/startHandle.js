
const User = require("User");
const emitter = require("mEmitter");
cc.Class({
    extends: cc.Component,

    properties: {

        btnPlay: cc.Button,
        btnRank: cc.Button,
        startAudio: {
            default: null,
            type: cc.AudioClip
        },
        openStart: null,
        clickPlay: null,
        users: [],
    },

    // LIFE-CYCLE CALLBACKS:
    startSound: function () {
        cc.audioEngine.playEffect(this.startAudio, false);
    },
    onLoad() {
        this.openStart = this.doOpenStart.bind(this);
        emitter.instance.registerEvent("OPEN_START", this.openStart);
    },

    start() {
        this.btnRank.node.on("click", this.onClickRank, this);
        this.btnPlay.node.on("click", this.onClickPlay, this);
    },

    onClickPlay() {
        let action = cc.callFunc(this.startSound, this);
        this.node.runAction(action);
        emitter.instance.emit("PLAYING", this.node);
    },


    onClickRank() {
        emitter.instance.emit("RANK", this.node);
        emitter.instance.emit("RENDER");
    },

    doOpenStart() {
    }


    // update (dt) {},
});