import React from 'react';
import { FileSystemItem } from '../types/fileSystem';
import { FileItem } from './FileItem';

interface FileListProps {
  items: FileSystemItem[];
  selectedItems: Set<string>;
  viewMode: 'list' | 'grid';
  onItemSelect: (path: string, multi: boolean) => void;
  onItemDoubleClick: (item: FileSystemItem) => void;
  onItemContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  onItemRename?: (item: FileSystemItem, newName: string) => void;
  onBackgroundClick: () => void;
  onBackgroundContextMenu: (e: React.MouseEvent) => void;
  dragState?: {
    isDragging: boolean;
    draggedItems: FileSystemItem[];
    dragOverTarget: string | null;
  };
  onDragStart?: (e: React.DragEvent, item: FileSystemItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, targetPath: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetPath: string) => void;
  canDrop?: (targetPath: string) => boolean;
}

export function FileList({
  items,
  selectedItems,
  viewMode,
  onItemSelect,
  onItemDoubleClick,
  onItemContextMenu,
  onItemRename,
  onBackgroundClick,
  onBackgroundContextMenu,
  dragState,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  canDrop
}: FileListProps) {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onBackgroundClick();
    }
  };

  if (viewMode === 'grid') {
    return (
      <div
        className="flex-1 overflow-auto p-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 content-start"
        onClick={handleBackgroundClick}
        onContextMenu={onBackgroundContextMenu}
      >
        {items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-primary-400 h-full min-h-48">
            <span className="text-6xl opacity-50 mb-4">📁</span>
            <p className="text-lg">This folder is empty</p>
          </div>
        ) : (
          items.map((item) => (
            <FileItem
              key={item.path}
              item={item}
              isSelected={selectedItems.has(item.path)}
              viewMode={viewMode}
              onSelect={onItemSelect}
              onDoubleClick={onItemDoubleClick}
              onContextMenu={onItemContextMenu}
              onRename={onItemRename}
              isDragging={dragState?.draggedItems.some(dragItem => dragItem.path === item.path)}
              isDragOver={dragState?.dragOverTarget === item.path}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              canDrop={canDrop?.(item.path)}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto"
      onClick={handleBackgroundClick}
      onContextMenu={onBackgroundContextMenu}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-primary-50 border-b border-primary-200 px-4 py-3 text-left text-xs font-semibold text-primary-600 sticky top-0 z-10 min-w-[300px]">Name</th>
            <th className="bg-primary-50 border-b border-primary-200 px-4 py-3 text-left text-xs font-semibold text-primary-600 sticky top-0 z-10 w-[120px]">Size</th>
            <th className="bg-primary-50 border-b border-primary-200 px-4 py-3 text-left text-xs font-semibold text-primary-600 sticky top-0 z-10 w-[120px]">Modified</th>
            <th className="bg-primary-50 border-b border-primary-200 px-4 py-3 text-left text-xs font-semibold text-primary-600 sticky top-0 z-10 w-[120px]">Type</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-16">
                <div className="flex flex-col items-center justify-center text-center text-primary-400 min-h-48">
                  <span className="text-6xl opacity-50 mb-4">📁</span>
                  <p className="text-lg">This folder is empty</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <FileItem
                key={item.path}
                item={item}
                isSelected={selectedItems.has(item.path)}
                viewMode={viewMode}
                onSelect={onItemSelect}
                onDoubleClick={onItemDoubleClick}
                onContextMenu={onItemContextMenu}
                onRename={onItemRename}
                isDragging={dragState?.draggedItems.some(dragItem => dragItem.path === item.path)}
                isDragOver={dragState?.dragOverTarget === item.path}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                canDrop={canDrop?.(item.path)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}