
import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from './constants';
import { Product, Category, ChatMessage } from './types';
import ProductCard from './components/ProductCard';
import { getProductRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'catalog'>('search');
  const [searchQuery, setSearchQuery] = useState('');
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
      const query = searchQuery.toLowerCase();
      const filtered = PRODUCTS.filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesHindiName = p.hindiName?.toLowerCase().includes(query);
        const matchesBenefits = p.benefits.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesKeywords = p.searchKeywords?.some(k => k.toLowerCase().includes(query));
        
        return matchesName || matchesHindiName || matchesBenefits || matchesCategory || matchesKeywords;
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, activeTab]);

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

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <i className="fas fa-hand-holding-medical text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">YTM Medicine advisor</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Expert Distributor Help</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
            >
              <i className="fas fa-magic mr-2"></i>AI Advisor
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'catalog' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
            >
              <i className="fas fa-list-ul mr-2"></i>Full Catalog
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'search' ? (
          <div className="p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-md text-2xl"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Puchiye Bimari ke Baare Mein</h2>
                <p className="text-sm text-slate-500 mb-6">Type disease or symptom to find exact company medicine.</p>
                <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                  {[
                    'Vajan kam (Weight Loss) ke liye combo?',
                    'Liver detox aur bhook badhane ke liye?',
                    'Gas, acidity aur jalan ka turant ilaj?',
                    'Skin itching, eczema aur pimples ke liye?',
                    'Bacho ki height aur haddi mazboot karne ke liye?',
                    'Baal jhadne (Hair fall) ke liye best dawa?'
                  ].map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => setInputValue(q)}
                      className="text-left text-sm p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-3"
                    >
                      <i className="fas fa-search-plus text-indigo-400"></i> {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  <div className="prose prose-sm max-w-none prose-slate text-inherit">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={`mb-1 last:mb-0 whitespace-pre-wrap ${line.startsWith('**') || line.startsWith('#') ? 'font-bold mt-2' : ''}`}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-6 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search disease (Hindi/English)... e.g. 'bukhar', 'gas', 'vajan'"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <i className="fas fa-box-open text-4xl mb-4 block"></i>
                Result nahi mila. Sahi spelling check karein.
              </div>
            )}
          </div>
        )}
      </main>

      {activeTab === 'search' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50/90 backdrop-blur-md border-t border-slate-200 max-w-4xl mx-auto z-30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Bimari (e.g. Bukhar, Weight loss, Gas)..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-lg"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'catalog' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/90 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
          <i className="fas fa-list-ol text-indigo-400"></i>
          TOTAL PRODUCTS: {PRODUCTS.length}
        </div>
      )}
    </div>
  );
};

export default App;
