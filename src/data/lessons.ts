/**
 * CBT lesson library — a finite, readable library (no feed, no autoplay).
 *
 * ⚠ DRAFT CLINICAL CONTENT — plausible, evidence-informed CBT self-help written
 * for everyday stress. Grounded in standard CBT (cognitive model, cognitive
 * restructuring, behavioural activation, implementation intentions, worry
 * postponement, urge surfing, self-compassion). Review by a CBT clinician before
 * release. Each lesson has a spoken narration (voiceScript) played via the `tts`
 * edge function (ElevenLabs), plus practical actions the reader can do now.
 */
export type LessonCategory =
  | 'Foundations'
  | 'Skills'
  | 'Emotional pulls'
  | 'Everyday scenarios';

export interface LessonSection {
  heading?: string;
  body: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationLabel: string; // reading time, e.g. "3 min"
  category: LessonCategory;
  gradient: [string, string];
  /** one-line summary for cards + list */
  summary: string;
  /** short "Try: …" line shown under some cards */
  actionPreview?: string;
  /** opening paragraph shown under the title */
  intro: string;
  /** the readable body */
  sections: LessonSection[];
  /** concrete, practical things to do */
  actions: string[];
  /** one-line takeaway */
  keyIdea: string;
  /** short spoken script for the voice (ElevenLabs). If absent, we narrate intro + key idea. */
  voiceScript?: string;
  startHere?: boolean;
  copyFinal: boolean;
}

export const lessons: Lesson[] = [
  {
    id: 'firstShift',
    title: 'How a reset works',
    durationLabel: '3 min',
    category: 'Foundations',
    gradient: ['#A99BD4', '#74C7B8'],
    summary: 'The simple loop behind every reset — and why it helps.',
    intro:
      'A reset is three small moves: notice what happened, find a more balanced way to see it, then take one small step. It sounds simple because it is — and that simplicity is exactly why it works when you’re stretched thin.',
    sections: [
      {
        heading: 'Why so short?',
        body:
          'When you’re stressed, your thinking narrows and your energy drops. Long, complicated exercises don’t get done. A two-minute reset is built to survive a bad day — small enough that you’ll actually do it, and repeatable enough that it adds up. In therapy this mirrors how CBT is delivered: catch a specific moment, examine the thought, then change one small behaviour.',
      },
      {
        heading: 'Notice → rebalance → act',
        body:
          'First you name the moment and the feeling. Naming a feeling in plain words measurably lowers its intensity — the brain settles when the experience is put into language. Next you look for a more balanced thought: not forced positivity, but a fairer read of the situation. Finally you take one small, concrete step, because action changes how you feel far more reliably than waiting to feel better first.',
      },
      {
        heading: 'It compounds',
        body:
          'No single reset fixes everything, and it isn’t meant to. What changes things is the repetition: each reset is a rep that trains your mind to catch a spiral earlier and respond instead of react. Over weeks, the pattern you practise becomes the pattern you default to.',
      },
    ],
    actions: [
      'Do one reset today, even about something small.',
      'Notice the feeling and give it a plain name before anything else.',
      'End with one step you can finish in two minutes.',
    ],
    keyIdea: 'Notice it, see it more fairly, take one small step. Repeat.',
    voiceScript:
      'A reset is three small moves. First, notice what happened and name the feeling. Second, find a fairer, more balanced way to see it. Third, take one small step you can finish in two minutes. It’s short on purpose, so you’ll actually do it — and the repetition is what changes things over time.',
    startHere: true,
    copyFinal: false,
  },
  {
    id: 'thoughtsArentFacts',
    title: 'Thoughts aren’t facts',
    durationLabel: '4 min',
    category: 'Foundations',
    gradient: ['#74C7B8', '#4f9c8f'],
    summary: 'Your mind narrates constantly. The narration isn’t always true.',
    actionPreview: 'Try: catch one thought and question it',
    intro:
      'The central idea in CBT is simple but powerful: it’s not events themselves that upset us so much as the meaning we give them. Two people can face the same setback and feel completely differently — because they’re telling themselves different things about it.',
    sections: [
      {
        heading: 'The chain',
        body:
          'Something happens (a text goes unanswered). Almost instantly your mind adds an interpretation (“they’re annoyed with me”). That thought triggers a feeling (anxiety) and an urge (check the phone again). The event didn’t create the anxiety on its own — the interpretation did. That’s good news, because interpretations can be examined and adjusted, while events often can’t.',
      },
      {
        heading: 'Thoughts feel like truth',
        body:
          'A thought arrives with a sense of certainty, so we rarely question it. But a thought is a mental event, not a measurement of reality. “I’m going to mess this up” is a prediction, not a fact. Learning to hold thoughts a little more loosely — to treat them as one possible read rather than the truth — is the skill everything else in CBT builds on.',
      },
      {
        heading: 'Not positive thinking',
        body:
          'This isn’t about swapping a negative thought for a cheerful one. Forced positivity rarely convinces anyone. The aim is a balanced, believable thought — one that accounts for the evidence on both sides. Balanced beats positive, because you can actually believe it.',
      },
    ],
    actions: [
      'When you feel a jolt of stress, ask: what did I just tell myself?',
      'Write the thought down as a sentence — seeing it makes it easier to question.',
      'Ask: is this a fact, or one interpretation among several?',
    ],
    keyIdea: 'It’s not the event, it’s the story you tell about it — and stories can be edited.',
    voiceScript:
      'In CBT, the core idea is that it’s not events that upset us so much as the meaning we give them. A thought arrives feeling like the truth, but it’s really just one interpretation. When you notice a jolt of stress, ask yourself: what did I just tell myself? Then ask whether that’s a fact, or only one possible read. That small pause is where change begins.',
    copyFinal: false,
  },
  {
    id: 'namingTheStory',
    title: 'Naming the story',
    durationLabel: '3 min',
    category: 'Skills',
    gradient: ['#74C7B8', '#4f9c8f'],
    actionPreview: 'Try: separate one fact from the story',
    summary: 'Separate what actually happened from what your mind added.',
    intro:
      'Your mind narrates events instantly, blending fact and interpretation into one seamless stream. This skill is about pulling those two apart — so you can respond to what’s real instead of to the story.',
    sections: [
      {
        heading: 'Fact vs story',
        body:
          'The fact is what a camera would record: “She left the meeting without saying goodbye.” The story is what your mind adds: “She’s upset with me; I said something wrong.” The story might be right — but it might not be, and you’re reacting as if it’s confirmed. Naming it as a story restores the gap between the two.',
      },
      {
        heading: 'How to do it',
        body:
          'Take the moment that’s bothering you and write two lines. Line one: just the observable facts, no adjectives. Line two: the story — everything your mind added about meaning, motive, or what it says about you. Seeing them side by side is often enough to loosen the story’s grip.',
      },
      {
        heading: 'Then ask',
        body:
          'What’s the evidence for the story? What’s the evidence against it? What’s another explanation that fits the same facts? Usually there are several, and most are kinder and more likely than the one your mind reached for first.',
      },
    ],
    actions: [
      'Write one fact (what a camera saw) and one story your mind added today.',
      'List one alternative explanation that fits the same fact.',
      'Notice how the feeling shifts once the story is named as a story.',
    ],
    keyIdea: 'Name the story, and it stops running the show.',
    voiceScript:
      'Your mind blends fact and interpretation into one stream. Try pulling them apart. The fact is what a camera would record. The story is what your mind added about meaning or motive. Write both down, side by side. Then ask: what else could explain the same fact? Naming the story as a story is often enough to loosen its grip.',
    copyFinal: false,
  },
  {
    id: 'thinkingTraps',
    title: 'Common thinking traps',
    durationLabel: '5 min',
    category: 'Skills',
    gradient: ['#A99BD4', '#7b6cb0'],
    summary: 'The handful of biased shortcuts the mind falls into — and their names.',
    actionPreview: 'Try: name your trap',
    intro:
      'Under stress, thinking tends to slip into a few predictable, biased patterns. CBT calls these cognitive distortions. Learning their names is oddly powerful: once you can spot “oh, that’s catastrophising,” the thought loses some of its authority.',
    sections: [
      {
        heading: 'The usual suspects',
        body:
          'Catastrophising: jumping to the worst-case outcome. Mind-reading: assuming you know what others think, usually the worst. All-or-nothing: seeing things as total success or total failure with no middle. Overgeneralising: one setback becomes “always” or “never.” Personalising: taking responsibility for things outside your control. Emotional reasoning: “I feel like a failure, so I must be one.”',
      },
      {
        heading: 'Why naming helps',
        body:
          'A distortion works by feeling like plain reality. The moment you label it, you step outside it and see it as a mental habit rather than the truth. You don’t have to argue the thought away — just recognising the pattern creates enough distance to think more clearly.',
      },
      {
        heading: 'Everyone does it',
        body:
          'These aren’t signs that something is wrong with you. They’re shortcuts every human mind takes, especially when tired or threatened. The goal isn’t to never have them — it’s to catch them a bit sooner, more often.',
      },
    ],
    actions: [
      'Next time you’re spiralling, ask which trap best fits.',
      'Say it plainly to yourself: “That’s mind-reading.”',
      'Then ask what a fairer, more balanced version of the thought would be.',
    ],
    keyIdea: 'You can’t stop the traps — but you can learn to name them, and naming loosens them.',
    voiceScript:
      'Under stress, thinking slips into a few predictable traps. Catastrophising: leaping to the worst case. Mind-reading: assuming you know what others think. All-or-nothing: no middle ground. When you catch one, just name it — “that’s catastrophising.” You don’t have to argue it away. Naming the pattern is enough to create some distance and think more clearly.',
    copyFinal: false,
  },
  {
    id: 'balancedThought',
    title: 'Building a balanced thought',
    durationLabel: '5 min',
    category: 'Skills',
    gradient: ['#6FC7A0', '#3f9e76'],
    summary: 'The core CBT move: weigh the evidence and write a fairer thought.',
    actionPreview: 'Try: write one balanced thought',
    intro:
      'This is the engine of cognitive restructuring — the technique with the strongest evidence base in CBT. It’s a short, structured way to take a hot thought and land on one that’s fairer and more believable.',
    sections: [
      {
        heading: 'Start with the hot thought',
        body:
          'Catch the thought that’s carrying the most feeling right now and write it as a single sentence. For example: “I always ruin things when it matters.” Rate how strongly you believe it, zero to a hundred. This gives you a before-and-after to compare.',
      },
      {
        heading: 'Weigh the evidence',
        body:
          'List the evidence that supports the thought — honestly. Then, and this is the part we skip, list the evidence against it: times it wasn’t true, facts that don’t fit, things you’re discounting. The mind collects confirming evidence automatically; you have to go looking for the rest on purpose.',
      },
      {
        heading: 'Write the balanced version',
        body:
          'Now write a thought that accounts for both columns. Not a slogan — a sentence you can actually believe. “I’ve stumbled before, and I’ve also handled hard things well; this might go better than my fear predicts.” Re-rate your belief in the original hot thought. It usually drops, and that drop is the shift you were after.',
      },
    ],
    actions: [
      'Write your hottest thought and rate your belief 0–100.',
      'List two pieces of evidence against it.',
      'Write one balanced sentence you can genuinely believe, then re-rate.',
    ],
    keyIdea: 'Balanced, believable, and based on both columns of evidence — that’s a reframe that sticks.',
    voiceScript:
      'Here’s the core CBT move. Catch the thought carrying the most feeling and write it down. List the evidence for it, then the evidence against it — the part we usually skip. Then write a balanced version that accounts for both. Not a slogan, but a sentence you can actually believe. That believable, fairer thought is what loosens the grip of the original.',
    copyFinal: false,
  },
  {
    id: 'behaviouralActivation',
    title: 'Action comes before motivation',
    durationLabel: '4 min',
    category: 'Skills',
    gradient: ['#A99BD4', '#74C7B8'],
    summary: 'Waiting to feel like it keeps you stuck. Small action breaks the loop.',
    actionPreview: 'Try: one tiny action now',
    intro:
      'When mood drops, we do less, which lowers mood further, which makes doing anything feel even harder. Behavioural activation — one of the most effective parts of CBT for low mood — reverses that spiral by acting first and letting motivation catch up.',
    sections: [
      {
        heading: 'The trap of waiting',
        body:
          'It feels logical to wait until you feel motivated before you act. But motivation usually follows action, not the other way around. If you wait for the feeling, you can wait a very long time. Doing a small thing generates the momentum and the mood you were waiting for.',
      },
      {
        heading: 'Make it absurdly small',
        body:
          'The step should be so small it’s almost silly to refuse: put on your shoes, open the document, wash one plate. The point isn’t the plate — it’s proving to your brain that you can start, which is the hardest part. Momentum does the rest more often than you’d expect.',
      },
      {
        heading: 'Choose by values, not mood',
        body:
          'Pick actions that connect to what matters to you — a relationship, your health, your work — rather than only what you feel like. Acting in line with your values tends to lift mood even when the task itself is dull, because it reminds you that you’re still steering your life.',
      },
    ],
    actions: [
      'Name one thing you’ve been avoiding and shrink it to a two-minute version.',
      'Do that version now, before you feel ready.',
      'Notice what happens to your motivation once you’ve started.',
    ],
    keyIdea: 'Don’t wait to feel like it. Start small, and the motivation follows.',
    voiceScript:
      'When mood drops, we do less, and doing less lowers mood further. To break that loop, act first and let motivation catch up. Pick a step so small it’s almost silly to refuse — open the document, put on your shoes. The point is proving you can start. Momentum usually does the rest. Don’t wait to feel like it; start small, and the feeling follows.',
    copyFinal: false,
  },
  {
    id: 'approvalTrap',
    title: 'The approval trap',
    durationLabel: '4 min',
    category: 'Emotional pulls',
    gradient: ['#A99BD4', '#7b6cb0'],
    actionPreview: 'Try: delay one reply today',
    summary: 'When your calm depends on other people’s approval, you hand them the controls.',
    intro:
      'Wanting to be liked is human. But when your sense of okayness rides on constant approval, every unanswered message or neutral face becomes a threat, and you shrink yourself to stay safe. This lesson is about loosening that grip.',
    sections: [
      {
        heading: 'The cost',
        body:
          'Chasing approval means outsourcing your mood to people who aren’t thinking about you nearly as much as you fear. You over-apologise, over-explain, and say yes when you mean no. The relief is real but brief, and the pattern quietly teaches you that you’re only okay when others confirm it.',
      },
      {
        heading: 'The mind-reading underneath',
        body:
          'Approval anxiety runs on mind-reading: “they’re annoyed,” “they think I’m too much.” These are guesses dressed as facts. Most of the time you have no evidence, and the neutral silence you’re reading as rejection is just someone being busy.',
      },
      {
        heading: 'Small experiments',
        body:
          'You loosen the trap by testing it. Delay a reply and notice the sky doesn’t fall. Say a small, honest no. Let a text sit unanswered for an hour. Each time nothing catastrophic happens, your brain updates: my okayness doesn’t actually depend on this.',
      },
    ],
    actions: [
      'Delay one non-urgent reply by an hour today.',
      'Say one small, honest “no” or “not today.”',
      'When you assume someone’s annoyed, ask what evidence you actually have.',
    ],
    keyIdea: 'Your okayness isn’t theirs to grant. Test that, gently, one small experiment at a time.',
    voiceScript:
      'Wanting to be liked is human, but when your calm depends on constant approval, you hand other people the controls. Approval anxiety runs on mind-reading — guesses about what others think, dressed as facts. Loosen it with small experiments. Delay a reply. Say a small, honest no. Each time nothing bad happens, your mind learns that your okayness was never theirs to grant.',
    copyFinal: false,
  },
  {
    id: 'worryPostponement',
    title: 'Give worry a time slot',
    durationLabel: '4 min',
    category: 'Emotional pulls',
    gradient: ['#74C7B8', '#4f9c8f'],
    actionPreview: 'Try: schedule worry for later',
    summary: 'You can’t stop worry by force — but you can tell it “not now, later.”',
    intro:
      'Telling yourself to stop worrying almost never works; it tends to make the thoughts louder. Worry postponement is a well-tested alternative: instead of fighting the worry or following it, you agree to deal with it — at a set time, later.',
    sections: [
      {
        heading: 'Why “stop it” backfires',
        body:
          'Suppressing a thought takes effort and keeps it active, so it rebounds. The mind also treats worry as urgent — as if thinking about a problem right now is the only way to stay safe. Postponement calmly disagrees with that urgency without dismissing the concern.',
      },
      {
        heading: 'How it works',
        body:
          'When a worry shows up, jot it down in a line and tell yourself you’ll think about it during your worry time — say, 6:30 for fifteen minutes. This signals to your mind that the worry is noted and will be handled, so it’s safe to set down for now. Most worries look smaller by the time the slot arrives, and many have dissolved entirely.',
      },
      {
        heading: 'Use the slot',
        body:
          'When worry time comes, actually review the list. For each item ask: is this something I can act on, or something I can only accept? If it’s actionable, write the next small step. If it’s not, practise letting it be. This turns vague, circling dread into either a plan or acceptance.',
      },
    ],
    actions: [
      'Pick a daily 15-minute “worry time” and a place for it.',
      'When a worry hits, write one line and postpone it to that slot.',
      'At worry time, sort each item into “act on it” or “let it be.”',
    ],
    keyIdea: 'Don’t fight the worry — postpone it. “Noted, and not now” is a complete answer.',
    voiceScript:
      'Telling yourself to stop worrying usually makes it louder. Instead, give worry a time slot. When a worry shows up, write it in one line and tell yourself you’ll think about it at your worry time later. That tells your mind it’s noted and safe to set down for now. When the slot comes, sort each worry into something you can act on, or something you can only accept.',
    copyFinal: false,
  },
  {
    id: 'urgeSurfing',
    title: 'Riding out an urge',
    durationLabel: '4 min',
    category: 'Emotional pulls',
    gradient: ['#6FC7A0', '#3f9e76'],
    actionPreview: 'Try: wait out the wave',
    summary: 'Urges feel permanent but behave like waves — they rise, crest, and fall.',
    intro:
      'Whether it’s the pull to check your phone, snap back, or reach for a habit you’re trying to change, an urge feels like it will only grow until you give in. Urge surfing is a mindfulness-based skill for riding the wave instead of being knocked over by it.',
    sections: [
      {
        heading: 'Urges are waves',
        body:
          'An urge isn’t a straight line that climbs forever. It builds, peaks, and subsides, usually within minutes, whether or not you act on it. Every time you ride one out without acting, you weaken the habit loop a little — you teach your brain that the urge passes on its own.',
      },
      {
        heading: 'How to surf',
        body:
          'Instead of fighting the urge or obeying it, get curious about it. Where do you feel it in your body? Is it tight, hot, restless? Breathe slowly and watch it like weather, noticing it rise and change. You’re not white-knuckling — you’re observing, which puts a little space between the urge and your response.',
      },
      {
        heading: 'Delay, don’t battle',
        body:
          'A simple version: promise yourself you’ll wait ten minutes before acting. Set a timer. Often the wave has passed by the time it goes off. Delay is easier than outright refusal, and it works because it lets the urge’s own arc do the hard part for you.',
      },
    ],
    actions: [
      'When an urge hits, name it: “this is an urge, and urges pass.”',
      'Set a 10-minute timer before acting on it.',
      'While you wait, breathe slowly and notice the urge as a sensation.',
    ],
    keyIdea: 'You don’t have to fight the wave or obey it — just ride it until it falls.',
    voiceScript:
      'An urge feels like it will grow until you give in, but urges behave like waves. They build, peak, and fall, usually within minutes, whether or not you act. So don’t fight it or obey it — ride it. Notice where you feel it in your body, breathe slowly, and watch it like weather. Set a ten-minute timer. Often the wave has passed by the time it goes off.',
    copyFinal: false,
  },
  {
    id: 'selfCompassion',
    title: 'The kinder inner voice',
    durationLabel: '4 min',
    category: 'Skills',
    gradient: ['#A99BD4', '#7b6cb0'],
    summary: 'Harsh self-talk isn’t discipline — it just adds a second problem.',
    actionPreview: 'Try: talk to yourself like a friend',
    intro:
      'Many of us believe that being hard on ourselves is what keeps us in line. In practice, harsh self-criticism drains motivation and adds shame on top of whatever went wrong. Self-compassion is the more effective — and more evidence-based — alternative.',
    sections: [
      {
        heading: 'The friend test',
        body:
          'Notice how you speak to yourself after a mistake, then ask: would I say this to a good friend in the same spot? Usually not — we’re far gentler and more useful with others. That gap is worth closing, because the friend version is not only kinder, it’s more likely to help you actually improve.',
      },
      {
        heading: 'Not letting yourself off the hook',
        body:
          'Self-compassion isn’t making excuses or lowering standards. It’s acknowledging the difficulty honestly, remembering that struggling is part of being human, and then addressing the problem from a steadier place. You can hold yourself accountable and be kind at the same time — the two aren’t opposites.',
      },
      {
        heading: 'A short practice',
        body:
          'When you’re being hard on yourself, try three lines: “This is a hard moment.” “Hard moments are part of being human.” “What do I need right now?” It’s brief, but it shifts you from attack to support — and support is what actually gets you moving again.',
      },
    ],
    actions: [
      'Catch one harsh self-statement and rewrite it as you’d say it to a friend.',
      'Name the difficulty honestly, without the insult attached.',
      'Ask yourself: “what do I need right now?” and give a little of it.',
    ],
    keyIdea: 'Kindness isn’t weakness — it’s the steadier ground you actually change from.',
    voiceScript:
      'Many of us think being hard on ourselves keeps us in line, but harsh self-talk mostly adds shame on top of the problem. Try the friend test: would you say this to a good friend in the same spot? Speak to yourself the way you’d speak to them. It’s not letting yourself off the hook — it’s addressing the problem from steadier, kinder ground, which is where change actually happens.',
    copyFinal: false,
  },
  {
    id: 'twoMinuteStart',
    title: 'Beating avoidance',
    durationLabel: '3 min',
    category: 'Everyday scenarios',
    gradient: ['#6FC7A0', '#3f9e76'],
    actionPreview: 'Try: do the first 2 minutes',
    summary: 'The dread of a task is almost always bigger than the task.',
    intro:
      'When something feels big or unpleasant, the mind reaches for the exit — that’s avoidance, and it’s completely normal. The catch is that avoiding a task keeps the dread alive and often grows it. The two-minute start is how you break in.',
    sections: [
      {
        heading: 'Dread lives in anticipation',
        body:
          'Most of the discomfort of a dreaded task happens before you start, not during. Once you’re a couple of minutes in, the imagined awfulness rarely matches the reality. Starting is the expensive part; continuing is usually cheaper than you feared.',
      },
      {
        heading: 'Shrink the entry point',
        body:
          'Don’t commit to the whole task — commit to two minutes of it. Write the first sentence. Open the form. Lay out the gym clothes. Give yourself full permission to stop after two minutes. You’ll often keep going because starting was the real barrier, but even if you stop, you’ve broken the avoidance.',
      },
      {
        heading: 'Make it a when-then plan',
        body:
          'Decide in advance exactly when and where you’ll do your two minutes: “When I finish my coffee, I’ll open the document at my desk.” These specific if-then plans dramatically increase follow-through, because you’ve removed the in-the-moment decision that avoidance loves to hijack.',
      },
    ],
    actions: [
      'Pick the task you’re dreading and define its two-minute version.',
      'Write a when-then plan: “When ___, I’ll ___.”',
      'Do the two minutes, with full permission to stop after.',
    ],
    keyIdea: 'You don’t have to finish — you just have to start for two minutes.',
    voiceScript:
      'When a task feels big, the mind reaches for the exit. But most of the dread lives in anticipation, not in the doing. So don’t commit to the whole task — commit to two minutes. Write the first sentence, open the form, with full permission to stop after. Decide exactly when and where you’ll start. You’ll often keep going, because starting was the real barrier all along.',
    copyFinal: false,
  },
  {
    id: 'comparisonTrap',
    title: 'The comparison trap',
    durationLabel: '4 min',
    category: 'Everyday scenarios',
    gradient: ['#A99BD4', '#74C7B8'],
    actionPreview: 'Try: name the unfair match-up',
    summary: 'You compare your whole inside to a thin slice of someone’s outside.',
    intro:
      'Comparison is wired into us, and modern feeds pour fuel on it. The problem isn’t noticing others — it’s the unfair match-up we run without realising: our messy, complete inner world against someone else’s curated highlight.',
    sections: [
      {
        heading: 'An unfair match-up',
        body:
          'You know your own doubts, setbacks, and boring Tuesdays in full. Of other people you see a tiny, edited fraction — usually their best moments, chosen for display. Measuring your inside against their outside guarantees you’ll come up short, no matter how well you’re actually doing.',
      },
      {
        heading: 'What comparison hides',
        body:
          'Envy often points at something you value — which is useful information. But the feed version strips out the cost, the timing, the luck, and the parts they didn’t post. Reminding yourself of everything you can’t see restores a fairer picture and takes the sting out.',
      },
      {
        heading: 'Turn it inward',
        body:
          'The only fair comparison is with your own past. Instead of “am I ahead of them,” ask “am I moving in a direction I care about?” Naming one small thing you moved forward today does more for your mood than any ranking against a stranger ever will.',
      },
    ],
    actions: [
      'When comparison bites, say: “my inside vs their outside — not a fair match.”',
      'Name one thing the highlight reel is leaving out.',
      'Write one small step you moved forward today, however minor.',
    ],
    keyIdea: 'Compare with your own yesterday, not someone else’s highlight reel.',
    voiceScript:
      'Comparison is wired into us, and feeds pour fuel on it. But it’s an unfair match-up: you know your whole messy inside, while you see only a thin, edited slice of someone else’s outside. When comparison bites, remind yourself of everything the highlight reel leaves out. Then turn it inward — the only fair comparison is with your own yesterday. Name one thing you moved forward today.',
    copyFinal: false,
  },
];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);

export const exploreSections: { title: string; category: LessonCategory }[] = [
  { title: 'Foundations', category: 'Foundations' },
  { title: 'Core skills', category: 'Skills' },
  { title: 'Emotional pulls', category: 'Emotional pulls' },
  { title: 'Everyday scenarios', category: 'Everyday scenarios' },
];
