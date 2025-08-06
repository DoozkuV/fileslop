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
        className={`flex flex-col items-center p-4 border border-transparent rounded-lg cursor-pointer transition-all bg-white ${
          isSelected ? 'bg-accent-50 border-accent-400' : 'hover:bg-primary-50 hover:border-primary-300'
        } ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${
          isDragOver && item.kind === 'directory' && canDrop ? 'bg-accent-50 border-accent-400 shadow-[0_0_0_2px_rgba(59,130,246,0.3)] animate-pulse-scale' : ''
        }`}
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
        <div className="mb-3">
          {thumbnail ? (
            <img src={thumbnail} alt={item.name} className="w-16 h-16 object-cover rounded border border-primary-200" />
          ) : (
            <span className="text-4xl" role="img" aria-label={item.kind}>
              {getFileIcon(item.name, item.kind)}
            </span>
          )}
        </div>
        <div className="text-center w-full">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameBlur}
              onKeyDown={handleKeyDown}
              className="text-center max-w-full text-xs border border-accent-400 rounded px-2 py-1 bg-white text-primary-900 focus:outline-none"
            />
          ) : (
            <span className="text-xs leading-tight break-words block overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}} title={item.name}>
              {item.name}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <tr
      className={`border-b border-primary-200 cursor-pointer transition-colors ${
        isSelected ? 'bg-accent-50' : 'hover:bg-primary-50'
      } ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDragOver && item.kind === 'directory' && canDrop ? 'bg-accent-50 animate-pulse-scale' : ''
      }`}
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
      <td className="px-4 py-3 text-sm align-middle">
        <div className="flex items-center gap-3">
          <span className="text-xl flex-shrink-0" role="img" aria-label={item.kind}>
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
              className="border border-accent-400 rounded px-2 py-1 bg-white text-primary-900 text-sm w-full max-w-48 focus:outline-none"
            />
          ) : (
            <span className="flex-1 min-w-0 truncate" title={item.name}>
              {item.name}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-primary-600 align-middle">
        {item.kind === 'file' && item.size !== undefined
          ? formatFileSize(item.size)
          : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-primary-600 align-middle">
        {item.lastModified ? formatDate(item.lastModified) : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-primary-600 align-middle">
        {item.kind === 'directory' ? 'Folder' : 'File'}
      </td>
    </tr>
  );
}