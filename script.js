"use strict";

const PHOTOS = [
  {
    src: "photos/images.jpg",
    caption: "小时候的我们"
  },
  {
    src: "photos/together.webp",
    caption: "长大后的我们"
  }
];

const FRIENDSHIP_MESSAGES = [
  "23岁了耶！",
  "不过你知道更夸张的是什么吗？",
  "我们居然已经认识……"
];

const BIRTHDAY_WISHES = [
  "Happy Birthday, 晓玲！🎂",
  "23岁生日快乐啦～",
  "认识你都17年了，\n想想真的有点不可思议哈哈哈。",
  "希望你新的一岁每天都开开心心，\n想做的事情都顺顺利利，\n想去的地方都能去。",
  "以后也要继续一起吃好吃的、\n去好玩的地方，\n拍更多好看的照片！",
  "祝你23岁快乐，\n每天都有值得期待的小事～ 💗"
];

/* Scene timers are cleared whenever a scene changes. */
const $ = (selector) => document.querySelector(selector);

const SCENES = [
  "invitation",
  "countdown",
  "birthday",
  "friendship",
  "memories",
  "cake",
  "wishes",
  "gift",
  "finale"
];

const CHAPTERS = [
  "一封小小的邀请",
  "惊喜正在靠近",
  "今夜，为你庆祝",
  "藏在星星里的答案",
  "属于我们的回忆",
  "把愿望交给星光",
  "几句生日悄悄话",
  "还有一份小惊喜",
  "我们的故事，未完待续"
];

const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

let reducedMotion = motionQuery.matches;
let currentScene = "invitation";
let autoAdvance = true;
let sceneTimers = new Set();
let opening = false;
let blowing = false;
let celebrating = false;
let finalGiftOpening = false;
let toastTimer;
let currentPhoto = 0;
const galleryAnimations = new Set();

function later(callback, delay) {
  const id = setTimeout(() => {
    sceneTimers.delete(id);
    callback();
  }, delay);

  sceneTimers.add(id);
  return id;
}

function clearSceneTimers() {
  sceneTimers.forEach(clearTimeout);
  sceneTimers.clear();
}


function announce(message) {
  const toast = $("#toast");

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");

  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3200);
}

function showScene(name, { autoplay = true } = {}) {
  if (!SCENES.includes(name)) return;

  clearSceneTimers();
  stopGalleryAnimation();
  stopFriendship();
  stopBlowDetection();
  closeGiftGame(false);
  currentScene = name;
  autoAdvance = autoplay;
  celebrating = false;
  finalGiftOpening = false;
  document.body.dataset.scene = name;
  $("#final-gift").classList.remove("opened");
  $("#final-gift").disabled = false;

  rockets.length = 0;
  particles.length = 0;
  burstGlows.length = 0;
  textParticles.length = 0;
  textFormation = null;
  document.querySelectorAll(".number-field").forEach((field) => {
    field.classList.remove("has-particles");
  });

  document.querySelectorAll(".scene").forEach((scene) => {
    const active = scene.id === name;
    scene.hidden = !active;
    scene.classList.toggle("active", active);
  });

  const index = SCENES.indexOf(name);
  $("#chapter-number").textContent = String(index + 1).padStart(2, "0");

  $("#progress").style.width = `${index / (SCENES.length - 1) * 100}%`;
  $("#chapter-label").textContent = CHAPTERS[index];
  $("#previous").hidden = index === 0;
  $("#skip").hidden = ["invitation", "gift", "finale"].includes(name);
  $("#footer-note").hidden = name !== "invitation";

  $("#skip").innerHTML =
    name === "countdown"
      ? '跳过倒数 <span aria-hidden="true">→</span>'
      : '继续 <span aria-hidden="true">→</span>';

  window.scrollTo({ top: 0, behavior: "instant" });

  switch (name) {
    case "invitation":
      resetInvitation();
      break;

    case "countdown":
      startCountdown();
      break;

    case "birthday":
      startBirthday();
      break;

    case "friendship":
      startFriendship();
      break;

    case "memories":
      startMemories();
      break;

    case "cake":
      resetCake();
      break;

    case "wishes":
      startWishes();
      break;

    case "gift":
      resetGiftRoom();
      break;

    case "finale":
      startFinale();
      break;
  }
}

function nextScene() {
  const index = SCENES.indexOf(currentScene);
  if (index < SCENES.length - 1) showScene(SCENES[index + 1]);
}

function previousScene() {
  const index = SCENES.indexOf(currentScene);

  if (index > 0) {
    // Replay the previous scene, but let the visitor decide when to leave.
    showScene(SCENES[index - 1], { autoplay: false });
  }
}

/* -------------------------------------------------------
   INVITATION AND COUNTDOWN
------------------------------------------------------- */

function resetInvitation() {
  opening = false;
  $(".invitation-art").classList.remove("is-opening");
  $("#envelope").classList.remove("opened");
  $("#envelope").disabled = false;
  $("#open").disabled = false;
}

function openInvitation() {
  if (opening || currentScene !== "invitation") return;

  opening = true;
  $(".invitation-art").classList.add("is-opening");
  $("#envelope").classList.add("opened");
  $("#envelope").disabled = true;
  $("#open").disabled = true;

  const box = $("#envelope").getBoundingClientRect();
  sparkle(box.left + box.width / 2, box.top + box.height / 3, 65);

  later(() => showScene("countdown"), reducedMotion ? 1200 : 2600);
}

function startCountdown() {
  const count = $("#count");

  function display(value) {
    count.textContent = value;
    count.classList.remove("pulse");
    void count.offsetWidth;
    count.classList.add("pulse");

    const bounds = count.getBoundingClientRect();

    sparkle(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
      25
    );
  }

  display("3");
  later(() => display("2"), 1000);
  later(() => display("1"), 2000);
  if (autoAdvance) {
    later(() => { count.textContent = ""; }, 2950);
    later(() => showScene("birthday"), 3400);
  }
}

function startBirthday() {
  const greeting = $("#birthday-greeting");
  const name = $("#birthday-name");
  const age = $("#birthday-age");

  [greeting, name, age].forEach((el) => el.classList.remove("visible"));

  launch(width * .25, height * .3, "circle");
  launch(width * .75, height * .27, "cascade");

  later(() => greeting.classList.add("visible"), 500);

  later(() => {
    name.classList.add("visible");
    const bounds = name.getBoundingClientRect();

    sparkle(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
      100
    );

    launch(width * .5, height * .24, "heart");
  }, 2000);

  later(() => age.classList.add("visible"), 3400);
  if (autoAdvance) later(() => showScene("friendship"), 9500);
}

/* -------------------------------------------------------
   FRIENDSHIP: PISCES BECOMES 17, THEN 23 FOR THE BIRTHDAY
------------------------------------------------------- */

// Hipparcos positions, projected east-left and normalized in a 760 × 580 field.
// Coordinates: https://github.com/ofrohn/d3-celestial/blob/master/data/stars.6.json
// Connections: https://github.com/Stellarium/stellarium/blob/master/skycultures/modern/index.json
// Chart reference: https://www.astro4edu.org/media/diagrams/pdf/pisces-constellation-map_en.pdf
const PISCES_STARS = [
  { hip: 4889, x: .38174, y: .07500, magnitude: 5.50 },
  { hip: 6193, x: .29693, y: .20133, magnitude: 4.74 },
  { hip: 5742, x: .32606, y: .27591, magnitude: 4.67 },
  { hip: 7097, x: .23571, y: .53295, magnitude: 3.62 },
  { hip: 8198, x: .16484, y: .70513, magnitude: 4.26 },
  { hip: 9487, x: .08000, y: .88304, magnitude: 3.82 },
  { hip: 8833, x: .12326, y: .87125, magnitude: 4.61 },
  { hip: 7884, x: .18503, y: .80725, magnitude: 4.45 },
  { hip: 7007, x: .24232, y: .78899, magnitude: 4.84 },
  { hip: 4906, x: .38111, y: .74040, magnitude: 4.27 },
  { hip: 3760, x: .45576, y: .75682, magnitude: 5.92 },
  { hip: 1645, x: .59684, y: .73205, magnitude: 5.38 },
  { hip: 118268, x: .70528, y: .76897, magnitude: 4.03 },
  { hip: 116771, x: .80392, y: .80339, magnitude: 4.13 },
  { hip: 117245, x: .77110, y: .86292, magnitude: 4.95 },
  { hip: 116928, x: .79324, y: .91041, magnitude: 4.49 },
  { hip: 115738, x: .87024, y: .92500, magnitude: 4.95 },
  { hip: 114971, x: .92000, y: .86861, magnitude: 3.70 },
  { hip: 115227, x: .90381, y: .81020, magnitude: 5.05 },
  { hip: 115830, x: .86496, y: .78244, magnitude: 4.27 }
];

// The northern triangle, both cords through Alrescha, and the western Circlet.
const PISCES_CONNECTIONS = [
  [0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  [11, 12], [12, 13], [13, 14], [14, 15], [15, 16],
  [16, 17], [17, 18], [18, 19], [19, 13]
];

const PISCES_TIMING = {
  stars: 800,
  awaken: 4200,
  morph: 5800,
  friendshipFormed: 10000,
  greeting: 12000,
  formed: 16200,
  fireworks: 16600,
  finish: 21200
};

let piscesSequence = null;

function stopFriendship() {
  piscesSequence = null;
  if (textFormation?.mode === "pisces") {
    textFormation = null;
    textParticles.length = 0;
  }
}

function piscesEase(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function piscesViewport(bounds) {
  const scale = Math.min(bounds.width / 760, bounds.height / 580) * 1.1;
  return {
    scale,
    left: bounds.left + (bounds.width - 760 * scale) / 2,
    top: bounds.top + (bounds.height - 580 * scale) / 2
  };
}

function startFriendship() {
  const intro = $("#friend-intro");
  const reveal = $("#friend-reveal");
  intro.hidden = false;
  reveal.hidden = true;
  $("#pisces-wish").textContent = "";
  $("#pisces-wish").classList.remove("visible");
  $("#friend-number").setAttribute("aria-label", "双鱼座的星光，慢慢汇成17年的友情");
  $("#friend-number").classList.remove("has-particles");
  $("#friendship").dataset.piscesPhase = "sky";
  piscesSequence = { elapsed: 0, phase: "sky", wave: 0, advancing: false };

  function updateMessage(index) {
    intro.textContent = FRIENDSHIP_MESSAGES[index];
    intro.classList.remove("enter");
    void intro.offsetWidth;
    intro.classList.add("enter");
  }

  updateMessage(0);

  later(() => updateMessage(1), 1600);
  later(() => updateMessage(2), 3200);

  // The same clock drives the chart, morph, and celebration. Hidden tabs pause it.
  if (reducedMotion) {
    intro.hidden = true;
    reveal.hidden = false;
    piscesSequence.elapsed = PISCES_TIMING.friendshipFormed;
    formText("17", $("#friend-number"), PISCES_STARS);
  }
}

function drawPisces(now, deltaMs) {
  const sequence = piscesSequence;
  if (currentScene !== "friendship" || !sequence) return;
  sequence.elapsed += deltaMs;
  const elapsed = sequence.elapsed;
  const bounds = $("#friend-number").getBoundingClientRect();
  const view = piscesViewport(bounds);
  const morphAge = elapsed - PISCES_TIMING.morph;
  const phase = elapsed >= PISCES_TIMING.fireworks ? "celebrate"
    : elapsed >= PISCES_TIMING.formed ? "formed"
    : elapsed >= PISCES_TIMING.greeting ? "birthday-morph"
    : elapsed >= PISCES_TIMING.friendshipFormed ? "friendship-formed"
    : morphAge >= 0 ? "morph"
    : elapsed >= PISCES_TIMING.awaken ? "awaken"
    : elapsed >= PISCES_TIMING.stars ? "chart" : "sky";

  if (phase !== sequence.phase) {
    sequence.phase = phase;
    $("#friendship").dataset.piscesPhase = phase;
    if (phase === "friendship-formed") {
      $("#friend-number").setAttribute("aria-label", "星光汇成17，我们已经认识17年了");
    }
    if (phase === "formed") {
      $("#friend-number").setAttribute("aria-label", "星光汇成23，祝晓玲23岁生日快乐");
      if (!reducedMotion) {
        sparkle(view.left + 115 * view.scale, view.top + 140 * view.scale, 10);
        sparkle(view.left + 645 * view.scale, view.top + 450 * view.scale, 10);
      }
    }
  }

  if (morphAge >= 0 && textFormation?.mode !== "pisces") {
    $("#friend-intro").hidden = true;
    $("#friend-reveal").hidden = false;
    formText("17", $("#friend-number"), PISCES_STARS);
  }

  if (elapsed >= PISCES_TIMING.greeting && textFormation?.text !== "23") {
    // Start from the settled 17, carrying every existing particle into 23.
    const origins = textParticles.map((particle) => ({
      x: particle.x / 760,
      y: particle.y / 580
    }));
    formText("23", $("#friend-number"), origins);
    $("#friend-number").setAttribute("aria-label", "17年的星光，汇成23岁的生日祝福");
  }

  if (elapsed >= PISCES_TIMING.greeting && !$("#pisces-wish").textContent) {
    $("#friend-reveal").hidden = true;
    $("#pisces-wish").textContent = "晓玲，23岁生日快乐呀～ ♡";
    $("#pisces-wish").classList.add("visible");
  }

  if (!reducedMotion && sequence.wave < 4 &&
      elapsed >= PISCES_TIMING.fireworks + sequence.wave * 850) {
    const wave = sequence.wave++;
    const colors = ["255,181,210", "197,167,247", "250,218,165", "255,181,210"];
    const targetX = bounds.left + bounds.width * (wave % 2 ? .9 : .1);
    const targetY = Math.max(100, bounds.top + bounds.height * (wave === 3 ? .03 : .16));
    launch(targetX, targetY, wave === 3 ? "heart" : "circle", {
      color: colors[wave], scale: .6
    });
  }

  if (autoAdvance && elapsed >= PISCES_TIMING.finish && !sequence.advancing) {
    sequence.advancing = true;
    showScene("memories");
    return;
  }

  const lineFade = 1 - piscesEase(morphAge / 1000);
  if (lineFade <= 0) return;
  context.save();
  context.translate(view.left, view.top);
  context.scale(view.scale, view.scale);
  const pulseAge = (elapsed - PISCES_TIMING.awaken) / 1500;

  PISCES_CONNECTIONS.forEach(([from, to], index) => {
    const progress = piscesEase((elapsed - 1050 - index * 105) / 650);
    if (progress <= 0) return;
    const a = PISCES_STARS[from];
    const b = PISCES_STARS[to];
    const pulse = Math.exp(-Math.pow((index / 20 - pulseAge) * 7, 2));
    const shimmer = .94 + Math.sin(now * .0015 + index) * .06;
    context.strokeStyle = `rgba(240,211,163,${(.3 + pulse * .35) * lineFade * shimmer})`;
    context.lineWidth = 1.1 + pulse * 1.1;
    context.beginPath();
    context.moveTo(a.x * 760, a.y * 580);
    context.lineTo((a.x + (b.x - a.x) * progress) * 760,
      (a.y + (b.y - a.y) * progress) * 580);
    context.stroke();
  });

  const starFade = 1 - piscesEase(morphAge / 400);
  PISCES_STARS.forEach((star, index) => {
    const appear = piscesEase((elapsed - PISCES_TIMING.stars - index * 90) / 750);
    const pulse = Math.exp(-Math.pow((index / 20 - pulseAge) * 7, 2));
    const twinkle = .82 + Math.sin(now * .0017 + index * 2.4) * .18;
    const alpha = appear * starFade * twinkle;
    const radius = (3.5 - (star.magnitude - 3.6) * .5) * (1 + pulse * .3);
    const x = star.x * 760;
    const y = star.y * 580;
    const halo = context.createRadialGradient(x, y, 0, x, y, radius * 7);
    halo.addColorStop(0, `rgba(248,218,169,${alpha * .35})`);
    halo.addColorStop(1, "rgba(248,218,169,0)");
    context.fillStyle = halo;
    context.fillRect(x - radius * 7, y - radius * 7, radius * 14, radius * 14);
    context.fillStyle = `rgba(255,247,230,${alpha})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    // Small, localized highlights travel with the awakening pulse.
    if (pulse > .25 && index % 3 === 0) {
      context.strokeStyle = `rgba(255,232,187,${pulse * alpha * .7})`;
      context.lineWidth = .8;
      context.beginPath();
      context.moveTo(x - 10, y);
      context.lineTo(x + 10, y);
      context.moveTo(x, y - 10);
      context.lineTo(x, y + 10);
      context.stroke();
    }
  });
  context.restore();
}

/* -------------------------------------------------------
   GALLERY
------------------------------------------------------- */

function buildGallery() {
  const gallery = $("#gallery");
  gallery.replaceChildren();

  if (PHOTOS.length === 0) {
    const card = document.createElement("div");
    card.className = "polaroid empty-photo";

    card.innerHTML = `
      <div class="empty-photo-window" aria-hidden="true">♡</div>
      <p>给我们的照片，留个位置。</p>
    `;

    gallery.append(card);

    $("#gallery-note").textContent =
      "还没有放入照片。将真实照片放进照片文件夹，再填写照片路径和说明。";

    return;
  }

  $("#gallery-note").textContent = "轻点照片可以放大。以后还要拍更多照片～";

  PHOTOS.forEach((photo, index) => {
    const card = document.createElement("button");
    const image = document.createElement("img");
    const caption = document.createElement("p");

    card.type = "button";
    card.className = "polaroid";
    card.dataset.photoIndex = String(index);
    card.style.setProperty("--rotation", `${index % 2 === 0 ? -4 : 4}deg`);
    card.setAttribute("aria-label", `查看照片：${photo.caption}`);

    image.src = photo.src;
    image.alt = photo.caption;
    image.loading = "eager";
    image.decoding = "async";

    caption.textContent = photo.caption;

    image.addEventListener("error", () => {
      const empty = document.createElement("div");
      empty.className = "empty-photo-window";
      empty.textContent = "照片暂未找到";

      image.replaceWith(empty);
      card.disabled = true;
      card.setAttribute("aria-label", "照片暂未找到，请检查照片路径");
    }, { once: true });

    card.append(image, caption);
    card.addEventListener("click", () => openPhoto(index));
    card.addEventListener("focus", () => {
      if (card.matches(":focus-visible")) stopGalleryAnimation();
    });
    gallery.append(card);
  });

  const sparkles = document.createElement("div");
  sparkles.className = "memory-sparkles";
  sparkles.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 8; i++) {
    const star = document.createElement("span");
    star.textContent = "✧";
    sparkles.append(star);
  }
  gallery.append(sparkles);
}

function stopGalleryAnimation() {
  for (const animation of galleryAnimations) {
    animation.onfinish = null;
    animation.oncancel = null;
    animation.cancel();
  }

  galleryAnimations.clear();
  document.querySelectorAll("#gallery .polaroid").forEach((card) => {
    card.classList.remove("photo-waiting", "photo-dropping");
  });
}

function startMemories() {
  stopGalleryAnimation();
  const cards = [...document.querySelectorAll("#gallery button.polaroid")];
  const canAnimate = !reducedMotion && typeof cards[0]?.animate === "function";
  $("#memory-replay").hidden = !canAnimate;
  if (!canAnimate) return;

  cards.forEach((card, index) => dropPhoto(card, index * 850));
}

function dropPhoto(card, delay) {
  card.classList.remove("photo-waiting");
  if (reducedMotion || typeof card.animate !== "function") return;

  const gallery = $("#gallery");
  const index = Number(card.dataset.photoIndex);
  const direction = index % 2 === 0 ? -1 : 1;
  const bounds = card.getBoundingClientRect();
  const fall = -(bounds.top - gallery.getBoundingClientRect().top + bounds.height + 55);
  const drift = Math.min(42, gallery.clientWidth * .065);
  const restingAngle = parseFloat(card.style.getPropertyValue("--rotation")) || direction * 4;
  const pose = (x, y, z, angle, turn = 0) =>
    `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${angle}deg) rotateY(${turn}deg)`;

  card.classList.add("photo-dropping");

  const animation = card.animate([
    { offset: 0, opacity: 0, transform: pose(-direction * drift, fall, -160, direction * 9, -direction * 9) },
    { offset: .16, opacity: .75, transform: pose(direction * drift * .6, fall * .7, -125, -direction * 6, direction * 5) },
    { offset: .4, opacity: 1, transform: pose(-direction * drift * .65, fall * .4, -80, direction * 7, -direction * 4) },
    { offset: .66, opacity: 1, transform: pose(direction * drift * .4, fall * .12, -30, restingAngle - direction * 2, direction * 2) },
    { offset: .87, opacity: 1, transform: pose(-direction * 3, 5, -5, restingAngle + direction * .6) },
    { offset: 1, opacity: 1, transform: pose(0, 0, 0, restingAngle) }
  ], { duration: 7800 + index % 2 * 650, delay, easing: "cubic-bezier(.25,.46,.45,.94)", fill: "both" });

  galleryAnimations.add(animation);

  const settle = () => {
    animation.onfinish = null;
    animation.oncancel = null;
    galleryAnimations.delete(animation);
    card.classList.remove("photo-dropping");
    // Hand transforms back to CSS so hover and focus remain responsive.
    animation.cancel();
  };

  animation.onfinish = settle;
  animation.oncancel = settle;
}

function openPhoto(index) {
  if (!PHOTOS.length) return;
  stopGalleryAnimation();

  currentPhoto = (index + PHOTOS.length) % PHOTOS.length;

  const photo = PHOTOS[currentPhoto];
  const image = $("#large-photo");

  image.hidden = false;
  image.src = photo.src;
  image.alt = photo.caption;

  $("#large-caption").textContent = photo.caption;
  $("#photo-prev").hidden = PHOTOS.length < 2;
  $("#photo-next").hidden = PHOTOS.length < 2;

  if (!$("#photo-dialog").open) {
    $("#photo-dialog").showModal();
  }
}

$("#large-photo").addEventListener("error", () => {
  $("#large-photo").hidden = true;
  $("#large-caption").textContent = "照片暂未找到，请检查照片路径。";
});

$("#photo-close").addEventListener("click", () => $("#photo-dialog").close());
$("#photo-prev").addEventListener("click", () => openPhoto(currentPhoto - 1));
$("#photo-next").addEventListener("click", () => openPhoto(currentPhoto + 1));

$("#photo-dialog").addEventListener("click", (event) => {
  if (event.target === $("#photo-dialog")) $("#photo-dialog").close();
});

document.addEventListener("keydown", (event) => {
  if (!$("#photo-dialog").open) return;

  if (event.key === "ArrowLeft") openPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") openPhoto(currentPhoto + 1);
});

/* -------------------------------------------------------
   CAKE, WISHES, AND FINAL SURPRISE
------------------------------------------------------- */

let microphoneSession = null;

function showBreathDiagnostics(session) {
  const output = $("#microphone-diagnostics");
  const peak = session.diagnosticPeak;
  if (!peak) {
    output.textContent = "正在准备检测，先保持安静约 2 秒。";
    return;
  }
  const reason = !peak.armed ? "尚未完成准备"
    : peak.level <= peak.threshold ? "声音未达到吹气门槛"
    : peak.flatness <= peak.minimumFlatness ? "声音已收到，但未被识别为气流"
    : session.maxSustained < 500 ? "已识别气流，但持续时间不足"
    : "已达到熄灭条件";
  output.textContent = `最近检测：${reason}。峰值 ${peak.level.toFixed(4)} / 门槛 ${peak.threshold.toFixed(4)}；气流 ${peak.flatness.toFixed(4)} / 要求 ${peak.minimumFlatness.toFixed(4)}；最长 ${Math.round(session.maxSustained || 0)} 毫秒 / 需要 500 毫秒。`;
}

function updateBreathNoise(session, level, delta) {
  // A blow during startup can contaminate the original room measurement.
  // Replace that measurement only after a clearly quieter, stable interval;
  // isolated dips between room noises must not lower the detection threshold.
  if (level > .000001 && level < session.noiseFloor * .55) {
    if (!session.quietRecoveryMs ||
        level > session.quietRecoveryPeak * 1.8 + .0002 ||
        level * 1.8 + .0002 < session.quietRecoveryMin) {
      session.quietRecoveryMs = 0;
      session.quietRecoveryPeak = level;
      session.quietRecoveryMin = level;
    }
    session.quietRecoveryMs += delta;
    session.quietRecoveryPeak = Math.max(session.quietRecoveryPeak, level);
    session.quietRecoveryMin = Math.min(session.quietRecoveryMin, level);
    if (session.quietRecoveryMs >= 1200) {
      session.noiseFloor = session.quietRecoveryPeak;
      session.calibratedNoise = session.noiseFloor;
      // A profile measured against the old, contaminated baseline is stale.
      session.learned = null;
      session.calibrationFailed = false;
      session.quietRecoveryMs = 0;
      session.diagnosticPeak = null;
      session.maxSustained = 0;
      $("#cake-instruction").textContent = "已重新测量环境，对着麦克风持续吹一口气吧～";
    }
  } else {
    session.quietRecoveryMs = 0;
  }
  const adjustedNoise = session.noiseFloor + (level - session.noiseFloor) * .006;
  session.noiseFloor = Math.max(session.calibratedNoise * .8, adjustedNoise);
}

function stopBlowDetection() {
  const session = microphoneSession;
  if (!session) return;
  microphoneSession = null;
  cancelAnimationFrame(session.frame);
  session.stream?.getTracks().forEach((track) => track.stop());
  session.source?.disconnect();
  session.filter?.disconnect();
  session.analyser?.disconnect();
  session.silentOutput?.disconnect();
  if (session.context && session.context.state !== "closed") {
    session.context.close().catch(() => {});
  }
  $("#cake-art").style.setProperty("--breath-strength", "0");
  $("#microphone-level").value = 0;
  $("#blow-progress").value = 0;
  $("#blow-feedback").textContent = "检测已停止";
  $("#blow-calibrate").disabled = true;
  $("#blow-calibrate").textContent = "校准我的吹气";
  $("#microphone-input").disabled = false;
  $("#blow").setAttribute("aria-pressed", "false");
  if (currentScene === "cake" && !blowing) {
    $("#blow").disabled = false;
    $("#blow").textContent = "开始吹蜡烛 🎙";
  }
}

async function updateMicrophoneInputs(session) {
  if (microphoneSession !== session) return;
  const track = session.stream.getAudioTracks()[0];
  const activeId = track.getSettings?.().deviceId || session.deviceId || "default";
  let inputs = [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices?.() || [];
    inputs = devices.filter((device) => device.kind === "audioinput" && device.deviceId);
  } catch {
    // The active track still identifies the input if device listing is unavailable.
  }
  if (microphoneSession !== session) return;
  if (!inputs.some((device) => device.deviceId === activeId)) {
    inputs.unshift({ deviceId: activeId, label: track.label || "当前麦克风" });
  }
  const select = $("#microphone-input");
  select.replaceChildren();
  inputs.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.textContent = device.label || `麦克风 ${index + 1}`;
    select.append(option);
  });
  select.value = activeId;
  const activeLabel = track.label || inputs.find((device) => device.deviceId === activeId)?.label || "";
  session.isBuiltIn = /\barray\b|built[ -]?in|内置|阵列/i.test(activeLabel);
  session.inputHint = session.isBuiltIn
    ? inputs.length === 1
      ? "浏览器目前只识别电脑内置麦克风，请对着电脑的收音孔吹气。"
      : "当前使用电脑内置麦克风。请对着电脑收音孔吹气，使用耳麦时请在上方选择耳麦输入。"
    : /headset|headphone|external|earphone|耳机|耳麦|外接|外部/i.test(activeLabel)
      ? "当前使用外接麦克风。有线耳麦请对着线控或麦杆上的收音孔吹气。"
      : "请对准上方所选设备的麦克风孔吹气。";
  $("#microphone-hint").textContent = session.inputHint;
  if (!session.deviceId && session.isBuiltIn) {
    const external = inputs.find((device) =>
      device.deviceId !== "default" && device.deviceId !== "communications" &&
      device.deviceId !== activeId && /headset|external|earphone|耳机|耳麦|外接|外部/i.test(device.label));
    return external?.deviceId || "";
  }
  return "";
}

async function startBlowDetection(deviceId = $("#microphone-input").value || "") {
  if (blowing || currentScene !== "cake" || document.hidden) return;
  if (microphoneSession) {
    stopBlowDetection();
    $("#cake-instruction").textContent = "先许个愿吧，准备好后再点开始～";
    return;
  }

  const button = $("#blow");
  const instruction = $("#cake-instruction");
  const AudioClass = window.AudioContext || window.webkitAudioContext;
  $("#blow-fallback").hidden = false;
  if (window.isSecureContext === false) {
    instruction.textContent = "请通过 HTTPS 或 localhost 打开网页，再开启麦克风。";
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || !AudioClass) {
    instruction.textContent = "这个浏览器暂时无法开启麦克风，可以点一下吹灭蜡烛～";
    return;
  }

  const session = {
    frame: 0, deviceId, noiseFloor: 0, calibration: [],
    sustained: 0, previous: 0, quietMs: 0, lastMeterUpdate: 0,
    armed: false, armingQuiet: 0, hasSignal: false
  };
  showBreathDiagnostics(session);
  microphoneSession = session;
  button.disabled = true;
  $("#microphone-input").disabled = true;
  button.textContent = "正在打开麦克风…";
  instruction.textContent = "请允许使用麦克风，准备一起吹蜡烛～";

  try {
    session.context = new AudioClass();
    await session.context.resume();
    if (microphoneSession !== session) return;

    const audio = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
    if (deviceId) audio.deviceId = { exact: deviceId };
    let stream = await navigator.mediaDevices.getUserMedia({ audio, video: false });
    // Permission can finish after navigation, cancellation, or a manual blow.
    if (microphoneSession !== session) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    session.stream = stream;
    const externalId = await updateMicrophoneInputs(session);
    if (microphoneSession !== session) return;
    if (externalId) {
      instruction.textContent = "正在切换到外接麦克风，请稍等～";
      stream.getTracks().forEach((track) => track.stop());
      session.stream = null;
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { ...audio, deviceId: { exact: externalId } }, video: false
      });
      if (microphoneSession !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      session.stream = stream;
      session.deviceId = externalId;
      await updateMicrophoneInputs(session);
      if (microphoneSession !== session) return;
    }
    session.source = session.context.createMediaStreamSource(stream);
    session.filter = session.context.createBiquadFilter();
    session.filter.type = "highpass";
    session.filter.frequency.value = 50;
    session.analyser = session.context.createAnalyser();
    session.analyser.fftSize = 2048;
    session.analyser.smoothingTimeConstant = .35;
    session.source.connect(session.filter);
    session.filter.connect(session.analyser);
    // Keep the capture graph rendering consistently, with a silent output.
    session.silentOutput = session.context.createGain();
    session.silentOutput.gain.value = 0;
    session.analyser.connect(session.silentOutput);
    session.silentOutput.connect(session.context.destination);

    session.waveform = new Float32Array(session.analyser.fftSize);
    session.spectrum = new Float32Array(session.analyser.frequencyBinCount);
    session.warmingUntil = performance.now() + 400;
    session.calibratingUntil = performance.now() + 1800;
    $("#microphone-controls").hidden = false;
    $("#microphone-input").disabled = false;
    $("#microphone-level").value = 0;
    $("#blow-progress").value = 0;
    $("#blow-feedback").textContent = "正在测量环境声音";
    $("#blow-calibrate").disabled = true;
    button.disabled = false;
    button.textContent = "停止检测";
    button.setAttribute("aria-pressed", "true");
    instruction.textContent = "先保持安静约 2 秒，正在测量环境声音～";

    const disconnected = () => {
      if (microphoneSession !== session) return;
      stopBlowDetection();
      instruction.textContent = "麦克风已暂停，请重新点开始再试一次。";
    };
    stream.getAudioTracks().forEach((track) => track.addEventListener("ended", disconnected));
    session.context.addEventListener("statechange", () => {
      if (session.context.state !== "running") disconnected();
    });
    session.frame = requestAnimationFrame(detectBreath);
  } catch (error) {
    if (microphoneSession !== session) return;
    stopBlowDetection();
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      instruction.textContent = "请允许麦克风权限后再试，也可以点一下吹灭蜡烛～";
    } else if (error.name === "NotFoundError") {
      instruction.textContent = "没有找到麦克风，接上后再试，也可以点一下吹灭蜡烛～";
    } else if (error.name === "OverconstrainedError") {
      instruction.textContent = "这个麦克风暂时不可用，请选择另一个麦克风再试。";
    } else {
      instruction.textContent = "麦克风暂时没能打开，点开始重试或直接点一下吹灭～";
    }
  }
}

function calibrateBreath() {
  const session = microphoneSession;
  if (!session?.armed || session.learning) return;
  session.learning = { until: performance.now() + 3000, samples: [] };
  session.sustained = 0;
  session.gap = 0;
  session.breathThreshold = null;
  session.quietRecoveryMs = 0;
  session.diagnosticPeak = null;
  session.maxSustained = 0;
  session.calibrationFailed = false;
  session.armed = false;
  $("#blow-calibrate").disabled = true;
  $("#blow-calibrate").textContent = "正在校准…";
  $("#cake-instruction").textContent = session.isBuiltIn
    ? "现在使用的是电脑内置麦克风，请对着电脑收音孔持续吹气，正在校准～"
    : "现在对着外接麦克风持续吹一口气，正在适配你的吹气声～";
}

function finishBreathCalibration(session) {
  const samples = session.learning.samples.sort((a, b) => a.level - b.level);
  session.learning = null;
  session.armingQuiet = 0;
  session.awaitingRelease = true;
  $("#blow-calibrate").textContent = "重新校准吹气";
  const peak = samples[Math.floor((samples.length - 1) * .9)]?.level || 0;
  const noise = session.calibratedNoise;
  const contrast = peak - noise;
  if (peak <= noise * 1.35 || contrast < .0002) {
    session.calibrationFailed = true;
    $("#cake-instruction").textContent = `没有检测到明显吹气变化。${session.inputHint}停一下后可以重新校准。`;
    return;
  }
  const airflow = samples.filter((sample) => sample.level > noise + contrast * .4)
    .sort((a, b) => a.flatness - b.flatness);
  session.learned = {
    threshold: noise + contrast * .35,
    minimumFlatness: airflow[Math.floor(airflow.length * .2)].flatness * .2
  };
  $("#cake-instruction").textContent = "校准好了，先停一下，再吹一口气熄灭蜡烛～";
}

function detectBreath(now) {
  const session = microphoneSession;
  if (!session) return;
  if (currentScene !== "cake" || document.hidden || blowing) {
    stopBlowDetection();
    return;
  }

  const analyser = session.analyser;
  analyser.getFloatTimeDomainData(session.waveform);
  let energy = 0;
  for (const sample of session.waveform) energy += sample * sample;
  const level = Math.sqrt(energy / session.waveform.length);
  if (now >= session.warmingUntil && level > .000001) session.hasSignal = true;
  const delta = session.previous ? Math.min(now - session.previous, 50) : 0;
  session.previous = now;
  const updateFeedback = now - session.lastMeterUpdate >= 100;
  if (updateFeedback) {
    $("#microphone-level").value = Math.min(1, Math.sqrt(level) * 3.5);
    session.lastMeterUpdate = now;
  }

  let feedback = "正在测量环境声音";
  if (now < session.calibratingUntil) {
    if (now >= session.warmingUntil) session.calibration.push(level);
  } else {
    if (!session.ready) {
      session.calibration.sort((a, b) => a - b);
      session.noiseFloor = session.calibration[Math.floor(session.calibration.length * .85)] || 0;
      session.calibratedNoise = session.noiseFloor;
      session.ready = true;
    }

    // Wind has a broader noise spectrum than a voiced note. Require a sustained
    // rise above the measured room level so short taps do not blow the candle out.
    analyser.getFloatFrequencyData(session.spectrum);
    const binWidth = session.context.sampleRate / analyser.fftSize;
    // Include the lower-frequency air turbulence picked up by headset microphones.
    const firstBin = Math.max(1, Math.ceil(60 / binWidth));
    const lastBin = Math.min(session.spectrum.length, Math.ceil(1600 / binWidth));
    let powerSum = 0;
    let logPowerSum = 0;
    for (let i = firstBin; i < lastBin; i++) {
      const power = Math.pow(10, Math.max(-100, session.spectrum[i]) / 10);
      powerSum += power;
      logPowerSum += Math.log(power);
    }
    const bins = Math.max(1, lastBin - firstBin);
    const flatness = Math.exp(logPowerSum / bins) / Math.max(powerSum / bins, 1e-10);
    if (session.learning) {
      session.learning.samples.push({ level, flatness });
      $("#cake-art").style.setProperty("--breath-strength", "0");
      if (updateFeedback) {
        $("#blow-progress").value = 0;
        $("#blow-feedback").textContent = "请持续吹气，正在学习你的吹气声";
      }
      if (now >= session.learning.until) finishBreathCalibration(session);
      session.frame = requestAnimationFrame(detectBreath);
      return;
    }
    // Startup gain changes are part of calibration. Wait for a stable room-level
    // window before accepting a fresh, sustained rise in airflow noise.
    if (!session.armed) {
      const quietLimit = session.awaitingRelease
        ? session.learned?.threshold || Math.max(.004, session.calibratedNoise * 1.6)
        : Math.max(.004, session.noiseFloor * 1.6);
      if (session.hasSignal && level <= quietLimit) {
        session.armingQuiet += delta;
      } else {
        session.armingQuiet = 0;
      }
      if (!session.awaitingRelease && level > session.noiseFloor) {
        session.noiseFloor += (level - session.noiseFloor) * .08;
      }
      if (session.armingQuiet >= 250) {
        session.armed = true;
        session.awaitingRelease = false;
        session.calibratedNoise = session.noiseFloor;
        $("#blow-calibrate").disabled = false;
        if (!session.calibrationFailed) {
          $("#cake-instruction").textContent = session.learned
            ? "已适配这支麦克风，现在吹一口气熄灭蜡烛吧～"
            : "准备好了，对着麦克风持续吹一口气吧～";
        }
      }
    }
    const entryThreshold = session.learned?.threshold || Math.max(.004, session.noiseFloor * 3.2);
    const continuing = session.sustained > 0;
    const threshold = continuing
      ? Math.max(session.noiseFloor * 1.6, session.breathThreshold * .6)
      : entryThreshold;
    const minimumFlatness = (session.learned?.minimumFlatness ?? .02) * (continuing ? .35 : 1);
    const isBreath = session.armed && level > threshold && flatness > minimumFlatness;
    if (isBreath) {
      if (!continuing) session.breathThreshold = entryThreshold;
      session.sustained += delta;
      session.gap = 0;
      session.quietRecoveryMs = 0;
    } else {
      session.gap = (session.gap || 0) + delta;
      // Microphones can briefly suppress wind. Count only detected airflow,
      // but preserve its progress through short dropouts on every input type.
      if (session.gap > 120) {
        session.sustained = 0;
        session.breathThreshold = null;
      }
    }
    // Keep only aggregate measurements, never audio. Retain them when the user
    // switches back to chat, since hiding the page releases the microphone.
    if (!session.diagnosticPeak || (session.armed && !session.diagnosticPeak.armed) ||
        (session.armed === session.diagnosticPeak.armed && level > session.diagnosticPeak.level)) {
      session.diagnosticPeak = { level, threshold, flatness, minimumFlatness, armed: session.armed };
    }
    session.maxSustained = Math.max(session.maxSustained || 0, session.sustained);
    if (updateFeedback || session.sustained >= 500) showBreathDiagnostics(session);
    feedback = !session.hasSignal ? "没有收到麦克风声音，请切换输入设备"
      : !session.armed ? "请先保持安静，正在准备检测"
      : isBreath ? "检测到吹气，保持到进度条满格"
      : level > threshold ? "收到声音，若吹不灭可点「校准我的吹气」"
      : "已准备好，请对着麦克风吹气";
    const strength = Math.min(1, Math.max(0, (level - session.noiseFloor) / threshold));
    $("#cake-art").style.setProperty("--breath-strength", String(strength));
    session.quietMs = level < .0006 ? session.quietMs + delta : 0;
    if (session.quietMs >= 3000 && !session.silentHint) {
      session.silentHint = true;
      $("#cake-instruction").textContent = `还没有收到声音。${session.inputHint}`;
    } else if (session.silentHint && level >= .0006) {
      session.silentHint = false;
      $("#cake-instruction").textContent = "收到声音啦，对着麦克风持续吹一口气吧～";
    }

    if (session.sustained >= 500) {
      blowCandles();
      return;
    }
    if (session.armed && !isBreath && !session.sustained && level < threshold) {
      updateBreathNoise(session, level, delta);
    }
  }
  if (updateFeedback) {
    $("#blow-progress").value = Math.min(1, session.sustained / 500);
    if ($("#blow-feedback").textContent !== feedback) $("#blow-feedback").textContent = feedback;
  }
  session.frame = requestAnimationFrame(detectBreath);
}

function resetCake() {
  stopBlowDetection();
  blowing = false;
  $("#cake-art").classList.remove("blowing", "extinguished");
  $("#blow").disabled = false;
  $("#blow").textContent = "开始吹蜡烛 🎙";
  $("#blow").setAttribute("aria-pressed", "false");
  $("#blow-fallback").hidden = true;
  $("#microphone-controls").hidden = true;
  $("#microphone-level").value = 0;
  $("#blow-progress").value = 0;
  $("#blow-feedback").textContent = "等待收音";
  $("#cake-instruction").textContent = "先许个愿，再开启麦克风吹蜡烛吧～";
}

function blowCandles() {
  if (blowing || currentScene !== "cake") return;

  blowing = true;
  stopBlowDetection();
  $("#blow").disabled = true;
  $("#blow-fallback").hidden = true;
  $("#microphone-controls").hidden = true;
  $("#blow").textContent = "愿望正在出发…";
  $("#cake-art").classList.add("blowing");

  later(() => {
    $("#cake-art").classList.remove("blowing");
    $("#cake-art").classList.add("extinguished");
    $("#cake-instruction").textContent = "愿你的愿望，都慢慢实现。";
  }, 650);

  later(() => {
    celebrating = true;
    synchronizedFireworks();
  }, 1600);

  later(() => showScene("wishes"), 6200);
}

function startWishes() {
  const container = $("#wish-text");
  container.replaceChildren();
  $("#wishes-next").hidden = true;

  BIRTHDAY_WISHES.forEach((text, index) => {
    later(() => {
      const paragraph = document.createElement("p");
      paragraph.style.whiteSpace = "pre-line";
      paragraph.textContent = text;
      container.append(paragraph);
    }, index * 2300);
  });

  later(() => {
    $("#wishes-next").hidden = false;
  }, BIRTHDAY_WISHES.length * 2300);
}

function startFinale() {
  $("#final-copy").hidden = true;
  $("#final-number").hidden = false;
  $("#final-number").setAttribute("aria-label", "23岁");

  synchronizedFireworks();
  formText("23", $("#final-number"));

  later(() => {
    $("#final-number").setAttribute("aria-label", "17年的友情");
    formText("17", $("#final-number"));
    launch(width * .5, height * .25, "heart");
  }, 3000);

  later(() => {
    textParticles.length = 0;
    textFormation = null;
    $("#final-number").hidden = true;
    $("#final-copy").hidden = false;
    synchronizedFireworks();
  }, 6500);
}

function openFinalGift() {
  if (currentScene !== "gift" || finalGiftOpening) return;

  finalGiftOpening = true;
  const gift = $("#final-gift");
  gift.disabled = true;
  gift.classList.add("opened");

  const bounds = gift.getBoundingClientRect();
  sparkle(bounds.left + bounds.width / 2, bounds.top + 35, 110);
  later(() => {
    birthdayGifts.opened = true;
    resetGiftRoom();
    $("#gift-room-title").focus({ preventScroll: true });
  }, reducedMotion ? 150 : 850);
}

/* -------------------------------------------------------
   BIRTHDAY GIFT ROOM — three little, browser-local games
------------------------------------------------------- */

const BIRTHDAY_FORTUNES = [
  ["闪闪发光签", "不必成为别人期待的样子。\n23岁的你，自有自己的光。"],
  ["快乐加倍签", "愿普通的一天，\n也有让你笑出声的小事。"],
  ["心想事成签", "心里悄悄期待的事，\n愿它们一步一步向你走来。"],
  ["美食相遇签", "想吃的好吃的，总能吃到。\n下一顿，也要吃得开心。"],
  ["出发大吉签", "愿你想去的地方，\n都慢慢出现在相册里。"],
  ["友情长存签", "17年的故事还很长。\n以后也要一起制造新回忆。"],
  ["小事顺利签", "愿今天的小麻烦变少，\n小幸运多一点，再多一点。"],
  ["好梦常在签", "把烦恼暂时交给夜空。\n愿你今晚睡个甜甜的好觉。"],
  ["勇气满格签", "想尝试的事情，就勇敢一点。\n慢慢来，也是在向前。"],
  ["被爱包围签", "愿你一直被温柔惦记，\n也记得好好照顾自己。"],
  ["惊喜降落签", "愿生活偶尔偷偷准备礼物，\n在你没想到的时候送到。"],
  ["好运同行签", "把这份生日好运装进口袋，\n陪你走进新的一岁。"],
  ["自在生长签", "不用急着交出所有答案。\n照着自己的节奏长大就好。"],
  ["笑容常驻签", "愿你眼里有光，\n嘴角有藏不住的快乐。"],
  ["灵感来信签", "突然冒出来的小想法，\n也许就是新故事的开头。"],
  ["相片满格签", "愿新的一岁，\n拍下很多舍不得删的照片。"],
  ["拥抱自己签", "今天先夸夸自己吧。\n一路走到这里，你辛苦啦。"],
  ["晴天预备签", "阴天也没关系，\n下一束阳光正在路上。"],
  ["好事慢慢签", "有些美好需要一点时间。\n愿等待也能有甜甜的回音。"],
  ["可爱续费签", "23岁，可爱继续营业。\n开心做自己，长期有效。"],
  ["愿望启程签", "今天许下的小愿望，\n愿它在往后的日子慢慢实现。"],
  ["平安喜乐签", "比起什么都做到最好，\n更希望你每天平安、开心。"],
  ["生日上上签", "晓玲，23岁生日快乐。\n愿新的一岁，值得你期待。"]
];

const birthdayGifts = {
  opened: false, active: "fortune", opener: null, returnFocus: true,
  fortuneIndex: -1,
  scratch: { revealed: false, segments: [], cells: new Set(), pointer: null, last: null },
  claw: { x: 200, busy: false, frame: 0, holdDelay: 0, holdRepeat: 0,
    collected: new Set(), toys: [
      { x: 83, y: 235, name: "奶油小熊", caught: false },
      { x: 164, y: 225, name: "星星小兔", caught: false },
      { x: 249, y: 240, name: "薰衣草熊", caught: false },
      { x: 326, y: 224, name: "蜜桃小兔", caught: false }
    ] }
};

function resetGiftRoom() {
  $("#gift-cover").hidden = birthdayGifts.opened;
  $("#birthday-gift-room").hidden = !birthdayGifts.opened;
}

function closeGiftGame(restoreFocus = true) {
  const dialog = $("#birthday-game-dialog");
  if (!dialog.open) return;
  birthdayGifts.returnFocus = restoreFocus;
  stopClawGame();
  dialog.close();
}

function selectGiftGame(name) {
  if (!["fortune", "scratch", "claw"].includes(name)) return;
  stopClawGame();
  birthdayGifts.active = name;
  $("#birthday-game-dialog").scrollTop = 0;
  for (const game of ["fortune", "scratch", "claw"]) {
    const selected = game === name;
    $("#" + game + "-panel").hidden = !selected;
    const tab = $("#" + game + "-tab");
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  if (name === "scratch") drawScratchSurface();
  if (name === "claw") renderClaw();
}

function openGiftGame(name, opener) {
  birthdayGifts.opener = opener;
  birthdayGifts.returnFocus = true;
  const dialog = $("#birthday-game-dialog");
  if (!dialog.open) dialog.showModal();
  selectGiftGame(name);
  $("#" + name + "-tab").focus();
}

function drawBirthdayFortune() {
  // Choose from all 23 wishes without immediately repeating the previous one.
  const previous = birthdayGifts.fortuneIndex;
  let index = Math.floor(Math.random() * (BIRTHDAY_FORTUNES.length - (previous >= 0 ? 1 : 0)));
  if (previous >= 0 && index >= previous) index++;
  birthdayGifts.fortuneIndex = index;
  const [title, message] = BIRTHDAY_FORTUNES[index];
  $("#fortune-number").textContent = `23岁幸运签 · 第${String(index + 1).padStart(2, "0")}签`;
  $("#fortune-title").textContent = title;
  $("#fortune-message").textContent = message;
  $("#draw-fortune").textContent = "再抽一支幸运签 ↺";
  $("#fortune-entry-status").textContent = `已抽到 · ${title}`;
  if (!reducedMotion) $("#fortune-slip").animate?.([
    { opacity: .35, transform: "translateY(12px) rotate(-2deg)" },
    { opacity: 1, transform: "translateY(0) rotate(0)" }
  ], { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" });
}

function drawScratchSurface() {
  const canvas = $("#birthday-scratch");
  const state = birthdayGifts.scratch;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  const coating = ctx.createLinearGradient(0, 0, bounds.width, bounds.height);
  coating.addColorStop(0, "#d8c8df"); coating.addColorStop(.5, "#f0e5e8"); coating.addColorStop(1, "#bcb7d2");
  ctx.fillStyle = coating;
  ctx.fillRect(0, 0, bounds.width, bounds.height);
  ctx.fillStyle = "#ffffff70";
  for (let x = 16; x < bounds.width; x += 31) {
    for (let y = 17; y < bounds.height; y += 31) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#795f83";
  ctx.font = "25px Georgia, serif";
  ctx.fillText("✧", bounds.width / 2, bounds.height / 2 - 24);
  ctx.font = "16px 'Microsoft YaHei', sans-serif";
  ctx.fillText("刮开你的生日小幸运", bounds.width / 2, bounds.height / 2 + 9);
  ctx.font = "10px 'Microsoft YaHei', sans-serif";
  ctx.fillText("按住拖动 · SURPRISE INSIDE", bounds.width / 2, bounds.height / 2 + 37);
  for (const segment of state.segments) eraseScratchSegment(ctx, segment, bounds);
  if (state.revealed) ctx.clearRect(0, 0, bounds.width, bounds.height);
}

function eraseScratchSegment(ctx, segment, bounds) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = Math.min(bounds.width, bounds.height) * .22;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(segment.from.x * bounds.width, segment.from.y * bounds.height);
  ctx.lineTo(segment.to.x * bounds.width, segment.to.y * bounds.height);
  ctx.stroke();
}

function revealBirthdayScratch() {
  const state = birthdayGifts.scratch;
  state.revealed = true;
  state.pointer = null;
  state.last = null;
  $("#scratch-surface").classList.add("is-revealed");
  $("#scratch-prize").setAttribute("aria-hidden", "false");
  $("#scratch-status").textContent = "刮到了！这张快乐加倍券，送给23岁的你 ♡";
  $("#scratch-reveal").disabled = true;
  $("#scratch-reveal").textContent = "惊喜已签收 ♡";
  $("#scratch-entry-status").textContent = "已签收 · 快乐加倍券";
}

function scratchAt(event) {
  const state = birthdayGifts.scratch;
  if (state.revealed || state.pointer !== event.pointerId) return;
  const canvas = $("#birthday-scratch");
  const bounds = canvas.getBoundingClientRect();
  const point = { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
  const segment = { from: state.last || { x: point.x - .0001, y: point.y }, to: point };
  state.segments.push(segment);
  state.last = point;
  eraseScratchSegment(canvas.getContext("2d"), segment, bounds);
  // Measure actual brush coverage on a small grid, including the entire stroke.
  const radius = Math.min(bounds.width, bounds.height) * .11;
  const steps = Math.max(1, Math.ceil(Math.hypot((point.x - segment.from.x) * bounds.width,
    (point.y - segment.from.y) * bounds.height) / (radius * .5)));
  for (let step = 0; step <= steps; step++) {
    const x = segment.from.x + (point.x - segment.from.x) * step / steps;
    const y = segment.from.y + (point.y - segment.from.y) * step / steps;
    for (let row = 0; row < 22; row++) for (let col = 0; col < 40; col++) {
      if (Math.hypot(((col + .5) / 40 - x) * bounds.width,
        ((row + .5) / 22 - y) * bounds.height) <= radius) state.cells.add(row * 40 + col);
    }
  }
  const progress = state.cells.size / 880;
  const percent = Math.floor(progress * 20) * 5;
  if (percent !== state.percent) {
    state.percent = percent;
    $("#scratch-status").textContent = `已刮开 ${percent}%，继续发现惊喜～`;
  }
  if (progress >= .42) revealBirthdayScratch();
}

function resetBirthdayScratch() {
  const state = birthdayGifts.scratch;
  state.revealed = false; state.segments = []; state.cells.clear();
  state.pointer = null; state.last = null; state.percent = 0;
  $("#scratch-surface").classList.remove("is-revealed");
  $("#scratch-prize").setAttribute("aria-hidden", "true");
  $("#scratch-status").textContent = "按住拖动，刮开这份小惊喜。";
  $("#scratch-reveal").disabled = false;
  $("#scratch-reveal").textContent = "直接揭晓惊喜";
  $("#scratch-entry-status").textContent = "刮开惊喜 ↗";
  drawScratchSurface();
}

function renderClaw(x = birthdayGifts.claw.x, y = 42, closed = false, held = -1) {
  $("#claw-grabber").setAttribute("transform", `translate(${x} ${y})`);
  $("#claw-cable").setAttribute("d", `M0 ${18 - y}V0`);
  $("#claw-left-arm").setAttribute("d", closed ? "M-9 10-17 29-5 38" : "M-9 10-24 30-17 40");
  $("#claw-right-arm").setAttribute("d", closed ? "m9 10 8 19-12 9" : "m9 10 15 20-7 10");
  birthdayGifts.claw.toys.forEach((toy, index) => {
    const node = $("#claw-toy-" + index);
    node.style.display = toy.caught ? "none" : "";
    node.setAttribute("transform", index === held ? `translate(${x} ${y + 32})` : `translate(${toy.x} ${toy.y})`);
  });
}

function setClawBusy(busy) {
  birthdayGifts.claw.busy = busy;
  for (const id of ["claw-left", "claw-right", "claw-drop", "claw-refill"]) $("#" + id).disabled = busy;
  $("#claw-drop").textContent = busy ? "小爪子努力中…" : "抓一下 ♡";
}

function stopClawHold() {
  clearTimeout(birthdayGifts.claw.holdDelay);
  clearInterval(birthdayGifts.claw.holdRepeat);
}

function stopClawGame() {
  const state = birthdayGifts.claw;
  stopClawHold();
  cancelAnimationFrame(state.frame);
  state.frame = 0;
  if (state.busy) {
    setClawBusy(false);
    renderClaw();
    $("#claw-status").textContent = "刚才的抓取已暂停，准备好后再试一次吧。";
  }
  birthdayGifts.scratch.pointer = null;
  birthdayGifts.scratch.last = null;
}

function moveBirthdayClaw(direction) {
  const state = birthdayGifts.claw;
  if (state.busy) return;
  state.x = Math.max(42, Math.min(358, state.x + direction * 20));
  renderClaw();
}

function finishClawDrop(target) {
  const state = birthdayGifts.claw;
  state.frame = 0;
  setClawBusy(false);
  if (target >= 0) {
    const toy = state.toys[target];
    toy.caught = true;
    state.collected.add(target);
    $("#claw-status").textContent = `抓到${toy.name}啦！${state.toys.every(item => item.caught) ? "四只可爱全部集齐 ♡" : "它已经加入你的小收藏 ♡"}`;
    $("#claw-collection-items").textContent = [...state.collected].map(index => state.toys[index].name).join(" · ");
    $("#claw-entry-status").textContent = `已收集 · ${state.collected.size}只小可爱`;
    state.x = 58;
  } else {
    const closest = state.toys.filter(toy => !toy.caught).sort((a, b) => Math.abs(a.x - state.x) - Math.abs(b.x - state.x))[0];
    $("#claw-status").textContent = closest ? `差一点点，往${closest.x < state.x ? "左" : "右"}移一些再试。今天不限次数～` : "玩偶都回家啦！可以重新摆满再玩一次。";
  }
  renderClaw();
}

function dropBirthdayClaw() {
  const state = birthdayGifts.claw;
  if (state.busy) return;
  const candidates = state.toys.map((toy, index) => ({ toy, index }))
    .filter(({ toy }) => !toy.caught && Math.abs(toy.x - state.x) <= 30)
    .sort((a, b) => Math.abs(a.toy.x - state.x) - Math.abs(b.toy.x - state.x));
  const target = candidates[0]?.index ?? -1;
  if (state.toys.every(toy => toy.caught)) { finishClawDrop(-1); return; }
  stopClawHold();
  setClawBusy(true);
  $("#claw-status").textContent = "瞄准、下爪，把快乐抓住～";
  if (reducedMotion) { finishClawDrop(target); return; }
  const started = performance.now();
  const origin = state.x;
  const bottom = target >= 0 ? state.toys[target].y - 32 : 202;
  const ease = value => .5 - Math.cos(Math.PI * Math.max(0, Math.min(1, value))) / 2;
  function tick(now) {
    if (!$("#birthday-game-dialog").open || birthdayGifts.active !== "claw" || document.hidden || currentScene !== "gift") { stopClawGame(); return; }
    const elapsed = now - started;
    if (target < 0 && elapsed >= 1750) { finishClawDrop(-1); return; }
    if (elapsed < 700) renderClaw(origin, 42 + (bottom - 42) * ease(elapsed / 700));
    else if (elapsed < 950) renderClaw(origin, bottom, true);
    else if (elapsed < 1750) renderClaw(origin, bottom + (42 - bottom) * ease((elapsed - 950) / 800), true, target);
    else if (elapsed < 2300) renderClaw(target >= 0 ? origin + (58 - origin) * ease((elapsed - 1750) / 550) : origin, 42, true, target);
    else if (elapsed < 2650) renderClaw(target >= 0 ? 58 : origin, 42 + 193 * ease((elapsed - 2300) / 350), false, target);
    else { finishClawDrop(target); return; }
    state.frame = requestAnimationFrame(tick);
  }
  state.frame = requestAnimationFrame(tick);
}

function setupBirthdayGifts() {
  document.querySelectorAll("[data-gift-game]").forEach(button => {
    button.addEventListener("click", () => openGiftGame(button.dataset.giftGame, button));
  });
  const games = ["fortune", "scratch", "claw"];
  games.forEach((game, index) => {
    const tab = $("#" + game + "-tab");
    tab.addEventListener("click", () => selectGiftGame(game));
    tab.addEventListener("keydown", event => {
      const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!offset && !["Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = games[event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + offset + 3) % 3];
      selectGiftGame(next); $("#" + next + "-tab").focus();
    });
  });
  const dialog = $("#birthday-game-dialog");
  $("#gift-game-close").addEventListener("click", () => closeGiftGame());
  dialog.addEventListener("close", () => {
    stopClawGame();
    if (birthdayGifts.returnFocus && currentScene === "gift") birthdayGifts.opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeGiftGame();
  });
  $("#gift-finale").addEventListener("click", () => showScene("finale"));
  $("#draw-fortune").addEventListener("click", drawBirthdayFortune);
  $("#scratch-reveal").addEventListener("click", revealBirthdayScratch);
  $("#scratch-reset").addEventListener("click", resetBirthdayScratch);
  const scratch = $("#birthday-scratch");
  scratch.addEventListener("pointerdown", event => {
    if (birthdayGifts.scratch.revealed || event.button > 0) return;
    event.preventDefault();
    birthdayGifts.scratch.pointer = event.pointerId;
    birthdayGifts.scratch.last = null;
    scratch.setPointerCapture(event.pointerId);
    scratchAt(event);
  });
  scratch.addEventListener("pointermove", scratchAt);
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) scratch.addEventListener(type, event => {
    if (birthdayGifts.scratch.pointer !== event.pointerId) return;
    birthdayGifts.scratch.pointer = null; birthdayGifts.scratch.last = null;
  });
  for (const [id, direction] of [["claw-left", -1], ["claw-right", 1]]) {
    const button = $("#" + id);
    let repeated = false;
    button.addEventListener("click", event => { if (!repeated || event.detail === 0) moveBirthdayClaw(direction); });
    button.addEventListener("pointerdown", event => {
      if (button.disabled || event.button > 0) return;
      stopClawHold(); repeated = false;
      button.setPointerCapture(event.pointerId);
      birthdayGifts.claw.holdDelay = setTimeout(() => {
        repeated = true; moveBirthdayClaw(direction);
        birthdayGifts.claw.holdRepeat = setInterval(() => moveBirthdayClaw(direction), 70);
      }, 250);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(type, stopClawHold);
  }
  $("#claw-drop").addEventListener("click", dropBirthdayClaw);
  $("#claw-arena").addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); moveBirthdayClaw(event.key === "ArrowLeft" ? -1 : 1); }
    if (event.key === " " || event.key === "Enter") { event.preventDefault(); dropBirthdayClaw(); }
  });
  $("#claw-refill").addEventListener("click", () => {
    if (birthdayGifts.claw.busy) return;
    birthdayGifts.claw.toys.forEach(toy => { toy.caught = false; });
    birthdayGifts.claw.x = 200;
    renderClaw(); $("#claw-status").textContent = "又摆满啦！喜欢的可爱，可以再抓一次。";
  });
  window.addEventListener("resize", () => {
    if (dialog.open && birthdayGifts.active === "scratch") drawScratchSurface();
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopClawGame(); });
  window.addEventListener("pagehide", stopClawGame);
}

/* -------------------------------------------------------
   STARRY BACKGROUND
------------------------------------------------------- */

function buildStars() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 90; i++) {
    const star = document.createElement("span");
    star.className = `star${i % 7 === 0 ? " bright" : ""}`;

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    star.style.setProperty("--size", `${Math.random() * 1.7 + .7}px`);
    star.style.setProperty("--duration", `${Math.random() * 4 + 3}s`);
    star.style.setProperty("--delay", `${Math.random() * -8}s`);

    fragment.append(star);
  }

  $("#stars").append(fragment);
}

/* -------------------------------------------------------
   CANVAS FIREWORKS
   Rockets have explicit trails. Particle arrays are capped.
------------------------------------------------------- */

const canvas = $("#fireworks");
const context = canvas.getContext("2d");
const atmosphereCanvas = $("#atmosphere");
const atmosphereContext = atmosphereCanvas.getContext("2d");
const world = $("#world");
const ambientPalette = {
  firefly: "247,194,211",
  petal: "229,151,188",
  text: "250,218,154",
  blend: "lighter"
};

const palette = [
  "255,194,112",
  "255,151,188",
  "173,148,247",
  "222,183,255",
  "255,244,221"
];

const rockets = [];
const particles = [];
const textParticles = [];
const burstGlows = [];
const fireflies = [];
const petals = [];
const pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
let shootingStar = null;
let nextShootingStar = 8000;

let width = innerWidth;
let height = innerHeight;
let pixelRatio = 1;
let frameId = 0;
let previousTime = 0;
let nextAutomaticLaunch = 0;
let textFormation = null;

const random = (min, max) => min + Math.random() * (max - min);

function resizeCanvas() {
  width = innerWidth;
  height = innerHeight;
  pixelRatio = Math.min(devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  atmosphereCanvas.width = canvas.width;
  atmosphereCanvas.height = canvas.height;
  atmosphereContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  seedAtmosphere();

  if (textFormation && textFormation.mode !== "pisces") {
    formText(textFormation.text, textFormation.element);
  }
}

function particleLimit() {
  if (reducedMotion) return 180;
  return width < 600 ? 850 : 1500;
}

function addParticle(particle) {
  if (particles.length >= particleLimit()) {
    particles.splice(0, 1);
  }

  particles.push(particle);
}

function launch(targetX, targetY, pattern, options = {}) {
  if (rockets.length >= (reducedMotion ? 2 : 9)) return;

  const x = targetX + random(-width * .12, width * .12);
  const y = height + 12;
  const duration = reducedMotion ? 28 : random(42, 61);

  rockets.push({
    x,
    y,
    vx: (targetX - x) / duration,
    vy: (targetY - y) / duration,
    remaining: duration,
    targetX,
    targetY,
    color: options.color || palette[Math.floor(Math.random() * palette.length)],
    scale: options.scale ?? 1,
    pattern: pattern || ["circle", "cascade", "heart"][Math.floor(Math.random() * 3)],
    trail: []
  });
}

function explode(x, y, pattern, color, scale = 1) {
  const count = Math.round((reducedMotion ? 35 : width < 600 ? 120 : 220) * scale);

  if (!reducedMotion) {
    if (burstGlows.length >= 7) burstGlows.shift();
    burstGlows.push({ x, y, color, life: 30, scale });
  }

  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2;

    let vx;
    let vy;

    if (pattern === "heart") {
      const heartScale = random(.285, .32);
      vx = 16 * Math.pow(Math.sin(angle), 3) * heartScale;

      vy = -(
        13 * Math.cos(angle)
        - 5 * Math.cos(2 * angle)
        - 2 * Math.cos(3 * angle)
        - Math.cos(4 * angle)
      ) * heartScale;
    } else {
      const speed = random(1, pattern === "cascade" ? 4 : 6);
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;

      if (pattern === "cascade") vy = vy * .6 - 1.6;
    }

    const life = random(55, pattern === "cascade" ? 125 : 95);

    addParticle({
      x,
      y,
      vx: vx * scale,
      vy: vy * scale,
      life,
      maxLife: life,
      size: random(.8, 1.7),
      gravity: pattern === "cascade" ? .045 : .035,
      drag: .988,
      color: i % 9 === 0 ? "255,245,225" : color
    });
  }
}

function sparkle(x, y, count = 35) {
  const total = reducedMotion ? Math.min(count, 18) : count;

  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = random(.3, 2.7);
    const life = random(35, 70);

    addParticle({
      x: x + random(-30, 30),
      y: y + random(-15, 15),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - .7,
      life,
      maxLife: life,
      size: random(.7, 1.8),
      gravity: .012,
      drag: .99,
      color: ambientPalette.firefly
    });
  }
}

function synchronizedFireworks() {
  const waves = reducedMotion ? 2 : 5;

  for (let wave = 0; wave < waves; wave++) {
    later(() => {
      const targetY = height * random(.18, .36);

      launch(width * .22, targetY, wave % 2 ? "cascade" : "circle");
      launch(width * .78, targetY, wave % 2 ? "cascade" : "circle");

      if (!reducedMotion || wave === 0) {
        launch(width * .5, height * .24, "heart");
      }
    }, wave * 650);
  }
}

/* Sample text into particles without requiring image assets. */
function formText(text, element, origins = null) {
  const fromPisces = origins !== null;
  const continuingPisces = fromPisces && textFormation?.mode === "pisces";
  textFormation = {
    text, element,
    mode: fromPisces ? "pisces" : "text",
    startedAt: fromPisces ? (text === "17" ? PISCES_TIMING.morph : PISCES_TIMING.greeting) : 0
  };

  const bounds = element.getBoundingClientRect();
  const sample = document.createElement("canvas");
  const sampleContext = sample.getContext("2d");

  sample.width = fromPisces ? 760 : 600;
  sample.height = fromPisces ? 580 : 260;

  sampleContext.fillStyle = "#fff";
  sampleContext.textAlign = "center";
  sampleContext.textBaseline = "middle";
  sampleContext.font = fromPisces ? "bold 420px Georgia, serif" : "bold 215px Georgia, serif";
  sampleContext.fillText(text, sample.width / 2, fromPisces ? 310 : 140);

  const pixels = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
  const targets = [];
  const step = fromPisces ? (width < 600 ? 12 : 9) : (width < 600 ? 9 : 7);
  const scale = fromPisces ? 1 : Math.min(bounds.width / 600, bounds.height / 260, 1);

  for (let y = 0; y < sample.height; y += step) {
    for (let x = 0; x < sample.width; x += step) {
      if (pixels[(y * sample.width + x) * 4 + 3] < 120) continue;

      targets.push({
        x: fromPisces ? x : bounds.width / 2 + (x - 300) * scale,
        y: fromPisces ? y : bounds.height / 2 + (y - 130) * scale
      });
    }
  }

  const oldParticles = textParticles.slice();
  textParticles.length = 0;

  if (fromPisces) {
    // Mix target order so every region of both digits gathers gradually.
    for (let i = targets.length - 1; i > 0; i--) {
      const other = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[other]] = [targets[other], targets[i]];
    }
  }

  const maximum = fromPisces ? (width < 600 ? 420 : 700)
    : reducedMotion ? 220 : width < 600 ? 430 : 750;
  const spacing = Math.max(1, Math.ceil(targets.length / maximum));
  const particleCount = continuingPisces ? oldParticles.length : Math.ceil(targets.length / spacing);

  for (let i = 0; i < particleCount; i++) {
    const target = targets[continuingPisces ? Math.floor(i * targets.length / particleCount) : i * spacing];
    const old = oldParticles[textParticles.length];

    if (fromPisces) {
      const index = textParticles.length;
      const star = origins[index % origins.length];
      const x = star.x * 760;
      const y = star.y * 580;
      const angle = Math.atan2(y - 290, x - 380) + random(-.7, .7);
      const distance = continuingPisces ? random(35, 80) : random(95, 185);
      const colors = ["250,218,165", "255,229,185", "255,246,226", "244,193,211", "205,190,242"];
      textParticles.push({
        x, y,
        startX: x, startY: y,
        controlX: x + Math.cos(angle) * distance,
        controlY: y + Math.sin(angle) * distance,
        gatherX: 380 + (target.x - 380) * .25 + random(-100, 100),
        gatherY: 290 + (target.y - 290) * .25 + random(-100, 100),
        targetX: target.x, targetY: target.y,
        delay: index < origins.length ? 0 : random(0, 650),
        duration: random(2800, 3400),
        size: continuingPisces ? old.size : random(1.9, 3.1),
        phase: continuingPisces ? old.phase : random(0, Math.PI * 2),
        color: continuingPisces ? old.color
          : index % 9 < 5 ? colors[index % 3] : colors[index % colors.length],
        retained: continuingPisces
      });
      continue;
    }

    textParticles.push({
      x: reducedMotion ? target.x : old ? old.x : random(-bounds.left, width - bounds.left),
      y: reducedMotion ? target.y : old ? old.y : random(-bounds.top, height - bounds.top),
      targetX: target.x,
      targetY: target.y,
      size: random(.8, 1.6),
      phase: random(0, Math.PI * 2)
    });
  }

  element.classList.toggle("has-particles", textParticles.length > 0);
  if (fromPisces && textParticles.length > 0) {
    textFormation.bounds = {
      left: Math.min(...textParticles.map((particle) => particle.targetX)) - 18,
      top: Math.min(...textParticles.map((particle) => particle.targetY)) - 18,
      right: Math.max(...textParticles.map((particle) => particle.targetX)) + 18,
      bottom: Math.max(...textParticles.map((particle) => particle.targetY)) + 18
    };
  }
}

function piscesParticlePosition(particle, elapsed) {
  const t = reducedMotion ? 1 : piscesEase((elapsed - particle.delay) / particle.duration);
  const remaining = 1 - t;
  return {
    x: remaining ** 3 * particle.startX + 3 * remaining ** 2 * t * particle.controlX
      + 3 * remaining * t ** 2 * particle.gatherX + t ** 3 * particle.targetX,
    y: remaining ** 3 * particle.startY + 3 * remaining ** 2 * t * particle.controlY
      + 3 * remaining * t ** 2 * particle.gatherY + t ** 3 * particle.targetY
  };
}

function drawPiscesNumber(now) {
  const bounds = textFormation.element.getBoundingClientRect();
  const view = piscesViewport(bounds);
  const elapsed = piscesSequence.elapsed - textFormation.startedAt;
  const time = reducedMotion ? 0 : now;
  const breath = .95 + Math.sin(time * .0012) * .05;
  context.save();
  context.translate(view.left, view.top);
  context.scale(view.scale, view.scale);

  textParticles.forEach((particle, index) => {
    const position = piscesParticlePosition(particle, elapsed);
    const appear = reducedMotion || particle.retained ? 1 : piscesEase((elapsed - particle.delay) / 450);
    const shimmer = .83 + Math.sin(time * .002 + particle.phase) * .17;
    const alpha = appear * shimmer * breath;
    const radius = particle.size * breath;
    particle.x = position.x;
    particle.y = position.y;
    context.fillStyle = `rgba(${particle.color},${alpha * .08})`;
    context.beginPath();
    context.arc(particle.x, particle.y, radius * 3.8, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = `rgba(${particle.color},${alpha})`;
    context.beginPath();
    context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    context.fill();

    if (!reducedMotion && index % 31 === 0) {
      const sparkle = Math.max(0, Math.sin(time * .003 + particle.phase) - .85) / .15;
      context.strokeStyle = `rgba(255,248,226,${alpha * sparkle * .65})`;
      context.lineWidth = .8;
      context.beginPath();
      context.moveTo(particle.x - 8, particle.y);
      context.lineTo(particle.x + 8, particle.y);
      context.moveTo(particle.x, particle.y - 8);
      context.lineTo(particle.x, particle.y + 8);
      context.stroke();
    }
  });
  context.restore();
}

function drawRocket(rocket, dt) {
  rocket.trail.push({ x: rocket.x, y: rocket.y });
  if (rocket.trail.length > 11) rocket.trail.shift();

  rocket.x += rocket.vx * dt;
  rocket.y += rocket.vy * dt;
  rocket.remaining -= dt;

  const trail = rocket.trail;

  if (trail.length > 1) {
    context.beginPath();
    context.moveTo(trail[0].x, trail[0].y);

    for (const point of trail) context.lineTo(point.x, point.y);

    context.strokeStyle = `rgba(${rocket.color},.5)`;
    context.lineWidth = 1.4;
    context.stroke();
  }

  context.fillStyle = "#fff1c7";
  context.beginPath();
  context.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
  context.fill();
}

function animate(now) {
  const deltaMs = previousTime ? Math.max(0, now - previousTime) : 0;
  const dt = previousTime ? Math.min((now - previousTime) / 16.67, 2) : 1;
  previousTime = now;

  drawAtmosphere(now, dt);

  context.clearRect(0, 0, width, height);
  drawPisces(now, deltaMs);

  const automatic =
    currentScene === "birthday"
    || currentScene === "finale"
    || celebrating;

  if (automatic && now >= nextAutomaticLaunch) {
    launch(
      random(width * .12, width * .88),
      random(height * .16, height * .48)
    );

    nextAutomaticLaunch = now + (reducedMotion ? 2300 : random(600, 1000));
  }

  context.globalCompositeOperation = ambientPalette.blend;
  context.save();
  // Leave a quiet space around the actual sampled digits during this celebration.
  if (piscesSequence?.elapsed >= PISCES_TIMING.formed && textParticles.length > 0) {
    const view = piscesViewport($("#friend-number").getBoundingClientRect());
    const { left, top, right, bottom } = textFormation.bounds;
    context.beginPath();
    context.rect(0, 0, width, height);
    context.rect(view.left + left * view.scale, view.top + top * view.scale,
      (right - left) * view.scale, (bottom - top) * view.scale);
    context.clip("evenodd");
  }

  for (let i = burstGlows.length - 1; i >= 0; i--) {
    const glow = burstGlows[i];
    glow.life -= dt;

    if (glow.life <= 0) {
      burstGlows.splice(i, 1);
      continue;
    }

    const radius = ((1 - glow.life / 30) * 95 + 45) * glow.scale;
    const gradient = context.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, radius);
    gradient.addColorStop(0, `rgba(${glow.color},${glow.life / 30 * .12})`);
    gradient.addColorStop(1, `rgba(${glow.color},0)`);
    context.fillStyle = gradient;
    context.fillRect(glow.x - radius, glow.y - radius, radius * 2, radius * 2);
  }

  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i];
    drawRocket(rocket, dt);

    if (rocket.remaining <= 0) {
      explode(
        rocket.targetX,
        rocket.targetY,
        rocket.pattern,
        rocket.color,
        rocket.scale
      );

      rockets.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    const oldX = particle.x;
    const oldY = particle.y;

    particle.vx *= Math.pow(particle.drag, dt);
    particle.vy *= Math.pow(particle.drag, dt);
    particle.vy += particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;

    if (particle.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = Math.pow(particle.life / particle.maxLife, 1.3);
    const shimmer = .75 + Math.sin(now * .013 + i) * .25;

    context.strokeStyle = `rgba(${particle.color},${alpha * shimmer})`;
    context.lineWidth = particle.size;
    context.beginPath();
    context.moveTo(oldX, oldY);
    context.lineTo(particle.x, particle.y);
    context.stroke();

    context.fillStyle = `rgba(${particle.color},${alpha})`;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size * .6, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();

  if (textFormation?.mode === "pisces" && piscesSequence) {
    drawPiscesNumber(now);
  } else if (textFormation && textParticles.length > 0) {
    // Keep text in its element's local coordinates. Read its current position
    // each frame so scrolling and entrance animations cannot detach the number.
    const bounds = textFormation.element.getBoundingClientRect();
    context.save();
    context.translate(bounds.left, bounds.top);

    for (const particle of textParticles) {
      const easing = reducedMotion ? 1 : 1 - Math.pow(.92, dt);

      particle.x += (particle.targetX - particle.x) * easing;
      particle.y += (particle.targetY - particle.y) * easing;

      const alpha = reducedMotion
        ? .9
        : .65 + Math.sin(now * .002 + particle.phase) * .3;

      context.fillStyle = `rgba(${ambientPalette.text},${alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  context.globalCompositeOperation = "source-over";
  frameId = requestAnimationFrame(animate);
}

/* -------------------------------------------------------
   AMBIENT GARDEN: fireflies, silk-like petals and shooting stars.
   Shares the fireworks animation clock and visibility cleanup.
------------------------------------------------------- */

function seedAtmosphere() {
  fireflies.length = 0;
  petals.length = 0;

  const compact = width < 760;

  for (let i = 0; i < (compact ? 24 : 44); i++) {
    fireflies.push({
      x: random(0, width), y: random(0, height),
      radius: random(.6, 1.7), phase: random(0, Math.PI * 2),
      drift: random(.2, .8), speed: random(.08, .2)
    });
  }

  for (let i = 0; i < (compact ? 8 : 15); i++) {
    petals.push({
      x: random(-30, width + 30), y: random(-30, height),
      size: random(3, compact ? 6 : 8), rotation: random(0, Math.PI * 2),
      speed: random(.12, .35), phase: random(0, Math.PI * 2),
      alpha: random(.15, .36)
    });
  }
}

function drawAtmosphere(now, dt) {
  const ctx = atmosphereContext;
  ctx.clearRect(0, 0, width, height);

  const calm = currentScene === "wishes";
  const memories = currentScene === "memories";
  const time = reducedMotion ? 0 : now;

  ctx.globalAlpha = calm ? .35 : memories ? .65 : 1;

  const visibleFireflies = memories ? Math.min(fireflies.length, width < 760 ? 8 : 14) : fireflies.length;
  for (let i = 0; i < visibleFireflies; i++) {
    const fly = fireflies[i];
    if (!reducedMotion) {
      fly.y -= fly.speed * dt;
      if (fly.y < -10) fly.y = height + 10;
    }

    const x = fly.x + Math.sin(time * .0003 + fly.phase) * 15 * fly.drift;
    const alpha = .2 + (Math.sin(time * .001 + fly.phase) + 1) * .2;
    ctx.fillStyle = `rgba(${ambientPalette.firefly},${alpha * .1})`;
    ctx.beginPath();
    ctx.arc(x, fly.y, fly.radius * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${ambientPalette.firefly},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, fly.y, fly.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!calm && !reducedMotion && !["birthday", "finale", "countdown", "friendship", "memories"].includes(currentScene)) {
    for (const petal of petals) {
      petal.y += petal.speed * dt;
      petal.x += Math.sin(now * .0003 + petal.phase) * .12 * dt;
      petal.rotation += .002 * dt;

      if (petal.y > height + 20) {
        petal.y = -20;
        petal.x = random(0, width);
      }

      const flutter = Math.cos(now * .0007 + petal.phase);
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.scale(1, .35 + Math.abs(flutter) * .65);
      ctx.fillStyle = `rgba(${ambientPalette.petal},${petal.alpha})`;
      const s = petal.size;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.bezierCurveTo(-s, -s, s * .7, -s * .8, s, 0);
      ctx.bezierCurveTo(s * .3, s * .8, -s * .5, s, -s, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  if (!reducedMotion && !calm && !memories && now > nextShootingStar && !shootingStar) {
    shootingStar = { x: random(width * .1, width * .75), y: random(40, height * .28), life: 55 };
    nextShootingStar = now + random(13000, 21000);
  }

  if (shootingStar) {
    const star = shootingStar;
    star.life -= dt;

    if (star.life <= 0 || reducedMotion) {
      shootingStar = null;
    } else if (!calm && !memories) {
      star.x += 4 * dt;
      star.y += 1.5 * dt;
      const fade = Math.sin(star.life / 55 * Math.PI) * .55;
      const trail = ctx.createLinearGradient(star.x - 100, star.y - 38, star.x, star.y);
      trail.addColorStop(0, `rgba(${ambientPalette.firefly},0)`);
      trail.addColorStop(1, `rgba(${ambientPalette.firefly},${fade})`);
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(star.x - 100, star.y - 38);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;

  if (!reducedMotion) {
    const dx = pointer.x - pointer.smoothX;
    const dy = pointer.y - pointer.smoothY;

    if (Math.abs(dx) > .015 || Math.abs(dy) > .015) {
      pointer.smoothX += dx * .05;
      pointer.smoothY += dy * .05;
      world.style.setProperty("--pointer-x", `${pointer.smoothX.toFixed(2)}px`);
      world.style.setProperty("--pointer-y", `${pointer.smoothY.toFixed(2)}px`);
    }
  }
}

/* -------------------------------------------------------
   OPTIONAL ORIGINAL MUSIC
   A quiet, procedural pentatonic instrumental.
   Audio is created only after pressing the music button.
------------------------------------------------------- */

let audioContext;
let masterGain;
let musicInterval;
let musicEnabled = false;
let melodyStep = 0;

const melody = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 659.25, 880.00, 783.99,
  659.25, 587.33, 523.25, 440.00,
  523.25, 587.33, 659.25, 523.25
];

function playTone(frequency, time, duration, volume) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + .04);
  gain.gain.exponentialRampToValueAtTime(.0001, time + duration);

  oscillator.connect(gain);
  gain.connect(masterGain);

  oscillator.start(time);
  oscillator.stop(time + duration + .05);

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}

function musicTick() {
  if (!audioContext || audioContext.state !== "running") return;

  const time = audioContext.currentTime + .02;
  const note = melody[melodyStep % melody.length];

  playTone(note, time, 1.8, .4);

  if (melodyStep % 4 === 0) {
    playTone(130.81, time, 3.5, .22);
    playTone(196, time, 3.5, .12);
  }

  melodyStep++;
}

function stopMusicClock() {
  clearInterval(musicInterval);
  musicInterval = undefined;
}

function startMusicClock() {
  stopMusicClock();
  musicTick();
  musicInterval = setInterval(musicTick, 650);
}

async function toggleMusic() {
  const button = $("#music");

  button.disabled = true;

  try {
    if (!audioContext) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioClass) {
        announce("这个浏览器暂时无法播放音乐，但惊喜照常继续 ♡");
        return;
      }

      audioContext = new AudioClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = .065;
      masterGain.connect(audioContext.destination);
    }

    if (musicEnabled) {
      musicEnabled = false;
      stopMusicClock();
      await audioContext.suspend();
    } else {
      await audioContext.resume();
      musicEnabled = true;
      startMusicClock();
    }

    button.setAttribute("aria-pressed", String(musicEnabled));
    $("#music-label").textContent = musicEnabled ? "音乐：开" : "音乐：关";
  } catch {
    musicEnabled = false;
    stopMusicClock();
    button.setAttribute("aria-pressed", "false");
    $("#music-label").textContent = "音乐：关";
    announce("音乐暂时没能播放，点一下可以再试试。");
  } finally {
    button.disabled = false;
  }
}

/* -------------------------------------------------------
   EVENTS AND CLEANUP
------------------------------------------------------- */

$("#open").addEventListener("click", openInvitation);
$("#envelope").addEventListener("click", openInvitation);
$("#music").addEventListener("click", toggleMusic);
$("#skip").addEventListener("click", nextScene);
$("#previous").addEventListener("click", previousScene);

$("#gallery-next").addEventListener("click", () => showScene("cake"));
$("#memory-replay").addEventListener("click", () => {
  if (currentScene === "memories") startMemories();
});
$("#blow").addEventListener("click", () => startBlowDetection());
$("#blow-fallback").addEventListener("click", blowCandles);
$("#blow-calibrate").addEventListener("click", calibrateBreath);
$("#microphone-input").addEventListener("change", () => {
  const deviceId = $("#microphone-input").value;
  stopBlowDetection();
  void startBlowDetection(deviceId);
});
navigator.mediaDevices?.addEventListener?.("devicechange", () => {
  if (microphoneSession?.stream) void updateMicrophoneInputs(microphoneSession);
});
$("#wishes-next").addEventListener("click", () => showScene("gift"));
$("#final-gift").addEventListener("click", openFinalGift);

$("#replay").addEventListener("click", () => showScene("invitation"));
$("#more-fireworks").addEventListener("click", synchronizedFireworks);

$("#home").addEventListener("click", (event) => {
  event.preventDefault();
  showScene("invitation");
});

$("#constellation").addEventListener("click", () => {
  announce("认识17年啦～");

  const bounds = $("#constellation").getBoundingClientRect();

  sparkle(
    bounds.left + bounds.width / 2,
    bounds.top + bounds.height / 2,
    60
  );
});

document.querySelectorAll("[data-message]").forEach((button) => {
  button.addEventListener("click", () => {
    announce(button.dataset.message);

    const bounds = button.getBoundingClientRect();

    sparkle(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
      25
    );
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!["birthday", "finale"].includes(currentScene) && !celebrating) return;

  if (event.target.closest("button, a, dialog, header, footer")) return;

  launch(
    Math.max(25, Math.min(width - 25, event.clientX)),
    Math.max(70, Math.min(height * .78, event.clientY))
  );
});

let resizeFrame;

document.addEventListener("pointermove", (event) => {
  if (reducedMotion || event.pointerType !== "mouse") return;
  pointer.x = (event.clientX / width - .5) * 22;
  pointer.y = (event.clientY / height - .5) * 16;
}, { passive: true });

$("#envelope").addEventListener("pointermove", (event) => {
  if (reducedMotion || opening || event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--tilt-x", `${-(event.clientY - bounds.top - bounds.height / 2) / 16}deg`);
  event.currentTarget.style.setProperty("--tilt-y", `${(event.clientX - bounds.left - bounds.width / 2) / 18}deg`);
});

$("#envelope").addEventListener("pointerleave", (event) => {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
});

window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeCanvas();
    if (currentScene === "memories") stopGalleryAnimation();
  });
});

motionQuery.addEventListener("change", (event) => {
  reducedMotion = event.matches;
  particles.length = 0;
  burstGlows.length = 0;

  if (currentScene === "memories") startMemories();

  if (piscesSequence && reducedMotion) {
    const settledAt = piscesSequence.elapsed >= PISCES_TIMING.greeting
      ? PISCES_TIMING.formed : PISCES_TIMING.friendshipFormed;
    piscesSequence.elapsed = Math.max(piscesSequence.elapsed, settledAt);
  }

  if (textFormation && textFormation.mode !== "pisces") {
    formText(textFormation.text, textFormation.element);
  }
});

/*
  Pause scene timers while the tab is hidden, preserving the story
  instead of allowing it to finish in the background.
*/
let hiddenAt = 0;
const nativeLater = later;
const pausedCallbacks = new Map();

/* Replace the scheduler with one that records due times. */
later = function (callback, delay) {
  const due = performance.now() + delay;

  const id = setTimeout(() => {
    sceneTimers.delete(id);
    pausedCallbacks.delete(id);
    callback();
  }, delay);

  sceneTimers.add(id);
  pausedCallbacks.set(id, { callback, due });

  return id;
};

const originalClearSceneTimers = clearSceneTimers;

clearSceneTimers = function () {
  originalClearSceneTimers();
  pausedCallbacks.clear();
};

document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    hiddenAt = performance.now();
    if (microphoneSession) {
      stopBlowDetection();
      $("#cake-instruction").textContent = "吹气检测已暂停，准备好后再点开始～";
    }

    cancelAnimationFrame(frameId);
    for (const animation of galleryAnimations) animation.pause();

    for (const id of sceneTimers) clearTimeout(id);

    if (audioContext && musicEnabled) {
      stopMusicClock();
      await audioContext.suspend().catch(() => {});
    }

    return;
  }

  previousTime = 0;
  frameId = requestAnimationFrame(animate);
  for (const animation of galleryAnimations) animation.play();

  const pending = [...pausedCallbacks.values()];

  sceneTimers.clear();
  pausedCallbacks.clear();

  pending.forEach(({ callback, due }) => {
    later(callback, Math.max(0, due - hiddenAt));
  });

  if (audioContext && musicEnabled) {
    await audioContext.resume().catch(() => {});

    if (!document.hidden && audioContext.state === "running") {
      startMusicClock();
    }
  }
});

window.addEventListener("pagehide", () => {
  cancelAnimationFrame(frameId);
  cancelAnimationFrame(resizeFrame);
  clearSceneTimers();
  stopGalleryAnimation();
  stopFriendship();
  stopBlowDetection();
  clearTimeout(toastTimer);
  stopMusicClock();

  if (audioContext) audioContext.suspend().catch(() => {});
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;

  previousTime = 0;
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(animate);
  showScene(currentScene);
});

/* Start the experience. Music remains off. */
setupBirthdayGifts();
buildStars();
buildGallery();
resizeCanvas();
showScene("invitation");
frameId = requestAnimationFrame(animate);
