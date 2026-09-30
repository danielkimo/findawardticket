"use client";

import { useState } from "react";
import { login, submitTwoFactor } from "@/lib/api";

interface LoginPanelProps {
  providerId: string;
  providerName: string;
  sessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
}

type Phase = "idle" | "submitting" | "need_2fa" | "success" | "error";

/** 哩程帳號登入表單：帳密輸入 + 條件式2FA驗證碼輸入 */
export function LoginPanel({ providerId, providerName, sessionId, onSessionChange }: LoginPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const result = await login(providerId, username, password);
    setIsSubmitting(false);
    if (result.status === "success") {
      setPhase("success");
      onSessionChange(result.sessionId);
    } else if (result.status === "two_factor_required") {
      setPhase("need_2fa");
      setMessage(result.hint ?? "請輸入您收到的兩階段驗證碼");
      onSessionChange(result.sessionId);
    } else {
      setPhase("error");
      setMessage(result.message);
    }
  }

  async function handleSubmitCode(event: React.FormEvent) {
    event.preventDefault();
    if (!sessionId) return;
    setIsSubmitting(true);

    const result = await submitTwoFactor(providerId, sessionId, code);
    setIsSubmitting(false);
    if (result.status === "success") {
      setPhase("success");
      setMessage(null);
      onSessionChange(result.sessionId);
    } else if (result.status === "two_factor_required") {
      setPhase("need_2fa");
      setMessage(result.hint ?? "驗證碼錯誤，請再試一次");
    } else {
      setPhase("error");
      setMessage(result.message);
    }
  }

  if (phase === "success" && sessionId) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <span>
          已登入 {providerName} 帳號 {username}
        </span>
        <button
          type="button"
          className="font-medium underline"
          onClick={() => {
            setPhase("idle");
            setUsername("");
            setPassword("");
            setCode("");
            onSessionChange(null);
          }}
        >
          登出
        </button>
      </div>
    );
  }

  if (phase === "need_2fa") {
    return (
      <form onSubmit={handleSubmitCode} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-700">{providerName} 需要兩階段驗證</p>
        {message && <p className="text-xs text-slate-500">{message}</p>}
        <input
          type="text"
          inputMode="numeric"
          placeholder="請輸入驗證碼"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          確認驗證碼
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">登入 {providerName} 帳號</p>
      {message && phase === "error" && <p className="text-xs text-red-600">{message}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="帳號"
          autoComplete="username"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="密碼"
          autoComplete="current-password"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {isSubmitting ? "登入中..." : "登入"}
      </button>
      <p className="text-[11px] text-slate-400">
        您的帳密僅用於即時登入該哩程網站，不會被儲存或寫入紀錄。
      </p>
    </form>
  );
}
