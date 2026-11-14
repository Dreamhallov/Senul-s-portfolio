import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useSmoothScroll } from './SmoothScroll';

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function WebGLCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { velocityRef, scrollProgressRef } = useSmoothScroll();
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || reducedMotion) {
      setFallbackMode(true);
      return;
    }

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackMode(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = false;
    renderer.setClearColor(0xf4f5f0, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 7.2);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Rich directional light rig calibrated to pop jewel tones over warm daylight #F4F5F0
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc7d2fe, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4.8, 6.2, 5.2);
    scene.add(keyLight);

    const amethystRim = new THREE.PointLight(0x7c3aed, 12.0, 18);
    amethystRim.position.set(-2.5, 1.8, 4.0);
    scene.add(amethystRim);

    const cobaltFill = new THREE.PointLight(0x2563eb, 10.5, 16);
    cobaltFill.position.set(3.2, -2.0, 3.5);
    scene.add(cobaltFill);

    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.set(2.05, 0.05, 0);
    scene.add(sculptureGroup);

    // 1. Primary Faceted Amethyst-Cobalt Crystal Core (high contrast on light background)
    const shaderUniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0.05 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    };

    const crystalGeo = new THREE.IcosahedronGeometry(1.18, isSoftwareGl ? 1 : 2);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x4338ca,
      emissive: 0x312e81,
      emissiveIntensity: 0.22,
      metalness: 0.28,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      iridescence: 0.92,
      iridescenceIOR: 1.45,
      iridescenceThicknessMinimum: 160,
      iridescenceThicknessMaximum: 480,
      flatShading: true,
      envMapIntensity: 1.5,
    });

    crystalMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniforms.uTime;
      shader.uniforms.uPulse = shaderUniforms.uPulse;
      shader.uniforms.uPointer = shaderUniforms.uPointer;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uPulse;
        uniform vec2 uPointer;
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float wave = sin(position.x * 2.4 + uTime * 1.1 + uPointer.x * 1.8) *
                     cos(position.y * 2.4 - uTime * 0.9 + uPointer.y * 1.8);
        transformed += normal * (wave * uPulse);
        `
      );
    };

    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    sculptureGroup.add(crystalMesh);

    // Crisp architectural wireframe cage over the crystal for Swiss engineering sharpness
    const cageGeo = new THREE.IcosahedronGeometry(1.26, 1);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.34,
    });
    const cageMesh = new THREE.LineSegments(cageEdges, cageMat);
    sculptureGroup.add(cageMesh);

    // 2. Counter-Rotating Brushed Obsidian & Cobalt Architectural Gyroscope Rings
    const ringOuterGeo = new THREE.TorusGeometry(1.88, 0.018, 16, 128);
    const ringOuterMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.85,
      roughness: 0.22,
    });
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
    ringOuter.rotation.set(Math.PI * 0.34, Math.PI * 0.14, 0);
    sculptureGroup.add(ringOuter);

    const ringCobaltGeo = new THREE.TorusGeometry(1.56, 0.022, 16, 120);
    const ringCobaltMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.25,
      metalness: 0.65,
      roughness: 0.2,
    });
    const ringCobalt = new THREE.Mesh(ringCobaltGeo, ringCobaltMat);
    ringCobalt.rotation.set(-Math.PI * 0.28, Math.PI * 0.38, 0);
    sculptureGroup.add(ringCobalt);

    const ringMeridianGeo = new THREE.TorusGeometry(2.14, 0.009, 12, 140);
    const ringMeridianMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.2,
      metalness: 0.72,
      roughness: 0.22,
      transparent: true,
      opacity: 0.72,
    });
    const ringMeridian = new THREE.Mesh(ringMeridianGeo, ringMeridianMat);
    ringMeridian.rotation.set(Math.PI * 0.12, -Math.PI * 0.42, 0.24);
    sculptureGroup.add(ringMeridian);

    // 3. Orbiting Frosted Architectural Glass & Cobalt UI Slates (mouse parallax layer)
    const slatesGroup = new THREE.Group();
    sculptureGroup.add(slatesGroup);

    const slateGeo = new THREE.BoxGeometry(0.48, 0.64, 0.025);
    const slateMats = [
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.05,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.92,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.28,
        metalness: 0.35,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.3,
        metalness: 0.55,
      }),
    ];

    const slateCount = 6;
    const slateMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < slateCount; i++) {
      const m = new THREE.Mesh(slateGeo, slateMats[i % slateMats.length]);
      const angle = (i / slateCount) * Math.PI * 2;
      m.position.set(
        Math.cos(angle) * 2.25,
        Math.sin(i * 1.4) * 0.72,
        Math.sin(angle) * 1.45
      );
      m.lookAt(0, 0, 0);
      slatesGroup.add(m);
      slateMeshes.push(m);
    }

    // 4. Floating Geometric Studio Prisms via InstancedMesh
    const nodeCount = 48;
    const nodeGeo = new THREE.OctahedronGeometry(0.036, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.45,
      roughness: 0.2,
    });
    const nodeInstanced = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    nodeInstanced.frustumCulled = false;

    const nodeSeeds = Array.from({ length: nodeCount }, (_, i) => ({
      angle: (i / nodeCount) * Math.PI * 2,
      radius: 1.9 + (i % 5) * 0.28,
      speed: 0.09 + (i % 4) * 0.025,
      yAmp: 0.45 + (i % 4) * 0.22,
      phase: i * 0.85,
      scale: 0.65 + (i % 4) * 0.25,
    }));

    const _dummy = new THREE.Object3D();
    const _tint = new THREE.Color();
    nodeSeeds.forEach((_, i) => {
      _tint.setHex(i % 3 === 0 ? 0x2563eb : i % 3 === 1 ? 0x7c3aed : 0x1a1a1a);
      nodeInstanced.setColorAt(i, _tint);
    });
    if (nodeInstanced.instanceColor) {
      nodeInstanced.instanceColor.needsUpdate = true;
    }
    sculptureGroup.add(nodeInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const targetPointer = { x: 0, y: 0 };
    const currentPointer = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetPointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      sculptureGroup.position.x = w < 1024 ? 1.1 : 2.05;
      sculptureGroup.scale.setScalar(w < 1024 ? 0.78 : 1.0);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let frameId = 0;
    let isDisposed = false;
    const startTimeMs = performance.now();
    let lastTimeMs = startTimeMs;
    let smoothVelocity = 0;
    let smoothScroll = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.1);
      lastTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;

      currentPointer.x = THREE.MathUtils.damp(currentPointer.x, targetPointer.x, 5.2, dt);
      currentPointer.y = THREE.MathUtils.damp(currentPointer.y, targetPointer.y, 5.2, dt);

      const rawVel = Math.min(Math.abs(velocityRef.current || 0), 40);
      smoothVelocity = THREE.MathUtils.damp(smoothVelocity, rawVel, 5, dt);
      smoothScroll = THREE.MathUtils.damp(smoothScroll, scrollProgressRef.current || 0, 5, dt);

      shaderUniforms.uTime.value = elapsed + smoothVelocity * 0.03;
      shaderUniforms.uPulse.value = 0.045 + smoothVelocity * 0.003;
      shaderUniforms.uPointer.value.set(currentPointer.x, currentPointer.y);

      // Vivid mouse parallax camera + sculpture layering
      camera.position.x = THREE.MathUtils.damp(camera.position.x, currentPointer.x * 0.42, 4.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.05 + currentPointer.y * 0.3, 4.5, dt);
      camera.lookAt(0.45, 0, 0);

      crystalMesh.rotation.y = elapsed * 0.25 + currentPointer.x * 0.95 + smoothScroll * Math.PI * 1.8;
      crystalMesh.rotation.x = elapsed * 0.14 + currentPointer.y * 0.72 + smoothScroll * 0.9;

      cageMesh.rotation.y = -elapsed * 0.18 + currentPointer.x * 0.55 + smoothScroll * 1.2;
      cageMesh.rotation.x = currentPointer.y * 0.42;

      ringOuter.rotation.z = elapsed * 0.22 + currentPointer.x * 0.45;
      ringOuter.rotation.x = Math.PI * 0.34 + currentPointer.y * 0.38;

      ringCobalt.rotation.z = -elapsed * 0.26 - currentPointer.x * 0.5;
      ringCobalt.rotation.y = Math.PI * 0.38 + currentPointer.y * 0.4;

      ringMeridian.rotation.z = elapsed * 0.14 - currentPointer.x * 0.28;
      ringMeridian.rotation.x = Math.PI * 0.12 - currentPointer.y * 0.25;
      ringMeridian.rotation.y = -Math.PI * 0.42 + smoothScroll * 0.9;

      slatesGroup.rotation.y = elapsed * 0.14 + currentPointer.x * 0.65 + smoothScroll * Math.PI * 1.6;
      slatesGroup.rotation.x = currentPointer.y * 0.28 - smoothScroll * 0.3;

      for (let i = 0; i < slateMeshes.length; i++) {
        slateMeshes[i].rotation.z = Math.sin(elapsed * 0.9 + i) * 0.12 + currentPointer.x * 0.18;
      }

      sculptureGroup.position.y = 0.05 - Math.min(smoothScroll * 1.8, 0.65);

      for (let i = 0; i < nodeCount; i++) {
        const s = nodeSeeds[i];
        const a = s.angle + elapsed * s.speed + smoothScroll * 1.4;
        _dummy.position.set(
          Math.cos(a) * s.radius,
          Math.sin(elapsed * 0.7 + s.phase) * s.yAmp + currentPointer.y * 0.15,
          Math.sin(a) * s.radius * 0.7
        );
        _dummy.rotation.set(elapsed * 0.6 + s.phase, elapsed * 0.5, 0);
        _dummy.scale.setScalar(s.scale);
        _dummy.updateMatrix();
        nodeInstanced.setMatrixAt(i, _dummy.matrix);
      }
      nodeInstanced.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      crystalGeo.dispose();
      crystalMat.dispose();
      cageGeo.dispose();
      cageEdges.dispose();
      cageMat.dispose();
      ringOuterGeo.dispose();
      ringOuterMat.dispose();
      ringCobaltGeo.dispose();
      ringCobaltMat.dispose();
      ringMeridianGeo.dispose();
      ringMeridianMat.dispose();
      slateGeo.dispose();
      slateMats.forEach((m) => m.dispose());
      nodeGeo.dispose();
      nodeMat.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, [velocityRef, scrollProgressRef]);

  return (
    <div
      data-testid="hero-webgl"
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {fallbackMode ? (
        <div
          className="w-full h-full"
          style={{
            background:
              'radial-gradient(circle at 76% 36%, rgba(124, 58, 237, 0.14) 0%, rgba(37, 99, 235, 0.08) 34%, rgba(244, 245, 240, 1) 76%)',
          }}
        />
      ) : (
        <>
          <div ref={mountRef} className="hidden md:block w-full h-full" />
          <div
            className="md:hidden w-full h-full"
            style={{
              background:
                'radial-gradient(circle at 76% 28%, rgba(124, 58, 237, 0.14) 0%, rgba(37, 99, 235, 0.08) 38%, rgba(244, 245, 240, 1) 78%)',
            }}
          />
        </>
      )}
    </div>
  );
}
