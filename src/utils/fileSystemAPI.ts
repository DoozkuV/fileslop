import { FileSystemItem } from '../types/fileSystem';

export class FileSystemAPI {
  private static _instance: FileSystemAPI;
  private rootHandle: FileSystemDirectoryHandle | null = null;

  static getInstance(): FileSystemAPI {
    if (!FileSystemAPI._instance) {
      FileSystemAPI._instance = new FileSystemAPI();
    }
    return FileSystemAPI._instance;
  }

  async isSupported(): Promise<boolean> {
    return 'showDirectoryPicker' in window;
  }

  async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API not supported');
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      this.rootHandle = dirHandle;
      return dirHandle;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('User cancelled directory selection');
      }
      throw error;
    }
  }

  async getDirectoryContents(
    dirHandle: FileSystemDirectoryHandle,
    path: string = '/'
  ): Promise<FileSystemItem[]> {
    const items: FileSystemItem[] = [];

    for await (const [name, handle] of (dirHandle as any).entries()) {
      const itemPath = path === '/' ? `/${name}` : `${path}/${name}`;
      
      if (handle.kind === 'file') {
        const file = await handle.getFile();
        items.push({
          name,
          kind: 'file',
          size: file.size,
          lastModified: new Date(file.lastModified),
          handle,
          path: itemPath,
          parentPath: path
        });
      } else {
        items.push({
          name,
          kind: 'directory',
          handle,
          path: itemPath,
          parentPath: path
        });
      }
    }

    return items.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }

  async navigateToPath(path: string): Promise<FileSystemItem[]> {
    if (!this.rootHandle) {
      throw new Error('No root directory selected');
    }

    if (path === '/') {
      return this.getDirectoryContents(this.rootHandle, '/');
    }

    const pathParts = path.split('/').filter(Boolean);
    let currentHandle = this.rootHandle;

    for (const part of pathParts) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      } catch (error) {
        throw new Error(`Directory not found: ${part}`);
      }
    }

    return this.getDirectoryContents(currentHandle, path);
  }

  async createDirectory(parentPath: string, name: string): Promise<void> {
    const parentHandle = await this.getDirectoryHandle(parentPath);
    await parentHandle.getDirectoryHandle(name, { create: true });
  }

  async createFile(parentPath: string, name: string, content: string = ''): Promise<void> {
    const parentHandle = await this.getDirectoryHandle(parentPath);
    const fileHandle = await parentHandle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async deleteItem(item: FileSystemItem): Promise<void> {
    if (!item.parentPath) {
      throw new Error('Cannot delete root directory');
    }

    const parentHandle = await this.getDirectoryHandle(item.parentPath);
    await parentHandle.removeEntry(item.name, { recursive: item.kind === 'directory' });
  }

  async copyItem(item: FileSystemItem, targetPath: string): Promise<void> {
    if (item.kind === 'file') {
      await this.copyFile(item, targetPath);
    } else {
      await this.copyDirectory(item, targetPath);
    }
  }

  async moveItem(item: FileSystemItem, targetPath: string): Promise<void> {
    await this.copyItem(item, targetPath);
    await this.deleteItem(item);
  }

  async renameItem(item: FileSystemItem, newName: string): Promise<void> {
    if (!item.parentPath) {
      throw new Error('Cannot rename root directory');
    }

    await this.copyItem(item, item.parentPath);
    
    const parentHandle = await this.getDirectoryHandle(item.parentPath);
    const tempHandle = await parentHandle.getFileHandle(`__temp_${Date.now()}_${newName}`);
    
    await this.deleteItem(item);
    
    if (item.kind === 'file') {
      const newHandle = await parentHandle.getFileHandle(newName, { create: true });
      const file = await (tempHandle as FileSystemFileHandle).getFile();
      const writable = await newHandle.createWritable();
      await writable.write(await file.arrayBuffer());
      await writable.close();
    }
    
    await parentHandle.removeEntry(`__temp_${Date.now()}_${newName}`);
  }

  async readFile(item: FileSystemItem): Promise<File> {
    if (item.kind !== 'file' || !item.handle) {
      throw new Error('Item is not a file');
    }
    return (item.handle as FileSystemFileHandle).getFile();
  }

  async writeFile(item: FileSystemItem, content: string | ArrayBuffer): Promise<void> {
    if (item.kind !== 'file' || !item.handle) {
      throw new Error('Item is not a file');
    }
    
    const writable = await (item.handle as FileSystemFileHandle).createWritable();
    await writable.write(content);
    await writable.close();
  }

  private async getDirectoryHandle(path: string): Promise<FileSystemDirectoryHandle> {
    if (!this.rootHandle) {
      throw new Error('No root directory selected');
    }

    if (path === '/') {
      return this.rootHandle;
    }

    const pathParts = path.split('/').filter(Boolean);
    let currentHandle = this.rootHandle;

    for (const part of pathParts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    return currentHandle;
  }

  private async copyFile(item: FileSystemItem, targetPath: string): Promise<void> {
    const targetHandle = await this.getDirectoryHandle(targetPath);
    const sourceFile = await this.readFile(item);
    const targetFileHandle = await targetHandle.getFileHandle(item.name, { create: true });
    const writable = await targetFileHandle.createWritable();
    await writable.write(await sourceFile.arrayBuffer());
    await writable.close();
  }

  private async copyDirectory(item: FileSystemItem, targetPath: string): Promise<void> {
    const targetHandle = await this.getDirectoryHandle(targetPath);
    await targetHandle.getDirectoryHandle(item.name, { create: true });
    
    const sourceItems = await this.navigateToPath(item.path);
    
    for (const sourceItem of sourceItems) {
      if (sourceItem.kind === 'file') {
        await this.copyFile(sourceItem, `${targetPath}/${item.name}`);
      } else {
        await this.copyDirectory(sourceItem, `${targetPath}/${item.name}`);
      }
    }
  }
}

export const fileSystemAPI = FileSystemAPI.getInstance();