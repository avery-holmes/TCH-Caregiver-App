import { StyleSheet } from "react-native";

export const betaStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F7F3" },
  content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 24, paddingVertical: 40, gap: 18 },
  eyebrow: { color: "#1F6D55", fontSize: 14, fontWeight: "700" },
  title: { color: "#263B31", fontSize: 30, fontWeight: "700" },
  body: { color: "#43584C", fontSize: 17, lineHeight: 25 },
  label: { color: "#263B31", fontSize: 17, fontWeight: "600", marginBottom: 6 },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#74877B", borderRadius: 10,
    padding: 12, backgroundColor: "white", fontSize: 18, color: "#263B31" },
  button: { minHeight: 50, borderRadius: 10, backgroundColor: "#1F6D55", alignItems: "center", justifyContent: "center", padding: 12 },
  buttonText: { color: "white", fontSize: 17, fontWeight: "700" },
  secondary: { minHeight: 48, padding: 12, alignItems: "center", justifyContent: "center", borderWidth: 1,
    borderRadius: 10, borderColor: "#74877B", backgroundColor: "white" },
  secondaryText: { color: "#1F6D55", fontSize: 17, fontWeight: "600" },
  notice: { backgroundColor: "#DFF0E6", borderRadius: 10, padding: 16 },
  error: { color: "#9C2929", fontSize: 17, lineHeight: 24 },
  disabled: { opacity: 0.55 },
  photo: { width: 132, height: 132, borderRadius: 18, backgroundColor: "#DFE9E1" },
});
