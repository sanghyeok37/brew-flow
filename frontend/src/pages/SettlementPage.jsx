import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { storeIdAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";
import Skeleton from "../components/Skeleton";

export default function SettlementPage() {
  const api = useApi();
  const storeId = useAtomValue(storeIdAtom);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState({ confirmedAmount: 0, orderedAmount: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!storeId) return;
      setErr("");
      setLoading(true);
      try {
        const r = await api.get(`/api/v1/settlement/${storeId}?year=${year}&month=${month}`);
        if (mounted) {
          setData({
            confirmedAmount: r?.data?.data?.confirmedAmount ?? 0,
            orderedAmount: r?.data?.data?.orderedAmount ?? 0,
            pendingAmount: r?.data?.data?.pendingAmount ?? 0
          });
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
  }, [api, storeId, year, month]);

  if (!storeId) return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
      <p>Select a Store ID above to view settlement data.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">월간 정산 현황</h2>
          <p className="text-sm text-zinc-500">발주 상태별 정산 및 예정 금액을 단계별로 확인합니다.</p>
        </div>
        <div className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-bold text-violet-500 border border-violet-500/20 uppercase tracking-widest">
          Financial Dashboard
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">연도 (Year)</span>
            <input
              className="w-32 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value || now.getFullYear()))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">월 (Month)</span>
            <input
              className="w-24 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all"
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value || 1))}
            />
          </label>
        </div>
        
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/20 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            <span className="font-bold text-zinc-200">데이터 기준:</span> 모든 금액은 생성일 기준으로 해당 월에 포함된 발주들의 총합입니다.
          </p>
        </div>
      </div>

      {err ? <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">{err}</div> : null}

      {/* Total Activity Summary Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-violet-600/20 border border-zinc-800 p-1">
        <div className="rounded-[14px] bg-zinc-950/80 px-6 py-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">이번 달 통합 발주 규모</h3>
            <p className="text-xs text-zinc-500">검토중인 내역을 포함한 모든 발주 활동의 총합입니다.</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">
              ₩{(data.confirmedAmount + data.orderedAmount + data.pendingAmount).toLocaleString()}
            </span>
            <span className="text-sm font-bold text-zinc-500">원</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Confirmed Amount Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-all hover:border-emerald-500/30">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-600/5 blur-2xl transition-all group-hover:bg-emerald-600/10" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                지불 확정액
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">₩{data.confirmedAmount.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">배송 완료가 확인되어<br/>결제가 확정된 금액</p>
            </div>
          </div>
        </div>

        {/* Ordered Amount Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-all hover:border-blue-500/30">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-600/5 blur-2xl transition-all group-hover:bg-blue-600/10" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                청구 예정액
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-zinc-100">₩{data.orderedAmount.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">본사로 주문이 전송되어<br/>배송 진행 중인 금액</p>
            </div>
          </div>
        </div>

        {/* Pending Amount Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-all hover:border-violet-500/30">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-600/5 blur-2xl transition-all group-hover:bg-violet-600/10" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                검토 중인 발주
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-400">₩{data.pendingAmount.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">시스템이 생성하였으나<br/>아직 확정하지 않은 금액</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center">
        <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-[0.3em] font-semibold">
          Data Verified By BrewFlow Financial Engine
        </p>
      </div>
    </div>
  );
}
