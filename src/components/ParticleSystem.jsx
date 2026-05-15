import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../stores/useStore';

/**
 * 粒子系统组件
 * 负责创建和管理场景中的粒子效果
 */
const ParticleSystem = () => {
  const pointsRef = useRef();
  const currentScene = useStore((state) => state.currentScene);
  
  // 固定粒子数量以避免 buffer 大小变化的问题
  const PARTICLE_COUNT = 1000;
  
  // 粒子配置
  const particleConfig = useMemo(() => {
    const mood = currentScene.mood || 'ethereal';
    
    const configs = {
      mysterious: {
        size: 0.05,
        color: '#6666aa',
        speed: 0.1,
        spread: 30,
        type: 'dust',
      },
      peaceful: {
        size: 0.08,
        color: '#88ff88',
        speed: 0.15,
        spread: 25,
        type: 'fireflies',
      },
      energetic: {
        size: 0.06,
        color: '#ff66ff',
        speed: 0.8,
        spread: 35,
        type: 'magic',
      },
      dark: {
        size: 0.07,
        color: '#ff4500',
        speed: 0.3,
        spread: 28,
        type: 'embers',
      },
      ethereal: {
        size: 0.04,
        color: '#ffffff',
        speed: 0.05,
        spread: 40,
        type: 'stars',
      },
      cyberpunk: {
        size: 0.05,
        color: '#00ffff',
        speed: 0.6,
        spread: 32,
        type: 'digital',
      },
      fantasy: {
        size: 0.09,
        color: '#da70d6',
        speed: 0.4,
        spread: 30,
        type: 'magic',
      },
    };
    
    return configs[mood] || configs.ethereal;
  }, [currentScene.mood]);
  
  // 生成粒子初始位置
  const { positions, velocities } = useMemo(() => {
    const count = PARTICLE_COUNT;
    const spread = particleConfig.spread;
    
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // 随机位置
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      
      // 随机速度
      velocities[i3] = (Math.random() - 0.5) * particleConfig.speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * particleConfig.speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * particleConfig.speed;
    }
    
    return { positions, velocities };
  }, [particleConfig.spread, particleConfig.speed]);
  
  // 动画更新
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const positions = positionAttribute.array;
    const spread = particleConfig.spread;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 根据粒子类型应用不同的运动模式
      switch (particleConfig.type) {
        case 'fireflies':
          positions[i3] += Math.sin(time * 0.5 + i) * 0.01;
          positions[i3 + 1] += Math.cos(time * 0.3 + i * 0.5) * 0.01;
          positions[i3 + 2] += Math.sin(time * 0.4 + i * 0.7) * 0.01;
          break;
          
        case 'embers':
          positions[i3 + 1] += particleConfig.speed * 0.02;
          positions[i3] += Math.sin(time + i) * 0.005;
          break;
          
        case 'magic':
          const angle = time * particleConfig.speed + i * 0.1;
          positions[i3] += Math.cos(angle) * 0.02;
          positions[i3 + 1] += 0.01;
          positions[i3 + 2] += Math.sin(angle) * 0.02;
          break;
          
        case 'digital':
          positions[i3 + 1] -= particleConfig.speed * 0.03;
          if (positions[i3 + 1] < -spread / 2) {
            positions[i3 + 1] = spread / 2;
          }
          break;
          
        case 'stars':
          // 星星使用 shader 中的 twinkle 效果
          break;
          
        default:
          positions[i3] += velocities[i3] * 0.1;
          positions[i3 + 1] += velocities[i3 + 1] * 0.1;
          positions[i3 + 2] += velocities[i3 + 2] * 0.1;
      }
      
      // 边界检查和重置
      if (Math.abs(positions[i3]) > spread / 2) {
        positions[i3] = (Math.random() - 0.5) * spread;
      }
      if (Math.abs(positions[i3 + 1]) > spread / 2) {
        positions[i3 + 1] = (Math.random() - 0.5) * spread;
      }
      if (Math.abs(positions[i3 + 2]) > spread / 2) {
        positions[i3 + 2] = (Math.random() - 0.5) * spread;
      }
    }
    
    positionAttribute.needsUpdate = true;
  });
  
  // 粒子着色器材质 - 使用 shader 处理大小变化
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(particleConfig.color) },
        size: { value: particleConfig.size },
        time: { value: 0 },
      },
      vertexShader: `
        uniform float size;
        uniform float time;
        varying float vAlpha;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // 使用 shader 处理 twinkle 效果
          float twinkle = 0.7 + 0.3 * sin(time * 3.0 + position.x * 10.0);
          
          gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          // 传递 alpha 值给 fragment shader
          vAlpha = twinkle;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying float vAlpha;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= 0.8 * vAlpha;
          
          // 发光效果
          float glow = 1.0 + 0.3 * sin(time * 5.0);
          vec3 finalColor = color * glow;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [particleConfig.color, particleConfig.size]);
  
  // 更新 shader 的 time uniform
  useFrame((state) => {
    if (particleMaterial.uniforms) {
      particleMaterial.uniforms.time.value = state.clock.getElapsedTime();
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={particleMaterial} attach="material" />
    </points>
  );
};

export default ParticleSystem;
