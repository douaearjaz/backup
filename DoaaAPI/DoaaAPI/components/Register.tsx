import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles, AlertCircle, Loader2, Star } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
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
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-xl shadow-purple-200/50 mb-6 transform hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-purple-500 fill-purple-100" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">Join Doaa API</h1>
            <p className="text-gray-500 font-medium">Let's build something cute together!</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-2xl shadow-purple-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-500 text-sm font-medium">
              <AlertCircle className="w-5 h-5 mr-3" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-purple-100 rounded-2xl px-5 py-3.5 text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-sm placeholder-gray-300"
                placeholder="Princess Peach"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-purple-100 rounded-2xl px-5 py-3.5 text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-sm placeholder-gray-300"
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
                className="w-full bg-white border border-purple-100 rounded-2xl px-5 py-3.5 text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-sm placeholder-gray-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Star className="w-5 h-5 mr-2 fill-white" /> Create Account</>}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 hover:text-purple-600 font-bold hover:underline decoration-2 underline-offset-2">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;