import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Scene state
  scene: {
    elements: [],
    lighting: {
      ambient: { intensity: 0.3, color: '#8866aa' },
      directional: { intensity: 0.8, color: '#ffffff', position: [5, 10, 5] },
      points: [],
    },
    atmosphere: {
      fogColor: '#0a0a0f',
      fogNear: 10,
      fogFar: 100,
      backgroundColor: '#0a0a0f',
    },
    camera: {
      position: [0, 5, 15],
      fov: 60,
    },
  },
  
  // UI state
  ui: {
    promptInput: '',
    history: [],
    activePreset: null,
    showInfo: false,
    autoRotate: true,
    isGenerating: false,
    showParticles: true,
    quality: 'high',
  },
  
  // Current scene info
  currentScene: {
    description: '欢迎来到 DreamScape 3D - AI 智能场景生成器',
    keywords: [],
    mood: 'ethereal',
    style: 'cosmic',
  },
  
  // Actions
  setPromptInput: (input) => set((state) => ({
    ui: { ...state.ui, promptInput: input }
  })),
  
  setGenerating: (isGenerating) => set((state) => ({
    ui: { ...state.ui, isGenerating }
  })),
  
  updateScene: (sceneData) => set((state) => ({
    scene: { ...state.scene, ...sceneData }
  })),
  
  updateCurrentScene: (sceneInfo) => set((state) => ({
    currentScene: { ...state.currentScene, ...sceneInfo }
  })),
  
  addToHistory: (prompt) => set((state) => ({
    ui: {
      ...state.ui,
      history: [prompt, ...state.ui.history.slice(0, 19)]
    }
  })),
  
  setAutoRotate: (autoRotate) => set((state) => ({
    ui: { ...state.ui, autoRotate }
  })),
  
  toggleInfo: () => set((state) => ({
    ui: { ...state.ui, showInfo: !state.ui.showInfo }
  })),
  
  toggleParticles: () => set((state) => ({
    ui: { ...state.ui, showParticles: !state.ui.showParticles }
  })),
  
  setQuality: (quality) => set((state) => ({
    ui: { ...state.ui, quality }
  })),
  
  clearScene: () => set((state) => ({
    scene: {
      ...state.scene,
      elements: [],
    },
    currentScene: {
      description: '场景已清空，开始新的幻想...',
      keywords: [],
      mood: 'ethereal',
      style: 'cosmic',
    }
  })),
  
  // Add element to scene
  addElement: (element) => set((state) => ({
    scene: {
      ...state.scene,
      elements: [...state.scene.elements, element]
    }
  })),
  
  // Clear and set new elements
  setElements: (elements) => set((state) => ({
    scene: {
      ...state.scene,
      elements
    }
  })),
  
  // Update lighting
  setLighting: (lighting) => set((state) => ({
    scene: {
      ...state.scene,
      lighting: { ...state.scene.lighting, ...lighting }
    }
  })),
  
  // Update atmosphere
  setAtmosphere: (atmosphere) => set((state) => ({
    scene: {
      ...state.scene,
      atmosphere: { ...state.scene.atmosphere, ...atmosphere }
    }
  })),
}));

export default useStore;
