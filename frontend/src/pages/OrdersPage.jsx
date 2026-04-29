import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { storeIdAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";
import Pagination from "../components/Pagination";
import { CardSkeleton } from "../components/Skeleton";

export default function OrdersPage() {
  const api = useApi();
  const storeId = useAtomValue(storeIdAtom);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!storeId) return;
      setErr("");
      setLoading(true);
      try {
        let qs = `?page=${page}&size=5`;
        if (status) qs += `&status=${encodeURIComponent(status)}`;
        if (startDate) qs += `&startDate=${encodeURIComponent(startDate + "T00:00:00")}`;
        if (endDate) qs += `&endDate=${encodeURIComponent(endDate + "T23:59:59")}`;

        const r = await api.get(`/api/v1/orders/${storeId}${qs}`);
        if (mounted) {
          const pageData = r?.data?.data;
          setRows(pageData?.content || []);
          setTotalPages(pageData?.totalPages || 0);
        }
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || "failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [api, storeId, status, startDate, endDate, page]);

  const handleDeliver = async (poId) => {
    if (!window.confirm("이 발주 건을 '배송 완료' 처리하시겠습니까?\n(재고가 자동으로 가산됩니다.)")) return;
    try {
      await api.post(`/api/v1/orders/${storeId}/${poId}/deliver`);
      setRows(rows.map(o => o.poId === poId ? { ...o, status: 'DELIVERED' } : o));
    } catch (e) {
      alert("배송 완료 처리 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleCancel = async (poId) => {
    if (!window.confirm("정말 이 발주를 취소하시겠습니까?")) return;
    try {
      await api.post(`/api/v1/orders/${storeId}/${poId}/cancel`);
      setRows(rows.map(o => o.poId === poId ? { ...o, status: 'CANCELED' } : o));
    } catch (e) {
      alert("취소 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleConfirm = async (poId) => {
    if (!window.confirm("이 발주를 확정하시겠습니까? 확정 후에는 본사로 주문이 전달됩니다.")) return;
    try {
      await api.post(`/api/v1/orders/${storeId}/${poId}/confirm`);
      setRows(rows.map(o => o.poId === poId ? { ...o, status: 'ORDERED' } : o));
    } catch (e) {
      alert("확정 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleUpdateQty = async (poId, item) => {
    const input = window.prompt(`'${item.productName}'의 발주 수량을 수정합니다.`, item.orderQty);
    if (input === null) return;
    const newQty = parseInt(input);
    if (isNaN(newQty) || newQty <= 0) {
      alert("올바른 수량을 입력해주세요.");
      return;
    }

    try {
      await api.put(`/api/v1/orders/${storeId}/${poId}/items/${item.productId}`, { orderQty: newQty });
      setRows(rows.map(o => {
        if (o.poId === poId) {
          const newItems = o.items.map(it => it.productId === item.productId ? { ...it, orderQty: newQty } : it);
          // 썸네일 수량 수정 시 전체 금액도 재계산 (간단히 프론트에서 처리)
          const newTotal = newItems.reduce((acc, it) => acc + (it.orderQty * it.unitCostSnapshot), 0);
          return { ...o, items: newItems, totalAmount: newTotal };
        }
        return o;
      }));
    } catch (e) {
      alert("수량 수정 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleDelete = async (poId) => {
    if (!window.confirm("이 발주 내역을 영구히 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/v1/orders/${storeId}/${poId}`);
      setRows(rows.filter(o => o.poId !== poId));
    } catch (e) {
      alert("삭제 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleTriggerThreshold = async () => {
    try {
      await api.post('/api/v1/orders/trigger-threshold-check');
      alert("재고 분석이 완료되었습니다. 부족한 품목의 발주가 생성되었습니다.");
      setPage(0);
      // Re-fetch
      const qs = `?page=0&size=5${status ? `&status=${encodeURIComponent(status)}` : ""}`;
      const r = await api.get(`/api/v1/orders/${storeId}${qs}`);
      setRows(r?.data?.data?.content || []);
    } catch (e) {
      alert("트리거 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleTriggerBatchOrder = async () => {
    try {
      await api.post('/api/v1/orders/trigger-pending-to-ordered');
      alert("모든 승인 대기중인 발주가 '발주 완료' 상태로 전환되었습니다.");
      setPage(0);
      // Re-fetch
      const qs = `?page=0&size=5${status ? `&status=${encodeURIComponent(status)}` : ""}`;
      const r = await api.get(`/api/v1/orders/${storeId}${qs}`);
      setRows(r?.data?.data?.content || []);
    } catch (e) {
      alert("트리거 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [status, startDate, endDate]);

  if (!storeId) return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
      <p>Select a Store ID above to manage orders.</p>
    </div>
  );

  const getStatusStyle = (s) => {
    switch(s) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'ORDERED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">발주 내역 관리</h2>
          <p className="text-sm text-zinc-500">공급망 관리 및 재고 보충 이력을 확인합니다.</p>
        </div>
        <div className="flex flex-wrap items-end gap-6 bg-zinc-900/20 p-4 rounded-2xl border border-zinc-800/50">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">기간 조회</label>
            <div className="flex items-center gap-2">
              <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                  filter: invert(0.8) brightness(1.5);
                  cursor: pointer;
                  padding: 2px;
                  border-radius: 4px;
                  transition: all 0.2s;
                }
                input[type="date"]::-webkit-calendar-picker-indicator:hover {
                  filter: invert(1) brightness(2);
                  transform: scale(1.1);
                }
              `}</style>
              <input
                type="date"
                style={{ colorScheme: 'dark' }}
                className="w-36 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[11px] text-zinc-100 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-zinc-600 font-bold">~</span>
              <input
                type="date"
                style={{ colorScheme: 'dark' }}
                className="w-36 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[11px] text-zinc-100 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="ml-2 text-[10px] font-bold text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">상태별 필터</label>
            <select
              className="w-40 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">전체 내역</option>
              <option value="PENDING">승인 대기중</option>
              <option value="ORDERED">발주 완료</option>
              <option value="DELIVERED">배송 완료</option>
              <option value="CANCELED">발주 취소됨</option>
            </select>
          </div>
        </div>
      </div>

      {/* Demo Trigger Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-400 mr-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Demo Triggers
        </div>
        <button 
          onClick={handleTriggerThreshold}
          className="rounded-xl bg-violet-600/20 px-4 py-2 text-xs font-bold text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 transition-all"
        >
          재고 분석 및 발주 생성
        </button>
        <button 
          onClick={handleTriggerBatchOrder}
          className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
        >
          발주 일괄 확정 (새벽 3시 스케줄러 시뮬레이션)
        </button>
      </div>

      {err ? <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">{err}</div> : null}

      <div className="grid gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {rows.map((o) => (
              <div key={o.poId} className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/50">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-sm font-bold text-zinc-300">
                      #{o.poId}
                    </div>
                    <div>
                      <div className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-500">생성일: {o.createdAt?.split('T')[0]}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">₩{o.totalAmount.toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">총 발주 금액</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-800/50 bg-zinc-950/30">
                  <table className="min-w-full text-left text-[13px] whitespace-nowrap">
                    <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500">
                      <tr>
                        <th className="px-4 py-2 font-medium">상품명</th>
                        <th className="px-4 py-2 font-medium text-right">수량</th>
                        <th className="px-4 py-2 font-medium text-right">단가 (확정)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {(o.items || []).map((it) => (
                        <tr key={it.productId} className="text-zinc-300 group/item">
                          <td className="px-4 py-2.5">
                            <span className="font-medium text-zinc-100">{it.productName}</span>
                            <span className="ml-1 text-[11px] text-zinc-500">/ {it.unit}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            <div className="flex items-center justify-end gap-2">
                              {o.status === 'PENDING' && (
                                <button 
                                  onClick={() => handleUpdateQty(o.poId, it)}
                                  className="hidden group-hover/item:block text-[10px] text-violet-400 hover:text-violet-300"
                                >
                                  [수정]
                                </button>
                              )}
                              {it.orderQty}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-zinc-400">₩{it.unitCostSnapshot.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  {o.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleCancel(o.poId)}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                      >
                        취소
                      </button>
                      <button 
                        onClick={() => handleConfirm(o.poId)}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all"
                      >
                        발주 확정
                      </button>
                    </>
                  )}
                  
                  {o.status === 'ORDERED' && (
                    <button 
                      onClick={() => handleDeliver(o.poId)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                    >
                      배송 완료 처리
                    </button>
                  )}

                  {o.status === 'CANCELED' && (
                    <button 
                      onClick={() => handleDelete(o.poId)}
                      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all"
                    >
                      내역 삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center">
                <p className="text-sm text-zinc-500">조건에 맞는 발주 내역이 없습니다.</p>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={(p) => setPage(p)} 
      />
    </div>
  );
}


