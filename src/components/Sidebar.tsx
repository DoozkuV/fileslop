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
    <div className="w-60 bg-primary-50 border-r border-primary-200 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-primary-200">
        <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="flex flex-col gap-1">
          {defaultBookmarks.map((bookmark) => (
            <button
              key={bookmark.path}
              className={`flex items-center gap-2 px-3 py-2 border border-transparent rounded-md cursor-pointer transition-all text-left text-sm ${
                currentPath === bookmark.path
                  ? 'bg-accent-100 border-accent-400 text-accent-600'
                  : 'bg-transparent text-primary-900 hover:bg-primary-100 hover:border-primary-300'
              }`}
              onClick={() => onNavigate(bookmark.path)}
              title={bookmark.path}
            >
              <span className="flex-shrink-0">{bookmark.icon}</span>
              <span className="flex-1 min-w-0 truncate">{bookmark.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-primary-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Bookmarks</h3>
          <button
            className="flex items-center justify-center w-6 h-6 border-none rounded bg-transparent text-primary-400 cursor-pointer transition-all hover:bg-primary-100 hover:text-accent-600"
            onClick={handleAddCurrentBookmark}
            title="Bookmark current folder"
            aria-label="Add bookmark"
          >
            <Star size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {bookmarks.length === 0 ? (
            <div className="p-4 text-center text-primary-400">
              <p className="text-sm mb-2">No bookmarks yet</p>
              <small className="text-xs leading-snug block">Click the star to bookmark the current folder</small>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`group flex items-center border border-transparent rounded-md cursor-pointer transition-all relative ${
                  currentPath === bookmark.path
                    ? 'bg-accent-100 border-accent-400 text-accent-600'
                    : 'bg-transparent text-primary-900 hover:bg-primary-100 hover:border-primary-300'
                }`}
              >
                <button
                  className="flex items-center gap-2 px-3 py-2 border-none bg-transparent cursor-pointer flex-1 text-left text-sm"
                  onClick={() => onNavigate(bookmark.path)}
                  title={bookmark.path}
                >
                  <span className="flex-shrink-0">
                    {bookmark.icon || '📁'}
                  </span>
                  <span className="flex-1 min-w-0 truncate">{bookmark.name}</span>
                </button>
                <button
                  className="hidden group-hover:flex items-center justify-center w-6 h-6 border-none rounded bg-transparent text-primary-400 cursor-pointer mr-2 transition-all hover:bg-red-500 hover:text-white"
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

      <div className="p-4">
        <h3 className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-3">Settings</h3>
        <button className="flex items-center gap-2 px-3 py-2 border border-transparent rounded-md bg-transparent text-primary-900 cursor-pointer transition-all text-left text-sm hover:bg-primary-100 hover:border-primary-300 w-full">
          <Settings size={16} className="flex-shrink-0" />
          <span className="flex-1 min-w-0 truncate">Preferences</span>
        </button>
      </div>
    </div>
  );
}