document.addEventListener("DOMContentLoaded", () => {
  // Initialize cards animation
  const cards = document.querySelectorAll(".card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        entry.target.classList.remove("fade-out");
      } else {
        entry.target.classList.remove("fade-in");
        entry.target.classList.add("fade-out");
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));

  // Initialize typing effect
  const typingText = document.querySelector(".typing");
  if (typingText) {
    initTypeEffect(typingText);
  }

  // Initialize profile photo effects
  initProfilePhotoEffects();

  // Initialize back to top button
  initBackToTop();

  // Initialize CV download
  initCVDownload();
});

function initTypeEffect(element) {
  const words = [" Lecturer", "Researcher"];
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
      setTimeout(typeEffect, 1000);
    }
  }

  typeEffect();
}

function initProfilePhotoEffects() {
  const profilePic = document.querySelector('.profile-pic');
  if (!profilePic) return;

  // Add hover effect
  profilePic.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = profilePic.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    profilePic.style.transform = `
      scale(1.1) 
      rotate3d(${-y}, ${x}, 0, 20deg)
    `;
    profilePic.style.boxShadow = `
      ${x * 20}px ${y * 20}px 30px rgba(0,0,0,0.2)
    `;
  });

  // Reset on mouse leave
  profilePic.addEventListener('mouseleave', () => {
    profilePic.style.transform = 'scale(1) rotate3d(0, 0, 0, 0deg)';
    profilePic.style.boxShadow = 'none';
  });

  // Add click effect
  profilePic.addEventListener('click', () => {
    profilePic.style.transform = 'scale(0.95)';
    setTimeout(() => {
      profilePic.style.transform = 'scale(1)';
    }, 150);
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
  });
}

function initCVDownload() {
  const downloadBtn = document.querySelector('.btn[download]');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', (e) => {
    // Don't prevent default - let the native download attribute work
    const originalText = downloadBtn.innerHTML;

    // Show downloading state
    downloadBtn.innerHTML = '⏳ Downloading...';

    // Set a timeout to check if download started
    setTimeout(() => {
      // Success state
      downloadBtn.innerHTML = '✓ Downloaded!';
      
      // Reset button text after 2 seconds
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
      }, 2000);
    }, 1000);

    // Error handling - if file doesn't exist
    downloadBtn.onerror = () => {
      downloadBtn.innerHTML = '❌ Download Failed';
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
      }, 2000);
    };
  });
}

// Scroll event listeners
window.addEventListener("scroll", () => {
  // Progress bar
  const progressBar = document.querySelector("#progress-bar");
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + "%";

  // Nav highlighting
  const sections = document.querySelectorAll("section");
  let scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && 
        scrollPos < section.offsetTop + section.offsetHeight) {
      const id = section.getAttribute("id");
      if (id) {
        document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
        document.querySelector(`nav a[href*="${id}"]`)?.classList.add("active");
      }
    }
  });
});
