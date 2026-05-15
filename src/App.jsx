import React, { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Scene from './components/Scene';
import PromptInput from './components/PromptInput';
import ControlPanel from './components/ControlPanel';
import InfoOverlay from './components/InfoOverlay';
import useStore from './stores/useStore';
import SceneGenerator from './three/SceneGenerator';

const sceneGenerator = new SceneGenerator();

function App() {
  const setGenerating = useStore((state) => state.setGenerating);
  const setElements = useStore((state) => state.setElements);
  const setLighting = useStore((state) => state.setLighting);
  const setAtmosphere = useStore((state) => state.setAtmosphere);
  const updateCurrentScene = useStore((state) => state.updateCurrentScene);
  const clearScene = useStore((state) => state.clearScene);
  
  /**
   * 处理场景生成
   */
  const handleGenerate = useCallback(async (prompt) => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    
    try {
      // 使用场景生成器生成场景
      const sceneConfig = sceneGenerator.generateScene(prompt);
      
      // 更新状态
      setElements(sceneConfig.elements);
      setLighting(sceneConfig.lighting);
      setAtmosphere(sceneConfig.atmosphere);
      
      // 更新场景信息
      updateCurrentScene({
        description: prompt,
        keywords: sceneConfig.metadata.parsedPrompt.keywords,
        mood: sceneConfig.metadata.parsedPrompt.mood,
        style: sceneConfig.metadata.parsedPrompt.style,
      });
      
      // 模拟生成延迟，提供更好的用户体验
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('场景生成失败:', error);
    } finally {
      setGenerating(false);
    }
  }, [setGenerating, setElements, setLighting, setAtmosphere, updateCurrentScene]);
  
  /**
   * 处理清空场景
   */
  const handleClear = useCallback(() => {
    clearScene();
  }, [clearScene]);
  
  /**
   * 处理继续幻想
   */
  const handleContinue = useCallback((additionalPrompt) => {
    const currentDescription = useStore.getState().currentScene.description;
    const combinedPrompt = `${currentDescription}，${additionalPrompt}`;
    handleGenerate(combinedPrompt);
  }, [handleGenerate]);
  
  /**
   * 键盘快捷键
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      // 空格键：切换自动旋转
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        useStore.getState().setAutoRotate(!useStore.getState().ui.autoRotate);
      }
      
      // P 键：切换粒子效果
      if (e.code === 'KeyP' && e.target.tagName !== 'INPUT') {
        useStore.getState().toggleParticles();
      }
      
      // I 键：切换信息显示
      if (e.code === 'KeyI' && e.target.tagName !== 'INPUT') {
        useStore.getState().toggleInfo();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-deep-space">
      {/* 3D 场景层 */}
      <Scene />
      
      {/* UI 覆盖层 */}
      <div className="ui-overlay">
        {/* 顶部标题 */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-0 left-0 right-0 p-6 text-center z-20"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
            DreamScape 3D
          </h1>
          <p className="text-sm text-white/60 font-body">
            AI 智能场景生成器 - 用文字创造无限可能
          </p>
        </motion.div>
        
        {/* 左侧控制面板 */}
        <ControlPanel 
          onClear={handleClear}
          onContinue={handleContinue}
        />
        
        {/* 右侧信息层 */}
        <InfoOverlay />
        
        {/* 底部提示词输入 */}
        <PromptInput onGenerate={handleGenerate} />
      </div>
      
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-teal/10 rounded-full blur-3xl animate-float" 
             style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}

export default App;
