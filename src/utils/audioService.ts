/**
 * Safe Audio Controller — Native Expo Audio & Web MediaRecorder Fallback
 * Prevents top-level crashes when 'ExponentAV' native module is not linked.
 */

let ExpoAudio: any = null;
try {
  const expoAv = require('expo-av');
  if (expoAv && expoAv.Audio) {
    ExpoAudio = expoAv.Audio;
  }
} catch (e) {
  // ExponentAV native module not loaded in current client
}

export class SafeAudioController {
  private mediaRecorder: any = null;
  private audioChunks: any[] = [];
  private expoRecording: any = null;
  private htmlAudio: any = null;
  private expoSound: any = null;

  async startRecording(): Promise<boolean> {
    if (ExpoAudio) {
      try {
        const permission = await ExpoAudio.requestPermissionsAsync();
        if (!permission.granted) return false;

        await ExpoAudio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await ExpoAudio.Recording.createAsync(
          ExpoAudio.RecordingOptionsPresets.HIGH_QUALITY
        );
        this.expoRecording = recording;
        return true;
      } catch (err) {
        console.warn('ExpoAudio recording failed, trying Web MediaRecorder', err);
      }
    }

    // Web MediaRecorder Fallback
    if (typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioChunks = [];
        this.mediaRecorder = new (window as any).MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event: any) => {
          if (event.data.size > 0) this.audioChunks.push(event.data);
        };
        this.mediaRecorder.start();
        return true;
      } catch (err) {
        console.error('Web getUserMedia failed', err);
      }
    }

    return false;
  }

  async stopRecording(): Promise<string | null> {
    if (this.expoRecording) {
      try {
        await this.expoRecording.stopAndUnloadAsync();
        if (ExpoAudio?.setAudioModeAsync) {
          await ExpoAudio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
        }
        const uri = this.expoRecording.getURI();
        this.expoRecording = null;
        return uri;
      } catch (err) {
        console.error('ExpoAudio stop recording error', err);
      }
    }

    if (this.mediaRecorder) {
      return new Promise((resolve) => {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          this.mediaRecorder = null;
          resolve(audioUrl);
        };
        this.mediaRecorder.stop();
      });
    }

    return null;
  }

  async playAudio(uri: string, onFinish?: () => void): Promise<boolean> {
    this.stopPlayback();

    if (ExpoAudio) {
      try {
        const { sound } = await ExpoAudio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );
        this.expoSound = sound;
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            if (onFinish) onFinish();
          }
        });
        return true;
      } catch (err) {
        console.warn('ExpoAudio play failed, fallback to Web Audio', err);
      }
    }

    if (typeof window !== 'undefined' && (window as any).Audio) {
      try {
        this.htmlAudio = new (window as any).Audio(uri);
        this.htmlAudio.onended = () => {
          if (onFinish) onFinish();
        };
        await this.htmlAudio.play();
        return true;
      } catch (err) {
        console.error('Web Audio play failed', err);
      }
    }

    return false;
  }

  stopPlayback() {
    if (this.expoSound) {
      this.expoSound.unloadAsync().catch(() => {});
      this.expoSound = null;
    }
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio = null;
    }
  }
}
 // Playback volume handler
