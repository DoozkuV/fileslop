import React, { useState, useCallback, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { FileList } from './components/FileList';
import { ContextMenu } from './components/ContextMenu';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useFileSystem } from './hooks/useFileSystem';
import { useDragDrop } from './hooks/useDragDrop';
import { FileSystemItem } from './types/fileSystem';
import { fileSystemAPI } from './utils/fileSystemAPI';
import { FolderOpen, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const {
    currentPath,
    items,
    filteredItems,
    selectedItems,
    isLoading,
    error,
    canGoBack,
    canGoForward,
    hasClipboard,
    searchQuery,
    viewMode,
    bookmarks,
    requestAccess,
    navigateTo,
    navigateBack,
    navigateForward,
    refresh,
    selectItem,
    selectAll,
    clearSelection,
    copyItems,
    cutItems,
    pasteItems,
    deleteItems,
    renameItem,
    createDirectory,
    createFile,
    addBookmark,
    removeBookmark,
    setSearchQuery,
    setViewMode,
    setError
  } = useFileSystem();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item?: FileSystemItem;
  } | null>(null);

  const [hasAccess, setHasAccess] = useState(false);

  const handleMoveItems = useCallback(async (items: FileSystemItem[], targetPath: string) => {
    try {
      setError(null);
      for (const item of items) {
        await fileSystemAPI.moveItem(item, targetPath);
      }
      await refresh();
    } catch (error) {
      setError(`Failed to move items: ${(error as Error).message}`);
    }
  }, [refresh, setError]);

  const dragDropState = useDragDrop(handleMoveItems);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await fileSystemAPI.isSupported();
      if (!supported) {
        setError('File System Access API is not supported in this browser. Please use Chrome or Edge.');
      }
    };
    checkSupport();
  }, [setError]);

  const handleRequestAccess = async () => {
    try {
      await requestAccess();
      setHasAccess(true);
    } catch (error) {
      console.error('Failed to request access:', error);
    }
  };

  const handleItemDoubleClick = useCallback(async (item: FileSystemItem) => {
    if (item.kind === 'directory') {
      await navigateTo(item.path);
    } else {
      try {
        const file = await fileSystemAPI.readFile(item);
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        setError(`Failed to open file: ${(error as Error).message}`);
      }
    }
  }, [navigateTo, setError]);

  const handleItemContextMenu = useCallback((e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  }, []);

  const handleBackgroundContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case 'Delete':
        if (selectedItems.size > 0) {
          const itemsToDelete = items.filter(item => selectedItems.has(item.path));
          if (window.confirm(`Delete ${itemsToDelete.length} item(s)?`)) {
            deleteItems(itemsToDelete);
          }
        }
        break;
      case 'F2':
        if (selectedItems.size === 1) {
          const item = items.find(item => selectedItems.has(item.path));
          if (item) {
            const newName = prompt('Rename to:', item.name);
            if (newName && newName !== item.name) {
              renameItem(item, newName);
            }
          }
        }
        break;
      case 'F5':
        e.preventDefault();
        refresh();
        break;
      case 'Escape':
        clearSelection();
        setContextMenu(null);
        break;
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          selectAll();
          break;
        case 'c':
          if (selectedItems.size > 0) {
            const itemsToCopy = items.filter(item => selectedItems.has(item.path));
            copyItems(itemsToCopy);
          }
          break;
        case 'x':
          if (selectedItems.size > 0) {
            const itemsToCut = items.filter(item => selectedItems.has(item.path));
            cutItems(itemsToCut);
          }
          break;
        case 'v':
          if (hasClipboard) {
            pasteItems();
          }
          break;
      }
    }

    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      const name = prompt('Folder name:');
      if (name) {
        createDirectory(name);
      }
    }

    if (e.ctrlKey && e.altKey && e.key === 'N') {
      e.preventDefault();
      const name = prompt('File name:');
      if (name) {
        createFile(name);
      }
    }
  }, [selectedItems, items, deleteItems, renameItem, refresh, clearSelection, selectAll, copyItems, cutItems, hasClipboard, pasteItems, createDirectory, createFile]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCreateDirectory = () => {
    const name = prompt('Folder name:');
    if (name) {
      createDirectory(name);
    }
  };

  const handleCreateFile = () => {
    const name = prompt('File name:');
    if (name) {
      createFile(name);
    }
  };

  const handleContextMenuAction = (action: string, item?: FileSystemItem) => {
    switch (action) {
      case 'open':
        if (item) handleItemDoubleClick(item);
        break;
      case 'copy':
        if (item) {
          copyItems([item]);
        } else if (selectedItems.size > 0) {
          const itemsToCopy = items.filter(i => selectedItems.has(i.path));
          copyItems(itemsToCopy);
        }
        break;
      case 'cut':
        if (item) {
          cutItems([item]);
        } else if (selectedItems.size > 0) {
          const itemsToCut = items.filter(i => selectedItems.has(i.path));
          cutItems(itemsToCut);
        }
        break;
      case 'paste':
        pasteItems();
        break;
      case 'delete':
        if (item) {
          if (window.confirm(`Delete ${item.name}?`)) {
            deleteItems([item]);
          }
        } else if (selectedItems.size > 0) {
          const itemsToDelete = items.filter(i => selectedItems.has(i.path));
          if (window.confirm(`Delete ${itemsToDelete.length} item(s)?`)) {
            deleteItems(itemsToDelete);
          }
        }
        break;
      case 'rename':
        if (item) {
          const newName = prompt('Rename to:', item.name);
          if (newName && newName !== item.name) {
            renameItem(item, newName);
          }
        }
        break;
      case 'addBookmark':
        if (item && item.kind === 'directory') {
          const name = prompt('Bookmark name:', item.name);
          if (name) {
            addBookmark({
              name,
              path: item.path,
              icon: '📁'
            });
          }
        }
        break;
      case 'createDirectory':
        handleCreateDirectory();
        break;
      case 'createFile':
        handleCreateFile();
        break;
    }
    setContextMenu(null);
  };

  const handleDragStart = useCallback((e: React.DragEvent, item: FileSystemItem) => {
    const draggedItems = selectedItems.has(item.path) 
      ? items.filter(i => selectedItems.has(i.path))
      : [item];
    
    dragDropState.handleDragStart(e, draggedItems);
  }, [selectedItems, items, dragDropState]);

  if (!hasAccess) {
    return (
      <ErrorBoundary>
        <div className="app">
          <div className="access-screen">
            <div className="access-content">
              <FolderOpen size={64} className="access-icon" />
              <h1>Browser File Explorer</h1>
              <p>
                This application allows you to browse and manage files using your browser.
                Click the button below to select a folder to explore.
              </p>
              
              <button
                className="access-button"
                onClick={handleRequestAccess}
                disabled={isLoading}
              >
                {isLoading ? 'Opening...' : 'Choose Folder'}
              </button>

              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="access-info">
                <h3>Features</h3>
                <ul>
                  <li>Browse files and folders</li>
                  <li>Copy, cut, paste, and delete files</li>
                  <li>Create new files and folders</li>
                  <li>Bookmark frequently used directories</li>
                  <li>Search functionality</li>
                  <li>Grid and list view modes</li>
                  <li>Drag and drop support</li>
                  <li>Image thumbnails</li>
                </ul>
                
                <p className="note">
                  <strong>Note:</strong> This application requires a modern browser with File System Access API support (Chrome or Edge recommended).
                </p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Toolbar
          currentPath={currentPath}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          searchQuery={searchQuery}
          viewMode={viewMode}
          isLoading={isLoading}
          onNavigateBack={navigateBack}
          onNavigateForward={navigateForward}
          onNavigateHome={() => navigateTo('/')}
          onRefresh={refresh}
          onSearchChange={setSearchQuery}
          onViewModeChange={setViewMode}
          onCreateDirectory={handleCreateDirectory}
          onCreateFile={handleCreateFile}
        />

        <div className="app-content">
          <Sidebar
            bookmarks={bookmarks}
            currentPath={currentPath}
            onNavigate={navigateTo}
            onAddBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
          />

          <main className="main-content">
            {isLoading && <LoadingSpinner text="Loading files..." />}
            
            {error && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            <FileList
              items={filteredItems}
              selectedItems={selectedItems}
              viewMode={viewMode}
              onItemSelect={selectItem}
              onItemDoubleClick={handleItemDoubleClick}
              onItemContextMenu={handleItemContextMenu}
              onItemRename={renameItem}
              onBackgroundClick={clearSelection}
              onBackgroundContextMenu={handleBackgroundContextMenu}
              dragState={dragDropState}
              onDragStart={handleDragStart}
              onDragEnd={dragDropState.handleDragEnd}
              onDragOver={dragDropState.handleDragOver}
              onDragLeave={dragDropState.handleDragLeave}
              onDrop={dragDropState.handleDrop}
              canDrop={dragDropState.canDrop}
            />
          </main>
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item}
            hasClipboard={hasClipboard}
            onClose={() => setContextMenu(null)}
            onCopy={() => handleContextMenuAction('copy', contextMenu.item)}
            onCut={() => handleContextMenuAction('cut', contextMenu.item)}
            onPaste={() => handleContextMenuAction('paste')}
            onDelete={() => handleContextMenuAction('delete', contextMenu.item)}
            onRename={() => handleContextMenuAction('rename', contextMenu.item)}
            onOpen={() => handleContextMenuAction('open', contextMenu.item)}
            onCreateDirectory={() => handleContextMenuAction('createDirectory')}
            onCreateFile={() => handleContextMenuAction('createFile')}
            onAddBookmark={() => handleContextMenuAction('addBookmark', contextMenu.item)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;