'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface NfcSimulatorProps {
  stories: Story[];
}

interface LogEntry {
  timestamp: number;
  message: string;
  type: 'success' | 'error';
}

export function NfcSimulator({ stories }: NfcSimulatorProps) {
  const { t } = useTranslation();
  const [cardId, setCardId] = useState('');
  const [familyId, setFamilyId] = useState('familia123'); // Emulated
  const [log, setLog] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  const handleSimulate = () => {
    if (!cardId.trim()) return;

    // In a real app, this would push to Firebase Realtime Database.
    // Here, we simulate the logic and UI update.
    const story = stories.find(s => s.nfc_card_id === cardId);
    
    let newLogEntry: LogEntry;

    if (story) {
      const message = t('nfc_sim_detected').replace('{cardId}', cardId).replace('{storyTitle}', story.title);
      newLogEntry = { timestamp: Date.now(), message, type: 'success' };
      toast({
        title: 'Tarjeta Detectada',
        description: `Reproduciendo: "${story.title}"`,
      });
    } else {
      const message = t('nfc_sim_notFound').replace('{cardId}', cardId);
      newLogEntry = { timestamp: Date.now(), message, type: 'error' };
      toast({
        title: 'Tarjeta no encontrada',
        description: `La tarjeta con ID "${cardId}" no está asociada a ninguna historia.`,
        variant: 'destructive',
      });
    }

    setLog(prevLog => [newLogEntry, ...prevLog]);
    setCardId('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('simulationTitle')}</CardTitle>
        <CardDescription>
          Emula la lectura de una tarjeta NFC como lo haría la caja de tesoros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="family-id">{t('nfc_sim_familyId')}</Label>
            <Input id="family-id" value={familyId} onChange={(e) => setFamilyId(e.target.value)} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nfc-id">{t('nfc_sim_cardId')}</Label>
            <Input
              id="nfc-id"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              placeholder="Ej: receta1, sueldo1"
            />
          </div>
        </div>
        <Button onClick={handleSimulate} className="w-full">
          {t('nfc_sim_simulate')}
        </Button>
        <div className="space-y-2">
            <Label>{t('nfc_sim_log')}</Label>
            <ScrollArea className="h-48 w-full rounded-md border p-4 bg-muted">
                {log.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No events yet.</p>
                ) : (
                    log.map((entry, index) => (
                        <div key={index} className="text-sm mb-2">
                            <span className="font-mono text-muted-foreground mr-2">[{format(entry.timestamp, 'HH:mm:ss')}]</span>
                            <span className={entry.type === 'error' ? 'text-destructive' : ''}>{entry.message}</span>
                        </div>
                    ))
                )}
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
