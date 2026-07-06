import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Headset,
  Settings,
  FileText,
  CheckCircle,
  UserCheck,
  Lock as LockIcon,
} from 'lucide-react';
import { useAuthStore } from '../../app/store/authStore';
import workflowLogo from '../../../logo/logo.png';
import buildingBg from '../../assets/building_bg_bright.png';

const WorkflowDiagram = () => (
  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px]">
    <line x1="160" y1="40" x2="90" y2="110" stroke="#4a7fa5" strokeWidth="1.2" strokeDasharray="4 4" />
    <line x1="160" y1="40" x2="230" y2="110" stroke="#4a7fa5" strokeWidth="1.2" strokeDasharray="4 4" />
    <line x1="90" y1="130" x2="160" y2="170" stroke="#4a7fa5" strokeWidth="1.2" strokeDasharray="4 4" />
    <line x1="230" y1="130" x2="160" y2="170" stroke="#4a7fa5" strokeWidth="1.2" strokeDasharray="4 4" />
    <line x1="160" y1="190" x2="160" y2="230" stroke="#4a7fa5" strokeWidth="1.2" strokeDasharray="4 4" />

    <ellipse cx="160" cy="200" rx="52" ry="10" fill="#1e5fa3" opacity="0.35" />
    <ellipse cx="160" cy="203" rx="38" ry="6" fill="#2b79cc" opacity="0.25" />

    <rect x="130" y="120" width="60" height="74" rx="6" fill="#1a4e8a" stroke="#3a8fd8" strokeWidth="1.5" />
    <rect x="130" y="120" width="60" height="74" rx="6" fill="url(#docGrad)" />
    <line x1="142" y1="144" x2="178" y2="144" stroke="#7ab8f0" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="142" y1="154" x2="178" y2="154" stroke="#7ab8f0" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="142" y1="164" x2="165" y2="164" stroke="#7ab8f0" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M174 120 L190 136 L174 136 Z" fill="#2563a8" />

    <circle cx="160" cy="28" r="22" fill="#0f3460" stroke="#2d6ca2" strokeWidth="1.5" />
    <circle cx="160" cy="23" r="7" fill="#5a9fd4" />
    <path d="M145 38 Q160 30 175 38" stroke="#5a9fd4" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    <circle cx="72" cy="118" r="22" fill="#0f3460" stroke="#2d6ca2" strokeWidth="1.5" />
    <rect x="60" y="111" width="24" height="16" rx="2" fill="#5a9fd4" />
    <rect x="58" y="114" width="28" height="14" rx="2" fill="#7ab8f0" />

    <circle cx="248" cy="118" r="22" fill="#0f3460" stroke="#2d6ca2" strokeWidth="1.5" />
    <path d="M238 118 L245 125 L260 110" stroke="#5a9fd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    <circle cx="160" cy="238" r="18" fill="#0f3460" stroke="#2d6ca2" strokeWidth="1.5" />
    <path d="M160 228 L153 231 L153 237 Q153 243 160 246 Q167 243 167 237 L167 231 Z" fill="#5a9fd4" />

    <defs>
      <linearGradient id="docGrad" x1="130" y1="120" x2="190" y2="194" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1e5fa3" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#0d2d55" stopOpacity="0.9" />
      </linearGradient>
    </defs>
  </svg>
);

const WaveLines = () => (
  <svg
    viewBox="0 0 600 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute bottom-0 left-0 w-full"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="wv1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a4e8a" stopOpacity="0" />
        <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#1a4e8a" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wv2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a4e8a" stopOpacity="0" />
        <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#1a4e8a" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wv3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a4e8a" stopOpacity="0" />
        <stop offset="60%" stopColor="#93c5fd" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1a4e8a" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M-20,90  C120,20  300,140 620,50" stroke="url(#wv1)" strokeWidth="2" className="wave-path-1" />
    <path d="M-20,108 C100,40  280,130 620,70" stroke="url(#wv2)" strokeWidth="1.5" className="wave-path-2" />
    <path d="M-20,124 C 80,60  260,120 620,90" stroke="url(#wv3)" strokeWidth="1" className="wave-path-3" />
  </svg>
);

const CurveDivider = () => (
  <div className="absolute right-0 top-0 h-full w-[80px] z-20 pointer-events-none">
    <svg viewBox="0 0 80 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
      <path d="M0 0 Q80 450 0 900 L80 900 L80 0 Z" fill="#eef3f9" />
    </svg>
  </div>
);

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async (data) => {
    setLoginError('');
    const result = await login(data.username, data.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setLoginError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const features = [
    { Icon: Settings, title: 'Workflow\nAutomation', desc: 'Automate and\naccelerate processes' },
    { Icon: FileText, title: 'Document\nControl', desc: 'Centralize, manage,\nand secure documents' },
    { Icon: CheckCircle, title: 'Approval\nTracking', desc: 'Gain real-time visibility\nand maintain accountability' },
    { Icon: UserCheck, title: 'Role-Based\nAccess', desc: 'Secure access\nbased on user roles' },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans select-none">
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: '48%', background: 'linear-gradient(160deg,#0f2d55 0%,#0a1e3d 55%,#071428 100%)' }}
      >
        <div
          className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }}
        />

        <div className={`relative z-10 px-12 pt-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
          <p className="text-[10.5px] font-semibold tracking-[0.22em] text-blue-300/80 uppercase mb-6">
            Workflow &amp; Document Management System
          </p>
          <h1 className="text-[2.6rem] font-extrabold leading-tight text-white">
            Smarter Workflows.<br />Stronger Control.
          </h1>
          <div className="mt-4 w-10 h-[3px] rounded-full bg-blue-500" />
          <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-[300px]">
            Streamline processes, ensure compliance, and drive operational excellence across your organization.
          </p>
        </div>

        <div className={`relative z-10 flex justify-center items-center px-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <WorkflowDiagram />
        </div>

        <div className={`relative z-10 px-8 pb-6 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="grid grid-cols-4 gap-3">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <Icon size={18} />
                </div>
                <p className="text-white text-[11px] font-bold leading-tight whitespace-pre-line">{title}</p>
                <p className="text-slate-400 text-[9.5px] leading-tight whitespace-pre-line">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-slate-500">
            <LockIcon size={12} />
            <span className="text-[10px] font-medium tracking-wide">
              Trusted by facilities teams to deliver efficiency, compliance, and growth.
            </span>
          </div>
        </div>

        <WaveLines />
        <CurveDivider />
      </div>

      <div
        className="flex-1 relative flex items-center justify-center p-6 lg:p-10 overflow-hidden"
        style={{
          backgroundImage: `url(${buildingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-white/30" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(180,210,240,0.45) 0%,rgba(240,248,255,0.30) 100%)' }} />

        <div
          className={`relative z-10 w-full max-w-[420px] bg-white rounded-[20px] shadow-2xl flex flex-col transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ boxShadow: '0 20px 60px rgba(10,30,70,0.18), 0 4px 16px rgba(10,30,70,0.10)' }}
        >
          <div className="px-9 pt-9 pb-7 flex flex-col gap-0">
            <div className="flex justify-center mb-1">
              <img src={workflowLogo} alt="FMI - Facilities Management Integrated" className="h-[70px] w-auto object-contain" />
            </div>

            <div className="w-16 h-[2px] bg-blue-600/30 rounded-full mx-auto mt-3 mb-5" />

            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold text-[#0d1f3c] tracking-tight">Welcome Back</h2>
              <p className="mt-1.5 text-[12.5px] text-slate-500 leading-snug">
                Sign in to access the Workflow and<br />Document Management System
              </p>
            </div>

            {loginError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 animate-shake">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-700 font-semibold leading-snug">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-[11px] font-semibold text-slate-500 tracking-wide">
                  Email / Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your email or username"
                    className="w-full pl-10 pr-4 py-[10px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    {...register('username', { required: 'Username is required' })}
                  />
                </div>
                {errors.username && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={11} />{errors.username.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[11px] font-semibold text-slate-500 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-[10px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={11} />{errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
                  />
                  <span className="text-[12px] text-slate-500 font-medium select-none">Remember me</span>
                </label>
                <button
                  type="button"
                  id="forgot-password"
                  className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                id="submit-login"
                disabled={isLoading}
                className="mt-1 w-full py-[11px] rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg"
                style={{ background: 'linear-gradient(90deg,#1a3fa3 0%,#1e4fc9 100%)' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">Sign In</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              type="button"
              id="contact-admin"
              className="w-full py-2.5 flex items-center justify-center gap-2 text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Headset size={15} />
              Contact Administrator
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-slate-400">
              <ShieldCheck size={13} />
              <span className="text-[11px] font-medium">Secure enterprise access</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.35s ease-in-out; }

        @keyframes waveFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .wave-path-1 { animation: waveFloat 11s ease-in-out infinite; }
        .wave-path-2 { animation: waveFloat 8s ease-in-out infinite 1s; }
        .wave-path-3 { animation: waveFloat 6s ease-in-out infinite 0.5s; }

        ::selection { background: #1a3fa3; color: #fff; }
      `}</style>
    </div>
  );
};

export default LoginPage;
