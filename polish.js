(() => {
  "use strict";

  // This layer runs after the original scene controller and reuses its cleanup.
  if (typeof showScene !== "function" ||
      typeof startMemories !== "function" ||
      typeof dropPhoto !== "function") {
    console.warn("请把 polish.js 放在 script.js 后面加载。");
    return;
  }

  if (window.__birthdayPolishLoaded) return;
  window.__birthdayPolishLoaded = true;

  const body = document.body;
  const main = document.getElementById("main");
  const gallery = document.getElementById("gallery");
  const cake = document.getElementById("cake-art");
  const dissolve = document.createElement("div");
  dissolve.id = "scene-dissolve";
  dissolve.setAttribute("aria-hidden", "true");
  const candlelight = document.createElement("div");
  candlelight.id = "candlelight";
  candlelight.setAttribute("aria-hidden", "true");
  body.append(candlelight, dissolve);

  function decoratePhotos() {
    const cards = [...gallery.querySelectorAll("button.polaroid")];
    gallery.classList.add("memory-gallery");
    gallery.classList.toggle("memory-empty", cards.length === 0);

    cards.forEach((card) => {
      const image = card.querySelector("img");
      const photo = PHOTOS[Number(card.dataset.photoIndex)];
      if (!image || !photo) return;
      image.style.objectFit = "contain";
      image.style.objectPosition = photo.position || "50% 50%";
      image.style.filter = "none";
    });
  }

  const originalStartMemories = startMemories;
  startMemories = function () {
    decoratePhotos();
    originalStartMemories();
  };

  let lightFrame = 0;
  let lastPaletteKey = "";

  function syncScenePalette() {
    if (typeof ambientPalette === "undefined") return;
    const key = `${body.dataset.scene}:${body.classList.contains("polish-candles-out")}`;
    if (key === lastPaletteKey) return;
    lastPaletteKey = key;
    const colors = getComputedStyle(body);
    for (const [property, variable] of [
      ["firefly", "--ambient-firefly"],
      ["petal", "--ambient-petal"],
      ["text", "--ambient-text"]
    ]) {
      const value = colors.getPropertyValue(variable).trim();
      if (value) ambientPalette[property] = value;
    }
    const blend = colors.getPropertyValue("--particle-blend").trim();
    ambientPalette.blend = blend === "source-over" ? "source-over" : "lighter";
  }

  function updateCandlelight() {
    body.classList.toggle("polish-candles-out", cake.classList.contains("extinguished"));
    syncScenePalette();
    if (currentScene !== "cake") return;
    const flames = [...cake.querySelectorAll(".flame")];
    if (flames.length === 0) return;
    let centerX = 0;
    let centerY = 0;
    for (const flame of flames) {
      const bounds = flame.getBoundingClientRect();
      centerX += bounds.left + bounds.width / 2;
      centerY += bounds.top + bounds.height / 2;
    }
    candlelight.style.setProperty("--candle-x", `${centerX / flames.length}px`);
    candlelight.style.setProperty("--candle-y", `${centerY / flames.length}px`);
  }

  function requestLightUpdate() {
    if (lightFrame || currentScene !== "cake") return;
    lightFrame = requestAnimationFrame(() => {
      lightFrame = 0;
      updateCandlelight();
    });
  }

  const candleObserver = new MutationObserver(updateCandlelight);
  function observeCandles() {
    candleObserver.observe(cake, { attributes: true, attributeFilter: ["class"] });
  }
  observeCandles();
  window.addEventListener("scroll", requestLightUpdate, { passive: true });
  window.addEventListener("resize", requestLightUpdate, { passive: true });

  const originalShowScene = showScene;
  showScene = function (name, options = {}) {
    if (!SCENES.includes(name)) return;
    clearSceneTimers();
    stopGalleryAnimation();
    stopFriendship();
    stopBlowDetection();
    main.setAttribute("aria-busy", "true");

    const revealScene = () => {
      originalShowScene(name, options);
      updateCandlelight();
      body.classList.remove("polish-changing");
      main.setAttribute("aria-busy", "false");
      const heading = document.getElementById(name)?.querySelector("h1, h2, .eyebrow");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    };

    if (reducedMotion) {
      revealScene();
      return;
    }
    body.classList.add("polish-changing");
    // Use the existing scheduler: rapid navigation cancels stale transitions.
    later(revealScene, 360);
  };

  window.addEventListener("pagehide", () => {
    candleObserver.disconnect();
    cancelAnimationFrame(lightFrame);
    lightFrame = 0;
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    observeCandles();
    updateCandlelight();
    body.classList.remove("polish-changing");
    main.setAttribute("aria-busy", "false");
  });

  decoratePhotos();
  updateCandlelight();
})();
