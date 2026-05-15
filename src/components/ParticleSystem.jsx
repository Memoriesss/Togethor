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
  
  // 粒子配置
  const particleConfig = useMemo(() => {
    const mood = currentScene.mood || 'ethereal';
    
    const configs = {
      mysterious: {
        count: 800,
        size: 0.05,
        color: '#6666aa',
        speed: 0.1,
        spread: 30,
        type: 'dust',
      },
      peaceful: {
        count: 200,
        size: 0.08,
        color: '#88ff88',
        speed: 0.15,
        spread: 25,
        type: 'fireflies',
      },
      energetic: {
        count: 1000,
        size: 0.06,
        color: '#ff66ff',
        speed: 0.8,
        spread: 35,
        type: 'magic',
      },
      dark: {
        count: 500,
        size: 0.07,
        color: '#ff4500',
        speed: 0.3,
        spread: 28,
        type: 'embers',
      },
      ethereal: {
        count: 1500,
        size: 0.04,
        color: '#ffffff',
        speed: 0.05,
        spread: 40,
        type: 'stars',
      },
      cyberpunk: {
        count: 800,
        size: 0.05,
        color: '#00ffff',
        speed: 0.6,
        spread: 32,
        type: 'digital',
      },
      fantasy: {
        count: 600,
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
  const { positions, velocities, sizes } = useMemo(() => {
    const count = particleConfig.count;
    const spread = particleConfig.spread;
    
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
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
      
      // 随机大小
      sizes[i] = particleConfig.size * (0.5 + Math.random() * 1.5);
    }
    
    return { positions, velocities, sizes };
  }, [particleConfig]);
  
  // 动画更新
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const positions = positionAttribute.array;
    const spread = particleConfig.spread;
    
    for (let i = 0; i < particleConfig.count; i++) {
      const i3 = i * 3;
      
      // 根据粒子类型应用不同的运动模式
      switch (particleConfig.type) {
        case 'fireflies':
          // 萤火虫：缓慢漂浮
          positions[i3] += Math.sin(time * 0.5 + i) * 0.01;
          positions[i3 + 1] += Math.cos(time * 0.3 + i * 0.5) * 0.01;
          positions[i3 + 2] += Math.sin(time * 0.4 + i * 0.7) * 0.01;
          break;
          
        case 'embers':
          // 余烬：向上飘动
          positions[i3 + 1] += particleConfig.speed * 0.02;
          positions[i3] += Math.sin(time + i) * 0.005;
          break;
          
        case 'magic':
          // 魔法粒子：螺旋运动
          const angle = time * particleConfig.speed + i * 0.1;
          positions[i3] += Math.cos(angle) * 0.02;
          positions[i3 + 1] += 0.01;
          positions[i3 + 2] += Math.sin(angle) * 0.02;
          break;
          
        case 'digital':
          // 数字雨效果
          positions[i3 + 1] -= particleConfig.speed * 0.03;
          if (positions[i3 + 1] < -spread / 2) {
            positions[i3 + 1] = spread / 2;
          }
          break;
          
        case 'stars':
          // 星星：闪烁
          const twinkle = Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5;
          pointsRef.current.geometry.attributes.size.array[i] = 
            particleConfig.size * twinkle;
          break;
          
        default:
          // 默认：缓慢漂浮
          positions[i3] += velocities[i3] * 0.1;
          positions[i3 + 1] += velocities[i3 + 1] * 0.1;
          positions[i3 + 2] += velocities[i3 + 2] * 0.1;
      }
      
      // 边界检查和重置
      if (Math.abs(positions[i3]) > spread / 2) {
        positions[i3] = -positions[i3] * 0.5;
      }
      if (Math.abs(positions[i3 + 1]) > spread / 2) {
        positions[i3 + 1] = -positions[i3 + 1] * 0.5;
      }
      if (Math.abs(positions[i3 + 2]) > spread / 2) {
        positions[i3 + 2] = -positions[i3 + 2] * 0.5;
      }
    }
    
    positionAttribute.needsUpdate = true;
    
    if (particleConfig.type === 'stars') {
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });
  
  // 粒子着色器材质
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(particleConfig.color) },
        size: { value: particleConfig.size },
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= 0.8;
          
          // 发光效果
          vec3 glow = color * (1.0 + 0.5 * sin(time * 3.0));
          
          gl_FragColor = vec4(mix(color, glow, 0.3), alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
  }, [particleConfig.color, particleConfig.size]);
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleConfig.count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleConfig.count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={particleMaterial} attach="material" />
    </points>
  );
};

export default ParticleSystem;
