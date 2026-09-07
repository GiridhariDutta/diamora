import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import ring1Url from '../assets/models/ring_ornament_1.glb?url';
import ring2Url from '../assets/models/dymond-model2.glb?url';
import ring3Url from '../assets/models/ring_ornament_3.glb?url';

export default function Ring3DCanvas() {
  const mountRef = useRef(null);
  const ringGroupRef = useRef(null);
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({
    scale: 1,
    opacity: 1,
    transition: 'none'
  });

  // Model files list from 66-ring ornament: Calibrated model scales & rotations
  const modelConfigs = [
    {
      id: 'ring_shader_pos1',
      name: 'ORNAMENT POS 1',
      url: ring1Url,
      explicitScale: 0.38, // Model 1: Completely UNCHANGED
      positionY: -0.18,
      rawRotation: [0, Math.PI / 2, 0]
    },
    {
      id: 'vers4_men_design',
      name: 'ETERNITY DESIGN 2',
      url: ring2Url,
      explicitScale: 0.10,
      positionY: -0.18,
      rawRotation: [0, 0, 0], // Flat base horizontal plane
      tiltRotation: [0.52, 0, 0.28], // Earth-like 28° diagonal axial tilt as shown in screenshot
      isEarthSpin: true
    },
    {
      id: 'ring3_design',
      name: 'RING 3 DESIGN',
      url: ring3Url,
      explicitScale: 0.09, // Model 3: Calibrated scale to match Model 1 & 2 proportion
      positionY: -0.18,
      rawRotation: [-Math.PI / 2, 0, Math.PI / 2] // Standing vertically upright facing camera with crown stone at top
    }
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 280;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup — Positioned for clean framing of gold ring models
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0, 0.25, 7.4);
    camera.lookAt(0, -0.15, 0);

    // 3. High-Performance WebGL Renderer Setup (Optimized for 60FPS Mobile & Desktop)
    const isMobile = typeof window !== 'undefined' && 
      (/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile, // On mobile, high-DPI displays do not need heavy multi-sample antialiasing
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.35) : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 4. HDRI Studio Environment & Dominant Top-Right Theatrical Stage Spotlight
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment(renderer);
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 1. Dominant Top-Right Theatrical Stage Spotlight (Directional light cone targeting ring center directly)
    const stageSpotLight = new THREE.SpotLight(0xfff8fa, 26.0, 35, Math.PI / 3.8, 0.65, 1.0);
    stageSpotLight.position.set(5.2, 7.2, 4.2);
    stageSpotLight.target.position.set(0, -0.18, 0);
    stageSpotLight.castShadow = true;
    stageSpotLight.shadow.mapSize.width = 1024;
    stageSpotLight.shadow.mapSize.height = 1024;
    stageSpotLight.shadow.bias = -0.0001;
    scene.add(stageSpotLight);
    scene.add(stageSpotLight.target);

    // Top-right razor-sharp key directional light for specular metal ribbons & diamond fire
    const stageKeyLight = new THREE.DirectionalLight(0xfffaee, 5.5);
    stageKeyLight.position.set(6.0, 8.0, 5.0);
    stageKeyLight.castShadow = true;
    scene.add(stageKeyLight);

    // Top-right elevated point light focused on the illuminated diamond crown & right facet shoulder
    const diamondGlintLight = new THREE.PointLight(0xffffff, 8.5, 12);
    diamondGlintLight.position.set(3.2, 4.2, 2.8);
    scene.add(diamondGlintLight);

    // 2. Soft, Dim Ambient & Opposite Shadow Falloff
    // Reduced ambient lighting so shadow side has real falloff depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);

    // Opposite-side (left/bottom) very soft dark shadow rim light to keep silhouette visible
    const shadowRimLight = new THREE.DirectionalLight(0x182030, 0.35);
    shadowRimLight.position.set(-6.5, -2.5, -4.0);
    scene.add(shadowRimLight);

    // Clear previous DOM
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 5. OrbitControls for smooth continuous turntable Y-axis auto-spin
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.5;
    controlsRef.current = controls;

    // 6. Outer 3D Group
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroupRef.current = ringGroup;

    // Cache preprocessed 3D pivot nodes for instant 5-second switching
    const loadedPivots = {};
    const loader = new GLTFLoader();

    // Helper to generate a crisp, high-definition diamond star-flare texture with prismatic fire & spectral dispersion
    const createDiamondFlareTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // 1. Radiant central pinpoint core with spectral rainbow dispersion
      const radial = ctx.createRadialGradient(64, 64, 0, 64, 64, 28);
      radial.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      radial.addColorStop(0.15, 'rgba(255, 250, 235, 0.95)');
      radial.addColorStop(0.35, 'rgba(180, 235, 255, 0.55)'); // Prismatic cyan fire
      radial.addColorStop(0.6, 'rgba(255, 200, 245, 0.25)');  // Prismatic magenta fire
      radial.addColorStop(0.85, 'rgba(255, 240, 180, 0.12)'); // Warm gold reflection
      radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, 128, 128);

      // 2. Anamorphic wide horizontal needle ray
      const gradH = ctx.createLinearGradient(0, 64, 128, 64);
      gradH.addColorStop(0, 'rgba(140, 210, 255, 0)');
      gradH.addColorStop(0.35, 'rgba(180, 240, 255, 0.75)');
      gradH.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
      gradH.addColorStop(0.65, 'rgba(255, 220, 190, 0.75)');
      gradH.addColorStop(1, 'rgba(255, 230, 150, 0)');
      ctx.fillStyle = gradH;
      ctx.fillRect(0, 62.5, 128, 3);

      // 3. Razor-sharp vertical needle ray
      const gradV = ctx.createLinearGradient(64, 0, 64, 128);
      gradV.addColorStop(0, 'rgba(255, 200, 240, 0)');
      gradV.addColorStop(0.35, 'rgba(255, 235, 180, 0.75)');
      gradV.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
      gradV.addColorStop(0.65, 'rgba(150, 220, 255, 0.75)');
      gradV.addColorStop(1, 'rgba(170, 190, 255, 0)');
      ctx.fillStyle = gradV;
      ctx.fillRect(62.5, 0, 3, 128);

      // 4. Delicate 45-degree diagonal needle rays (8-point starburst)
      ctx.save();
      ctx.translate(64, 64);
      ctx.rotate(Math.PI / 4);
      const gradD1 = ctx.createLinearGradient(-36, 0, 36, 0);
      gradD1.addColorStop(0, 'rgba(160, 235, 255, 0)');
      gradD1.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      gradD1.addColorStop(1, 'rgba(255, 210, 245, 0)');
      ctx.fillStyle = gradD1;
      ctx.fillRect(-36, -1.2, 72, 2.4);

      const gradD2 = ctx.createLinearGradient(0, -36, 0, 36);
      gradD2.addColorStop(0, 'rgba(255, 230, 180, 0)');
      gradD2.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      gradD2.addColorStop(1, 'rgba(160, 220, 255, 0)');
      ctx.fillStyle = gradD2;
      ctx.fillRect(-1.2, -36, 2.4, 72);
      ctx.restore();

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Helper to generate a soft, luminous diamond optical glow bloom halo texture
    const createDiamondGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      const radial = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      radial.addColorStop(0.2, 'rgba(255, 245, 215, 0.75)');
      radial.addColorStop(0.45, 'rgba(240, 215, 140, 0.40)'); // Warm luxury gold aura
      radial.addColorStop(0.7, 'rgba(180, 225, 255, 0.15)');  // Subtle diamond blue rim
      radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Cache textures for performance across all models
    const diamondFlareTexture = createDiamondFlareTexture();
    const diamondGlowTexture = createDiamondGlowTexture();

    // Helper to process GLB model geometry
    const processGltfModel = (gltf, config) => {
      const rawModel = gltf.scene;

      // 1. Ultra-Realistic Crystal Diamond Material (High Dispersion Rainbow Fire & Iridescence)
      const diamondMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        transmission: 0.95,                // 95% crystal clarity
        thickness: 1.4,                    // Deep facet refraction depth
        ior: 2.417,                        // Diamond Index of Refraction
        roughness: 0.0,                    // Zero roughness for razor-sharp facets
        metalness: 0.0,
        reflectivity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        specularIntensity: 18.0,           // Razor-sharp brilliant specular glints
        specularColor: new THREE.Color(0xffffff),
        dispersion: 0.85,                  // Prismatic rainbow spectrum dispersion fire glints
        iridescence: 0.45,                 // Rainbow optical thin-film interference fire
        iridescenceIOR: 1.33,
        iridescenceThicknessRange: [100, 400],
        envMapIntensity: 16.0,             // Calibrated studio reflections for high spotlight contrast
        side: THREE.FrontSide,             // FrontSide for clear crystal refractive definition
        transparent: true,
        opacity: 1.0,
        depthWrite: true                   // Prevents transparency clipping and sorting anomalies
      });

      // 2. High-Luxury 18K Polish Gold Material for Warm Gold Rings
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xefc85a),   // Authentic Warm 18K Luxury Gold
        metalness: 0.98,                    // High metallic reflectivity
        roughness: 0.08,                    // Ultra-smooth mirror polish for jewelers
        envMapIntensity: 4.0,               // Calibrated reflections for dramatic shadow falloff
        vertexColors: true,                 // Supports inner surface occlusion
        side: THREE.DoubleSide
      });

      // 3. High-Contrast Mirror-Polished Platinum / White Gold with Smooth Inner Occlusion
      const whiteGoldMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd0d5e0),   // High-definition Platinum tone
        metalness: 0.98,                    // Authentic metallic definition
        roughness: 0.12,                    // Balanced silky mirror polish
        envMapIntensity: 3.5,               // Controlled reflections allowing rich dark shadow side
        vertexColors: true,                 // Smooth vertex-color inner band occlusion gradient
        side: THREE.DoubleSide
      });

      // 4. Natural Lighter Silver-Platinum Material for Diamond Mounting Prongs, Basket & Settings
      const settingMetalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xa8b2c2),   // Natural, clean lighter silver-platinum tone
        metalness: 0.98,                    // High-polish metallic definition
        roughness: 0.14,                    // Silky mirror-like metallic polish
        envMapIntensity: 3.5,               // Controlled natural specular studio reflection
        vertexColors: true,
        side: THREE.DoubleSide
      });

      // Clean CAD export degenerate spike vertices in rawModel sub-meshes (removes inner hole spike)
      rawModel.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.attributes.position) {
          const posAttr = child.geometry.attributes.position;
          let cleaned = false;
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const z = posAttr.getZ(i);
            if (Math.abs(x) < 0.15 && Math.abs(y) < 0.15 && Math.abs(z) < 2.0) {
              const neighborIdx = (i > 0) ? (i - 1) : (i + 1);
              posAttr.setXYZ(i, posAttr.getX(neighborIdx), posAttr.getY(neighborIdx), posAttr.getZ(neighborIdx));
              cleaned = true;
            }
          }
          if (cleaned) {
            posAttr.needsUpdate = true;
            child.geometry.computeVertexNormals();
          }
        }
      });

      // Find and collect all diamond meshes and assign materials
      const diamondMeshes = [];
      let meshIdx = 0;
      rawModel.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundingBox();
          const box = child.geometry.boundingBox;
          const nameLower = (child.name || '').toLowerCase();
          const matName = (child.material && child.material.name ? child.material.name : '').toLowerCase();

          let isDiamondStone = false;
          let isSettingProng = false;

          if (config.id === 'ring_shader_pos1') {
            isDiamondStone = (box && box.min.y > 3.0);
          } else if (config.id === 'ring3_design') {
            isDiamondStone = (meshIdx >= 6 && meshIdx <= 25) || 
                             (meshIdx >= 30 && meshIdx <= 49) || 
                             (meshIdx === 51);
            // 6 cathedral prongs (0-5), collet basket (52) & gallery support (53)
            isSettingProng = (meshIdx >= 0 && meshIdx <= 5) || (meshIdx === 52) || (meshIdx === 53);
          } else if (config.id === 'vers4_men_design') {
            isDiamondStone = nameLower.includes('diamond') || nameLower.includes('round') || nameLower.includes('gem');
            // 20 main top prong claw settings (empty_4 to empty_23) and side pave prongs (Belprongs)
            isSettingProng = (nameLower.startsWith('empty_') && nameLower !== 'empty_3') || 
                             nameLower.includes('prong') || 
                             nameLower.includes('setting');
          } else {
            isDiamondStone = matName.includes('diamond') || 
                             nameLower.includes('diamond') || 
                             nameLower.includes('gem');
          }

          if (isDiamondStone) {
            child.material = diamondMaterial;
            diamondMeshes.push(child);
          } else if (isSettingProng) {
            child.material = settingMetalMaterial;
          } else {
            child.material = whiteGoldMaterial;
          }

          child.castShadow = true;
          child.receiveShadow = true;
          meshIdx++;
        }
      });

      // 1. Set rawModel base rotation FIRST
      if (config.rawRotation) {
        rawModel.rotation.set(config.rawRotation[0], config.rawRotation[1], config.rawRotation[2]);
      } else {
        rawModel.rotation.set(0, Math.PI / 2, 0);
      }
      rawModel.updateMatrixWorld(true);

      // 2. Compute bounding box AFTER base rotation so model is centered 100% perfectly in 3D world space
      const box = new THREE.Box3().setFromObject(rawModel);
      const center = new THREE.Vector3();
      box.getCenter(center);

      if (isFinite(center.x)) rawModel.position.x = -center.x;
      if (isFinite(center.y)) rawModel.position.y = -center.y;
      if (isFinite(center.z)) rawModel.position.z = -center.z;
      rawModel.updateMatrixWorld(true);

      // Apply subtle natural inward surface occlusion and diamond setting shading on metal meshes
      rawModel.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.attributes.position && child.geometry.attributes.normal) {
          if (child.material !== diamondMaterial) {
            const pos = child.geometry.attributes.position;
            const norm = child.geometry.attributes.normal;
            const colors = [];
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld);

            for (let i = 0; i < pos.count; i++) {
              const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
              child.localToWorld(v);
              const n = new THREE.Vector3(norm.getX(i), norm.getY(i), norm.getZ(i));
              n.applyMatrix3(normalMatrix).normalize();

              // Directional spotlight alignment vector (pointing from top-right +X, +Y, +Z toward center)
              const spotlightDir = new THREE.Vector3(0.58, 0.72, 0.38).normalize();
              const lightAlignment = n.dot(spotlightDir); // -1 (in shadow) to +1 (facing spotlight)

              // Radial alignment in YZ plane relative to the central X axis of the ring
              const rLen = Math.sqrt(v.y * v.y + v.z * v.z);
              let dot = 1.0;
              if (rLen > 0.1) {
                const ry = v.y / rLen;
                const rz = v.z / rLen;
                dot = ry * n.y + rz * n.z; // +1 if facing outward, -1 if facing inward towards the hole
              }

              // Inward surface darkening gradient
              let factor = 1.0;
              if (dot < 0.2) {
                const t = Math.max(0, Math.min(1, (0.2 - dot) / 0.6));
                factor = 1.0 - t * 0.40;
              }

              // Directional Top-Right Spotlight Shading:
              // Surfaces facing top-right spotlight receive bright highlight boost (up to 1.25)
              // Surfaces facing bottom-left / shadow side drop down to (0.42) for crisp shadow falloff!
              if (lightAlignment > 0.1) {
                const highlight = Math.min(1.0, (lightAlignment - 0.1) / 0.9);
                factor *= (1.0 + highlight * 0.28);
              } else {
                const shadow = Math.min(1.0, (0.1 - lightAlignment) / 1.1);
                factor *= (1.0 - shadow * 0.55);
              }

              // For Model 1 prongs near diamond crown, add subtle darkening for setting contrast
              if (config.id === 'ring_shader_pos1' && pos.getY(i) >= 2.2) {
                const prongDarken = Math.min(1.0, (pos.getY(i) - 2.2) / 1.0);
                factor *= (1.0 - prongDarken * 0.25);
              }

              colors.push(factor, factor, factor);
            }

            child.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
          }
        }
      });

      // 3. Anchor High-End Diamond Star-Flares and Soft Glow Halos across ALL Models
      const sparklesList = [];

      // Collect calibrated sparkle/flare points for each model type
      const flarePoints = [];

      if (config.id === 'ring_shader_pos1') {
        // Model 1 (Solitaire Gold Ring): Multi-facet crown table & bevel flare points
        flarePoints.push(
          // Center Solitaire Crown Table Facet (Primary Star-Flare)
          { pos: new THREE.Vector3(0.44, 3.82, 0.0), phase: 0.0, scale: 0.78, isGlow: false, maxOpacity: 0.95 },
          // Soft Luminous Glow Halo behind Primary Crown Flare
          { pos: new THREE.Vector3(0.44, 3.82, 0.0), phase: 0.0, scale: 1.25, isGlow: true, maxOpacity: 0.82 },
          // Side Upper Girdle Facet 1
          { pos: new THREE.Vector3(-0.25, 3.78, 0.35), phase: (Math.PI * 2) / 3, scale: 0.65, isGlow: false, maxOpacity: 0.90 },
          { pos: new THREE.Vector3(-0.25, 3.78, 0.35), phase: (Math.PI * 2) / 3, scale: 0.95, isGlow: true, maxOpacity: 0.75 },
          // Side Upper Girdle Facet 2
          { pos: new THREE.Vector3(-0.25, 3.78, -0.35), phase: (Math.PI * 4) / 3, scale: 0.65, isGlow: false, maxOpacity: 0.90 },
          { pos: new THREE.Vector3(-0.25, 3.78, -0.35), phase: (Math.PI * 4) / 3, scale: 0.95, isGlow: true, maxOpacity: 0.75 },
          // Girdle Facets 3 & 4
          { pos: new THREE.Vector3(0.80, 3.75, 0.28), phase: Math.PI * 0.4, scale: 0.58, isGlow: false, maxOpacity: 0.85 },
          { pos: new THREE.Vector3(0.80, 3.75, -0.28), phase: Math.PI * 1.2, scale: 0.58, isGlow: false, maxOpacity: 0.85 },
          // Crown Corner Glints
          { pos: new THREE.Vector3(0.22, 3.84, 0.38), phase: Math.PI * 0.5, scale: 0.55, isGlow: false, maxOpacity: 0.85 },
          { pos: new THREE.Vector3(0.22, 3.84, -0.38), phase: Math.PI * 1.5, scale: 0.55, isGlow: false, maxOpacity: 0.85 }
        );
      } else if (config.id === 'vers4_men_design') {
        // Model 2 (Eternity Band / Men's Ring): Diamonds arrayed around ring band
        const bandRadius = 8.8;
        const totalTopPoints = 16;
        for (let i = 0; i < totalTopPoints; i++) {
          const theta = (i / totalTopPoints) * Math.PI * 2;
          const x = Math.cos(theta) * bandRadius;
          const z = Math.sin(theta) * bandRadius;
          
          flarePoints.push({
            pos: new THREE.Vector3(x, 2.85, z),
            phase: theta,
            scale: 2.8,
            isGlow: false,
            angleOnBand: theta,
            useWorldAngle: true,
            maxOpacity: 0.95
          });

          // Soft glow bloom halo on cardinal facet nodes
          if (i % 3 === 0) {
            flarePoints.push({
              pos: new THREE.Vector3(x, 2.85, z),
              phase: theta,
              scale: 4.2,
              isGlow: true,
              angleOnBand: theta,
              useWorldAngle: true,
              maxOpacity: 0.80
            });
          }
        }

        // Bottom channel accent glints (8 points)
        for (let j = 0; j < 8; j++) {
          const bTheta = (j / 8) * Math.PI * 2 + Math.PI / 8;
          const bx = Math.cos(bTheta) * bandRadius;
          const bz = Math.sin(bTheta) * bandRadius;
          flarePoints.push({
            pos: new THREE.Vector3(bx, -2.85, bz),
            phase: bTheta + Math.PI,
            scale: 2.4,
            isGlow: false,
            angleOnBand: bTheta,
            useWorldAngle: true,
            maxOpacity: 0.85
          });
        }
      } else if (config.id === 'ring3_design') {
        // Model 3 (Three-stone / Crown Solitaire): Top solitaire crown + all 40 shank pavé diamonds
        // 1. Center Solitaire Crown Diamond (Large primary star-flare + glow halo)
        flarePoints.push(
          { pos: new THREE.Vector3(0.0, 0.0, 15.48), phase: 0.0, scale: 3.2, isGlow: false, maxOpacity: 0.95 },
          { pos: new THREE.Vector3(0.0, 0.0, 15.48), phase: 0.0, scale: 4.8, isGlow: true, maxOpacity: 0.85 },
          { pos: new THREE.Vector3(0.85, 0.85, 15.35), phase: (Math.PI * 2) / 3, scale: 2.5, isGlow: false, maxOpacity: 0.90 },
          { pos: new THREE.Vector3(0.85, 0.85, 15.35), phase: (Math.PI * 2) / 3, scale: 3.6, isGlow: true, maxOpacity: 0.75 },
          { pos: new THREE.Vector3(-0.85, -0.85, 15.35), phase: (Math.PI * 4) / 3, scale: 2.5, isGlow: false, maxOpacity: 0.90 },
          { pos: new THREE.Vector3(-0.85, -0.85, 15.35), phase: (Math.PI * 4) / 3, scale: 3.6, isGlow: true, maxOpacity: 0.75 },
          { pos: new THREE.Vector3(-0.85, 0.85, 15.35), phase: Math.PI * 0.5, scale: 2.5, isGlow: false, maxOpacity: 0.85 },
          { pos: new THREE.Vector3(0.85, -0.85, 15.35), phase: Math.PI * 1.5, scale: 2.5, isGlow: false, maxOpacity: 0.85 }
        );

        // 2. Automatically compute exact 3D coordinates for ALL 40 pavé diamonds along the two shank rows!
        rawModel.updateMatrixWorld(true);
        diamondMeshes.forEach((dMesh, dIdx) => {
          if (dMesh.geometry) {
            dMesh.geometry.computeBoundingBox();
            const b = dMesh.geometry.boundingBox;
            const center = new THREE.Vector3();
            b.getCenter(center);

            // Transform center from mesh local coordinates into rawModel space
            const worldCenter = center.clone();
            dMesh.localToWorld(worldCenter);
            const localPos = worldCenter.clone();
            rawModel.worldToLocal(localPos);

            // If it's one of the 40 shank pavé diamonds (z < 14.2)
            if (localPos.z < 14.2) {
              // Arc angle along the ring circle for world-aligned light catching
              const angleOnBand = Math.atan2(localPos.z, localPos.x);
              const phase = dIdx * 0.45;

              flarePoints.push({
                pos: localPos,
                phase: phase,
                scale: 1.55, // Crisp, delicate sparkling starburst for individual pavé diamond
                isGlow: false,
                angleOnBand: angleOnBand,
                useWorldAngle: true,
                maxOpacity: 0.92
              });

              // Subtle glow aura on every 3rd pavé diamond for depth
              if (dIdx % 3 === 0) {
                flarePoints.push({
                  pos: localPos,
                  phase: phase,
                  scale: 2.4,
                  isGlow: true,
                  angleOnBand: angleOnBand,
                  useWorldAngle: true,
                  maxOpacity: 0.72
                });
              }
            }
          }
        });
      }

      const GLOBAL_SCALE_FACTOR = 1.28;
      flarePoints.forEach((fp, idx) => {
        const spriteMaterial = new THREE.SpriteMaterial({
          map: fp.isGlow ? diamondGlowTexture : diamondFlareTexture,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.0,
          depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(fp.pos);

        const finalScale = fp.scale * GLOBAL_SCALE_FACTOR;
        sprite.scale.set(finalScale, finalScale, 1.0);
        sprite.userData.baseScale = finalScale;
        sprite.userData.phase = fp.phase;
        sprite.userData.isGlow = fp.isGlow;
        sprite.userData.maxOpacity = fp.maxOpacity || 0.95;
        sprite.userData.angleOnBand = fp.angleOnBand;
        sprite.userData.useWorldAngle = !!fp.useWorldAngle;
        sprite.userData.facetIndex = idx;

        rawModel.add(sprite);
        sparklesList.push(sprite);
      });

      const modelPivot = new THREE.Group();
      modelPivot.add(rawModel);
      modelPivot.position.y = config.positionY || -0.18;

      if (config.isEarthSpin && config.tiltRotation) {
        // Planetary axial tilt (28° diagonal tilt like Earth)
        modelPivot.rotation.set(config.tiltRotation[0], config.tiltRotation[1], config.tiltRotation[2]);
        modelPivot.userData.isEarthSpin = true;
        modelPivot.userData.rawModel = rawModel;
      } else {
        modelPivot.rotation.x = 0.32;
        modelPivot.rotation.z = -0.08;
      }

      // Set explicit scale directly with shared +12-15% global scale factor applied equally to all models
      const scaleVal = (config.explicitScale || 0.35) * GLOBAL_SCALE_FACTOR;
      modelPivot.scale.set(scaleVal, scaleVal, scaleVal);

      if (sparklesList.length > 0) {
        modelPivot.userData.sparkles = sparklesList;
      }

      return modelPivot;
    };

    let currentIndex = 0;
    const isHoveredRef = { current: false };
    const isDraggingRef = { current: false };
    const isTransitioningRef = { current: false };
    let switchTimer = null;
    let transitionTimer = null;

    // Show model in scene
    const displayPivot = (index) => {
      if (!ringGroupRef.current) return;

      // Clear existing models in ringGroup
      while (ringGroupRef.current.children.length > 0) {
        ringGroupRef.current.remove(ringGroupRef.current.children[0]);
      }

      const pivot = loadedPivots[index];
      if (pivot) {
        ringGroupRef.current.add(pivot);
      }
      currentIndex = index;
      setActiveModelIndex(index);
    };

    // Cycle to next model in sequence with smooth, luxurious Zoom / Scale Transition (~1.0s total)
    const switchToNextModel = () => {
      if (isHoveredRef.current || isDraggingRef.current || isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      const nextIndex = (currentIndex + 1) % modelConfigs.length;

      // Phase 1: Slow, gentle zoom out & fade out current model (scale 1 -> 0.1, opacity 1 -> 0) over 0.5s (500ms)
      setZoomStyle({
        scale: 0.1,
        opacity: 0,
        transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'
      });

      transitionTimer = setTimeout(() => {
        // Phase 2: Swap 3D model at midpoint while invisible & scaled down
        if (loadedPivots[nextIndex]) {
          displayPivot(nextIndex);
        } else {
          loader.load(
            modelConfigs[nextIndex].url,
            (gltf) => {
              const pivot = processGltfModel(gltf, modelConfigs[nextIndex]);
              loadedPivots[nextIndex] = pivot;
              displayPivot(nextIndex);
            },
            undefined,
            (err) => {
              console.warn(`Error loading model ${nextIndex}, skipping:`, err);
              displayPivot((nextIndex + 1) % modelConfigs.length);
            }
          );
        }

        // Instantly position incoming model at small scale (without animation)
        setZoomStyle({
          scale: 0.1,
          opacity: 0,
          transition: 'none'
        });

        // Phase 3: Slow, gentle zoom in & fade in incoming model (scale 0.1 -> 1, opacity 0 -> 1) over 0.5s (500ms)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setZoomStyle({
              scale: 1,
              opacity: 1,
              transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'
            });
          });
        });

        // Complete transition lifecycle after Phase 3 finishes (500ms after midpoint)
        transitionTimer = setTimeout(() => {
          isTransitioningRef.current = false;
          // Schedule next transition after full 5-second viewing pause
          if (!isHoveredRef.current && !isDraggingRef.current) {
            scheduleNextSwitch(5000);
          }
        }, 500);
      }, 500);
    };

    // Schedule next switch with specified delay (default 5 seconds)
    const scheduleNextSwitch = (delay = 5000) => {
      clearSwitchTimer();
      switchTimer = setTimeout(() => {
        switchToNextModel();
      }, delay);
    };

    // Clear both interval switch timer and in-flight transition timer
    const clearSwitchTimer = () => {
      if (switchTimer) {
        clearTimeout(switchTimer);
        switchTimer = null;
      }
      if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
      }
    };

    // Preload ALL models simultaneously on mount
    modelConfigs.forEach((cfg, idx) => {
      loader.load(
        cfg.url,
        (gltf) => {
          const pivot = processGltfModel(gltf, cfg);
          loadedPivots[idx] = pivot;
          if (idx === 0) {
            displayPivot(0);
            setLoading(false);
          }
        },
        undefined,
        (err) => console.warn(`Error loading model ${idx}:`, err)
      );
    });

    // Start initial 5-second cycle loop
    scheduleNextSwitch(5000);

    // Interaction Event Handlers: Pause 5s cycling and auto-spin during hover / manual rotation
    const handlePointerEnter = () => {
      isHoveredRef.current = true;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }
      clearSwitchTimer();
    };

    const handlePointerLeave = () => {
      isHoveredRef.current = false;
      if (!isDraggingRef.current) {
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true;
        }
        scheduleNextSwitch(5000);
      }
    };

    const handlePointerDown = () => {
      isDraggingRef.current = true;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }
      clearSwitchTimer();
    };

    const handleWindowPointerUp = () => {
      isDraggingRef.current = false;
      if (!isHoveredRef.current) {
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true;
        }
        scheduleNextSwitch(5000);
      }
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handleWindowPointerUp);

    // Also hook OrbitControls events
    controls.addEventListener('start', () => {
      isDraggingRef.current = true;
      controls.autoRotate = false;
      clearSwitchTimer();
    });

    controls.addEventListener('end', () => {
      isDraggingRef.current = false;
      if (!isHoveredRef.current) {
        controls.autoRotate = true;
        scheduleNextSwitch(5000);
      }
    });

    // 8. Render Loop with Animated Diamond Star-Flare Sparkle Shimmer & Earth-like Spin
    let animationFrameId;
    let animTime = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      animTime += 0.022; // Smooth, natural scintillating diamond fire progression
      
      const activePivot = loadedPivots[currentIndex];

      // Earth-like spin on its own tilted polar axis for Model 2 (Ultra-slow luxury showcase spin)
      if (activePivot && activePivot.userData.isEarthSpin && activePivot.userData.rawModel) {
        if (!isDraggingRef.current && !isHoveredRef.current) {
          activePivot.userData.rawModel.rotation.y += 0.0035;
        }
        if (controlsRef.current) {
          controlsRef.current.autoRotate = false; // Steady camera for pure Earth-like planetary spin
        }
      } else if (controlsRef.current && !isDraggingRef.current && !isHoveredRef.current) {
        controlsRef.current.autoRotate = true; // Regular turntable spin for Models 1 & 3
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Animate dynamic diamond star-flares and soft glow halos across all 3D models
      if (activePivot && activePivot.userData.sparkles) {
        const isEarthModel = !!(activePivot.userData.isEarthSpin && activePivot.userData.rawModel);
        const currentRot = isEarthModel
          ? activePivot.userData.rawModel.rotation.y
          : (controlsRef.current ? controlsRef.current.getAzimuthalAngle() : 0);

        activePivot.userData.sparkles.forEach((sprite) => {
          const phase = sprite.userData.phase || 0;
          const baseScale = sprite.userData.baseScale || 0.3;
          const isGlow = sprite.userData.isGlow;
          const maxOpacity = sprite.userData.maxOpacity || 0.95;

          if (sprite.userData.useWorldAngle && sprite.userData.angleOnBand !== undefined) {
            // For circular eternity band diamonds: flash brightly as each diamond rotates into the top-right light beam
            const netAngle = currentRot + sprite.userData.angleOnBand;
            const beamAlignment = Math.cos(netAngle - Math.PI / 4.0);
            const microTwinkle = Math.sin(animTime * 2.8 + sprite.userData.angleOnBand * 4.0);
            const rawVal = Math.max(0, beamAlignment * 0.75 + microTwinkle * 0.25);

            if (isGlow) {
              const pulse = Math.pow(rawVal, 1.8);
              sprite.material.opacity = pulse * maxOpacity;
              const currentScale = baseScale * (0.85 + pulse * 0.30);
              sprite.scale.set(currentScale, currentScale, 1.0);
            } else {
              const pulse = Math.pow(rawVal, 2.2);
              sprite.material.opacity = pulse * maxOpacity;
              const currentScale = baseScale * (0.80 + pulse * 0.40);
              sprite.scale.set(currentScale, currentScale, 1.0);
              sprite.rotation.z = animTime * 0.22 + phase;
            }
          } else {
            // For solitaire & pavé crown diamonds: multi-facet scintillation wave with spotlight angle catch
            const rotBias = Math.cos(currentRot - Math.PI / 4.0);
            const facetWave = Math.sin(currentRot * 1.6 + animTime * 2.2 + phase);
            const lightFactor = Math.max(0, rotBias * 0.45 + 0.55);
            const rawVal = Math.max(0, facetWave * lightFactor);

            if (isGlow) {
              const pulse = Math.pow(rawVal, 1.6);
              sprite.material.opacity = pulse * maxOpacity;
              const currentScale = baseScale * (0.88 + pulse * 0.28);
              sprite.scale.set(currentScale, currentScale, 1.0);
            } else {
              const pulse = Math.pow(rawVal, 2.2);
              sprite.material.opacity = pulse * maxOpacity;
              const currentScale = baseScale * (0.82 + pulse * 0.38);
              sprite.scale.set(currentScale, currentScale, 1.0);
              sprite.rotation.z = animTime * 0.25 + phase;
            }
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearSwitchTimer();
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      pmremGenerator.dispose();
      roomEnv.dispose();
      controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[#D4AF37]/40 text-[10px] font-mono text-[#D4AF37] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span>LOADING 3D GOLD RING...</span>
          </div>
        </div>
      )}

      {/* Model Indicator Badge (Hidden via opacity-0) */}
      {!loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[9px] font-mono text-[#D4AF37] uppercase tracking-wider shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping shrink-0" />
            <span>MODEL {activeModelIndex + 1}/{modelConfigs.length}: {modelConfigs[activeModelIndex].name} (5s LOOP)</span>
          </div>
        </div>
      )}

      {/* Clean Production 3D Canvas with Zoom / Scale Transition */}
      <div 
        ref={mountRef} 
        style={{
          transform: `scale(${zoomStyle.scale})`,
          opacity: zoomStyle.opacity,
          transition: zoomStyle.transition,
          transformOrigin: 'center center',
          willChange: 'transform, opacity'
        }}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
