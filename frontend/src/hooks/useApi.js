import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { accessTokenAtom, refreshTokenAtom, setTokensAtom } from "../atoms/authAtoms";
import { createHttpClient } from "../api/http";

export function useApi() {
  const setTokens = useSetAtom(setTokensAtom);

  return useMemo(() => {
    return createHttpClient({
      // 렌더링 시점의 값이 아니라, 호출 시점의 최신 값을 가져오도록 수정
      getAccessToken: () => sessionStorage.getItem("brewflow_access_token") || "",
      getRefreshToken: () => sessionStorage.getItem("brewflow_refresh_token") || "",
      setTokens,
    });
  }, [setTokens]);
}

