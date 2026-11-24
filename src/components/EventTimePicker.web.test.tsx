import { act, create, type ReactTestRenderer } from "react-test-renderer";
import EventTimePicker from "./EventTimePicker.web";

let screen: ReactTestRenderer;
afterEach(() => { if (screen) act(() => screen.unmount()); });

test("web time changes preserve the local day without mutating the original date", () => {
  const original = new Date(2026, 9, 21, 19, 45, 35);
  const onChange = jest.fn();
  act(() => { screen = create(<EventTimePicker value={original} onChange={onChange} />); });
  act(() => screen.root.findByType("input").props.onChange({ currentTarget: { value: "09:05" } }));
  const [event, selected] = onChange.mock.calls[0];
  expect([selected.getFullYear(), selected.getMonth(), selected.getDate(), selected.getHours(), selected.getMinutes(), selected.getSeconds()])
    .toEqual([2026, 9, 21, 9, 5, 0]);
  expect(event.type).toBe("set");
  expect(original.getHours()).toBe(19);
  expect(original.getSeconds()).toBe(35);
});

test.each(["", "24:00", "12:60", "invalid"])("does not replace the date with invalid time input: %s", (time) => {
  const onChange = jest.fn();
  act(() => { screen = create(<EventTimePicker value={new Date(2026, 9, 21, 12)} onChange={onChange} />); });
  act(() => screen.root.findByType("input").props.onChange({ currentTarget: { value: time } }));
  expect(onChange).not.toHaveBeenCalled();
});
