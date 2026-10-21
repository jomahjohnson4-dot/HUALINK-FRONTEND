import api from './axios';

/**
 * Multilingual FAQ service (EN / SW / ZH / FR).
 *
 * The admin settings panel persists every translation to the database so the
 * answers survive across sessions.
 */

/** The four languages the platform ships FAQ content in. */
export const FAQ_LANGUAGES = ['en', 'sw', 'zh', 'fr'];

/**
 * Fetch the FAQ list.
 *
 * @param {object} [options]
 * @param {string} [options.lang] when provided the response also carries a
 *                              flattened `answer` field for that language
 */
export const getFaqs = async ({ lang } = {}) => {
  const response = await api.get('/faqs', {
    params: lang ? { lang } : undefined,
  });

  return response.data?.data || [];
};

/**
 * Create a new multilingual FAQ entry (admin only).
 *
 * @param {object} payload
 * @param {string} payload.question
 * @param {object} payload.answers  { en, sw, zh, fr }
 */
export const createFaq = async (payload) => {
  const response = await api.post('/faqs', {
    question: payload.question,
    answers: payload.answers,
    ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
  });

  return response.data?.data || response.data;
};

/**
 * Update a FAQ entry (admin only).
 *
 * @param {string} id
 * @param {object} payload
 * @param {string} [payload.question]
 * @param {object} [payload.answers] { en, sw, zh, fr }
 */
export const updateFaq = async (id, payload) => {
  const response = await api.put(`/faqs/${id}`, {
    ...(payload.question !== undefined ? { question: payload.question } : {}),
    ...(payload.answers !== undefined ? { answers: payload.answers } : {}),
    ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
    ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
  });

  return response.data?.data || response.data;
};

/**
 * Delete a FAQ entry (admin only).
 */
export const deleteFaq = async (id) => {
  const response = await api.delete(`/faqs/${id}`);
  return response.data;
};
