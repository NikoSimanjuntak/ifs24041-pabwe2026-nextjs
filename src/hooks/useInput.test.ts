import { act, renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import useInput from "./useInput";

describe("useInput", () => {
  it("dimulai dari string kosong secara bawaan", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("memakai nilai awal dan memperbarui lewat onChange", () => {
    const { result } = renderHook(() => useInput("awal"));
    expect(result.current[0]).toBe("awal");
    act(() => result.current[1]({ target: { value: "baru" } } as ChangeEvent<HTMLInputElement>));
    expect(result.current[0]).toBe("baru");
  });

  it("dapat diubah langsung lewat setter", () => {
    const { result } = renderHook(() => useInput("x"));
    act(() => result.current[2](""));
    expect(result.current[0]).toBe("");
  });
});
