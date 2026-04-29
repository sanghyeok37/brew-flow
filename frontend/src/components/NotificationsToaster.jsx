import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { inventoryRefreshAtom, inventoryUpdateDataAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";

export default function NotificationsToaster() {
  const api = useApi();
  const [items, setItems] = useState([]);
  const setRefresh = useSetAtom(inventoryRefreshAtom);
  const setUpdateData = useSetAtom(inventoryUpdateDataAtom);

  useEffect(() => {
    // EventSource는 Axios 인스턴스를 직접 못 쓰므로 baseURL만 공유
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const token = localStorage.getItem("brewflow_access_token") || "";
    if (!token) return;

    // EventSource는 Authorization 헤더를 직접 설정하기 어려워, 샌드박스에서는 query param로 access_token 전달
    const sse = new EventSource(
      `${base}/api/v1/notifications/subscribe?access_token=${encodeURIComponent(token)}`
    );

    // 기본 메시지 핸들러
    sse.onmessage = (e) => {
      const msg = e.data;
      setItems((prev) => [{ id: crypto.randomUUID(), msg }, ...prev].slice(0, 5));
      setTimeout(() => setItems((prev) => prev.slice(0, 4)), 4000);
      setRefresh((prev) => prev + 1);
    };

    // 구조화된 인벤토리 업데이트 핸들러 (사용자님의 '핵심정보만 받아서 바꿔치기' 로직)
    sse.addEventListener("inventory", (e) => {
      try {
        const data = JSON.parse(e.data);
        // 브라우저 데이터 바꿔치기용 아톰 업데이트
        setUpdateData(data);
        
        // 토스트 알림도 표시
        const toastMsg = `[재고 변동] ${data.productName}: ${data.currentStock}`;
        setItems((prev) => [{ id: crypto.randomUUID(), msg: toastMsg }, ...prev].slice(0, 5));
        setTimeout(() => setItems((prev) => prev.slice(0, 4)), 4000);
      } catch (err) {
        console.error("Failed to parse inventory event", err);
      }
    });

    sse.onerror = () => {
      // ignore
    };

    return () => sse.close();
  }, [api]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-none rounded-lg border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-sm text-zinc-100 shadow"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

