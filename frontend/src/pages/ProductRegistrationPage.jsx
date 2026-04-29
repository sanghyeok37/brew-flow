import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";

export default function ProductRegistrationPage() {
  const api = useApi();
  const nav = useNavigate();
  const user = useAtomValue(userAtom);

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const clearFieldError = (name) => {
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  useEffect(() => {
    if (user && user.role !== "HQ" && user.role !== "SYSTEM") {
      nav("/inventory", { replace: true });
      return;
    }
  }, [user, nav]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/api/v1/products/categories");
        setCategories(res.data.data);
        if (res.data.data.length > 0) setCategoryId(res.data.data[0].categoryId);
      } catch (e) {
        setErr("카테고리 정보를 불러오지 못했습니다.");
      }
    }
    fetchCategories();
  }, [api]);

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      clearFieldError("image");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setFieldErrors({});

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    formData.append("unit", unit);
    formData.append("unitCost", unitCost);
    if (image) {
      formData.append("image", image);
    }

    try {
      await api.post("/api/v1/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("상품이 성공적으로 등록되었습니다!");
      nav("/admin/products");
    } catch (e2) {
      const resp = e2?.response?.data;
      setErr(resp?.message || "상품 등록에 실패했습니다.");
      if (resp?.data && typeof resp.data === 'object') {
        setFieldErrors(resp.data);
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

  const inputClass = (name) => `w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors ${fieldErrors[name] ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500'
    }`;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="border-b border-zinc-800 pb-6">
        <h2 className="text-3xl font-black tracking-tight text-white">신규 상품 등록</h2>
        <p className="text-zinc-500 text-sm mt-2">시스템 마스터 DB에 새로운 원부자재 또는 상품을 추가합니다.</p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">상품명 (PRODUCT NAME)</label>
            <input
              className={inputClass("name")}
              placeholder="예: 에티오피아 구지 원두"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              required
            />
            <ErrorMsg name="name" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">카테고리 (CATEGORY)</label>
            <div className="relative">
              <select
                className={`${inputClass("categoryId")} appearance-none`}
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); clearFieldError("categoryId"); }}
                required
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <ErrorMsg name="categoryId" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">규격/단위 (UNIT)</label>
              <input
                className={inputClass("unit")}
                placeholder="예: 500g, 1L"
                value={unit}
                onChange={(e) => { setUnit(e.target.value); clearFieldError("unit"); }}
                required
              />
              <ErrorMsg name="unit" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">공급 단가 (UNIT COST)</label>
              <div className="relative">
                <input
                  type="number"
                  className={`${inputClass("unitCost")} pr-10`}
                  placeholder="0"
                  value={unitCost}
                  onChange={(e) => { setUnitCost(e.target.value); clearFieldError("unitCost"); }}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-xs">₩</span>
              </div>
              <ErrorMsg name="unitCost" />
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload */}
        <div className="lg:col-span-5 flex flex-col">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-2">상품 이미지 (PRODUCT IMAGE)</label>
          <div className={`relative flex-1 min-h-[300px] group flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-4 bg-zinc-900/30 transition-all duration-300 ${fieldErrors.image ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900/50'}`}>
            {preview ? (
              <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button"
                    onClick={() => { setPreview(null); setImage(null); }}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all"
                  >
                    이미지 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-8">
                <div className={`mb-4 p-5 bg-zinc-950 rounded-2xl shadow-xl border border-zinc-800 transition-all group-hover:scale-110 ${fieldErrors.image ? 'text-red-400 border-red-500/20' : 'text-zinc-500 group-hover:text-violet-400 group-hover:border-violet-500/20'}`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-sm font-bold text-zinc-300">이미지 업로드</h3>
                <p className="mt-2 text-xs text-zinc-500 max-w-[180px] leading-relaxed">클릭하거나 파일을 이 영역으로 드래그하세요.</p>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={onImageChange}
                />
              </div>
            )}
          </div>
          <ErrorMsg name="image" />
          
          <div className="mt-auto pt-10">
            {err && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 animate-in fade-in zoom-in-95">{err}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black py-4.5 rounded-2xl shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>등록 중...</span>
                </div>
              ) : "상품 등록 완료"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
