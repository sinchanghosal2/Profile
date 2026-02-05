const menuButton = document.querySelector('.menu');
const nav = document.querySelector('.nav');

if (menuButton) {
  menuButton.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

const filters = document.querySelectorAll('.filter');
const cases = document.querySelectorAll('.case-grid article');

filters.forEach((btn) => {
  btn.addEventListener('click', () => {
    filters.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const value = btn.dataset.filter;

    cases.forEach((card) => {
      const tags = card.dataset.tags;
      const show = value === 'all' || (tags && tags.includes(value));
      card.style.display = show ? 'block' : 'none';
    });
  });
});

const counters = document.querySelectorAll('[data-count]');
const speed = 28;

const runCounters = () => {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    if (!target) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / speed));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      counter.textContent = `${current}${suffix}`;
    }, 30);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('hero')) {
          runCounters();
        }
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('section, .hero, .trusted').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

const journeySteps = Array.from(document.querySelectorAll('.journey-step'));
const journeyTitle = document.getElementById('journey-title');
const journeyDetail = document.getElementById('journey-detail');
const journeyImage = document.getElementById('journey-image');
const journeyCity = document.getElementById('journey-city');

const updateJourney = (index) => {
  if (!journeySteps.length) return;
  const safeIndex = (index + journeySteps.length) % journeySteps.length;
  journeySteps.forEach((step, idx) => {
    step.classList.toggle('active', idx === safeIndex);
  });
  const active = journeySteps[safeIndex];
  if (journeyTitle) journeyTitle.textContent = active.dataset.title || active.textContent;
  if (journeyDetail) journeyDetail.textContent = active.dataset.detail || '';
  if (journeyCity) journeyCity.textContent = active.dataset.city || '';
  if (journeyImage && active.dataset.image) {
    journeyImage.src = active.dataset.image;
    journeyImage.alt = `${active.dataset.title || active.textContent} journey visual`;
  }
};

journeySteps.forEach((step, idx) => {
  step.addEventListener('click', () => updateJourney(idx));
});

updateJourney(0);

const repoCards = document.querySelectorAll('.repo-card');
repoCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

const caseCards = Array.from(document.querySelectorAll('.case-grid article'));
caseCards.forEach((card) => {
  const toggle = card.querySelector('.case-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const isOpen = card.classList.contains('expanded');
    caseCards.forEach((item) => item.classList.remove('expanded'));
    card.classList.toggle('expanded', !isOpen);
    toggle.textContent = isOpen ? 'View details' : 'Hide details';
  });
});

const runnerCanvas = document.getElementById('runner-canvas');
if (runnerCanvas) {
  const ctx = runnerCanvas.getContext('2d');
  const scoreEl = document.getElementById('runner-score');
  const bestEl = document.getElementById('runner-best');
  const toastEl = document.getElementById('runner-toast');

  const terms = [
    'CI/CD failed',
    'Schema drift',
    'Broken DAG',
    'Data quality bug',
    'Server overload',
    'Dependency deadlock',
    'Pipeline timeout',
    'Error 404',
    'Version conflict',
    'Model drift',
  ];

  const state = {
    running: false,
    speed: 6,
    score: 0,
    best: Number(localStorage.getItem('runner-best') || 0),
    player: { x: 60, y: 168, w: 48, h: 40, vy: 0, grounded: true },
    obstacles: [],
    spawnTimer: 0,
  };

  bestEl.textContent = state.best;

  const reset = () => {
    state.running = true;
    state.speed = 6;
    state.score = 0;
    state.player.y = 170;
    state.player.vy = 0;
    state.player.grounded = true;
    state.obstacles = [];
    state.spawnTimer = 0;
    toastEl.textContent = 'Run started. Keep the pipeline alive.';
  };

  const jump = () => {
    if (!state.running) reset();
    if (state.player.grounded) {
      state.player.vy = -12.5;
      state.player.grounded = false;
    }
  };

  const spawnObstacle = () => {
    const height = 26 + Math.random() * 24;
    const width = 26 + Math.random() * 18;
    const label = terms[Math.floor(Math.random() * terms.length)];
    state.obstacles.push({ x: runnerCanvas.width + 20, y: 200 - height, w: width, h: height, label });
  };

  const update = () => {
    if (!state.running) return;
    state.player.vy += 0.6;
    state.player.y += state.player.vy;
    if (state.player.y >= 170) {
      state.player.y = 170;
      state.player.vy = 0;
      state.player.grounded = true;
    }

    state.spawnTimer += 1;
    if (state.spawnTimer > 70) {
      spawnObstacle();
      state.spawnTimer = 0;
    }

    state.obstacles.forEach((obs) => {
      obs.x -= state.speed;
    });
    state.obstacles = state.obstacles.filter((obs) => obs.x + obs.w > -20);

    state.score += 0.1;
    if (state.score % 100 < 0.1) state.speed += 0.4;

    const px = state.player.x;
    const py = state.player.y;
    const pw = state.player.w;
    const ph = state.player.h;
    for (const obs of state.obstacles) {
      if (px < obs.x + obs.w && px + pw > obs.x && py < obs.y + obs.h && py + ph > obs.y) {
        state.running = false;
        toastEl.textContent = obs.label || terms[Math.floor(Math.random() * terms.length)];
        const finalScore = Math.floor(state.score);
        if (finalScore > state.best) {
          state.best = finalScore;
          localStorage.setItem('runner-best', state.best);
          bestEl.textContent = state.best;
          toastEl.textContent += ' · New best!';
        }
        break;
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, runnerCanvas.width, runnerCanvas.height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 208);
    ctx.lineTo(runnerCanvas.width, 208);
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.ellipse(state.player.x + 20, state.player.y + 20, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(state.player.x + 12, state.player.y + 16);
    ctx.lineTo(state.player.x - 6, state.player.y + 4);
    ctx.lineTo(state.player.x + 8, state.player.y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(state.player.x + 28, state.player.y + 20);
    ctx.lineTo(state.player.x + 44, state.player.y + 12);
    ctx.lineTo(state.player.x + 44, state.player.y + 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(state.player.x + 26, state.player.y + 18, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(state.player.x + 6, state.player.y + 30, 12, 6);

    ctx.fillStyle = '#38bdf8';
    state.obstacles.forEach((obs) => {
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px \"Space Grotesk\", sans-serif';
      ctx.fillText(obs.label, obs.x - 4, obs.y - 6);
      ctx.fillStyle = '#38bdf8';
    });

    if (!state.running) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px \"Space Grotesk\", sans-serif';
      ctx.fillText('Press Space or tap to play', 24, 40);
    }
  };

  const loop = () => {
    update();
    draw();
    scoreEl.textContent = Math.floor(state.score);
    requestAnimationFrame(loop);
  };

  runnerCanvas.addEventListener('click', (event) => {
    runnerCanvas.focus();
    jump();
  });

  runnerCanvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    runnerCanvas.focus();
    jump();
  });
  runnerCanvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    jump();
  });

  loop();
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const note = contactForm.querySelector('.form-note');
    const submitButton = contactForm.querySelector('button[type=\"submit\"]');
    if (submitButton) submitButton.disabled = true;
    if (note) note.textContent = 'Sending...';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Submit failed');
      contactForm.reset();
      if (note) note.textContent = 'Thanks! Your inquiry is in my inbox.';
    } catch (error) {
      if (note) {
        note.textContent = 'Something went wrong. Please try again or email me directly.';
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
