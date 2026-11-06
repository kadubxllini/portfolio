const menuTabs = [...document.querySelectorAll('.menu-tab')];
const menu = document.querySelector('.menu-inner');
const sections = menuTabs.map(tab => document.querySelector(tab.getAttribute('href')));
let selectedId = '';
let navigationTarget = null;
let settleTimer;
let scrollFrame = 0;

function positionIndicator() {
  const active = menu.querySelector('.active');
  if (!active) return;
  menu.style.setProperty('--indicator-x', `${active.offsetLeft}px`);
  menu.style.setProperty('--indicator-width', `${active.offsetWidth}px`);
}
function selectSection(id) {
  if (selectedId === id) return;
  selectedId = id;
  menuTabs.forEach(tab => {
    const selected = tab.hash === `#${id}`;
    tab.classList.toggle('active', selected);
    if (selected) tab.setAttribute('aria-current', 'location');
    else tab.removeAttribute('aria-current');
  });
  positionIndicator();
}
function syncSection() {
  if (navigationTarget) return;
  const offset = document.querySelector('header').getBoundingClientRect().bottom + 60;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= offset) current = section;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
  selectSection(current.id);
}
menuTabs.forEach(tab => tab.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigationTarget = tab.hash.slice(1);
  selectSection(navigationTarget);
  history.replaceState(null, '', tab.hash);
  document.getElementById(navigationTarget).scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => { navigationTarget = null; syncSection(); }, 180);
}));
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; syncSection(); });
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => { navigationTarget = null; syncSection(); }, 180);
}, {passive: true});
for (const event of ['wheel', 'touchstart']) window.addEventListener(event, () => { navigationTarget = null; }, {passive: true});
window.addEventListener('keydown', event => { if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) navigationTarget = null; });
new ResizeObserver(positionIndicator).observe(menu);
selectSection('inicio');
syncSection();
document.fonts.ready.then(() => { positionIndicator(); requestAnimationFrame(() => menu.classList.add('is-ready')); });
window.addEventListener('resize', syncSection);

// Efeito Typewriter para o Hero
const typewriterContainer = document.getElementById('typewriter-container');
if (typewriterContainer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const line1Text = "Desenvolvendo softwares com:";
  const line2TextPart1 = "Design & ";
  const line2TextPart2 = "Código Limpo.";

  const len1 = line1Text.length;
  const len2 = line2TextPart1.length;
  const len3 = line2TextPart2.length;
  const totalLength = len1 + len2 + len3;

  function getHtmlForLength(len) {
    let html = "";
    const cursorHtml = '<span class="typewriter-cursor">|</span>';

    if (len <= len1) {
      html = `<span>${line1Text.substring(0, len)}</span>`;
      return html + cursorHtml;
    }

    html = `<span>${line1Text}</span><br>`;
    let rem = len - len1;

    if (rem <= len2) {
      html += `<span>${line2TextPart1.substring(0, rem)}</span>`;
      return html + cursorHtml;
    }

    html += `<span>${line2TextPart1}</span>`;
    let rem2 = rem - len2;

    html += `<span class="pixel-font">${line2TextPart2.substring(0, rem2)}</span>`;
    return html + cursorHtml;
  }

  let charIndex = totalLength;
  let isDeleting = true;
  let typingDelay = 100;
  let erasingDelay = 40;
  let pauseDelay = 3000;

  function type() {
    let currentHtml = getHtmlForLength(charIndex);
    typewriterContainer.innerHTML = currentHtml;

    if (isDeleting) {
      charIndex--;
      typingDelay = erasingDelay;
    } else {
      charIndex++;
      typingDelay = 100;
    }

    if (!isDeleting && charIndex === totalLength) {
      isDeleting = true;
      typingDelay = pauseDelay;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      typingDelay = 500;
    }

    setTimeout(type, typingDelay);
  }

  setTimeout(type, 1500);
}

// Efeito de rolagem suave e desaceleração para o carrossel de habilidades
const carousel = document.getElementById('skills-carousel');
const track = document.getElementById('skills-track');

if (carousel && track && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const group = track.querySelector('.skills-carousel-group');
  let speed = 0.6; // velocidade em pixels por frame
  let currentSpeed = speed;
  let targetSpeed = speed;
  let position = 0;
  let groupWidth = 0;
  let animationFrame = 0;

  const sizeObserver = new ResizeObserver(([entry]) => {
    groupWidth = entry.borderBoxSize?.[0]?.inlineSize ?? entry.target.offsetWidth;
  });
  if (group) sizeObserver.observe(group);

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    } else if (!entry.isIntersecting && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }).observe(carousel);

  carousel.addEventListener('mouseenter', () => {
    targetSpeed = 0;
  });

  carousel.addEventListener('mouseleave', () => {
    targetSpeed = speed;
  });

  function animate() {
    // Interpolação linear para desaceleração mais lenta e suave (coeficiente de 0.025)
    currentSpeed += (targetSpeed - currentSpeed) * 0.025;

    if (groupWidth > 0) {
      position -= currentSpeed;
      if (Math.abs(position) >= groupWidth) {
        position = position % groupWidth;
      }
      track.style.transform = `translateX(${position}px)`;
    }

    animationFrame = requestAnimationFrame(animate);
  }
}

const tiltPreference = window.matchMedia(
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
);

document.querySelectorAll('.projeto-bloco').forEach(card => {
  function resetTilt() {
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  }

  card.addEventListener('pointermove', event => {
    if (!tiltPreference.matches || event.pointerType !== 'mouse') return;

    const bounds = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    card.style.setProperty('--tilt-x', ((0.5 - y) * 8) + 'deg');
    card.style.setProperty('--tilt-y', ((x - 0.5) * 8) + 'deg');
  });

  card.addEventListener('pointerleave', resetTilt);
  card.addEventListener('pointercancel', resetTilt);
  tiltPreference.addEventListener('change', resetTilt);
});

// Matriz fixa de pixels, inspirada no Card Spotlight de Manu Arora.
const spotlight = document.createElement('canvas');
spotlight.className = 'page-spotlight';
spotlight.width = spotlight.height = 560;
spotlight.setAttribute('aria-hidden', 'true');
const spotlightContext = spotlight.getContext('2d');
const spotRadius = spotlight.width / 2;
const pixelStep = 4;
const pixelColors = ['#ad0017', '#d9283f'];
const pixelOpacity = [0.17, 0.17, 0.17, 0.27, 0.27, 0.27, 0.42, 0.42, 0.42, 0.54];
let spotX = 0;
let spotY = 0;
let spotStart = 0;
let spotFrame = 0;
let spotScrollTimer = 0;
let spotActive = false;
let lastSpotDraw = -Infinity;

function pixelRandom(x, y) {
  let hash = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

function drawSpotlight(now) {
  if (now - lastSpotDraw >= 32) {
    lastSpotDraw = now;
    const elapsed = (now - spotStart) / 1000;
    const left = spotX - spotRadius;
    const top = spotY - spotRadius;
    spotlight.style.transform = 'translate(' + left + 'px, ' + top + 'px)';
    spotlightContext.clearRect(0, 0, spotlight.width, spotlight.height);

    for (let y = Math.ceil(top / pixelStep); y * pixelStep < top + spotlight.height; y++) {
      for (let x = Math.ceil(left / pixelStep); x * pixelStep < left + spotlight.width; x++) {
        const px = x * pixelStep - left;
        const py = y * pixelStep - top;
        const distance = Math.hypot(px - spotRadius, py - spotRadius);
        if (distance > spotRadius) continue;

        const seed = pixelRandom(x, y);
        const reveal = distance / pixelStep * 0.01 + seed * 0.15;
        if (elapsed * 5 < reveal) continue;

        const phase = Math.floor(elapsed / 5 + seed);
        const strength = pixelRandom(x + phase * 149, y + phase * 67);
        spotlightContext.globalAlpha = pixelOpacity[Math.floor(strength * pixelOpacity.length)];
        spotlightContext.fillStyle = pixelColors[seed < 0.5 ? 0 : 1];
        spotlightContext.fillRect(px, py, 3, 2);
      }
    }
  }

  spotFrame = requestAnimationFrame(drawSpotlight);
}

if (spotlightContext) {
  document.body.prepend(spotlight);
  window.addEventListener('pointermove', event => {
    if (!tiltPreference.matches || event.pointerType !== 'mouse') return;

    spotX = Math.round(event.clientX);
    spotY = Math.round(event.clientY);
    if (!spotActive) {
      spotActive = true;
      spotStart = performance.now();
      lastSpotDraw = -Infinity;
      spotlight.classList.add('is-visible');
    }
    resumeSpotlight();
  }, { passive: true });

  function pauseSpotlight() {
    cancelAnimationFrame(spotFrame);
    spotFrame = 0;
  }

  function resumeSpotlight() {
    if (spotActive && !spotFrame && !spotScrollTimer) {
      spotFrame = requestAnimationFrame(drawSpotlight);
    }
  }

  window.addEventListener('scroll', () => {
    if (!spotActive) return;
    pauseSpotlight();
    clearTimeout(spotScrollTimer);
    spotScrollTimer = setTimeout(() => {
      spotScrollTimer = 0;
      resumeSpotlight();
    }, 140);
  }, { passive: true });

  function hideSpotlight() {
    spotActive = false;
    pauseSpotlight();
    clearTimeout(spotScrollTimer);
    spotScrollTimer = 0;
    spotlight.classList.remove('is-visible');
  }

  document.documentElement.addEventListener('pointerleave', hideSpotlight);
  window.addEventListener('blur', hideSpotlight);
  tiltPreference.addEventListener('change', hideSpotlight);
}
