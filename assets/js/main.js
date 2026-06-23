const menuTabs = document.querySelectorAll('.menu-tab');

menuTabs.forEach(link => {
  link.addEventListener('click', () => {
    menuTabs.forEach(tab => tab.classList.remove('active'));
    link.classList.add('active');
  });
});

window.addEventListener('scroll', () => {
  let fromTop = window.scrollY + 200;
  let activeId = 'inicio';

  document.querySelectorAll('section').forEach(section => {
    const id = section.getAttribute('id');
    if (id && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
      activeId = id;
    }
  });

  if (window.scrollY < 100) activeId = 'inicio';

  const targetTab = document.querySelector(`.menu-tab[href="#${activeId}"]`);
  if (targetTab) {
    menuTabs.forEach(tab => tab.classList.remove('active'));
    targetTab.classList.add('active');
  }
});

// Efeito Typewriter para o Hero
const typewriterContainer = document.getElementById('typewriter-container');
if (typewriterContainer) {
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

if (carousel && track) {
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
