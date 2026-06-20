(function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('open');
      var input = searchPanel.querySelector('input');
      if (input && searchPanel.classList.contains('open')) {
        input.focus();
      }
    });
  }

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        form.action = './search.html';
      } else {
        event.preventDefault();
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var heroTimer;

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

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      startHero();
    });
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var rankItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter-rank]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var keyword = normalize(filterInput ? filterInput.value : '');
    var selected = normalize(filterSelect ? filterSelect.value : '');
    var visible = 0;
    var targets = cards.length ? cards : rankItems;

    targets.forEach(function (item) {
      var haystack = normalize(item.textContent);
      var category = normalize(item.getAttribute('data-category'));
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okCategory = !selected || category === selected;
      var isVisible = okKeyword && okCategory;
      item.classList.toggle('hidden', !isVisible);
      if (isVisible) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  if (filterInput || filterSelect) {
    applyFilter();
  }
})();
