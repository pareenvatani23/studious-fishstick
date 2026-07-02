import React, { useState } from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../supabase/auth';
import { spacing } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim()) return setError('Please enter your email.');
    if (!password) return setError('Please enter your password.');
    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? 'Could not sign you in.');
    // success → navigator switches to the app automatically.
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText size={28} weight="700" style={{ marginTop: spacing.xxl }}>Welcome back</AppText>
        <AppText size={15} color={c.text2} style={{ marginTop: spacing.sm }}>Sign in to pick up where you left off.</AppText>

        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" multiline={false} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" multiline={false} secureTextEntry autoCapitalize="none" textContentType="password" onSubmitEditing={submit} returnKeyType="go" />
        </View>

        {error && <AppText size={13} color={c.danger} style={{ marginTop: spacing.lg }}>{error}</AppText>}

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy} icon={busy ? undefined : 'arrowRight'} />
          {busy && <ActivityIndicator color={c.teal} />}
          <Button label="Create a new account" variant="text" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
