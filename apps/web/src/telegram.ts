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

export function getAuthHeaders() {
  const initData = getTelegramWebApp()?.initData;
  return initData ? { Authorization: `tma ${initData}` } satisfies Record<string, string> : {};
}

export function subscribeToTelegramTheme(callback: () => void) {
  const webApp = getTelegramWebApp();
  webApp?.onEvent?.('themeChanged', callback);

  return () => {
    webApp?.offEvent?.('themeChanged', callback);
  };
}
