import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type Notice = { title: string; message: string };

export function NoticeDialog({ notice, onClose }: {
  notice: Notice | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={notice !== null} transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{notice?.title}</Text>
          <Text style={styles.message}>{notice?.message}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", padding: 24, justifyContent: "center", alignItems: "center" },
  card: { width: "100%", maxWidth: 440, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#263B31" },
  message: { fontSize: 16, lineHeight: 24, color: "#4B5E53" },
  button: { minHeight: 48, padding: 12, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#1F6D55" },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
