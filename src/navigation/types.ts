import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  HomeTab: undefined;
  ResetTab: undefined;
  ExploreTab: undefined;
  ProgressTab: undefined;
  YouTab: undefined;
};

export type RootStackParamList = {
  // Onboarding (01–07)
  Splash: undefined;
  Welcome: undefined;
  HowItWorks: undefined;
  TextSize: undefined;
  ReadAloud: undefined;
  Privacy: undefined;
  Ready: undefined;

  // App shell
  Main: NavigatorScreenParams<TabParamList> | undefined;

  // Daily Reset loop (3 taps): situation → support → done
  ResetSituation: undefined;
  ResetSupport: undefined;
  ResetDone: undefined;

  // Detail / settings
  VideoLesson: { lessonId: string };
  HowToUse: undefined;
  ThemePicker: undefined;
  CrisisResources: undefined;
  Info: { kind: 'about' | 'terms' | 'privacy' };
  DeleteData: undefined;
};
