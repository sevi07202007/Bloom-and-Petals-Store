const REFRESH_KEY = "bp_refresh";
let accessToken: string | null = null;

export const tokenStorage = {
  getAccess: () => accessToken,
  setAccess: (t: string | null) => {
    accessToken = t;
  },
  getRefresh: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefresh: (t: string | null) => {
    try {
      if (t) localStorage.setItem(REFRESH_KEY, t);
      else localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    accessToken = null;
    tokenStorage.setRefresh(null);
  },
};
