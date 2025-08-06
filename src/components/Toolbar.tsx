import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Grid3x3, List, Plus, FolderPlus, FilePlus } from 'lucide-react';

interface ToolbarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  searchQuery: string;
  viewMode: 'list' | 'grid';
  isLoading: boolean;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onNavigateHome: () => void;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onCreateDirectory: () => void;
  onCreateFile: () => void;
}

export function Toolbar({
  currentPath,
  canGoBack,
  canGoForward,
  searchQuery,
  viewMode,
  isLoading,
  onNavigateBack,
  onNavigateForward,
  onNavigateHome,
  onRefresh,
  onSearchChange,
  onViewModeChange,
  onCreateDirectory,
  onCreateFile
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-primary-50 border-b border-primary-200 flex-shrink-0">
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 border border-transparent rounded-md bg-transparent text-primary-900 cursor-pointer transition-all hover:bg-primary-100 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNavigateBack}
          disabled={!canGoBack}
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 border border-transparent rounded-md bg-transparent text-primary-900 cursor-pointer transition-all hover:bg-primary-100 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNavigateForward}
          disabled={!canGoForward}
          title="Go forward"
          aria-label="Go forward"
        >
          <ArrowRight size={20} />
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 border border-transparent rounded-md bg-transparent text-primary-900 cursor-pointer transition-all hover:bg-primary-100 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          aria-label="Refresh"
        >
          <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 border border-transparent rounded-md bg-transparent text-primary-900 cursor-pointer transition-all hover:bg-primary-100 hover:border-primary-300"
          onClick={onNavigateHome}
          title="Go to root"
          aria-label="Go to root directory"
        >
          <Home size={20} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white border border-primary-200 rounded-md px-3 py-2 min-w-48">
          <span className="text-primary-600 text-sm truncate block" title={currentPath}>
            {currentPath}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative group">
          <button
            className="flex items-center justify-center w-9 h-9 border border-transparent rounded-md bg-transparent text-primary-900 cursor-pointer transition-all hover:bg-primary-100 hover:border-primary-300"
            title="Create new"
            aria-label="Create new item"
          >
            <Plus size={20} />
          </button>
          <div className="absolute top-full left-0 bg-white border border-primary-200 rounded-lg shadow-lg min-w-36 z-50 hidden group-hover:block group-focus-within:block">
            <button
              className="flex items-center gap-2 w-full px-3 py-2 border-none bg-transparent text-primary-900 cursor-pointer text-left text-sm transition-colors hover:bg-primary-50 first:rounded-t-lg"
              onClick={onCreateDirectory}
            >
              <FolderPlus size={16} />
              New Folder
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 border-none bg-transparent text-primary-900 cursor-pointer text-left text-sm transition-colors hover:bg-primary-50 last:rounded-b-lg"
              onClick={onCreateFile}
            >
              <FilePlus size={16} />
              New File
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-primary-400 z-10" />
            <input
              type="text"
              className="pl-9 pr-3 py-2 border border-primary-200 rounded-md bg-white text-primary-900 text-sm w-48 transition-colors focus:outline-none focus:border-accent-400 placeholder:text-primary-400"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search files"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={`flex items-center justify-center w-9 h-9 border border-transparent rounded-md cursor-pointer transition-all ${
              viewMode === 'list' 
                ? 'bg-accent-100 border-accent-400 text-accent-600' 
                : 'bg-transparent text-primary-900 hover:bg-primary-100 hover:border-primary-300'
            }`}
            onClick={() => onViewModeChange('list')}
            title="List view"
            aria-label="Switch to list view"
          >
            <List size={20} />
          </button>
          <button
            className={`flex items-center justify-center w-9 h-9 border border-transparent rounded-md cursor-pointer transition-all ${
              viewMode === 'grid' 
                ? 'bg-accent-100 border-accent-400 text-accent-600' 
                : 'bg-transparent text-primary-900 hover:bg-primary-100 hover:border-primary-300'
            }`}
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            aria-label="Switch to grid view"
          >
            <Grid3x3 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
