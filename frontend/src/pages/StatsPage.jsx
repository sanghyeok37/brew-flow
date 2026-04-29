import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { storeIdAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";
import Pagination from "../components/Pagination";

export default function StatsPage() {
  const api = useApi();
  const storeId = useAtomValue(storeIdAtom);
  const [size, setSize] = useState(5);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("latest");
  const [totalPages, setTotalPages] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!storeId) return;
      setErr("");
      setLoading(true);
      try {
        const r = await api.get(`/api/v1/stats/weekly?storeId=${storeId}&page=${page}&size=${size}&orderBy=${orderBy}`);
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
  }, [api, storeId, page, size, orderBy]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [size, orderBy]);

  const handleTriggerWeekly = async () => {
    if (!window.confirm("지난 주간 통계 집계를 즉시 실행하시겠습니까?")) return;
    setIsTriggering(true);
    try {
      await api.post("/api/v1/stats/trigger-weekly");
      alert("집계가 완료되었습니다.");
      setPage(0);
      const r = await api.get(`/api/v1/stats/weekly?storeId=${storeId}&page=0&size=${size}`);
      setRows(r?.data?.data?.content || []);
      setTotalPages(r?.data?.data?.totalPages || 0);
    } catch (e) {
      alert("집계 실패: " + (e.response?.data?.message || e.message));
    } finally {
      setIsTriggering(false);
    }
  };

  if (!storeId) return <div className="text-sm text-zinc-300">상단에서 `storeId`를 입력하세요.</div>;

  return (
    <div className="space-y-6">
      {/* Demo Tools Section */}
      <div className="rounded-2xl bg-zinc-900/50 border border-violet-500/20 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Demo Triggers</div>
            <div className="text-xs text-zinc-400">시연용: 스케줄러를 대신하여 즉시 통계를 집계합니다.</div>
          </div>
        </div>
        <button
          onClick={handleTriggerWeekly}
          disabled={isTriggering}
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-600/20"
        >
          {isTriggering ? "집계 중..." : "주간 발주 통계 즉시 집계"}
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="text-lg font-semibold text-white">주간 발주 통계</div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">정렬 기준</span>
            <select
              className="w-32 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] font-bold text-zinc-300 transition-all focus:border-violet-500 focus:outline-none"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="amount">금액 높은순</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">표시 개수</span>
            <div className="flex gap-1 rounded-xl bg-zinc-900/50 p-1 border border-zinc-800">
              {[5, 10, 20, 1000].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    size === s 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {s === 1000 ? '전체' : `${s}건`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {err ? <div className="text-sm text-red-300">{err}</div> : null}

      <div className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/40 min-h-[200px]">
          {rows.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-bold">집계된 통계 데이터가 없습니다.</p>
                <p className="mt-1 text-xs text-zinc-600 font-medium">상단의 [주간 발주 통계 즉시 집계] 버튼을 눌러 시연 데이터를 생성해 보세요!</p>
              </div>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-4 py-3">기준 주차</th>
                  <th className="px-4 py-3 text-right">발주 건수</th>
                  <th className="px-4 py-3 text-right">총 발주액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {rows.map((r) => (
                  <tr key={r.statId || r.baseWeek} className="text-zinc-300 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.baseWeek}</td>
                    <td className="px-4 py-3 text-right font-mono">{r.totalPoCount}</td>
                    <td className="px-4 py-3 text-right font-mono text-violet-400">₩{r.totalPoAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}
