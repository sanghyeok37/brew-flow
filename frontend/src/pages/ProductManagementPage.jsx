import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ProductManagementPage() {
  const api = useApi();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Note: We might need to update the backend to support paging for this endpoint 
      // if it doesn't already. For now, let's assume it supports it or we'll add it.
      const res = await api.get(`/api/v1/products?page=${page}&size=10`);
      const data = res.data.data;
      // If the backend returns a list directly (old version), we handle it, 
      // but if it returns PageResponse, we use content.
      if (data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages);
      } else {
        setProducts(data || []);
        setTotalPages(1);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const onDelete = async (id) => {
    if (!window.confirm("정말 이 상품을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/v1/products/${id}`);
      setProducts(products.filter(p => p.productId !== id));
    } catch (e) {
      alert("삭제 실패: " + (e.response?.data?.message || "알 수 없는 오류"));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">상품 관리</h2>
          <p className="text-xs text-zinc-500 mt-2 uppercase tracking-[0.3em] font-bold opacity-70">Master Product Catalog & Brand Assets</p>
        </div>
        <Link 
          to="/products/new"
          className="group relative flex items-center gap-3 rounded-2xl bg-violet-600 px-6 py-4 text-xs font-black text-white hover:bg-violet-500 transition-all shadow-2xl shadow-violet-600/30 active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          신규 상품 등록
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-zinc-800/50 bg-zinc-950/40 shadow-2xl backdrop-blur-md p-3">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <table className="min-w-full border-separate border-spacing-y-2.5 px-2">
            <thead>
              <tr className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-5 text-center w-20">No.</th>
                <th className="px-6 py-5 text-left">상품 마스터 정보</th>
                <th className="px-6 py-5 text-center w-32">브랜드</th>
                <th className="px-6 py-5 text-right w-36">공급 단가</th>
                <th className="px-6 py-5 text-right w-32">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.productId} className="group bg-zinc-900/20 hover:bg-zinc-900/50 transition-all duration-500 border border-transparent hover:border-zinc-700/50">
                  <td className="px-6 py-6 text-center font-mono text-[11px] text-zinc-600 group-hover:text-violet-400 transition-colors first:rounded-l-[1.5rem]">
                    {String((page * 10) + idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-inner group-hover:border-violet-500/30 transition-colors">
                        <img
                          src={p.imageUrl ? `${API_BASE}/${p.imageUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=18181b&color=444&bold=true`}
                          alt={p.name}
                          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                        />
                      </div>
                      <div>
                        <div className="font-black text-zinc-100 text-sm tracking-tight group-hover:text-white transition-colors">{p.name}</div>
                        <div className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-zinc-950/50 text-[10px] text-zinc-500 font-bold border border-zinc-800/50">{p.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black tracking-widest border transition-all ${
                      !p.brandCode 
                      ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/10' 
                      : 'bg-violet-500/5 text-violet-400 border-violet-500/20 group-hover:bg-violet-500/10'
                    }`}>
                      {p.brandCode || "COMMON"}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="font-mono text-zinc-100 font-black text-sm group-hover:text-violet-400 transition-colors tracking-tighter">
                      <span className="text-[10px] text-zinc-600 mr-1 opacity-50">KRW</span>
                      {p.unitCost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right last:rounded-r-[1.5rem]">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/products/edit/${p.productId}`}
                        className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-500 hover:bg-white hover:text-black transition-all shadow-sm"
                        title="Edit Product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button 
                        onClick={() => onDelete(p.productId)}
                        className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all shadow-sm"
                        title="Delete Product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 00-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <p className="text-sm font-medium italic tracking-widest uppercase">No products found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
