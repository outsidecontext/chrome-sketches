function onLoad(){
	var items = [];
	// create some objects
	var scale  = .5
	// 4 //////////////////
	var colour = '#F75A53'
	items.push( { shape: "block", x:6*scale, y:6*scale, width:1*scale, height:6*scale, color:colour, restitution: getRndRestitution() } );
	items.push( { shape: "block", x:12*scale, y:12*scale, width:6*scale, height:1*scale, color:colour, restitution: getRndRestitution() } );
	items.push( { shape: "block", x:11.5*scale, y:10*scale, width:1*scale, height:2*scale, color:colour, restitution: getRndRestitution() } );
	items.push( { shape: "block", x:12*scale, y:13*scale, width:1*scale, height:2*scale, color:colour, restitution: getRndRestitution() } );
	// // 0 //////////////////
	colour = '#72BC8D'
	items.push( { shape: "circle", x:23*scale, y:10*scale, radius:2*scale, color:colour, restitution: getRndRestitution() });
	// // 4 //////////////////
	colour = '#497D9D'
	items.push( { shape: "block", x:(25*scale) + 6*scale, y:6*scale, width:1*scale, height:6*scale, color:colour, restitution: getRndRestitution() } );
	items.push( { shape: "block", x:(25*scale) + 12*scale, y:12*scale, width:6*scale, height:1*scale, color:colour, restitution: getRndRestitution() } );
	items.push( { shape: "block", x:(25*scale) + 11.5*scale, y:10*scale, width:1*scale, height:2*scale, color:colour, restitution: getRndRestitution() } );
	items.push( { shape: "block", x:(25*scale) + 12*scale, y:13*scale, width:1*scale, height:2*scale, color:colour, restitution: getRndRestitution() } );
	init("canvas", items);
}

function onResize( element, callback ){
  var elementHeight = element.height,
      elementWidth = element.width;
  setInterval(function(){
      if( element.height !== elementHeight || element.width !== elementWidth ){
        elementHeight = element.height;
        elementWidth = element.width;
        callback();
      }
  }, 300);
}

var element = document.getElementsByTagName("canvas")[0];
onResize( element, function(){ console.log("Canvas resized");resizeScene(); } );