import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  HomeTab: undefined;
  ResetTab: undefined;
  ExploreTab: undefined;
  CommunityTab: undefined;
  ProgressTab: undefined;
  YouTab: undefined;
};

export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  HowItWorks: undefined;
  ChooseTheme: undefined;
  TextSize: undefined;
  ReadAloud: undefined;
  Privacy: undefined;
  Reminders: undefined;
  Ready: undefined;

  // Auth (required sign-in)
  SignIn: undefined;
  SignUp: undefined;

  // App shell
  Main: NavigatorScreenParams<TabParamList> | undefined;

  // Daily Reset loop (3 taps): situation → support → done
  ResetSituation: undefined;
  ResetNarration: undefined;
  ResetDone: undefined;
  ResetDetail: { id: string };

  // Interactive tools (usable standalone or inline as the "one small step")
  ToolBreathing: { mode?: 'action' | 'standalone'; variant?: string } | undefined;
  ToolGrounding: { mode?: 'action' | 'standalone' } | undefined;
  ToolJournal: { mode?: 'action' | 'standalone'; prompt?: string } | undefined;

  // Detail / settings
  VideoLesson: { lessonId: string };
  HowToUse: undefined;
  ThemePicker: undefined;
  ReminderSettings: undefined;
  CrisisResources: undefined;
  Info: { kind: 'about' | 'terms' | 'privacy' };
  DeleteData: undefined;
};
