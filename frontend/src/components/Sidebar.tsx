"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  TableCellsIcon, 
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

/**
 * Sidebar component for main navigation
 * Implements Single Responsibility Principle by handling only navigation
 */
export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      shortcut: 'Alt+H'
    },
    {
      name: 'Model',
      href: '/model',
      icon: TableCellsIcon,
      shortcut: 'Alt+M'
    },
    {
      name: 'View',
      href: '/view',
      icon: ChartBarIcon,
      shortcut: 'Alt+V'
    },
    {
      name: 'Controller',
      href: '/controller',
      icon: Cog6ToothIcon,
      shortcut: 'Alt+C'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: CalendarIcon,
      shortcut: 'Alt+L'
    }
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'h':
          window.location.href = '/';
          break;
        case 'm':
          window.location.href = '/model';
          break;
        case 'v':
          window.location.href = '/view';
          break;
        case 'c':
          window.location.href = '/controller';
          break;
        case 'l':
          window.location.href = '/calendar';
          break;
      }
    }
  };

  // Add keyboard event listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } fixed left-0 h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out z-50`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between"
          >
            {!isCollapsed && <span className="font-bold text-lg">BMS</span>}
            <svg
              className={`w-6 h-6 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="px-2 py-1">
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {!isCollapsed && (
                      <div className="ml-3 flex justify-between items-center w-full">
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-400">{item.shortcut}</span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          {!isCollapsed && (
            <div className="text-xs text-gray-400">
              Press ? for keyboard shortcuts
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
