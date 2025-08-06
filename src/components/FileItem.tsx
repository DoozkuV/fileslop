import React, { useState, useRef, useEffect } from 'react';
import { FileSystemItem } from '../types/fileSystem';
import { formatFileSize, formatDate, getFileIcon, isImageFile, generateThumbnail } from '../utils/fileUtils';

interface FileItemProps {
  item: FileSystemItem;
  isSelected: boolean;
  viewMode: 'list' | 'grid';
  onSelect: (path: string, multi: boolean) => void;
  onDoubleClick: (item: FileSystemItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  onRename?: (item: FileSystemItem, newName: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, item: FileSystemItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, targetPath: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetPath: string) => void;
  canDrop?: boolean;
}

export function FileItem({
  item,
  isSelected,
  viewMode,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onRename,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  canDrop = true
}: FileItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isImageFile(item.name) && item.handle) {
      const loadThumbnail = async () => {
        try {
          if (item.handle && item.kind === 'file') {
            const file = await (item.handle as FileSystemFileHandle).getFile();
            const thumbnailUrl = await generateThumbnail(file);
            setThumbnail(thumbnailUrl);
          }
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
        }
      };
      loadThumbnail();
    }
  }, [item]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      const nameWithoutExt = item.name.lastIndexOf('.') > 0 
        ? item.name.substring(0, item.name.lastIndexOf('.'))
        : item.name;
      inputRef.current.setSelectionRange(0, nameWithoutExt.length);
    }
  }, [isRenaming, item.name]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(item.path, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRenaming) {
      onDoubleClick(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isRenaming) {
        handleRename();
      } else {
        onDoubleClick(item);
      }
    } else if (e.key === 'Escape' && isRenaming) {
      setIsRenaming(false);
      setRenameValue(item.name);
    } else if (e.key === 'F2' && !isRenaming) {
      setIsRenaming(true);
    }
  };

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== item.name && onRename) {
      onRename(item, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameBlur = () => {
    handleRename();
  };

  const startRename = () => {
    setIsRenaming(true);
  };

  const handleDragStartWrapper = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, item);
    }
  };

  const handleDragOverWrapper = (e: React.DragEvent) => {
    if (item.kind === 'directory' && onDragOver && canDrop) {
      onDragOver(e, item.path);
    }
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    if (item.kind === 'directory' && onDrop && canDrop) {
      onDrop(e, item.path);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div
        className={`grid-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver && item.kind === 'directory' && canDrop ? 'drag-over' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => onContextMenu(e, item)}
        onKeyDown={handleKeyDown}
        draggable={!isRenaming}
        onDragStart={handleDragStartWrapper}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOverWrapper}
        onDragLeave={onDragLeave}
        onDrop={handleDropWrapper}
        tabIndex={0}
        role="button"
        aria-label={`${item.kind}: ${item.name}`}
      >
        <div className="grid-item-icon">
          {thumbnail ? (
            <img src={thumbnail} alt={item.name} className="thumbnail" />
          ) : (
            <span className="file-icon" role="img" aria-label={item.kind}>
              {getFileIcon(item.name, item.kind)}
            </span>
          )}
        </div>
        <div className="grid-item-info">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameBlur}
              onKeyDown={handleKeyDown}
              className="rename-input"
            />
          ) : (
            <span className="grid-item-name truncate" title={item.name}>
              {item.name}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <tr
      className={`list-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver && item.kind === 'directory' && canDrop ? 'drag-over' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => onContextMenu(e, item)}
      onKeyDown={handleKeyDown}
      draggable={!isRenaming}
      onDragStart={handleDragStartWrapper}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOverWrapper}
      onDragLeave={onDragLeave}
      onDrop={handleDropWrapper}
      tabIndex={0}
      role="row"
    >
      <td className="name-cell">
        <div className="name-content">
          <span className="file-icon" role="img" aria-label={item.kind}>
            {getFileIcon(item.name, item.kind)}
          </span>
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameBlur}
              onKeyDown={handleKeyDown}
              className="rename-input"
            />
          ) : (
            <span className="file-name truncate" title={item.name}>
              {item.name}
            </span>
          )}
        </div>
      </td>
      <td className="size-cell">
        {item.kind === 'file' && item.size !== undefined
          ? formatFileSize(item.size)
          : '-'}
      </td>
      <td className="date-cell">
        {item.lastModified ? formatDate(item.lastModified) : '-'}
      </td>
      <td className="type-cell">
        {item.kind === 'directory' ? 'Folder' : 'File'}
      </td>
    </tr>
  );
}