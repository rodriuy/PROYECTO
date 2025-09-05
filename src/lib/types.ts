export type Story = {
  story_id: string;
  title: string;
  audio_url?: string;
  photo_url: string;
  text_transcript: string;
  family_member_name: string;
  emotional_tag: 'amor' | 'esfuerzo' | 'alegría' | 'nostalgia' | 'aventura';
  nfc_card_id: string;
  timestamp: number;
  status: 'draft' | 'published' | 'archived';
};
