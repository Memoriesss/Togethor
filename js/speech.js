export class SpeechRecognizer {
  constructor() {
    this.recognition = null;
    this.isSupported = this.checkSupport();
    this.currentTarget = '';
    this.onResult = null;
  }

  checkSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  async startListening(targetChar) {
    return new Promise((resolve) => {
      if (!this.isSupported) {
        resolve({ isMatch: false, result: '' });
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;
      this.currentTarget = targetChar;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        const isMatch = this.checkMatch(transcript, targetChar);
        resolve({ isMatch, result: transcript });
        this.stop();
      };

      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        resolve({ isMatch: false, result: '' });
        this.stop();
      };

      this.recognition.onend = () => {
        if (this.recognition) {
          this.recognition = null;
        }
      };

      this.recognition.start();
    });
  }

  checkMatch(transcript, target) {
    const pinyinMap = {
      '山': ['山', 'shan', 'shān'],
      '水': ['水', 'shui', 'shuǐ'],
      '日': ['日', 'ri', 'rì'],
      '月': ['月', 'yue', 'yuè'],
      '花': ['花', 'hua', 'huā'],
      '树': ['树', 'shu', 'shù'],
      '鸟': ['鸟', 'niao', 'niǎo'],
      '鱼': ['鱼', 'yu', 'yú']
    };

    const targetPinyins = pinyinMap[target] || [target];
    const lowerTranscript = transcript.toLowerCase().replace(/\s/g, '');
    
    return targetPinyins.some(pinyin => 
      lowerTranscript.includes(pinyin.toLowerCase())
    );
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.log('停止识别');
      }
      this.recognition = null;
    }
  }
}
