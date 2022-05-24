
const emitter = require("mEmitter");
cc.Class({
    extends: cc.Component,

    properties: {
        lblScore: cc.Label,
        btnReplay: cc.Button,
        btnQuit: cc.Button,
        lblBestScore: cc.Label,
        restartAudio: {
            default: null,
            type: cc.AudioClip
        },
        replay: null,
        quit: null,
    },

    // LIFE-CYCLE CALLBACKS:
    restartSound: function () {
        cc.audioEngine.playEffect(this.restartAudio, false);
    },
    onLoad() {
        this.bestScore = this.onBestScore.bind(this);
        emitter.instance.registerEvent("BEST_SCORE", this.bestScore);
    },

    start() {
        this.btnReplay.node.on("click", this.onReplay, this);
        this.btnQuit.node.on("click", this.onQuit, this);
    },

    onReplay() {
        let action = cc.callFunc(this.restartSound, this);
        this.node.runAction(action);
        emitter.instance.emit("PLAYING");
        cc.log("replay");
    },

    onQuit() {
        emitter.instance.emit("DEFAULT");
        cc.log("quit");
    },

    onBestScore(bestScore) {
        this.lblBestScore.string = bestScore;
    },

    // update (dt) {},
});