import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiList, FiSettings } from 'react-icons/fi';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: '/', icon: FiHome, label: 'Dashboard' },
    { to: '/tasks', icon: FiList, label: 'Tasks' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">TaskMaster</h1>
      </div>
      <nav className="mt-8">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              location.pathname === to ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}