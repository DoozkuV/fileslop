export interface FileSystemItem {
  name: string;
  kind: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  handle?: FileSystemHandle;
  path: string;
  parentPath?: string;
}

export interface FileOperationClipboard {
  operation: 'copy' | 'cut';
  items: FileSystemItem[];
}

export interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export interface FileSystemState {
  currentPath: string;
  items: FileSystemItem[];
  selectedItems: Set<string>;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;
  clipboard: FileOperationClipboard | null;
  bookmarks: Bookmark[];
  searchQuery: string;
  viewMode: 'list' | 'grid';
}