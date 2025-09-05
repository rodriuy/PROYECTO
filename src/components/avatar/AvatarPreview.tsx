'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import type { Story } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { generateInteractiveAvatarPreview } from '@/ai/flows/generate-interactive-avatar-preview';

interface AvatarPreviewProps {
  stories: Story[];
}

export function AvatarPreview({ stories }: AvatarPreviewProps) {
  const { t } = useTranslation();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarResponse, setAvatarResponse] = useState('');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const selectedStory = stories.find(s => s.story_id === selectedStoryId);

  useEffect(() => {
    if (selectedStoryId && !avatarResponse) {
      handleGeneratePreview();
    }
  }, [selectedStoryId]);

  useEffect(() => {
    if (audioDataUri && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  }, [audioDataUri]);

  const handleGeneratePreview = async (question?: string) => {
    if (!selectedStory) return;
    setIsLoading(true);
    setAvatarResponse('');
    setAudioDataUri(null);

    try {
      const result = await generateInteractiveAvatarPreview({
        storyTitle: selectedStory.title,
        storyText: selectedStory.text_transcript,
        userName: 'User', // In a real app, this would be the logged-in user's name
        userQuestion: question,
      });

      setAvatarResponse(result.avatarResponse);
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      console.error('Failed to generate avatar preview:', error);
      setAvatarResponse('Lo siento, no puedo responder en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    handleGeneratePreview(userQuestion);
    setUserQuestion('');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">{t('avatarTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="story-select">{t('avatar_selectStory')}</Label>
          <Select onValueChange={setSelectedStoryId}>
            <SelectTrigger id="story-select">
              <SelectValue placeholder={t('avatar_selectStory')} />
            </SelectTrigger>
            <SelectContent>
              {stories.map(story => (
                <SelectItem key={story.story_id} value={story.story_id}>
                  {story.title} - {story.family_member_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStory && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-lg border-4 border-accent">
                <Image
                  src={selectedStory.photo_url}
                  alt={selectedStory.family_member_name}
                  fill
                  className="object-cover"
                  data-ai-hint="portrait elderly"
                />
              </div>
              <h3 className="text-xl font-bold">{selectedStory.family_member_name}</h3>
            </div>
            
            <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg min-h-[150px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <p className="text-foreground">{avatarResponse || `Seleccioná una historia para que ${selectedStory.family_member_name} te cuente algo.`}</p>
                    )}
                </div>

                {audioDataUri && <audio ref={audioRef} src={audioDataUri} controls className="w-full" />}
                
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                    <Input
                        value={userQuestion}
                        onChange={e => setUserQuestion(e.target.value)}
                        placeholder={t('avatar_askQuestion')}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !userQuestion.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">{t('avatar_ask')}</span>
                    </Button>
                </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
