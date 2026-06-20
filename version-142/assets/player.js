(function () {
  function mount(src) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playerCover");
    if (!video || !src) {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.StaticPlayer = {
    mount: mount
  };
}());
