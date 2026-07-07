import React, { useCallback, useEffect, useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card } from '../../components/Screen';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { SectionLabel } from '../../components/Settings';
import { Icon } from '../../components/icons';
import { useTheme } from '../../theme/ThemeContext';
import { useRootNav } from '../../navigation/hooks';
import { fetchFeed, fetchSaved, submitPost, setReaction, setSaved, type Post } from '../../supabase/community';
import { radius, spacing, sizing } from '../../theme/tokens';

/**
 * Community "Daily Drop" — a finite, anonymous, kindness-only feed. One hero +
 * a small curated set (never endless). Post once a day (AI-gated). React with
 * "This helped me"; save the ones that land.
 */
export function CommunityScreen() {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  const nav = useRootNav();

  const [tab, setTab] = useState<'today' | 'saved'>('today');
  const [hero, setHero] = useState<Post | null>(null);
  const [drop, setDrop] = useState<Post[]>([]);
  const [saved, setSavedList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'warn'; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === 'today') {
      const f = await fetchFeed();
      setHero(f.hero);
      setDrop(f.drop);
    } else {
      setSavedList(await fetchSaved());
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const share = async () => {
    if (!text.trim()) return;
    setPosting(true);
    setFeedback(null);
    const r = await submitPost(text.trim());
    setPosting(false);
    if (r.status === 'published') {
      setText('');
      setFeedback({ kind: 'ok', msg: 'Shared 💛 Someone will read this today.' });
      load();
    } else if (r.status === 'crisis') {
      nav.navigate('CrisisResources');
    } else if (r.status === 'limit') {
      setFeedback({ kind: 'warn', msg: r.reason });
    } else if (r.status === 'rejected') {
      setFeedback({ kind: 'warn', msg: r.reason });
    } else {
      setFeedback({ kind: 'warn', msg: 'Could not share right now — try again.' });
    }
  };

  // optimistic react / save
  const mutate = (id: string, patch: Partial<Post>) => {
    setHero((h) => (h && h.id === id ? { ...h, ...patch } : h));
    setDrop((d) => d.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setSavedList((s) => s.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const toggleReact = (p: Post) => {
    const on = !p.reacted;
    mutate(p.id, { reacted: on, helped_count: Math.max(0, p.helped_count + (on ? 1 : -1)) });
    setReaction(p.id, on).catch(() => {});
  };
  const toggleSave = (p: Post) => {
    const on = !p.saved;
    mutate(p.id, { saved: on });
    setSaved(p.id, on).catch(() => {});
    if (tab === 'saved' && !on) setSavedList((s) => s.filter((x) => x.id !== p.id));
  };

  const list = tab === 'today' ? drop : saved;

  return (
    <Screen scroll contentStyle={{ paddingBottom: sizing.tabBar + spacing.xl }}>
      <AppText size={28} weight="700" style={{ marginTop: spacing.sm }}>Community</AppText>
      <AppText size={14} color={c.text2} style={{ marginTop: spacing.xs }} lineHeightMultiple={1.4}>
        Anonymous, kind, once a day. One beautiful thought can change someone’s day.
      </AppText>

      {/* Compose */}
      <Card style={{ marginTop: spacing.lg }}>
        <SectionLabel>Share one positive thought</SectionLabel>
        <TextInput
          value={text}
          onChangeText={(t) => t.length <= 280 && setText(t)}
          placeholder="An affirmation or kind thought for a stranger…"
          placeholderTextColor={c.muted}
          multiline
          allowFontScaling
          style={{ color: c.text1, fontSize: 16, lineHeight: 23, marginTop: spacing.sm, minHeight: 60, textAlignVertical: 'top' }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <AppText size={12} color={c.muted}>{text.length}/280 · once a day</AppText>
          <View style={{ width: 130 }}>
            <Button label={posting ? 'Sharing…' : 'Share'} onPress={share} disabled={posting || !text.trim()} height={44} />
          </View>
        </View>
        {feedback && (
          <AppText size={13} color={feedback.kind === 'ok' ? c.success : c.warning} style={{ marginTop: spacing.sm }}>{feedback.msg}</AppText>
        )}
      </Card>

      {/* Today / Saved */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        {(['today', 'saved'] as const).map((t) => {
          const on = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.lg, backgroundColor: on ? tint(c.teal, 0.14) : c.card, borderWidth: on ? 1.5 : c.borderWidth, borderColor: on ? c.teal : c.border }}>
              <AppText size={14} weight="600" color={on ? c.teal : c.text2}>{t === 'today' ? 'Today’s drop' : 'Saved'}</AppText>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={c.teal} style={{ marginTop: spacing.xxl }} />
      ) : tab === 'today' && hero ? (
        <>
          <SectionLabel style={{ marginTop: spacing.xl }}>One for you</SectionLabel>
          <View style={{ marginTop: spacing.md, borderRadius: radius.xl, overflow: 'hidden', borderWidth: c.borderWidth, borderColor: tint(c.lavender, 0.3) }}>
            <LinearGradient colors={[tint(c.lavender, 0.18), tint(c.teal, 0.1)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: spacing.xl }}>
              <AppText size={20} weight="700" lineHeightMultiple={1.4}>{hero.text}</AppText>
              {hero.author_label ? <AppText size={12} color={c.muted} style={{ marginTop: spacing.sm }}>— {hero.author_label}</AppText> : null}
              <PostActions post={hero} onReact={() => toggleReact(hero)} onSave={() => toggleSave(hero)} />
            </LinearGradient>
          </View>
          <SectionLabel style={{ marginTop: spacing.xl }}>More today</SectionLabel>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {list.map((p) => <PostCard key={p.id} post={p} onReact={() => toggleReact(p)} onSave={() => toggleSave(p)} />)}
          </View>
          <AppText size={13} color={c.muted} align="center" style={{ marginTop: spacing.xl }}>That’s today’s drop — come back tomorrow 💛</AppText>
        </>
      ) : list.length > 0 ? (
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          {list.map((p) => <PostCard key={p.id} post={p} onReact={() => toggleReact(p)} onSave={() => toggleSave(p)} />)}
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginTop: spacing.xxxl, gap: spacing.md }}>
          <Icon name={tab === 'saved' ? 'bookmark' : 'people'} color={c.muted} size={40} />
          <AppText size={15} color={c.text2} align="center">
            {tab === 'saved' ? 'Save the thoughts that land — they’ll live here.' : 'No thoughts yet today. Be the first to share one.'}
          </AppText>
        </View>
      )}
    </Screen>
  );
}

function PostActions({ post, onReact, onSave }: { post: Post; onReact: () => void; onSave: () => void }) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg }}>
      <Pressable onPress={onReact} accessibilityRole="button" accessibilityLabel="This helped me" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="heart" color={post.reacted ? c.danger : c.muted} size={20} strokeWidth={post.reacted ? 2.4 : 1.8} />
        <AppText size={13} color={post.reacted ? c.danger : c.text2}>{post.helped_count > 0 ? `${post.helped_count} helped` : 'This helped me'}</AppText>
      </Pressable>
      <Pressable onPress={onSave} accessibilityRole="button" accessibilityLabel={post.saved ? 'Saved' : 'Save'} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="bookmark" color={post.saved ? c.teal : c.muted} size={19} />
        <AppText size={13} color={post.saved ? c.teal : c.text2}>{post.saved ? 'Saved' : 'Save'}</AppText>
      </Pressable>
    </View>
  );
}

function PostCard({ post, onReact, onSave }: { post: Post; onReact: () => void; onSave: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Card>
      <AppText size={16} lineHeightMultiple={1.5}>{post.text}</AppText>
      {post.author_label ? <AppText size={12} color={c.muted} style={{ marginTop: 6 }}>— {post.author_label}</AppText> : null}
      <PostActions post={post} onReact={onReact} onSave={onSave} />
    </Card>
  );
}
