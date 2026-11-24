import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export type PagerPageProps = {
  active: boolean;
  width: number;
  children: ReactNode;
};

export default function PagerPage({ active, width, children }: PagerPageProps) {
  return (
    <View
      style={[styles.page, { width, pointerEvents: active ? "auto" : "none" }]}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F5F2EA" },
});
