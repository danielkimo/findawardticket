import type { AwardFlightResult, CabinClass, LoginResult } from "@findawardticket/core";
import type { Airport } from "@findawardticket/airports-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export interface ProviderSummary {
  id: string;
  displayName: string;
}

export async function fetchProviders(): Promise<ProviderSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/providers`);
  const data = (await res.json()) as { providers: ProviderSummary[] };
  return data.providers;
}

export async function fetchAirports(query: string): Promise<Airport[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE_URL}/api/airports?query=${encodeURIComponent(query)}`);
  const data = (await res.json()) as { airports: Airport[] };
  return data.airports;
}

export async function login(
  providerId: string,
  username: string,
  password: string,
): Promise<LoginResult> {
  return postJson<LoginResult>(`/api/providers/${providerId}/login`, { username, password });
}

export async function submitTwoFactor(
  providerId: string,
  sessionId: string,
  code: string,
): Promise<LoginResult> {
  return postJson<LoginResult>(`/api/providers/${providerId}/2fa`, { sessionId, code });
}

export interface SearchRequest {
  sessionId: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  cabin: CabinClass;
  adults: number;
  children?: number;
}

export type SearchResponse =
  | { status: "success"; flights: AwardFlightResult[] }
  | { status: "error"; message: string };

export async function searchAwardFlights(
  providerId: string,
  request: SearchRequest,
): Promise<SearchResponse> {
  return postJson<SearchResponse>(`/api/providers/${providerId}/search`, request);
}

export async function logout(providerId: string, sessionId: string): Promise<void> {
  await postJson(`/api/providers/${providerId}/logout`, { sessionId });
}
