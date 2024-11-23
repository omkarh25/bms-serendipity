"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

type Role = "CA" | "Budget Analyst" | "Owner" | "Calendar";

interface NavigationProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

/**
 * Navigation component with keyboard shortcuts
 * Implements Single Responsibility Principle by handling only navigation and shortcuts
 */
export const Navigation = ({ selectedRole, onRoleChange }: NavigationProps) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts mapping
  const shortcuts = {
    'Alt + O': 'Owner View',
    'Alt + C': 'CA View',
    'Alt + B': 'Budget Analyst View',
    'Alt + L': 'Calendar View',
    '?': 'Show/Hide Shortcuts',
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Log keyboard event for debugging
      console.log('Keyboard shortcut detected:', e.key, e.altKey);

      if (e.key === '?' && !e.altKey) {
        setShowShortcuts(prev => !prev);
        return;
      }

      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'o':
            e.preventDefault();
            onRoleChange('Owner');
            toast.success('Switched to Owner View');
            break;
          case 'c':
            e.preventDefault();
            onRoleChange('CA');
            toast.success('Switched to CA View');
            break;
          case 'b':
            e.preventDefault();
            onRoleChange('Budget Analyst');
            toast.success('Switched to Budget Analyst View');
            break;
          case 'l':
            e.preventDefault();
            onRoleChange('Calendar');
            toast.success('Switched to Calendar View');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRoleChange]);

  return (
    <div className="relative">
      <nav className="bg-white shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => onRoleChange('Owner')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  selectedRole === 'Owner'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Owner <span className="ml-2 text-xs text-gray-400">Alt+O</span>
              </button>

              <button
                onClick={() => onRoleChange('CA')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  selectedRole === 'CA'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                CA <span className="ml-2 text-xs text-gray-400">Alt+C</span>
              </button>

              <button
                onClick={() => onRoleChange('Budget Analyst')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  selectedRole === 'Budget Analyst'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Budget Analyst <span className="ml-2 text-xs text-gray-400">Alt+B</span>
              </button>

              <button
                onClick={() => onRoleChange('Calendar')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  selectedRole === 'Calendar'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Calendar <span className="ml-2 text-xs text-gray-400">Alt+L</span>
              </button>
            </div>

            <button
              onClick={() => setShowShortcuts(prev => !prev)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ? <span className="ml-2">Shortcuts</span>
            </button>
          </div>
        </div>
      </nav>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2">
              {Object.entries(shortcuts).map(([key, description]) => (
                <div key={key} className="flex justify-between">
                  <kbd className="px-2 py-1 bg-gray-100 rounded">{key}</kbd>
                  <span>{description}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 w-full bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
