'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { db, analytics } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { StoryGrid } from '@/components/story/StoryGrid';
import { Story } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExploreMemoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: 'ExploreMemoriesPage',
        firebase_screen_class: 'Dashboard',
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, `families/${user.uid}/stories`),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const storiesData: Story[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Firestore timestamps need to be converted to JS Date objects then to numbers
          const timestamp = data.timestamp?.toDate().getTime() || Date.now();
          storiesData.push({ id: doc.id, ...data, timestamp } as Story);
        });
        setStories(storiesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching stories: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // No user, so no stories to fetch
      setLoading(false);
      setStories([]);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-2">Aún no hay tesoros en tu baúl</h2>
        <p className="text-muted-foreground mb-6">
          ¿Qué tal si agregas la primera historia?
        </p>
        <Button asChild>
          <Link href="/dashboard/upload">Subir una Historia</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StoryGrid stories={stories} />
    </div>
  );
}
