///////////////////////////////////////////////////////////////////////////////
// helpers
/////////////////////////////////////////////////////////////////////////////
function randomInRange($min, $max, $precision) {
    if (typeof($precision) == 'undefined') {
        $precision = 2;
    }
    return parseFloat(Math.min($min + (Math.random() * ($max - $min)), $max).toFixed($precision));
}

function map(value, inputMin, inputMax, outputMin, outputMax) {
    var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
    return outVal;
}

function clamp(value, min, max) {
    if (value < min) value = min;
    else if (value > max) value = max;
    return value;
}

function lerp(start, stop, amt) {
    return start + (stop - start) * amt;
}

function clone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = clone(obj[key]);
    }
    return temp;
}