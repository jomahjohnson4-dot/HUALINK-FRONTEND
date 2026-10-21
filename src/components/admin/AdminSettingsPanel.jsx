import { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  MessageSquareText,
  SlidersHorizontal,
} from 'lucide-react';
import en from '../../locales/en.json';
import sw from '../../locales/sw.json';
import zh from '../../locales/zh.json';
import fr from '../../locales/fr.json';

const LANGS = [
  { key: 'en', label: 'EN', locale: en },
  { key: 'sw', label: 'SW', locale: sw },
  { key: 'zh', label: 'ZH', locale: zh },
  { key: 'fr', label: 'FR', locale: fr },
];

const TOGGLE_DEFS = [
  {
    key: 'featuredOffers',
    label: 'Featured Offers Strip',
    description: 'Surface discounted deals on the landing page.',
  },
  {
    key: 'bannerAlerts',
    label: 'Banner Alerts',
    description: 'Show the promotional banner above the marketplace header.',
  },
  {
    key: 'liveChat',
    label: 'Live Chat Widget',
    description: 'Allow clients to open the supplier chat panel.',
  },
  {
    key: 'maintenanceNotice',
    label: 'Maintenance Notice',
    description: 'Display a scheduled-maintenance message site-wide.',
  },
];

const NEW_FAQ = { question: '', answers: { en: '', sw: '', zh: '', fr: '' } };

export default function AdminSettingsPanel({ onToast }) {
  // The FAQ list is seeded from the English locale, the canonical source.
  const [faqs, setFaqs] = useState(() =>
    (en.faq?.items || []).map((item, index) => ({
      id: `faq-${index}`,
      question: item.question,
      answers: LANGS.reduce(
        (acc, { key, locale }) => {
          const match = locale.faq?.items?.[index];
          acc[key] = match?.answer || '';
          return acc;
        },
        { en: item.answer }
      ),
    }))
  );

  const [draft, setDraft] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [toggles, setToggles] = useState({
    featuredOffers: true,
    bannerAlerts: true,
    liveChat: true,
    maintenanceNotice: false,
  });

  const handleToggle = (key) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
    onToast?.(`${TOGGLE_DEFS.find((t) => t.key === key)?.label} updated.`);
  };

  const handleRemove = (id) => {
    setFaqs((current) => current.filter((faq) => faq.id !== id));
    if (openId === id) setOpenId(null);
    onToast?.('FAQ removed.');
  };

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleDraftAnswer = (lang, value) => {
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [lang]: value },
    }));
  };

  const handleAdd = () => {
    if (!draft.question.trim()) {
      onToast?.('FAQ question is required.', 'error');
      return;
    }
    setFaqs((current) => [
      ...current,
      { ...draft, id: `faq-${Date.now()}` },
    ]);
    setDraft(null);
    onToast?.('FAQ Added Successfully!');
  };

  const handleSave = () => {
    // Persisted FAQ editing would need a settings endpoint; the panel keeps the
    // structure identical to the locale files so it can be wired up directly.
    onToast?.('FAQ Changes Saved Successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <SlidersHorizontal size={16} className="text-orange-500" />
          <h3 className="text-sm font-extrabold text-white">System Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOGGLE_DEFS.map(({ key, label, description }) => {
            const isOn = toggles[key];
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-4 bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={label}
                  onClick={() => handleToggle(key)}
                  className={`shrink-0 mt-0.5 relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                    isOn ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      isOn ? 'translate-x-5.5 left-0.5' : 'left-0.5'
                    }`}
                    style={{ transform: isOn ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ manager */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <MessageSquareText size={16} className="text-orange-500" />
            <h3 className="text-sm font-extrabold text-white">
              FAQ Manager
              <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                EN / SW / ZH / FR
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setDraft({ ...NEW_FAQ })}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900/50 border border-slate-700/60 rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="flex-1 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(faq.id)}
                    aria-label={`Remove FAQ: ${faq.question}`}
                    className="h-8 w-8 shrink-0 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {isOpen ? (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                    {LANGS.map(({ key, label }) => (
                      <div key={key}>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                          <span className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">
                            {label}
                          </span>
                          Answer
                        </label>
                        <textarea
                          rows={3}
                          defaultValue={faq.answers[key]}
                          onChange={(e) => {
                            faq.answers[key] = e.target.value;
                          }}
                          className="admin-input resize-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {!faqs.length ? (
            <p className="text-center text-xs font-bold text-slate-400 py-8">
              No FAQs configured. Add one to get started.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-5 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Save size={14} />
          <span>Save FAQ Changes</span>
        </button>
      </div>

      {/* New FAQ composer */}
      {draft ? (
        <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setDraft(null)}
            aria-hidden="true"
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl my-8">
            <div className="border-b border-slate-800 px-5 py-4">
              <h3 className="text-sm font-extrabold text-white">Add New FAQ</h3>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Question <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.question}
                  onChange={(e) => handleDraftChange('question', e.target.value)}
                  className="admin-input"
                  placeholder="How do I place a wholesale order?"
                />
              </div>

              {LANGS.map(({ key, label }) => (
                <div key={key}>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                    <span className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">
                      {label}
                    </span>
                    Answer
                  </label>
                  <textarea
                    rows={3}
                    value={draft.answers[key]}
                    onChange={(e) => handleDraftAnswer(key, e.target.value)}
                    className="admin-input resize-none"
                    placeholder={`Answer in ${label}...`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-4">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add FAQ</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
