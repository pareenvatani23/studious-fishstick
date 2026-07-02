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

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

/** Validate a Y/M/D into an ISO date + a plausible age (13–120). */
function toDob(y: string, m: string, d: string): { iso?: string; error?: string } {
  if (!y && !m && !d) return { error: 'Please add your date of birth.' };
  const yy = parseInt(y, 10), mm = parseInt(m, 10), dd = parseInt(d, 10);
  if (!yy || !mm || !dd || y.length !== 4) return { error: 'Enter your date of birth as day, month, year.' };
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { error: 'That date doesn’t look right.' };
  const date = new Date(Date.UTC(yy, mm - 1, dd));
  if (date.getUTCMonth() !== mm - 1 || date.getUTCDate() !== dd) return { error: 'That date doesn’t look right.' };
  const now = new Date();
  let age = now.getUTCFullYear() - yy;
  const beforeBirthday = now.getUTCMonth() < mm - 1 || (now.getUTCMonth() === mm - 1 && now.getUTCDate() < dd);
  if (beforeBirthday) age -= 1;
  if (age < 13) return { error: 'You need to be 13 or older to use TrueShift.' };
  if (age > 120) return { error: 'Please check the year of birth.' };
  const iso = `${yy.toString().padStart(4, '0')}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  return { iso };
}

export function SignUpScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('Please add your name.');
    const dob = toDob(year, month, day);
    if (dob.error) return setError(dob.error);
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setBusy(true);
    const res = await signUp(email, password, { name: name.trim(), dob: dob.iso });
    setBusy(false);
    if (!res.ok) return setError(res.error ?? 'Could not create your account.');
    if (res.needsConfirmation) {
      setConfirmMsg('Almost there — check your email to confirm your account, then come back and sign in.');
    }
    // if a session was created, the navigator switches to the app automatically.
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppText size={28} weight="700" style={{ marginTop: spacing.lg }}>Create your account</AppText>
        <AppText size={15} color={c.text2} style={{ marginTop: spacing.sm }} lineHeightMultiple={1.4}>
          Your resets sync privately to your account so they’re safe across devices.
        </AppText>

        {confirmMsg ? (
          <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
            <AppText size={16} color={c.text1} lineHeightMultiple={1.5}>{confirmMsg}</AppText>
            <Button label="Go to sign in" onPress={() => navigation.navigate('SignIn')} />
          </View>
        ) : (
          <>
            <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
              <Input label="Your name" value={name} onChangeText={setName} placeholder="First name" multiline={false} autoCapitalize="words" textContentType="givenName" />

              <AppText size={12} weight="600" color={c.muted} style={{ marginTop: spacing.sm }}>DATE OF BIRTH</AppText>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}><Input label="Day" value={day} onChangeText={setDay} placeholder="DD" multiline={false} keyboardType="number-pad" maxLength={2} /></View>
                <View style={{ flex: 1 }}><Input label="Month" value={month} onChangeText={setMonth} placeholder="MM" multiline={false} keyboardType="number-pad" maxLength={2} /></View>
                <View style={{ flex: 1.3 }}><Input label="Year" value={year} onChangeText={setYear} placeholder="YYYY" multiline={false} keyboardType="number-pad" maxLength={4} /></View>
              </View>

              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" multiline={false} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" multiline={false} secureTextEntry autoCapitalize="none" textContentType="newPassword" />
            </View>

            {error && <AppText size={13} color={c.danger} style={{ marginTop: spacing.lg }}>{error}</AppText>}

            <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
              <Button label={busy ? 'Creating…' : 'Create account'} onPress={submit} disabled={busy} icon={busy ? undefined : 'arrowRight'} />
              {busy && <ActivityIndicator color={c.teal} />}
              <Button label="I already have an account" variant="text" onPress={() => navigation.navigate('SignIn')} />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
