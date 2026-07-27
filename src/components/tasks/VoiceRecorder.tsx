import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { SafeAudioController } from '../../utils/audioService';

interface VoiceRecorderProps {
  onAudioRecorded?: (uri: string | null) => void;
  initialAudioUri?: string | null;
  readonly?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioRecorded,
  initialAudioUri = null,
  readonly = false,
}) => {
  const audioControllerRef = useRef(new SafeAudioController());
  const [recordedUri, setRecordedUri] = useState<string | null>(initialAudioUri);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setRecordedUri(initialAudioUri);
  }, [initialAudioUri]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const controller = audioControllerRef.current;
    return () => {
      controller.stopPlayback();
    };
  }, []);

  const startRecording = async () => {
    const success = await audioControllerRef.current.startRecording();
    if (success) {
      setIsRecording(true);
    } else {
      alert('Could not start recording. Microphone permission may be needed.');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const uri = await audioControllerRef.current.stopRecording();
    if (uri) {
      setRecordedUri(uri);
      if (onAudioRecorded) onAudioRecorded(uri);
    }
  };

  const playAudio = async () => {
    if (!recordedUri) return;

    if (isPlaying) {
      audioControllerRef.current.stopPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const played = await audioControllerRef.current.playAudio(recordedUri, () => {
        setIsPlaying(false);
      });
      if (!played) {
        setIsPlaying(false);
      }
    }
  };

  const deleteRecording = async () => {
    audioControllerRef.current.stopPlayback();
    setIsPlaying(false);
    setRecordedUri(null);
    if (onAudioRecorded) onAudioRecorded(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* State 1: Recording in Progress */}
      {isRecording && (
        <View style={styles.recordingActiveBox}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTimer}>{formatTime(recordingDuration)}</Text>
          <Pressable style={styles.stopBtn} onPress={stopRecording}>
            <Ionicons name="square" size={16} color="#FFF" />
            <Text style={styles.btnTextText}>إيقاف التسجيل</Text>
          </Pressable>
        </View>
      )}

      {/* State 2: Recorded Audio Available */}
      {!isRecording && recordedUri && (
        <View style={styles.playbackBox}>
          <Pressable style={styles.playBtn} onPress={playAudio}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFF" />
          </Pressable>
          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle}>ملاحظة صوتية مسجلة 🎤</Text>
            <Text style={styles.audioSubtitle}>اضغط للاستماع</Text>
          </View>
          {!readonly && (
            <Pressable style={styles.deleteBtn} onPress={deleteRecording}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </Pressable>
          )}
        </View>
      )}

      {/* State 3: Ready to Record */}
      {!isRecording && !recordedUri && !readonly && (
        <Pressable style={styles.startRecordBtn} onPress={startRecording}>
          <Ionicons name="mic" size={20} color={Colors.work} />
          <Text style={styles.startRecordText}>تسجيل ملاحظة صوتية (Voice Note)</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  startRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.workBg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.work,
    borderStyle: 'dashed',
  },
  startRecordText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.work,
  },
  recordingActiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  recordingTimer: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.error,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  btnTextText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  playbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgTertiary,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.work,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  audioSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  deleteBtn: {
    padding: 6,
  },
});
