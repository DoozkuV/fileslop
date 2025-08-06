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
        className="file-grid"
        onClick={handleBackgroundClick}
        onContextMenu={onBackgroundContextMenu}
      >
        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <p>This folder is empty</p>
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
      className="file-list"
      onClick={handleBackgroundClick}
      onContextMenu={onBackgroundContextMenu}
    >
      <table className="file-table">
        <thead>
          <tr>
            <th className="name-header">Name</th>
            <th className="size-header">Size</th>
            <th className="date-header">Modified</th>
            <th className="type-header">Type</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty-state">
                <div>
                  <span className="empty-icon">📁</span>
                  <p>This folder is empty</p>
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