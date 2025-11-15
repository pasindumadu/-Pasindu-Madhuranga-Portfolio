/* ---------- Main interactive behaviour ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[data-nav]");
  const navLinks = document.querySelectorAll("nav a");
  const cards = document.querySelectorAll(".card");
  const progressBar = document.getElementById("progress-bar");

  // Init typed effect and profile effects
  const typingText = document.querySelector(".typing");
  if (typingText) initTypeEffect(typingText);
  initProfilePhotoEffects();
  initBackToTop();
  initCVDownload();

  // Card fade observer
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      } else {
        entry.target.classList.remove("fade-in");
      }
    });
  }, { threshold: 0.16 });
  cards.forEach(c => cardObserver.observe(c));

  // Smooth scroll for nav links and update history
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", `#${id}`);
        }
      }
    });
  });

  // Highlight nav as sections intersect
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(a => a.classList.remove("active"));
        const activeLink = document.querySelector(`nav a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add("active");
        history.replaceState(null, "", `#${id}`);
      }
    });
  }, { root: null, rootMargin: "-20% 0px -40% 0px", threshold: 0 });
  sections.forEach(sec => navObserver.observe(sec));

  // progress bar
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = percent + "%";
  });

  // Scroll to hash on load (if present)
  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 180);
  }
});

/* ---------- Helper: typing effect ---------- */
function initTypeEffect(element) {
  const words = [" Lecturer", " Researcher", " Mathematician"];
  let wordIndex = 0, charIndex = 0, isDeleting = false;

  function tick() {
    const current = words[wordIndex];
    const displayed = current.substring(0, charIndex);
    element.textContent = displayed;

    if (!isDeleting && charIndex < current.length) {
      charIndex++;
      setTimeout(tick, 100 + Math.random()*60);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(tick, 40 + Math.random()*30);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) wordIndex = (wordIndex + 1) % words.length;
      setTimeout(tick, isDeleting ? 700 : 900);
    }
  }
  tick();
}

/* ---------- Helper: profile photo parallax & click ---------- */
function initProfilePhotoEffects() {
  const profilePic = document.querySelector('.profile-pic');
  if (!profilePic) return;
  profilePic.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = profilePic.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    profilePic.style.transform = `scale(1.04) rotate3d(${-y}, ${x}, 0, 16deg)`;
    profilePic.style.boxShadow = `${x * 10}px ${y * 10}px 24px rgba(0,0,0,0.18)`;
  });
  profilePic.addEventListener('mouseleave', () => {
    profilePic.style.transform = 'scale(1)';
    profilePic.style.boxShadow = 'none';
  });
  profilePic.addEventListener('click', () => {
    profilePic.style.transform = 'scale(0.96)';
    setTimeout(() => profilePic.style.transform = 'scale(1)', 150);
  });
}

/* ---------- Helper: back to top ---------- */
function initBackToTop() {
  const backToTop = document.createElement("button");
  backToTop.innerHTML = "⬆ Top";
  backToTop.id = "back-to-top";
  backToTop.title = "Back to top";
  document.body.appendChild(backToTop);

  window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 420 ? "block" : "none";
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", "#home");
  });
}

/* ---------- Helper: CV download feedback ---------- */
function initCVDownload() {
  const downloadBtn = document.querySelector('.btn[download]');
  if (!downloadBtn) return;
  downloadBtn.addEventListener('click', (e) => {
    const original = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '⏳ Downloading...';
    setTimeout(() => {
      downloadBtn.innerHTML = '✓ Downloaded!';
      setTimeout(() => downloadBtn.innerHTML = original, 1500);
    }, 700);
  });
}

/* ---------------- Math background animation ---------------- */
(function initMathBackground() {
  const canvas = document.getElementById("math-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = Math.max(1, window.devicePixelRatio || 1);
  const symbols = ['π','∑','√','∞','∫','Δ','θ','λ','e','i','≠','≈'];
  let particles = [];
  let symbolPool = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const area = W * H;
    const ideal = Math.min(160, Math.max(48, Math.round(area / 12000)));
    initParticles(ideal);
  }

  // Particle constructor
  function Particle(x, y, vx, vy, r) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.r = r;
    this.alpha = rand(0.18, 0.8);
  }
  Particle.prototype.step = function(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < -12) this.x = W + 12;
    if (this.x > W + 12) this.x = -12;
    if (this.y < -12) this.y = H + 12;
    if (this.y > H + 12) this.y = -12;
  };

  function initParticles(n) {
    particles.length = 0;
    for (let i=0;i<n;i++){
      const x = rand(0, W), y = rand(0,H);
      const speed = rand(8, 30);
      const angle = rand(0, Math.PI*2);
      const vx = Math.cos(angle)*speed, vy = Math.sin(angle)*speed;
      const r = rand(0.6, 2.6);
      particles.push(new Particle(x,y,vx,vy,r));
    }

    symbolPool.length = 0;
    const symbolCount = Math.max(6, Math.round(n * 0.06));
    for (let i=0;i<symbolCount;i++){
      symbolPool.push({
        char: symbols[Math.floor(Math.random()*symbols.length)],
        x: rand(0, W),
        y: rand(0, H),
        size: rand(14, 34),
        alpha: 0,
        life: rand(2.4, 7),
        phase: rand(0, Math.PI*2)
      });
    }
  }

  // sine wave
  let sinePhase = 0;
  function drawSine() {
    const amplitude = Math.min(72, H * 0.06);
    const frequency = 0.0125 + (H/20000);
    const yCenter = H * 0.72;
    ctx.beginPath();
    for (let x=-10;x<=W+10;x+=10) {
      const y = yCenter + Math.sin((x * frequency) + sinePhase) * amplitude;
      if (x === -10) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = "rgba(140,160,255,0.045)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    for (let x=-10;x<=W+10;x+=10) {
      const y = yCenter + Math.sin((x * frequency * 1.6) + sinePhase * 0.8) * (amplitude * 0.55);
      if (x === -10) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = "rgba(180,200,255,0.03)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // particles
  function drawParticles(dt) {
    for (let p of particles) {
      p.step(dt);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,220,255,${0.06 + p.alpha * 0.18})`;
      ctx.fill();
    }

    const maxDist = Math.min(170, Math.max(80, Math.sqrt(W*H) * 0.06));
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < maxDist*maxDist) {
          const alpha = 0.08 * (1 - d2/(maxDist*maxDist));
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = `rgba(160,190,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // symbols
  function drawSymbols(dt) {
    for (let s of symbolPool) {
      s.phase += dt * 0.16;
      if (s.alpha < 1 && Math.random() < 0.02) s.alpha += 0.04;
      s.y += Math.sin(s.phase) * 0.2;
      s.x += Math.cos(s.phase * 0.7) * 0.08;
      if (Math.random() < 0.002) { s.x = rand(0,W); s.y = rand(0,H); }

      ctx.save();
      ctx.globalAlpha = 0.06 + Math.min(0.9, s.alpha) * 0.85;
      ctx.font = `${s.size}px "Poppins", system-ui, -apple-system, "Segoe UI", Roboto`;
      ctx.fillStyle = "rgba(220,230,255,0.8)";
      ctx.fillText(s.char, s.x, s.y);
      ctx.restore();
    }
  }

  // main loop
  let last = performance.now();
  let frame = 0;
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    sinePhase += dt * 1.1;

    ctx.clearRect(0,0,W,H);
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, "rgba(6,10,26,0.0)");
    g.addColorStop(0.6, "rgba(8,14,40,0.06)");
    g.addColorStop(1, "rgba(4,8,20,0.12)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    drawSine();
    drawParticles(dt);
    drawSymbols(dt);

    if (frame % 380 === 0 && Math.random() < 0.96) {
      const big = {
        char: symbols[Math.floor(Math.random()*symbols.length)],
        x: rand(W*0.1, W*0.9),
        y: rand(H*0.12, H*0.9),
        size: rand(36,96),
      };
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.font = `${big.size}px "Poppins", system-ui`;
      ctx.fillStyle = "rgba(200,220,255,0.15)";
      ctx.fillText(big.char, big.x, big.y);
      ctx.restore();
    }

    frame++;
    if (document.hidden) {
      setTimeout(() => requestAnimationFrame(loop), 250);
    } else {
      requestAnimationFrame(loop);
    }
  }

  // init
  resize();
  window.addEventListener("resize", () => {
    clearTimeout(window._mathBgResizeTimer);
    window._mathBgResizeTimer = setTimeout(resize, 160);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) last = performance.now();
  });

  requestAnimationFrame(loop);
})();
