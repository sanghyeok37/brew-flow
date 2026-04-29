import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { setTokensAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";

export default function MyPage() {
  const api = useApi();
  const setTokens = useSetAtom(setTokensAtom);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");

  // Password change state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/api/v1/users/me/profile");
        const data = res.data.data;
        setProfile(data);
        setName(data.name);
        setNickname(data.nickname);
        // Initial formatting
        setContact(formatPhoneNumber(data.contact || ""));
      } catch (e) {
        setMsg({ text: "프로필 정보를 불러오는데 실패했습니다.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [api]);

  const formatPhoneNumber = (val) => {
    if (!val) return "";
    const value = val.replace(/[^0-9]/g, "");
    if (value.length < 4) return value;
    if (value.length < 8) return value.replace(/(\d{3})(\d{1,4})/, "$1-$2");
    return value.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  };

  const onContactChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setContact(formatted);
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      // Strip hyphens before sending to backend to satisfy DB constraints (VARCHAR(11) + 010xxxxxxxx check)
      const cleanedContact = contact.replace(/[^0-9]/g, "");
      const res = await api.put("/api/v1/users/me/profile", { name, nickname, contact: cleanedContact });
      const tokens = res.data.data;
      if (tokens) {
        setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      }
      setMsg({ text: "프로필이 성공적으로 업데이트되었습니다.", type: "success" });
    } catch (e) {
      setMsg({ text: "프로필 업데이트에 실패했습니다.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onPasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: "새 비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }
    if (!pwForm.oldPassword) {
      setPwMsg({ text: "현재 비밀번호를 입력해 주세요.", type: "error" });
      return;
    }

    setPwSaving(true);
    setPwMsg({ text: "", type: "" });
    try {
      await api.post("/api/v1/auth/password-change", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ text: "비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해 주세요.", type: "success" });
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });

      // Optional: auto logout after password change
      setTimeout(() => {
        setTokens({ accessToken: "", refreshToken: "" });
      }, 2000);
    } catch (e) {
      const errorMsg = e.response?.data?.message || "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.";
      setPwMsg({ text: errorMsg, type: "error" });
    } finally {
      setPwSaving(false);
    }
  };

  const isPwMatching = pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword;
  const isPwMismatch = pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword;

  const onWithdraw = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까? 탈퇴 후 모든 데이터가 비활성화되며 복구할 수 없습니다.")) return;
    
    try {
      await api.post("/api/v1/users/me/withdraw");
      alert("탈퇴 처리가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
      setTokens({ accessToken: "", refreshToken: "" });
    } catch (e) {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white italic">MY PAGE</h2>
          <p className="text-zinc-500 text-sm mt-2 font-bold uppercase tracking-widest">계정 설정 및 개인 정보를 관리합니다.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1 text-right">LAST LOGIN</span>
          <span className="text-xs text-zinc-400 font-mono">2026-04-29 15:43</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Profile Info Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-violet-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">개인 정보 수정</h3>
          </div>

          <form onSubmit={onUpdate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 shadow-inner">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ID</label>
                <p className="text-zinc-100 font-medium">{profile?.username}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Role</label>
                <p className="inline-flex px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[9px] font-bold border border-violet-500/20">
                  {profile?.role}
                </p>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</label>
                <p className="text-zinc-400 text-xs">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">이름</label>
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">닉네임</label>
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">연락처</label>
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none transition-all"
                  value={contact}
                  onChange={onContactChange}
                  maxLength={13}
                  placeholder="010-0000-0000"
                  required
                />
              </div>
            </div>

            {msg.text && (
              <div className={`px-4 py-3 rounded-xl border text-xs animate-in slide-in-from-top-1 ${msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                {msg.text}
              </div>
            )}

            <button
              disabled={saving}
              className="w-full bg-zinc-100 text-zinc-950 font-bold py-3.5 rounded-xl hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "저장 중..." : "변경 사항 저장"}
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">보안 설정</h3>
          </div>

          <form onSubmit={onPasswordChange} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">현재 비밀번호</label>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition-all"
                value={pwForm.oldPassword}
                onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">새 비밀번호</label>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition-all"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">새 비밀번호 확인</label>
              <input
                type="password"
                className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-all ${isPwMatching ? 'border-emerald-500/50 focus:border-emerald-500' :
                  isPwMismatch ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-blue-500'
                  }`}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
              {isPwMatching && <p className="text-[10px] text-emerald-400 ml-1 italic">비밀번호가 일치합니다.</p>}
              {isPwMismatch && <p className="text-[10px] text-red-400 ml-1 italic">비밀번호가 일치하지 않습니다.</p>}
            </div>

            {pwMsg.text && (
              <div className={`px-4 py-3 rounded-xl border text-xs animate-in slide-in-from-top-1 ${pwMsg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                {pwMsg.text}
              </div>
            )}

            <button
              disabled={pwSaving || (pwForm.newPassword && !isPwMatching)}
              className={`w-full font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 border ${isPwMatching ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-zinc-800 text-zinc-300 border-zinc-700/50'
                }`}
            >
              {pwSaving ? "처리 중..." : "비밀번호 변경"}
            </button>
          </form>

          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
            <h4 className="text-sm font-bold text-red-400">계정 삭제 경고</h4>
            <p className="text-xs text-zinc-500 mt-1">계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다.</p>
            <button 
              onClick={onWithdraw}
              className="mt-4 text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors"
            >
              회원 탈퇴하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
