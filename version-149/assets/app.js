(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
    all("a", menu).forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
      });
    });
  }

  function initBackTop() {
    all("[data-backtop]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function initSearchForms() {
    all(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = all("[data-movie-card]", grid);
    var input = document.querySelector("[data-local-search]");
    var empty = document.querySelector("[data-empty-state]");
    var category = document.querySelector("[data-filter-category]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (input && query) {
      input.value = query;
    }

    function matches(card) {
      var q = norm(input && input.value);
      var c = norm(category && category.value);
      var y = norm(year && year.value);
      var r = norm(region && region.value);
      var t = norm(type && type.value);
      var content = norm([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.dataset.tags
      ].join(" "));
      return (!q || content.indexOf(q) !== -1) &&
        (!c || norm(card.dataset.category) === c) &&
        (!y || norm(card.dataset.year) === y) &&
        (!r || norm(card.dataset.region) === r) &&
        (!t || norm(card.dataset.type) === t);
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }

    [input, category, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (sourceUrl, videoId, buttonId) {
    var video = document.getElementById(videoId || "moviePlayer");
    var button = document.getElementById(buttonId || "moviePlayButton");
    var hls = null;
    var attached = false;

    if (!video || !sourceUrl) {
      return;
    }

    function start() {
      if (attached) {
        video.play().catch(function () {});
        return;
      }
      attached = true;
      if (button) {
        button.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = sourceUrl;
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener("click", start);
    }
    all("[data-play-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        video.scrollIntoView({ behavior: "smooth", block: "center" });
        start();
      });
    });
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initBackTop();
    initSearchForms();
    initHero();
    initFilters();
  });
})();
