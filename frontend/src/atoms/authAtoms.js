import { atom } from "jotai";

const ACCESS_KEY = "brewflow_access_token";
const REFRESH_KEY = "brewflow_refresh_token";

export const accessTokenAtom = atom(sessionStorage.getItem(ACCESS_KEY) || "");
export const refreshTokenAtom = atom(sessionStorage.getItem(REFRESH_KEY) || "");

export const setTokensAtom = atom(null, (get, set, { accessToken, refreshToken }) => {
  // Update atoms
  set(accessTokenAtom, accessToken || "");
  set(refreshTokenAtom, refreshToken || "");
  
  // Sync with sessionStorage
  if (accessToken) sessionStorage.setItem(ACCESS_KEY, accessToken);
  else sessionStorage.removeItem(ACCESS_KEY);
  
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
  else sessionStorage.removeItem(REFRESH_KEY);
});

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const userAtom = atom((get) => {
  const token = get(accessTokenAtom);
  if (!token) return null;
  const decoded = parseJwt(token);
  if (!decoded) return null;
  return {
    userId: Number(decoded.sub),
    nickname: decoded.nickname,
    role: decoded.role,
    brandCode: decoded.brand,
    storeId: decoded.storeId,
    storeName: decoded.storeName,
  };
});

export const roleAtom = atom((get) => {
  const user = get(userAtom);
  return user?.role || "USER";
});

export const storeIdAtom = atom((get) => {
  const user = get(userAtom);
  return user?.storeId || 0;
});

export const inventoryRefreshAtom = atom(0);
export const inventoryUpdateDataAtom = atom(null);
