'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlayCircle, MoreVertical, Download, FileText, FileAudio } from 'lucide-react';
import type { Story } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handlePdfExport = async () => {
    setIsExporting(true);
    const storyElement = document.getElementById(`story-export-${story.id}`);
    if (storyElement) {
      try {
        const canvas = await html2canvas(storyElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${story.title.replace(/ /g, '_')}.pdf`);
      } catch (error) {
        console.error("Error exporting PDF:", error);
      } finally {
        setIsExporting(false);
      }
    }
  };

  return (
    <>
      {/* Hidden element for PDF export */}
      <div id={`story-export-${story.id}`} className="p-10" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', background: 'white', color: 'black' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{story.title}</h1>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Contada por: {story.family_member_name}</h2>
        {story.photo_url && <img src={story.photo_url} alt={story.title} style={{ maxWidth: '100%', marginBottom: '20px' }} crossOrigin="anonymous" />}
        <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{story.text_transcript}</p>
      </div>

      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="aspect-video relative">
            {story.photo_url ? (
              <Image
                src={story.photo_url}
                alt={story.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <FileText className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <Badge variant="secondary" className="mb-2 capitalize">{t(`storyForm_tag_${story.emotional_tag}` as any)}</Badge>
          <CardTitle className="text-lg font-headline font-bold mb-1">{story.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{story.family_member_name}</p>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          <Button className="flex-grow bg-accent text-accent-foreground hover:bg-accent/90">
            <PlayCircle className="mr-2 h-5 w-5" />
            {t('playStory')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePdfExport} disabled={isExporting}>
                <FileText className="mr-2 h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar como PDF'}
              </DropdownMenuItem>
              {story.audio_url && (
                <DropdownMenuItem asChild>
                  <a href={story.audio_url} download>
                    <FileAudio className="mr-2 h-4 w-4" />
                    Descargar Audio
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </>
  );
}
