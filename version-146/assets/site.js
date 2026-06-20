(function() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-site-menu]");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function() {
            menu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
        });
    }

    const slider = document.querySelector("[data-hero-slider]");
    if (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const previous = slider.querySelector("[data-hero-prev]");
        const next = slider.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                setSlide(current + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener("click", function() {
                setSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                setSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                setSlide(index);
                startTimer();
            });
        });

        setSlide(0);
        startTimer();
    }

    const panels = Array.from(document.querySelectorAll("[data-filter-panel]")).concat(
        Array.from(document.querySelectorAll(".home-search-card"))
    );

    const filterInputs = Array.from(document.querySelectorAll(".js-filter-input"));
    const filterSelects = Array.from(document.querySelectorAll(".js-filter-select"));
    const sortSelects = Array.from(document.querySelectorAll(".js-sort-select"));
    const grids = Array.from(document.querySelectorAll("[data-filter-grid]"));

    function activeQuery() {
        const input = filterInputs.find(function(item) {
            return item.value.trim().length > 0;
        });
        return input ? input.value.trim().toLowerCase() : "";
    }

    function activeYear() {
        const select = filterSelects.find(function(item) {
            return item.dataset.filterKey === "year" && item.value;
        });
        return select ? select.value : "";
    }

    function applyFilters() {
        const query = activeQuery();
        const year = activeYear();
        grids.forEach(function(grid) {
            const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
            cards.forEach(function(card) {
                const haystack = card.dataset.search || "";
                const cardYear = card.dataset.year || "";
                const queryMatch = !query || haystack.indexOf(query) !== -1;
                const yearMatch = !year || cardYear === year;
                card.classList.toggle("is-hidden", !(queryMatch && yearMatch));
            });
        });
    }

    function applySort(select) {
        const value = select.value;
        grids.forEach(function(grid) {
            const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
            const sorted = cards.slice().sort(function(a, b) {
                const yearA = parseInt(a.dataset.year || "0", 10);
                const yearB = parseInt(b.dataset.year || "0", 10);
                const titleA = a.dataset.title || "";
                const titleB = b.dataset.title || "";

                if (value === "year-desc") {
                    return yearB - yearA;
                }
                if (value === "year-asc") {
                    return yearA - yearB;
                }
                if (value === "title-asc") {
                    return titleA.localeCompare(titleB, "zh-Hans-CN");
                }
                return 0;
            });
            sorted.forEach(function(card) {
                grid.appendChild(card);
            });
        });
    }

    filterInputs.forEach(function(input) {
        input.addEventListener("input", applyFilters);
    });

    filterSelects.forEach(function(select) {
        select.addEventListener("change", applyFilters);
    });

    sortSelects.forEach(function(select) {
        select.addEventListener("change", function() {
            applySort(select);
            applyFilters();
        });
    });

    panels.forEach(function(panel) {
        panel.addEventListener("submit", function(event) {
            event.preventDefault();
        });
    });
}());
