$('.carousel').carousel({interval:false});

/* affix the navbar after scroll below header */
$('#nav').affix({
      offset: {
        top: $('header').height()-$('#nav').height()
      }
});	

/* highlight the top nav as scrolling occurs */
$('body').scrollspy({ target: '#nav' })

/* smooth scrolling for scroll to top */
$('.scroll-top').click(function(){
  $('body,html').animate({scrollTop:0},1000);
})

/* smooth scrolling for nav sections */
$('#nav .navbar-nav li>a').click(function(){
  var link = $(this).attr('href');
  var posi = $(link).offset().top;
  $('body,html').animate({scrollTop:posi},700);
});


/* copy loaded thumbnails into carousel */
$('.panel .img-responsive').on('load', function() {
  
}).each(function(i) {
  if(this.complete) {
  	var item = $('<div class="item"></div>');
    var itemDiv = $(this).parent('a');
    var title = $(this).parent('a').attr("title");
    
    item.attr("title",title);
  	$(itemDiv.html()).appendTo(item);
  	item.appendTo('#modalCarousel .carousel-inner'); 
    if (i==0){ // set first item active
     item.addClass('active');
    }
  }
});

/* activate the carousel */
$('#modalCarousel').carousel({interval:false});

/* change modal title when slide changes */
$('#modalCarousel').on('slid.bs.carousel', function () {
  $('.modal-title').html($(this).find('.active').attr("title"));
})

/* when clicking a thumbnail */
$('.panel-thumbnail>a').click(function(e){
  
    e.preventDefault();
    var idx = $(this).parents('.panel').parent().index();
  	var id = parseInt(idx);
  	
  	$('#myModal').modal('show'); // show the modal
    $('#modalCarousel').carousel(id); // slide carousel to selected
  	return false;
});


/* map interactive */

var southWest = L.latLng(45.3705,9.0404),
    northEast = L.latLng(45.5554,9.3288),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.mapbox.map('map', 'giorgiouboldi.ifkdj2f1', {minZoom:12,maxZoom:15,maxBounds: bounds} )
var layers = document.getElementById('menu-ui');

// Disable drag and zoom handlers.
map.touchZoom.disable();
map.scrollWheelZoom.disable();

addLayer(L.mapbox.tileLayer('giorgiouboldi.cwxt7qfr'), 'Morning <br>06:00-12:00', 2);
addLayer(L.mapbox.tileLayer('giorgiouboldi.2z55ewmi'), 'Afternoon <br>12:00-18:00', 3);
addLayer(L.mapbox.tileLayer('giorgiouboldi.xoagu8fr'), 'Evening <br>18:00-00:00', 4);
addLayer(L.mapbox.tileLayer('giorgiouboldi.vvwh4cxr'), 'Night <br>00:00-06:00', 5);


function addLayer(layer, name, zIndex) {
  
  layer
    .setZIndex(zIndex)
    .setOpacity(0.4)
    .addTo(map);

  // Create a simple layer switcher that
  // toggles layers on and off.
  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.innerHTML = name;

  link.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      this.className = '';
    } else {
      map.addLayer(layer);
      this.className = 'active';
    }
  };

  layers.appendChild(link);
}


/* video autoplay/pause on scroll */

var froogaloop = $f(playerVimeo)

function elementInViewport(el) {

  var el = el[0]

  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top < (window.pageYOffset + window.innerHeight) &&
    left < (window.pageXOffset + window.innerWidth) &&
    (top + height) > window.pageYOffset &&
    (left + width) > window.pageXOffset
    );
}

function callbackIn () {
  setTimeout(
    function(){
      froogaloop.api('play')
    }, 500)
} 

function callbackOut () {
  froogaloop.api('pause');
} 

function fireIfElementVisible (el, callbackIn, callbackOut) {
  return function () {
    if ( elementInViewport(el) ) {
      callbackIn();
    }else{
      callbackOut()
    }
  }
}

var videoHandler = fireIfElementVisible($(".video-responsive"), callbackIn, callbackOut);

$(window).on('resize scroll', videoHandler); 