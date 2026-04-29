import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/authAtoms";

export default function StoreManagementPage() {
  const api = useApi();
  const user = useAtomValue(userAtom);
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const [keyword, setKeyword] = useState("");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [monthlyProducts, setMonthlyProducts] = useState([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'order'

  const [statusFilter, setStatusFilter] = useState(""); // "", "OPEN", "CLOSED"

  // 점포 등록 관련 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [storeForm, setStoreForm] = useState({
    name: "",
    brandCode: user?.role === 'HQ' ? user?.brandCode : "",
    storeCode: "",
    address: "",
    contact: ""
  });
  const [codeCheck, setCodeCheck] = useState({ status: 'none', message: '' }); // 'none', 'pending', 'success', 'error'

  const isCodePatternValid = /^[0-9]{5}$/.test(storeForm.storeCode);

  const handleCheckCode = async () => {
    if (!isCodePatternValid) {
      setCodeCheck({ status: 'error', message: '점포 코드는 숫자 5자리여야 합니다.' });
      return;
    }
    
    setCodeCheck({ status: 'pending', message: '조회 중...' });
    try {
      const fullCode = (storeForm.brandCode || "") + storeForm.storeCode;
      const res = await api.get(`/api/v1/admin/stores/check-code?storeCode=${fullCode}`);
      const isDuplicate = res.data.data;
      
      if (isDuplicate) {
        setCodeCheck({ status: 'error', message: '이미 등록된 점포 코드입니다.' });
      } else {
        setCodeCheck({ status: 'success', message: '사용 가능한 코드입니다.' });
      }
    } catch (e) {
      setCodeCheck({ status: 'error', message: '코드 확인 중 오류가 발생했습니다.' });
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (codeCheck.status !== 'success') {
      alert("점포 코드 중복 확인이 필요합니다.");
      return;
    }

    setCreateLoading(true);
    try {
      await api.post("/api/v1/admin/stores", storeForm);
      alert("점포가 성공적으로 등록되었습니다.");
      setIsCreateModalOpen(false);
      setStoreForm({ name: "", brandCode: user?.role === 'HQ' ? user?.brandCode : "", storeCode: "", address: "", contact: "" });
      setCodeCheck({ status: 'none', message: '' });
      fetchStores();
    } catch (e) {
      alert(e.response?.data?.message || "점포 등록에 실패했습니다.");
    } finally {
      setCreateLoading(false);
    }
  };

  const fetchMonthlyData = async (storeId, year, month) => {
    setIsMonthlyLoading(true);
    try {
      const [amtRes, prodRes] = await Promise.all([
        api.get(`/api/v1/admin/stores/${storeId}/monthly-order?year=${year}&month=${month}`),
        api.get(`/api/v1/admin/stores/${storeId}/monthly-products?year=${year}&month=${month}`)
      ]);
      setMonthlyAmount(amtRes.data.data);
      setMonthlyProducts(prodRes.data.data || []);
    } catch (e) {
      console.error("Failed to fetch monthly data", e);
      setMonthlyAmount(0);
      setMonthlyProducts([]);
    } finally {
      setIsMonthlyLoading(false);
    }
  };

  const changeMonth = (delta) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    if (selectedStore) fetchMonthlyData(selectedStore.storeId, newYear, newMonth);
  };

  const onViewDetails = async (store) => {
    setActiveTab('info');
    try {
      const res = await api.get(`/api/v1/admin/stores/${store.storeId}`);
      const fullData = res.data.data;
      setSelectedStore(fullData);
      
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      setSelectedYear(year);
      setSelectedMonth(month);
      fetchMonthlyData(store.storeId, year, month);
    } catch (e) {
      console.error("Failed to fetch store details", e);
      setSelectedStore(store);
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/admin/stores?page=${page}&size=10&keyword=${keyword}&status=${statusFilter}`);
      const data = res.data.data;
      setStores(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error("Failed to fetch stores", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, statusFilter]);

  const onSearch = (e) => {
    e.preventDefault();
    if (page === 0) fetchStores();
    else setPage(0); // This will trigger useEffect
  };

  const formatContact = (val) => {
    if(!val) return "미등록";
    return val.replace(/[^0-9]/g, '')
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">점포 관리</h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">가맹점 네트워크 및 점주 프로필 관리</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50">
          {/* Status Filter Tabs */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
            {[
              { label: 'ALL', value: '' },
              { label: 'OPEN', value: 'OPEN' },
              { label: 'CLOSED', value: 'CLOSED' }
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => { setStatusFilter(f.value); setPage(0); }}
                className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  statusFilter === f.value 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-wider"
          >
            + 새 점포 등록
          </button>
          
          <form onSubmit={onSearch} className="relative group flex-1 max-w-[280px]">
            <input 
              type="text"
              placeholder="점포명 또는 코드 검색..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-[11px] text-zinc-100 focus:outline-none focus:border-violet-500 transition-all pl-10 shadow-inner"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <svg className="absolute left-3.5 top-3 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/50 shadow-2xl backdrop-blur-sm p-2">
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : (
          <table className="min-w-full border-separate border-spacing-y-2 px-4">
            <thead>
              <tr className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-black">
                <th className="px-4 py-4 text-center w-16">순번</th>
                <th className="px-4 py-4 text-left">점포 정보</th>
                <th className="px-4 py-4 text-center w-24">타입</th>
                <th className="px-4 py-4 text-center w-32">상태</th>
                <th className="px-4 py-4 text-center w-20">브랜드</th>
                <th className="px-4 py-4 text-center w-36">점포코드</th>
                <th className="px-4 py-4 text-right w-24">관리</th>
              </tr>
            </thead>
            <tbody className="">
              {stores.map((s, idx) => (
                <tr key={s.storeId} className="group bg-zinc-900/30 hover:bg-zinc-900/60 transition-all duration-300">
                  <td className="px-4 py-5 text-center font-mono text-[10px] text-zinc-600 group-hover:text-violet-400 transition-colors first:rounded-l-2xl">
                    {String((page * 10) + idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-5">
                    <div className="font-bold text-zinc-100 group-hover:text-white transition-colors text-sm">{s.name}</div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black tracking-tighter ${
                      s.type === 'SYSTEM' ? 'bg-red-500/10 text-red-500' :
                      s.type === 'HQ' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`inline-flex items-center justify-center gap-2 min-w-[85px] px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                      s.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                      {s.status === 'OPEN' ? '운영 중' : '폐점'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center text-zinc-500 font-mono text-[10px] uppercase font-bold tracking-tighter">{s.brandCode || "-"}</td>
                  <td className="px-4 py-5 text-center">
                    <span className="text-violet-400 font-mono font-black text-[11px] bg-violet-400/5 px-2 py-1 rounded-lg border border-violet-400/10">
                      {s.storeCode || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right last:rounded-r-2xl">
                    <button 
                      onClick={() => onViewDetails(s)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-wider"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-zinc-500 italic font-medium">검색 결과가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Detail Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-3xl rounded-[2.5rem] border border-zinc-800 bg-zinc-900 p-10 shadow-2xl shadow-violet-500/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">Store Profile</span>
                <h3 className="text-3xl font-black text-white italic mt-1">{selectedStore.name}</h3>
              </div>
              <button onClick={() => setSelectedStore(null)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tab Header */}
            <div className="flex gap-2 mb-8 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 w-fit">
              <button 
                onClick={() => setActiveTab('info')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'info' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                기본 정보
              </button>
              <button 
                onClick={() => setActiveTab('order')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'order' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                발주 현황
              </button>
            </div>

            <div className="min-h-[350px]">
              {activeTab === 'info' ? (
                <div className="grid grid-cols-2 gap-10 animate-in slide-in-from-left-4 duration-300">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">점포 코드</label>
                      <p className="text-sm font-mono text-violet-400 mt-2">{selectedStore.storeCode}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">브랜드</label>
                      <p className="text-sm text-zinc-100 mt-2">{selectedStore.brandCode || "공용"}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-zinc-950 p-8 border border-zinc-800/50">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-violet-500">점주 정보</label>
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">이름</p>
                        <p className="text-sm font-bold text-zinc-100 mt-1">{selectedStore.ownerName || "미등록"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">이메일</p>
                        <p className="text-sm font-bold text-zinc-100 mt-1">{selectedStore.ownerEmail || "미등록"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">연락처</p>
                        <p className="text-sm font-bold text-zinc-100 mt-1 font-mono">{formatContact(selectedStore.ownerContact)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between p-6 rounded-[2rem] bg-violet-500/5 border border-violet-500/10">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-violet-500">월간 누적 발주액</label>
                      <div className="mt-2">
                        <span className={`text-3xl font-black italic ${monthlyAmount > 0 ? 'text-white' : 'text-zinc-700'}`}>
                          ₩{monthlyAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-zinc-950 rounded-xl px-4 py-2 border border-zinc-800 shadow-inner">
                      <button onClick={() => changeMonth(-1)} className="text-zinc-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <span className="text-xs font-mono font-bold text-zinc-300 min-w-[80px] text-center">
                        {selectedYear}.{String(selectedMonth).padStart(2, '0')}
                      </span>
                      <button onClick={() => changeMonth(1)} className="text-zinc-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">상품별 발주 내역</label>
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 max-h-[200px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-zinc-900 text-zinc-500 sticky top-0">
                          <tr>
                            <th className="px-5 py-3 font-bold uppercase">상품명</th>
                            <th className="px-5 py-3 font-bold uppercase text-right">수량</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {monthlyProducts.map((p, i) => (
                            <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="px-5 py-3 text-zinc-300 font-medium">{p.productName}</td>
                              <td className="px-5 py-3 text-right text-zinc-100 font-mono">
                                {p.totalQty} <span className="text-zinc-600 text-[9px]">{p.unit}</span>
                              </td>
                            </tr>
                          ))}
                          {monthlyProducts.length === 0 && (
                            <tr>
                              <td colSpan={2} className="px-5 py-10 text-center text-zinc-600 italic">해당 월의 발주 내역이 없습니다.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedStore(null)}
              className="w-full mt-10 py-4 bg-zinc-800 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-[10px]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Registration</span>
                <h3 className="text-2xl font-black text-white italic mt-1">새 점포 등록</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">점포명</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all mt-1"
                  placeholder="예: 브루플로우 강남점"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">브랜드 코드</label>
                <input 
                  required
                  disabled={user?.role === 'HQ'}
                  type="text" 
                  className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all mt-1 ${user?.role === 'HQ' ? 'opacity-50 cursor-not-allowed font-mono' : ''}`}
                  placeholder="3자리 브랜드 코드 (예: EDI)"
                  maxLength={3}
                  value={storeForm.brandCode}
                  onChange={(e) => setStoreForm({...storeForm, brandCode: e.target.value.toUpperCase()})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">점포 코드 (숫자 5자리)</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    required
                    type="text" 
                    className={`flex-1 bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono transition-all ${
                      codeCheck.status === 'success' ? 'border-emerald-500/50' : 
                      codeCheck.status === 'error' ? 'border-red-500/50' : 'border-zinc-800 focus:border-blue-500'
                    }`}
                    placeholder="예: 00001"
                    maxLength={5}
                    value={storeForm.storeCode}
                    onChange={(e) => {
                      setStoreForm({...storeForm, storeCode: e.target.value.replace(/[^0-9]/g, '')});
                      setCodeCheck({ status: 'none', message: '' }); // 값이 바뀌면 중복확인 초기화
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleCheckCode}
                    disabled={!isCodePatternValid || codeCheck.status === 'pending'}
                    className="px-4 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-xl hover:bg-zinc-700 disabled:opacity-30 transition-all whitespace-nowrap"
                  >
                    중복 확인
                  </button>
                </div>
                {codeCheck.message && (
                  <p className={`text-[10px] mt-1.5 ml-1 italic font-medium ${
                    codeCheck.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {codeCheck.message}
                  </p>
                )}
              </div>

              {/* Preview Area */}
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">최종 생성될 점포 코드:</span>
                <span className="text-sm font-black text-blue-400 font-mono tracking-wider">
                  {storeForm.brandCode || "???"}{storeForm.storeCode || "00000"}
                </span>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3.5 bg-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-700 transition-all text-xs"
                >
                  취소
                </button>
                <button 
                  disabled={createLoading || codeCheck.status !== 'success'}
                  type="submit"
                  className="flex-[2] py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95 text-xs disabled:opacity-50"
                >
                  {createLoading ? "등록 중..." : "점포 등록 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
