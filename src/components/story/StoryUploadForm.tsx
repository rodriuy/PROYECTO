'use client';

import { useState } from 'react';
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
import { Loader2, Mic, Upload, FileAudio, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { transcribeAudioToText } from '@/ai/flows/transcribe-audio-to-text';

const storySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  family_member_name: z.string().min(2, 'Member name is required'),
  emotional_tag: z.enum(['amor', 'esfuerzo', 'alegría', 'nostalgia', 'aventura']),
  nfc_card_id: z.string().min(1, 'NFC Card ID is required'),
  text_transcript: z.string().optional(),
});

export function StoryUploadForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const form = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      family_member_name: '',
      nfc_card_id: '',
      text_transcript: '',
    },
  });

  async function onSubmit(values: z.infer<typeof storySchema>) {
    // In a real app, upload files to Firebase Storage, then save metadata to Firestore.
    console.log(values);
    toast({
      title: 'Historia Guardada',
      description: `"${values.title}" se ha guardado con éxito.`,
    });
    form.reset();
  }
  
  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
        // This is a mock audio data URI. In a real app, you'd get this from a recorded or uploaded file.
        const mockAudioDataUri = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        const result = await transcribeAudioToText({ audioDataUri: mockAudioDataUri });
        form.setValue('text_transcript', result.transcription || 'La transcripción de la abuela...');
        toast({ title: t('storyForm_transcribed') });
    } catch (error) {
        console.error("Transcription failed:", error);
        form.setValue('text_transcript', t('storyForm_transcript_placeholder'));
        toast({
            title: 'Error',
            description: 'Failed to transcribe audio.',
            variant: 'destructive'
        });
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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('storyForm_title')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('storyForm_title_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="family_member_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('storyForm_member')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('storyForm_member_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="emotional_tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('storyForm_tag')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('storyForm_tag')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="amor">{t('storyForm_tag_amor')}</SelectItem>
                        <SelectItem value="esfuerzo">{t('storyForm_tag_esfuerzo')}</SelectItem>
                        <SelectItem value="alegría">{t('storyForm_tag_alegria')}</SelectItem>
                        <SelectItem value="nostalgia">{t('storyForm_tag_nostalgia')}</SelectItem>
                        <SelectItem value="aventura">{t('storyForm_tag_aventura')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nfc_card_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('storyForm_nfc')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('storyForm_nfc_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormItem>
              <FormLabel>{t('storyForm_photo')}</FormLabel>
              <FormControl>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold"> {t('storyForm_photo_cta')}</span></p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" />
                    </label>
                </div> 
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>{t('storyForm_audio')}</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="button" variant="outline" className="flex-1"><Mic className="mr-2 h-4 w-4" />{t('storyForm_record')}</Button>
                  <Button type="button" variant="outline" className="flex-1"><FileAudio className="mr-2 h-4 w-4" />{t('storyForm_uploadAudio')}</Button>
              </div>
            </FormItem>
            
            <FormField
              control={form.control}
              name="text_transcript"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('storyForm_transcript')}</FormLabel>
                    <Button type="button" size="sm" onClick={handleTranscribe} disabled={isTranscribing}>
                      {isTranscribing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {t('storyForm_transcript_ai')}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea rows={6} placeholder={t('storyForm_transcript_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg">
              {t('storyForm_submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
