import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../stores/useStore';

/**
 * 控制面板组件
 */
const ControlPanel = ({ onClear, onContinue }) => {
  const ui = useStore((state) => state.ui);
  const currentScene = useStore((state) => state.currentScene);
  const setAutoRotate = useStore((state) => state.setAutoRotate);
  const toggleParticles = useStore((state) => state.toggleParticles);
  const toggleInfo = useStore((state) => state.toggleInfo);
  
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="absolute top-20 left-4 z-20"
    >
      <div className="glass-dark rounded-xl p-4 space-y-3 w-48">
        <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <span>🎮</span>
          控制面板
        </h3>
        
        {/* 自动旋转 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">自动旋转</span>
          <button
            onClick={() => setAutoRotate(!ui.autoRotate)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
              ui.autoRotate ? 'bg-cyber-teal' : 'bg-white/20'
            }`}
          >
            <motion.div
              animate={{ x: ui.autoRotate ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
        
        {/* 粒子效果 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">粒子效果</span>
          <button
            onClick={toggleParticles}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
              ui.showParticles ? 'bg-purple-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              animate={{ x: ui.showParticles ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
        
        {/* 场景信息 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">显示信息</span>
          <button
            onClick={toggleInfo}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
              ui.showInfo ? 'bg-cosmic-pink' : 'bg-white/20'
            }`}
          >
            <motion.div
              animate={{ x: ui.showInfo ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
        
        <div className="border-t border-white/10 pt-3 mt-3">
          {/* 清空场景 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg 
                       text-xs text-white/80 transition-colors duration-300 mb-2"
          >
            🗑️ 清空场景
          </motion.button>
        </div>
        
        {/* 当前氛围 */}
        <div className="text-xs text-white/50 mt-2">
          当前氛围：
          <span className="text-cyber-teal ml-1">
            {currentScene.mood === 'ethereal' ? '✨ 空灵' :
             currentScene.mood === 'cyberpunk' ? '🤖 赛博' :
             currentScene.mood === 'fantasy' ? '🔮 奇幻' :
             currentScene.mood === 'dark' ? '🌑 黑暗' :
             currentScene.mood === 'peaceful' ? '🧘 宁静' :
             currentScene.mood === 'energetic' ? '⚡ 活力' :
             currentScene.mood === 'mysterious' ? '🌙 神秘' : '✨ 空灵'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
