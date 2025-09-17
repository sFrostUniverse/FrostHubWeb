const canvas = document.getElementById("splashCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const colors = ["#60a5fa", "#93c5fd", "#e0f2fe", "#ffffff"]; // frost blues + white
const numParticles = 400; // moderate density

// Particle class
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;

    // slowly drift towards center (frost storm collapsing)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    this.x += (centerX - this.x) * 0.002;
    this.y += (centerY - this.y) * 0.002;

    // reset if offscreen
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Create particles
for (let i = 0; i < numParticles; i++) {
  particles.push(new Particle());
}

let animationFrame;
let animationTime = 0;
const revealTime = 3500; // ~3.5s storm before reveal
const redirectDelay = 1500; // wait after logo shows

function animate() {
  animationFrame = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  animationTime += 16;

  // After revealTime, show logo
  if (animationTime > revealTime) {
    document.querySelector(".logo-container").classList.add("show");

    // stop animating after reveal
    cancelAnimationFrame(animationFrame);

    // Redirect after delay
    setTimeout(() => {
      const token = localStorage.getItem("token");
      const groupId = localStorage.getItem("groupId");

      if (token) {
        if (!groupId) {
          window.location.href = "/FrostHubWeb/login/group.html";
        } else {
          window.location.href = "/FrostHubWeb/dashboard/dashboard.html";
        }
      } else {
        window.location.href = "/FrostHubWeb/login/login.html";
      }
    }, redirectDelay);
  }
}

animate();
