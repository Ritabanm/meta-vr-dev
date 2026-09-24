import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

// --- Data for Planets ---
const PLANET_DATA = [
  {
    name: "Cyber-Mercury",
    color: 0x00f3ff,
    size: 0.6,
    distance: 4,
    speed: 0.8,
    desc: "A high-velocity metallic world rich in quantum superconductors.",
    radius: "4,879 km",
    type: "Quantum Metallic",
    life: "0.2%"
  },
  {
    name: "Neon-Venus",
    color: 0xff007f,
    size: 0.9,
    distance: 6.5,
    speed: 0.5,
    desc: "Shrouded in electric pink plasma clouds and bioluminescent storms.",
    radius: "12,104 km",
    type: "Plasma Atmosphere",
    life: "12.4%"
  },
  {
    name: "Terra Prime",
    color: 0x00ff9d,
    size: 1.1,
    distance: 9.5,
    speed: 0.35,
    desc: "A lush cyber-biome planet with holographic grid cities and crystalline oceans.",
    radius: "12,742 km",
    type: "Bio-Holographic",
    life: "99.8%"
  },
  {
    name: "Astra-Saturn",
    color: 0xffa500,
    size: 1.4,
    distance: 13.5,
    speed: 0.2,
    hasRings: true,
    desc: "Gilded gas giant surrounded by luminous particle rings and energy nodes.",
    radius: "58,232 km",
    type: "Luminous Gas Giant",
    life: "4.1%"
  },
  {
    name: "Azure-Neptune",
    color: 0x3a86ff,
    size: 1.2,
    distance: 17.5,
    speed: 0.12,
    desc: "An ultra-deep ice world radiating sub-zero blue photon currents.",
    radius: "24,622 km",
    type: "Sub-Zero Photonic",
    life: "8.7%"
  }
];

// --- Web Audio Synth Helper ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSynthSound(freq = 440, type = 'sine', duration = 0.2) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// --- App State & Three.js Init ---
let container, camera, scene, renderer, controls;
let raycaster, mouse;
let planets = [];
let planetGroup;
let selectedPlanet = null;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

init();

function init() {
  container = document.getElementById('canvas-container');

  // 1. Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070913, 0.02);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4, 18);

  // 3. Renderer with WebXR support
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // Add WebXR VR Button
  const vrButton = VRButton.createButton(renderer);
  document.getElementById('vr-btn-container').appendChild(vrButton);

  // Check WebXR availability
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      const statusText = document.getElementById('xr-status-text');
      if (supported) {
        statusText.innerText = 'Meta Quest VR Ready';
      } else {
        statusText.innerText = 'Desktop WebXR Mode';
      }
    });
  }

  // Dynamically set Quest URL banner to match current host/IP
  const questUrlEl = document.getElementById('quest-url');
  if (questUrlEl) {
    questUrlEl.innerText = window.location.href;
  }

  // 4. OrbitControls (Desktop)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 50;
  controls.minDistance = 2;

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffffff, 3.5, 100);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // 6. Build Celestial Bodies
  createSun();
  createStarfield();
  createPlanets();

  // 7. Raycasting setup
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // 8. Setup WebXR Controllers
  setupXRControllers();

  // 9. Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onPointerClick);
  document.getElementById('close-card-btn').addEventListener('click', () => {
    deselectPlanet();
  });

  // 10. Start Animation Loop (Must use setAnimationLoop for WebXR)
  renderer.setAnimationLoop(render);
}

// --- Create Central Sun ---
function createSun() {
  const sunGeo = new THREE.SphereGeometry(2, 64, 64);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    wireframe: false
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  // Sun Glow Corona
  const coronaGeo = new THREE.SphereGeometry(2.3, 32, 32);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.3,
    wireframe: true
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  sun.add(corona);

  // Store reference to animate rotation
  sun.userData = { isSun: true, corona };
}

// --- Create Background Starfield Particles ---
function createStarfield() {
  const starCount = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;

    colors[i] = 0.5 + Math.random() * 0.5;
    colors[i + 1] = 0.8 + Math.random() * 0.2;
    colors[i + 2] = 1.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const starfield = new THREE.Points(geometry, material);
  scene.add(starfield);
}

// --- Create Orbiting Planets ---
function createPlanets() {
  planetGroup = new THREE.Group();
  scene.add(planetGroup);

  PLANET_DATA.forEach((data) => {
    // Orbit line geometry
    const orbitGeo = new THREE.RingGeometry(data.distance - 0.03, data.distance + 0.03, 128);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    // Planet Mesh
    const geo = new THREE.SphereGeometry(data.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.3,
      metalness: 0.8,
      emissive: data.color,
      emissiveIntensity: 0.25
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.distance;

    // Optional Rings for Astra-Saturn
    if (data.hasRings) {
      const ringGeo = new THREE.RingGeometry(data.size * 1.4, data.size * 2.3, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        wireframe: true
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.5;
      mesh.add(ring);
    }

    // Attach metadata
    mesh.userData = {
      ...data,
      angle: Math.random() * Math.PI * 2
    };

    planets.push(mesh);
    planetGroup.add(mesh);
  });
}

// --- WebXR Controller Setup ---
function setupXRControllers() {
  const controllerModelFactory = new XRControllerModelFactory();

  // Controller 1
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('select', onXRSelect);
  scene.add(controller1);

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);

  // Controller 2
  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('select', onXRSelect);
  scene.add(controller2);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  scene.add(controllerGrip2);

  // Visual Controller Rays (Laser Pointer)
  const rayGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -5)
  ]);
  const rayMat = new THREE.LineBasicMaterial({ color: 0x00f3ff });

  controller1.add(new THREE.Line(rayGeo, rayMat));
  controller2.add(new THREE.Line(rayGeo, rayMat));
}

// --- Interaction Handlers ---
function onPointerClick(event) {
  // Prevent click registering if dragging controls
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    selectPlanet(intersects[0].object);
  }
}

function onXRSelect(event) {
  const controller = event.target;
  const tempMatrix = new THREE.Matrix4();
  tempMatrix.identity().extractRotation(controller.matrixWorld);

  const raycasterXR = new THREE.Raycaster();
  raycasterXR.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycasterXR.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const intersects = raycasterXR.intersectObjects(planets);
  if (intersects.length > 0) {
    selectPlanet(intersects[0].object);
  }
}

function selectPlanet(planetMesh) {
  selectedPlanet = planetMesh;
  const data = planetMesh.userData;

  // Play interactive synth sound
  playSynthSound(587.33, 'triangle', 0.3); // D5 note

  // Update UI Card
  document.getElementById('planet-name').innerText = data.name;
  document.getElementById('planet-desc').innerText = data.desc;
  document.getElementById('stat-radius').innerText = data.radius;
  document.getElementById('stat-type').innerText = data.type;
  document.getElementById('stat-life').innerText = data.life;
  document.getElementById('planet-card').classList.remove('hidden');

  // Highlight planet visually
  planets.forEach(p => {
    p.material.emissiveIntensity = 0.25;
  });
  planetMesh.material.emissiveIntensity = 0.9;
}

function deselectPlanet() {
  if (selectedPlanet) {
    selectedPlanet.material.emissiveIntensity = 0.25;
    selectedPlanet = null;
  }
  document.getElementById('planet-card').classList.add('hidden');
}

// --- Window Resize ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Main Render & Animation Loop ---
function render(time) {
  const delta = 0.01;

  // Orbit Planets around the Sun
  planets.forEach(mesh => {
    if (selectedPlanet !== mesh) {
      mesh.userData.angle += delta * mesh.userData.speed;
      mesh.position.x = Math.cos(mesh.userData.angle) * mesh.userData.distance;
      mesh.position.z = Math.sin(mesh.userData.angle) * mesh.userData.distance;
    }
    mesh.rotation.y += 0.01;
  });

  // Rotate Sun Corona
  scene.children.forEach(child => {
    if (child.userData && child.userData.isSun) {
      child.userData.corona.rotation.y += 0.005;
      child.userData.corona.rotation.z += 0.003;
    }
  });

  // Update OrbitControls for Desktop
  if (!renderer.xr.isPresenting) {
    controls.update();
  }

  renderer.render(scene, camera);
}
