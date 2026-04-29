import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export default function SignupPage() {
  const api = useApi();
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    nickname: "",
    contact: "",
    email: "",
    storeCode: "",
    confirmPassword: "",
    certNumber: "",
  });
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [certSent, setCertSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const onChange = (e) => {
    let { name, value } = e.target;

    if (name === "contact") {
      const num = value.replace(/[^0-9]/g, "");
      if (num.length <= 3) {
        value = num;
      } else if (num.length <= 7) {
        value = num.slice(0, 3) + "-" + num.slice(3);
      } else {
        value = num.slice(0, 3) + "-" + num.slice(3, 7) + "-" + num.slice(7, 11);
      }
    }

    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (fieldErrors[name]) {
        setFieldErrors({ ...fieldErrors, [name]: "" });
    }

    // Real-time password match check
    if (name === "confirmPassword" || name === "password") {
        if (nextForm.confirmPassword && nextForm.password !== nextForm.confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
        } else if (name === "confirmPassword" && nextForm.password === nextForm.confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
        }
    }
  };

  const onSendCert = async () => {
    if (!form.email) {
      alert("이메일을 먼저 입력해 주세요.");
      return;
    }
    if (sendingEmail) return;
    setSendingEmail(true);
    try {
      await api.post("/api/v1/auth/cert/send", { email: form.email, purpose: "SIGNUP" });
      setCertSent(true);
      alert("인증 메일이 성공적으로 발송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "알 수 없는 오류";
      alert("코드 발송 실패: " + msg);
      setCertSent(true); 
    } finally {
      setSendingEmail(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setFieldErrors({});
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
      setLoading(false);
      return;
    }

    if (certSent && !form.certNumber) {
        setFieldErrors(prev => ({ ...prev, certNumber: "이메일 인증 코드를 입력해 주세요." }));
        setLoading(false);
        return;
    }

    try {
      const { confirmPassword, ...signupData } = form;
      signupData.contact = signupData.contact.replace(/-/g, "");

      await api.post("/api/v1/auth/signup", signupData);
      alert("회원가입이 완료되었습니다! 로그인해 주세요.");
      nav("/login");
    } catch (e2) {
      const resp = e2?.response?.data;
      const msg = resp?.message;

      if (msg?.includes("Username already exists")) {
        setErr("이미 사용 중인 아이디입니다.");
      } else if (msg?.includes("Email already exists")) {
        setErr("이미 등록된 이메일입니다.");
      } else if (msg?.includes("Invalid store code")) {
        setErr("유효하지 않은 매장 코드입니다. 본사에 문의해 주세요.");
      } else if (msg?.includes("Certification code does not match")) {
        setErr("인증번호가 일치하지 않습니다.");
      } else if (msg?.includes("Certification code expired")) {
        setErr("인증번호 만료되었습니다. 다시 요청해 주세요.");
      } else if (msg?.includes("Email certification required")) {
        setErr("이메일 인증이 필요합니다.");
      } else {
        setErr(msg || "회원가입 처리 중 오류가 발생했습니다.");
      }
      
      if (resp?.data && typeof resp.data === 'object') {
          setFieldErrors(prev => ({ ...prev, ...resp.data }));
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }) => {
    const msg = fieldErrors[name];
    if (!msg) return null;
    return <p className="mt-1 text-[10px] text-red-400 animate-in fade-in slide-in-from-top-1">{msg}</p>;
  };

  const inputClass = (name) => `mt-1.5 w-full rounded-lg border bg-zinc-950/50 px-3 py-2 text-zinc-100 transition-colors focus:outline-none ${
    fieldErrors[name] ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500'
  }`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col gap-8 px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            Join BrewFlow
          </h1>
          <p className="mt-3 text-sm text-zinc-400">Create an account to manage your store inventory with precision.</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Username</label>
              <input name="username" className={inputClass("username")} value={form.username} onChange={onChange} placeholder="brewuser" required />
              <ErrorMsg name="username" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
              <input type="password" name="password" className={inputClass("password")} value={form.password} onChange={onChange} required />
              <ErrorMsg name="password" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Confirm Password</label>
              <input type="password" name="confirmPassword" className={inputClass("confirmPassword")} value={form.confirmPassword} onChange={onChange} required />
              <ErrorMsg name="confirmPassword" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Real Name</label>
              <input name="name" className={inputClass("name")} value={form.name} onChange={onChange} placeholder="홍길동" required />
              <ErrorMsg name="name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Nickname</label>
              <input name="nickname" className={inputClass("nickname")} value={form.nickname} onChange={onChange} placeholder="브루마스터" required />
              <ErrorMsg name="nickname" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email</label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <input type="email" name="email" className={inputClass("email")} value={form.email} onChange={onChange} placeholder="user@example.com" required />
                </div>
                <button 
                  type="button" 
                  onClick={onSendCert} 
                  disabled={sendingEmail}
                  className="h-[42px] mt-[6px] whitespace-nowrap rounded-lg bg-zinc-800 px-4 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700/50"
                >
                  {sendingEmail ? "..." : certSent ? "Resend" : "Send"}
                </button>
              </div>
              <ErrorMsg name="email" />
            </div>
          </div>

          {certSent && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Certification Code</label>
              <input name="certNumber" className={inputClass("certNumber")} value={form.certNumber} onChange={onChange} placeholder="8-digit code" required />
              <ErrorMsg name="certNumber" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Contact</label>
              <input name="contact" className={inputClass("contact")} value={form.contact} onChange={onChange} placeholder="010-1234-5678" required />
              <ErrorMsg name="contact" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Store Code</label>
              <input name="storeCode" className={inputClass("storeCode")} value={form.storeCode} onChange={onChange} placeholder="ABC12345" required />
              <ErrorMsg name="storeCode" />
            </div>
          </div>

          {err ? <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20 animate-in shake-in">{err}</div> : null}

          <button disabled={loading} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-violet-600/20 transition-all hover:shadow-violet-600/40 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="font-bold text-violet-400 hover:text-violet-300 underline-offset-4 hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
