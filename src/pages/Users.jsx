import { useTranslation } from 'react-i18next';

export default function Users() {
  // Every label on the page follows the active language.
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">{t('common.userManagement')}</h1>
      <p className="text-neutral-400">{t('users.subtitle')}</p>
    </div>
  );
}
