import React, { useState } from 'react';
import { loginUser, registerUser } from './api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let token: string;
      if (isRegister) {
        token = await registerUser(email, password);
      } else {
        token = await loginUser(email, password);
      }
      localStorage.setItem('token', token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <div className="text-center mb-8">
          <span className="text-4xl">💧</span>
          <h2 className="text-2xl font-bold text-white mt-2">
            {isRegister ? 'Creare Cont Nou' : 'Acces Inventar Uleiuri'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isRegister
              ? 'Înregistrează-te pentru a-ți crea propriul inventar'
              : 'Introdu credențialele pentru a-ți gestiona stocul'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplu@email.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Parolă
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition duration-150 shadow-lg shadow-emerald-900/30"
          >
            {loading
              ? 'Se procesează...'
              : isRegister
              ? 'Înregistrează-te'
              : 'Autentificare'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            {isRegister
              ? 'Ai deja cont? Autentifică-te aici'
              : 'Nu ai cont? Creează unul acum'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;