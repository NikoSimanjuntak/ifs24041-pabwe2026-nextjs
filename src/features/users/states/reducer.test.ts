import { makeUser } from "@/test-utils";
import { setFlag, setProfile, setUser, setUsers } from "./action";
import usersReducer, { initialState } from "./reducer";

describe("usersReducer", () => {
  it("mengembalikan state awal", () => {
    expect(usersReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("menyimpan users, user, dan profile", () => {
    const user = makeUser();
    expect(usersReducer(initialState, setUsers([user])).users).toEqual([user]);
    expect(usersReducer(initialState, setUser(user)).user).toEqual(user);
    expect(usersReducer(initialState, setProfile(user)).profile).toEqual(user);
    expect(usersReducer({ ...initialState, profile: user }, setProfile(null)).profile).toBeNull();
  });

  it("mengubah flag", () => {
    expect(usersReducer(initialState, setFlag("isProfile", true)).isProfile).toBe(true);
  });

  it("mengabaikan action lain", () => {
    expect(usersReducer(initialState, { type: "lain" })).toBe(initialState);
  });
});
