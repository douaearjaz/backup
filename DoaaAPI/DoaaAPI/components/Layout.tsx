import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Plus, List, ShieldCheck, Database, LogOut, User, FileText, Heart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-pink-600 bg-gradient-to-r from-pink-50 to-purple-50 border-r-4 border-pink-400 font-bold shadow-sm' 
      : 'text-gray-500 hover:text-pink-500 hover:bg-white/50 border-r-4 border-transparent hover:pl-6 transition-all duration-300';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#fff0f5] relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white/60 backdrop-blur-xl border-r border-white/50 flex-shrink-0 relative flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-all">
        <div className="p-8 flex items-center space-x-3 border-b border-pink-100/50">
          <div className="group relative bg-gradient-to-br from-pink-400 to-purple-400 p-2.5 rounded-2xl shadow-lg shadow-pink-300/50 hover:shadow-pink-400/70 transition-all duration-500 hover:rotate-12 hover:scale-110 cursor-pointer">
             <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
             <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 tracking-tight cursor-default select-none">Doaa API</span>
        </div>

        <nav className="p-6 space-y-3 mt-2 flex-1">
          <Link 
            to="/" 
            className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive('/')}`}
          >
            <List className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Endpoints</span>
            {location.pathname === '/' && <Star className="w-3 h-3 text-pink-400 ml-auto fill-current animate-spin-slow" />}
          </Link>
          
          <Link 
            to="/create" 
            className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive('/create')}`}
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">New Function</span>
            {location.pathname === '/create' && <Star className="w-3 h-3 text-pink-400 ml-auto fill-current animate-spin-slow" />}
          </Link>

          <Link 
            to="/query" 
            className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive('/query')}`}
          >
            <Database className="w-5 h-5 group-hover:bounce transition-transform" />
            <span className="font-medium">New Query</span>
            {location.pathname === '/query' && <Star className="w-3 h-3 text-pink-400 ml-auto fill-current animate-spin-slow" />}
          </Link>

          <div className="pt-6 mt-6 border-t border-pink-100/50">
            <Link 
                to="/report" 
                className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive('/report')}`}
            >
                <FileText className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                <span className="font-medium">Project Report</span>
            </Link>
          </div>
        </nav>

        <div className="p-6">
            {user && (
              <div className="mb-6 p-4 bg-white/80 backdrop-blur-md rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:shadow-pink-200/50 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm mr-3 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Hello,</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{user.name}</p>
                  </div>
                </div>
                <button onClick={logout} className="text-gray-400 hover:text-pink-500 transition-colors bg-gray-50 p-2 rounded-full hover:bg-pink-50">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-pink-50/80 to-purple-50/80 p-5 rounded-3xl border border-pink-100/50 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-pink-500 mb-2">
                    <ShieldCheck className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Safe Mode</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Client-side sandbox. Your data stays safe and sound! <Heart className="w-3 h-3 inline text-pink-400 ml-1 fill-current hover:scale-125 transition-transform cursor-crosshair" />
                </p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-10 relative z-10 scroll-smooth">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;