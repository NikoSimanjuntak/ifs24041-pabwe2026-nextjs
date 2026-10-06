import { type ChangeEvent, useCallback, useState } from "react";

type InputElement = HTMLInputElement | HTMLTextAreaElement;

/** Two-way binding sederhana untuk elemen formulir: [nilai, onChange, setNilai]. */
export default function useInput(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);
  const onChange = useCallback((event: ChangeEvent<InputElement>) => setValue(event.target.value), []);
  return [value, onChange, setValue] as const;
}
