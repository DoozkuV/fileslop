import { useState, useCallback, useEffect } from 'react';
import { FileSystemState, FileSystemItem, FileOperationClipboard, Bookmark } from '../types/fileSystem';
import { fileSystemAPI } from '../utils/fileSystemAPI';

const BOOKMARKS_STORAGE_KEY = 'file-explorer-bookmarks';

const initialState: FileSystemState = {
  currentPath: '/',
  items: [],
  selectedItems: new Set(),
  history: ['/'],
  historyIndex: 0,
  isLoading: false,
  error: null,
  clipboard: null,
  bookmarks: [],
  searchQuery: '',
  viewMode: 'list'
};

export function useFileSystem() {
  const [state, setState] = useState<FileSystemState>(initialState);

  const loadBookmarks = useCallback(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) {
        const bookmarks = JSON.parse(saved);
        setState(prev => ({ ...prev, bookmarks }));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }, []);

  const saveBookmarks = useCallback((bookmarks: Bookmark[]) => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const requestAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await fileSystemAPI.requestDirectoryAccess();
      const items = await fileSystemAPI.navigateToPath('/');
      setState(prev => ({
        ...prev,
        items,
        currentPath: '/',
        history: ['/'],
        historyIndex: 0
      }));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateTo = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const items = await fileSystemAPI.navigateToPath(path);
      
      setState(prev => {
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push(path);
        
        return {
          ...prev,
          items,
          currentPath: path,
          selectedItems: new Set(),
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateBack = useCallback(async () => {
    if (state.historyIndex > 0) {
      const previousPath = state.history[state.historyIndex - 1];
      try {
        setLoading(true);
        setError(null);
        const items = await fileSystemAPI.navigateToPath(previousPath);
        
        setState(prev => ({
          ...prev,
          items,
          currentPath: previousPath,
          selectedItems: new Set(),
          historyIndex: prev.historyIndex - 1
        }));
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [state.historyIndex, state.history]);

  const navigateForward = useCallback(async () => {
    if (state.historyIndex < state.history.length - 1) {
      const nextPath = state.history[state.historyIndex + 1];
      try {
        setLoading(true);
        setError(null);
        const items = await fileSystemAPI.navigateToPath(nextPath);
        
        setState(prev => ({
          ...prev,
          items,
          currentPath: nextPath,
          selectedItems: new Set(),
          historyIndex: prev.historyIndex + 1
        }));
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [state.historyIndex, state.history]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await fileSystemAPI.navigateToPath(state.currentPath);
      setState(prev => ({ ...prev, items, selectedItems: new Set() }));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [state.currentPath]);

  const selectItem = useCallback((path: string, multi = false) => {
    setState(prev => {
      const newSelected = new Set(multi ? prev.selectedItems : []);
      
      if (newSelected.has(path)) {
        newSelected.delete(path);
      } else {
        newSelected.add(path);
      }
      
      return { ...prev, selectedItems: newSelected };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItems: new Set(prev.items.map(item => item.path))
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItems: new Set() }));
  }, []);

  const copyItems = useCallback((items: FileSystemItem[]) => {
    setState(prev => ({
      ...prev,
      clipboard: { operation: 'copy', items }
    }));
  }, []);

  const cutItems = useCallback((items: FileSystemItem[]) => {
    setState(prev => ({
      ...prev,
      clipboard: { operation: 'cut', items }
    }));
  }, []);

  const pasteItems = useCallback(async () => {
    if (!state.clipboard) return;

    try {
      setLoading(true);
      setError(null);

      for (const item of state.clipboard.items) {
        if (state.clipboard.operation === 'copy') {
          await fileSystemAPI.copyItem(item, state.currentPath);
        } else {
          await fileSystemAPI.moveItem(item, state.currentPath);
        }
      }

      if (state.clipboard.operation === 'cut') {
        setState(prev => ({ ...prev, clipboard: null }));
      }

      await refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [state.clipboard, state.currentPath, refresh]);

  const deleteItems = useCallback(async (items: FileSystemItem[]) => {
    try {
      setLoading(true);
      setError(null);

      for (const item of items) {
        await fileSystemAPI.deleteItem(item);
      }

      await refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const renameItem = useCallback(async (item: FileSystemItem, newName: string) => {
    try {
      setLoading(true);
      setError(null);
      await fileSystemAPI.renameItem(item, newName);
      await refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const createDirectory = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      await fileSystemAPI.createDirectory(state.currentPath, name);
      await refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [state.currentPath, refresh]);

  const createFile = useCallback(async (name: string, content = '') => {
    try {
      setLoading(true);
      setError(null);
      await fileSystemAPI.createFile(state.currentPath, name, content);
      await refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [state.currentPath, refresh]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString()
    };
    
    setState(prev => {
      const newBookmarks = [...prev.bookmarks, newBookmark];
      saveBookmarks(newBookmarks);
      return { ...prev, bookmarks: newBookmarks };
    });
  }, [saveBookmarks]);

  const removeBookmark = useCallback((id: string) => {
    setState(prev => {
      const newBookmarks = prev.bookmarks.filter(b => b.id !== id);
      saveBookmarks(newBookmarks);
      return { ...prev, bookmarks: newBookmarks };
    });
  }, [saveBookmarks]);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setViewMode = useCallback((mode: 'list' | 'grid') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const getFilteredItems = useCallback(() => {
    if (!state.searchQuery) return state.items;
    
    const query = state.searchQuery.toLowerCase();
    return state.items.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }, [state.items, state.searchQuery]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    ...state,
    filteredItems: getFilteredItems(),
    canGoBack: state.historyIndex > 0,
    canGoForward: state.historyIndex < state.history.length - 1,
    hasClipboard: !!state.clipboard,
    
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
  };
}