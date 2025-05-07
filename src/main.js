import * as THREE from '.lib/three/three.module.js';
import { GLTFLoader } from '.lib/three/GLTFLoader.js';
import { OBJLoader } from '.lib/three/OBJLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 50);
camera.layers.enableAll();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('three-container').appendChild(renderer.domElement);

// Lighting
const keyboardLight = new THREE.DirectionalLight(0xffffff, 0.7);
keyboardLight.position.set(5, 8, 7);
keyboardLight.layers.set(0);
scene.add(keyboardLight);

const fillLight = new THREE.DirectionalLight(0xaabbff, 0.4);
fillLight.position.set(-7, 3, 5);
fillLight.layers.set(0);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffcc99, 0.3);
rimLight.position.set(0, 2, -10);
rimLight.layers.set(0);
scene.add(rimLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
ambientLight.layers.set(0);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0x5d4fff, 0.8);
spotlight.position.set(0, 30, 20);
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.3;
spotlight.decay = 2;
spotlight.distance = 200;
spotlight.castShadow = true;
spotlight.shadow.mapSize.set(1024, 1024);
scene.add(spotlight);

let spotlightIntensity = { min: 0.7, max: 0.9, current: 0.8, increasing: true };

// Container for Keyboard and Backlights
const container = new THREE.Group();
container.scale.set(0.1, 0.1, 0.1);
scene.add(container);

let backlightMaterials = [];

// Load Keyboard Model
new GLTFLoader().load(
  'public/models/compressed.glb',
  ({ scene: gltfScene }) => {
    gltfScene.traverse(n => {
      if (n.isMesh) {
        n.layers.set(0);
        n.castShadow = true;
        n.receiveShadow = true;
        n.material = new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.7,
          roughness: 0.3,
        });
      }
    });
    container.add(gltfScene);
    const box = new THREE.Box3().setFromObject(container);
    const center = box.getCenter(new THREE.Vector3());
    container.position.sub(center);
    container.position.y += 20;
    container.position.x -= 25;
    container.rotation.x = THREE.MathUtils.degToRad(-5);
    container.rotation.z = THREE.MathUtils.degToRad(90);
  },
  undefined,
  error => console.error('Error loading GLB:', error)
);

// Load Backlight Model
new OBJLoader().load(
  'public/models/backlights.obj',
  obj => {
    const box = new THREE.Box3().setFromObject(obj);
    const width = box.max.x - box.min.x;
    const minX = box.min.x;

    obj.traverse(n => {
      if (n.isMesh) {
        n.layers.set(1);

        const meshCenter = new THREE.Box3().setFromObject(n).getCenter(new THREE.Vector3());
        const normalizedX = (meshCenter.x - minX) / width;

        const material = new THREE.MeshStandardMaterial({
          color: 0x111111,
          emissive: 0xffffff,
          emissiveIntensity: 1.0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        });

        backlightMaterials.push({ material, normalizedX });
        n.material = material;
        n.geometry.computeVertexNormals();
      }
    });
    container.add(obj);
  },
  undefined,
  console.error
);

function checkMobileSize() {
  if (window.innerWidth <= 768) {
    container.scale.set(0.08, 0.08, 0.08);
    camera.position.z = 60;
  } else {
    container.scale.set(0.1, 0.1, 0.1);
    camera.position.z = 50;
  }
}
checkMobileSize();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  checkMobileSize();
});

// Load Mouse Model
let mouseGroup = new THREE.Group();
scene.add(mouseGroup);

new GLTFLoader().load(
  'public/models/mouse.glb',
  ({ scene: mouseScene }) => {
    mouseScene.traverse(n => {
      if (n.isMesh) {
        n.layers.set(0);
        n.castShadow = true;
        n.receiveShadow = true;
        n.material = new THREE.MeshStandardMaterial({
          color: 0x333333,
          metalness: 0.6,
          roughness: 0.4,
          side: THREE.DoubleSide
        });
        n.geometry.computeVertexNormals();
      }
    });

    mouseGroup.add(mouseScene);
    mouseGroup.scale.set(20, 20, 20);
    mouseGroup.position.set(22.5, 13, 0);
    mouseGroup.rotation.x = THREE.MathUtils.degToRad(90);
    mouseGroup.rotation.y = THREE.MathUtils.degToRad(-180);
    mouseGroup.rotation.z = THREE.MathUtils.degToRad(90);
  },
  undefined,
  error => console.error('Error loading mouse model:', error)
);

// Animation Loop
let lastTime = 0;
const FRAME_INTERVAL = 1000 / 165;

function animate(time = 0) {
  requestAnimationFrame(animate);
  if (time - lastTime < FRAME_INTERVAL) return;
  lastTime = time;

  container.rotation.y += 0.0025;
  mouseGroup.rotation.z -= 0.0025;

  const t = time * 0.001;
  const waveSpeed = 0.2;

  backlightMaterials.forEach(({ material, normalizedX }) => {
    const wave = (Math.sin(normalizedX * Math.PI * 2 + t * waveSpeed) + 1) / 2;
    const hue = ((1 - normalizedX) - t * 0.15) % 1.0;
    material.emissive.setHSL(hue, 1.0, 0.5);
    material.emissiveIntensity = 0.8 + wave * 0.4;
  });

  if (spotlightIntensity.increasing) {
    spotlightIntensity.current += 0.002;
    if (spotlightIntensity.current > spotlightIntensity.max) spotlightIntensity.increasing = false;
  } else {
    spotlightIntensity.current -= 0.002;
    if (spotlightIntensity.current < spotlightIntensity.min) spotlightIntensity.increasing = true;
  }

  spotlight.intensity = spotlightIntensity.current;
  renderer.render(scene, camera);
}

animate();

function showCartNotification() {
  const note = document.getElementById('cart-notification');
  if (!note) return;
  note.style.display = 'block';
  setTimeout(() => {
    note.style.display = 'none';
  }, 2000);
}

function triggerCartAnimation() {
  const cartButton = document.querySelector('.cart-button');
  if (!cartButton) return;
  cartButton.classList.add('cart-animate');
  setTimeout(() => {
    cartButton.classList.remove('cart-animate');
  }, 500);
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
  const count = getCart().length;
  const countElem = document.getElementById("cart-count");
  if (countElem) countElem.textContent = count;
}

function handleAddToCart(event) {
  const card = event.target.closest(".product-card");
  const name = card.querySelector("h3").textContent;
  const description = card.querySelectorAll("p")[0].textContent;
  const price = card.querySelector(".price").textContent;
  const imageStyle = card.querySelector(".product-image").style.backgroundImage;
  const imageUrl = imageStyle.slice(5, -2);

  const cart = getCart();
  cart.push({ name, description, price, image: imageUrl });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  triggerCartAnimation();
  showCartNotification();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".add-to-cart").forEach(button =>
    button.addEventListener("click", handleAddToCart)
  );
  updateCartCount();
});
