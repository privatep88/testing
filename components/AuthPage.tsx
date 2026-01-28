
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = "حدث خطأ غير معروف";
      if (err.code === 'auth/invalid-email') msg = "البريد الإلكتروني غير صالح";
      if (err.code === 'auth/user-not-found') msg = "المستخدم غير موجود";
      if (err.code === 'auth/wrong-password') msg = "كلمة المرور غير صحيحة";
      if (err.code === 'auth/email-already-in-use') msg = "البريد الإلكتروني مسجل بالفعل";
      if (err.code === 'auth/weak-password') msg = "كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)";
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#091526] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#eab308]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-blue-700 border border-blue-600 shadow-lg">
                    <span className="text-3xl font-bold text-white">S</span>
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#eab308]"></span>
                    </span>
               </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            <p className="text-gray-500 text-sm mt-2">نظام ساهر لإدارة الرخص والعقود</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left dir-ltr"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left dir-ltr"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#091526] hover:bg-[#112340] text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isLogin ? 'دخول' : 'تسجيل'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-blue-600 font-bold hover:underline"
              >
                {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-[#eab308] to-blue-600"></div>
      </div>
    </div>
  );
};

export default AuthPage;
