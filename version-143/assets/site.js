(function() {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.getElementById("mobilePanel");

  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      var open = panel.classList.toggle("active");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    setInterval(function() {
      showSlide(current + 1);
    }, 5000);
  }

  var searchPage = document.querySelector("[data-search-page]");

  if (searchPage && window.SITE_MOVIES) {
    var queryInput = document.getElementById("searchKeyword");
    var typeSelect = document.getElementById("searchType");
    var regionSelect = document.getElementById("searchRegion");
    var form = document.getElementById("searchForm");
    var results = document.getElementById("searchResults");
    var empty = document.getElementById("searchEmpty");
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q") || "";

    if (queryInput && preset) {
      queryInput.value = preset;
    }

    function fillOptions(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function uniqueValues(key) {
      var values = [];
      window.SITE_MOVIES.forEach(function(movie) {
        if (movie[key] && values.indexOf(movie[key]) === -1) {
          values.push(movie[key]);
        }
      });
      return values.sort();
    }

    fillOptions(typeSelect, uniqueValues("type"));
    fillOptions(regionSelect, uniqueValues("region"));

    function card(movie) {
      var tags = movie.tags.slice(0, 2).map(function(tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + movie.url + "\">" +
        "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"card-badge\">" + escapeHtml(movie.type) + "</span>" +
        "</a>" +
        "<div class=\"card-body\">" +
        "<a class=\"card-title\" href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a>" +
        "<p class=\"card-desc\">" + escapeHtml(movie.line) + "</p>" +
        "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
        "<div class=\"card-tags\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function(char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function render() {
      var keyword = (queryInput ? queryInput.value : "").trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var matched = window.SITE_MOVIES.filter(function(movie) {
        var haystack = [movie.title, movie.line, movie.genre, movie.region, movie.type, movie.year].concat(movie.tags).join(" ").toLowerCase();
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var typeOk = !type || movie.type === type;
        var regionOk = !region || movie.region === region;
        return keywordOk && typeOk && regionOk;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = matched.map(card).join("");
      }

      if (empty) {
        empty.classList.toggle("active", matched.length === 0);
      }
    }

    if (form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        render();
      });
    }

    [queryInput, typeSelect, regionSelect].forEach(function(element) {
      if (element) {
        element.addEventListener("input", render);
        element.addEventListener("change", render);
      }
    });

    render();
  }
})();
