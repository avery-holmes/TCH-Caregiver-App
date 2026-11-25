import type { PhotoPickerProps } from "./PhotoPicker";

/** No pending upload state until a file is selected: cancelling the browser chooser stays usable. */
export function PhotoPicker({ title, disabled, onSelect, onError }: PhotoPickerProps) {
  return <label style={{ color: "#263B31", fontSize: 17, display: "flex", flexDirection: "column", gap: 8 }}>
    {title}
    <input type="file" aria-label="Choose sample photo" accept="image/jpeg,image/png" disabled={disabled}
      style={{ padding: 12, border: "1px solid #74877B", borderRadius: 10, background: "white", maxWidth: "100%", fontSize: 16 }}
      onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 3 * 1024 * 1024) {
          onError("Choose a JPEG or PNG sample photo smaller than 3 MB.");
          return;
        }
        const form = new FormData();
        form.append("photo", file, "sample-photo");
        onSelect(form);
      }} />
  </label>;
}
