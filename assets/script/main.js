const COLOR = require('color');
const emitter = require('mEmitter');
let async = require("async");

cc.Class({
    extends: cc.Component,

    properties: {
        card: {
            default: null,
            type: cc.Prefab
        },
        updateScore: {
            default: null,
            type: cc.Label
        },
        compareAudio: {
            default: null,
            type: cc.AudioClip
        },
        newCardAudio: {
            default: null,
            type: cc.AudioClip
        },
        _mouseDown:null,
        _arrBlocks: [],
        _canRandom: true,
        _updateScore: 0,
        _totalScore: 0,
        _canPress: false,
        playGame: null,
    },

    // LIFE-CYCLE CALLBACKS:

    compareSound: function () {
        cc.audioEngine.playEffect(this.compareAudio, false);
    },
    newCardSound: function () {
        cc.audioEngine.playEffect(this.newCardAudio, false);
    },
    onPlayCompareSound() {
        let action = cc.callFunc(this.compareSound, this);
        this.node.runAction(action);
    },
    onLoad() {
        this._mouseDown = {};
        this.canPress = false;
        this.playGame = this.onPlayGame.bind(this);

        emitter.instance.registerEvent("CLICK_PLAY", this.playGame);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.mouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.mouseUp, this);
    },

    mouseUp(evt) {
        let mouseUpX = evt.getLocationX();
        let mouseUpY = evt.getLocationY();
        if (Math.abs(this._mouseDown.x - mouseUpX) > Math.abs(this._mouseDown.y - mouseUpY)) {
            if (Math.abs(this._mouseDown.x - mouseUpX) < 50) return;
            if (this._mouseDown.x - mouseUpX < 0) {
                this.moveRight();
            }
            else {
                this.moveLeft();
            }
        }
        else {
            if (Math.abs(this._mouseDown.y - mouseUpY) < 50) return;
            if (this._mouseDown.y - mouseUpY < 0) {
                this.moveUp();
            }
            else {
                this.moveDown();
            }
        }
        this.randomNumber();
    },

    mouseDown(evt) {
        this._mouseDown.x = evt.getLocationX();
        this._mouseDown.y = evt.getLocationY();
        cc.log(this._mouseDown.x, this._mouseDown.y);
    },

    eventTouchHanlder () {
        this.node.on("touchstart", (event) => {
            this._startTouch = event.getLocation();
        })
        this.node.on("touchend", (event) => {
            this._endTouch = event.getLocation();
            this.checkTouch();
            
        })
    },

    checkTouch() {
        let startTouch = this._startTouch;
        let endTouch = this._endTouch;
        let dinstance = endTouch.sub(startTouch);
        let VecLength = dinstance.mag();
        if (VecLength > 50) {
            if (Math.abs(dinstance.x) > Math.abs(dinstance.y)) {

                if (dinstance.x > 0) this.moveRight();

                else this.moveLeft();
            }
            else {
            
                if (dinstance.y > 0) this.moveUp();

                else this.moveDown();
            }
            this.randomNumber();
        }

    },

    handleKeyUp(evt) {
        switch (evt.keyCode) {
            case cc.macro.KEY.up:
            case cc.macro.KEY.down:
            case cc.macro.KEY.left:
            case cc.macro.KEY.right:
                this.randomNumber();
                this._canPress = false;
                break;
            default:
                break;
        }
    },
    handleKeyDown(evt) {
        if (this._canPress) return;
        this._canPress = true;
        switch (evt.keyCode) {
            case cc.macro.KEY.up:
                this.moveUp();
                break;
            case cc.macro.KEY.down:
                this.moveDown();
                break;
            case cc.macro.KEY.left:
                this.moveLeft();
                break;
            case cc.macro.KEY.right:
                this.moveRight();
                break;
            default:
                break;
        }
    },

    moveUp() {
        for (let col = 0; col < 4; col++) {
            let flatArrCard = [0, 0, 0, 0];
            for (let row = 0; row < 4; row++) {
                flatArrCard[row] = this._arrBlocks[row][col];
            }
            this.handle(flatArrCard)
        }
    },
    moveDown() {
        for (let col = 0; col < 4; col++) {
            let flatArrCard = [0, 0, 0, 0];
            for (let row = 0; row < 4; row++) {
                flatArrCard[row] = this._arrBlocks[row][col];
            }
            this.handle(flatArrCard.reverse())

        }
    },

    moveLeft() {
        for (let row = 0; row < 4; row++) {
            let flatArrCard = [0, 0, 0, 0];
            for (let col = 0; col < 4; col++) {
                flatArrCard[col] = this._arrBlocks[row][col];
            }
            this.handle(flatArrCard)
        }
    },


    moveRight() {
        for (let row = 0; row < 4; row++) {
            let flatArrCard = [0, 0, 0, 0];
            for (let col = 0; col < 4; col++) {
                flatArrCard[col] = this._arrBlocks[row][col];
            }
            this.handle(flatArrCard.reverse())

        }
    },


    handle(arrCard) {
        let arrAction = [];
        for (let i = 1; i < arrCard.length; i++) {
            if (arrCard[i].children[1].getComponent('cc.Label').string == "") {
                continue;
            }
            let checkCompare = false;
            let objAnim = { selfCard: null, otherCard: null, callBack: null }
            for (let j = i - 1; j >= 0; j--) {
                if (checkCompare == true) {
                    j = -1;
                    break;
                }
                checkCompare = this.changeValueCards(arrCard, i, j, objAnim);
            }
            let cloneObjAnim = Object.assign(objAnim);
            arrAction.push(this.handleMove(cloneObjAnim.selfCard, cloneObjAnim.otherCard, cloneObjAnim.callBack));
        }
        let count = 0;
        async.eachLimit(arrAction, arrAction.length, () => {
            cc.log(arrAction)
            if (arrAction[count] != undefined) {
                arrAction[count].delay(count + 1).start();
            }
            count++;
        })

    },
    changeValueCards(arrCard, i, j, objAnim) {
        if (arrCard[j].children[1].getComponent('cc.Label').string == "") {
            if (j == 0) {
                let callBack = function (selfCard, otherCard) {
                    otherCard.children[1].getComponent('cc.Label').string = selfCard.children[1].getComponent('cc.Label').string;
                    selfCard.children[1].getComponent('cc.Label').string = "";
                    selfCard.active = true;
                    otherCard.active = true;
                }
                objAnim.selfCard = arrCard[i];
                objAnim.otherCard = arrCard[j];
                objAnim.callBack = callBack;
                return true;
            }
        }
        else {
            if (arrCard[j].children[1].getComponent('cc.Label').string == arrCard[i].children[1].getComponent('cc.Label').string) {
                let value = Number(arrCard[i].children[1].getComponent('cc.Label').string) * 2 ;
                this.onPlayCompareSound();
                this.changeScore(value);
                let callBack = function (selfCard, otherCard) {
                    otherCard.children[1].getComponent('cc.Label').string = Number(otherCard.children[1].getComponent('cc.Label').string) * 2 + "";
                    selfCard.children[1].getComponent('cc.Label').string = "";
                    let action = cc.sequence(cc.scaleTo(0.1, 1.2), cc.delayTime(0.3), cc.scaleTo(0.1, 1))
                    otherCard.runAction(action);
                    otherCard.active = true;
                    selfCard.active = true;
                }
                objAnim.selfCard = arrCard[i];
                objAnim.otherCard = arrCard[j];
                objAnim.callBack = callBack;
                return true;
            }
            else if (arrCard[j].children[1].getComponent('cc.Label').string != arrCard[i].children[1].getComponent('cc.Label').string) {
                let reValue = j + 1;
                if (reValue != i) {
                    let callBack = function (selfCard, otherCard) {
                        otherCard.children[1].getComponent('cc.Label').string = selfCard.children[1].getComponent('cc.Label').string;
                        selfCard.children[1].getComponent('cc.Label').string = "";
                        otherCard.active = true;
                        selfCard.active = true;
                    }
                    objAnim.selfCard = arrCard[i];
                    objAnim.otherCard = arrCard[reValue];
                    objAnim.callBack = callBack;
                }
                return true;
            }
        }
    },

    handleMove(selfCard, otherCard, callBack) {
        if (selfCard != null && otherCard != null) {
            let x = otherCard.x;
            let y = otherCard.y;
            let xOld = selfCard.x;
            let yOld = selfCard.y;
            return cc.tween(selfCard)
                .to(0.2, { position: cc.v2(x, y) })
                .call(callBack(selfCard, otherCard))
                .to(0, { position: cc.v2(xOld, yOld) })
        }

    },


    reloadColor(arrCard) {
        for (let col = 0; col < arrCard.length; col++) {
            for (let row = 0; row < arrCard.length; row++) {
                let number = 0;
                if (arrCard[col][row].children[1].getComponent('cc.Label').string == "") {
                    number = 0;
                }
                else {
                    number = parseInt(arrCard[col][row].children[1].getComponent('cc.Label').string);
                }
                arrCard[col][row].children[0].color = COLOR[number];

            }
        }

    },

    // start() {
    // },
    render() {
        for (let col = 0; col < 4; col++) {
            let arrRow = [];
            for (let row = 0; row < 4; row++) {
                let x = -225 + row * 150;
                let y = 225 - col * 150;
                let newCard = cc.instantiate(this.card);
                newCard.parent = this.node
                newCard.x = x;
                newCard.y = y;
                newCard.width = 140;
                newCard.height = 140;
                newCard.color = COLOR[0];
                arrRow.push(newCard);
            }
            this._arrBlocks.push(arrRow)
        }
    },

    randomNumber() {
        let flatArray = this._arrBlocks.flat(Infinity);
        let arrNone = flatArray.filter((value) => {
            return value.children[1].getComponent('cc.Label').string == "";
        })
        cc.log(arrNone.length);
        if (arrNone.length != 0) {
            let index = Math.floor(Math.random() * arrNone.length)
            let arrRandomNum = [2, 4];
            let num = arrRandomNum[Math.floor(Math.random() * arrRandomNum.length)]
            arrNone[index].children[1].getComponent('cc.Label').string = num;
            arrNone[index].color = COLOR[2];
            arrNone[index].active = true;
            arrNone[index].scale = 0;
            let action = cc.scaleTo(0.1, 1);
            arrNone[index].runAction(action);
            this.reloadColor(this._arrBlocks);
        } else {
            cc.log('full card');
            cc.log(this._totalScore);
            let checkGameOver = this.checkGameOver();
            if (!checkGameOver) {
                cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.handleKeyDown, this);
                cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.handleKeyUp, this);
                emitter.instance.emit("GAMEOVER");
                emitter.instance.emit("OPEN_GAMEOVER", this._totalScore);
            }
            else {
                cc.log('have compare card');
            }
        }

    },
    checkGameOver() {
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                if (x == 3) continue;
                let self = this._arrBlocks[x][y].getComponent("card").lblCard.string;
                let other = this._arrBlocks[x + 1][y].getComponent("card").lblCard.string
                if (self == other) {
                    return true;
                }
            }
        }
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                if (y == 3) continue;
                let self = this._arrBlocks[x][y].getComponent("card").lblCard.string;
                let other = this._arrBlocks[x][y + 1].getComponent("card").lblCard.string
                if (self == other) {
                    return true;
                }
            }
        }
        return false;
    },
    changeScore(number) {
        let score = this.updateScore;
        let currentScore = Number(score.string);
        this._totalScore = currentScore + number;
        let actions = [cc.callFunc(() => { currentScore += 1 }),
        cc.delayTime(0.01),
        cc.callFunc(() => { score.string = currentScore })];
        let scale = cc.sequence(cc.scaleTo(0.15, 1.2), cc.scaleTo(0.15, 1))
        score.node.runAction(cc.spawn(cc.repeat(cc.sequence(actions), number), scale))
    },

    getBestScore() {
        let data = JSON.parse(cc.sys.localStorage.getItem("users"));
        if (data != null) {
            data = data.sort((a, b) => {
                return parseInt(b.score) - parseInt(a.score);
            });
            emitter.instance.emit('BEST_SCORE', data[0].score);
        }
    },

    onPlayGame() {
        this.node.removeAllChildren();
        this._arrBlocks = [];
        this.updateScore.string = "0";
        this.render();
        this.randomNumber();
        this.getBestScore();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.handleKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.handleKeyUp, this);
        this.eventTouchHanlder()
    },

    // update (dt) {},
});