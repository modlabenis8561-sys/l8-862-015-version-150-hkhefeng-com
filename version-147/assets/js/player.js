import { H as Hls } from './hls.js';

function attachPlayer(card) {
  var video = card.querySelector('video');
  var button = card.querySelector('.play-overlay');
  var src = card.getAttribute('data-stream');
  var ready = false;

  function start() {
    if (!video || !src) {
      return;
    }
    if (!ready) {
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.setAttribute('controls', 'controls');
    }
    if (button) {
      button.classList.add('is-hidden');
    }
    video.play().catch(function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }

  if (button) {
    button.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });
  }
}

document.querySelectorAll('[data-stream]').forEach(attachPlayer);
