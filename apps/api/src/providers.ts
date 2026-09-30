import { ProviderRegistry } from "@findawardticket/core";
import { LifeMilesProvider } from "@findawardticket/provider-lifemiles";

/**
 * 應用程式啟動時，在這裡註冊所有支援的哩程計畫 provider。
 *
 * 若要新增一個新的哩程計畫(例如 United MileagePlus)：
 * 1. 在 packages/providers/<provider-id> 建立新套件，實作 MileageProvider 介面。
 * 2. 在下面 import 該 provider 並呼叫 registry.register(new XxxProvider())。
 * 3. 不需要修改任何路由(routes/providers.ts)或前端核心邏輯 —— 它們都是依 providerId
 *    動態查表運作的。
 */
export function createProviderRegistry(): {
  registry: ProviderRegistry;
  disposables: Array<{ dispose: () => void }>;
} {
  const registry = new ProviderRegistry();
  const disposables: Array<{ dispose: () => void }> = [];

  const lifemiles = new LifeMilesProvider();
  registry.register(lifemiles);
  disposables.push(lifemiles);

  return { registry, disposables };
}
