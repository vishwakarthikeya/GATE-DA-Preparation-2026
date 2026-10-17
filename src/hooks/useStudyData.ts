import { useEffect, useState } from 'react';
import { sections } from '../config/sections';
import { repository } from '../services/repository';
import { useAuth } from '../services/auth';
import type { DailyTask, SectionProgress } from '../types';

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const emptyProgress = (sectionId: string): SectionProgress => ({ sectionId, completedTopicIds: [], revisionStatus: 'Not started' });
const normalizeProgress = (sectionId: string, value: SectionProgress) => {
  const section = sections.find((item) => item.id === sectionId);
  const validIds = new Set(section?.topics.map((topic) => topic.id) ?? []);
  const completedTopicIds = Array.isArray(value.completedTopicIds) ? [...new Set(value.completedTopicIds.filter((id): id is string => typeof id === 'string' && validIds.has(id)))] : [];
  const revisionStatus = value.revisionStatus === 'In progress' || value.revisionStatus === 'Revised' ? value.revisionStatus : 'Not started';
  return { sectionId, completedTopicIds, revisionStatus } as SectionProgress;
};

export function useSectionTasks(sectionId: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<DailyTask[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const day = localDate();
  useEffect(() => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true); setError('');
    return repository.tasks.subscribe(user.uid, sectionId, day, (next) => { setItems(next); setLoading(false); }, (message) => { setError(message); setLoading(false); });
  }, [user?.uid, sectionId, day]);
  return { items, error, loading };
}

export function useSectionProgress(sectionId: string) {
  const { user } = useAuth();
  const [value, setValue] = useState<SectionProgress>(() => emptyProgress(sectionId));
  const [error, setError] = useState('');
  useEffect(() => {
    setValue(emptyProgress(sectionId)); setError('');
    if (!user) return;
    return repository.progress.subscribe(user.uid, sectionId, (next) => setValue(normalizeProgress(sectionId, next)), setError);
  }, [user?.uid, sectionId]);
  return { value, error };
}

export function useDashboardData() {
  const { user } = useAuth();
  const [progressBySection, setProgressBySection] = useState<Record<string, SectionProgress>>({});
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const day = localDate();
  useEffect(() => {
    if (!user) { setProgressBySection({}); setTasks([]); setLoading(false); return; }
    setLoading(true); setError('');
    const progress: Record<string, SectionProgress> = {};
    const taskMap = new Map<string, DailyTask[]>();
    const syncTasks = () => setTasks([...taskMap.values()].flat());
    const finish = () => setLoading(false);
    const stop = sections.flatMap((section) => [
      repository.progress.subscribe(user.uid, section.id, (value) => { progress[section.id] = normalizeProgress(section.id, value); setProgressBySection({ ...progress }); finish(); }, (message) => { setError(message); finish(); }),
      repository.tasks.subscribe(user.uid, section.id, day, (items) => { taskMap.set(section.id, items); syncTasks(); finish(); }, (message) => { setError(message); finish(); })
    ]);
    return () => stop.forEach((unsubscribe) => unsubscribe());
  }, [user?.uid, day]);
  return { progressBySection, tasks, error, loading };
}
