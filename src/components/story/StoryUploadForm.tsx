'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Upload, FileAudio, Sparkles, Paperclip, X, StopCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { transcribeAudioToText } from '@/ai/flows/transcribe-audio-to-text';
import { useAuth } from '@/context/AuthProvider';
import { db, storage, analytics } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { useRouter } from 'next/navigation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const storySchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  family_member_name: z.string().min(2, 'El nombre del familiar es requerido'),
  emotional_tag: z.enum(['amor', 'esfuerzo', 'alegria', 'nostalgia', 'aventura'], {
    required_error: 'Debes seleccionar una etiqueta emocional.',
  }),
  nfc_card_id: z.string().min(1, 'El ID de la tarjeta NFC es requerido'),
  text_transcript: z.string().optional(),
});

export function StoryUploadForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { isRecording, startRecording, stopRecording, audioFile: recordedAudio, resetRecording } = useAudioRecorder();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: { title: '', family_member_name: '', nfc_card_id: '', text_transcript: '' },
  });

  useEffect(() => {
    if (recordedAudio) {
      setAudioFile(recordedAudio);
    }
  }, [recordedAudio]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { toast({ title: "Error", description: "La foto no debe superar los 5MB.", variant: "destructive" }); return; }
      setPhotoFile(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { toast({ title: "Error", description: "El audio no debe superar los 10MB.", variant: "destructive" }); return; }
      setAudioFile(file);
      resetRecording();
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    resetRecording();
  }

  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearAudio();
      startRecording();
    }
  };

  async function onSubmit(values: z.infer<typeof storySchema>) {
    if (!user) { toast({ title: 'Error', description: 'Debes iniciar sesión para subir una historia.', variant: 'destructive' }); return; }
    if (!audioFile && !values.text_transcript) { toast({ title: 'Contenido faltante', description: 'Debes subir un audio o escribir una transcripción.', variant: 'destructive' }); return; }

    setIsSubmitting(true);
    try {
      const familyId = user.uid;
      const storyId = doc(collection(db, `families/${familyId}/stories`)).id;

      let photoURL: string | null = null;
      if (photoFile) {
        const photoRef = ref(storage, `stories/${familyId}/${storyId}/${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      let audioURL: string | null = null;
      if (audioFile) {
        const audioRef = ref(storage, `stories/${familyId}/${storyId}/${audioFile.name}`);
        await uploadBytes(audioRef, audioFile);
        audioURL = await getDownloadURL(audioRef);
      }

      const familyDocRef = doc(db, 'families', familyId);
      const familyDoc = await getDoc(familyDocRef);
      if (!familyDoc.exists()) {
        await setDoc(familyDocRef, { name: user.displayName || `Familia de ${user.email}`, created_at: serverTimestamp(), owner_id: user.uid });
      }

      await addDoc(collection(db, `families/${familyId}/stories`), {
        ...values, story_id: storyId, photo_url: photoURL, audio_url: audioURL, family_id: familyId, timestamp: serverTimestamp(), status: 'published', last_modified: serverTimestamp(),
      });

      if (analytics) {
        logEvent(analytics, 'story_upload', {
          family_id: familyId,
          emotional_tag: values.emotional_tag,
          has_photo: !!photoFile,
          has_audio: !!audioFile,
        });
      }

      toast({ title: '¡Historia Guardada!', description: `"${values.title}" se ha guardado con éxito.` });
      form.reset();
      setPhotoFile(null);
      clearAudio();
      router.push('/dashboard');
    } catch (error) {
      console.error("Error uploading story: ", error);
      toast({ title: 'Error', description: 'No se pudo guardar la historia. Inténtalo de nuevo.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast({ title: 'No hay audio', description: 'Graba o sube un archivo de audio para transcribir.', variant: 'destructive' });
      return;
    }
    setIsTranscribing(true);
    try {
        const audioDataUri = await fileToDataUri(audioFile);
        const result = await transcribeAudioToText({ audioDataUri });
        form.setValue('text_transcript', result.transcription || '');
        toast({ title: t('storyForm_transcribed') });
    } catch (error) {
        console.error("Transcription failed:", error);
        toast({ title: 'Error de Transcripción', description: 'No se pudo transcribir el audio.', variant: 'destructive' });
    } finally {
        setIsTranscribing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('uploadTitle')}</CardTitle>
        <CardDescription>Llena los detalles de tu tesoro familiar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>{t('storyForm_title')}</FormLabel><FormControl><Input placeholder={t('storyForm_title_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="family_member_name" render={({ field }) => ( <FormItem><FormLabel>{t('storyForm_member')}</FormLabel><FormControl><Input placeholder={t('storyForm_member_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <FormField control={form.control} name="emotional_tag" render={({ field }) => ( <FormItem><FormLabel>{t('storyForm_tag')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una etiqueta" /></SelectTrigger></FormControl><SelectContent><SelectItem value="amor">{t('storyForm_tag_amor')}</SelectItem><SelectItem value="esfuerzo">{t('storyForm_tag_esfuerzo')}</SelectItem><SelectItem value="alegria">{t('storyForm_tag_alegria')}</SelectItem><SelectItem value="nostalgia">{t('storyForm_tag_nostalgia')}</SelectItem><SelectItem value="aventura">{t('storyForm_tag_aventura')}</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="nfc_card_id" render={({ field }) => ( <FormItem><FormLabel>{t('storyForm_nfc')}</FormLabel><FormControl><Input placeholder={t('storyForm_nfc_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <FormItem>
              <FormLabel>{t('storyForm_photo')}</FormLabel>
              <FormControl>
                <Input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} accept="image/png, image/jpeg, image/gif" />
                <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-4 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('storyForm_photo_cta')}</span></p><p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB)</p></div>
                </label>
              </FormControl>
              {photoFile && <div className="flex items-center mt-2 text-sm text-muted-foreground"><Paperclip className="h-4 w-4 mr-2" /><span>{photoFile.name}</span><Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => setPhotoFile(null)}><X className="h-4 w-4" /></Button></div>}
            </FormItem>

            <FormItem>
              <FormLabel>{t('storyForm_audio')}</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="button" variant={isRecording ? "destructive" : "outline"} className="flex-1" onClick={handleRecordButtonClick}>
                    {isRecording ? <><StopCircle className="mr-2 h-4 w-4" />Detener Grabación</> : <><Mic className="mr-2 h-4 w-4" />{t('storyForm_record')}</>}
                  </Button>
                  <Input id="audio-upload" type="file" className="hidden" onChange={handleAudioChange} accept="audio/mpeg, audio/wav, audio/ogg, audio/webm" />
                  <label htmlFor="audio-upload" className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                    <FileAudio className="mr-2 h-4 w-4" />{t('storyForm_uploadAudio')}
                  </label>
              </div>
               {audioFile && <div className="flex items-center mt-2 text-sm text-muted-foreground"><Paperclip className="h-4 w-4 mr-2" /><span>{audioFile.name}</span><Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={clearAudio}><X className="h-4 w-4" /></Button></div>}
            </FormItem>
            
            <FormField control={form.control} name="text_transcript" render={({ field }) => (<FormItem><div className="flex justify-between items-center"><FormLabel>{t('storyForm_transcript')}</FormLabel><Button type="button" size="sm" onClick={handleTranscribe} disabled={isTranscribing || !audioFile}>{isTranscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{t('storyForm_transcript_ai')}</Button></div><FormControl><Textarea rows={6} placeholder={t('storyForm_transcript_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('storyForm_submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
