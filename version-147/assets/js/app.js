(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      mobileButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    var next = document.querySelector('.hero-next');
    var prev = document.querySelector('.hero-prev');
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var type = filterRoot.querySelector('[data-filter-type]');
    var reset = filterRoot.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var regionOk = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
        var typeOk = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var queryOk = !query || haystack.indexOf(query) > -1;
        card.classList.toggle('hidden-card', !(regionOk && typeOk && queryOk));
      });
    }

    [input, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilter);
        node.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.siteMovies) {
    var searchInput = searchRoot.querySelector('[data-search-input]');
    var searchGrid = searchRoot.querySelector('[data-search-grid]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch() {
      var q = String(searchInput.value || '').toLowerCase().trim();
      var items = window.siteMovies.filter(function (movie) {
        if (!q) {
          return movie.hot;
        }
        return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.tags]
          .join(' ')
          .toLowerCase()
          .indexOf(q) > -1;
      }).slice(0, 120);

      if (!items.length) {
        searchGrid.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
        return;
      }

      searchGrid.innerHTML = items.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="card-play">▶</span>' +
          '<span class="card-year">' + escapeHtml(movie.year) + '</span>' +
          '<span class="card-rating">★ ' + escapeHtml(movie.rating) + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
          '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    searchInput.value = initial;
    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }
})();
