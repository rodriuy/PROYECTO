'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { db, analytics } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Story } from '@/lib/types';
import { logEvent } from 'firebase/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Volume2 } from 'lucide-react';
import { generateInteractiveAvatarPreview } from '@/ai/flows/generate-interactive-avatar-preview';
import { Skeleton } from '@/components/ui/skeleton';

export default function AvatarPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch user's stories
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: 'AvatarPage',
        firebase_screen_class: 'Dashboard',
      });
    }
  }, []);

  // Fetch user's stories
  useEffect(() => {
    if (user) {
      const q = query(collection(db, `families/${user.uid}/stories`), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const storiesData: Story[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        setStories(storiesData);
        setIsLoadingStories(false);
      }, (error) => {
        console.error("Error fetching stories: ", error);
        setIsLoadingStories(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleStorySelect = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setSelectedStory(story);
      setAnswer('');
      setQuestion('');
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory || !question.trim()) {
      toast({ title: 'Faltan datos', description: 'Por favor, selecciona una historia y escribe una pregunta.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setAnswer('');

    try {
      const response = await generateInteractiveAvatarPreview({
        storyTranscript: selectedStory.text_transcript,
        storyTitle: selectedStory.title,
        familyName: selectedStory.family_member_name,
        userQuestion: question,
      });

      if (analytics) {
        logEvent(analytics, 'avatar_interaction', {
            family_id: user.uid,
            story_id: selectedStory.id,
        });
      }

      setAnswer(response.answer);
      if (audioRef.current) {
        audioRef.current.src = response.audioDataUri;
        audioRef.current.play();
      }

    } catch (error) {
      console.error("Error generating avatar response:", error);
      toast({ title: 'Error', description: 'No se pudo generar la respuesta del avatar.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingStories) {
    return <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Avatar Interactivo</CardTitle>
          <CardDescription>
            Selecciona una historia y hazle una pregunta al avatar de tu familiar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Seleccionar Historia</Label>
            <Select onValueChange={handleStorySelect} disabled={stories.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={stories.length > 0 ? "Elige un tesoro para revivir" : "No hay historias disponibles"} />
              </SelectTrigger>
              <SelectContent>
                {stories.map((story) => (
                  <SelectItem key={story.id} value={story.id}>
                    {story.title} (por {story.family_member_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStory && (
            <div className="space-y-4 animate-fade-in">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedStory.title}</CardTitle>
                  <CardDescription>Transcripción original:</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    "{selectedStory.text_transcript}"
                  </p>
                </CardContent>
              </Card>

              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Tu Pregunta</Label>
                  <Input
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={`¿Qué más quieres saber?`}
                  />
                </div>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Preguntar al Avatar
                </Button>
              </form>

              {isGenerating && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>El avatar de {selectedStory.family_member_name} está pensando...</span>
                </div>
              )}

              {answer && (
                 <Card className="bg-primary/10 animate-fade-in">
                    <CardHeader>
                        <CardTitle className="text-lg">Respuesta del Avatar</CardTitle>
                        <CardDescription>
                            <Button variant="ghost" size="sm" onClick={() => audioRef.current?.play()}>
                                <Volume2 className="h-4 w-4 mr-2" />
                                Escuchar de nuevo
                            </Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-primary/90">
                            "{answer}"
                        </p>
                    </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
