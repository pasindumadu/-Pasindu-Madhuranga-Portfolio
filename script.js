document.addEventListener("DOMContentLoaded", () => {
  // Elements used across the page
  const sections = document.querySelectorAll("section[data-nav]");
  const navLinks = document.querySelectorAll("nav a");
  const cards = document.querySelectorAll(".card");
  const progressBar = document.getElementById("progress-bar");

  // typing and profile effects from your original script
  const typingText = document.querySelector(".typing");
  if (typingText) initTypeEffect(typingText);
  initProfilePhotoEffects();
  initBackToTop();
  initCVDownload();

  // Fade-in cards using IntersectionObserver
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        entry.target.classList.remove("fade-out");
      } else {
        entry.target.classList.remove("fade-in");
        entry.target.classList.add("fade-out");
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(card => cardObserver.observe(card));

  // Smooth-scroll for nav links (and update hash)
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

  // IntersectionObserver to toggle active nav item as we scroll
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        // highlight nav
        navLinks.forEach(a => a.classList.remove("active"));
        const activeLink = document.querySelector(`nav a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add("active");
        // update hash without jumping
        history.replaceState(null, "", `#${id}`);
      }
    });
  }, { root: null, rootMargin: "-20% 0px -40% 0px", threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));

  // Progress bar update on scroll
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = percent + "%";
  });

  // If page loads with a hash, scroll smoothly to it
  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 200);
  }
});

/* ---------- helper functions (typed effect, profile effects, back to top, cv download) ---------- */

function initTypeEffect(element) {
  const words = [" Lecturer", " Researcher"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    let currentWord = words[wordIndex];
    let displayText = currentWord.substring(0, charIndex);
    element.textContent = displayText;

    if (!isDeleting && charIndex < currentWord.length) {
      charIndex++;
      setTimeout(typeEffect, 120);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeEffect, 60);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeEffect, 900);
    }
  }
  typeEffect();
}

function initProfilePhotoEffects() {
  const profilePic = document.querySelector('.profile-pic');
  if (!profilePic) return;
  profilePic.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = profilePic.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    profilePic.style.transform = `scale(1.06) rotate3d(${-y}, ${x}, 0, 16deg)`;
    profilePic.style.boxShadow = `${x * 12}px ${y * 12}px 24px rgba(0,0,0,0.15)`;
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

function initBackToTop() {
  const backToTop = document.createElement("button");
  backToTop.innerHTML = "⬆ Top";
  backToTop.id = "back-to-top";
  document.body.appendChild(backToTop);

  window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 300 ? "block" : "none";
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", "#home");
  });
}

function initCVDownload() {
  const downloadBtn = document.querySelector('.btn[download]');
  if (!downloadBtn) return;
  downloadBtn.addEventListener('click', (e) => {
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '⏳ Downloading...';
    setTimeout(() => {
      downloadBtn.innerHTML = '✓ Downloaded!';
      setTimeout(() => downloadBtn.innerHTML = originalText, 1800);
    }, 800);
  });
}
