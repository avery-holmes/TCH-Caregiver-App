import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BetaApi, BetaApiError } from "@/data/api/betaApi";
import type { CaregiverAccount, ChildDetails, ChildProfile } from "@/domain/childProfile";
import { AccountForm } from "./AccountForm";
import { BetaButton } from "./BetaButton";
import { ChildProfileForm } from "./ChildProfileForm";
import { ChildPhoto } from "./ChildPhoto";
import { betaStyles as s } from "./betaStyles";

export function BetaWorkspace({ api, onExit }: { api: BetaApi; onExit: () => void }) {
  const [account, setAccount] = useState<CaregiverAccount | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [loadingChild, setLoadingChild] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  const expire = useCallback((failure: unknown) => {
    if (failure instanceof BetaApiError && failure.status === 401) {
      setAccount(null); setChildren(null); setEditing(false);
      setError("Your session ended. Sign in again.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    setRestoring(true); setError(null);
    void api.me().then((value) => { if (active) setAccount(value); })
      .catch((failure) => { if (active) setError(failure.message); })
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, [api, restoreAttempt]);

  useEffect(() => {
    let active = true;
    setChildren(null); setEditing(false);
    if (account) {
      setLoadingChild(true); setError(null);
      void api.children().then((value) => { if (active) setChildren(value); })
        .catch((failure) => { if (active) { setError(failure.message); expire(failure); } })
        .finally(() => { if (active) setLoadingChild(false); });
    }
    return () => { active = false; };
  }, [api, account, expire]);

  async function reload() {
    // Treat a failed read as an error, never as an empty profile list.
    const profiles = await api.children();
    setChildren(profiles);
  }

  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(null);
    try { await task(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); expire(failure); }
    finally { setBusy(false); }
  }

  async function save(details: ChildDetails) {
    setBusy(true); setError(null);
    try {
      const child = await api.saveChild(details, children?.[0]);
      setChildren([child]); setEditing(false);
    } catch (failure) { expire(failure); throw failure; }
    finally { setBusy(false); }
  }

  const child = children?.[0];
  return <SafeAreaView style={s.screen}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text style={s.eyebrow}>TCH · ACCOUNT PREVIEW</Text>
    <View style={s.notice}><Text style={s.body}>Local development preview. Use fictional identities, care notes and sample photos. Caregiver invitations and shared logging are the next increment.</Text></View>
    {restoring ? <ActivityIndicator accessibilityLabel="Restoring caregiver session" /> : <>
      {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!account ? <>
        <AccountForm api={api} onSignedIn={(value) => { setError(null); setAccount(value); }} busy={busy} setBusy={setBusy} />
        <BetaButton title="Retry service connection" secondary disabled={busy} onPress={() => setRestoreAttempt(restoreAttempt + 1)} />
        <BetaButton title="Back to start" secondary disabled={busy} onPress={onExit} />
      </> : <>
        <Text style={s.body}>Signed in as {account.displayName}</Text>
        <BetaButton title="Sign out" secondary disabled={busy || loadingChild} onPress={() => void run(async () => {
          await api.logout(); setAccount(null); setChildren(null); setEditing(false);
        })} />
        {error && <BetaButton title="Reload saved child profile" secondary disabled={busy || loadingChild}
          onPress={() => void run(async () => { await reload(); setEditing(false); })} />}
        {loadingChild ? <ActivityIndicator accessibilityLabel="Loading child profile" />
          : children === null ? <BetaButton title="Retry loading child profile" disabled={busy} onPress={() => void run(reload)} />
          : !child || editing ? <ChildProfileForm key={child ? `${child.id}-${child.revision}` : "new"} child={child} busy={busy}
            onSave={save} onCancel={child ? () => setEditing(false) : undefined} />
          : <View style={{ gap: 18 }}>
            <Text style={s.title}>{child.displayName}</Text>
            <Text style={s.body}>Birth date: {child.birthDate || "Not supplied"}{"\n"}Timezone: {child.timeZone}</Text>
            <Text style={s.label}>Starting care notes</Text>
            <Text style={s.body}>{child.careSummary || "No starting notes added."}</Text>
            <BetaButton title="Edit child details" secondary disabled={busy} onPress={() => setEditing(true)} />
            <BetaButton title="Reload child profile" secondary disabled={busy} onPress={() => void run(reload)} />
            <ChildPhoto api={api} child={child} busy={busy} run={run} onChanged={reload} onExpired={expire} />
            <Text style={s.body}>Your profile is saved in the Java service. Shared care events are not connected to this account yet. The offline demo remains available separately.</Text>
          </View>}
      </>}
    </>}
  </ScrollView></SafeAreaView>;
}
