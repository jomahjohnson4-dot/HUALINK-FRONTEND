import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  MessageSquareText,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import en from '../../locales/en.json';
import sw from '../../locales/sw.json';
import zh from '../../locales/zh.json';
import fr from '../../locales/fr.json';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../../api/faqService';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { key: 'en', label: 'EN', locale: en },
  { key: 'sw', label: 'SW', locale: sw },
  { key: 'zh', label: 'ZH', locale: zh },
  { key: 'fr', label: 'FR', locale: fr },
];

const TOGGLE_DEFS = [
  {
    key: 'featuredOffers',
    labelKey: 'admin.settings.toggles.featured',
    descKey: 'admin.settings.toggles.featuredDesc',
  },
  {
    key: 'bannerAlerts',
    labelKey: 'admin.settings.toggles.banners',
    descKey: 'admin.settings.toggles.bannersDesc',
  },
  {
    key: 'liveChat',
    labelKey: 'admin.settings.toggles.chat',
    descKey: 'admin.settings.toggles.chatDesc',
  },
  {
    key: 'maintenanceNotice',
    labelKey: 'admin.settings.toggles.maintenance',
    descKey: 'admin.settings.toggles.maintenanceDesc',
  },
];

const NEW_FAQ = { question: '', answers: { en: '', sw: '', zh: '', fr: '' } };

/** The API always returns a complete translation map. */
const normaliseFaq = (faq) => ({
  id: faq.id,
  question: faq.question || '',
  answers: LANGS.reduce((acc, { key }) => {
    acc[key] = faq.answers?.[key] || '';
    return acc;
  }, {}),
  sortOrder: faq.sortOrder ?? 0,
});

/**
 * The shipped locale files are the seed content. On the very first load the
 * database is still empty, so the existing copy is pushed across once and the
 * panel then works purely against the database from that point on.
 */
const seedFromLocales = async () => {
  const source = en.faq?.items || [];

  await Promise.all(
    source.map(async (item, index) => {
      const answers = LANGS.reduce((acc, { key, locale }) => {
        acc[key] = locale.faq?.items?.[index]?.answer || '';
        return acc;
      }, {});

      await createFaq({ question: item.question, answers, sortOrder: index });
    })
  );

  return getFaqs();
};

export default function AdminSettingsPanel({ onToast }) {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [draft, setDraft] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [toggles, setToggles] = useState({
    featuredOffers: true,
    bannerAlerts: true,
    liveChat: true,
    maintenanceNotice: false,
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let list = await getFaqs();

      // First run — move the shipped copy into the database.
      if (!list.length) {
        list = await seedFromLocales();
      }

      setFaqs(list.map(normaliseFaq));
      setDirty(false);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      setFaqs([]);
      setLoadError(t('admin.settings.errorService'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = (key) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
    const def = TOGGLE_DEFS.find((toggle) => toggle.key === key);
    if (!def) return;
    onToast?.(t('admin.settings.updated', { label: t(def.labelKey) }));
  };

  /** Removes the FAQ from the database, then from the local list. */
  const handleRemove = async (id) => {
    try {
      await deleteFaq(id);
      setFaqs((current) => current.filter((faq) => faq.id !== id));
      if (openId === id) setOpenId(null);
      onToast?.(t('admin.settings.removed'));
    } catch (err) {
      console.error('FAQ delete failed:', err);
      onToast?.(
        err?.response?.data?.message || t('admin.settings.errorRemove'),
        'error'
      );
    }
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

  /** Edits an answer in place and flags the list as needing a save. */
  const handleAnswerChange = (id, lang, value) => {
    setFaqs((current) =>
      current.map((faq) =>
        faq.id === id
          ? { ...faq, answers: { ...faq.answers, [lang]: value } }
          : faq
      )
    );
    setDirty(true);
  };

  const handleQuestionChange = (id, value) => {
    setFaqs((current) =>
      current.map((faq) => (faq.id === id ? { ...faq, question: value } : faq))
    );
    setDirty(true);
  };

  const handleAdd = async () => {
    if (!draft.question.trim()) {
      onToast?.(t('admin.settings.errorQuestionRequired'), 'error');
      return;
    }

    try {
      const created = await createFaq({
        question: draft.question.trim(),
        answers: draft.answers,
        sortOrder: faqs.length,
      });
      setFaqs((current) => [...current, normaliseFaq(created)]);
      setDraft(null);
      onToast?.(t('admin.settings.successAdd'));
    } catch (err) {
      console.error('FAQ create failed:', err);
      onToast?.(
        err?.response?.data?.message || t('admin.settings.errorAdd'),
        'error'
      );
    }
  };

  /** Writes every FAQ back to the database so edits survive a reload. */
  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await Promise.all(
        faqs.map((faq) =>
          updateFaq(faq.id, { question: faq.question, answers: faq.answers })
        )
      );
      setFaqs(saved.map(normaliseFaq));
      setDirty(false);
      onToast?.(t('admin.settings.successSave'));
    } catch (err) {
      console.error('FAQ save failed:', err);
      onToast?.(
        err?.response?.data?.message || t('admin.settings.errorSave'),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <SlidersHorizontal size={16} className="text-orange-500" />
          <h3 className="text-sm font-extrabold text-white">{t('admin.settings.title')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOGGLE_DEFS.map(({ key, labelKey, descKey }) => {
            const isOn = toggles[key];
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-4 bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-xs font-bold text-white">{t(labelKey)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={t(labelKey)}
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
              {t('admin.settings.faqManager')}
              <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                {t('admin.settings.faqLanguages')}
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setDraft({ ...NEW_FAQ })}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>{t('admin.settings.addFaq')}</span>
          </button>
        </div>

        {loadError ? (
          <p className="flex items-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 mb-4">
            <AlertCircle size={14} />
            {loadError}
          </p>
        ) : null}

        <div className="space-y-3">
          {loading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin text-orange-500" />
              <span className="text-xs font-bold">
                {t('admin.settings.loadingFaqs')}
              </span>
            </div>
          ) : null}

          {!loading &&
            faqs.map((faq) => {
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
                      aria-label={t('admin.settings.removeFaq', {
                        question: faq.question,
                      })}
                      className="h-8 w-8 shrink-0 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {isOpen ? (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          {t('admin.settings.question')}
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleQuestionChange(faq.id, e.target.value)}
                          className="admin-input"
                        />
                      </div>

                      {LANGS.map(({ key, label }) => (
                        <div key={key}>
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                            <span className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">
                              {label}
                            </span>
                            {t('admin.settings.answer')}
                          </label>
                          <textarea
                            rows={3}
                            value={faq.answers[key]}
                            onChange={(e) =>
                              handleAnswerChange(faq.id, key, e.target.value)
                            }
                            className="admin-input resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

          {!loading && !faqs.length ? (
            <p className="text-center text-xs font-bold text-slate-400 py-8">
              {t('admin.settings.emptyFaqs')}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !faqs.length}
          className="mt-5 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>
            {saving ? t('admin.settings.saving') : t('admin.settings.saveFaqChanges')}
          </span>
          {dirty && !saving ? (
            <span className="ml-1 text-[10px] font-bold text-orange-400 uppercase">
              {t('admin.settings.unsaved')}
            </span>
          ) : null}
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
              <h3 className="text-sm font-extrabold text-white">
                {t('admin.settings.addNewFaq')}
              </h3>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  {t('admin.settings.questionRequired')}{' '}
                  <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.question}
                  onChange={(e) => handleDraftChange('question', e.target.value)}
                  className="admin-input"
                  placeholder={t('admin.settings.questionPlaceholder')}
                />
              </div>

              {LANGS.map(({ key, label }) => (
                <div key={key}>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                    <span className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">
                      {label}
                    </span>
                    {t('admin.settings.answer')}
                  </label>
                  <textarea
                    rows={3}
                    value={draft.answers[key]}
                    onChange={(e) => handleDraftAnswer(key, e.target.value)}
                    className="admin-input resize-none"
                    placeholder={t('admin.settings.answerPlaceholder', { label })}
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
                {t('admin.settings.cancel')}
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>{t('admin.settings.addFaq')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
