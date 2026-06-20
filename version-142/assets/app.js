(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    if (!tags) {
      tags = "<span>" + escapeHtml(movie.type || "影视") + "</span>";
    }

    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-badge\">" + escapeHtml(movie.year || "") + "</span>",
      "<span class=\"poster-play\">▶</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-tags\">" + tags + "</div>",
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p class=\"movie-meta\">" + escapeHtml([movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ")) + "</p>",
      "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine || "") + "</p>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[match];
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-filter-tabs]").forEach(function (tabs) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      tabs.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-filter]");
        if (!button) {
          return;
        }
        tabs.querySelectorAll("button").forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        var filter = button.getAttribute("data-filter");
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region")
          ].join(" ");
          var show = filter === "all" || haystack.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden-card", !show);
        });
      });
    });

    var results = document.getElementById("searchResults");
    if (results && window.siteMovies) {
      var params = new URLSearchParams(window.location.search);
      var query = normalize(params.get("q"));
      var input = document.getElementById("searchInput");
      var title = document.getElementById("searchTitle");
      if (input) {
        input.value = params.get("q") || "";
      }
      var matches = window.siteMovies.filter(function (movie) {
        if (!query) {
          return movie.rank <= 72;
        }
        var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" "));
        return text.indexOf(query) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = query ? "搜索结果" : "推荐内容";
      }

      if (matches.length) {
        results.innerHTML = matches.map(cardTemplate).join("");
      } else {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
      }
    }
  });
}());
