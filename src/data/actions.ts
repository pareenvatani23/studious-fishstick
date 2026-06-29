/**
 * ⚠ STUBBED CLINICAL CONTENT — design screen 16 "Choose Small Action".
 *
 * The three actions shown in the design are reproduced verbatim (copyFinal:true).
 * The remaining titles come from the build brief but their behavioural
 * descriptions are placeholders the content owner must supply. Do not ship the
 * placeholders as real guidance.
 *
 * `relatedResponse` ties an action to a steadier-response id (responses.ts) so
 * the UI can show the related chip. Mappings for placeholder items are guesses
 * and must be reviewed.
 */
export interface SmallAction {
  id: string;
  title: string;
  description: string;
  estMinutes: number;
  relatedResponse: string; // responses.ts id
  copyFinal: boolean;
}

export const actions: SmallAction[] = [
  {
    id: 'delayChecking',
    title: 'Delay checking',
    description: 'Wait 20 minutes before re-reading the chat.',
    estMinutes: 2,
    relatedResponse: 'selfRespect',
    copyFinal: true,
  },
  {
    id: 'twoMinuteStart',
    title: 'Two-minute start',
    description: "Begin the task you've been avoiding, just for two minutes.",
    estMinutes: 2,
    relatedResponse: 'discipline',
    copyFinal: true,
  },
  {
    id: 'sendHonestMessage',
    title: 'Send the honest message',
    description: "Say what's true, simply, without over-explaining.",
    estMinutes: 3,
    relatedResponse: 'courage',
    copyFinal: true,
  },
  // ↓ titles from brief; descriptions are PLACEHOLDERS — supply real copy
  { id: 'privateWin', title: 'Complete a private win', description: '[PLACEHOLDER — supply real copy]', estMinutes: 5, relatedResponse: 'discipline', copyFinal: false },
  { id: 'walkFirst', title: 'Walk before believing the story', description: '[PLACEHOLDER — supply real copy]', estMinutes: 10, relatedResponse: 'calm', copyFinal: false },
  { id: 'closeLoop', title: 'Close one small loop', description: '[PLACEHOLDER — supply real copy]', estMinutes: 5, relatedResponse: 'discipline', copyFinal: false },
  { id: 'sayNo', title: 'Say no politely', description: '[PLACEHOLDER — supply real copy]', estMinutes: 2, relatedResponse: 'selfRespect', copyFinal: false },
  { id: 'balancedThought', title: 'Write a balanced thought', description: '[PLACEHOLDER — supply real copy]', estMinutes: 3, relatedResponse: 'truth', copyFinal: false },
];

export const actionById = (id: string) => actions.find((a) => a.id === id);
