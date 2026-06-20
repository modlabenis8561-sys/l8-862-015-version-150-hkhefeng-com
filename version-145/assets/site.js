(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNav() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var region = qs('[data-filter-region]', scope);
      var type = qs('[data-filter-type]', scope);
      var year = qs('[data-filter-year]', scope);
      var cards = qsa('[data-card]', scope);
      var noResults = qs('[data-no-results]', scope);

      function apply() {
        var query = normalize(input && input.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-meta'),
            card.getAttribute('data-category')
          ].join(' '));
          var show = true;
          if (query && haystack.indexOf(query) === -1) {
            show = false;
          }
          if (selectedRegion && haystack.indexOf(selectedRegion) === -1) {
            show = false;
          }
          if (selectedType && haystack.indexOf(selectedType) === -1) {
            show = false;
          }
          if (selectedYear && haystack.indexOf(selectedYear) === -1) {
            show = false;
          }
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function createSearchCard(item) {
    var article = document.createElement('article');
    article.className = 'search-result-card';
    article.innerHTML = [
      '<a href="./' + item.file + '"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
      '<div>',
      '<div class="list-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
      '<h2><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<a class="card-action" href="./' + item.file + '">立即观看</a>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var container = qs('[data-search-results]');
    if (!container || !window.SEARCH_INDEX) {
      return;
    }
    var input = qs('[data-page-search-input]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render(value) {
      var q = normalize(value);
      container.innerHTML = '';
      if (!q) {
        qs('[data-search-count]').textContent = '输入关键词后显示匹配影片';
        return;
      }
      var results = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.category,
          item.oneLine
        ].join(' '));
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      qs('[data-search-count]').textContent = '找到 ' + results.length + ' 条匹配结果';
      if (!results.length) {
        var empty = document.createElement('div');
        empty.className = 'no-results is-visible';
        empty.textContent = '暂无匹配影片';
        container.appendChild(empty);
        return;
      }
      results.forEach(function (item) {
        container.appendChild(createSearchCard(item));
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
