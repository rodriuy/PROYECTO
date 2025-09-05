import { StoryGrid } from '@/components/story/StoryGrid';
import { sampleStories } from '@/lib/sample-data';

export default function ExploreMemoriesPage() {
  return (
    <div className="space-y-8">
      <StoryGrid stories={sampleStories} />
    </div>
  );
}
