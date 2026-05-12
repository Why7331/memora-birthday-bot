type TelegramWebApp = {
  initData: string;
  colorScheme: 'light' | 'dark';
  ready: () => void;
  expand: () => void;
  onEvent?: (eventType: 'themeChanged', callback: () => void) => void;
  offEvent?: (eventType: 'themeChanged', callback: () => void) => void;
  MainButton?: {
    hide: () => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function getTelegramInitData() {
  const initData = getTelegramWebApp()?.initData;
  if (initData) return initData;

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  return hashParams.get('tgWebAppData') ?? '';
}

export function getAuthHeaders() {
  const initData = getTelegramInitData();
  if (!initData) return {};

  // Some reverse proxies can drop Authorization on proxied requests.
  // Keep both headers so the API can still verify Telegram WebApp initData.
  return {
    Authorization: `tma ${initData}`,
    'X-Telegram-Init-Data': initData
  } satisfies Record<string, string>;
}

export function subscribeToTelegramTheme(callback: () => void) {
  const webApp = getTelegramWebApp();
  webApp?.onEvent?.('themeChanged', callback);

  return () => {
    webApp?.offEvent?.('themeChanged', callback);
  };
}
