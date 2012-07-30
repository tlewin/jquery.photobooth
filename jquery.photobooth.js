/*
 * JQuery photobooth plugin
 * 
 * Create photobooth plugin
 *
 * @copyright @thiagolewin
 * @version 0.1
 */
(function($) {
  'use strict';
  
  /* Find out getUserMedia implementation */
  navigator.getUserMedia = navigator.getUserMedia || 
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

  /* Find out URL object */
  window.URL = window.URL || window.webkitURL;
  
  $.fn.photobooth = function(options, controlCallback, onError) {

    var
      settings  = {
        width: 300,
        height: 225,
        imgPlaceholder: null,
        background: '#000000'
      };

    $.extend(true, settings, options);
    
    /* Check if browser support video capture */
    if(!(navigator.getUserMedia && window.URL)) {
      if(onError){
        // TODO include support for jquery.webcam
        onError.call(null);
      } else {
        throw 'Browser does not support video capturing.';
      }
    }

    return this.each(function(idx, elem) {
      var
        mainDiv     = $('<div></div>'),
        video       = $('<video></video>'),
        canvas      = $('<canvas></canvas'),
        img         = $('<img></img>'),
        localStream = null,
        el          = $(elem),
        els         = [mainDiv, video, canvas, img];
      
      /* Set size */
      for(var i = 0; i < els.length; i++) {
        els[i].attr({
          width: settings.width,
          height: settings.height
        });
      }
      video.hide();
      canvas.hide();
      if(settings.imgPlaceholder) {
        img.attr('src', settings.imgPlaceholder);
      }
      video.attr('autoplay', true);
      video.css('background', settings.background);
      controlCallback.call(null, {
        start: function(onError) {
          if(localStream) {
            img.hide();
            video.show();
          } else {
            navigator.getUserMedia({audio: false, video: true}, function(stream) {
              localStream = stream;
              video.show();
              video.attr('src', window.URL.createObjectURL(localStream));
              img.hide();
            }, function() {
              console.log('fail');
              if(onError) {
                onError.call(null);
              }
            });
          }
        },
        snapshot: function() {
          var 
            ctx = canvas[0].getContext('2d'),
            vw  = video[0].videoWidth,
            vh  = video[0].videoHeight,
            vp  = vw/vh,
            ip  = settings.width/settings.height,
            fw  = 0,
            fh  = 0;
          
          // Rescale image
          if(ip > vp) {
            fh = settings.height;
            fw = Math.round(fh*vp);
          } else {
            fw = settings.width;
            fh = Math.round(fw*Math.pow(vp,-1));
          }
          ctx.fillStyle = settings.background;
          ctx.fillRect(0, 0, settings.width, settings.height);
          ctx.drawImage(video[0], (settings.width-fw)>>1, (settings.height-fh)>>1, fw, fh);
          video.hide();
          img.attr('src', canvas[0].toDataURL('image/png'));
          img.show();
        },
        stop: function() {
          if(localStream) {
            localStream.stop();
            localStream = null;
          }
        }
      });
      el.append(mainDiv).append(video).append(canvas).append(img);
    });
  }
})(jQuery);
