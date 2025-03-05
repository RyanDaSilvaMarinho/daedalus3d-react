import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { CSG } from 'three-csg-ts';

const Canvas = forwardRef(({ objects, modelFile, objModelFile, onSelectObject }, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const objectsRef = useRef([]);

  // Expose CSG operations to parent component
  useImperativeHandle(ref, () => ({
    performUnion: (selectedIds) => {
      const scene = sceneRef.current;
      const meshes = objectsRef.current.filter(m => selectedIds.includes(m.userData.id));
      
      if (meshes.length !== 2) return null;

      // Remove selection highlight
      meshes.forEach(m => m.material.emissive.setHex(0x000000));

      // Store original positions
      const originalPositions = meshes.map(m => m.position.clone());
      const [meshA, meshB] = meshes;

      // Clone meshes for CSG operation
      const cloneA = meshA.clone();
      const cloneB = meshB.clone();
      cloneA.updateMatrix();
      cloneB.updateMatrix();

      try {
        // Perform CSG union
        const csgA = CSG.fromMesh(cloneA);
        const csgB = CSG.fromMesh(cloneB);
        const csgResult = csgA.union(csgB);

        // Create new mesh from result
        const result = CSG.toMesh(csgResult, cloneA.matrix);
        result.material = new THREE.MeshStandardMaterial({
          ...cloneA.material,
          emissive: 0x000000
        });
        
        // Set position to average of original positions
        result.position.set(
          (originalPositions[0].x + originalPositions[1].x) / 2,
          (originalPositions[0].y + originalPositions[1].y) / 2,
          (originalPositions[0].z + originalPositions[1].z) / 2
        );

        // Assign unique ID
        result.userData = { id: Date.now() };

        // Update scene
        scene.remove(meshA);
        scene.remove(meshB);
        scene.add(result);

        // Update object references
        objectsRef.current = objectsRef.current
          .filter(m => !selectedIds.includes(m.userData.id))
          .concat(result);

        return {
          newId: result.userData.id,
          originalIds: selectedIds,
          position: [result.position.x, result.position.y, result.position.z]
        };

      } catch (error) {
        console.error('CSG Operation failed:', error);
        return null;
      }
    }
  }));

  // Scene setup
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

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x303030, 0x404040);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Object selection handler
  useEffect(() => {
    const handleClick = (event) => {
      const mouse = new THREE.Vector2();
      const rect = canvasRef.current.getBoundingClientRect();
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(objectsRef.current, true);

      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const currentId = mesh.userData.id;
        
        // Toggle selection
        onSelectObject(currentId);
        
        // Toggle highlight
        mesh.material.emissive.setHex(
          mesh.material.emissive.getHex() === 0x00ff00 ? 0x000000 : 0x00ff00
        );
      }
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('click', handleClick);
    
    return () => canvas.removeEventListener('click', handleClick);
  }, [onSelectObject]);

  // Object management
  useEffect(() => {
    const scene = sceneRef.current;
    const loader = new GLTFLoader();

    // Clear previous objects
    objectsRef.current.forEach(obj => scene.remove(obj));
    objectsRef.current = [];

    // Create new objects
    objects.forEach(obj => {
      let geometry;
      let yOffset = 0;

      switch(obj.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(2, 2, 2);
          yOffset = 1;
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(1, 32, 32);
          yOffset = 1;
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
          yOffset = 1;
          break;
        case 'union':
          // Placeholder geometry for combined objects
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        default:
          return;
      }

      const material = new THREE.MeshStandardMaterial({
        color: obj.color,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x000000
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        obj.position[0],
        obj.position[1] + yOffset,
        obj.position[2]
      );
      mesh.userData = { id: obj.id };
      scene.add(mesh);
      objectsRef.current.push(mesh);
    });

  }, [objects]);

  // Model loading handlers
  useEffect(() => {
    if (!modelFile) return;

    const loader = new GLTFLoader();
    const reader = new FileReader();

    reader.onload = (e) => {
      loader.parse(e.target.result, '', (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x888888,
              metalness: 0.3,
              roughness: 0.7
            });
            child.userData = { id: Date.now() };
            objectsRef.current.push(child);
          }
        });
        sceneRef.current.add(gltf.scene);
      });
    };

    reader.readAsArrayBuffer(modelFile);
  }, [modelFile]);

  useEffect(() => {
    if (!objModelFile) return;

    const loader = new OBJLoader();
    const reader = new FileReader();

    reader.onload = (e) => {
      const obj = loader.parse(e.target.result);
      
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.7
          });
          child.userData = { id: Date.now() };
          objectsRef.current.push(child);
        }
      });

      obj.position.set(0, 0, 0);
      sceneRef.current.add(obj);
    };

    reader.readAsText(objModelFile);
  }, [objModelFile]);

  return <canvas ref={canvasRef} className="three-canvas" />;
});

export default Canvas;