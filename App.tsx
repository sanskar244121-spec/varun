
import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from './constants';
import { Product, Category, ChatMessage } from './types';
import ProductCard from './components/ProductCard';
import { getProductRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'catalog'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'catalog') {
      const query = searchQuery.toLowerCase().trim();
      
      const filtered = PRODUCTS.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        if (!query) return matchesCategory;

        const matchesName = p.name.toLowerCase().includes(query);
        const matchesHindiName = p.hindiName?.toLowerCase().includes(query);
        const matchesBenefits = p.benefits.toLowerCase().includes(query);
        const matchesHindiBenefits = p.hindiBenefits?.toLowerCase().includes(query);
        const matchesDescription = p.description.toLowerCase().includes(query);
        const matchesIngredients = p.ingredients.some(i => i.toLowerCase().includes(query));
        const matchesKeywords = p.searchKeywords?.some(k => k.toLowerCase().includes(query));
        
        return matchesCategory && (
          matchesName || 
          matchesHindiName || 
          matchesBenefits || 
          matchesHindiBenefits ||
          matchesDescription || 
          matchesIngredients || 
          matchesKeywords
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, selectedCategory, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const responseText = await getProductRecommendation(inputValue, chatHistory);
    const aiMsg: ChatMessage = { role: 'model', content: responseText };
    
    setChatHistory(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const getCategoryCount = (cat: Category | 'All') => {
    if (cat === 'All') return PRODUCTS.length;
    return PRODUCTS.filter(p => p.category === cat).length;
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-slate-50 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 transform -rotate-3 hover:rotate-0 transition-transform p-1 overflow-hidden">
              <img 
                src="https://ytmorganic.com/images/logo.png" 
                alt="YTM Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=YTM';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">YTM ADVISOR</h1>
              <p className="text-[10px] text-indigo-600 uppercase tracking-[0.2em] font-black mt-1">Medicine Expert • द्विभाषी</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'search' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-robot"></i> AI Help
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-th-large"></i> Catalog
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        {activeTab === 'search' ? (
          <div className="p-4 space-y-6 max-w-2xl mx-auto w-full">
            {chatHistory.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-inner">
                  <i className="fas fa-stethoscope text-3xl"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Puchiye Bimari ke Baare Mein</h2>
                <p className="text-sm text-slate-500 mb-8 font-medium">Get Hindi & English medicine details instantly. / अंग्रेजी और हिंदी में जानकारी प्राप्त करें।</p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    'Vajan kam (Weight Loss) ke liye combo?',
                    'Bhook badhane (Liver detox) ke liye?',
                    'Acidity aur Gas ka turant upaay?',
                    'Skin itching (दाद-खुजली) ke liye?',
                    'Bacho ki height aur haddi (Bones) ke liye?',
                    'Baal jhadne (Hair fall) ka ilaj?'
                  ].map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => setInputValue(q)}
                      className="text-left text-sm p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-4 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <i className="fas fa-comment-medical text-indigo-400"></i>
                      </div>
                      <span className="font-bold text-slate-700">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  <div className="prose prose-sm max-w-none prose-slate text-inherit leading-relaxed">
                    {msg.content.split('\n').map((line, i) => {
                      const isHeading = line.startsWith('**') || line.startsWith('#');
                      return (
                        <p key={i} className={`mb-2 last:mb-0 whitespace-pre-wrap ${isHeading ? 'font-black text-indigo-800' : ''}`}>
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Product Inventory</h2>
                  <p className="text-sm text-slate-500 font-medium">Bilingual Search: English & हिन्दी में खोजें</p>
                </div>
                <div className="flex items-center gap-4 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100">
                  <div className="text-center">
                    <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-indigo-700">{PRODUCTS.length}</span>
                  </div>
                  <div className="w-px h-8 bg-indigo-200"></div>
                  <div className="text-center">
                    <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Showing</span>
                    <span className="text-xl font-black text-indigo-700">{filteredProducts.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['All', Category.MEDICINE, Category.SUPPLEMENT, Category.SKINCARE].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                      selectedCategory === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {cat} <span className={`ml-1 opacity-60`}>({getCategoryCount(cat as any)})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 relative max-w-2xl mx-auto group">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Search: Liver, पथरी, Skin, शुगर..."
                className="w-full pl-14 pr-32 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm transition-all text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md border border-indigo-200">EN/हिं</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200 mt-6">
                <i className="fas fa-search-minus text-5xl mb-6 block opacity-20"></i>
                <p className="text-xl font-bold text-slate-600">Koi product nahi mila. / कोई उत्पाद नहीं मिला।</p>
                <p className="text-sm">Check your spelling or try Hindi/English keywords.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {activeTab === 'search' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 max-w-4xl mx-auto z-30 flex justify-center">
          <form onSubmit={handleSendMessage} className="flex gap-3 w-full max-w-2xl">
            <input 
              type="text" 
              placeholder="Ask: Liver detox, शुगर कंट्रोल, Hair fall..."
              className="flex-1 px-6 py-4 bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none shadow-inner transition-all text-base font-bold"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <i className="fas fa-paper-plane text-xl"></i>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 backdrop-blur-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          SEARCHING IN BOTH LANGUAGES / दोनों भाषाओं में खोज जारी है
        </div>
      )}
    </div>
  );
};

export default App;
