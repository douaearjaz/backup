import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Wand2, Loader2, Save, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { ParamType, ApiParameter, ApiFunction } from '../types';
import { generateFunctionCode } from '../services/geminiService';
import { saveFunction } from '../services/storageService';

const CreateFunction: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [outputType, setOutputType] = useState('object');
  const [params, setParams] = useState<ApiParameter[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  
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

  const handleGenerate = async () => {
    if (!name || !description) {
      setError("Please provide a name and description.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedCode('');

    try {
      const code = await generateFunctionCode(name, description, params, outputType);
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || "Failed to generate code.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedCode) return;
    setIsSaving(true);
    setError(null);

    const newFunction: ApiFunction = {
      id: Date.now().toString(),
      name: name.replace(/\s+/g, '_').toLowerCase(),
      description,
      parameters: params,
      outputType,
      generatedCode,
      createdAt: Date.now()
    };

    try {
      await saveFunction(newFunction);
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Failed to save function");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-slide-up">
      <div className="mb-12 text-center relative">
         {/* Decorative title background */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-pink-200/30 blur-3xl rounded-full -z-10"></div>
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">Compose a Spell</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Define your logic in plain English, and our AI enchantress will weave the backend code for you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Definition */}
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-xl shadow-pink-100/50 hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-500">
            <h2 className="text-xl font-bold text-gray-700 mb-8 flex items-center">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white text-lg font-bold mr-4 shadow-lg shadow-pink-200">1</span>
                Core Essence
            </h2>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-pink-500 transition-colors">Function Name</label>
                <div className="relative">
                    <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., calculate_love_compatibility"
                    className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl px-6 py-4 text-gray-700 font-mono text-sm focus:outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-pink-200/70"
                    />
                    <Zap className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-pink-500 transition-colors">Magic Logic</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the spell effect (e.g., 'Take two names and return a random percentage between 50 and 100')..."
                  className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-pink-200/70 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Return Type</label>
                <div className="relative group">
                    <select 
                        value={outputType}
                        onChange={(e) => setOutputType(e.target.value)}
                        className="w-full bg-pink-50/50 border border-pink-100 rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100 transition-all appearance-none cursor-pointer"
                    >
                        <option value="string">String (Text)</option>
                        <option value="number">Number (Value)</option>
                        <option value="boolean">Boolean (True/False)</option>
                        <option value="object">Object (JSON)</option>
                        <option value="array">Array (List)</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-pink-400 group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-xl shadow-pink-100/50 hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-500">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-700 flex items-center">
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white text-lg font-bold mr-4 shadow-lg shadow-purple-200">2</span>
                    Ingredients (Params)
                </h2>
                <button 
                    onClick={addParameter}
                    className="group flex items-center bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border border-purple-100"
                >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> Add
                </button>
            </div>

            <div className="space-y-4">
                {params.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-purple-100 rounded-3xl bg-purple-50/30">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <Sparkles className="w-5 h-5 text-purple-300" />
                        </div>
                        <p className="text-sm text-purple-400 font-medium">No ingredients needed yet.</p>
                    </div>
                )}
                {params.map((param, idx) => (
                    <div key={param.id} className="bg-white p-5 rounded-3xl border border-purple-100 relative group hover:border-pink-300 hover:shadow-lg transition-all shadow-sm animate-slide-up" style={{animationDelay: `${idx * 50}ms`}}>
                         <button 
                            onClick={() => removeParameter(param.id)}
                            className="absolute -top-2 -right-2 bg-white text-gray-300 hover:text-red-500 shadow-md p-1.5 rounded-full transition-all hover:scale-110 border border-gray-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        
                        <div className="grid grid-cols-5 gap-3 mb-3">
                            <div className="col-span-3">
                                <input 
                                    type="text" 
                                    placeholder="Param Name"
                                    value={param.name}
                                    onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                                    className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-purple-400 focus:bg-white focus:outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <select 
                                    value={param.type}
                                    onChange={(e) => updateParameter(param.id, 'type', e.target.value)}
                                    className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:border-purple-400 focus:bg-white focus:outline-none transition-all appearance-none"
                                >
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="array">Array</option>
                                    <option value="object">Object</option>
                                </select>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Brief description of this ingredient..."
                            value={param.description || ''}
                            onChange={(e) => updateParameter(param.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-gray-100 rounded-none px-1 py-2 text-xs text-gray-500 focus:border-purple-400 focus:outline-none focus:bg-transparent transition-all placeholder:text-gray-300"
                        />
                    </div>
                ))}
            </div>
          </div>
          
           <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="group w-full py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-[length:200%_auto] hover:bg-[position:right_center] animate-gradient-x text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-pink-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-pink-500/60 hover:-translate-y-1 overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-[2rem]"></div>
                {isGenerating ? (
                    <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Weaving the Spell...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-6 h-6 mr-3 fill-white/30 group-hover:rotate-12 transition-transform" />
                        Generate Function
                    </>
                )}
            </button>
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-medium animate-pulse">
                    {error}
                </div>
            )}
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] h-full flex flex-col shadow-xl shadow-pink-100/50 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                     <h2 className="text-xl font-bold text-gray-700 flex items-center">
                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 text-white text-lg font-bold mr-4 shadow-lg shadow-teal-200">3</span>
                        Grimoire Page
                     </h2>
                     {generatedCode && (
                         <span className="text-xs px-4 py-1.5 bg-teal-50 text-teal-600 rounded-full border border-teal-100 font-bold flex items-center animate-bounce">
                             <Sparkles className="w-3 h-3 mr-1" />
                             Enchanted!
                         </span>
                     )}
                </div>

                <div className="flex-1 bg-gray-900 rounded-3xl border border-gray-800 p-6 font-mono text-sm overflow-auto text-pink-200 relative scrollbar-thin scrollbar-thumb-pink-500/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] z-10">
                    {generatedCode ? (
                        <pre className="whitespace-pre-wrap leading-relaxed animate-in fade-in duration-700">{generatedCode}</pre>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center animate-pulse-soft">
                                <Wand2 className="w-10 h-10 text-gray-700" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-lg text-slate-400">Waiting for incantation...</p>
                                <p className="text-xs text-slate-600 mt-2">Fill the form and cast "Generate"</p>
                            </div>
                        </div>
                    )}
                </div>

                {generatedCode && (
                    <div className="mt-8 pt-6 border-t border-gray-100 relative z-10">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-[2rem] font-bold text-lg transition-all flex items-center justify-center shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save to Grimoire</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFunction;