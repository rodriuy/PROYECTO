import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setAudioFile(null);
      setAudioUrl(null);
      audioChunksRef.current = [];

      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (typeof event.data === 'undefined') return;
        if (event.data.size === 0) return;
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioFile = new File([audioBlob], `recording-${new Date().toISOString()}.webm`, { type: 'audio/webm' });
        setAudioUrl(audioUrl);
        setAudioFile(audioFile);

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      // You could add state here to show a permission denied error to the user
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    setAudioFile(null);
    setAudioUrl(null);
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }

  return { isRecording, startRecording, stopRecording, audioFile, audioUrl, resetRecording };
};
