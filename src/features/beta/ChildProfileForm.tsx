import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { ChildDetails, ChildProfile } from "@/domain/childProfile";
import { BetaButton } from "./BetaButton";
import { betaStyles as s } from "./betaStyles";

export function ChildProfileForm({ child, busy, onSave, onCancel }: {
  child?: ChildProfile; busy: boolean; onSave: (details: ChildDetails) => Promise<void>; onCancel?: () => void;
}) {
  const [name, setName] = useState(child?.displayName || "");
  const [birthDate, setBirthDate] = useState(child?.birthDate || "");
  const [timeZone, setTimeZone] = useState(child?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [summary, setSummary] = useState(child?.careSummary || "");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) { setError("Use YYYY-MM-DD for the birth date, or leave it blank."); return; }
    try { await onSave({ displayName: name.trim(), birthDate: birthDate || null, timeZone: timeZone.trim(), careSummary: summary.trim() }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "The profile could not be saved."); }
  }

  return <View style={{ gap: 18 }}>
    <Text style={s.title}>{child ? "Edit child profile" : "Add your test child"}</Text>
    <View><Text style={s.label}>Child display name</Text><TextInput accessibilityLabel="Child display name" style={s.input}
      value={name} onChangeText={setName} maxLength={80} editable={!busy} placeholder="Fictional name" /></View>
    <View><Text style={s.label}>Birth date (optional)</Text><TextInput accessibilityLabel="Birth date (optional)" style={s.input}
      value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" maxLength={10} editable={!busy} /></View>
    <View><Text style={s.label}>Timezone</Text><TextInput accessibilityLabel="Timezone" style={s.input}
      value={timeZone} onChangeText={setTimeZone} autoCapitalize="none" autoCorrect={false} maxLength={80} editable={!busy} /></View>
    <View><Text style={s.label}>Starting care notes (optional)</Text><TextInput accessibilityLabel="Starting care notes (optional)"
      style={[s.input, { minHeight: 120, textAlignVertical: "top" }]} value={summary} onChangeText={setSummary}
      multiline maxLength={2000} editable={!busy} placeholder="Fictional routines and preferences" /></View>
    <Text style={s.body}>Start with fictional details. This profile has no prefilled medication or feeding plan. You can add an optional sample photo after saving.</Text>
    {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <BetaButton title={busy ? "Saving…" : "Save child profile"} disabled={busy || !name.trim() || !timeZone.trim()} onPress={() => void save()} />
    {onCancel && <BetaButton title="Cancel editing" secondary disabled={busy} onPress={onCancel} />}
  </View>;
}
