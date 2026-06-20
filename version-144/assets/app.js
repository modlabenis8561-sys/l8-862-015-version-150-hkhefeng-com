(function () {
    function rootPrefix() {
        return document.body.getAttribute('data-root-prefix') || '';
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = rootPrefix() + 'search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                play();
            });
        });

        hero.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });

        hero.addEventListener('mouseleave', play);
        play();
    }

    function setupLocalFilters() {
        var grids = document.querySelectorAll('[data-card-grid]');
        if (!grids.length) {
            return;
        }

        grids.forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.children);
            var container = grid.closest('main') || document;
            var searchInput = container.querySelector('.js-filter-input');
            var chips = Array.prototype.slice.call(container.querySelectorAll('.filter-chip'));
            var emptyState = container.querySelector('[data-empty-state]');
            var activeFilter = '';

            function apply() {
                var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = (card.getAttribute('data-search') || '').toLowerCase();
                    var filterText = (card.getAttribute('data-filter-tags') || searchText).toLowerCase();
                    var queryMatch = !query || searchText.indexOf(query) !== -1;
                    var filterMatch = !activeFilter || filterText.indexOf(activeFilter.toLowerCase()) !== -1;
                    var show = queryMatch && filterMatch;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle('is-visible', visible === 0);
                }
            }

            if (searchInput) {
                var params = new URLSearchParams(window.location.search);
                var initialQuery = params.get('q');
                if (initialQuery && searchInput.classList.contains('search-page-input')) {
                    searchInput.value = initialQuery;
                }
                searchInput.addEventListener('input', apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    chip.classList.add('is-active');
                    activeFilter = chip.getAttribute('data-filter') || '';
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayer() {
        var shells = document.querySelectorAll('.player-shell');
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.play-overlay');
            var source = shell.getAttribute('data-video-url');
            var loaded = false;

            if (!video || !source) {
                return;
            }

            function loadSource() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                loadSource();
                shell.classList.add('is-playing');
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
        });
    }

    function setupImages() {
        var images = document.querySelectorAll('img');
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupGlobalSearch();
        setupHero();
        setupLocalFilters();
        setupPlayer();
        setupImages();
    });
}());
