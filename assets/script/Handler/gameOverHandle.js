
const User = require("User");
const emitter = require("mEmitter");
const db = JSON.parse(cc.sys.localStorage.getItem("users"));
cc.Class({
    extends: cc.Component,

    properties: {
        edbUsername: cc.EditBox,
        btnSubmit: cc.Button,
        lblScore: cc.Label,
        gameOverAudio: {
            default: null,
            type: cc.AudioClip
        },
        openGameOver: null,
        clickSubmit: null,
        users: [],
    },

    // LIFE-CYCLE CALLBACKS:
    gameOverSound: function () {
        cc.audioEngine.playEffect(this.gameOverAudio, false);
    },
    onLoad () {
        this.openGameOver = this.doOpenGameOver.bind(this);
        emitter.instance.registerEvent("OPEN_GAMEOVER", this.openGameOver);
    },

    start () {
        this.checkData();
        this.btnSubmit.node.on("click", this.doSubmit, this);
        let sound = cc.callFunc(this.gameOverSound, this);
        this.node.runAction(sound);
    },

    doOpenGameOver(totalScore) {
      
        cc.log(totalScore);
        cc.log('gameover')
        let countScore = 0;
        let actions = [cc.callFunc(() => { countScore += 1 }),
        cc.delayTime(0.01),
        cc.callFunc(() => { this.lblScore.string = countScore})]
        this.lblScore.node.runAction(cc.repeat(cc.sequence(actions), totalScore))
    },

    getInfoUserAndPushToArray() {
        let user = new User();
        user.name = this.edbUsername.string;
        user.score = this.lblScore.string;
        this.users.push(user);
    },

    doSubmit() {
        if(this.edbUsername.string == "") return;
        this.getInfoUserAndPushToArray();
        if(this.users != null) {
            cc.sys.localStorage.setItem("users", JSON.stringify(this.users));
        }
        this.edbUsername.string = "";
        emitter.instance.emit("DEFAULT", this.node);
    },

    checkData() {
        if(db != null) {
            this.users = db;
        }
    },
    // update (dt) {},
});
