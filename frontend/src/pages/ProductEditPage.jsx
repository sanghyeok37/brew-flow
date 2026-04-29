import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/authAtoms";
import { useApi } from "../hooks/useApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ProductEditPage() {
  const { productId } = useParams();
  const api = useApi();
  const nav = useNavigate();
  const user = useAtomValue(userAtom);
  
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  
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
    async function init() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/api/v1/products/categories"),
          api.get(`/api/v1/products/${productId}`) // Backend needs to provide this or we use findById in mapper
        ]);
        
        setCategories(catRes.data.data);
        
        const p = prodRes.data.data;
        setName(p.name);
        setCategoryId(p.categoryId);
        setUnit(p.unit);
        setUnitCost(p.unitCost);
        if (p.imageUrl) {
          setPreview(`${API_BASE}/${p.imageUrl}`);
        }
      } catch (e) {
        setErr("상품 정보를 불러오지 못했습니다.");
      }
    }
    init();
  }, [api, productId]);

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
      // Backend needs a PUT endpoint for this or POST with override
      await api.put(`/api/v1/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("상품 정보가 수정되었습니다!");
      nav("/admin/products");
    } catch (e2) {
      const resp = e2?.response?.data;
      setErr(resp?.message || "수정에 실패했습니다.");
      if (resp?.data && typeof resp.data === 'object') {
        setFieldErrors(resp.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/v1/products/${productId}`);
      alert("상품이 삭제되었습니다.");
      nav("/admin/products");
    } catch (e) {
      setErr("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }) => {
    const msg = fieldErrors[name];
    if (!msg) return null;
    return <p className="mt-1 text-[10px] text-red-400">{msg}</p>;
  };

  const inputClass = (name) => `w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors ${
    fieldErrors[name] ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500'
  }`;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in duration-500">
      <div className="border-b border-zinc-800 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">상품 관리</h2>
          <p className="text-zinc-500 text-sm mt-2">상품 마스터 정보를 업데이트하거나 삭제합니다.</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors"
        >
          상품 삭제
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">상품명 (PRODUCT NAME)</label>
            <input
              className={inputClass("name")}
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              required
            />
            <ErrorMsg name="name" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">카테고리 (CATEGORY)</label>
            <select
              className={`${inputClass("categoryId")} appearance-none`}
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); clearFieldError("categoryId"); }}
              required
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
            <ErrorMsg name="categoryId" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1">규격/단위 (UNIT)</label>
              <input
                className={inputClass("unit")}
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

        <div className="lg:col-span-5 flex flex-col">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-2">상품 이미지 (PRODUCT IMAGE)</label>
          <div className={`relative flex-1 min-h-[300px] group flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-4 bg-zinc-900/30 transition-all duration-300 ${fieldErrors.image ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900/50'}`}>
            {preview ? (
              <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onImageChange} />
                  <span className="bg-white text-black px-4 py-2 rounded-xl font-bold text-sm">이미지 변경</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-8">
                <svg className="w-10 h-10 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onImageChange} />
                <h3 className="text-sm font-bold text-zinc-300">이미지 업로드</h3>
              </div>
            )}
          </div>
          <ErrorMsg name="image" />
          
          <div className="mt-auto pt-10">
            {err && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">{err}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black py-4.5 rounded-2xl shadow-2xl shadow-violet-600/30 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? "저장 중..." : "수정 내용 저장"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
