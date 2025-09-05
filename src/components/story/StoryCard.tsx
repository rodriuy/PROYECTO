import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import type { Story } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={story.photo_url}
            alt={story.title}
            fill
            className="object-cover"
            data-ai-hint="family memory"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <Badge variant="secondary" className="mb-2 capitalize">{t(`storyForm_tag_${story.emotional_tag}` as any)}</Badge>
        <CardTitle className="text-lg font-headline font-bold mb-1">{story.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{story.family_member_name}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <PlayCircle className="mr-2 h-5 w-5" />
          {t('playStory')}
        </Button>
      </CardFooter>
    </Card>
  );
}
