import { Pressable, Text } from "react-native";
import { betaStyles as s } from "./betaStyles";

export function BetaButton({ title, onPress, disabled = false, secondary = false }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={[secondary ? s.secondary : s.button, disabled && s.disabled]}>
    <Text style={secondary ? s.secondaryText : s.buttonText}>{title}</Text>
  </Pressable>;
}
