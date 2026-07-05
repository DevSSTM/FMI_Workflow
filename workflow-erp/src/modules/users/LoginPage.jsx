import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Layers, 
  Cpu, 
  ArrowRight, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../app/store/authStore';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (data) => {
    setLoginError('');
    const result = await login(data.username, data.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setLoginError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleDemoLogin = (username, password) => {
    setValue('username', username);
    setValue('password', password);
  };

  const demoAccounts = [
    { role: 'Tharindu', username: 'tharindu', password: 'tharindu123', color: 'text-navy-600', bg: 'bg-navy-50' },
    { role: 'Panchali', username: 'panchali', password: 'panchali123', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { role: 'Nirmal', username: 'nirmal', password: 'nirmal123', color: 'text-teal-600', bg: 'bg-teal-50' },
    { role: 'Sewmi.Hiruni', username: 'sewmi.hiruni', password: 'sewmi123', color: 'text-rose-600', bg: 'bg-rose-50' },
    { role: 'Isma', username: 'isma', password: 'isma123', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* ── Left Section: Brand & Visuals ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy-900 relative overflow-hidden flex-col justify-between p-16">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-navy-800/50 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/40 rounded-full blur-[100px]" />
          
          {/* Workflow Mesh Grid */}
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ 
                 backgroundImage: `linear-gradient(#334e68 1px, transparent 1px), linear-gradient(90deg, #334e68 1px, transparent 1px)`, 
                 backgroundSize: '60px 60px' 
               }} />
        </div>

        {/* Top: Branding */}
        <div className={`relative z-10 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center shadow-2xl">
              <Layers size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-none">Workflow<span className="text-teal-400">Hub</span></h2>
              <p className="text-navy-300 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Management System</p>
            </div>
          </div>
        </div>

        {/* Middle: Minimalist Brand Message */}
        <div className={`relative z-10 transition-all duration-1000 delay-300 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
          <h1 className="text-5xl xl:text-7xl font-extrabold text-white leading-tight opacity-20 select-none">
            Digital <br />
            Workflow.
          </h1>
        </div>

      </div>

      {/* ── Right Section: Login Interface ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-20 relative bg-slate-50">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <Layers size={24} className="text-navy-900" />
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Workflow Hub</h2>
        </div>

        <div className={`w-full max-w-[480px] transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          
          <div className="mb-6">
            <h2 className="text-4xl font-extrabold text-navy-900 tracking-tight mb-3">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please sign in to access your document dashboard.</p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <p className="text-sm text-red-700 font-semibold">{loginError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username or Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-navy-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-navy-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-navy-100 focus:border-navy-500 transition-all font-medium shadow-sm"
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
              {errors.username && (
                <p className="text-[11px] text-red-600 font-bold ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Password</label>
                <button type="button" className="text-xs font-bold text-navy-600 hover:text-navy-800">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-navy-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-navy-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-navy-100 focus:border-navy-500 transition-all font-medium shadow-sm"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-600 font-bold ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 ml-1">
               <input 
                 type="checkbox" 
                 id="remember" 
                 className="w-5 h-5 rounded-lg border-slate-300 text-navy-600 focus:ring-navy-500 transition-all cursor-pointer" 
               />
               <label htmlFor="remember" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">Remember this session</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-2xl shadow-xl shadow-navy-200 hover:shadow-navy-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-bold">Verifying...</span>
                </div>
              ) : (
                <>
                  <span className="text-sm font-bold uppercase tracking-widest">Sign In to Dashboard</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Section */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">User Accounts</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDemoLogin(acc.username, acc.password)}
                  className={`flex flex-col items-center justify-center p-4 ${acc.bg} rounded-2xl hover:scale-[1.05] transition-all border border-transparent hover:border-slate-200 active:scale-95 group`}
                >
                  <div className={`p-2 rounded-xl bg-white shadow-sm mb-2 group-hover:shadow-md transition-shadow`}>
                    <User size={18} className={acc.color} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 uppercase">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Support Footer */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-slate-400 hover:text-navy-600 transition-colors cursor-pointer">
              <Clock size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-2 text-slate-400 hover:text-navy-600 transition-colors cursor-pointer">
              <Cpu size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">v2.4.0-Stable</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        
        ::selection {
          background: #334e68;
          color: white;
        }

        @media (max-width: 1024px) {
          .py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
