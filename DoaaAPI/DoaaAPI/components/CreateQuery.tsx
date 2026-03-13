import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Save, Wand2, Loader2, Play, Terminal, CheckCircle, AlertTriangle, Plus, X, Edit3, Heart } from 'lucide-react';
import { ApiFunction, ApiParameter } from '../types';
import { generateDatabaseFunctionCode } from '../services/geminiService';
import { saveFunction } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

const CreateQuery: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // DB Config
  const [dbType, setDbType] = useState('mysql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [dbUser, setDbUser] = useState('root');
  const [dbPass, setDbPass] = useState('');
  const [dbName, setDbName] = useState('');
  
  // Schema & Prompt
  const [schema, setSchema] = useState('');
  const [queryPrompt, setQueryPrompt] = useState('');
  const [endpointName, setEndpointName] = useState('');
  const [params, setParams] = useState<ApiParameter[]>([]);
  
  // Generated Result
  const [generatedCode, setGeneratedCode] = useState('');

  // Parameter Management
  const addParameter = () => {
    const newParam: ApiParameter = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      required: true,
      description: ''
    };
    setParams([...params, newParam]);
  };

  const updateParameter = (id: string, field: keyof ApiParameter, value: any) => {
    setParams(params.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeParameter = (id: string) => {
    setParams(params.filter(p => p.id !== id));
  };

  const handleConnect = async () => {
    if (!dbName || !host || !dbUser) {
        setConnectionError("Please fill in all required fields (Host, Database, User).");
        return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);

    const connectionConfig = { type: dbType, host, port: parseInt(port), user: dbUser, password: dbPass, database: dbName };

    try {
        // 1. Test Connection
        const testRes = await fetch('/api/db/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(connectionConfig)
        });

        const testData = await testRes.json();

        if (!testData.success) {
            throw new Error(testData.error || "Connection failed");
        }

        // 2. Extract Schema
        const schemaRes = await fetch('/api/db/schema', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(connectionConfig)
        });

        const schemaData = await schemaRes.json();
        
        if (!schemaData.success) {
            throw new Error(schemaData.error || "Failed to extract schema");
        }

        setSchema(schemaData.schema);
        setStep(2);

    } catch (e: any) {
        setConnectionError(e.message || "Failed to connect to database");
    } finally {
        setIsConnecting(false);
    }
  };

  const handleGenerate = async () => {
    if (!queryPrompt || !endpointName) return;
    setIsGenerating(true);
    
    const dbConfig = { host, port, user: dbUser, password: dbPass, database: dbName };

    try {
        const result = await generateDatabaseFunctionCode(dbType, dbConfig, schema, queryPrompt, params);
        setGeneratedCode(result.code);
        
        // Merge user defined params with AI detected params
        const mergedParams = [...result.detectedParams];
        const finalParams = mergedParams.map(p => ({
            ...p,
            id: p.id || Date.now().toString() + Math.random().toString(36).substring(7)
        }));

        setParams(finalParams);
        setStep(3);
    } catch (e) {
        console.error(e);
        alert("Generation failed");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newFunction: ApiFunction = {
        id: Date.now().toString(),
        name: endpointName.replace(/\s+/g, '_').toLowerCase(),
        description: `SQL Query: ${queryPrompt} (${dbType})`,
        parameters: params, 
        outputType: 'array',
        generatedCode: generatedCode,
        createdAt: Date.now()
    };
    try {
        await saveFunction(newFunction);
        navigate('/');
    } catch (e) {
        console.error("Save failed", e);
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 flex items-center justify-center md:justify-start">
                <Database className="w-8 h-8 mr-3 text-pink-500" />
                New Database Query
            </h1>
            <p className="text-gray-500 font-medium">Connect to your data treasure chest.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 relative px-10">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-pink-100 -z-10 rounded-full"></div>
            
            {[1, 2, 3].map((s) => (
                <div key={s} className={`flex flex-col items-center bg-transparent px-4 ${step >= s ? 'text-pink-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300 ${step >= s ? 'bg-white border-pink-400 text-pink-500 shadow-lg scale-110' : 'bg-white border-gray-200 text-gray-400'}`}>
                        {s}
                    </div>
                    <span className="text-xs font-bold mt-2 uppercase tracking-wider bg-white px-2 rounded-full">
                        {s === 1 ? 'Connect' : s === 2 ? 'Describe' : 'Preview'}
                    </span>
                </div>
            ))}
        </div>

        {/* STEP 1: CONNECTION */}
        {step === 1 && (
            <div className="bg-white border border-pink-50 p-8 rounded-3xl shadow-xl shadow-pink-100/50 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold text-gray-700 mb-6">Database Connection</h2>
                
                {connectionError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-500 text-sm font-bold">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {connectionError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">Database Type</label>
                        <select 
                            value={dbType} onChange={(e) => { setDbType(e.target.value); setPort(e.target.value === 'postgres' ? '5432' : '3306'); }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all appearance-none"
                        >
                            <option value="mysql">MySQL</option>
                            <option value="postgres">PostgreSQL</option>
                            <option value="sqlite">SQLite (File)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">Database Name</label>
                        <input 
                            type="text" value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="e.g. shop_db"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">Host</label>
                        <input 
                            type="text" value={host} onChange={(e) => setHost(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">Port</label>
                        <input 
                            type="text" value={port} onChange={(e) => setPort(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">Username</label>
                        <input 
                            type="text" value={dbUser} onChange={(e) => setDbUser(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">Password</label>
                        <input 
                            type="password" value={dbPass} onChange={(e) => setDbPass(e.target.value)} placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-1 disabled:opacity-50"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Terminal className="w-5 h-5 mr-2" />
                                Connect & Extract Schema
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: SCHEMA & QUERY */}
        {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 
                 <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-center text-teal-600 text-sm font-bold shadow-sm">
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    Successfully connected to database and extracted schema.
                 </div>

                 <div className="bg-white border border-pink-50 p-8 rounded-3xl shadow-xl shadow-pink-100/50">
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-600 mb-2">Extracted Schema (SQL)</label>
                        <div className="relative">
                            <textarea 
                                value={schema}
                                onChange={(e) => setSchema(e.target.value)}
                                rows={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-pink-200 font-mono text-xs focus:border-pink-400 focus:outline-none leading-relaxed shadow-inner"
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-slate-900/50 px-2 py-1 rounded">
                                Read Only Preview
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-600 mb-2">Endpoint Name</label>
                            <input 
                                type="text" 
                                value={endpointName}
                                onChange={(e) => setEndpointName(e.target.value)}
                                placeholder="get_recent_users"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-gray-600 mb-2">Natural Language Query</label>
                             <input 
                                type="text" 
                                value={queryPrompt}
                                onChange={(e) => setQueryPrompt(e.target.value)}
                                placeholder="Get the top 5 users who signed up recently..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Parameters Section (User Defined) */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-bold text-gray-600">Explicit Parameters (Optional)</label>
                            <button 
                                onClick={addParameter}
                                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-4 py-2 rounded-xl transition-colors flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add Param
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {params.map((param) => (
                                <div key={param.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="col-span-4">
                                        <input 
                                            type="text" 
                                            placeholder="Param Name"
                                            value={param.name}
                                            onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:border-pink-400 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                         <select 
                                            value={param.type}
                                            onChange={(e) => updateParameter(param.id, 'type', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:border-pink-400 focus:outline-none"
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="array">Array</option>
                                            <option value="object">Object</option>
                                        </select>
                                    </div>
                                    <div className="col-span-4">
                                        <input 
                                            type="text" 
                                            placeholder="Description (Optional)"
                                            value={param.description || ''}
                                            onChange={(e) => updateParameter(param.id, 'description', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 focus:border-pink-400 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button 
                                            onClick={() => removeParameter(param.id)}
                                            className="text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-pink-200 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-pink-300 hover:-translate-y-1"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Analyzing Schema & Generating SQL...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5 mr-2" />
                                Generate Endpoint
                            </>
                        )}
                    </button>
                 </div>
             </div>
        )}

        {/* STEP 3: PREVIEW */}
        {step === 3 && (
            <div className="bg-white border border-pink-50 p-8 rounded-3xl shadow-xl shadow-pink-100/50 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-700">Review Generated Logic</h2>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => setStep(2)}
                            className="px-4 py-2 text-gray-500 hover:text-pink-500 transition-colors flex items-center text-sm font-bold bg-gray-50 rounded-xl hover:bg-pink-50"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Refine
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 font-mono text-sm overflow-auto text-teal-300 max-h-[500px] scrollbar-thin scrollbar-thumb-teal-500/20 relative mb-8 shadow-inner">
                    <pre className="whitespace-pre-wrap leading-relaxed">{generatedCode}</pre>
                </div>
                
                {params.length > 0 && (
                     <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Detected Parameters</h3>
                        <div className="flex flex-wrap gap-2">
                            {params.map(p => (
                                <span key={p.id} className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 text-sm font-bold flex items-center">
                                    <span className="mr-2">{p.name}</span>
                                    <span className="text-xs text-purple-400 font-normal">{p.type}</span>
                                </span>
                            ))}
                        </div>
                     </div>
                )}

                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-200 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-teal-300 hover:-translate-y-1"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving Endpoint...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Deploy Endpoint
                        </>
                    )}
                </button>
            </div>
        )}
    </div>
  );
};

export default CreateQuery;