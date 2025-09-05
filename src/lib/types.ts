import { Timestamp } from 'firebase/firestore';

export type Story = {
  id: string; // Firestore document ID
  story_id: string;
  title: string;
  audio_url?: string;
  photo_url?: string;
  text_transcript: string;
  family_member_name: string;
  emotional_tag: 'amor' | 'esfuerzo' | 'alegria' | 'nostalgia' | 'aventura';
  nfc_card_id: string;
  timestamp: number | Timestamp;
  status: 'draft' | 'published' | 'archived';
  family_id: string;
  last_modified: number | Timestamp;
};
