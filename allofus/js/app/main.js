
var words = ["So Long and farewell AllofUs! x x x :)", "bye bye for now AllofUs! x x x :)"];
function onLoad() {
	var items = [];
	// create some objects
	var colour = '#F75A53';
	init("canvas", items);

	var word = words[Math.floor(Math.random()*words.length)];
	addPhrase(word);
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
		console.log(word);
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
	var x = x || 5 + (Math.random() * (worldW*0.6));
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
			color: colour,
			restitution: getRndRestitution(),
			label: letter
		};
		return new Body(world, bodyProps);
	}
	else {
		return {details:{width:1}};
	}
}

showInfo('info_start');
var colours = ['#72BC8D', '#F75A53', '#497D9D'];
var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;


function upgrade() {
}

var two_line = /\n\n/g;
var one_line = /\n/g;

function linebreak(s) {
}

var first_char = /\S/;

function capitalize(s) {
	return s.replace(first_char, function(m) {
		return m.toUpperCase();
	});
}

function startButton(event) {
}

function showInfo(s) {
}
