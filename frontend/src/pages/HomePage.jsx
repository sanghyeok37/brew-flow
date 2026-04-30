import { useAtomValue } from "jotai";
import { userAtom, storeIdAtom } from "../atoms/authAtoms";
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { Link } from "react-router-dom";
import { FaBolt, FaExclamationTriangle, FaBox, FaStore, FaChartLine, FaArrowRight } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function HomePage() {
  const user = useAtomValue(userAtom);
  const storeId = useAtomValue(storeIdAtom);
  const api = useApi();

  const [stats, setStats] = useState({
    lowStockCount: 0,
    pendingOrderCount: 0,
    storeCount: 0,
    productCount: 0
  });
  const [commonProducts, setCommonProducts] = useState([]);
  const [brandProducts, setBrandProducts] = useState([]);
  const [isServerOnline, setIsServerOnline] = useState(true);

  // 서버 상태 체크 (Actuator 연결)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await api.get("/actuator/health");
        setIsServerOnline(true);
      } catch (e) {
        setIsServerOnline(false);
      }
    };
    checkStatus();
    const timer = setInterval(checkStatus, 30000);
    return () => clearInterval(timer);
  }, [api]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Stats Fetch
        const statsRes = await api.get(`/api/v1/stats/dashboard-summary${storeId ? `?storeId=${storeId}` : ""}`);
        setStats(statsRes.data.data);

        // 2. Dashboard Products Fetch
        // 시스템 공용 상품 (SYSTEM과 STORE에게 노출)
        if (user?.role === 'SYSTEM' || user?.role === 'STORE') {
          const resCommon = await api.get("/api/v1/products?scope=common&size=10");
          setCommonProducts(resCommon.data.data.content || []);
        }
        // 브랜드 전용 상품 (HQ와 STORE에게 노출)
        if (user?.role === 'HQ' || user?.role === 'STORE') {
          const resBrand = await api.get("/api/v1/products?scope=brand&size=10");
          setBrandProducts(resBrand.data.data.content || []);
        }
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [api, storeId, user?.role]);

  const StatCard = ({ title, value, unit, icon, color, link }) => (
    <Link to={link} className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-2xl ${color}`}>{icon}</span>
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">View</span>
      </div>
      <h4 className="text-sm font-bold text-zinc-400">{title}</h4>
      <div className="text-3xl font-black text-white mt-1">
        {loading ? "..." : value} <span className="text-sm font-normal text-zinc-600">{unit}</span>
      </div>
    </Link>
  );

  const ProductCard = ({ product }) => {
    const isManagement = user?.role === 'HQ' || user?.role === 'SYSTEM';

    const getImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return url.startsWith('/') ? url : `/${url}`;
    };

    const CardContent = (
      <div className={`flex-shrink-0 w-48 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 transition-all group ${isManagement ? 'hover:border-violet-500/50 hover:bg-zinc-900 cursor-pointer hover:-translate-y-1' : ''}`}>
        <div className="aspect-square rounded-xl bg-zinc-800 mb-3 overflow-hidden flex items-center justify-center relative">
          {product.imageUrl ? (
            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-zinc-600 text-[10px] font-black uppercase tracking-tighter text-center px-2">
              {product.name}
            </div>
          )}
          {isManagement && (
            <div className="absolute inset-0 bg-gradient-to-t from-violet-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
              <span className="text-[10px] text-white font-black uppercase tracking-widest">상품 관리</span>
            </div>
          )}
        </div>
        <h5 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{product.name}</h5>
        <p className="text-xs text-zinc-500 mt-1">{product.unitCost?.toLocaleString()}원 / {product.unit}</p>
      </div>
    );

    if (isManagement) {
      return <Link to={`/products/edit/${product.productId}`}>{CardContent}</Link>;
    }
    return CardContent;
  };

  const ProductSection = ({ title, products, subtitle }) => (
    <div className="mt-12 overflow-hidden">
      <div className="flex items-end justify-between px-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 snap-x">
          {products.length > 0 ? (
            products.map((p) => <ProductCard key={p.productId} product={p} />)
          ) : (
            <div className="w-full py-12 rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600">
              <p className="text-sm">등록된 상품이 없습니다.</p>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-black text-white tracking-tight">
          반갑습니다, <span className="text-blue-500">{user?.nickname || user?.username}</span>님!
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">
          {user?.role === 'STORE' ? `${user?.brandCode} 브랜드 ${user?.storeName} 매장 현황` :
            user?.role === 'HQ' ? `${user?.brandCode} 브랜드 통합 관리 대시보드` :
              "BrewFlow 전체 시스템 관리 대시보드"}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'STORE' ? (
          <>
            <StatCard
              title="부족 재고"
              value={stats.lowStockCount}
              unit="건"
              icon="⚠️"
              color="text-amber-500"
              link="/inventory"
            />
            <StatCard
              title="진행 중인 발주"
              value={stats.pendingOrderCount}
              unit="건"
              icon="⏳"
              color="text-blue-500"
              link="/orders"
            />
            <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">My Brand</span>
                <h4 className="text-2xl font-black text-white">{user?.brandCode || 'N/A'}</h4>
                <p className="text-xs text-zinc-500 mt-1">브랜드 점포 통합 관리 중</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏷️
              </div>
            </div>
          </>
        ) : (
          <>
            <StatCard
              title={user?.role === 'SYSTEM' ? "전체 점포 수" : "브랜드 점포 수"}
              value={stats.storeCount}
              unit="개"
              icon="🏢"
              color="text-emerald-500"
              link="/admin/stores"
            />
            <StatCard
              title={user?.role === 'SYSTEM' ? "공용 상품 수" : "브랜드 상품 수"}
              value={stats.productCount}
              unit="종"
              icon="📦"
              color="text-indigo-500"
              link="/admin/products"
            />
            {/* System Status Banner */}
            <div className={`col-span-2 p-8 rounded-[40px] ${isServerOnline ? 'bg-blue-600' : 'bg-red-600'} flex items-center justify-between shadow-2xl shadow-blue-900/20 relative overflow-hidden transition-colors duration-500`}>
              <div className="relative z-10">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-4 block">System Status</span>
                <h2 className="text-4xl font-black text-white mb-2">{isServerOnline ? '서버 정상 작동 중' : '서버 연결 끊김'}</h2>
                <p className="text-blue-100 text-sm font-medium opacity-80">{isServerOnline ? '실시간 데이터 동기화 활성화' : '네트워크 상태를 확인해주세요'}</p>
              </div>
              <div className="relative z-10 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10">
                <span className={`text-4xl ${isServerOnline ? 'text-blue-200' : 'text-red-200'} animate-pulse`}>
                  {isServerOnline ? <FaBolt /> : <FaExclamationTriangle />}
                </span>
              </div>
              {/* Abstract Background Shapes */}
              <div className={`absolute top-0 right-0 w-64 h-64 ${isServerOnline ? 'bg-blue-500' : 'bg-red-500'} rounded-full filter blur-[80px] opacity-50 translate-x-1/2 -translate-y-1/2`}></div>
            </div>
          </>
        )}
      </div>

      {/* Product Sections */}
      {!loading && (
        <>
          {(user?.role === 'SYSTEM' || user?.role === 'STORE') && (
            <ProductSection
              title="시스템 추천 공용 품목"
              subtitle="모든 매장에 공급되는 BrewFlow 공식 인증 상품입니다."
              products={commonProducts}
            />
          )}
          {(user?.role === 'HQ' || user?.role === 'STORE') && (
            <ProductSection
              title={`${user?.brandCode || ''} 브랜드 전용 품목`}
              subtitle="우리 브랜드 점포에서만 취급하는 독점 공급 상품입니다."
              products={brandProducts}
            />
          )}
        </>
      )}

      {/* Quick Action for HQ/SYSTEM */}
      {(user?.role === 'HQ' || user?.role === 'SYSTEM') && (
        <div className="mt-12 p-1 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-3xl shadow-2xl">
          <div className="bg-black rounded-[22px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white">신규 점포를 확장하시겠습니까?</h3>
              <p className="text-sm text-zinc-500 mt-1">점포 관리 메뉴에서 클릭 한 번으로 새 가맹점을 등록할 수 있습니다.</p>
            </div>
            <Link to="/admin/stores" className="px-8 py-3.5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/10">
              점포 관리 바로가기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
