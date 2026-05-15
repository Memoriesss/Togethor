import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../stores/useStore';

/**
 * AI 提示词输入组件
 */
const PromptInput = ({ onGenerate }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  const ui = useStore((state) => state.ui);
  const setPromptInput = useStore((state) => state.setPromptInput);
  const addToHistory = useStore((state) => state.addToHistory);
  
  // 预设模板
  const presets = [
    { 
      label: '🌌 星际探索', 
      prompt: '在深邃的宇宙星空中，一艘霓虹光环绕的飞船穿越星云' 
    },
    { 
      label: '🌸 樱花时节', 
      prompt: '粉色的樱花花瓣在微风中飘落，宁静的日式庭院' 
    },
    { 
      label: '🏙️ 赛博朋克', 
      prompt: '霓虹灯光闪烁的赛博朋克城市，高耸的摩天大楼' 
    },
    { 
      label: '🌙 月光森林', 
      prompt: '神秘的发光森林，月光透过树叶洒下银色的光辉' 
    },
    { 
      label: '🔥 火山熔岩', 
      prompt: '炽热的火山喷发，熔岩流动，橙红色的光芒照耀天空' 
    },
    { 
      label: '❄️ 水晶洞穴', 
      prompt: '闪闪发光的水晶洞穴，透明的水晶柱从地面延伸' 
    },
  ];
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
    setPromptInput(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !ui.isGenerating) {
      addToHistory(input);
      onGenerate(input);
      setInput('');
    }
  };
  
  const handlePresetClick = (preset) => {
    setInput(preset.prompt);
    setPromptInput(preset.prompt);
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-20">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="glass-dark rounded-2xl p-6 shadow-2xl"
      >
        {/* 预设模板 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {presets.map((preset, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePresetClick(preset)}
                className="px-4 py-2 text-sm rounded-full glass-effect text-white/80 
                           hover:text-white hover:neon-text transition-all duration-300"
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="relative">
          <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="描述你想象中的场景... 例如：神秘的星空下漂浮着发光的水晶"
              disabled={ui.isGenerating}
              className="w-full px-6 py-4 bg-deep-space/80 rounded-xl text-white 
                         placeholder-white/40 border-2 border-transparent
                         focus:border-cyber-teal/50 focus:outline-none
                         transition-all duration-300 text-lg
                         shadow-inner"
            />
            
            {/* 聚焦时的光效 */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyber-teal via-purple-500 to-pink-500 opacity-30 blur-sm -z-10"
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-3 mt-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!input.trim() || ui.isGenerating}
              className="px-8 py-3 bg-gradient-to-r from-cyber-teal to-purple-500 
                         rounded-xl font-semibold text-white
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-cyber-teal/50
                         transition-all duration-300 flex items-center gap-2"
            >
              {ui.isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  生成场景
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PromptInput;
