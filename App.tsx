import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./services/firebase";
import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from './constants';
import { Product, Category, ChatMessage } from './types';
import ProductCard from './components/ProductCard';
import { getProductRecommendation } from './services/geminiService';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Skeleton loader for AI response
const SkeletonMessage = () => (
  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
    <div className="max-w-[85%] w-full bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-indigo-100 rounded-full animate-pulse"></div>
        <div className="h-2 w-20 bg-slate-100 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded animate-pulse"></div>
        <div className="h-3 w-[90%] bg-slate-100 rounded animate-pulse"></div>
        <div className="h-3 w-[70%] bg-slate-100 rounded animate-pulse"></div>
      </div>
      <div className="pt-2 flex gap-2">
        <div className="h-2 w-16 bg-slate-50 rounded animate-pulse"></div>
        <div className="h-2 w-12 bg-slate-50 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  // ===== Auth =====
  const [user, setUser] = useState<any>(null);
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (e) {
      alert("Google login failed");
    }
  };

  // ===== State =====
  const [activeTab, setActiveTab] = useState<'search' | 'catalog'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // ===== Refs =====
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // ===== Auth check =====
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Login to continue</h2>
        <button
          onClick={loginWithGoogle}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // ===== Scroll =====
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ===== Filter products =====
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = PRODUCTS.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      if (!query) return matchesCategory;
      return matchesCategory && (
        p.name.toLowerCase().includes(query) ||
        p.hindiName?.toLowerCase().includes(query) ||
        p.benefits.toLowerCase().includes(query) ||
        p.searchKeywords?.some(k => k.toLowerCase().includes(query))
      );
    });
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, activeTab]);

  // ===== Auto-scroll =====
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  // ===== Speech Recognition =====
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true; 
    recognition.lang = 'hi-IN';
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechStatus('Sun raha hoon... / Listening...');
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((res: any) => res[0].transcript).join('');
      if (event.results[0].isFinal) setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
      setSpeechStatus(`Hearing: ${transcript}`);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      setSpeechStatus(null);
    };
    recognitionRef.current = recognition;
  }, []);

  const toggleListening = async () => {
    if (isListening) return recognitionRef.current?.stop();
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current?.start();
    } catch {
      setSpeechStatus('Mic error.');
    }
  };

  // ===== Chat =====
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: inputValue };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    const responseText = await getProductRecommendation(inputValue, chatHistory);
    setChatHistory(prev => [...prev, { role: 'model', content: responseText }]);
    setIsLoading(false);
  };

  const totalProducts = PRODUCTS.length;
  const categories: (Category | 'All')[] = ['All', Category.MEDICINE, Category.SUPPLEMENT, Category.SKINCARE];

  // ===== JSX =====
  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 p-1 overflow-hidden">
              <img src="./logo.png" alt="YTM Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none uppercase">YTM ADVISOR</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-indigo-600 uppercase tracking-widest font-black">Medicine Advisor</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveTab('search')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'search' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <i className="fas fa-robot"></i> Advisor
              </button>
              <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <i className="fas fa-th-large"></i> Catalog
                <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-md font-black">{totalProducts}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-32">
        {activeTab === 'search' ? (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            {chatHistory.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-inner">
                  <i className="fas fa-magic text-2xl"></i>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Namaste!</h2>
                <p className="text-xs text-slate-500 mb-8 font-medium italic">
                  I can guide you through our <strong>{totalProducts} products</strong>. How can I help? / मैं आपकी कैसे मदद कर सकता हूँ?
                </p>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                  <div className="prose prose-sm prose-slate text-inherit leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && <SkeletonMessage />}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="p-4 max-w-4xl mx-auto">
            {/* Search + Category */}
            <div className="mb-6 space-y-4 max-w-2xl mx-auto">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder={`Search ${totalProducts} products...`}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Found {filteredProducts.length} items
                </span>
                {selectedCategory !== 'All' && (
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className="text-[10px] font-black text-indigo-500 uppercase tracking-widest"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <i className="fas fa-search text-3xl text-slate-200 mb-4"></i>
                <p className="text-slate-500 font-bold">No products match your criteria</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                  className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-wider"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Input Box */}
      {activeTab === 'search' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 max-w-4xl mx-auto z-30">
          <form onSubmit={handleSendMessage} className="flex gap-2 w-full max-w-2xl mx-auto items-center">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Bimari ka naam likhein (e.g. Sugar, Piles)..."
                className="w-full px-5 py-3.5 bg-slate-100 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none shadow-inner transition-all text-sm font-bold pr-12"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}
              >
                <i className={`fas ${isListening ? 'fa-microphone' : 'fa-microphone-alt'}`}></i>
              </button>
            </div>
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 shadow-lg active:scale-95 transition-all">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          {speechStatus && <p className="text-[9px] text-center mt-2 font-black text-indigo-500 uppercase tracking-widest">{speechStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default App;
