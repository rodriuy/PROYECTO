'use client';

import { useEffect } from 'react';
import { NfcSimulator } from '@/components/simulation/NfcSimulator';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export default function SimulationPage() {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: 'SimulationPage',
        firebase_screen_class: 'Dashboard',
      });
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <NfcSimulator />
    </div>
  );
}
