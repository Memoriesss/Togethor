import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../stores/useStore';

/**
 * 信息展示层组件
 */
const InfoOverlay = () => {
  const ui = useStore((state) => state.ui);
  const currentScene = useStore((state) => state.currentScene);
  const scene = useStore((state) => state.scene);
  
  if (!ui.showInfo) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.4 }}
        className="absolute top-20 right-4 z-20"
      >
        <div className="glass-dark rounded-xl p-5 w-72 space-y-4">
          {/* 标题 */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-sm font-semibold text-white/90">场景信息</h3>
          </div>
          
          {/* 当前描述 */}
          <div>
            <div className="text-xs text-white/50 mb-1">当前描述</div>
            <p className="text-sm text-white/80 leading-relaxed">
              {currentScene.description}
            </p>
          </div>
          
          {/* 关键词 */}
          {currentScene.keywords && currentScene.keywords.length > 0 && (
            <div>
              <div className="text-xs text-white/50 mb-2">关键词</div>
              <div className="flex flex-wrap gap-1">
                {currentScene.keywords.slice(0, 8).map((keyword, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-2 py-1 bg-cyber-teal/20 rounded text-xs text-cyber-teal"
                  >
                    {keyword}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {/* 场景统计 */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
            <div>
              <div className="text-xs text-white/50">元素数量</div>
              <div className="text-lg font-semibold text-cyber-teal">
                {scene.elements.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50">氛围类型</div>
              <div className="text-lg font-semibold text-purple-400">
                {currentScene.mood || 'ethereal'}
              </div>
            </div>
          </div>
          
          {/* 操作提示 */}
          <div className="text-xs text-white/40 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <div>🖱️ 拖拽旋转视角</div>
              <div>🔍 滚轮缩放场景</div>
              <div>⌨️ 输入描述生成新场景</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoOverlay;
