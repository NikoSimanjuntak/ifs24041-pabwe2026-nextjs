import { setFlag } from "./action";
import authReducer, { initialState } from "./reducer";

describe("authReducer", () => {
  it("mengembalikan state awal", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("mengubah flag lewat SET_FLAG", () => {
    expect(authReducer(initialState, setFlag("isAuthLogin", true)).isAuthLogin).toBe(true);
    expect(authReducer({ ...initialState, isAuthRegister: true }, setFlag("isAuthRegister", false)).isAuthRegister).toBe(false);
  });

  it("mengabaikan action lain", () => {
    expect(authReducer(initialState, { type: "lain" })).toBe(initialState);
  });
});
