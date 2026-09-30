import type { MileageProvider } from "./provider.js";

/**
 * ProviderRegistry：集中管理所有已註冊的哩程計畫 provider。
 * API 層(apps/api)在啟動時註冊 provider 實例，路由 handler 依 providerId 取得對應實作，
 * 不需要知道每個哩程計畫的內部細節。
 */
export class ProviderRegistry {
  private readonly providers = new Map<string, MileageProvider>();

  register(provider: MileageProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider "${provider.id}" is already registered.`);
    }
    this.providers.set(provider.id, provider);
  }

  get(providerId: string): MileageProvider | undefined {
    return this.providers.get(providerId);
  }

  getOrThrow(providerId: string): MileageProvider {
    const provider = this.get(providerId);
    if (!provider) {
      throw new Error(`Unknown mileage provider: "${providerId}"`);
    }
    return provider;
  }

  list(): Array<{ id: string; displayName: string }> {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      displayName: p.displayName,
    }));
  }
}
