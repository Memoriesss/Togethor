import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../stores/useStore';
import SceneElement from './SceneElement';
import ParticleSystem from './ParticleSystem';

/**
 * 3D 场景主组件
 */
const Scene = () => {
  const scene = useStore((state) => state.scene);
  const ui = useStore((state) => state.ui);
  
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: scene.camera.position, fov: scene.camera.fov }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent scene={scene} ui={ui} />
        </Suspense>
      </Canvas>
    </div>
  );
};

/**
 * 场景内容组件
 */
const SceneContent = ({ scene, ui }) => {
  const groupRef = useRef();
  
  // 应用背景色
  useMemo(() => {
    document.body.style.backgroundColor = scene.atmosphere.backgroundColor;
  }, [scene.atmosphere.backgroundColor]);
  
  return (
    <>
      {/* 环境光照 */}
      <ambientLight 
        intensity={scene.lighting.ambient.intensity} 
        color={scene.lighting.ambient.color} 
      />
      
      {/* 主方向光 */}
      <directionalLight
        position={scene.lighting.directional.position}
        intensity={scene.lighting.directional.intensity}
        color={scene.lighting.directional.color}
      />
      
      {/* 点光源 */}
      {scene.lighting.points.map((point, index) => (
        <pointLight
          key={`point-${index}`}
          position={point.position}
          intensity={point.intensity}
          color={point.color}
          distance={point.distance || 20}
        />
      ))}
      
      {/* 雾效果 */}
      <fog
        attach="fog"
        args={[
          scene.atmosphere.fogColor,
          scene.atmosphere.fogNear,
          scene.atmosphere.fogFar
        ]}
      />
      
      {/* 背景星星 */}
      <Stars
        radius={100}
        depth={50}
        count={ui.showParticles ? 5000 : 0}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      {/* 场景元素组 */}
      <group ref={groupRef}>
        {scene.elements.map((element) => (
          <SceneElement key={element.id} element={element} />
        ))}
      </group>
      
      {/* 粒子系统 */}
      {ui.showParticles && <ParticleSystem />}
      
      {/* 相机控制器 */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        autoRotate={ui.autoRotate}
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
};

export default Scene;
