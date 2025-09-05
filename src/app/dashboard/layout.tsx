'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Header } from '@/components/dashboard/Header';
import { Loader2 } from 'lucide-react';
import { realtimeDB, db } from '@/lib/firebase';
import { ref, onChildAdded, query, limitToLast, serverTimestamp, get } from 'firebase/database';
import { collection, query as firestoreQuery, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const eventsRef = ref(realtimeDB, 'nfc_events');
      const nfcQuery = query(eventsRef, limitToLast(1));

      // A check to prevent processing old events on initial load.
      // We get the current server time once, and only process events newer than that.
      let initialLoadTimestamp = Date.now();

      const unsubscribe = onChildAdded(nfcQuery, async (snapshot) => {
        if (!initialLoadDone.current) {
            // Mark initial load as done and skip the first event which is just the last one in DB
            initialLoadDone.current = true;
            return;
        }

        const event = snapshot.val();
        if (event.family_id === user.uid) {
          // Find the story associated with this NFC card ID in Firestore
          const storiesRef = collection(db, `families/${user.uid}/stories`);
          const q = firestoreQuery(storiesRef, where('nfc_card_id', '==', event.nfc_card_id));

          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const storyDoc = querySnapshot.docs[0].data();
            toast({
              title: 'Tarjeta NFC Detectada',
              description: `Reproduciendo la historia: "${storyDoc.title}"`,
            });
          } else {
             toast({
              title: 'Tarjeta Desconocida',
              description: `La tarjeta NFC con ID "${event.nfc_card_id}" no fue encontrada.`,
              variant: 'destructive'
            });
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
