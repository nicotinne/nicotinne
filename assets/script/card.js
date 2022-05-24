const Emitter = require('mEmitter');
let COLOR = require("color");

cc.Class({
    extends: cc.Component,

    properties: {
        lblCard:{
            default: null,
            type:cc.Label,
        } ,
    },

    onLoad () {
    },
    
    start () {
    //   cc.log(this.node.color)
    //   cc.log(this.node.children[0].getComponent('cc.Label').string)
    //   let number =Number(this.node.children[0].getComponent('cc.Label').string);
    //   this.setColor(number);
    },

    // update (dt) {},
});
