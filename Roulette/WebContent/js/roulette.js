// _items are enumerated backward
const _items  = ["Apple AirPod", "BHC Hot Fied Chicken", "1 Month Free Pass", "Point Max 1,000p", "Kakao Emoticon", "Free Delivery Coupon", "Day, Day Diary", "1 Year Free Pass"];
// _itemAngles are enumerated forward
const _itemAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

const _ease = ['easeInQuad', 'easeOutQuad',	'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
	           'easeInQuart', 'easeOutQuart', 'easeInOutQuart', 'easeInQuint', 'easeOutQuint', 'easeInOutQuint',
	           'easeInSine', 'easeOutSine', 'easeInOutSine', 'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
	           'easeInCirc', 'easeOutCirc', 'easeInOutCirc', 'easeInElastic', 'easeOutElastic', 'easeInOutElastic',
	           'easeInBack', 'easeOutBack', 'easeInOutBack', 'easeInBounce', 'easeOutBounce', 'easeInOutBounce'];

const _FORWORD  = "Forward";
const _BACKWORD = "Backward";

const _turnDurationTime = 6000;
const _startAngle = 0;
const _targetAngleMaxVal = ~~(_turnDurationTime / 1000) * 360 + 1; // max 1 turn per second
const _targetAngleMinVal = ~~(_targetAngleMaxVal / 2); // min 0.5 turn per second

const _tickAudio    = new Audio("aud/tick.mp3"); 
const _winAudio     = new Audio("aud/win.wav"); 
const _tickAngle    = 4;
const _tickKeepTime = 0.015;

let _isBetting = false;

function startBet(){
	if(_isBetting) return;
	
    init();        	
    tick(0);
    
    $(".roulette_wheel").rotate({
            duration  : _turnDurationTime,
            angle     : _startAngle,
            easing    : getEase(),
            tick      : tick,
            animateTo : getTargetAngle(),
            callback  : endBet
        }
    );
}

function init(){
    _isBetting = true;
    _tickCount = 10;
    _lastTickAngle = 0;
    _lastTickTime = 0;
    _tickStarted = false;
}

function getEase(){
	const from = 0;
	const to = _ease.length - 1;
	const result = getRandomValue(from, to);
	console.log("> getEase() : " + _ease[result]);
	return $.easing[_ease[result]];
}

function getTargetAngle(){
	const result = getRandomValue(_targetAngleMaxVal, _targetAngleMinVal);
	console.log("> getTargetAngle() : " + result);
	return result;
}

function getRandomValue(from, to){
	return ~~(Math.random() * (to - from + 1)) + from;
}
function endBet(){
    let totalAngle = $(".roulette_wheel").getRotateAngle();
    let realAngle = totalAngle % 360;
    let idx = 0;
    for(let i=0; i < _itemAngles.length; i++){
        if(realAngle < _itemAngles[i]){
            idx = i;
            break;
        }
    }
    
    setTimeout("arrangeBet("+idx+", "+realAngle+")", 300);
    
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
	_isBetting = false;
	
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
        try{ _winAudio.play(); }catch(x){}

        postBet(idx);

        return;
    }
    
    if((realAngle % 2) == 0){
        tickPlay();
    }

    $(".roulette_wheel").rotate(realAngle);

    setTimeout("handledRotate(" + idx + ", '" + direction + "', " + realAngle + ", " + toAngle + ")", 50);
}

let _lastTickAngle = 0;
function tick(a){
	if(a == undefined) return;
	
	if((a - _lastTickAngle) >= _tickAngle){
		tickPlay();
		_lastTickAngle = a;
	}
}

function tickPlay(){
    try{
    	if(_tickAudio.currentTime > _tickKeepTime){
	        _tickAudio.pause();
	        _tickAudio.currentTime = 0;
    	}
        _tickAudio.play();
    }catch(e){}
}
