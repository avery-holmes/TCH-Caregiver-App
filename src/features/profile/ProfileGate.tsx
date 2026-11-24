import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { defaultDemoIdentity } from "@/data/demoCarePlan";
import { loadDemoProfile, saveDemoProfile } from "@/data/storage/profileRepository";
import type { DemoProfile, ProfileIdentity } from "@/domain/profile";
import { normalizeProfileIdentity } from "@/domain/profile";

export function ProfileGate({ children }: {
  children: (profile: DemoProfile) => ReactNode;
}) {
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [identity, setIdentity] = useState<ProfileIdentity>({
    childName: "",
    primaryCaregiver: "",
    secondaryCaregiver: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError(null);
    loadDemoProfile()
      .then((saved) => {
        if (active) setProfile(saved);
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true);
          setError("Your saved demo profile could not be loaded. Retry to keep existing data intact.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [attempt]);

  async function startDemo() {
    if (saving) return;
    let normalized: ProfileIdentity;
    try {
      normalized = normalizeProfileIdentity({
        childName: identity.childName.trim() || defaultDemoIdentity.childName,
        primaryCaregiver: identity.primaryCaregiver.trim() || defaultDemoIdentity.primaryCaregiver,
        secondaryCaregiver: identity.secondaryCaregiver.trim() || defaultDemoIdentity.secondaryCaregiver,
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Check your demo aliases.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      setProfile(await saveDemoProfile(normalized));
    } catch {
      setError("Could not save your demo profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator accessibilityLabel="Loading demo profile" />
      </SafeAreaView>
    );
  }
  if (profile) return <>{children(profile)}</>;

  const fields: { key: keyof ProfileIdentity; label: string }[] = [
    { key: "childName", label: "Child's demo alias" },
    { key: "primaryCaregiver", label: "Primary caregiver alias" },
    { key: "secondaryCaregiver", label: "Second caregiver alias" },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>TCH · FAMILY WALKTHROUGH</Text>
        <Text style={styles.title}>Set up your demo</Text>
        <Text style={styles.body}>
          Try logging care and reviewing the timeline with a synthetic profile.
          Enter fictional aliases, or leave fields blank to use the samples.
        </Text>
        <View style={styles.notice}>
          <Text style={styles.body}>
            Demo only: use fictional names and events. Data stays on this device.
            Caregiver aliases are labels; accounts and sharing are not connected.
            The sample care plan is for demonstration.
          </Text>
        </View>
        {error && (
          <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        )}
        {loadFailed ? (
          <Pressable accessibilityRole="button" style={styles.button} onPress={() => setAttempt((value) => value + 1)}>
            <Text style={styles.buttonText}>Retry loading profile</Text>
          </Pressable>
        ) : (
          <>
            {fields.map(({ key, label }) => (
              <View key={key} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  accessibilityLabel={label}
                  style={styles.input}
                  value={identity[key]}
                  placeholder={defaultDemoIdentity[key]}
                  placeholderTextColor="#607369"
                  maxLength={40}
                  editable={!saving}
                  autoCorrect={false}
                  onChangeText={(value) => setIdentity((current) => ({ ...current, [key]: value }))}
                />
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: saving, busy: saving }}
              disabled={saving}
              style={[styles.button, saving && styles.disabled]}
              onPress={startDemo}
            >
              <Text style={styles.buttonText}>{saving ? "Saving…" : "Start demo"}</Text>
            </Pressable>
            <Text style={styles.body}>Your demo aliases are saved for the next visit. Existing care history is preserved.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7F4", justifyContent: "center" },
  content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 18, width: "100%", maxWidth: 560, alignSelf: "center" },
  eyebrow: { color: "#1F6D55", fontSize: 12, fontWeight: "700" },
  title: { color: "#263B31", fontSize: 30, fontWeight: "700" },
  body: { color: "#4B5E53", fontSize: 16, lineHeight: 24 },
  notice: { padding: 16, borderRadius: 14, backgroundColor: "#DDF4E8" },
  field: { gap: 8 },
  label: { color: "#263B31", fontSize: 16, fontWeight: "600" },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#73847A", borderRadius: 10, padding: 12, backgroundColor: "#FFFFFF", fontSize: 16, color: "#263B31" },
  button: { minHeight: 48, padding: 14, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#1F6D55" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.6 },
  error: { color: "#9B2424", fontSize: 16, lineHeight: 24 },
});
