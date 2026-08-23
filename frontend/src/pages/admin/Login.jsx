import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back, Admin");
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-accent rounded-3xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-sm">
            <Lock size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">Admin Portal</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Dhangadi Store Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="admin@dhangaditopup.com.np"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-900 font-bold focus:border-accent focus:bg-white outline-none transition-all text-sm shadow-inner"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-11 text-slate-900 font-bold focus:border-accent focus:bg-white outline-none transition-all text-sm shadow-inner"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white font-black py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
