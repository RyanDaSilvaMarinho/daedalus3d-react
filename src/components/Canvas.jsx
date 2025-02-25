import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Canvas = ({ objects, modelFile }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const objectsRef = useRef([]);

  useEffect(() => {
    // Configuração inicial
    const scene = sceneRef.current;
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(15, 25, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x888888);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const loader = new GLTFLoader();

    // Limpar objetos antigos
    objectsRef.current.forEach(obj => scene.remove(obj));
    objectsRef.current = [];

    // Adicionar novos objetos com cor
    objects.forEach(obj => {
      let geometry, yOffset;

      switch(obj.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(2, 2, 2);
          yOffset = 1;
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(1.5, 32, 32);
          yOffset = 1.5;
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
          yOffset = 1.5;
          break;
        default:
          return;
      }

      // Material com cor dinâmica
      const material = new THREE.MeshStandardMaterial({
        color: obj.color, // Cor definida pelo usuário
        metalness: 0.3,
        roughness: 0.7
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        obj.position[0],
        obj.position[1] + yOffset,
        obj.position[2]
      );
      scene.add(mesh);
      objectsRef.current.push(mesh);
    });

  }, [objects]);

  useEffect(() => {
    if (!modelFile) return;
    
    const loader = new GLTFLoader();
    const reader = new FileReader();
    
    reader.onload = () => {
      loader.parse(reader.result, '', gltf => {
        sceneRef.current.add(gltf.scene);
      });
    };
    reader.readAsArrayBuffer(modelFile);

  }, [modelFile]);

  return <canvas ref={canvasRef} />;
};

export default Canvas;