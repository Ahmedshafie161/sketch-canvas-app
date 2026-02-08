export class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recognition = null;
    this.transcript = '';
    this.isRecording = false;
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  async startRecording(onTranscriptUpdate) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.transcript = '';
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();

      // Start transcription
      if (this.recognition) {
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          this.transcript = finalTranscript || interimTranscript;
          
          if (onTranscriptUpdate) {
            onTranscriptUpdate(this.transcript, !finalTranscript);
          }
        };

        this.recognition.start();
      }

      return { success: true };
    } catch (error) {
      console.error('Recording error:', error);
      return { success: false, error: error.message };
    }
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve({ success: false, error: 'Not recording' });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            success: true,
            audioUrl,
            audioData: reader.result,
            transcript: this.transcript,
            duration: this.audioChunks.length
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        this.isRecording = false;
      };

      this.mediaRecorder.stop();

      if (this.recognition) {
        this.recognition.stop();
      }
    });
  }

  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
      this.audioChunks = [];
      this.transcript = '';
      
      if (this.recognition) {
        this.recognition.stop();
      }
    }
  }

  getTranscript() {
    return this.transcript;
  }
}

export const voiceRecorder = new VoiceRecorder();
