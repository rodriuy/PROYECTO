import { AvatarPreview } from '@/components/avatar/AvatarPreview';
import { sampleStories } from '@/lib/sample-data';

export default function AvatarPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <AvatarPreview stories={sampleStories} />
    </div>
  );
}
