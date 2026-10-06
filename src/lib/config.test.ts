describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("memakai nilai dari environment", async () => {
    vi.stubEnv("NEXT_PUBLIC_DELCOM_BASEURL", "https://api.test/v1");
    vi.stubEnv("APP_PORT", "4321");
    const config = await import("./config");
    expect(config.DELCOM_BASEURL).toBe("https://api.test/v1");
    expect(config.APP_PORT).toBe(4321);
  });

  it("memakai nilai bawaan jika environment kosong", async () => {
    delete process.env.NEXT_PUBLIC_DELCOM_BASEURL;
    delete process.env.APP_PORT;
    const config = await import("./config");
    expect(config.DELCOM_BASEURL).toBe("https://open-api.delcom.org/api/v1");
    expect(config.APP_PORT).toBe(3000);
  });
});
