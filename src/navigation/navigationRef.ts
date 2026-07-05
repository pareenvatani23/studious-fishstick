import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Ref so non-React code (e.g. notification taps) can navigate. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
