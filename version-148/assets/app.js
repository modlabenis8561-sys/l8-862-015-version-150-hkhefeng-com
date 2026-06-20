(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindPageFilter();
    bindSearchPage();
    bindPlayers();
  });

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length < 2) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-index")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    start();
  }

  function bindPageFilter() {
    var input = document.querySelector(".page-filter-input");
    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
      });
    });
  }

  function bindSearchPage() {
    var input = document.getElementById("site-search-input");
    var container = document.getElementById("search-results");
    if (!input || !container || !window.siteMovieIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    var form = document.querySelector(".search-page-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input.value);
        var query = input.value.trim();
        var target = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
        window.history.replaceState(null, "", target);
      });
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initial);

    function render(value) {
      var keyword = value.trim().toLowerCase();
      var results = window.siteMovieIndex.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return movie.searchText.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 96);

      if (!results.length) {
        container.innerHTML = '<div class="search-empty">没有找到匹配的影片，请换一个关键词。</div>';
        return;
      }

      container.innerHTML = results.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<a class="movie-title-link" href="' + movie.url + '"><h2>' + escapeHtml(movie.title) + '</h2></a>' +
          '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
          '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
          '</div>' +
          '</article>';
      }).join('');
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-hls]"));
    videos.forEach(function (video) {
      var shell = video.closest(".video-shell");
      var button = shell ? shell.querySelector(".play-mask") : null;
      var hlsInstance;

      function attach() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        var src = video.getAttribute("data-hls");
        if (!src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
        video.setAttribute("data-ready", "1");
      }

      function play() {
        attach();
        var attempt = video.play();
        if (attempt && typeof attempt.then === "function") {
          attempt.catch(function () {});
        }
        if (button) {
          button.classList.add("is-hidden");
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
