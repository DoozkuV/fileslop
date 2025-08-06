import React from 'react';
import { Star, Trash2, Settings } from 'lucide-react';
import { Bookmark } from '../types/fileSystem';

interface SidebarProps {
  bookmarks: Bookmark[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onAddBookmark: (bookmark: Omit<Bookmark, 'id'>) => void;
  onRemoveBookmark: (id: string) => void;
  onShowPrompt: (options: {
    title: string;
    message: string;
    onConfirm: (value: string) => void;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
  }) => void;
}

export function Sidebar({
  bookmarks,
  currentPath,
  onNavigate,
  onAddBookmark,
  onRemoveBookmark,
  onShowPrompt
}: SidebarProps) {
  const defaultBookmarks = [
    { name: 'Root', path: '/', icon: '🏠' }
  ];

  const handleAddCurrentBookmark = () => {
    const folderName = currentPath === '/' ? 'Root' : currentPath.split('/').pop() || 'Folder';
    onShowPrompt({
      title: 'Add Bookmark',
      message: `Enter a name for this bookmark:`,
      defaultValue: folderName,
      placeholder: 'Bookmark name...',
      confirmText: 'Add',
      cancelText: 'Cancel',
      onConfirm: (name) => {
        if (name?.trim()) {
          onAddBookmark({
            name: name.trim(),
            path: currentPath,
            icon: '📁'
          });
        }
      }
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Access</h3>
        <div className="bookmark-list">
          {defaultBookmarks.map((bookmark) => (
            <button
              key={bookmark.path}
              className={`bookmark-item ${currentPath === bookmark.path ? 'active' : ''}`}
              onClick={() => onNavigate(bookmark.path)}
              title={bookmark.path}
            >
              <span className="bookmark-icon">{bookmark.icon}</span>
              <span className="bookmark-name">{bookmark.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Bookmarks</h3>
          <button
            className="sidebar-action"
            onClick={handleAddCurrentBookmark}
            title="Bookmark current folder"
            aria-label="Add bookmark"
          >
            <Star size={16} />
          </button>
        </div>
        <div className="bookmark-list">
          {bookmarks.length === 0 ? (
            <div className="empty-bookmarks">
              <p>No bookmarks yet</p>
              <small>Click the star to bookmark the current folder</small>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`bookmark-item ${currentPath === bookmark.path ? 'active' : ''}`}
              >
                <button
                  className="bookmark-button"
                  onClick={() => onNavigate(bookmark.path)}
                  title={bookmark.path}
                >
                  <span className="bookmark-icon">
                    {bookmark.icon || '📁'}
                  </span>
                  <span className="bookmark-name">{bookmark.name}</span>
                </button>
                <button
                  className="bookmark-remove"
                  onClick={() => onRemoveBookmark(bookmark.id)}
                  title="Remove bookmark"
                  aria-label="Remove bookmark"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Settings</h3>
        <button className="bookmark-item">
          <Settings size={16} className="bookmark-icon" />
          <span className="bookmark-name">Preferences</span>
        </button>
      </div>
    </div>
  );
}