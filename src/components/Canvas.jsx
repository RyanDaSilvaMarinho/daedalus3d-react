import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const Canvas = ({ objects, modelFile, objModelFile }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const objectsRef = useRef([]);

  useEffect(() => {
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
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x888888);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

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

    objectsRef.current.forEach(obj => scene.remove(obj));
    objectsRef.current = [];

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

      const material = new THREE.MeshStandardMaterial({
        color: obj.color,
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

  useEffect(() => {
    if (!objModelFile) return;

    const loader = new OBJLoader();
    const reader = new FileReader();
    
    reader.onload = () => {
      const obj = loader.parse(reader.result);
      
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.7
          });
        }
      });

      obj.position.set(0, 0, 0);
      sceneRef.current.add(obj);
    };

    reader.readAsText(objModelFile);
  }, [objModelFile]);

  return <canvas ref={canvasRef} />;
};

export default Canvas;