// Three.js splash particle animation
const canvas = document.getElementById("splashCanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 300;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0f172a, 1);

// Particle material
const particleCount = 4000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 600;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0x38bdf8,
  size: 2,
  transparent: true,
  opacity: 0.9
});
const points = new THREE.Points(geometry, material);
scene.add(points);

// Load FrostHub logo → create particle target shape
const loader = new THREE.TextureLoader();
loader.load("assets/logo.png", (texture) => {
  const img = texture.image;
  const canvasTemp = document.createElement("canvas");
  const ctx = canvasTemp.getContext("2d");
  canvasTemp.width = img.width;
  canvasTemp.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, img.width, img.height).data;
  let p = 0;
  for (let y = 0; y < img.height; y += 4) {
    for (let x = 0; x < img.width; x += 4) {
      const idx = (y * img.width + x) * 4;
      if (imgData[idx + 3] > 128 && p < particleCount) {
        targetPositions[p * 3] = x - img.width / 2;
        targetPositions[p * 3 + 1] = -y + img.height / 2;
        targetPositions[p * 3 + 2] = 0;
        p++;
      }
    }
  }
});

// Animate particles into logo
function animate() {
  requestAnimationFrame(animate);
  const pos = geometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    pos[i * 3] += (targetPositions[i * 3] - pos[i * 3]) * 0.05;
    pos[i * 3 + 1] += (targetPositions[i * 3 + 1] - pos[i * 3 + 1]) * 0.05;
    pos[i * 3 + 2] += (targetPositions[i * 3 + 2] - pos[i * 3 + 2]) * 0.05;
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}
animate();

// Redirect after ~4 seconds
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
}, 4000);

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
