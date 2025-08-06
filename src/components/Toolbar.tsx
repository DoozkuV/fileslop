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
    <div className="toolbar">
      <div className="toolbar-section toolbar-navigation">
        <button
          className="toolbar-button"
          onClick={onNavigateBack}
          disabled={!canGoBack}
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          className="toolbar-button"
          onClick={onNavigateForward}
          disabled={!canGoForward}
          title="Go forward"
          aria-label="Go forward"
        >
          <ArrowRight size={20} />
        </button>
        <button
          className="toolbar-button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          aria-label="Refresh"
        >
          <RotateCcw size={20} className={isLoading ? 'spinning' : ''} />
        </button>
        <button
          className="toolbar-button"
          onClick={onNavigateHome}
          title="Go to root"
          aria-label="Go to root directory"
        >
          <Home size={20} />
        </button>
      </div>

      <div className="toolbar-section toolbar-path">
        <div className="path-display">
          <span className="path-text" title={currentPath}>
            {currentPath}
          </span>
        </div>
      </div>

      <div className="toolbar-section toolbar-actions">
        <div className="toolbar-group">
          <button
            className="toolbar-button dropdown-button"
            title="Create new"
            aria-label="Create new item"
          >
            <Plus size={20} />
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={onCreateDirectory}
              >
                <FolderPlus size={16} />
                New Folder
              </button>
              <button
                className="dropdown-item"
                onClick={onCreateFile}
              >
                <FilePlus size={16} />
                New File
              </button>
            </div>
          </button>
        </div>

        <div className="toolbar-group">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search files"
            />
          </div>
        </div>

        <div className="toolbar-group">
          <button
            className={`toolbar-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List view"
            aria-label="Switch to list view"
          >
            <List size={20} />
          </button>
          <button
            className={`toolbar-button ${viewMode === 'grid' ? 'active' : ''}`}
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
