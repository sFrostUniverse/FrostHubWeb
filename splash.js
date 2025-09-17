const canvas = document.getElementById("splashCanvas");
const ctx = canvas.getContext("2d");

let width, height, particles = [];
const NUM_PARTICLES = 900;
const LOGO = new Image();
LOGO.src = "assets/logo.png"; // <-- your FrostHub logo

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Particle object
class Particle {
  constructor(x, y) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 1;
    this.alpha = 0;
    this.tx = x; // target x
    this.ty = y; // target y
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
  }

  update() {
    // Smooth ease towards target
    this.x += (this.tx - this.x) * 0.05;
    this.y += (this.ty - this.y) * 0.05;

    // Fade in
    if (this.alpha < 1) this.alpha += 0.02;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(173, 216, 230, ${this.alpha})`; // icy blue
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createParticlesFromLogo() {
  const tempCanvas = document.createElement("canvas");
  const tctx = tempCanvas.getContext("2d");
  const scale = 0.5; // downscale sampling for speed

  tempCanvas.width = LOGO.width * scale;
  tempCanvas.height = LOGO.height * scale;

  tctx.drawImage(LOGO, 0, 0, tempCanvas.width, tempCanvas.height);
  const data = tctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

  particles = [];
  for (let y = 0; y < tempCanvas.height; y += 2) {
    for (let x = 0; x < tempCanvas.width; x += 2) {
      const index = (y * tempCanvas.width + x) * 4;
      if (data[index + 3] > 128) { // alpha > 50%
        const px = (width / 2 - tempCanvas.width / 2) + x;
        const py = (height / 2 - tempCanvas.height / 2) + y;
        if (particles.length < NUM_PARTICLES) {
          particles.push(new Particle(px, py));
        }
      }
    }
  }
}

LOGO.onload = () => {
  createParticlesFromLogo();
  animate();
};

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Frosty background glow
  const gradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width/1.5);
  gradient.addColorStop(0, "rgba(59,130,246,0.2)");
  gradient.addColorStop(1, "rgba(15,23,42,1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Update and draw particles
  for (let p of particles) {
    p.update();
    p.draw();
  }

  requestAnimationFrame(animate);
}

// Redirect after ~4.5s
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
}, 4500);
