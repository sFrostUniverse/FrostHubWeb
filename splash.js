const canvas = document.getElementById("splashCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const logoImg = new Image();
logoImg.src = "assets/logo.png";

const particleCount = 1200; // dense logo
let logoParticles = [];

// Resize handling
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Particle class
class Particle {
  constructor(x, y, tx, ty, color) {
    this.x = x;
    this.y = y;
    this.tx = tx; // target x
    this.ty = ty; // target y
    this.color = color;
    this.size = 2 + Math.random() * 1.5;
    this.speed = 0.05 + Math.random() * 0.03; // easing
  }

  update() {
    this.x += (this.tx - this.x) * this.speed;
    this.y += (this.ty - this.y) * this.speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Extract pixels from logo
function createParticlesFromLogo() {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  const scale = 0.4; // logo scaling

  const logoWidth = logoImg.width * scale;
  const logoHeight = logoImg.height * scale;
  tempCanvas.width = logoWidth;
  tempCanvas.height = logoHeight;

  tempCtx.drawImage(logoImg, 0, 0, logoWidth, logoHeight);
  const imageData = tempCtx.getImageData(0, 0, logoWidth, logoHeight).data;

  const offsetX = canvas.width / 2 - logoWidth / 2;
  const offsetY = canvas.height / 2 - logoHeight / 2;

  for (let y = 0; y < logoHeight; y += 3) {
    for (let x = 0; x < logoWidth; x += 3) {
      const index = (y * logoWidth + x) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const a = imageData[index + 3];
      if (a > 150) {
        const color = `rgb(${r},${g},${b})`;
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        logoParticles.push(new Particle(startX, startY, offsetX + x, offsetY + y, color));
      }
    }
  }
}

// Animate
function animate() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.25)"; // trailing effect
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  logoParticles.forEach((p) => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

logoImg.onload = () => {
  createParticlesFromLogo();
  animate();

  // Hold logo for a bit, then fade out
  setTimeout(() => {
    canvas.style.transition = "opacity 1.5s ease";
    canvas.style.opacity = "0";

    document.querySelector(".license-footer").style.transition = "opacity 1s ease";
    document.querySelector(".license-footer").style.opacity = "0";

    setTimeout(() => {
      // Redirect logic
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
    }, 1600);
  }, 4000); // 4s total before redirect
};
