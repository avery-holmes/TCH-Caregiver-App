import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { CareStorageStatus as StorageStatus } from "./useCareEvents";

export function CareStorageStatus({ status, onRetry }: {
  status: StorageStatus;
  onRetry: () => void;
}) {
  if (status === "ready") return null;
  const failed = status === "load-error" || status === "save-error";
  const message = status === "loading"
    ? "Loading care history…"
    : status === "load-error"
      ? "Care history could not be loaded. Your saved history has not been replaced. Retry before logging new events."
      : status === "saving"
        ? "Saving care history on this device…"
        : "Changes could not be saved. They are only in memory. Keep the app open and retry saving.";

  return (
    <View style={[styles.notice, failed && styles.error]}>
      {!failed && <ActivityIndicator accessibilityLabel={message} color="#1F6D55" />}
      <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>
      {failed && (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>{status === "load-error" ? "Retry loading" : "Retry saving"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { padding: 16, gap: 12, backgroundColor: "#DDF4E8" },
  error: { backgroundColor: "#FFF0CF" },
  text: { fontSize: 16, lineHeight: 24, color: "#263B31" },
  button: { minHeight: 48, padding: 12, justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: "#1F6D55", alignSelf: "flex-start" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
