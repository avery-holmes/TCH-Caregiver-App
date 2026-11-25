import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { BetaApi, BetaApiError } from "@/data/api/betaApi";
import type { CaregiverAccount } from "@/domain/childProfile";
import { BetaButton } from "./BetaButton";
import { betaStyles as s } from "./betaStyles";

export function AccountForm({ api, onSignedIn, busy, setBusy }: {
  api: BetaApi; onSignedIn: (account: CaregiverAccount) => void;
  busy: boolean; setBusy: (value: boolean) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true); setError(null); setRegistered(false);
    try {
      if (creating) {
        await api.register(email, displayName, password);
        // Registration and sign-in are separate so a failed login cannot lead to duplicate enrollment.
        setCreating(false); setPassword(""); setRegistered(true);
      } else {
        const account = await api.login(email, password);
        setPassword(""); onSignedIn(account);
      }
    } catch (failure) {
      setError(failure instanceof BetaApiError && failure.status === 401
        ? "Email or password was not recognized. Please try again."
        : failure instanceof Error ? failure.message : "Please try again.");
    } finally { setBusy(false); }
  }

  return <View style={{ gap: 18 }}>
    <Text style={s.title}>{creating ? "Create a test account" : "Caregiver sign-in"}</Text>
    {registered && <Text accessibilityRole="alert" style={s.body}>Account created. Sign in with your new password.</Text>}
    {creating && <View><Text style={s.label}>Caregiver display name</Text>
      <TextInput accessibilityLabel="Caregiver display name" style={s.input} value={displayName} onChangeText={setDisplayName}
        maxLength={80} editable={!busy} autoComplete="name" /></View>}
    <View><Text style={s.label}>Email</Text><TextInput accessibilityLabel="Email" style={s.input}
      value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
      autoComplete="email" maxLength={254} editable={!busy} /></View>
    <View><Text style={s.label}>Password</Text><TextInput accessibilityLabel="Password" style={s.input}
      value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false}
      autoComplete={creating ? "new-password" : "current-password"} maxLength={64} editable={!busy} /></View>
    {creating && <Text style={s.body}>Use a test-only passphrase of 15–64 characters. Email verification and password recovery are not available in this local preview.</Text>}
    {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <BetaButton title={busy ? "Please wait…" : creating ? "Create account" : "Sign in"} onPress={() => void submit()}
      disabled={busy || !email.trim() || !password || (creating && (!displayName.trim() || password.length < 15))} />
    <BetaButton title={creating ? "Already have an account? Sign in" : "Create a test account"} secondary disabled={busy}
      onPress={() => { setCreating(!creating); setError(null); setPassword(""); setRegistered(false); }} />
  </View>;
}
