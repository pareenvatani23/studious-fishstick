/**
 * ⚠ STUBBED CLINICAL CONTENT — design screen 14 "Reframe".
 *
 * This is the most sensitive content in the app. Only ONE reframe is shown in
 * the design and it is reproduced verbatim below. Every other pull maps to an
 * explicit placeholder. AI-written "balanced reframes" must NOT be presented as
 * final — the content owner (clinician) supplies the real copy.
 *
 * Shape: a reframe is keyed by the pull id it responds to, carries the detected
 * CBT pattern chips, and the balanced reframe sentence. `copyFinal` gates
 * whether the UI may present it as real guidance.
 */
export interface Reframe {
  pullId: string;
  /** CBT pattern chips shown above the reframe card */
  patterns: string[];
  text: string;
  copyFinal: boolean;
}

/** The single design example, reproduced verbatim. */
export const reframes: Record<string, Reframe> = {
  approval: {
    pullId: 'approval',
    patterns: ['Approval', 'Mind-reading'],
    text: 'Someone’s reaction does not decide my value. Silence is missing data, not proof of rejection.',
    copyFinal: true,
  },
  // Every other pull intentionally has no real reframe yet.
  fear: { pullId: 'fear', patterns: ['Fear'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  comparison: { pullId: 'comparison', patterns: ['Comparison'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  avoidance: { pullId: 'avoidance', patterns: ['Avoidance'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  peoplePleasing: { pullId: 'peoplePleasing', patterns: ['People pleasing'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  perfectionism: { pullId: 'perfectionism', patterns: ['Perfectionism'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  selfDoubt: { pullId: 'selfDoubt', patterns: ['Self-doubt'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  control: { pullId: 'control', patterns: ['Control'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  numbness: { pullId: 'numbness', patterns: ['Numbness'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
  proving: { pullId: 'proving', patterns: ['Proving'], text: '[PLACEHOLDER — clinician-supplied reframe]', copyFinal: false },
};

/** Fallback used when no pull is selected (e.g. Easy mode) or none matches. */
export const defaultReframe: Reframe = {
  pullId: 'default',
  patterns: [],
  text: '[PLACEHOLDER — clinician-supplied reframe]',
  copyFinal: false,
};

export const reframeForPull = (pullId?: string): Reframe =>
  (pullId && reframes[pullId]) || defaultReframe;
