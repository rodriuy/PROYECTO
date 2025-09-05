'use client';

import { useState, useMemo } from 'react';
import type { Story } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoryCard } from './StoryCard';
import { useTranslation } from '@/hooks/use-translation';

interface StoryGridProps {
  stories: Story[];
}

const tags: Story['emotional_tag'][] = ['amor', 'esfuerzo', 'alegría', 'nostalgia', 'aventura'];

export function StoryGrid({ stories }: StoryGridProps) {
  const { t } = useTranslation();
  const [memberFilter, setMemberFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const memberMatch = story.family_member_name.toLowerCase().includes(memberFilter.toLowerCase());
      const tagMatch = tagFilter === 'all' || story.emotional_tag === tagFilter;
      return memberMatch && tagMatch;
    });
  }, [stories, memberFilter, tagFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder={t('filterByMember')}
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('filterByTag')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTags')}</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {t(`storyForm_tag_${tag}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.story_id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No stories found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
