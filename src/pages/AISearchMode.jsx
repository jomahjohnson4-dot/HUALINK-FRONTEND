import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Image as ImageIcon,
  Mic,
  Sparkles,
  Loader2,
  X,
  History,
  Package,
  ArrowRight,
} from 'lucide-react';
import { productsCatalog } from '../data/productsCatalog';

/* -------------------------------------------------------------------------- */
/*  Storage                                                                   */
/* -------------------------------------------------------------------------- */

const HISTORY_KEY = 'hualink_ai_search_history';
const MAX_HISTORY = 25;

/** Words that carry no matching signal for the Hualink catalogue. */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'with', 'and', 'of', 'me', 'my', 'i', 'to', 'in',
  'on', 'please', 'show', 'find', 'some', 'any', 'want', 'need', 'looking',
  'product', 'products', 'item', 'items',
]);

/* -------------------------------------------------------------------------- */
/*  Matching                                                                  */
/* -------------------------------------------------------------------------- */

/** Everything a customer could type about a product, lower-cased. */
const searchHaystack = (product) =>
  [
    product.name,
    product.category,
    ...(product.specs || []),
    ...Object.values(product.details || {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

/** Split a free-text query into meaningful tokens. */
const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

/**
 * Light stemming so a plural query still matches the catalogue singular,
 * e.g. "kettles" -> "kettle" and "chargers" -> "charger".
 */
const stem = (token) => (token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token);

/**
 * Match the query tokens against the Hualink inventory.
 *
 * Products that satisfy every token rank first, products that only satisfy
 * part of the query are kept as a weaker match. When nothing matches at all
 * the top selling Hualink items are returned so the customer always sees a
 * populated shelf.
 */
const matchInventory = (tokens) => {
  if (!tokens.length) return [];

  const scored = productsCatalog
    .map((product) => {
      const haystack = searchHaystack(product);
      const name = product.name.toLowerCase();

      let score = 0;
      let exact = 0;
      tokens.forEach((token) => {
        const root = stem(token);
        if (haystack.includes(token) || haystack.includes(root)) score += 1;
        if (name.includes(token) || name.includes(root)) exact += 1;
      });

      return { product, score, exact };
    })
    .filter((entry) => entry.score > 0);

  if (!scored.length) return [];

  return scored
    .sort((a, b) => b.exact - a.exact || b.score - a.score)
    .map((entry) => entry.product);
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function AISearchMode() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  // Saved customer chat & search records are read once, lazily, on mount
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (!savedHistory) return [];
      const parsed = JSON.parse(savedHistory);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load chat history', e);
      return [];
    }
  });
  const [filteredResults, setFilteredResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notice, setNotice] = useState('');

  const recognitionRef = useRef(null);
  const objectUrlRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Release the microphone and the preview object URL when leaving the page
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* recognition already stopped */
        }
      }
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Save history to local storage whenever it changes
  const saveToHistory = useCallback((newHistory) => {
    setChatHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to persist chat history', e);
    }
  }, []);

  /**
   * Perform AI Product Match across the Hualink inventory.
   *
   * Text, voice and image queries all end up here: the image contributes its
   * file name to the matching tokens so uploading "iphone.jpg" resolves to the
   * iPhone listing.
   */
  const handlePerformAISearch = useCallback(
    (searchQuery, imageFile = null, mode = 'text') => {
      const trimmed = String(searchQuery || '').trim();
      if (!trimmed && !imageFile) return;

      setNotice('');
      setIsSearching(true);

      // A new search supersedes the one still running
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

      searchTimerRef.current = setTimeout(() => {
        const tokens = [
          ...tokenize(trimmed),
          ...tokenize(imageFile?.name || ''),
        ];

        const matches = matchInventory(tokens);

        // Fallback: show the top trending Hualink items when nothing matched
        const finalResults = matches.length > 0 ? matches : productsCatalog.slice(0, 4);

        setFilteredResults(finalResults);
        setIsSearching(false);

        // Record Customer AI Interaction
        const newEntry = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userQuery:
            trimmed || (imageFile ? `Image search: ${imageFile.name}` : 'Smart voice search'),
          hasImage: !!imageFile,
          mode,
          resultCount: finalResults.length,
          recommendedItem: finalResults[0]?.name || 'Hualink Electronics',
        };

        // Functional update keeps rapid searches from overwriting each other
        setChatHistory((current) => {
          const updated = [newEntry, ...current].slice(0, MAX_HISTORY);
          try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to persist chat history', e);
          }
          return updated;
        });
      }, 1200);
    },
    []
  );

  // Web Speech API Voice Search
  const handleStartVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotice('Voice Recognition is not supported on this browser. Please type your query.');
      return;
    }

    setNotice('');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setNotice('Microphone access was blocked. Please allow it or type your query.');
      } else if (event.error !== 'aborted') {
        setNotice('Voice search could not be completed. Please try again.');
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handlePerformAISearch(transcript, null, 'voice');
    };

    recognition.start();
  };

  // Handle Image Upload Search
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    setSelectedImage(previewUrl);
    handlePerformAISearch('', file, 'image');

    // Allow re-selecting the same file straight away
    event.target.value = '';
  };

  const handleClearImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedImage(null);
  };

  const resultsLabel = useMemo(
    () => `${filteredResults.length} ${filteredResults.length === 1 ? 'Item' : 'Items'} Found`,
    [filteredResults.length]
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900 py-8 px-4 md:px-12">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            AI Smart Search Mode
          </h1>
          <p className="text-xs font-bold text-gray-500">
            Multimodal product discovery — speak, upload photos, or type to query Hualink
            Distribution wholesale stock instantly.
          </p>
        </div>

        {/* Main Search Bar Card */}
        <div className="bg-white border-2 border-red-500/80 rounded-3xl p-5 shadow-lg mb-8 max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-red-500 transition-colors">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePerformAISearch(query)}
              placeholder="Ask AI for chargers, AirPods, JBL, smartphones, kettles, pasi..."
              className="w-full bg-transparent text-xs font-bold text-gray-900 focus:outline-none"
            />
            <button
              onClick={() => handlePerformAISearch(query)}
              className="bg-[#E50914] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-red-700 transition-colors cursor-pointer shrink-0"
            >
              {isSearching ? 'Analyzing...' : 'AI Search'}
            </button>
          </div>

          {/* Uploaded image preview */}
          {selectedImage ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3">
              <img
                src={selectedImage}
                alt="Uploaded search reference"
                className="w-16 h-16 object-cover rounded-xl border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-gray-800">Image reference attached</p>
                <p className="text-[11px] font-semibold text-gray-500">
                  Matching this photo against the Hualink catalogue…
                </p>
              </div>
              <button
                onClick={handleClearImage}
                aria-label="Remove image"
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#E50914] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          {/* Quick Trigger Buttons (Voice & Image) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {/* Image Search Input */}
              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-pointer transition-colors">
                <ImageIcon size={14} />
                <span>Image Search</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Voice Search Button */}
              <button
                onClick={handleStartVoiceSearch}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Mic size={14} />
                <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
              </button>
            </div>

            <span className="text-[11px] font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={12} />
              Mastered Hualink Price Catalog
            </span>
          </div>

          {notice ? (
            <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {notice}
            </p>
          ) : null}
        </div>

        {/* Grid: Search Results & Customer Interaction Log */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Side: AI Recommended Products */}
          <div className="md:col-span-8">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#E50914]" />
                AI Product Recommendations
              </span>
              <span className="text-xs text-gray-400 font-bold">{resultsLabel}</span>
            </h2>

            {isSearching ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-bold text-xs space-y-2">
                <Loader2 size={24} className="animate-spin text-red-600 mx-auto" />
                <p>AI matching visual & text query with Hualink inventory...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="w-full h-48 bg-transparent rounded-xl overflow-hidden mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                      <h3 className="text-xs font-black text-gray-900 mt-2 line-clamp-2 group-hover:text-[#E50914] transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black text-gray-900">{product.price}</span>
                        <ArrowRight
                          size={14}
                          className="text-gray-300 group-hover:text-[#E50914] transition-colors"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-xs font-bold text-gray-500">
                Try searching &quot;AirPods&quot;, &quot;JBL&quot;, &quot;Iron Pasi&quot;, or
                &quot;iPhone&quot; to get instant AI matches.
              </div>
            )}
          </div>

          {/* Right Side: Customer AI Chat/Search Records Log */}
          <div className="md:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-fit space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-[#E50914]" />
                Customer Search History Log
              </h3>
              {chatHistory.length > 0 ? (
                <button
                  onClick={() => saveToHistory([])}
                  className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              ) : null}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {chatHistory.length === 0 ? (
                <p className="text-[11px] font-semibold text-gray-400 text-center py-4 flex items-center justify-center gap-1.5">
                  <Package size={13} />
                  No past search records stored yet.
                </p>
              ) : (
                chatHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                      <span>{item.timestamp}</span>
                      <span className="text-red-600">{item.resultCount} Matches</span>
                    </div>
                    <p className="font-extrabold text-gray-800 line-clamp-1">
                      &quot;{item.userQuery}&quot;
                    </p>
                    <p className="text-[10px] text-gray-500 font-semibold">
                      Matched: {item.recommendedItem}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
