import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { BetaApi } from "@/data/api/betaApi";
import type { ChildProfile } from "@/domain/childProfile";
import { BetaButton } from "./BetaButton";
import { betaStyles as s } from "./betaStyles";
import { PhotoPicker } from "./PhotoPicker";

export function ChildPhoto({ api, child, busy, run, onChanged, onExpired }: {
  api: BetaApi; child: ChildProfile; busy: boolean;
  run: (task: () => Promise<void>) => Promise<void>;
  onChanged: () => Promise<void>; onExpired: (error: unknown) => void;
}) {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let reader: FileReader | undefined;
    setUri(null); setError(null);
    if (child.hasPhoto) {
      void api.photo(child.id).then((blob) => {
        if (!active) return;
        reader = new FileReader();
        reader.onload = () => { if (active) setUri(String(reader?.result)); };
        reader.onerror = () => { if (active) setError("The photo could not be displayed. Try reloading it."); };
        reader.readAsDataURL(blob);
      }).catch((failure) => {
        if (active) { setError("The photo could not be loaded. Try reloading it."); onExpired(failure); }
      });
    }
    return () => { active = false; reader?.abort(); };
  }, [api, child.id, child.revision, child.hasPhoto, attempt, onExpired]);

  return <View style={{ gap: 12 }}>
    <Text style={s.label}>Child photo (optional)</Text>
    {uri ? <Image accessibilityLabel="Child profile photo" source={{ uri }} style={s.photo} />
      : <Text style={s.body}>{child.hasPhoto ? "Loading private photo…" : "No photo added. Initials can be used instead."}</Text>}
    {error && <><Text accessibilityRole="alert" style={s.error}>{error}</Text>
      <BetaButton title="Reload photo" secondary disabled={busy} onPress={() => setAttempt(attempt + 1)} /></>}
    <PhotoPicker title={child.hasPhoto ? "Replace sample photo" : "Add sample photo"} disabled={busy} onError={setError}
      onSelect={(form) => void run(async () => { setError(null); await api.uploadPhoto(child.id, form); await onChanged(); })} />
    {child.hasPhoto && <BetaButton title="Remove photo" secondary disabled={busy}
      onPress={() => void run(async () => { await api.removePhoto(child.id); await onChanged(); })} />}
    <Text style={s.body}>Use a sample image for this local test. JPEG or PNG, under 3 MB and 8 megapixels. Photos are available only through authenticated requests.</Text>
  </View>;
}
