import { ChevronRight, Store } from 'lucide-react';
import { hualinkCategories, CATEGORY_ICONS } from '../data/categories';

const resolveIcon = (name) => CATEGORY_ICONS[name] || Store;

export default function CategoryMegaMenu({
  activeDepartmentId = hualinkCategories[0]?.id,
  onDepartmentChange = () => {},
  onSubcategorySelect = () => {},
  onActivateDepartment = () => {},
  onDepartmentActivate = undefined,
} = {}) {
  const departments = Array.isArray(hualinkCategories) ? hualinkCategories : [];
  const activeId = departments.find((d) => d.id === activeDepartmentId)?.id
    ? activeDepartmentId
    : departments[0]?.id;

  const activeDepartment = departments.find((d) => d.id === activeId) || departments[0];

  if (!activeDepartment) return null;

  const handleActivate = (deptId) => {
    onDepartmentChange?.(deptId);
    onActivateDepartment?.(deptId);
    if (typeof onDepartmentActivate === 'function') {
      onDepartmentActivate(deptId);
    }
  };

  const handleSelect = (sub) => {
    onSubcategorySelect(sub);
  };

  return (
    <div
      role="menu"
      aria-label="All product categories"
      className="category-mega-menu absolute left-0 top-full mt-2 z-[60] w-[640px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex"
    >
      <div className="w-48 sm:w-56 shrink-0 bg-gray-50 border-r border-gray-200 py-2">
        {departments.map((dept) => {
          const isActive = dept.id === activeDepartment.id;
          return (
            <button
              key={dept.id}
              type="button"
              role="menuitem"
              onMouseEnter={() => handleActivate(dept.id)}
              onClick={() => handleActivate(dept.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-[#E50914] text-white'
                  : 'text-gray-800 hover:bg-white hover:text-gray-900'
              }`}
            >
              <span className="truncate">{dept.name}</span>
              <ChevronRight size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-5">
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            {activeDepartment.name}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeDepartment.subcategories.map((sub) => {
            const Icon = resolveIcon(sub.icon);
            return (
              <button
                key={sub.slug}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(sub)}
                className="mega-subcategory flex items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5 text-left transition-all hover:border-[#E50914] hover:bg-red-50/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[#E50914]">
                  <Icon size={16} />
                </span>
                <span className="text-xs font-semibold text-gray-800 leading-tight">{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
