import axios from "axios";

export function createHttpClient({ getAccessToken, getRefreshToken, setTokens }) {
  const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-X-XSRF-TOKEN",
  });

  // 리프레시 전용 인스턴스 (인터셉터 없음)
  const refreshHttp = axios.create({
    baseURL: http.defaults.baseURL,
    withCredentials: true,
  });

  http.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  let refreshing = null;

  http.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status = err?.response?.status;
      const original = err?.config;
      // 401(Unauthorized) 또는 403(Forbidden)인 경우 토큰 만료로 간주하고 리프레시 시도
      if ((status !== 401 && status !== 403) || !original || original._retry) {
        throw err;
      }

      original._retry = true;
      if (!refreshing) {
        const refreshToken = getRefreshToken();
        refreshing = refreshHttp
          .post("/api/v1/auth/refresh", { refreshToken })
          .then((r) => {
            const data = r?.data?.data;
            if (!data?.accessToken) {
              throw new Error("refresh failed");
            }
            setTokens({ 
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || refreshToken 
            });
          })
          .catch((refreshErr) => {
            // 리프레시 실패 시 로그아웃 처리
            setTokens({ accessToken: "", refreshToken: "" });
            throw refreshErr;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      await refreshing;
      return http(original);
    }
  );

  return http;
}

