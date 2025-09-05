'use client';

import { useEffect } from 'react';
import { StoryUploadForm } from '@/components/story/StoryUploadForm';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export default function UploadPage() {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: 'UploadPage',
        firebase_screen_class: 'Dashboard',
      });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <StoryUploadForm />
    </div>
  );
}
