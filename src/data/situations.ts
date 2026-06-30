/**
 * ⚠ DRAFT CLINICAL CONTENT — review by a CBT clinician before release.
 *
 * The simplified "Reset" replaces the abstract pulls/virtues/journaling with
 * concrete everyday SITUATIONS. This mirrors how CBT is actually delivered:
 * anchor on a specific recent event → one balanced alternative thought
 * (cognitive restructuring) → one small action (behavioural activation, phrased
 * as an implementation intention).
 *
 * Clinical guardrails encoded here:
 *  - `validate` ALWAYS comes first (validate before reframing — never toxic positivity).
 *  - `reframe` is a *hypothesis to consider*, shown as "another way to look at it"
 *    and editable by the user — never asserted as "the truth".
 *  - `actions` are concrete when/where implementation intentions, not vague advice.
 *
 * Every entry is `copyFinal: false` — this is plausible draft copy so the UX is
 * testable, NOT vetted therapeutic content. See CONTENT_STUBS.md.
 */
import type { IconName } from '../components/icons';

export interface SituationAction {
  text: string;
  minutes: number;
}

export interface Situation {
  id: string;
  /** concrete, first-person, everyday */
  label: string;
  icon: IconName;
  /** validating line shown first */
  validate: string;
  /** balanced alternative thought — a hypothesis, editable */
  reframe: string;
  /** small actions, implementation-intention phrased */
  actions: SituationAction[];
  /** true only when clinician-reviewed */
  copyFinal: boolean;
}

export const situations: Situation[] = [
  {
    id: 'unanswered',
    label: 'Someone didn’t reply',
    icon: 'person',
    validate: 'Waiting on a reply can really get under your skin. That’s a normal thing to feel.',
    reframe:
      'Another way to look at it: the timing of a reply usually says more about how busy their day is than about you. Silence is missing information, not a verdict.',
    actions: [
      { text: 'Set a 30-minute timer before you check the chat again.', minutes: 1 },
      { text: 'Send one clear message, then put your phone face-down for a bit.', minutes: 2 },
    ],
    copyFinal: false,
  },
  {
    id: 'avoiding',
    label: 'Dreading a task',
    icon: 'arrowFade',
    validate: 'When something feels big, putting it off makes sense — avoidance is how the mind tries to feel safe.',
    reframe:
      'Another way to look at it: you don’t have to finish it, or even do it well. Starting for two minutes is usually enough to break the dread.',
    actions: [
      { text: 'Set a timer and do just the first 2 minutes of the task — then stop if you want.', minutes: 2 },
      { text: 'Write the very first tiny step on a sticky note and do only that.', minutes: 2 },
    ],
    copyFinal: false,
  },
  {
    id: 'snapped',
    label: 'Snapped at someone',
    icon: 'flame',
    validate: 'Reacting more sharply than you meant to is human, especially when you’re stretched thin.',
    reframe:
      'Another way to look at it: one sharp moment doesn’t define you or the relationship. A small repair now usually matters more than the slip did.',
    actions: [
      { text: 'Take 3 slow breaths, then send a one-line "sorry, that came out wrong".', minutes: 2 },
      { text: 'Note one thing that left you on edge today, so you can ease it later.', minutes: 2 },
    ],
    copyFinal: false,
  },
  {
    id: 'compared',
    label: 'Compared myself to someone',
    icon: 'bars',
    validate: 'Measuring yourself against someone else is easy to fall into — almost everyone does it.',
    reframe:
      'Another way to look at it: you’re comparing your full inside story to a thin slice of theirs. It’s rarely a fair match.',
    actions: [
      { text: 'Write one small thing you moved forward today, however minor.', minutes: 2 },
      { text: 'Mute or scroll past the feed that set this off, just for today.', minutes: 1 },
    ],
    copyFinal: false,
  },
  {
    id: 'overwhelmed',
    label: 'Too much at once',
    icon: 'cloud',
    validate: 'When everything lands at the same time, feeling overwhelmed is a normal response, not a weakness.',
    reframe:
      'Another way to look at it: you can’t hold it all at once, and you don’t have to. The next single step is the only thing that needs your attention right now.',
    actions: [
      { text: 'Write down everything on your mind, then circle just one to do next.', minutes: 3 },
      { text: 'Take 5 slow breaths before you decide anything else.', minutes: 1 },
    ],
    copyFinal: false,
  },
  {
    id: 'cantSwitchOff',
    label: 'Can’t switch off',
    icon: 'circleDashed',
    validate: 'A mind that keeps running is exhausting, and it’s hard to force it to stop on command.',
    reframe:
      'Another way to look at it: you don’t have to solve the thought tonight. Giving it a set time tomorrow tells your mind it’s safe to set down now.',
    actions: [
      { text: 'Write the worry on paper and a time you’ll look at it tomorrow.', minutes: 2 },
      { text: 'Do a slow 4-count breath: in for 4, out for 6, five times.', minutes: 2 },
    ],
    copyFinal: false,
  },
  {
    id: 'somethingElse',
    label: 'Something else',
    icon: 'plus',
    validate: 'Whatever it is, it’s okay that it’s sitting with you right now.',
    reframe:
      'Another way to look at it: you don’t need to fix the whole thing. Naming it and taking one small step is enough for now.',
    actions: [
      { text: 'Write one sentence about what happened, just as it was.', minutes: 2 },
      { text: 'Choose one small, kind thing you can do in the next 10 minutes.', minutes: 3 },
    ],
    copyFinal: false,
  },
];

export const situationById = (id: string) => situations.find((s) => s.id === id);
