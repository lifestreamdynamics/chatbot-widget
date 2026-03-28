import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Trash, Download, Sun, Moon } from '../utils/icons';

interface ChatMenuProps {
  onClearHistory: () => void;
  onExportChat: (format: 'json' | 'text') => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function ChatMenu({ onClearHistory, onExportChat, themeMode, onToggleTheme }: ChatMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen]);

  const handleClearHistory = () => {
    onClearHistory();
    setIsOpen(false);
  };

  const handleExportJson = () => {
    onExportChat('json');
    setIsOpen(false);
  };

  const handleExportText = () => {
    onExportChat('text');
    setIsOpen(false);
  };

  const handleToggleTheme = () => {
    onToggleTheme();
    setIsOpen(false);
  };

  return (
    <div className="chatbot-menu-container" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-menu-btn"
        aria-label="Chat menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
        data-testid="chatbot-menu-button"
      >
        <MoreVertical className="chatbot-menu-icon" />
      </button>
      {isOpen && (
        <div
          className="chatbot-menu-dropdown"
          role="menu"
          data-testid="chatbot-menu-dropdown"
        >
          <button
            onClick={handleToggleTheme}
            className="chatbot-menu-item"
            role="menuitem"
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            data-testid="chatbot-menu-theme-toggle"
          >
            {themeMode === 'dark' ? (
              <Sun className="chatbot-menu-item-icon" />
            ) : (
              <Moon className="chatbot-menu-item-icon" />
            )}
            <span>{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="chatbot-menu-separator" role="separator" />
          <button
            onClick={handleClearHistory}
            className="chatbot-menu-item"
            role="menuitem"
            data-testid="chatbot-menu-clear-history"
          >
            <Trash className="chatbot-menu-item-icon" />
            <span>Clear History</span>
          </button>
          <button
            onClick={handleExportJson}
            className="chatbot-menu-item"
            role="menuitem"
            data-testid="chatbot-menu-export-json"
          >
            <Download className="chatbot-menu-item-icon" />
            <span>Export as JSON</span>
          </button>
          <button
            onClick={handleExportText}
            className="chatbot-menu-item"
            role="menuitem"
            data-testid="chatbot-menu-export-text"
          >
            <Download className="chatbot-menu-item-icon" />
            <span>Export as Text</span>
          </button>
        </div>
      )}
    </div>
  );
}
