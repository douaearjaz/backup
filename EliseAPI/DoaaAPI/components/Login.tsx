import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, Loader2, Heart } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-xl shadow-pink-200/50 mb-6 transform hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-pink-500 fill-pink-100" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 font-medium">Ready to create something magical?</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-2xl shadow-pink-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-500 text-sm font-medium">
              <AlertCircle className="w-5 h-5 mr-3" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-pink-100 rounded-2xl px-5 py-3.5 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm placeholder-gray-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-pink-100 rounded-2xl px-5 py-3.5 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm placeholder-gray-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Heart className="w-5 h-5 mr-2 fill-white" /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-500 hover:text-pink-600 font-bold hover:underline decoration-2 underline-offset-2">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;