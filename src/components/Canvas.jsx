import React, { forwardRef, useEffect, useRef, useImperativeHandle, useState } from 'react';
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
  const [selectedObject, setSelectedObject] = useState(null);
  const indicatorsRef = useRef([]);
  const [isRotating, setIsRotating] = useState(false);
  const rotateStartPoint = useRef(new THREE.Vector2());
  const rotateAxis = useRef(null);

  // Função para criar indicadores de transformação
  const createIndicators = (object) => {
    const scene = sceneRef.current;
    
    // Remover indicadores antigos
    indicatorsRef.current.forEach(ind => scene.remove(ind));
    indicatorsRef.current = [];

    // Setas de eixo
    const arrowSize = 1.5;
    const arrowX = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      object.position,
      arrowSize,
      0xff0000
    );
    const arrowY = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      object.position,
      arrowSize,
      0x00ff00
    );
    const arrowZ = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      object.position,
      arrowSize,
      0x0000ff
    );
    
    // Anéis de rotação
    const ringGeometry = new THREE.RingGeometry(1.5, 2, 32);
    const xRingMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      side: THREE.DoubleSide 
    });
    const yRingMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      side: THREE.DoubleSide 
    });
    const zRingMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0000ff, 
      side: THREE.DoubleSide 
    });

    const xRing = new THREE.Mesh(ringGeometry, xRingMaterial);
    const yRing = new THREE.Mesh(ringGeometry, yRingMaterial);
    const zRing = new THREE.Mesh(ringGeometry, zRingMaterial);

    // Posicionar e rotacionar anéis
    xRing.rotation.z = Math.PI/2;
    yRing.rotation.x = Math.PI/2;
    zRing.rotation.y = Math.PI/2;

    xRing.position.copy(object.position);
    yRing.position.copy(object.position);
    zRing.position.copy(object.position);

    // Configurar dados para detecção
    [xRing, yRing, zRing].forEach(ring => {
      ring.userData.isRotationRing = true;
    });
    xRing.userData.axis = 'x';
    yRing.userData.axis = 'y';
    zRing.userData.axis = 'z';

    // Adicionar à cena
    scene.add(arrowX, arrowY, arrowZ, xRing, yRing, zRing);
    indicatorsRef.current.push(arrowX, arrowY, arrowZ, xRing, yRing, zRing);
  };

  // Operações booleanas
  const performBooleanOperation = (operation, selectedIds) => {
    const scene = sceneRef.current;
    const meshes = objectsRef.current.filter(m => selectedIds.includes(m.userData.id));

    if (meshes.length !== 2) {
      console.error('Selecione exatamente 2 objetos');
      return null;
    }

    try {
      // Clonar meshes com transformações
      const [meshA, meshB] = meshes.map(mesh => {
        const clone = mesh.clone();
        clone.position.copy(mesh.position);
        clone.rotation.copy(mesh.rotation);
        clone.scale.copy(mesh.scale);
        clone.updateMatrix();
        clone.updateMatrixWorld(true);
        return clone;
      });

      // Converter para CSG
      const csgA = CSG.fromMesh(meshA);
      const csgB = CSG.fromMesh(meshB);
      let csgResult;

      switch (operation) {
        case 'union':
          csgResult = csgA.union(csgB);
          break;
        case 'difference':
          csgResult = csgA.subtract(csgB);
          break;
        case 'intersection':
          csgResult = csgA.intersect(csgB);
          break;
        default:
          throw new Error('Operação desconhecida');
      }

      // Criar novo mesh
      const result = CSG.toMesh(csgResult, new THREE.Matrix4());
      result.material = new THREE.MeshStandardMaterial({
        color: 0xFF00FF,
        metalness: 0.3,
        roughness: 0.7,
        side: THREE.DoubleSide
      });

      // Otimizar geometria
      result.geometry.computeVertexNormals();
      result.geometry.computeBoundingSphere();

      // Posicionar no centro dos objetos originais
      const midPosition = new THREE.Vector3().addVectors(
        meshes[0].position,
        meshes[1].position
      ).multiplyScalar(0.5);
      
      result.position.copy(midPosition);
      result.userData = { id: Date.now() };
      
      // Atualizar matrizes
      result.updateMatrix();
      result.updateMatrixWorld(true);

      // Atualizar cena
      scene.remove(meshes[0]);
      scene.remove(meshes[1]);
      scene.add(result);

      // Atualizar referências
      objectsRef.current = objectsRef.current
        .filter(m => !selectedIds.includes(m.userData.id))
        .concat(result);

      return {
        newId: result.userData.id,
        originalIds: selectedIds,
        position: result.position.toArray()
      };

    } catch (error) {
      console.error('Falha na operação booleana:', error);
      return null;
    }
  };

  // Expor métodos para o componente pai
  useImperativeHandle(ref, () => ({
    performUnion: (ids) => performBooleanOperation('union', ids),
    performDifference: (ids) => performBooleanOperation('difference', ids),
    performIntersection: (ids) => performBooleanOperation('intersection', ids),
    rotateObject: (id, angle) => {
      const object = objectsRef.current.find(obj => obj.userData.id === id);
      if (object) {
        object.rotation.y += angle;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
  }));

  // Configuração inicial da cena
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
      antialias: true,
      alpha: true
    });

    const updateSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(ambientLight, directionalLight);

    // Grade
    const gridHelper = new THREE.GridHelper(30, 30, 0x303030, 0x404040);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Controles da câmera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Seleção de objetos
  useEffect(() => {
    const handleClick = (event) => {
      if (!canvasRef.current) return;

      const mouse = new THREE.Vector2();
      const rect = canvasRef.current.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(objectsRef.current, true);

      if (intersects.length > 0) {
        let mesh = intersects[0].object;
        while (mesh && (!mesh.userData || !mesh.userData.id)) {
          mesh = mesh.parent;
        }

        if (mesh?.userData?.id) {
          const currentId = mesh.userData.id;
          onSelectObject(currentId);
          setSelectedObject(mesh);
          createIndicators(mesh);
        }
      } else {
        setSelectedObject(null);
        indicatorsRef.current.forEach(ind => sceneRef.current.remove(ind));
        indicatorsRef.current = [];
        onSelectObject(null);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [onSelectObject]);

  // Gerenciamento de objetos
  useEffect(() => {
    const scene = sceneRef.current;
    const currentIds = objects.map(obj => obj.id);
    
    // Remover objetos deletados
    const objectsToRemove = objectsRef.current.filter(
      obj => !currentIds.includes(obj.userData.id)
    );
    objectsToRemove.forEach(obj => scene.remove(obj));
    
    // Atualizar lista de objetos
    objectsRef.current = objectsRef.current.filter(
      obj => currentIds.includes(obj.userData.id)
    );

    // Adicionar novos objetos
    objects.forEach(obj => {
      if (objectsRef.current.some(mesh => mesh.userData.id === obj.id)) return;

      let geometry;
      let yOffset = 0;

      switch (obj.type) {
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
        default:
          return;
      }

      const material = new THREE.MeshStandardMaterial({
        color: obj.color,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x000000,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        obj.position[0],
        obj.position[1] + yOffset,
        obj.position[2]
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id: obj.id };

      scene.add(mesh);
      objectsRef.current.push(mesh);
    });
  }, [objects]);

  // Rotação interativa
  useEffect(() => {
    const canvas = canvasRef.current;
    
    const onMouseDown = (e) => {
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(
        indicatorsRef.current.filter(obj => obj.userData?.isRotationRing)
      );

      if (intersects.length > 0) {
        rotateAxis.current = intersects[0].object.userData.axis;
        rotateStartPoint.current.copy(mouse);
        setIsRotating(true);
      }
    };

    const onMouseMove = (e) => {
      if (!isRotating || !selectedObject) return;

      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      const delta = mouse.sub(rotateStartPoint.current);
      const angle = delta.length() * Math.PI;

      switch (rotateAxis.current) {
        case 'x':
          selectedObject.rotation.x += angle;
          break;
        case 'y':
          selectedObject.rotation.y += angle;
          break;
        case 'z':
          selectedObject.rotation.z += angle;
          break;
      }

      rotateStartPoint.current.copy(mouse);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    const onMouseUp = () => {
      setIsRotating(false);
      rotateAxis.current = null;
    };

    if (canvas) {
      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', onMouseDown);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isRotating, selectedObject]);

  // Carregamento de modelos
  useEffect(() => {
    if (!modelFile) return;

    const loader = new GLTFLoader();
    const reader = new FileReader();

    reader.onload = (e) => {
      loader.parse(e.target.result, '', (gltf) => {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x888888,
              metalness: 0.3,
              roughness: 0.7,
              side: THREE.DoubleSide
            });
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = { id: Date.now() };
            objectsRef.current.push(child);
          }
        });
        sceneRef.current.add(gltf.scene);
      });
    };

    reader.readAsArrayBuffer(modelFile);
  }, [modelFile]);

  // Carregamento de modelos OBJ
  useEffect(() => {
    if (!objModelFile) return;

    const loader = new OBJLoader();
    const reader = new FileReader();

    reader.onload = (e) => {
      const obj = loader.parse(e.target.result);
      
      obj.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide
          });
          child.castShadow = true;
          child.receiveShadow = true;
          child.userData = { id: Date.now() };
          objectsRef.current.push(child);
        }
      });

      sceneRef.current.add(obj);
    };

    reader.readAsText(objModelFile);
  }, [objModelFile]);

  return <canvas ref={canvasRef} className="three-canvas" />;
});

export default Canvas;