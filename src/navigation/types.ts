import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  HomeTab: undefined;
  ShiftTab: undefined;
  ExploreTab: undefined;
  ProgressTab: undefined;
  YouTab: undefined;
};

export type RootStackParamList = {
  // Onboarding (01–07) + Pattern Selection
  Splash: undefined;
  Welcome: undefined;
  HowItWorks: undefined;
  TextSize: undefined;
  ReadAloud: undefined;
  Privacy: undefined;
  Ready: undefined;
  PatternSelection: { fromSettings?: boolean } | undefined;

  // App shell
  Main: NavigatorScreenParams<TabParamList> | undefined;

  // Daily shift loop (pushed over the tabs)
  StartShift: undefined;
  EasyFeeling: undefined;
  EmotionalPull: undefined;
  NameStory: undefined;
  Reframe: undefined;
  SteadierResponse: undefined;
  ActionSelection: undefined;
  ProofCollected: undefined;

  // Detail / settings
  VideoLesson: { lessonId: string };
  ThemePicker: undefined;
  CrisisResources: undefined;
  Info: { kind: 'about' | 'terms' | 'privacy' };
  DeleteData: undefined;
};
