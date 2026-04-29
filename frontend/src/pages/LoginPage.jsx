import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSetAtom } from "jotai";
import { setTokensAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";

export default function LoginPage() {
  const api = useApi();
  const nav = useNavigate();
  const setTokens = useSetAtom(setTokensAtom);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", { username, password });
      const data = res?.data?.data;
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      nav("/"); 
    } catch (e2) {
      const status = e2?.response?.status;
      const data = e2?.response?.data;
      const msg = data?.message || "";
      
      // 백엔드의 ErrorCode와 매칭하여 한글 메시지 출력
      if (status === 401 || msg.includes("Invalid username or password") || msg.includes("Authentication failed")) {
        setErr("아이디 또는 비밀번호가 일치하지 않습니다.");
      } else if (status === 403 || msg.includes("Access denied")) {
        setErr("계정 권한이 없거나 접근이 차단되었습니다. 관리자에게 문의하세요.");
      } else if (msg.includes("Internal server error")) {
        setErr("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      } else if (msg.includes("Resource not found")) {
        setErr("계정 정보를 찾을 수 없습니다.");
      } else {
        setErr(msg || "로그인 처리 중 오류가 발생했습니다. 네트워크 상태를 확인해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 mb-4 shadow-lg shadow-violet-500/20">
            <span className="text-2xl font-bold">B</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">BrewFlow</h1>
          <p className="mt-2 text-sm text-zinc-400">Welcome back. Please login to manage your store.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Username</label>
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-100 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-100 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {err ? (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                {err}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-violet-600/40 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-12 flex justify-center opacity-40">
          <div className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-400 border border-zinc-700">
            API: {import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}
          </div>
        </div>
      </div>
    </div>
  );
}


