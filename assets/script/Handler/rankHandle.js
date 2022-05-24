// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const emitter = require("mEmitter");

cc.Class({
    extends: cc.Component,

    properties: {

        rank: cc.Layout,
        prefab_item: cc.Prefab,
        btnClose: cc.Button,

        openRank: null,
        render: null,
        clickClose: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.openRank = this.doOpenRank.bind(this);
        this.clickClose = this.doClickClose.bind(this);
        this.render = this.doRender.bind(this);

        emitter.instance.registerEvent("OPEN_RANK", this.openRank);
        emitter.instance.registerEvent("RENDER", this.render);


    },

    start() {
        this.btnClose.node.on("click", this.clickClose, this);
        // this.doRender();
    },

    doClickClose() {
        // emitter.instance.emit("OPEN_START");
        emitter.instance.emit("DEFAULT", this.node);
        this.removeItem();
        // emitter.instance.emit("OPEN_GAMEOVER");
        // this.node.active = false;
    },

    doOpenRank() {

    },

    doRender() {
        let data = JSON.parse(cc.sys.localStorage.getItem("users"));
        if (data != null) {
            data = data.sort((a, b) => {
                return parseInt(b.score) - parseInt(a.score);
            });
            this.renderAllUser(data);
            emitter.instance.emit("BEST_SCORE", data[0].score);
        }

    },

    renderAllUser(data) {
        data.forEach((user, index) => { this.renderUser(user, index) });
    },

    renderUser(user, index) {
        let item = cc.instantiate(this.prefab_item);
        item.parent = this.rank.node;
        item.active = true;
        item.children[0].getComponent("cc.Label").string = index + 1;
        item.children[1].getComponent("cc.Label").string = user.name;
        item.children[2].getComponent("cc.Label").string = user.score;
        // cc.log(item.x);
        // cc.log(item.y);
        return item;
    },

    removeItem() {
        this.rank.node.removeAllChildren();
    },

    // update (dt) {},
});