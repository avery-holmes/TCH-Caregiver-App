import { PhotoPicker } from "./PhotoPicker.web";

function picker() {
  const onSelect = jest.fn(), onError = jest.fn();
  const element = PhotoPicker({ title: "Add sample photo", disabled: false, onSelect, onError });
  const input = element.props.children[1];
  return { input, onSelect, onError };
}

test("cancelling a browser selection does not start an upload or leave a pending operation", () => {
  const { input, onSelect, onError } = picker();
  input.props.onChange({ currentTarget: { files: [], value: "" } });
  expect(onSelect).not.toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
  expect(input.props.disabled).toBe(false);
});

test("rejects unsupported or oversized photos before an upload", () => {
  const { input, onSelect, onError } = picker();
  for (const file of [{ type: "image/svg+xml", size: 100 }, { type: "image/jpeg", size: 4 * 1024 * 1024 }]) {
    input.props.onChange({ currentTarget: { files: [file], value: "sample" } });
  }
  expect(onSelect).not.toHaveBeenCalled();
  expect(onError).toHaveBeenCalledTimes(2);
});

test("selects one accepted photo and resets the input so the same file can be selected again", () => {
  const { input, onSelect } = picker();
  const target = { files: [new Blob([new Uint8Array(100)], { type: "image/png" })], value: "sample.png" };
  input.props.onChange({ currentTarget: target });
  expect(onSelect).toHaveBeenCalledWith(expect.any(FormData));
  expect(target.value).toBe("");
});
