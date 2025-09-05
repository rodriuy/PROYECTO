'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthProvider';
import { realtimeDB } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { Loader2 } from 'lucide-react';

interface LogEntry {
  timestamp: number;
  message: string;
}

export function NfcSimulator() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [cardId, setCardId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const familyId = user?.uid || 'invitado';

  const handleSimulate = async () => {
    if (!cardId.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Ingresa un ID de tarjeta y asegúrate de haber iniciado sesión.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const eventsRef = ref(realtimeDB, 'nfc_events');
      const newEvent = {
        family_id: familyId,
        nfc_card_id: cardId,
        timestamp: serverTimestamp(),
        event_type: 'read',
        device_id: 'webapp_simulator',
      };
      await push(eventsRef, newEvent);

      const message = `Evento NFC simulado para la tarjeta '${cardId}'.`;
      const newLogEntry = { timestamp: Date.now(), message };
      setLog(prevLog => [newLogEntry, ...prevLog]);

      toast({
        title: 'Simulación Exitosa',
        description: `Evento enviado para la tarjeta ${cardId}.`,
      });
      setCardId('');
    } catch (error) {
      console.error('Error simulating NFC event: ', error);
      toast({
        title: 'Error de Simulación',
        description: 'No se pudo enviar el evento. Revisa la consola para más detalles.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('simulationTitle')}</CardTitle>
        <CardDescription>
          Emula la lectura de una tarjeta NFC como lo haría la caja de tesoros. Esto enviará un evento a la Base de Datos en Tiempo Real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="family-id">{t('nfc_sim_familyId')}</Label>
            <Input id="family-id" value={familyId} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nfc-id">{t('nfc_sim_cardId')}</Label>
            <Input
              id="nfc-id"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              placeholder="Ej: receta1, sueldo1"
              disabled={!user}
            />
          </div>
        </div>
        <Button onClick={handleSimulate} className="w-full" disabled={isLoading || !user}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('nfc_sim_simulate')}
        </Button>
        <div className="space-y-2">
            <Label>{t('nfc_sim_log')}</Label>
            <ScrollArea className="h-48 w-full rounded-md border p-4 bg-muted">
                {log.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">Aún no hay eventos.</p>
                ) : (
                    log.map((entry, index) => (
                        <div key={index} className="text-sm mb-2">
                            <span className="font-mono text-muted-foreground mr-2">[{format(entry.timestamp, 'HH:mm:ss')}]</span>
                            <span>{entry.message}</span>
                        </div>
                    ))
                )}
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
