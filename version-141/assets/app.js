(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.getElementById("mobileNav");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-slide-prev]");
    var next = slider.querySelector("[data-slide-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-slide"));
        show(nextIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var section = panel.closest(".content-section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      }

      var input = panel.querySelector("[data-movie-search]");
      var category = panel.querySelector("[data-filter-category]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var empty = document.createElement("div");
      empty.className = "no-results";
      empty.textContent = "没有找到匹配的影片，请尝试其他关键词。";
      if (cards.length && cards[0].parentNode) {
        cards[0].parentNode.after(empty);
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var categoryValue = category ? category.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
          var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var isVisible = matchesKeyword && matchesCategory && matchesType && matchesYear;
          card.style.display = isVisible ? "" : "none";
          if (isVisible) {
            visibleCount += 1;
          }
        });

        empty.classList.toggle("is-visible", visibleCount === 0);
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
        input.addEventListener("input", apply);
      }
      [category, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !overlay || !streamUrl) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      video.controls = true;
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupFilters();
  });
})();
