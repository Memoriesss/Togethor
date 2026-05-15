import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 场景元素组件
 * 负责渲染单个 3D 对象并应用动画
 */
const SceneElement = ({ element }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const initialPosition = useMemo(() => new THREE.Vector3(...element.position), [element.position]);
  const initialScale = useMemo(() => new THREE.Vector3(...element.scale), [element.scale]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // 应用动画
    if (element.animation && element.animation.length > 0) {
      element.animation.forEach((anim) => {
        switch (anim.type) {
          case 'rotation':
            if (anim.axis === 'y') {
              meshRef.current.rotation.y += anim.speed;
            } else if (anim.axis === 'x') {
              meshRef.current.rotation.x += anim.speed;
            } else {
              meshRef.current.rotation.z += anim.speed;
            }
            break;
            
          case 'float':
            const floatOffset = Math.sin(time * anim.speed + anim.offset) * anim.amplitude;
            meshRef.current.position.y = initialPosition.y + floatOffset;
            break;
            
          case 'scale':
            const scalePulse = Math.sin(time * anim.speed) * 0.5 + 0.5;
            const scaleFactor = anim.min + (anim.max - anim.min) * scalePulse;
            meshRef.current.scale.setScalar(scaleFactor);
            break;
            
          default:
            break;
        }
      });
    }
  });
  
  // 创建几何体
  const geometry = useMemo(() => {
    const { type, params = [] } = element.geometry;
    
    switch (type) {
      case 'SphereGeometry':
        return new THREE.SphereGeometry(...params);
      case 'BoxGeometry':
        return new THREE.BoxGeometry(...params);
      case 'ConeGeometry':
        return new THREE.ConeGeometry(...params);
      case 'CylinderGeometry':
        return new THREE.CylinderGeometry(...params);
      case 'TorusGeometry':
        return new THREE.TorusGeometry(...params);
      case 'TorusKnotGeometry':
        return new THREE.TorusKnotGeometry(...params);
      case 'OctahedronGeometry':
        return new THREE.OctahedronGeometry(...params);
      case 'IcosahedronGeometry':
        return new THREE.IcosahedronGeometry(...params);
      case 'DodecahedronGeometry':
        return new THREE.DodecahedronGeometry(...params);
      case 'TetrahedronGeometry':
        return new THREE.TetrahedronGeometry(...params);
      case 'PlaneGeometry':
        return new THREE.PlaneGeometry(...params);
      case 'RingGeometry':
        return new THREE.RingGeometry(...params);
      default:
        return new THREE.SphereGeometry(1, 16, 16);
    }
  }, [element.geometry]);
  
  // 创建材质
  const material = useMemo(() => {
    const { type, ...materialProps } = element.material;
    
    switch (type) {
      case 'MeshStandardMaterial':
        return new THREE.MeshStandardMaterial({
          color: materialProps.color || '#ffffff',
          metalness: materialProps.metalness ?? 0.5,
          roughness: materialProps.roughness ?? 0.5,
          emissive: materialProps.emissive || '#000000',
          emissiveIntensity: materialProps.emissiveIntensity ?? 0,
        });
        
      case 'MeshPhysicalMaterial':
        return new THREE.MeshPhysicalMaterial({
          color: materialProps.color || '#ffffff',
          metalness: materialProps.metalness ?? 0,
          roughness: materialProps.roughness ?? 0,
          transmission: materialProps.transmission ?? 0,
          thickness: materialProps.thickness ?? 0,
          ior: materialProps.ior ?? 1.5,
          transparent: materialProps.transparent ?? false,
          opacity: materialProps.opacity ?? 1,
        });
        
      case 'MeshBasicMaterial':
        return new THREE.MeshBasicMaterial({
          color: materialProps.color || '#ffffff',
          transparent: materialProps.transparent ?? false,
          opacity: materialProps.opacity ?? 1,
          wireframe: materialProps.wireframe ?? false,
        });
        
      case 'MeshPhongMaterial':
        return new THREE.MeshPhongMaterial({
          color: materialProps.color || '#ffffff',
          specular: materialProps.specular || '#ffffff',
          shininess: materialProps.shininess ?? 30,
        });
        
      default:
        return new THREE.MeshStandardMaterial({ color: '#ffffff' });
    }
  }, [element.material]);
  
  // 如果是组类型（多个几何体组合）
  if (element.geometry.type === 'group') {
    return (
      <group
        ref={groupRef}
        position={element.position}
        rotation={element.rotation}
        scale={element.scale}
      >
        {element.geometry.children.map((child, index) => {
          const childGeometry = createChildGeometry(child);
          const childMaterial = material.clone();
          
          return (
            <mesh
              key={index}
              geometry={childGeometry}
              material={childMaterial}
              position={child.position || [0, 0, 0]}
            />
          );
        })}
      </group>
    );
  }
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={element.position}
      rotation={element.rotation}
      scale={element.scale}
    />
  );
};

/**
 * 创建子几何体
 */
function createChildGeometry(childConfig) {
  const { type, params = [] } = childConfig;
  
  switch (type) {
    case 'SphereGeometry':
      return new THREE.SphereGeometry(...params);
    case 'BoxGeometry':
      return new THREE.BoxGeometry(...params);
    case 'ConeGeometry':
      return new THREE.ConeGeometry(...params);
    case 'CylinderGeometry':
      return new THREE.CylinderGeometry(...params);
    case 'TorusGeometry':
      return new THREE.TorusGeometry(...params);
    case 'OctahedronGeometry':
      return new THREE.OctahedronGeometry(...params);
    case 'IcosahedronGeometry':
      return new THREE.IcosahedronGeometry(...params);
    default:
      return new THREE.SphereGeometry(1, 16, 16);
  }
}

export default SceneElement;
