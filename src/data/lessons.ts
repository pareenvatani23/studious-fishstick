/**
 * ⚠ STUBBED CONTENT — design screens 18 Explore & 19 Video Lesson Detail.
 *
 * Card metadata (title, duration, category, gradient) matches the design.
 * Lesson summaries / scripts / action prompts are clinical content: the one
 * fully shown in the design ("Naming the story") is reproduced verbatim; the
 * rest carry placeholders. Video assets are not bundled — `videoUri` is null
 * and the player shows a placeholder until real media is supplied.
 *
 * No feed, no autoplay-next, no likes/comments — lessons are a finite library.
 */
export type LessonCategory = 'Foundations' | 'Skills' | 'Emotional pulls' | 'Scenarios' | 'Micro lessons';

export interface Lesson {
  id: string;
  title: string;
  durationLabel: string; // e.g. "2 min"
  durationClock: string; // e.g. "2:10"
  category: LessonCategory;
  /** two-stop gradient [from,to] for the thumbnail */
  gradient: [string, string];
  /** short "Try: …" line shown under some cards */
  actionPreview?: string;
  summary: string;
  actionPrompt: string;
  videoUri: string | null;
  /** highlighted in the "Start here" hero rail */
  startHere?: boolean;
  copyFinal: boolean;
}

export const lessons: Lesson[] = [
  {
    id: 'firstShift',
    title: 'Your first shift',
    durationLabel: '3 min',
    durationClock: '3:00',
    category: 'Foundations',
    gradient: ['#A99BD4', '#74C7B8'],
    summary: '[PLACEHOLDER — lesson summary]',
    actionPrompt: '[PLACEHOLDER — action prompt]',
    videoUri: null,
    startHere: true,
    copyFinal: false,
  },
  {
    id: 'namingTheStory',
    title: 'Naming the story',
    durationLabel: '2 min',
    durationClock: '2:10',
    category: 'Skills',
    gradient: ['#74C7B8', '#4f9c8f'],
    actionPreview: 'Try: write one balanced thought',
    // Verbatim from design screen 19.
    summary:
      'Your mind narrates events instantly. This lesson shows how to separate the fact from the story your mind added — so you can respond to what’s real.',
    actionPrompt: 'Write one fact and one story your mind added today.',
    videoUri: null,
    copyFinal: true,
  },
  {
    id: 'approvalTrap',
    title: 'The approval trap',
    durationLabel: '4 min',
    durationClock: '4:00',
    category: 'Emotional pulls',
    gradient: ['#A99BD4', '#7b6cb0'],
    actionPreview: 'Try: delay one reply today',
    summary: '[PLACEHOLDER — lesson summary]',
    actionPrompt: '[PLACEHOLDER — action prompt]',
    videoUri: null,
    copyFinal: false,
  },
  {
    id: 'twoMinuteStart',
    title: 'The two-minute start',
    durationLabel: '3 min',
    durationClock: '3:00',
    category: 'Scenarios',
    gradient: ['#6FC7A0', '#3f9e76'],
    summary: '[PLACEHOLDER — lesson summary]',
    actionPrompt: '[PLACEHOLDER — action prompt]',
    videoUri: null,
    copyFinal: false,
  },
];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);

export const exploreSections: { title: string; lessonIds: string[] }[] = [
  { title: 'Skills · Micro lessons', lessonIds: ['namingTheStory', 'approvalTrap', 'twoMinuteStart'] },
];
