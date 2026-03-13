import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiFunction } from '../types';
import { getFunctions, deleteFunction } from '../services/storageService';
import { Trash2, Play, Calendar, Loader2, Heart, Wand2, ArrowRight } from 'lucide-react';

const FunctionList: React.FC = () => {
  const [functions, setFunctions] = useState<ApiFunction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFunctions = async () => {
    setLoading(true);
    const data = await getFunctions();
    setFunctions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFunctions();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this endpoint?")) {
      await deleteFunction(id);
      fetchFunctions();
    }
  };

  if (loading) {
      return (
          <div className="flex flex-col justify-center items-center py-32 space-y-4">
              <div className="relative">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-300 fill-pink-100 animate-pulse" />
                  </div>
              </div>
              <p className="text-pink-400 font-bold tracking-widest animate-pulse">SUMMONING...</p>
          </div>
      );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 mb-2 tracking-tight">My Endpoints</h1>
            <p className="text-gray-500 font-medium text-lg">Your collection of digital spells.</p>
        </div>
        <Link 
            to="/create" 
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white rounded-2xl font-bold shadow-lg shadow-pink-200/50 hover:shadow-pink-400/50 transition-all duration-500 transform hover:-translate-y-1"
        >
             <span className="flex items-center relative z-10">
                <Wand2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Create New Endpoint
             </span>
        </Link>
      </div>

      {functions.length === 0 ? (
        <div className="text-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-pink-200 rounded-[2rem] hover:border-pink-300 transition-colors group cursor-pointer" onClick={() => window.location.href='#/create'}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-xl shadow-pink-100 mb-8 group-hover:scale-110 transition-transform duration-500 animate-float">
            <Heart className="w-10 h-10 text-pink-400 fill-pink-100 group-hover:text-pink-500 transition-colors" />
          </div>
          <h3 className="text-3xl font-bold text-gray-700 mb-3">No magic yet?</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            The grimoire is empty. Describe your logic in plain English and let the AI weave the spell for you.
          </p>
          <span className="inline-flex items-center text-pink-500 font-bold hover:underline decoration-2 underline-offset-4 group-hover:translate-x-1 transition-transform">
            Start Creating <ArrowRight className="w-4 h-4 ml-2" />
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
          {functions.map((func, index) => (
            <div 
                key={func.id} 
                className="group relative bg-white/70 backdrop-blur-md border border-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-pink-200/40 transition-all duration-500 hover:-translate-y-2 hover:rotate-1"
                style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative gradient blob inside card */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"></div>

              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                        <span className="self-start px-3 py-1 text-[10px] font-bold bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 rounded-full uppercase tracking-widest mb-2 border border-pink-200/50">POST REQUEST</span>
                        <h3 className="text-2xl font-bold text-gray-800 font-mono tracking-tight group-hover:text-pink-600 transition-colors">/api/{func.name}</h3>
                    </div>
                    <button 
                        onClick={(e) => handleDelete(func.id, e)}
                        className="text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2.5 bg-white shadow-sm rounded-full hover:shadow-md hover:bg-red-50 transform hover:scale-110"
                        title="Delete function"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="text-gray-500 text-sm mb-8 line-clamp-2 h-10 leading-relaxed font-medium group-hover:text-gray-600 transition-colors">
                  {func.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8 min-h-[2rem]">
                  {func.parameters.slice(0, 3).map(p => (
                    <span key={p.id} className="px-3 py-1.5 text-xs bg-white border border-purple-100 text-purple-600 rounded-xl font-bold shadow-sm">
                      {p.name}
                    </span>
                  ))}
                  {func.parameters.length > 3 && (
                      <span className="px-3 py-1.5 text-xs bg-gray-50 text-gray-400 rounded-xl font-bold">+{func.parameters.length - 3}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100/50 group-hover:border-pink-100/50 transition-colors">
                    <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <Calendar className="w-3 h-3 mr-2 text-pink-300" />
                        {new Date(func.createdAt).toLocaleDateString()}
                    </div>
                    
                    <Link 
                        to={`/test/${func.id}`}
                        className="flex items-center text-sm font-bold text-white bg-gray-900 px-5 py-2.5 rounded-xl shadow-lg hover:bg-pink-500 hover:shadow-pink-300/50 transition-all duration-300 transform group-hover:scale-105"
                    >
                        <Play className="w-3 h-3 mr-2 fill-current" />
                        Test Endpoint
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunctionList;