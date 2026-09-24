# 🥽 Meta VR Dev - WebXR Monorepo

> A high-performance, AI-augmented WebXR development repository built for **Meta Quest 3**, **Horizon OS**, and **Desktop WebXR** environments using **Three.js** and **`metavr` MCP**.

[![WebXR](https://img.shields.io/badge/WebXR-Meta_Quest_3-00f3ff?style=for-the-badge&logo=meta)](https://wearables.developer.meta.com/docs/develop/webapps/build/)
[![Three.js](https://img.shields.io/badge/Three.js-v0.170.0-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-v6.4.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![npm Workspaces](https://img.shields.io/badge/Monorepo-npm_workspaces-red?style=for-the-badge&logo=npm)](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

---

## 📂 Repository Architecture

This workspace is structured as an **npm Workspaces Monorepo**:

```text
meta-vr-dev/
├── package.json               # Root monorepo workspace configuration
├── .gitignore                 # Workspace git exclusion rules
├── apps/
│   └── cosmic-gallery/        # 🌌 WebXR 3D Cosmic Gallery Application
│       ├── index.html         # Main WebXR container & overlay UI
│       ├── package.json       # App-specific dependencies
│       └── src/
│           ├── main.js        # Three.js 3D engine, orbital physics & WebXR loop
│           └── style.css      # Glassmorphism & Cyberpunk aesthetic styling
└── packages/                  # Directory for shared XR utilities & components
```

---

## 🌌 Applications

### 🪐 `cosmic-gallery` (`apps/cosmic-gallery`)
An interactive 3D WebXR space visualization built for desktop preview and native Meta Quest 3 VR sessions.

* **Three.js 3D Celestial Engine**: Orbiting glowing planets with dynamic lighting, coronal sun aura, and a 2,000-particle starfield.
* **Interactive Data Holograms**: Click planets (or raycast in VR) to open real-time telemetry panels and trigger Web Audio synth tones.
* **Dual Rendering Mode**:
  * **Desktop**: Full 3D `OrbitControls` mouse navigation with glassmorphic overlay UI.
  * **Meta Quest 3 VR**: Native 6DoF stereo rendering, controller laser pointer raycasters, and one-tap **ENTER VR** button.

---

## ⚡ Quickstart & Development

### 1. Prerequisites
* **Node.js**: `v20.x` or later
* **npm**: `v10.x` or later

### 2. Install Dependencies
Run from the root of the monorepo:
```bash
npm install
```

### 3. Run Development Server
Start the Vite dev server across your local network:
```bash
npm run dev
```

The server will output local and network addresses:
```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.200.3:5173/
```

### 4. Build for Production
To generate static distribution bundles:
```bash
npm run build
```

---

## 🥽 Running on Meta Quest 3

### **Option A: Local Network (Quest Browser)**
1. Connect your Meta Quest 3 to the same Wi-Fi network as your host computer.
2. Open the **Meta Quest Browser**.
3. Navigate to `http://<YOUR_LOCAL_IP>:5173` (e.g. `http://192.168.200.3:5173`).
4. Click **ENTER VR**.

### **Option B: Auto-Launch via `metavr` MCP**
If your Quest 3 is connected via USB-C or Wireless ADB:
```bash
metavr device open-url http://192.168.200.3:5173
```
*(Or prompt Antigravity AI: "Launch the app on my Quest").*

### **Option C: Meta XR Simulator (`xrsim`)**
Simulate Quest 3 tracking, controllers, and environments directly on your Mac without physical hardware:
```bash
metavr tools install xrsim
metavr xrsim app launch
```

---

## 📘 Reference Documentation
* [Meta Wearables WebApps Build Guide](https://wearables.developer.meta.com/docs/develop/webapps/build/)
* [Three.js WebXR Documentation](https://threejs.org/docs/#api/en/renderers/webxr/WebXRManager)
* [Meta VR CLI & MCP Integration](https://developers.meta.com/horizon/documentation/web/webxr-first-steps)

---

## 📄 License
MIT License
