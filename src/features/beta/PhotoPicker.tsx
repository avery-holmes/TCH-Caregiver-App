import * as ImagePicker from "expo-image-picker";
import { BetaButton } from "./BetaButton";

export type PhotoPickerProps = {
  title: string;
  disabled: boolean;
  onSelect: (form: FormData) => void;
  onError: (message: string) => void;
};

export function PhotoPicker({ title, disabled, onSelect, onError }: PhotoPickerProps) {
  async function choose() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, exif: false });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const type = asset.mimeType || "image/jpeg";
      if (!["image/png", "image/jpeg"].includes(type) || (asset.fileSize ?? 0) > 3 * 1024 * 1024) {
        throw new Error("Choose a JPEG or PNG sample photo smaller than 3 MB.");
      }
      const form = new FormData();
      form.append("photo", { uri: asset.uri, name: "sample-photo", type } as unknown as Blob);
      onSelect(form);
    } catch (failure) { onError(failure instanceof Error ? failure.message : "The photo could not be selected."); }
  }
  return <BetaButton title={title} secondary disabled={disabled} onPress={() => void choose()} />;
}
