(function () {
  "use strict";

  const navLinks = Array.from(document.querySelectorAll("#nav a"));
  const sections = ["home", "research", "news", "misc"];

  const yearRange = document.getElementById("year-range");
  const yearMin = document.getElementById("year-min");
  const tagSelect = document.getElementById("tag-select");
  const pubCards = Array.from(document.querySelectorAll(".pub"));
  const pubShowMore = document.getElementById("pub-show-more");
  const pubShowLess = document.getElementById("pub-show-less");

  const updates = Array.from(document.querySelectorAll("#update-contain .update"));
  const newsShowMore = document.getElementById("news-show-more");
  const newsShowLess = document.getElementById("news-show-less");

  let visiblePubCount = 3;
  let visibleNewsCount = 3;

  function setButtonState(button, disabled) {
    if (!button) {
      return;
    }

    button.disabled = disabled;
    button.classList.toggle("disabled", disabled);
  }

  function getActiveSectionId() {
    const scrollPos = window.scrollY + 140;
    let activeSection = "home";

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section && section.offsetTop <= scrollPos) {
        activeSection = sectionId;
      }
    });

    return activeSection;
  }

  function updateActiveNav() {
    const activeSection = getActiveSectionId();

    navLinks.forEach((link) => {
      const target = link.getAttribute("href").replace("#", "");
      link.classList.toggle("selected", target === activeSection);
    });
  }

  function initSmoothScroll() {
    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        const targetId = link.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);

        if (!target) {
          return;
        }

        window.scrollTo({
          top: target.offsetTop - 72,
          behavior: "smooth",
        });
      });
    });

    const backToTop = document.getElementById("back-to-top");
    if (backToTop) {
      backToTop.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function filteredPublications() {
    const minYear = yearRange ? Number(yearRange.value) : 0;
    const selectedTag = tagSelect ? tagSelect.value : "all";

    return pubCards.filter((card) => {
      const cardYear = Number(card.dataset.year || 0);
      const tags = (card.dataset.tags || "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase());

      const yearMatch = cardYear >= minYear;
      const tagMatch = selectedTag === "all" || tags.includes(selectedTag);

      return yearMatch && tagMatch;
    });
  }

  function renderPublications() {
    const filtered = filteredPublications();

    pubCards.forEach((card) => {
      card.style.display = "none";
    });

    filtered.slice(0, visiblePubCount).forEach((card) => {
      card.style.display = "block";
    });

    setButtonState(pubShowLess, visiblePubCount <= 3);
    setButtonState(pubShowMore, filtered.length <= visiblePubCount);
  }

  function initPublicationControls() {
    if (yearRange && yearMin) {
      yearRange.addEventListener("input", () => {
        yearMin.textContent = yearRange.value;
        visiblePubCount = 3;
        renderPublications();
      });
    }

    if (tagSelect) {
      tagSelect.addEventListener("change", () => {
        visiblePubCount = 3;
        renderPublications();
      });
    }

    if (pubShowMore) {
      pubShowMore.addEventListener("click", () => {
        visiblePubCount += 3;
        renderPublications();
      });
    }

    if (pubShowLess) {
      pubShowLess.addEventListener("click", () => {
        visiblePubCount = Math.max(3, visiblePubCount - 3);
        renderPublications();
      });
    }

    renderPublications();
  }

  function renderNews() {
    updates.forEach((update) => {
      update.style.display = "none";
    });

    updates.slice(0, visibleNewsCount).forEach((update) => {
      update.style.display = "grid";
    });

    setButtonState(newsShowLess, visibleNewsCount <= 3);
    setButtonState(newsShowMore, updates.length <= visibleNewsCount);
  }

  function initNewsControls() {
    if (newsShowMore) {
      newsShowMore.addEventListener("click", () => {
        visibleNewsCount += 2;
        renderNews();
      });
    }

    if (newsShowLess) {
      newsShowLess.addEventListener("click", () => {
        visibleNewsCount = Math.max(3, visibleNewsCount - 2);
        renderNews();
      });
    }

    renderNews();
  }

  function init() {
    initSmoothScroll();
    initPublicationControls();
    initNewsControls();

    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
