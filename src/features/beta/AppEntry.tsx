import { useState, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BetaApi } from "@/data/api/betaApi";
import { BetaButton } from "./BetaButton";
import { BetaWorkspace } from "./BetaWorkspace";
import { betaStyles as s } from "./betaStyles";

export function AppEntry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"start" | "demo" | "account">("start");
  const [api] = useState(() => new BetaApi());
  if (mode === "account") return <BetaWorkspace api={api} onExit={() => setMode("start")} />;
  if (mode === "demo") return <View style={{ flex: 1 }}>
    <BetaButton title="Back to start" secondary onPress={() => setMode("start")} />{children}
  </View>;
  return <SafeAreaView style={s.screen}><ScrollView contentContainerStyle={s.content}>
    <Text style={s.eyebrow}>TCH · DEVELOPMENT PREVIEW</Text>
    <Text style={s.title}>Care starts with a shared understanding.</Text>
    <Text style={s.body}>Explore the care-tracking demo, or try the new account and child-profile setup with fictional information.</Text>
    <BetaButton title="Caregiver account preview" onPress={() => setMode("account")} />
    <Text style={s.body}>Create a test account and save one child profile with an optional sample photo. The local Java service must be running.</Text>
    <BetaButton title="Open offline care demo" secondary onPress={() => setMode("demo")} />
    <Text style={s.body}>Try logging care on this device. Existing demo aliases and history are preserved.</Text>
  </ScrollView></SafeAreaView>;
}
