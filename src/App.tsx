import React, { useState, useCallback, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { FileList } from './components/FileList';
import { ContextMenu } from './components/ContextMenu';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfirmDialog, PromptDialog, AlertDialog } from './components/Modal';
import { useFileSystem } from './hooks/useFileSystem';
import { useDragDrop } from './hooks/useDragDrop';
import { useModal } from './hooks/useModal';
import { FileSystemItem } from './types/fileSystem';
import { fileSystemAPI } from './utils/fileSystemAPI';
import { FolderOpen, AlertCircle } from 'lucide-react';

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
  const modal = useModal();

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
          modal.showConfirm({
            title: 'Delete Items',
            message: `Are you sure you want to delete ${itemsToDelete.length} item(s)? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
            onConfirm: () => deleteItems(itemsToDelete)
          });
        }
        break;
      case 'F2':
        if (selectedItems.size === 1) {
          const item = items.find(item => selectedItems.has(item.path));
          if (item) {
            modal.showPrompt({
              title: 'Rename Item',
              message: `Enter a new name for "${item.name}":`,
              defaultValue: item.name,
              placeholder: 'Enter new name...',
              confirmText: 'Rename',
              cancelText: 'Cancel',
              onConfirm: (newName) => {
                if (newName && newName !== item.name) {
                  renameItem(item, newName);
                }
              }
            });
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
      modal.showPrompt({
        title: 'Create Folder',
        message: 'Enter the name for the new folder:',
        placeholder: 'Folder name...',
        confirmText: 'Create',
        cancelText: 'Cancel',
        onConfirm: (name) => {
          if (name) {
            createDirectory(name);
          }
        }
      });
    }

    if (e.ctrlKey && e.altKey && e.key === 'N') {
      e.preventDefault();
      modal.showPrompt({
        title: 'Create File',
        message: 'Enter the name for the new file:',
        placeholder: 'File name...',
        confirmText: 'Create',
        cancelText: 'Cancel',
        onConfirm: (name) => {
          if (name) {
            createFile(name);
          }
        }
      });
    }
  }, [selectedItems, items, deleteItems, renameItem, refresh, clearSelection, selectAll, copyItems, cutItems, hasClipboard, pasteItems, createDirectory, createFile, modal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCreateDirectory = () => {
    modal.showPrompt({
      title: 'Create Folder',
      message: 'Enter the name for the new folder:',
      placeholder: 'Folder name...',
      confirmText: 'Create',
      cancelText: 'Cancel',
      onConfirm: (name) => {
        if (name) {
          createDirectory(name);
        }
      }
    });
  };

  const handleCreateFile = () => {
    modal.showPrompt({
      title: 'Create File',
      message: 'Enter the name for the new file:',
      placeholder: 'File name...',
      confirmText: 'Create',
      cancelText: 'Cancel',
      onConfirm: (name) => {
        if (name) {
          createFile(name);
        }
      }
    });
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
          modal.showConfirm({
            title: 'Delete Item',
            message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
            onConfirm: () => deleteItems([item])
          });
        } else if (selectedItems.size > 0) {
          const itemsToDelete = items.filter(i => selectedItems.has(i.path));
          modal.showConfirm({
            title: 'Delete Items',
            message: `Are you sure you want to delete ${itemsToDelete.length} item(s)? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
            onConfirm: () => deleteItems(itemsToDelete)
          });
        }
        break;
      case 'rename':
        if (item) {
          modal.showPrompt({
            title: 'Rename Item',
            message: `Enter a new name for "${item.name}":`,
            defaultValue: item.name,
            placeholder: 'Enter new name...',
            confirmText: 'Rename',
            cancelText: 'Cancel',
            onConfirm: (newName) => {
              if (newName && newName !== item.name) {
                renameItem(item, newName);
              }
            }
          });
        }
        break;
      case 'addBookmark':
        if (item && item.kind === 'directory') {
          modal.showPrompt({
            title: 'Add Bookmark',
            message: `Enter a name for the bookmark:`,
            defaultValue: item.name,
            placeholder: 'Bookmark name...',
            confirmText: 'Add',
            cancelText: 'Cancel',
            onConfirm: (name) => {
              if (name) {
                addBookmark({
                  name,
                  path: item.path,
                  icon: '📁'
                });
              }
            }
          });
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
        <div className="flex flex-col h-screen bg-white">
          <div className="flex items-center justify-center h-screen p-8 bg-gradient-to-br from-white to-primary-50">
            <div className="max-w-lg text-center bg-white p-12 rounded-xl shadow-lg border border-primary-200">
              <FolderOpen size={64} className="text-accent-400 mb-6 mx-auto" />
              <h1 className="text-3xl font-semibold mb-4 text-primary-900">Fileslop</h1>
              <p className="text-primary-600 leading-relaxed mb-8">
                This application allows you to browse and manage files using your browser.
                Click the button below to select a folder to explore.
              </p>
              
              <button
                className="bg-accent-400 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors mb-8"
                onClick={handleRequestAccess}
                disabled={isLoading}
              >
                {isLoading ? 'Opening...' : 'Choose Folder'}
              </button>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg mb-8 text-sm">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="text-left mt-8 pt-8 border-t border-primary-200">
                <h3 className="font-semibold text-primary-900 mb-4">Features</h3>
                <ul className="text-primary-600 space-y-2 mb-6 pl-6 list-disc">
                  <li>Browse files and folders</li>
                  <li>Copy, cut, paste, and delete files</li>
                  <li>Create new files and folders</li>
                  <li>Bookmark frequently used directories</li>
                  <li>Search functionality</li>
                  <li>Grid and list view modes</li>
                  <li>Drag and drop support</li>
                  <li>Image thumbnails</li>
                </ul>
                
                <p className="text-sm text-primary-400 italic">
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
      <div className="flex flex-col h-screen bg-white">
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

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            bookmarks={bookmarks}
            currentPath={currentPath}
            onNavigate={navigateTo}
            onAddBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
            onShowPrompt={modal.showPrompt}
          />

          <main className="flex-1 flex flex-col overflow-hidden relative">
            {isLoading && <LoadingSpinner text="Loading files..." />}
            
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-200 text-red-600 text-sm">
                <AlertCircle size={20} />
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-100 rounded text-lg"
                >
                  ×
                </button>
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

        <ConfirmDialog
          isOpen={modal.modals.confirm.isOpen}
          onClose={modal.hideConfirm}
          onConfirm={modal.modals.confirm.onConfirm}
          title={modal.modals.confirm.title}
          message={modal.modals.confirm.message}
          confirmText={modal.modals.confirm.confirmText}
          cancelText={modal.modals.confirm.cancelText}
          variant={modal.modals.confirm.variant}
        />

        <PromptDialog
          isOpen={modal.modals.prompt.isOpen}
          onClose={modal.hidePrompt}
          onConfirm={modal.modals.prompt.onConfirm}
          title={modal.modals.prompt.title}
          message={modal.modals.prompt.message}
          placeholder={modal.modals.prompt.placeholder}
          defaultValue={modal.modals.prompt.defaultValue}
          confirmText={modal.modals.prompt.confirmText}
          cancelText={modal.modals.prompt.cancelText}
        />

        <AlertDialog
          isOpen={modal.modals.alert.isOpen}
          onClose={modal.hideAlert}
          title={modal.modals.alert.title}
          message={modal.modals.alert.message}
          variant={modal.modals.alert.variant}
          buttonText={modal.modals.alert.buttonText}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;