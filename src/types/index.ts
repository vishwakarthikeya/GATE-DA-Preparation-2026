export type ResourceType = 'YouTube video' | 'YouTube playlist' | 'General website' | 'Raw GitHub text or Markdown' | 'GitHub-hosted PDF' | 'GitHub-hosted image' | 'College learning platform or course';
export interface WeightageCategory { id: string; name: string; percentage?: number; note?: string }
export interface Topic { id: string; title: string }
export interface StudySection { id: string; number: number; name: string; categoryId: string; topics: Topic[] }
export interface OwnedRecord { id: string; ownerId: string; sectionId: string; createdAt: string; updatedAt: string }
export interface StudyResource extends OwnedRecord { title: string; url: string; type: ResourceType; description?: string }
// content is retained for legacy handwritten notes. New note records are
// link-based and use description, url, and type instead.
export interface Note extends OwnedRecord { title: string; content?: string; description?: string; url?: string; type?: ResourceType }
export interface ShortNote extends Note {}
export interface DailyTask extends OwnedRecord { title: string; date: string; completed: boolean; completedAt?: string }
export interface SectionProgress { sectionId: string; completedTopicIds: string[]; revisionStatus: 'Not started' | 'In progress' | 'Revised' }
export interface UserPreferences { ownerId: string; theme: 'light' | 'dark'; recentlyOpenedSectionIds: string[] }
