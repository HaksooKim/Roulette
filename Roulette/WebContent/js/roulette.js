/*
     startBet() ──────┬── init()
       │              ├── tick() ────────────── tickPlay()
       │              └── rotate(animation) ─── getSoftLandingTime()
     endBet()
       │
     arrangeBet() ─────── postBet()
       │
     handledRotate() ──── rotate(angle)
                             ├─── tickPlay()
                          postBet()
 */
// _items are enumerated backward
const _items  = ["Apple AirPod", "BHC Hot Fied Chicken", "1 Month Free Pass", "Point Max 1,000p", "Kakao Emoticon", "Free Delivery Coupon", "Day, Day Diary", "1 Year Free Pass"];
// _itemAngles are enumberated forward
const _itemAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

const _FORWORD  = "Forward";
const _BACKWORD = "Backward";

const _turnDurationTime = 5000;
const _startAngle = 0;

const _tickAudio    = new Audio("aud/tick.mp3"); 
const _winAudio     = new Audio("aud/win.wav");  
const _tickInterval = 1.1;

let _tickCount    = 10;
let _tickEnd      = false;

function startBet(){
    init();        	
    tick();
    
    $(".roulette_wheel").rotate({
            duration  : _turnDurationTime,
            angle     : _startAngle,
            animateTo : getSoftLandingTime(),
            callback  : endBet
        }
    );
}

function init(){
    _tickCount = 10;
    _tickEnd   = false;
}

function getSoftLandingTime(){
    /*
        return a number between 1500 and 5000
    */
    const maxVal = 5000;
    const minVal = 1500;
    const result = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    console.log("> getSoftLandingTime() : " + result);
    return result;
}

function endBet(){
    _tickEnd = true;
    
    let totalAngle = $(".roulette_wheel").getRotateAngle();
    let realAngle = totalAngle % 360;
    let idx = 0;
    for(let i=0; i < _itemAngles.length; i++){
        if(realAngle < _itemAngles[i]){
            idx = i;
            break;
        }
    }
    
    arrangeBet(idx, realAngle);
    
    console.log("> endBet() : " + totalAngle + " : " + realAngle + " : " + idx + " : " + _items[idx]);
}

function arrangeBet(idx, realAngle){
    if(realAngle == 0) return;

    const leftAngle = _itemAngles[idx] - (idx == 0 && realAngle > _itemAngles[_itemAngles.length - 1]
                                          ? realAngle - 360 
                                          : realAngle);
    const halfClearance = (idx == 0 
                           ? _itemAngles[idx] + 360 - _itemAngles[_itemAngles.length - 1]
                           : _itemAngles[idx] - _itemAngles[idx - 1]) 
                          / 2;
    let toAngle = 0;
    let direction = "";

    if(leftAngle > halfClearance){
        direction = _FORWORD;
        toAngle = realAngle + leftAngle - halfClearance;
    }else if(leftAngle < halfClearance){
        direction = _BACKWORD;
        toAngle = realAngle - (halfClearance - leftAngle);
    }else{
        postBet(idx);

        return;
    }

    console.log("> arrangeBet() : realAngle : " + realAngle + ", leftAngle : " + leftAngle +", halfClearance : " + halfClearance + ", direction : " + direction + ", toAngle : " + toAngle);
    
    handledRotate(idx, direction, realAngle, toAngle);
}

function postBet(idx){
    alert("You acquired '" + _items[idx] + "' !");
}

function handledRotate(idx, direction, realAngle, toAngle){
    if(direction == _FORWORD){
        ++realAngle;
    }else{
        --realAngle;
    }
    
    console.log("  handledRotate() : " + direction + ", " + realAngle + ", " + toAngle);
    
    if((direction == _FORWORD && realAngle > toAngle) || (direction == _BACKWORD && realAngle < toAngle)){
        //try{ _winAudio.play(); }catch(x){}

        postBet(idx);

        return;
    }
    
    if((realAngle % 2) == 0){
        tickPlay();
    }

    $(".roulette_wheel").rotate(realAngle);

    setTimeout("handledRotate(" + idx + ", '" + direction + "', " + realAngle + ", " + toAngle + ")", 50);
}

function tick(){
    try{
        tickPlay();
        _tickCount *= _tickInterval;
        
        if(!_tickEnd){
            setTimeout("tick()", _tickCount);
        }
    }catch(x){
        console.log("!!! tick() Exception : " + x);
    }
}

function tickPlay(){
    try{
        _tickAudio.pause();
        _tickAudio.currentTime = 0;
        _tickAudio.play();
    }catch(e){}
}
