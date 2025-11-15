/* ---------- Main page behavior (scroll, nav, UI) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[data-nav]");
  const navLinks = document.querySelectorAll("nav a, .nav-links a");
  const cards = document.querySelectorAll(".card");
  const progressBar = document.getElementById("progress-bar");

  // init effects
  const typingText = document.querySelector(".typing");
  if (typingText) initTypeEffect(typingText);
  initProfilePhotoEffects();
  initBackToTop();
  initCVDownload();

  // card fade-in
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("fade-in");
      else entry.target.classList.remove("fade-in");
    });
  }, { threshold: 0.16 });
  cards.forEach(c => cardObserver.observe(c));

  // smooth scroll for nav links & history
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

  // highlight nav based on section in view
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        document.querySelectorAll(".nav-links a, nav a").forEach(a => a.classList.remove("active"));
        const active = document.querySelector(`.nav-links a[href="#${id}"], nav a[href="#${id}"]`);
        if (active) active.classList.add("active");
        history.replaceState(null, "", `#${id}`);
      }
    });
  }, { root: null, rootMargin: "-20% 0px -40% 0px", threshold: 0 });
  sections.forEach(sec => navObserver.observe(sec));

  // progress bar
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  });

  // scroll to hash on load
  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 200);
  }
});

/* ---------- Typing effect ---------- */
function initTypeEffect(element){
  const words = [" Lecturer", " Researcher", " Mathematician"];
  let w=0, ch=0, deleting=false;
  function step(){
    const word=words[w];
    element.textContent = word.substring(0,ch);
    if(!deleting && ch < word.length){ ch++; setTimeout(step, 110 + Math.random()*60); }
    else if(deleting && ch > 0){ ch--; setTimeout(step, 40 + Math.random()*30); }
    else { deleting = !deleting; if(!deleting) w=(w+1)%words.length; setTimeout(step, deleting?700:900); }
  }
  step();
}

/* ---------- Profile photo effects ---------- */
function initProfilePhotoEffects(){
  const p = document.querySelector('.profile-pic');
  if(!p) return;
  p.addEventListener('mousemove', (e)=>{
    const {left, top, width, height} = p.getBoundingClientRect();
    const x = (e.clientX - left)/width - 0.5;
    const y = (e.clientY - top)/height - 0.5;
    p.style.transform = `scale(1.06) rotate3d(${-y}, ${x}, 0, 16deg)`;
    p.style.boxShadow = `${x*12}px ${y*12}px 30px rgba(0,0,0,0.18)`;
  });
  p.addEventListener('mouseleave', ()=>{ p.style.transform='scale(1)'; p.style.boxShadow='none'; });
  p.addEventListener('click', ()=>{ p.style.transform='scale(.96)'; setTimeout(()=>p.style.transform='scale(1)',150); });
}

/* ---------- Back to top ---------- */
function initBackToTop(){
  const btn = document.createElement('button');
  btn.id = 'back-to-top'; btn.title = 'Back to top'; btn.textContent = '⬆ Top';
  document.body.appendChild(btn);
  window.addEventListener('scroll', ()=> btn.style.display = window.scrollY > 420 ? 'block' : 'none');
  btn.addEventListener('click', ()=> { window.scrollTo({top:0,behavior:'smooth'}); history.replaceState(null,'','#home'); });
}

/* ---------- CV download feedback ---------- */
function initCVDownload(){
  const btn = document.querySelector('.btn[download]');
  if(!btn) return;
  btn.addEventListener('click', (e)=>{
    const original = btn.innerHTML;
    btn.innerHTML = '⏳ Downloading...';
    setTimeout(()=>{ btn.innerHTML = '✓ Downloaded!'; setTimeout(()=> btn.innerHTML = original, 1400); }, 700);
  });
}

/* ---------------- Math background animation (sharpened visibility + glow) ---------------- */
(function initMathBackground(){
  const canvas = document.getElementById('math-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W=0,H=0, DPR = Math.max(1, window.devicePixelRatio || 1);

  const symbols = ['π','∑','√','∞','∫','Δ','θ','λ','e','i','≠','≈'];
  let particles = [], symbolPool = [];

  function rand(a,b){ return Math.random()*(b-a)+a; }

  function resize(){
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W*DPR); canvas.height = Math.round(H*DPR);
    canvas.style.width = W+'px'; canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const area = W*H;
    const ideal = Math.min(220, Math.max(60, Math.round(area/10000))); // a bit denser on big screens
    initParticles(ideal);
  }

  function Particle(x,y,vx,vy,r){
    this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.r=r; this.alpha = rand(0.28,0.95);
  }
  Particle.prototype.step = function(dt){
    this.x += this.vx * dt; this.y += this.vy * dt;
    if(this.x < -12) this.x = W+12;
    if(this.x > W+12) this.x = -12;
    if(this.y < -12) this.y = H+12;
    if(this.y > H+12) this.y = -12;
  };

  function initParticles(n){
    particles.length = 0;
    for(let i=0;i<n;i++){
      const x = rand(0,W), y = rand(0,H);
      const speed = rand(12, 40); // slightly faster
      const ang = rand(0, Math.PI*2);
      particles.push(new Particle(x,y, Math.cos(ang)*speed, Math.sin(ang)*speed, rand(0.8,2.8)));
    }
    // symbols
    symbolPool.length = 0;
    const sc = Math.max(8, Math.round(n*0.08));
    for(let i=0;i<sc;i++){
      symbolPool.push({
        char: symbols[Math.floor(Math.random()*symbols.length)],
        x: rand(0,W), y: rand(0,H),
        size: rand(16,40),
        alpha: 0,
        life: rand(2.4,7),
        phase: rand(0,Math.PI*2)
      });
    }
  }

  let sinePhase = 0;
  function drawSine(){
    const amplitude = Math.min(90, H*0.08);
    const freq = 0.013 + (H/20000);
    const yCenter = H*0.72;
    ctx.beginPath();
    for(let x=-10;x<=W+10;x+=8){
      const y = yCenter + Math.sin((x*freq) + sinePhase) * amplitude;
      if(x===-10) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = "rgba(140,170,255,0.08)"; // stronger
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(110,140,255,0.08)";
    ctx.shadowBlur = 8;
    ctx.stroke();

    // fine secondary line
    ctx.beginPath();
    for(let x=-10;x<=W+10;x+=10){
      const y = yCenter + Math.sin((x*freq*1.6) + sinePhase*0.8) * (amplitude*0.55);
      if(x===-10) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = "rgba(200,220,255,0.04)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }

  function drawParticles(dt){
    for(let p of particles){
      p.step(dt);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      // brighter dots
      ctx.fillStyle = `rgba(210,230,255,${0.09 + p.alpha*0.22})`;
      // subtle glow
      ctx.shadowBlur = Math.max(6, p.r*3);
      ctx.shadowColor = "rgba(140,160,255,0.08)";
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // connecting lines
    const maxDist = Math.min(210, Math.max(90, Math.sqrt(W*H) * 0.07));
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if(d2 < maxDist*maxDist){
          const alpha = 0.12 * (1 - d2/(maxDist*maxDist)); // stronger line alpha
          ctx.beginPath();
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = `rgba(160,200,255,${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }
  }

  function drawSymbols(dt){
    for(let s of symbolPool){
      s.phase += dt * 0.16;
      if(s.alpha < 1 && Math.random() < 0.03) s.alpha += 0.06;
      s.y += Math.sin(s.phase) * 0.28;
      s.x += Math.cos(s.phase*0.7) * 0.09;
      if(Math.random() < 0.003) { s.x = rand(0,W); s.y = rand(0,H); }

      ctx.save();
      ctx.globalAlpha = 0.06 + Math.min(1, s.alpha) * 0.9;
      ctx.font = `${s.size}px "Poppins", system-ui`;
      // brighter symbol color
      ctx.fillStyle = "rgba(235,245,255,0.92)";
      ctx.shadowColor = "rgba(150,180,255,0.06)";
      ctx.shadowBlur = 6;
      ctx.fillText(s.char, s.x, s.y);
      ctx.restore();
    }
  }

  // occasional big symbol
  function bigSymbol(){
    const big = {
      char: symbols[Math.floor(Math.random()*symbols.length)],
      x: rand(W*0.12, W*0.88),
      y: rand(H*0.12, H*0.86),
      size: rand(46, 120),
    };
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.font = `${big.size}px "Poppins", system-ui`;
    ctx.fillStyle = "rgba(220,230,255,0.14)";
    ctx.shadowColor = "rgba(150,180,255,0.08)";
    ctx.shadowBlur = 18;
    ctx.fillText(big.char, big.x, big.y);
    ctx.restore();
  }

  // main loop
  let last = performance.now();
  let frame = 0;
  function loop(now){
    const dt = Math.min(0.033, (now - last)/1000);
    last = now;
    sinePhase += dt * 1.1;

    // background gentle gradient
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

    if(frame % 300 === 0 && Math.random() < 0.9) bigSymbol();

    frame++;
    if(document.hidden) setTimeout(()=>requestAnimationFrame(loop), 260);
    else requestAnimationFrame(loop);
  }

  // initialize & events
  resize();
  window.addEventListener('resize', ()=>{ clearTimeout(window._mathBgResizeTimer); window._mathBgResizeTimer = setTimeout(resize, 140); });
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) last = performance.now(); });
  requestAnimationFrame(loop);
})();
