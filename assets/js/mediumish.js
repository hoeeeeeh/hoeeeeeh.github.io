jQuery(document).ready(function($){

    //fix for stupid ie object cover
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      jQuery('.featured-box-img-cover').each(function(){
          var t = jQuery(this),
              s = 'url(' + t.attr('src') + ')',
              p = t.parent(),
              d = jQuery('<div></div>');
  
          p.append(d);
          d.css({
              'height'                : '290',
              'background-size'       : 'cover',
              'background-repeat'     : 'no-repeat',
              'background-position'   : '50% 20%',
              'background-image'      : s
          });
          t.hide();
      });
    }

    // track now toc
    $(document).scroll(function(){
        const trackedElements = document.querySelectorAll('.toc-title');

        const scrollPosition = window.scrollY;

        // Iterate through each tracked element
        for (let i = trackedElements.length - 1; i > -1; i--) {
          const element_original = trackedElements[i];

          const element = document.querySelector(element_original.getAttribute("href"));
          // Get the top and bottom positions of the element
          const elementTop = element.offsetTop;          
          // const elementBottom = element.offsetTop + element.offsetHeight;

          // Check if the scroll position is within the element's boundaries
          if (scrollPosition >= elementTop){ // && scrollPosition < elementBottom) {
              for (let j = 0; j < trackedElements.length; j++){
                trackedElements[j].classList.remove('toc-active');
                trackedElements[j].classList.add('toc-non-active');
              }
              element_original.classList.remove('toc-non-active');
              element_original.classList.add('toc-active');
              break;
          }
        }
    });

    // alertbar later
    $(document).scroll(function () {
        var y = $(this).scrollTop();
        if (y > 280) {
            $('.alertbar').fadeIn();
        } else {
            $('.alertbar').fadeOut();
        }
    });


    // Smooth on external page
    $(function() {
      setTimeout(function() {
        if (decodeURI(location.hash)) {
          /* we need to scroll to the top of the window first, because the browser will always jump to the anchor first before JavaScript is ready, thanks Stack Overflow: http://stackoverflow.com/a/3659116 */
          window.scrollTo(0, 0);
          target = decodeURI(location.hash).split('#');
          smoothScrollTo($('#'+target[1]));
        }
      }, 1);

      // taken from: https://css-tricks.com/snippets/jquery/smooth-scrolling/
      $('a[href*=\\#]:not([href=\\#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          smoothScrollTo($(decodeURI(this.hash)));
          return false;
        }
      });

      function smoothScrollTo(target) {
        // navgation bar interrupt main content, so need to be hidden
        $('.alertbar').fadeOut();
        navdown();
        target = target.length ? target : $('[name=' + decodeURI(this.hash).slice(1) +']');

        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top
          }, 1000);
        }
      }
    });
    
    
    // Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('nav').outerHeight();

    $(window).scroll(function(event){
        didScroll = true;
    });

    setInterval(function() {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = $(this).scrollTop();
        
        // Make sure they scroll more than delta
        if(Math.abs(lastScrollTop - st) <= delta)
            return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight){
          navup()
        } else {
          navdown()
        }

        lastScrollTop = st;
    }

    function navup(){
            // Scroll Down            
            $('nav').removeClass('nav-down').addClass('nav-up'); 
            $('.nav-up').css('top', - $('nav').outerHeight() + 'px');
    }

    function navdown(){
            // Scroll Up
            if(st + $(window).height() < $(document).height()) {               
              $('nav').removeClass('nav-up').addClass('nav-down');
              $('.nav-up, .nav-down').css('top', '0px');             
          }
    }
        
    $('.site-content').css('margin-top', $('header').outerHeight() + 'px');  
    
    // spoilers
     $(document).on('click', '.spoiler', function() {
        $(this).removeClass('spoiler');
     });

         $(window).scroll(function(event){
        didScroll = true;
    });
    
 });   

// deferred style loading
var loadDeferredStyles = function () {
	var addStylesNode = document.getElementById("deferred-styles");
	var replacement = document.createElement("div");
	replacement.innerHTML = addStylesNode.textContent;
	document.body.appendChild(replacement);
	addStylesNode.parentElement.removeChild(addStylesNode);
};
var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
if (raf) raf(function () {
	window.setTimeout(loadDeferredStyles, 0);
});
else window.addEventListener('load', loadDeferredStyles);
