import { createBrowserRouter, Navigate, RouterProvider, Outlet, Link } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { accessTokenAtom, userAtom, setTokensAtom, refreshTokenAtom } from "./atoms/authAtoms";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";
import StatsPage from "./pages/StatsPage";
import SettlementPage from "./pages/SettlementPage";
import SignupPage from "./pages/SignupPage";
import ProductRegistrationPage from "./pages/ProductRegistrationPage";
import ProductEditPage from "./pages/ProductEditPage";
import StoreManagementPage from "./pages/StoreManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import MyPage from "./pages/MyPage";
import InventoryLogPage from "./pages/InventoryLogPage";
import NotificationsToaster from "./components/NotificationsToaster";
import { useApi } from "./hooks/useApi";

/**
 * 공통 레이아웃 컴포넌트 (반응형 보강)
 */
function RootLayout() {
  const user = useAtomValue(userAtom);
  const setTokens = useSetAtom(setTokensAtom);
  const token = useAtomValue(accessTokenAtom);
  const refreshToken = useAtomValue(refreshTokenAtom);
  const api = useApi();

  if (!token) return <Navigate to="/login" replace />;

  const onLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout", { refreshToken });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setTokens({ accessToken: "", refreshToken: "" });
    }
  };

  const isManagement = user?.role === "HQ" || user?.role === "SYSTEM";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30">
      <div className="mx-auto max-w-5xl px-4 py-4 md:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/50 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
              BrewFlow
            </Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-zinc-400">
              {!isManagement && (
                <>
                  <Link to="/inventory" className="hover:text-white transition-colors">재고 관리</Link>
                  <Link to="/inventory/logs" className="hover:text-white transition-colors">재고 내역</Link>
                  <Link to="/orders" className="hover:text-white transition-colors">발주 내역</Link>
                </>
              )}
              
              {isManagement && (
                <>
                  <Link to="/admin/stores" className="text-violet-400 hover:text-violet-300 transition-colors font-bold">점포 관리</Link>
                  <Link to="/admin/products" className="text-violet-400 hover:text-violet-300 transition-colors font-bold">상품 관리</Link>
                </>
              )}

              {!isManagement && (
                <>
                  <Link to="/stats" className="hover:text-white transition-colors">주간 통계</Link>
                  <Link to="/settlement" className="hover:text-white transition-colors">월간 정산</Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4 self-end sm:self-auto">
              <Link to="/mypage" className="flex flex-col items-end gap-0.5 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-100 underline decoration-violet-500/50 underline-offset-4">{user?.nickname}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border border-zinc-700/50 ${
                    user?.role === 'SYSTEM' ? 'bg-red-500/10 text-red-400' : 
                    user?.role === 'HQ' ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {user?.role === 'SYSTEM' ? '시스템' : user?.role === 'HQ' ? '본사' : '점주'}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">{user?.storeName || "연결된 점포 없음"}</span>
              </Link>

              <div className="flex items-center gap-2 ml-2">
                <Link 
                  to="/mypage"
                  className="rounded-lg border border-zinc-800 p-2 hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-violet-400"
                  title="마이페이지"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>
                <button 
                  onClick={onLogout}
                  className="rounded-lg border border-zinc-800 p-2 hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-red-400"
                  title="로그아웃"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
        </header>

        <main className="mt-8">
          <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/20 p-4 md:p-8 backdrop-blur-xl shadow-2xl">
            <Outlet />
          </div>
        </main>

        <footer className="mt-16 border-t border-zinc-800/50 pt-12 pb-24">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-sm">
              <h3 className="text-xl font-black text-white tracking-tighter mb-4">BrewFlow</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                카페 프랜차이즈 재고 관리 및 자동 발주 솔루션. 
                스케줄러와 지능형 재고 추적을 통해 점포 운영의 효율성을 극대화합니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div>
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Contact info</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <span className="text-violet-500 font-bold">Manager</span>
                    <span className="text-zinc-300">한상혁</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="text-violet-500 font-bold">Phone</span>
                    <span className="text-zinc-300">010-3922-4355</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="text-violet-500 font-bold">Email</span>
                    <span className="text-zinc-300 hover:text-white transition-colors cursor-pointer">hansh73sh@gmail.com</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Legal</h4>
                <p className="text-xs text-zinc-600 leading-loose">
                  (주)브루플로우 코리아 | 대표 한상혁<br/>
                  사업자등록번호: 202-60-42900<br/>
                  서울특별시 강남구 테헤란로 BrewFlow 빌딩 12F
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-zinc-700 font-medium">
              © 2026 BREWFLOW. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6">
              <span className="text-[10px] text-zinc-700 hover:text-zinc-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-[10px] text-zinc-700 hover:text-zinc-500 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </footer>
      </div>
      <NotificationsToaster />
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "inventory/logs", element: <InventoryLogPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "admin/stores", element: <StoreManagementPage /> },
      { path: "admin/products", element: <ProductManagementPage /> },
      { path: "products/new", element: <ProductRegistrationPage /> },
      { path: "products/edit/:productId", element: <ProductEditPage /> },
      { path: "stats", element: <StatsPage /> },
      { path: "settlement", element: <SettlementPage /> },
      { path: "mypage", element: <MyPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
