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
  let lastMeasuredWidth = 0;

  carousel.addEventListener('mouseenter', () => {
    targetSpeed = 0;
  });

  carousel.addEventListener('mouseleave', () => {
    targetSpeed = speed;
  });

  function animate() {
    // Recalcula a largura dinamicamente caso as imagens terminem de carregar ou a janela seja redimensionada
    const currentWidth = group ? group.getBoundingClientRect().width : 0;
    if (currentWidth !== lastMeasuredWidth && currentWidth > 0) {
      groupWidth = currentWidth;
      lastMeasuredWidth = currentWidth;
    }

    // Interpolação linear para desaceleração mais lenta e suave (coeficiente de 0.025)
    currentSpeed += (targetSpeed - currentSpeed) * 0.025;

    if (groupWidth > 0) {
      position -= currentSpeed;
      if (Math.abs(position) >= groupWidth) {
        position = position % groupWidth;
      }
      track.style.transform = `translateX(${position}px)`;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
