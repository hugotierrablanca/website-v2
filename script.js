(function () {
  "use strict";

  const navLinks = Array.from(document.querySelectorAll("#nav a"));
  const sections = ["home", "interests", "research", "news", "misc"];

  const yearRangeMin = document.getElementById("year-range-min");
  const yearRangeMax = document.getElementById("year-range-max");
  const yearActiveTrack = document.getElementById("year-active-track");
  const yearMinLabel = document.getElementById("year-min");
  const yearMaxLabel = document.getElementById("year-max");
  const tagSelect = document.getElementById("tag-select");
  const pubCards = Array.from(document.querySelectorAll(".pub"));
  const pubShowMore = document.getElementById("pub-show-more");
  const pubShowLess = document.getElementById("pub-show-less");

  const updates = Array.from(document.querySelectorAll("#update-contain .update"));
  const newsShowMore = document.getElementById("news-show-more");
  const newsShowLess = document.getElementById("news-show-less");

  let visiblePubCount = 3;
  let visibleNewsCount = 3;

  function updateExpandButtons(showMoreBtn, showLessBtn, isExpanded) {
    if (showMoreBtn) {
      showMoreBtn.style.display = !isExpanded ? "inline-block" : "none";
    }
    if (showLessBtn) {
      showLessBtn.style.display = isExpanded ? "inline-block" : "none";
    }
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

        const targetContainer = target.classList.contains("anchor")
          ? target.closest("section, .ri-section")
          : null;
        const targetTop = targetContainer ? targetContainer.offsetTop : target.offsetTop;
        window.scrollTo({
          top: Math.max(0, targetTop - 72),
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

  function updateYearRangeUI() {
    if (!yearRangeMin || !yearRangeMax) {
      return;
    }

    const rangeFloor = Number(yearRangeMin.min);
    const rangeCeil = Number(yearRangeMin.max);
    const minValue = Number(yearRangeMin.value);
    const maxValue = Number(yearRangeMax.value);

    if (yearMinLabel) {
      yearMinLabel.textContent = String(minValue);
    }

    if (yearMaxLabel) {
      yearMaxLabel.textContent = String(maxValue);
    }

    if (yearActiveTrack) {
      const full = Math.max(1, rangeCeil - rangeFloor);
      const leftPct = ((minValue - rangeFloor) / full) * 100;
      const rightPct = ((maxValue - rangeFloor) / full) * 100;
      yearActiveTrack.style.left = `${leftPct}%`;
      yearActiveTrack.style.width = `${Math.max(0, rightPct - leftPct)}%`;
    }

    // When both thumbs overlap, keep the handle that can expand the range on top.
    if (minValue === maxValue) {
      if (minValue <= rangeFloor) {
        yearRangeMin.style.zIndex = "1";
        yearRangeMax.style.zIndex = "2";
      } else {
        yearRangeMin.style.zIndex = "2";
        yearRangeMax.style.zIndex = "1";
      }
    } else {
      yearRangeMin.style.zIndex = "2";
      yearRangeMax.style.zIndex = "1";
    }
  }

  function filteredPublications() {
    const minYear = yearRangeMin ? Number(yearRangeMin.value) : 0;
    const maxYear = yearRangeMax ? Number(yearRangeMax.value) : 9999;
    const selectedTag = tagSelect ? tagSelect.value : "all";

    return pubCards.filter((card) => {
      const cardYear = Number(card.dataset.year || 0);
      const tags = (card.dataset.tags || "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase());

      const yearMatch = cardYear >= minYear && cardYear <= maxYear;
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

    const isExpanded = visiblePubCount > 3;
    updateExpandButtons(pubShowMore, pubShowLess, isExpanded);
  }

  function initPublicationControls() {
    if (yearRangeMin && yearRangeMax) {
      yearRangeMin.addEventListener("input", () => {
        if (Number(yearRangeMin.value) > Number(yearRangeMax.value)) {
          yearRangeMin.value = yearRangeMax.value;
        }
        updateYearRangeUI();
        visiblePubCount = 3;
        renderPublications();
      });

      yearRangeMax.addEventListener("input", () => {
        if (Number(yearRangeMax.value) < Number(yearRangeMin.value)) {
          yearRangeMax.value = yearRangeMin.value;
        }
        updateYearRangeUI();
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
        visiblePubCount = 3;
        renderPublications();
      });
    }

    updateYearRangeUI();
    renderPublications();
  }

  function renderNews() {
    updates.forEach((update) => {
      update.style.display = "none";
    });

    updates.slice(0, visibleNewsCount).forEach((update) => {
      update.style.display = "grid";
    });

    const isExpanded = visibleNewsCount > 3;
    updateExpandButtons(newsShowMore, newsShowLess, isExpanded);
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
        visibleNewsCount = 3;
        renderNews();
      });
    }

    renderNews();
  }

  function initResearchInterestsAccordion() {
    const tabBtns = Array.from(document.querySelectorAll(".ri-tab-btn"));
    const panels = Array.from(document.querySelectorAll(".ri-track-panel"));
    const triggers = Array.from(document.querySelectorAll(".ri-trigger"));

    if (tabBtns.length > 0 && panels.length > 0) {
      tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.track;
          const panel = document.getElementById(`ri-panel-${target}`);
          if (!panel) {
            return;
          }

          tabBtns.forEach((tabBtn) => tabBtn.classList.remove("active"));
          panels.forEach((panelEl) => panelEl.classList.remove("active"));

          btn.classList.add("active");
          panel.classList.add("active");
        });
      });
    }

    if (triggers.length === 0) {
      return;
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".ri-item");
        const panel = trigger.closest(".ri-track-panel");
        if (!item || !panel) {
          return;
        }

        const isOpen = item.classList.contains("open");

        panel.querySelectorAll(".ri-item").forEach((el) => {
          el.classList.remove("open");
          const elTrigger = el.querySelector(".ri-trigger");
          if (elTrigger) {
            elTrigger.setAttribute("aria-expanded", "false");
          }
        });

        if (!isOpen) {
          item.classList.add("open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function positionLiveStatusUnderNav() {
    const nav = document.getElementById("nav");
    const statusWrap = document.getElementById("nav-live-status-wrap");
    if (!nav || !statusWrap) {
      return;
    }

    const navBottom = nav.getBoundingClientRect().bottom;
    statusWrap.style.top = `${Math.round(navBottom + 10)}px`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  }

  function weatherIconForCode(code) {
    if (code === 0) {
      return "\u2600";
    }
    if (code >= 1 && code <= 3) {
      return "\u26c5";
    }
    if (code === 45 || code === 48) {
      return "\u{1F32B}";
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return "\u{1F327}";
    }
    if (code >= 71 && code <= 77) {
      return "\u2744";
    }
    if (code >= 95) {
      return "\u26c8";
    }
    return "\u263c";
  }

  const BOSTON_LOCATION_LABEL = "Boston, MA";
  const BOSTON_COORDS = {
    latitude: 42.3601,
    longitude: -71.0589,
  };

  async function resolveWeather(latitude, longitude) {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    try {
      const weather = await fetchJson(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`,
      );
      const current = weather.current || {};
      const tempC = Number(current.temperature_2m);
      if (!Number.isFinite(tempC)) {
        return null;
      }
      const tempF = tempC * (9 / 5) + 32;
      return {
        tempC,
        tempF,
        icon: weatherIconForCode(Number(current.weather_code)),
      };
    } catch (error) {
      return null;
    }
  }

  async function initLiveStatus() {
    const dateEl = document.getElementById("live-date");
    const locationEl = document.getElementById("live-location");
    const tempEl = document.getElementById("live-temp");
    const iconEl = document.getElementById("live-weather-icon");
    if (!dateEl || !locationEl || !tempEl || !iconEl) {
      return;
    }

    const now = new Date();
    dateEl.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/New_York",
    }).format(now);

    locationEl.textContent = `I am @ ${BOSTON_LOCATION_LABEL}`;

    const weather = await resolveWeather(
      BOSTON_COORDS.latitude,
      BOSTON_COORDS.longitude,
    );
    if (!weather) {
      iconEl.textContent = "\u263c";
      tempEl.textContent = "--.- \u00b0C / --.- \u00b0F";
      return;
    }

    iconEl.textContent = weather.icon;
    tempEl.textContent = `${weather.tempC.toFixed(1)} \u00b0C / ${weather.tempF.toFixed(1)} \u00b0F`;
  }

  function initNeuralNetworkBackground() {
    const canvas = document.getElementById("neural-network-bg");
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = [];
    const edges = [];
    const pulses = [];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let maxLinkDistance = 150;
    let scrollEnergy = 0;
    let lastFrameTime = performance.now();

    function computeNodeCount() {
      const area = window.innerWidth * window.innerHeight;
      return Math.max(26, Math.min(70, Math.floor(area / 22000)));
    }

    function resetNodes(count) {
      nodes.length = 0;
      for (let i = 0; i < count; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          r: 1.4 + Math.random() * 1.6,
          wobble: Math.random() * Math.PI * 2,
        });
      }
    }

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      maxLinkDistance = Math.max(95, Math.min(185, width * 0.12 + height * 0.025));
      resetNodes(computeNodeCount());
    }

    function updateNodes(frameScale) {
      const speedScale = 1 + scrollEnergy * 0.22;

      for (const node of nodes) {
        node.x += node.vx * frameScale * speedScale;
        node.y += node.vy * frameScale * speedScale;
        node.wobble += frameScale * 0.025;

        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
        }
        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(height, node.y));
        }
      }

      scrollEnergy = Math.max(0, scrollEnergy * 0.94 - 0.0015);
    }

    function collectEdges() {
      edges.length = 0;
      const threshold = maxLinkDistance * maxLinkDistance;

      for (let i = 0; i < nodes.length; i += 1) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < threshold) {
            edges.push({
              a: i,
              b: j,
              dist: Math.sqrt(distSq),
            });
          }
        }
      }
    }

    function spawnPulses(frameScale) {
      if (edges.length === 0) {
        return;
      }

      const spawnChance = 0.04 + scrollEnergy * 0.03;
      const attempts = Math.max(1, Math.ceil(frameScale));

      for (let i = 0; i < attempts; i += 1) {
        if (pulses.length >= 26 || Math.random() > spawnChance) {
          continue;
        }

        const edge = edges[Math.floor(Math.random() * edges.length)];
        if (!edge) {
          continue;
        }

        const reverse = Math.random() < 0.5;
        pulses.push({
          a: reverse ? edge.b : edge.a,
          b: reverse ? edge.a : edge.b,
          t: 0,
          speed: 0.006 + Math.random() * 0.007 + scrollEnergy * 0.002,
          radius: 1.4 + Math.random() * 1.4,
        });
      }
    }

    function draw(frameScale) {
      ctx.clearRect(0, 0, width, height);
      collectEdges();

      for (const edge of edges) {
        const nodeA = nodes[edge.a];
        const nodeB = nodes[edge.b];
        const distFactor = 1 - edge.dist / maxLinkDistance;
        const alpha = Math.max(0.03, distFactor * (0.22 + scrollEnergy * 0.12));

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = `rgba(61, 116, 217, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7 + distFactor * 0.8;
        ctx.stroke();
      }

      for (const node of nodes) {
        const radius = node.r + Math.sin(node.wobble) * 0.35;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(11, 152, 230, 0.78)";
        ctx.shadowBlur = 9;
        ctx.shadowColor = "rgba(63, 182, 255, 0.38)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      spawnPulses(frameScale);

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const pulse = pulses[i];
        const from = nodes[pulse.a];
        const to = nodes[pulse.b];
        if (!from || !to) {
          pulses.splice(i, 1);
          continue;
        }

        pulse.t += pulse.speed * frameScale;
        if (pulse.t >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const x = from.x + (to.x - from.x) * pulse.t;
        const y = from.y + (to.y - from.y) * pulse.t;

        ctx.beginPath();
        ctx.arc(x, y, pulse.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(191, 232, 255, 0.96)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(151, 210, 255, 0.62)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function animate(now) {
      const frameScale = Math.min((now - lastFrameTime) / 16.67, 2.5);
      lastFrameTime = now;

      updateNodes(frameScale);
      draw(frameScale);
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener(
      "scroll",
      () => {
        scrollEnergy = Math.min(scrollEnergy + 0.16, 2.5);
      },
      { passive: true },
    );

    resizeCanvas();
    draw(1);

    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  function init() {
    initNeuralNetworkBackground();
    initSmoothScroll();
    positionLiveStatusUnderNav();
    initLiveStatus();
    initPublicationControls();
    initNewsControls();
    initResearchInterestsAccordion();

    window.addEventListener("resize", positionLiveStatusUnderNav);
    window.addEventListener("load", positionLiveStatusUnderNav);
    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
