import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { storeIdAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";
import Pagination from "../components/Pagination";

export default function InventoryLogPage() {
  const api = useApi();
  const storeId = useAtomValue(storeIdAtom);
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch products for filtering
  useEffect(() => {
    async function fetchProducts() {
      if (!storeId) return;
      try {
        const r = await api.get(`/api/v1/inventory/${storeId}?size=100`);
        setProducts(r.data.data.content || []);
      } catch (e) {
        console.error("failed to fetch products", e);
      }
    }
    fetchProducts();
  }, [api, storeId]);

  useEffect(() => {
    async function fetchLogs() {
      if (!storeId) return;
      setLoading(true);
      try {
        const url = `/api/v1/inventory/${storeId}/logs?page=${page}&size=20${selectedProductId ? `&productId=${selectedProductId}` : ""}`;
        const r = await api.get(url);
        const pageData = r.data.data;
        setLogs(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      } catch (e) {
        console.error("failed to fetch logs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [api, storeId, page, selectedProductId]);

  const getLogBadge = (type) => {
    switch (type) {
      case "INITIAL_REGISTER": return { label: "초기 등록", style: "bg-violet-500/10 text-violet-400 border-violet-500/20" };
      case "DELIVERED_INBOUND": return { label: "발주 입고", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "SALE_OUTBOUND": return { label: "판매 출고", style: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
      case "DEDUCTION": return { label: "재고 차감", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "MANUAL_UPDATE": return { label: "수동 수정", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "MANUAL_DEDUCT": return { label: "수동 차감", style: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
      default: return { label: type, style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" };
    }
  };

  if (!storeId) return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
      <p>점포를 선택하면 재고 변동 내역을 확인할 수 있습니다.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">재고 변동 내역</h2>
          <p className="text-sm text-zinc-500">재고의 입고, 출고 및 수정 이력을 실시간으로 추적합니다.</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">상품 필터</span>
          <select
            className="w-48 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-zinc-300 transition-all focus:border-violet-500 focus:outline-none"
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setPage(0);
            }}
          >
            <option value="">전체 상품 보기</option>
            {products.map(p => (
              <option key={p.productId} value={p.productId}>{p.productName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm shadow-2xl">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">일시</th>
              <th className="px-6 py-4">상품명</th>
              <th className="px-6 py-4">구분</th>
              <th className="px-6 py-4 text-right">변경 전</th>
              <th className="px-6 py-4 text-right">변동량</th>
              <th className="px-6 py-4 text-right text-white">최종 재고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {loading && logs.length === 0 ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-zinc-900 animate-pulse rounded-md w-full" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-zinc-600 font-medium">변동 내역이 아직 없습니다.</td>
              </tr>
            ) : (
              logs.map((log) => {
                const badge = getLogBadge(log.changeType);
                return (
                  <tr key={log.logId} className="group hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4 text-[11px] font-medium text-zinc-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-100">{log.productName}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badge.style}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-500">{log.beforeQty}</td>
                    <td className={`px-6 py-4 text-right font-bold font-mono ${log.changeQty > 0 ? 'text-emerald-500' : log.changeQty < 0 ? 'text-rose-500' : 'text-zinc-500'}`}>
                      {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty}
                    </td>
                    <td className="px-6 py-4 text-right font-bold font-mono text-white text-base">
                      <span className="bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700 shadow-sm">{log.resultQty}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={(p) => setPage(p)} 
      />
    </div>
  );
}
