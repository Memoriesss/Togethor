class SpeechRecognizer {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    this.targetChar = '';
    
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('浏览器不支持语音识别');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      this.handleResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  startListening(targetChar) {
    if (!this.recognition) {
      return Promise.reject(new Error('浏览器不支持语音识别'));
    }

    this.targetChar = targetChar;
    this.isListening = true;

    return new Promise((resolve, reject) => {
      this.onResult = (isMatch, transcript) => {
        resolve({ isMatch, transcript });
      };

      this.onError = (error) => {
        reject(new Error(error));
      };

      try {
        this.recognition.start();
      } catch (e) {
        this.isListening = false;
        reject(e);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  handleResult(transcript) {
    const isMatch = this.checkMatch(transcript);
    if (this.onResult) {
      this.onResult(isMatch, transcript);
    }
  }

  checkMatch(transcript) {
    if (!transcript || !this.targetChar) return false;
    
    const normalizedTranscript = transcript.toLowerCase();
    const normalizedTarget = this.targetChar.toLowerCase();
    
    return normalizedTranscript.includes(normalizedTarget) || 
           normalizedTranscript === normalizedTarget;
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

window.SpeechRecognizer = SpeechRecognizer;
