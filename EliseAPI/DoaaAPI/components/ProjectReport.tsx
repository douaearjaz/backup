import React, { useState } from 'react';
import { Download, GraduationCap, ChevronLeft, ChevronRight, BookOpen, Printer } from 'lucide-react';

// --- CONTENT DEFINITION ---
const ReportContent = [
    // PAGE 1: COUVERTURE
    (
        <div className="h-full flex flex-col bg-white p-8 md:p-12 border border-slate-200 shadow-inner">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ fontSize: '14pt', textTransform: 'uppercase', fontWeight: 'bold' }}>Université Cadi Ayad</p>
                <p style={{ fontSize: '12pt' }}>Faculté des Sciences et Techniques</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center">
                <div className="mb-6 p-4 bg-pink-50 rounded-full">
                    <GraduationCap className="w-16 h-16 text-pink-500" />
                </div>
                <p style={{ fontSize: '16pt', marginBottom: '20px' }}>MÉMOIRE DE FIN D'ÉTUDES</p>
                
                <h1 className="text-4xl text-slate-900 font-bold text-center my-8 leading-tight">
                    DOAA API
                </h1>
                <h2 className="text-xl text-slate-600 font-normal text-center mb-12">
                    Plateforme de Génération de Backend Automatisée par Intelligence Artificielle
                </h2>
            </div>

            <div className="mt-auto mb-12 flex justify-between text-sm">
                <div style={{ textAlign: 'left' }}>
                    <p><strong>Réalisé par :</strong></p>
                    <p>DOAA adjazar</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p><strong>Année :</strong></p>
                    <p>{new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    ),
    // PAGE 2: REMERCIEMENTS
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border-l border-slate-100 shadow-inner">
            <h1 className="text-2xl font-bold text-center mt-8 mb-8 text-slate-900">Remerciements</h1>
            <p className="mb-4 text-slate-700">
                Je tiens tout d'abord à remercier Dieu le tout puissant et miséricordieux, qui m'a donné la force et la patience d'accomplir ce modeste travail.
            </p>
            <p className="mb-4 text-slate-700">
                En second lieu, je tiens à remercier mon encadrant pour ses conseils avisés, sa patience et son orientation durant toute la période de réalisation de ce projet.
            </p>
            <div className="mt-12 border-t pt-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Résumé</h2>
                <p className="text-sm text-slate-600">
                    <strong>DOAA API</strong> est une solution innovante visant à automatiser le développement backend grâce à l'IA. Elle permet de traduire des instructions en langage naturel en code Node.js exécutable et sécurisé, réduisant drastiquement le temps de prototypage.
                </p>
            </div>
        </div>
    ),
    // PAGE 3: TABLE DES MATIÈRES
    (
        <div className="h-full bg-white p-8 md:p-12 border border-slate-200 shadow-inner">
            <h1 className="text-2xl font-bold text-center mb-8 text-slate-900">Table des Matières</h1>
            <ul className="space-y-4 text-sm text-slate-700">
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between">
                    <span><strong>1. Introduction</strong></span> <span>4</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between pl-4">
                    <span>1.1 Contexte & Problématique</span> <span>4</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between pl-4">
                    <span>1.2 Objectifs</span> <span>5</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between mt-4">
                    <span><strong>2. État de l'Art</strong></span> <span>6</span>
                </li>
                 <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between pl-4">
                    <span>2.1 No-Code vs Code</span> <span>6</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between mt-4">
                    <span><strong>3. Architecture Technique</strong></span> <span>7</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between mt-4">
                    <span><strong>4. Réalisation (MERN Stack)</strong></span> <span>9</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between mt-4">
                    <span><strong>5. Sécurité</strong></span> <span>10</span>
                </li>
                <li className="border-b border-dotted border-slate-300 pb-1 flex justify-between mt-4">
                    <span><strong>Conclusion</strong></span> <span>11</span>
                </li>
            </ul>
        </div>
    ),
    // PAGE 4: INTRO
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border-l border-slate-100 shadow-inner">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">1. Introduction</h1>
            <h2 className="text-lg font-bold text-slate-700 mb-3">1.1 Contexte</h2>
            <p className="mb-4 text-sm text-slate-600">
                Le développement d'applications web modernes repose sur une séparation stricte entre le Frontend et le Backend. Si les outils Frontend ont évolué (React, Vite), le développement Backend implique souvent des tâches répétitives : configuration serveur, routes API, SQL.
            </p>
            <h2 className="text-lg font-bold text-slate-700 mb-3">1.2 Problématique</h2>
            <p className="mb-4 text-sm text-slate-600">
                <em>"Comment accélérer le développement Backend en utilisant les capacités des LLM pour transformer une intention métier en un service web fonctionnel ?"</em>
            </p>
            <p className="text-sm text-slate-600">
                Les défis incluent la fiabilité du code généré (hallucinations), la sécurité de l'exécution (Sandbox), et l'intégration avec des bases de données existantes.
            </p>
        </div>
    ),
    // PAGE 5: OBJECTIFS
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border border-slate-200 shadow-inner">
            <h2 className="text-lg font-bold text-slate-700 mb-4">1.3 Objectifs du Projet</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li><strong>Interface Intuitive :</strong> UX fluide pour décrire la logique en langage naturel.</li>
                <li><strong>Génération Robuste :</strong> Prompt Engineering avancé pour du code Node.js valide.</li>
                <li><strong>Introspection SGBD :</strong> Analyse de structure MySQL/PostgreSQL pour générer des requêtes complexes.</li>
                <li><strong>Sandbox :</strong> Environnement d'exécution isolé pour tester le code immédiatement.</li>
            </ul>
            
            <div className="mt-8 p-4 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-500 italic text-center">
                    "DOAA ne remplace pas le développeur, il lui donne des super-pouvoirs."
                </p>
            </div>
        </div>
    ),
     // PAGE 6: ETAT DE L'ART
     (
        <div className="h-full bg-white p-8 md:p-12 text-justify border-l border-slate-100 shadow-inner">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">2. État de l'Art</h1>
            <h2 className="text-lg font-bold text-slate-700 mb-3">2.1 Low-Code / No-Code</h2>
            <p className="mb-4 text-sm text-slate-600">
                Des plateformes comme Bubble ou Zapier démocratisent le développement mais souffrent de "Vendor Lock-in". Il est difficile d'exporter le code.
            </p>
            <h2 className="text-lg font-bold text-slate-700 mb-3">2.2 IA Générative</h2>
            <p className="mb-4 text-sm text-slate-600">
                L'arrivée de GPT-4 et Gemini permet de générer du code. Cependant, ChatGPT fournit du code statique. NovaForge va plus loin en <strong>exécutant</strong> et en <strong>hébergeant</strong> ce code instantanément.
            </p>
        </div>
    ),
    // PAGE 7: ARCHITECTURE
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border border-slate-200 shadow-inner">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">3. Architecture</h1>
            <p className="mb-4 text-sm text-slate-600">
                L'architecture suit un modèle Client-Serveur découplé. Le serveur agit comme une API et un Runtime.
            </p>
            <div className="my-6 p-4 border border-slate-200 rounded bg-slate-50 text-xs font-mono text-slate-700">
                [Frontend React] --(Prompt)--&lt [Backend Node] <br/>
                                              | <br/>
                                              v <br/>
                                         [Gemini API] <br/>
                                              | <br/>
                                              v <br/>
                [Sandbox VM] &gt--(Code JS)-- [SQLite DB]
            </div>
            <p className="text-sm text-slate-600">
                <strong>Composants Clés :</strong> React 19 pour l'UI, Node.js/Express pour le serveur, SQLite pour la persistance légère, et Google Gemini Flash pour l'intelligence.
            </p>
        </div>
    ),
    // PAGE 8: DATA MODEL
    (
         <div className="h-full bg-white p-8 md:p-12 text-justify border-l border-slate-100 shadow-inner">
            <h2 className="text-lg font-bold text-slate-700 mb-4">3.3 Modèle de Données</h2>
            <p className="mb-4 text-sm text-slate-600">Stockage relationnel via SQLite.</p>
            
            <h3 className="text-md font-semibold mt-4 text-slate-800">Table: api_functions</h3>
            <ul className="text-xs space-y-1 font-mono bg-slate-50 p-3 rounded mt-2 text-slate-600">
                <li>id: UUID (PK)</li>
                <li>user_id: INTEGER (FK)</li>
                <li>name: VARCHAR</li>
                <li>generatedCode: TEXT</li>
                <li>parameters: JSON</li>
            </ul>

            <h3 className="text-md font-semibold mt-4 text-slate-800">Table: users</h3>
            <ul className="text-xs space-y-1 font-mono bg-slate-50 p-3 rounded mt-2 text-slate-600">
                <li>id: INTEGER (PK)</li>
                <li>email: VARCHAR</li>
                <li>password: VARCHAR (Hashed)</li>
                <li>name: VARCHAR</li>
            </ul>
        </div>
    ),
    // PAGE 9: REALISATION
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border border-slate-200 shadow-inner">
             <h1 className="text-2xl font-bold text-slate-900 mb-6">4. Réalisation</h1>
             <h2 className="text-lg font-bold text-slate-700 mb-3">4.1 Prompt Engineering</h2>
             <p className="mb-4 text-sm text-slate-600">
                Le cœur du système réside dans la construction des prompts envoyés à Gemini.
             </p>
             <p className="text-sm italic bg-yellow-50 p-4 border-l-4 border-yellow-400 mb-4 text-slate-700">
                "You are an expert Node.js developer. Write ONLY the function body. Do not use require(). Destructure inputs from req.body."
             </p>
             <p className="text-sm text-slate-600">
                Ces contraintes strictes garantissent que le code généré est directement injectable dans notre `new Function()` sandboxé côté client ou exécutable côté serveur.
             </p>
        </div>
    ),
    // PAGE 10: SECURITE
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border-l border-slate-100 shadow-inner">
             <h1 className="text-2xl font-bold text-slate-900 mb-6">5. Sécurité</h1>
             <p className="mb-4 text-sm text-slate-600">
                L'exécution de code arbitraire est risquée. NovaForge implémente plusieurs couches de défense :
             </p>
             <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li><strong>Sanitization :</strong> Le prompt interdit explicitement l'accès au système de fichiers (`fs`).</li>
                <li><strong>Sandbox JS :</strong> Utilisation de `new Function` avec une portée limitée.</li>
                <li><strong>Auth Token :</strong> JWT pour protéger les endpoints d'exécution serveur.</li>
                <li><strong>Logging :</strong> Traceabilité complète des exécutions dans `server.log`.</li>
             </ul>
        </div>
    ),
    // PAGE 11: CONCLUSION
    (
        <div className="h-full bg-white p-8 md:p-12 text-justify border border-slate-200 shadow-inner flex flex-col justify-center">
             <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Conclusion</h1>
             <p className="mb-6 text-sm text-slate-600">
                NovaForge démontre qu'il est possible de réduire drastiquement la barrière à l'entrée du développement Backend.
             </p>
             <p className="mb-6 text-sm text-slate-600">
                En combinant la puissance de <strong>Google Gemini Flash</strong> avec une architecture robuste <strong>Node.js + React</strong>, nous avons créé un outil capable de transformer une idée en API fonctionnelle en moins de 10 secondes.
             </p>
             <p className="text-sm font-bold text-center mt-8 text-slate-800">
                Perspectives futures :
             </p>
             <ul className="text-sm text-center mt-2 text-slate-600">
                <li>Support de Python</li>
                <li>Déploiement One-Click sur le Cloud (Vercel/Heroku)</li>
                <li>Tests unitaires générés par IA</li>
             </ul>
        </div>
    )
];

const ProjectReport: React.FC = () => {
    const [page, setPage] = useState(0);

    const nextPage = () => {
        if (page < ReportContent.length - 1) setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    return (
        <div className="h-[calc(105vh)] flex flex-col items-center justify-center p-4">
            <div className="flex justify-between w-full max-w-4xl mb-4 items-center">
                <div className="flex items-center space-x-2 text-gray-600">
                    <BookOpen className="w-5 h-5 text-pink-500" />
                    <span className="font-bold text-lg">Project Report</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-mono text-gray-400">Page {page + 1} / {ReportContent.length}</span>
                    <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <Printer className="w-5 h-8" />
                    </button>
                </div>
            </div>

            {/* A4 Paper Effect */}
            <div className="relative w-full max-w-[210mm] aspect-[210/297] bg-white shadow-2xl rounded-sm overflow-hidden transition-all duration-500">
                 {/* Page Content */}
                 <div className="absolute w-full h- text-slate-800">
                    {ReportContent[page]}
                 </div>
                 
                 {/* Binder Holes Effect */}
                 <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-around py-12 pointer-events-none">
                     <div className="w-4 h-4 rounded-full bg-gray-100 shadow-inner border border-gray-200"></div>
                     <div className="w-4 h-4 rounded-full bg-gray-100 shadow-inner border border-gray-200"></div>
                     <div className="w-4 h-4 rounded-full bg-gray-100 shadow-inner border border-gray-200"></div>
                 </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-8 mt-8">
                <button 
                    onClick={prevPage} 
                    disabled={page === 0}
                    className="p-4 rounded-full bg-white shadow-lg text-gray-600 hover:text-pink-500 disabled:opacity-30 disabled:hover:text-gray-600 transition-all hover:-translate-y-1"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button 
                    onClick={nextPage} 
                    disabled={page === ReportContent.length - 1}
                    className="p-4 rounded-full bg-white shadow-lg text-gray-600 hover:text-pink-500 disabled:opacity-30 disabled:hover:text-gray-600 transition-all hover:-translate-y-1"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ProjectReport;