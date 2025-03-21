import React, { forwardRef, useEffect, useRef, useImperativeHandle, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { CSG } from 'three-csg-ts';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';

const Canvas = forwardRef(({ objects, modelFile, objModelFile, onSelectObject, rotateMode }, ref) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const objectsRef = useRef([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const indicatorsRef = useRef([]);
  const [isRotating, setIsRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPoint = useRef(new THREE.Vector2());
  const rotateStartPoint = useRef(new THREE.Vector2());
  const rotateAxis = useRef(null);
  const selectedOutlineRef = useRef([]);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycasterRef = useRef(new THREE.Raycaster());
  const mousePositionRef = useRef(new THREE.Vector2());
  const intersectionPointRef = useRef(new THREE.Vector3());

  const createIndicators = useCallback((object) => {
    const scene = sceneRef.current;
    
    indicatorsRef.current.forEach(ind => scene.remove(ind));
    indicatorsRef.current = [];

    if (!rotateMode || !object) return;

    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const arrowSize = 1.5;
    const arrowX = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      center,
      arrowSize,
      0xff0000
    );
    const arrowY = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      center,
      arrowSize,
      0x00ff00
    );
    const arrowZ = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      center,
      arrowSize,
      0x0000ff
    );

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

    xRing.rotation.z = Math.PI/2;
    yRing.rotation.x = Math.PI/2;
    zRing.rotation.y = Math.PI/2;

    [xRing, yRing, zRing].forEach(ring => {
      ring.position.copy(center);
      ring.userData.isRotationRing = true;
    });

    xRing.userData.axis = 'x';
    yRing.userData.axis = 'y';
    zRing.userData.axis = 'z';

    scene.add(arrowX, arrowY, arrowZ, xRing, yRing, zRing);
    indicatorsRef.current.push(arrowX, arrowY, arrowZ, xRing, yRing, zRing);
  }, [rotateMode]);

  const highlightObject = useCallback((object, isSelected) => {
    if (!object) return;

    selectedOutlineRef.current.forEach(outline => {
      if (outline.parent) {
        outline.parent.remove(outline);
      }
    });
    selectedOutlineRef.current = [];

    if (isSelected) {
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5
      });

      if (object.geometry) {
        const outlineGeometry = object.geometry.clone();
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.scale.multiplyScalar(1.05);

        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        box.getCenter(center);
        outline.position.copy(center);
        
        outline.rotation.copy(object.rotation);
        sceneRef.current.add(outline);
        selectedOutlineRef.current.push(outline);
      }
    }
  }, []);

  const performBooleanOperation = useCallback((operation, selectedIds) => {
    const scene = sceneRef.current;
    const meshes = objectsRef.current
      .filter(m => selectedIds.includes(m.userData.id))
      .sort((a, b) => selectedIds.indexOf(a.userData.id) - selectedIds.indexOf(b.userData.id));

    if (meshes.length !== 2) {
      console.error('Selecione exatamente 2 objetos');
      return null;
    }

    const box1 = new THREE.Box3().setFromObject(meshes[0]);
    const box2 = new THREE.Box3().setFromObject(meshes[1]);
    
    if (!box1.intersectsBox(box2)) {
      console.error('Objetos não estão colidindo');
      return null;
    }

    try {
      meshes.forEach(mesh => mesh.updateMatrixWorld(true));

      const [meshA, meshB] = meshes.map(mesh => {
        const clone = mesh.clone();
        clone.geometry = clone.geometry.clone().applyMatrix4(clone.matrixWorld);
        clone.position.set(0, 0, 0);
        clone.rotation.set(0, 0, 0);
        clone.scale.set(1, 1, 1);
        clone.updateMatrix();
        return clone;
      });

      const csgA = CSG.fromMesh(meshA);
      const csgB = CSG.fromMesh(meshB);
      let csgResult;

      switch (operation) {
        case 'union': csgResult = csgA.union(csgB); break;
        case 'difference': csgResult = csgA.subtract(csgB); break;
        case 'intersection': csgResult = csgA.intersect(csgB); break;
        default: throw new Error('Operação desconhecida');
      }

      const result = CSG.toMesh(csgResult, new THREE.Matrix4());
      result.material = new THREE.MeshStandardMaterial({
        color: 0xFF00FF,
        metalness: 0.3,
        roughness: 0.7,
        side: THREE.DoubleSide
      });

      // Centralizar geometria
      result.geometry.computeBoundingBox();
      const geomCenter = new THREE.Vector3();
      result.geometry.boundingBox.getCenter(geomCenter);
      result.geometry.translate(-geomCenter.x, -geomCenter.y, -geomCenter.z);

      // Calcular nova posição com base no grid
      result.geometry.computeBoundingBox();
      const boundingBox = result.geometry.boundingBox;
      const newPosition = new THREE.Vector3(
        (meshes[0].position.x + meshes[1].position.x) / 2,
        0, // Forçar posição Y para o nível do grid
        (meshes[0].position.z + meshes[1].position.z) / 2
      );

      // Ajuste vertical preciso
      const yOffset = -boundingBox.min.y;
      newPosition.y += yOffset;

      result.position.copy(newPosition);
      result.userData = { id: Date.now() };

      scene.remove(meshes[0]);
      scene.remove(meshes[1]);
      scene.add(result);

      // Atualizar referências
      selectedOutlineRef.current.forEach(outline => outline.parent?.remove(outline));
      selectedOutlineRef.current = [];

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
  }, []);

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
    },
    exportSceneToOBJ: () => {
      const scene = sceneRef.current;
      const exporter = new OBJExporter();
      const result = exporter.parse(scene);

      const blob = new Blob([result], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'scene.obj';
      link.click();
    }
  }));

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(ambientLight, directionalLight);

    const gridHelper = new THREE.GridHelper(30, 30, 0x303030, 0x404040);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateMousePosition = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePositionRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePositionRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseDown = (e) => {
      if (!rotateMode) return;

      updateMousePosition(e);
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mousePositionRef.current, cameraRef.current);
      
      const rotationRings = indicatorsRef.current.filter(
        obj => obj.userData?.isRotationRing
      );
      
      const ringsIntersects = raycaster.intersectObjects(rotationRings);
      
      if (ringsIntersects.length > 0) {
        rotateAxis.current = ringsIntersects[0].object.userData.axis;
        rotateStartPoint.current.copy(mousePositionRef.current);
        setIsRotating(true);
        controlsRef.current.enabled = false;
        return;
      }
      
      const objectIntersects = raycaster.intersectObjects(objectsRef.current);
      
      if (objectIntersects.length > 0 && selectedObject) {
        setIsDragging(true);
        dragStartPoint.current.copy(mousePositionRef.current);
        controlsRef.current.enabled = false;
      }
    };

    const onMouseMove = (e) => {
      if (!rotateMode) return;

      updateMousePosition(e);
      
      if (isRotating && selectedObject) {
        const delta = new THREE.Vector2().subVectors(
          mousePositionRef.current, 
          rotateStartPoint.current
        );
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
          default:
            break;
        }

        rotateStartPoint.current.copy(mousePositionRef.current);
        
        indicatorsRef.current.forEach(ind => {
          if (ind.userData?.isRotationRing) {
            const box = new THREE.Box3().setFromObject(selectedObject);
            const center = new THREE.Vector3();
            box.getCenter(center);
            ind.position.copy(center);
          }
        });

        selectedOutlineRef.current.forEach(outline => {
          const box = new THREE.Box3().setFromObject(selectedObject);
          const center = new THREE.Vector3();
          box.getCenter(center);
          outline.position.copy(center);
          outline.rotation.copy(selectedObject.rotation);
        });
      }
      else if (isDragging && selectedObject) {
        const raycaster = raycasterRef.current;
        raycaster.setFromCamera(mousePositionRef.current, cameraRef.current);
        
        if (raycaster.ray.intersectPlane(dragPlaneRef.current, intersectionPointRef.current)) {
          selectedObject.position.copy(intersectionPointRef.current);
          selectedObject.updateMatrixWorld(true);
          
          if (selectedObject.userData.originalY !== undefined) {
            selectedObject.position.y = selectedObject.userData.originalY;
          }
          
          createIndicators(selectedObject);
          
          selectedOutlineRef.current.forEach(outline => {
            const box = new THREE.Box3().setFromObject(selectedObject);
            const center = new THREE.Vector3();
            box.getCenter(center);
            outline.position.copy(center);
          });
        }
      }
    };

    const onMouseUp = () => {
      if (isRotating || isDragging) {
        controlsRef.current.enabled = true;
      }
      
      setIsRotating(false);
      setIsDragging(false);
      rotateAxis.current = null;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isRotating, isDragging, selectedObject, rotateMode, createIndicators]);

  useEffect(() => {
    const handleClick = (event) => {
      if (isRotating || isDragging) return;
      if (!canvasRef.current) return;

      const mouse = new THREE.Vector2();
      const rect = canvasRef.current.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const indicatorObjects = indicatorsRef.current;
      const intersects = raycaster.intersectObjects(
        objectsRef.current.filter(obj => !indicatorObjects.includes(obj)),
        true
      );

      if (intersects.length > 0) {
        let mesh = intersects[0].object;
        while (mesh && (!mesh.userData || !mesh.userData.id)) {
          mesh = mesh.parent;
        }

        if (mesh?.userData?.id) {
          const currentId = mesh.userData.id;
          onSelectObject(currentId);
          setSelectedObject(mesh);
          
          if (mesh.userData.originalY === undefined) {
            mesh.userData.originalY = mesh.position.y;
          }
          
          if (rotateMode) createIndicators(mesh);
          highlightObject(mesh, true);
        }
      } else {
        setSelectedObject(null);
        if (rotateMode) {
          indicatorsRef.current.forEach(ind => sceneRef.current.remove(ind));
          indicatorsRef.current = [];
        }
        
        selectedOutlineRef.current.forEach(outline => {
          if (outline.parent) {
            outline.parent.remove(outline);
          }
        });
        selectedOutlineRef.current = [];
        
        onSelectObject(null);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [onSelectObject, isRotating, isDragging, rotateMode, createIndicators, highlightObject]);

  useEffect(() => {
    const scene = sceneRef.current;
    const currentIds = objects.map(obj => obj.id);
    
    const objectsToRemove = objectsRef.current.filter(
      obj => !currentIds.includes(obj.userData.id)
    );
    objectsToRemove.forEach(obj => scene.remove(obj));
    
    objectsRef.current = objectsRef.current.filter(
      obj => currentIds.includes(obj.userData.id)
    );

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
      mesh.userData = { 
        id: obj.id,
        originalY: obj.position[1] + yOffset
      };

      scene.add(mesh);
      objectsRef.current.push(mesh);
    });
  }, [objects]);

  useEffect(() => {
    const updateSelectedObjects = () => {
      selectedOutlineRef.current.forEach(outline => {
        if (outline.parent) {
          outline.parent.remove(outline);
        }
      });
      selectedOutlineRef.current = [];

      objectsRef.current.forEach(object => {
        if (object.userData.id === selectedObject?.userData.id) {
          highlightObject(object, true);
        }
      });
    };

    updateSelectedObjects();
  }, [selectedObject, highlightObject]);

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

  useEffect(() => {
    if (!rotateMode) {
      const scene = sceneRef.current;
      indicatorsRef.current.forEach(ind => scene.remove(ind));
      indicatorsRef.current = [];
    }
  }, [rotateMode]);

  return <canvas ref={canvasRef} className="three-canvas" />;
});

export default Canvas;