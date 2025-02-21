import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const Canvas = ({ onSceneReady, modelFile }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 100, 0x0088ff, 0x001830);
    gridHelper.position.y = -10;  // Mover o grid para baixo
    scene.add(gridHelper);


    // Plane for click detection
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false })
    );
    planeMesh.rotateX(-Math.PI / 2);
    scene.add(planeMesh);

    // Camera position
    camera.position.z = 30;
    camera.position.y = 20;
    camera.lookAt(0, 0, 0);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Initial resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    handleResize();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Check if there's a model file to load
    if (modelFile) {
      const loader = new GLTFLoader();
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        loader.parse(arrayBuffer, '', (gltf) => {
          scene.add(gltf.scene);
        }, (error) => {
          console.error('Error loading model:', error);
        });
      };
      reader.readAsArrayBuffer(modelFile);
    }

    // Notify parent component
    onSceneReady({ scene, camera, renderer, controls });

    // Cleanup
    return () => {
      renderer.dispose();
      controls.dispose();
    };
  }, [onSceneReady, modelFile]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
