import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, CheckCircle, AlertTriangle, Code2, Download, Package, Heart, Zap, Loader2 } from 'lucide-react';
import { getFunctionById } from '../services/storageService';
import { executeApiFunction } from '../services/executionService';
import { downloadNodeProject } from '../services/downloadService';
import { ApiFunction, ExecutionResult } from '../types';

const TestFunction: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [func, setFunc] = useState<ApiFunction | undefined>();
  const [args, setArgs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadFunction = async () => {
        if (id) {
          const found = await getFunctionById(id);
          setFunc(found);
          if (found) {
            const initialArgs: Record<string, any> = {};
            found.parameters.forEach(p => {
               if (p.type === 'boolean') initialArgs[p.name] = false;
               else initialArgs[p.name] = '';
            });
            setArgs(initialArgs);
          }
        }
    };
    loadFunction();
  }, [id]);

  const handleArgChange = (name: string, value: any) => {
    setArgs(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    if (!func) return;
    setIsExecuting(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 600)); // Animation delay
    const execResult = await executeApiFunction(func, args);
    setResult(execResult);
    setIsExecuting(false);
  };

  const handleDownload = async () => {
    if (!func) return;
    setIsDownloading(true);
    await downloadNodeProject(func);
    setIsDownloading(false);
  };

  if (!func) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full lg:h-[calc(100vh-6rem)] animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 shrink-0 gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white">
             <div className="flex items-center space-x-4">
                <Link to="/" className="p-3 bg-white rounded-full hover:bg-pink-500 hover:text-white text-gray-400 transition-all shadow-sm border border-pink-100 hover:rotate-180 duration-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold shadow-md shadow-pink-200">POST</span> 
                        <span className="font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">/api/{func.name}</span>
                    </h1>
                </div>
            </div>
             <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="group flex items-center space-x-2 bg-white hover:bg-purple-500 hover:text-white text-gray-600 px-6 py-3 rounded-2xl text-sm font-bold transition-all border border-purple-100 shadow-sm hover:shadow-purple-300/50"
                >
                    {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Package className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span>Download Project</span>
                </button>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
            {/* Request Panel */}
            <div className="flex flex-col bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-pink-100/50 h-full max-h-[600px] lg:max-h-none transition-all hover:shadow-2xl hover:shadow-pink-200/50">
                <div className="bg-gradient-to-r from-pink-50/80 to-purple-50/80 px-8 py-5 border-b border-pink-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-pulse"></div>
                        Input Parameters
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-pink-100">
                    {func.parameters.length === 0 && (
                        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-pink-100 rounded-3xl bg-pink-50/20">
                            <Zap className="w-12 h-12 mx-auto mb-3 text-pink-200" />
                            <p className="font-medium">No input parameters required.</p>
                            <p className="text-xs mt-1 text-pink-300">Just cast the spell!</p>
                        </div>
                    )}
                    
                    {func.parameters.map(param => (
                        <div key={param.id} className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:border-pink-300 transition-colors">
                            <label className="flex items-center justify-between text-sm font-bold text-gray-600 mb-3 ml-1">
                                <span className="font-mono text-pink-600">{param.name}</span>
                                <span className="text-[10px] font-bold tracking-wider text-purple-500 uppercase bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                    {param.type}
                                </span>
                            </label>
                            
                            {param.type === 'boolean' ? (
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={() => handleArgChange(param.name, true)}
                                        className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${args[param.name] === true ? 'bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-200 scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        True
                                    </button>
                                    <button 
                                        onClick={() => handleArgChange(param.name, false)}
                                        className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${args[param.name] === false ? 'bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-200 scale-105' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        False
                                    </button>
                                </div>
                            ) : param.type === 'object' || param.type === 'array' ? (
                                <div className="relative">
                                    <textarea
                                        value={typeof args[param.name] === 'string' ? args[param.name] : JSON.stringify(args[param.name], null, 2)}
                                        onChange={(e) => handleArgChange(param.name, e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 font-mono text-sm focus:border-pink-400 focus:ring-4 focus:ring-pink-50 focus:outline-none transition-all placeholder:text-gray-300"
                                        placeholder={param.type === 'array' ? '[1, 2, 3]' : '{"key": "value"}'}
                                    />
                                    <Code2 className="absolute top-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            ) : (
                                <input 
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    value={args[param.name]}
                                    onChange={(e) => handleArgChange(param.name, param.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                    placeholder={`Enter ${param.type}...`}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-gray-700 font-mono text-sm focus:border-pink-400 focus:ring-4 focus:ring-pink-50 focus:outline-none transition-all placeholder:text-gray-300"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white/50 border-t border-pink-100">
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white rounded-[1.5rem] font-bold text-lg flex items-center justify-center transition-all shadow-xl shadow-pink-300/50 disabled:opacity-70 disabled:cursor-not-allowed group transform hover:-translate-y-1 active:scale-95 duration-500"
                    >
                        {isExecuting ? (
                             <span className="flex items-center">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></span>
                                Casting Spell...
                             </span>
                        ) : (
                            <>
                                <Play className="w-5 h-5 mr-2 fill-current group-hover:scale-125 transition-transform" />
                                Run Request
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Response Panel - Right Side */}
            <div className="flex flex-col bg-[#0f172a] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-900/20 h-full max-h-[600px] lg:max-h-none relative">
                 <div className="bg-gray-900/80 px-8 py-5 border-b border-gray-800 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                    <h3 className="font-bold text-gray-200 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${result ? (result.success ? 'bg-teal-400 text-teal-400' : 'bg-red-500 text-red-500') : 'bg-gray-600 text-gray-600'}`}></div>
                        Output
                    </h3>
                    {result && (
                        <div className="flex items-center space-x-3 text-xs font-mono font-bold animate-in fade-in slide-in-from-right-4">
                             <span className={`px-3 py-1 rounded-lg border flex items-center ${result.success ? 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {result.success ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                {result.success ? '200 OK' : '500 ERROR'}
                             </span>
                             <span className="text-gray-400 flex items-center bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
                                <Clock className="w-3 h-3 mr-1" />
                                {result.executionTime?.toFixed(0)}ms
                             </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {!result ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-6 min-h-[300px]">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500 blur-2xl opacity-10 rounded-full animate-pulse"></div>
                                <div className="w-24 h-24 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center relative z-10">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                                </div>
                            </div>
                            <p className="font-mono text-sm tracking-widest uppercase">System Ready</p>
                        </div>
                    ) : (
                        <div className="p-8 animate-in fade-in zoom-in-95 duration-300">
                            <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap break-all ${result.success ? 'text-teal-300' : 'text-red-300'}`}>
                                {typeof result.data === 'object' || typeof result.error === 'object' 
                                    ? JSON.stringify(result.success ? result.data : result.error, null, 2) 
                                    : String(result.success ? result.data : result.error)
                                }
                            </pre>
                        </div>
                    )}
                </div>
                
                 {/* Generated Code Toggle */}
                 <div className="border-t border-gray-800 bg-gray-900/80 mt-auto">
                    <details className="group">
                        <summary className="flex items-center cursor-pointer px-8 py-4 text-gray-500 text-xs font-mono hover:text-white transition-colors select-none font-bold uppercase tracking-wider">
                            <span className="mr-2 transform group-open:rotate-90 transition-transform text-pink-500">▶</span> 
                            View Source Code
                        </summary>
                        <div className="px-8 pb-8 pt-2 overflow-x-auto">
                            <div className="p-4 rounded-xl bg-black/50 border border-gray-800 shadow-inner">
                                <pre className="text-xs text-gray-500 font-mono leading-relaxed">{func.generatedCode}</pre>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TestFunction;