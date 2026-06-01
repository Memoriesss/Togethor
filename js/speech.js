export class SpeechRecognizer {
  constructor() {
    this.recognition = null;
    this.isSupported = this.checkSupport();
    this.currentTarget = '';
    this.onResult = null;
    this.networkErrorCount = 0;
    this.networkErrorCooldown = false;
    this.onInterimResult = null;
    this.continuousListening = false;
  }

  checkSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  async startListening(targetChar) {
    return new Promise((resolve) => {
      if (!this.isSupported || this.networkErrorCooldown) {
        resolve({ isMatch: false, result: '' });
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.interimResults = true;
      this.recognition.continuous = true;
      this.recognition.maxAlternatives = 3;
      this.currentTarget = targetChar;

      this.recognition.onresult = (event) => {
        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          
          if (this.onInterimResult) {
            this.onInterimResult(transcript);
          }
          
          if (this.checkSingleCharMatch(transcript, targetChar)) {
            resolve({ isMatch: true, result: transcript });
            this.stop();
            return;
          }
          
          if (result.isFinal) {
            const isMatch = this.checkMatch(transcript, targetChar);
            resolve({ isMatch, result: transcript });
            this.stop();
            return;
          }
        }
      };

      this.recognition.onerror = (event) => {
        const ignoredErrors = ['network', 'aborted', 'no-speech'];
        if (ignoredErrors.includes(event.error)) {
          resolve({ isMatch: false, result: '' });
          this.stop();
          return;
        }
        console.error('语音识别错误:', event.error);
        resolve({ isMatch: false, result: '' });
        this.stop();
      };

      this.recognition.onend = () => {
        if (this.recognition && this.continuousListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.recognition = null;
          }
        } else {
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
    
    if (targetPinyins.some(pinyin => 
      lowerTranscript.includes(pinyin.toLowerCase())
    )) {
      return true;
    }
    
    return transcript.includes(target);
  }
  
  checkSingleCharMatch(transcript, targetChar) {
    return transcript.includes(targetChar);
  }

  stop() {
    this.continuousListening = false;
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
