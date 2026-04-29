import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { userAtom, storeIdAtom, inventoryRefreshAtom, inventoryUpdateDataAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function InventoryPage() {
  const api = useApi();
  const user = useAtomValue(userAtom);
  const storeId = useAtomValue(storeIdAtom);
  const refreshTrigger = useAtomValue(inventoryRefreshAtom);
  const updateData = useAtomValue(inventoryUpdateDataAtom);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [regForm, setRegForm] = useState({ productId: "", currentStockQty: 0, safetyStockQty: 10, autoOrderQty: 20 });

  const fetchAllProducts = async () => {
    try {
      // Fetch a larger set for the registration dropdown
      const res = await api.get("/api/v1/products?size=100");
      const data = res.data.data;
      setAllProducts(data.content || data || []);
    } catch (e) {
      console.error("Failed to fetch all products", e);
    }
  };

  const onRegister = async () => {
    try {
      await api.post(`/api/v1/inventory/${storeId}`, {
        productId: Number(regForm.productId),
        currentStockQty: Number(regForm.currentStockQty),
        safetyStockQty: Number(regForm.safetyStockQty),
        autoOrderQty: Number(regForm.autoOrderQty)
      });
      alert("상품이 재고 목록에 등록되었습니다.");
      setShowRegisterModal(false);
      // Refresh the list
      setPage(0);
      setRows([]); // Clear to trigger re-fetch or just rely on refreshTrigger if implemented
      const r = await api.get(`/api/v1/inventory/${storeId}?page=0&size=10`);
      setRows(r?.data?.data?.content || []);
    } catch (e) {
      alert("등록 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("이 상품을 재고 목록에서 제외하시겠습니까? (상품 정보 자체가 삭제되지는 않습니다)")) return;
    try {
      await api.delete(`/api/v1/inventory/${storeId}/${productId}`);
      alert("재고 목록에서 제외되었습니다.");
      setRows(rows.filter(r => r.productId !== productId));
    } catch (e) {
      alert("삭제 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleDeduct = async (productId, productName) => {
    const input = window.prompt(`[시연용] '${productName}'을(를) 얼마만큼 사용하시겠습니까?`, "1");
    if (input === null) return;
    const qty = parseInt(input);
    if (isNaN(qty) || qty <= 0) {
      alert("올바른 수량을 입력해주세요.");
      return;
    }

    try {
      await api.post(`/api/v1/inventory/${storeId}/deduct`, { productId, deductQty: qty });
      // 즉시 UI 반영
      setRows(prev => prev.map(r => 
        r.productId === productId 
          ? { ...r, currentStockQty: r.currentStockQty - qty } 
          : r
      ));
    } catch (e) {
      alert("차감 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  const handleUpdateSettings = async (item) => {
    const safety = window.prompt(`'${item.productName}'의 최소 기준(안전 재고)을 설정해주세요.`, item.safetyStockQty);
    if (safety === null) return;
    
    const autoOrder = window.prompt(`'${item.productName}'의 1회 자동 주문량을 설정해주세요.`, item.autoOrderQty);
    if (autoOrder === null) return;

    const sQty = parseInt(safety);
    const aQty = parseInt(autoOrder);

    if (isNaN(sQty) || isNaN(aQty) || sQty < 0 || aQty < 0) {
      alert("올바른 수량을 입력해주세요.");
      return;
    }

    try {
      await api.put(`/api/v1/inventory/${storeId}/settings`, { 
        productId: item.productId, 
        safetyStockQty: sQty, 
        autoOrderQty: aQty 
      });
      alert("설정이 저장되었습니다.");
      // SSE나 다른 메커니즘이 없다면 수동으로 상태 업데이트 (혹은 refresh)
      setRows(rows.map(r => r.productId === item.productId ? { ...r, safetyStockQty: sQty, autoOrderQty: aQty } : r));
    } catch (e) {
      alert("저장 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!storeId) return;
      setErr("");
      setLoading(true);
      try {
        const r = await api.get(`/api/v1/inventory/${storeId}?page=${page}&size=10`);
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
  }, [api, storeId, page, refreshTrigger]);

  // 실시간 데이터 직접 바꿔치기 (세터 함수 호출)
  useEffect(() => {
    if (updateData && updateData.storeId === storeId) {
      setRows((prevRows) => 
        prevRows.map((row) => 
          row.productId === updateData.productId 
            ? { ...row, currentStockQty: updateData.currentStock } 
            : row
        )
      );
    }
  }, [updateData, storeId]);

  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 rounded-3xl bg-zinc-900/50 p-6 border border-zinc-800 shadow-xl shadow-violet-500/5">
          <svg className="h-12 w-12 text-violet-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Store Linked</h3>
        <p className="text-zinc-500 max-w-xs mx-auto">당신의 계정에 연결된 점포가 없습니다. 본사에 문의하여 점포 코드를 확인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">재고 현황 관리</h2>
          <p className="text-sm text-zinc-500">
            <span className="text-violet-400 font-semibold">{user?.storeName}</span>의 원부자재 재고를 실시간으로 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-400 border border-violet-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
          실시간 현황 (Live)
        </div>
        <button
          onClick={() => {
            fetchAllProducts();
            setShowRegisterModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          재고 상품 등록
        </button>
      </div>

      {err ? (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          {err}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-4">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : (
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px]">상품명</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px]">카테고리</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">현재 재고</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">최소 기준</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">자동 주문량</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">단가</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {rows.map((r) => (
                <tr key={`${r.storeId}-${r.productId}`} className="group hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-transform group-hover:scale-105">
                        <img
                          src={r.imageUrl ? `${API_BASE}/${r.imageUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(r.productName)}&background=2e1065&color=ddd&bold=true`}
                          alt={r.productName}
                          className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-100">{r.productName}</div>
                        <div className="text-[11px] text-zinc-500">{r.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/50">
                      {r.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-sm font-medium ${r.currentStockQty <= r.safetyStockQty ? 'text-orange-400' : 'text-zinc-100'}`}>
                      {r.currentStockQty.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-zinc-400">
                    {r.safetyStockQty}
                  </td>
                  <td className="px-4 py-4 text-right text-zinc-400">
                    {r.autoOrderQty}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-mono text-xs text-violet-400">₩{r.unitCost.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleDeduct(r.productId, r.productName)}
                        className="text-zinc-500 hover:text-orange-400 transition-colors" 
                        title="재고 차감"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleUpdateSettings(r)}
                        className="text-zinc-500 hover:text-violet-400 transition-colors" 
                        title="임계치 설정 수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button
                        onClick={() => deleteProduct(r.productId)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="재고 목록에서 제외"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-zinc-500" colSpan={7}>
                    등록된 재고 상품이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={(p) => setPage(p)} 
      />

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-violet-500/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white italic">REGISTER PRODUCT</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">상품 선택</label>
                <select 
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all appearance-none"
                  value={regForm.productId}
                  onChange={(e) => setRegForm({...regForm, productId: e.target.value})}
                >
                  <option value="">상품을 선택하세요</option>
                  {allProducts.map(p => (
                    <option key={p.productId} value={p.productId}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">현재 재고</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all"
                    value={regForm.currentStockQty}
                    onChange={(e) => setRegForm({...regForm, currentStockQty: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">최소 기준</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all"
                    value={regForm.safetyStockQty}
                    onChange={(e) => setRegForm({...regForm, safetyStockQty: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">자동 주문량</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all"
                    value={regForm.autoOrderQty}
                    onChange={(e) => setRegForm({...regForm, autoOrderQty: e.target.value})}
                  />
                </div>
              </div>

              <button
                onClick={onRegister}
                disabled={!regForm.productId}
                className="w-full bg-violet-600 text-white font-black py-4 rounded-2xl hover:bg-violet-500 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-violet-600/20"
              >
                재고 품목으로 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
