
//var colours = ['#72BC8D', '#F75A53', '#497D9D'];
//var colours = ['#FF695C'];
var colours = ['#555'];
var words = ['talk to me'];
var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

var weight = "normal";
var size = "30px"

function onLoad() {
	init("canvas", []);
	startButton();
	var word = words[Math.floor(Math.random()*words.length)];
	addPhrase(word);
	showInfo('info_start');
}

function onResize(element, callback) {
	var elementHeight = element.height,
		elementWidth = element.width;
	setInterval(function() {
		if (element.height !== elementHeight || element.width !== elementWidth) {
			elementHeight = element.height;
			elementWidth = element.width;
			callback();
		}
	}, 300);
}

var element = document.getElementsByTagName("canvas")[0];
onResize(element, function() {
	console.log("Canvas resized");
	resizeScene();
});


function addPhrase(phrase) {
	var words = phrase.split(' ');
	for (var j = 0; j < words.length; j++) {
		var word = words[j];
		if (word) {
			var colour = colours[Math.floor(Math.random()*colours.length)];
			addDelayedWord(word, colour, 500*j);
		}
	}
}

function addDelayedWord(word, colour, delay) {
	setTimeout(function() { addWord(word, colour); }, delay);
}

function addWord(word, colour, x){
	var width = 0;
	var x = x || Math.random() * worldW * 0.5;
	var colour = colour || colours[Math.floor(Math.random()*colours.length)];
	for (var i = 0; i < word.length; i++) {
		var letter = word[i];
		//console.log(letter);
		var body = addChar(letter, colour, x);
		width += body.details.width;
		x += body.details.width + 0.01;
	}
	return width;
}

function addChar(letter, colour, x) {
	if (letter != " ") {
		var bodyProps = {
			shape: "block",
			x: x,
			y: -1,// + Math.random(),
			width: letter.length/3,
			height: 1,
			colour: colour,
			restitution: getRndRestitution(),
			label: letter
		};
		return new Body(world, bodyProps);
	}
	else {
		return {details:{width:1}};
	}
}

if (!('webkitSpeechRecognition' in window)) {
	upgrade();
} else {

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
		showInfo('info_speak_now');
	};

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
			showInfo('info_no_speech');
			ignore_onend = true;
		}
		if (event.error == 'audio-capture') {
			showInfo('info_no_microphone');
			ignore_onend = true;
		}
		if (event.error == 'not-allowed') {
			if (event.timeStamp - start_timestamp < 100) {
				showInfo('info_blocked');
			} else {
				showInfo('info_denied');
			}
			ignore_onend = true;
		}
	};

	recognition.onend = function() {
		recognizing = false;
		if (ignore_onend) {
			return;
		}
		if (!final_transcript) {
			showInfo('info_start');
			return;
		}
		showInfo('');
		if (window.getSelection) {
			window.getSelection().removeAllRanges();
			var range = document.createRange();
			range.selectNode(document.getElementById('final_span'));
			window.getSelection().addRange(range);
		}
		if (create_email) {
			create_email = false;
			createEmail();
		}
	};

	recognition.onresult = function(event) {
		console.log(event.results);
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
				var phrase = event.results[i][0].transcript;
				if (phrase) {
					interim_transcript = final_transcript = "";
					addPhrase(phrase);
				}
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}

		final_transcript = capitalize(final_transcript);
		final_span.innerHTML = linebreak(final_transcript);
		interim_span.innerHTML = linebreak(interim_transcript);
	};
}

function upgrade() {
	start_button.style.visibility = 'hidden';
	showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;

function linebreak(s) {
	return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;

function capitalize(s) {
	return s.replace(first_char, function(m) {
		return m.toUpperCase();
	});
}

function startButton(event) {
	if (recognizing) {
		// recognition.stop();
		return;
	}
	final_transcript = '';
	recognition.lang = 'en-GB';
	recognition.start();
	ignore_onend = false;
	final_span.innerHTML = '';
	interim_span.innerHTML = '';
	// start_img.src = 'mic-slash.gif';
	showInfo('info_allow');
	// start_timestamp = event.timeStamp;
}

function showInfo(s) {
	if (s) {
		for (var child = info.firstChild; child; child = child.nextSibling) {
			if (child.style) {
				child.style.display = child.id == s ? 'inline' : 'none';
			}
		}
		info.style.visibility = 'visible';
	}
}

function onMousePress(event) {
    startButton();
}

function onKeyDown(e) {
    var key = String.fromCharCode(e.keyCode)
	if (key == "T") {
		addPhrase("Cellar Door");
	};
}

window.addEventListener('mousedown', onMousePress, false);
window.addEventListener('touchstart', onMousePress, false);
window.addEventListener('keypress', onMousePress, false);
window.addEventListener("keydown", onKeyDown, false);
