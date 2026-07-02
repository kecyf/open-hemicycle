import { describe, expect, it, vi } from "vitest";
import { isRetryableHttpStatus, sleep, withRetry } from "./retry.ts";

describe("isRetryableHttpStatus", () => {
  it("accepte 429 et 5xx", () => {
    expect(isRetryableHttpStatus(429)).toBe(true);
    expect(isRetryableHttpStatus(500)).toBe(true);
    expect(isRetryableHttpStatus(503)).toBe(true);
  });

  it("refuse 4xx hors 429", () => {
    expect(isRetryableHttpStatus(400)).toBe(false);
    expect(isRetryableHttpStatus(401)).toBe(false);
    expect(isRetryableHttpStatus(404)).toBe(false);
  });
});

describe("withRetry", () => {
  it("réussit au premier essai", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(withRetry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("réessaie puis réussit", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, {
      maxAttempts: 3,
      initialDelayMs: 1,
      isRetryable: () => true,
    });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("échoue après maxAttempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("permanent"));

    await expect(
      withRetry(fn, {
        maxAttempts: 2,
        initialDelayMs: 1,
        isRetryable: () => true,
      }),
    ).rejects.toThrow("permanent");

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("n’essaie pas si non retryable", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fatal"));

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        isRetryable: () => false,
      }),
    ).rejects.toThrow("fatal");

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("sleep", () => {
  it("attend au moins le délai demandé", async () => {
    const start = Date.now();
    await sleep(20);
    expect(Date.now() - start).toBeGreaterThanOrEqual(15);
  });
});
