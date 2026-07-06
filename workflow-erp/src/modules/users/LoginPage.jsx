import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/authStore';
import workflowLogo from '../../../logo/logo.svg';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');

    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
      return;
    }

    setLoginError(result.error || 'Authentication failed. Please verify your credentials.');
  };

  return (
    <>
      <style>{`
        :root {
          --bg-1: #07111f;
          --bg-2: #0d1b31;
          --primary: #2563eb;
          --primary-2: #06b6d4;
          --accent: #f6c85f;
          --text: #0f172a;
          --muted: #64748b;
          --line: #dbe6f3;
          --white: #ffffff;
        }

        .login-page-shell,
        .login-page-shell * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
        }

        .login-page-shell {
          min-height: 100vh;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(circle at 18% 18%, rgba(6, 182, 212, 0.28), transparent 26%),
            radial-gradient(circle at 84% 72%, rgba(37, 99, 235, 0.26), transparent 28%),
            linear-gradient(135deg, var(--bg-1), var(--bg-2));
          color: var(--text);
          overflow: hidden;
        }

        .page-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.7;
        }

        .login-shell {
          position: relative;
          z-index: 1;
          width: min(1120px, 100%);
          min-height: 640px;
          max-height: calc(100vh - 48px);
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) 430px;
          gap: 0;
          overflow: hidden;
          border-radius: 34px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 38px 110px rgba(0, 0, 0, 0.48);
          backdrop-filter: blur(22px);
        }

        .brand-panel {
          position: relative;
          padding: 46px;
          color: var(--white);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 36px;
          overflow: hidden;
          min-width: 0;
        }

        .brand-panel::before {
          content: "";
          position: absolute;
          width: 560px;
          height: 560px;
          right: -210px;
          top: -170px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.23), transparent 60%);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .brand-panel::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          left: -140px;
          bottom: -170px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(246,200,95,0.16), transparent 62%);
        }

        .brand-content,
        .system-preview {
          position: relative;
          z-index: 2;
        }

        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          margin-bottom: 64px;
        }

        .logo-box {
          width: 128px;
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 22px;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 18px 46px rgba(0,0,0,0.24);
        }

        .logo-box img {
          width: 98px;
          max-height: 58px;
          object-fit: contain;
          display: block;
        }

        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          white-space: nowrap;
          padding: 10px 14px;
          border-radius: 999px;
          color: #dbeafe;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 13px;
          font-weight: 700;
        }

        .secure-badge i {
          width: 8px;
          height: 8px;
          display: block;
          border-radius: 50%;
          background: var(--primary-2);
          box-shadow: 0 0 16px var(--primary-2);
        }

        .brand-content h1 {
          max-width: 560px;
          font-size: clamp(38px, 4.7vw, 58px);
          line-height: 1.05;
          letter-spacing: -1.8px;
          margin-bottom: 22px;
        }

        .brand-content h1 span {
          color: var(--accent);
        }

        .brand-content p {
          max-width: 450px;
          color: #b8c5d9;
          font-size: 16px;
          line-height: 1.7;
        }

        .system-preview {
          width: 100%;
          padding: 20px;
          border-radius: 26px;
          background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 22px 60px rgba(0,0,0,0.25);
          backdrop-filter: blur(16px);
        }

        .preview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .preview-head strong {
          color: #eaf2ff;
          font-size: 15px;
        }

        .preview-tag {
          flex: 0 0 auto;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(6,182,212,0.16);
          border: 1px solid rgba(6,182,212,0.28);
          color: #a5f3fc;
          font-size: 12px;
          font-weight: 800;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .mini-card {
          min-height: 96px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.11);
        }

        .mini-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          margin-bottom: 12px;
          background: rgba(37,99,235,0.22);
          color: #93c5fd;
        }

        .mini-card span {
          display: block;
          height: 8px;
          margin-top: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.22);
        }

        .mini-card span:nth-of-type(1) { width: 78%; }
        .mini-card span:nth-of-type(2) { width: 52%; }

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 46px 38px;
          min-width: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,246,253,0.98));
        }

        .login-card {
          width: 100%;
          max-width: 358px;
          padding: 38px 34px;
          border-radius: 30px;
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(226,232,240,0.95);
          box-shadow: 0 24px 60px rgba(15,23,42,0.12);
        }

        .card-logo {
          width: 118px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 0 28px;
          border-radius: 22px;
          background: #ffffff;
          border: 1px solid #e7edf6;
          box-shadow: 0 16px 32px rgba(15,23,42,0.08);
        }

        .card-logo img {
          width: 90px;
          max-height: 54px;
          object-fit: contain;
          display: block;
        }

        .login-card h2 {
          font-size: 32px;
          letter-spacing: -0.9px;
          color: var(--text);
          margin-bottom: 8px;
        }

        .login-card p {
          color: var(--muted);
          font-size: 15px;
          margin-bottom: 28px;
        }

        .input-group {
          position: relative;
          margin-bottom: 16px;
        }

        .input-group input {
          width: 100%;
          height: 58px;
          border: 1px solid var(--line);
          outline: none;
          border-radius: 16px;
          padding: 0 50px;
          background: #ffffff;
          color: #111827;
          font-size: 15px;
          box-shadow: 0 9px 22px rgba(15,23,42,0.035);
          transition: 0.22s ease;
        }

        .input-group input::placeholder { color: #94a3b8; }

        .input-group input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37,99,235,0.12), 0 12px 26px rgba(37,99,235,0.10);
        }

        .input-group svg {
          position: absolute;
          top: 50%;
          width: 21px;
          height: 21px;
          transform: translateY(-50%);
          color: #64748b;
        }

        .input-group .left { left: 18px; }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #64748b;
        }

        .password-toggle svg {
          position: static;
          transform: none;
          width: 21px;
          height: 21px;
        }

        .login-btn {
          width: 100%;
          height: 60px;
          margin-top: 10px;
          border: none;
          border-radius: 17px;
          cursor: pointer;
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          background: linear-gradient(135deg, #0f2b66, #2563eb 58%, #06b6d4);
          box-shadow: 0 18px 38px rgba(37,99,235,0.33);
          transition: 0.22s ease;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 24px 46px rgba(37,99,235,0.43);
        }

        .login-btn:disabled {
          cursor: wait;
          opacity: 0.85;
        }

        .error-note {
          margin: -10px 0 18px;
          color: #dc2626;
          font-size: 13px;
          line-height: 1.5;
        }

        .note {
          margin-top: 20px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }

        @media (max-width: 980px) {
          .login-page-shell {
            height: auto;
            overflow: visible;
            align-items: flex-start;
          }
          .login-shell {
            grid-template-columns: 1fr;
            min-height: auto;
            max-height: none;
          }
          .brand-panel {
            min-height: auto;
            padding: 40px;
          }
          .top-row { margin-bottom: 52px; }
          .form-panel { padding: 40px 26px 46px; }
        }

        @media (max-width: 620px) {
          .login-page-shell { padding: 14px; }
          .login-shell { border-radius: 26px; }
          .brand-panel { padding: 28px; gap: 28px; }
          .top-row {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 36px;
          }
          .secure-badge { white-space: normal; }
          .brand-content h1 { font-size: 34px; letter-spacing: -1px; }
          .brand-content p { font-size: 15px; }
          .form-panel { padding: 28px 18px 34px; }
          .login-card { padding: 30px 22px; border-radius: 24px; }
          .login-card h2 { font-size: 29px; }
        }

        @media (min-width: 981px) and (max-height: 820px) {
          .login-page-shell {
            padding: 16px;
          }

          .login-shell {
            min-height: auto;
            max-height: calc(100vh - 32px);
          }

          .brand-panel {
            padding: 32px;
            gap: 24px;
          }

          .top-row {
            margin-bottom: 32px;
          }

          .brand-content h1 {
            font-size: clamp(32px, 3.7vw, 48px);
            margin-bottom: 16px;
          }

          .brand-content p {
            font-size: 15px;
            line-height: 1.55;
          }

          .system-preview {
            padding: 16px;
          }

          .preview-head {
            margin-bottom: 14px;
          }

          .preview-grid {
            gap: 10px;
          }

          .mini-card {
            min-height: 82px;
            padding: 12px;
          }

          .mini-icon {
            margin-bottom: 10px;
          }

          .form-panel {
            padding: 30px 28px;
          }

          .login-card {
            padding: 30px 26px;
            max-width: 340px;
          }

          .card-logo {
            margin-bottom: 22px;
          }

          .login-card p {
            margin-bottom: 22px;
          }

          .input-group input {
            height: 54px;
          }

          .login-btn {
            height: 56px;
          }

          .note {
            margin-top: 16px;
          }
        }

        @media (min-width: 981px) and (max-height: 700px) {
          .brand-panel {
            padding: 26px;
            gap: 18px;
          }

          .top-row {
            margin-bottom: 22px;
          }

          .logo-box {
            width: 112px;
            height: 68px;
          }

          .logo-box img {
            width: 86px;
            max-height: 50px;
          }

          .secure-badge {
            padding: 8px 12px;
            font-size: 12px;
          }

          .brand-content h1 {
            font-size: clamp(28px, 3.1vw, 40px);
            margin-bottom: 12px;
          }

          .brand-content p {
            font-size: 14px;
            line-height: 1.45;
          }

          .system-preview {
            padding: 14px;
            border-radius: 22px;
          }

          .preview-head strong {
            font-size: 14px;
          }

          .preview-tag {
            padding: 6px 10px;
            font-size: 11px;
          }

          .mini-card {
            min-height: 72px;
            padding: 10px;
          }

          .mini-icon {
            width: 26px;
            height: 26px;
            margin-bottom: 8px;
          }

          .form-panel {
            padding: 24px;
          }

          .login-card {
            max-width: 324px;
            padding: 24px 22px;
            border-radius: 24px;
          }

          .card-logo {
            width: 104px;
            height: 64px;
            margin-bottom: 16px;
          }

          .card-logo img {
            width: 82px;
            max-height: 48px;
          }

          .login-card h2 {
            font-size: 28px;
          }

          .login-card p {
            font-size: 14px;
            margin-bottom: 18px;
          }

          .input-group {
            margin-bottom: 12px;
          }

          .input-group input {
            height: 50px;
            font-size: 14px;
          }

          .login-btn {
            height: 52px;
            margin-top: 6px;
          }

          .note {
            margin-top: 12px;
          }
        }
      `}</style>

      <div className="login-page-shell">
        <div className="page-bg" />

        <main className="login-shell">
          <section className="brand-panel">
            <div className="brand-content">
              <div className="top-row">
                <div className="logo-box">
                  <img src={workflowLogo} alt="Company Logo" />
                </div>
                <div className="secure-badge"><i /> Secure System Login</div>
              </div>

              <h1>Workflow &amp; <span>Document</span> Management System</h1>
              <p>Manage approvals, documents, and task progress through one secure digital workspace.</p>
            </div>

            <div className="system-preview">
              <div className="preview-head">
                <strong>System Modules</strong>
                <span className="preview-tag">Live Workflow</span>
              </div>

              <div className="preview-grid">
                <div className="mini-card">
                  <div className="mini-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8 6h13" />
                      <path d="M8 12h13" />
                      <path d="M8 18h13" />
                      <path d="M3 6h.01" />
                      <path d="M3 12h.01" />
                      <path d="M3 18h.01" />
                    </svg>
                  </div>
                  <span />
                  <span />
                </div>
                <div className="mini-card">
                  <div className="mini-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                  </div>
                  <span />
                  <span />
                </div>
                <div className="mini-card">
                  <div className="mini-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </section>

          <section className="form-panel">
            <div className="login-card">
              <div className="card-logo">
                <img src={workflowLogo} alt="Company Logo" />
              </div>

              <h2>Sign In</h2>
              <p>Enter your login details to continue.</p>

              {loginError && (
                <div className="error-note" role="alert">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <svg className="left" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>

                <div className="input-group">
                  <svg className="left" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                      {showPassword ? <path d="M4 20L20 4" /> : null}
                    </svg>
                  </button>
                </div>

                <button type="submit" className="login-btn" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Login'}
                </button>
              </form>

              <div className="note">Authorized users only</div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
