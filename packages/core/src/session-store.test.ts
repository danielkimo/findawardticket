import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionStore } from "./session-store.js";

describe("SessionStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates and retrieves a session before it expires", () => {
    const store = new SessionStore<{ foo: string }>(() => {}, { ttlMs: 1000 });
    const record = store.create({ foo: "bar" });

    expect(store.get(record.id)?.data).toEqual({ foo: "bar" });
    store.dispose();
  });

  it("returns undefined and calls onExpire once a session's TTL has passed", () => {
    const onExpire = vi.fn();
    const store = new SessionStore<{ foo: string }>(onExpire, {
      ttlMs: 1000,
      sweepIntervalMs: 10_000,
    });
    const record = store.create({ foo: "bar" });

    vi.advanceTimersByTime(1500);

    expect(store.get(record.id)).toBeUndefined();
    expect(onExpire).toHaveBeenCalledWith(expect.objectContaining({ id: record.id }));
    store.dispose();
  });

  it("touch() extends the session TTL", () => {
    const store = new SessionStore<{ foo: string }>(() => {}, { ttlMs: 1000 });
    const record = store.create({ foo: "bar" });

    vi.advanceTimersByTime(700);
    store.touch(record.id);
    vi.advanceTimersByTime(700);

    expect(store.get(record.id)).toBeDefined();
    store.dispose();
  });

  it("delete() removes the session and invokes onExpire", async () => {
    const onExpire = vi.fn();
    const store = new SessionStore<{ foo: string }>(onExpire, { ttlMs: 1000 });
    const record = store.create({ foo: "bar" });

    await store.delete(record.id);

    expect(store.get(record.id)).toBeUndefined();
    expect(onExpire).toHaveBeenCalledTimes(1);
    store.dispose();
  });

  it("periodic sweep removes expired sessions even without get()", () => {
    const onExpire = vi.fn();
    const store = new SessionStore<{ foo: string }>(onExpire, {
      ttlMs: 100,
      sweepIntervalMs: 50,
    });
    store.create({ foo: "bar" });

    vi.advanceTimersByTime(500);

    expect(store.size()).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
    store.dispose();
  });
});
