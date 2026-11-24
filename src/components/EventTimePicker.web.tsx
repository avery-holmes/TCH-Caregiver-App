import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type Props = {
  value: Date;
  onChange?: (event: DateTimePickerEvent, date?: Date) => void;
};

export default function EventTimePicker({ value, onChange }: Props) {
  const time = `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  return (
    <input
      type="time"
      aria-label="Event time"
      value={time}
      onChange={(event) => {
        const selected = event.currentTarget.value;
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(selected)) return;
        const [hours, minutes] = selected.split(":").map(Number);
        const date = new Date(value);
        date.setHours(hours, minutes, 0, 0);
        onChange?.({
          type: "set",
          nativeEvent: { timestamp: date.getTime(), utcOffset: -date.getTimezoneOffset() },
        }, date);
      }}
      style={{ width: "100%", minHeight: 48, padding: 12, fontSize: 20,
        color: "#263B31", backgroundColor: "#FFFFFF", border: "1px solid #73847A", borderRadius: 10 }}
    />
  );
}
