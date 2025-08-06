import React, { useEffect, useRef } from 'react';
import { Copy, Scissors, Trash2, Edit, Eye, Download, FolderPlus, FilePlus, Star, ClipboardPaste } from 'lucide-react';
import { FileSystemItem } from '../types/fileSystem';

interface ContextMenuProps {
  x: number;
  y: number;
  item?: FileSystemItem;
  hasClipboard: boolean;
  onClose: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onRename: () => void;
  onOpen: () => void;
  onDownload?: () => void;
  onCreateDirectory: () => void;
  onCreateFile: () => void;
  onAddBookmark?: () => void;
}

export function ContextMenu({
  x,
  y,
  item,
  hasClipboard,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  onOpen,
  onDownload,
  onCreateDirectory,
  onCreateFile,
  onAddBookmark
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();

      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > window.innerWidth) {
        adjustedX = x - rect.width;
      }

      if (rect.bottom > window.innerHeight) {
        adjustedY = y - rect.height;
      }

      menu.style.left = `${Math.max(0, adjustedX)}px`;
      menu.style.top = `${Math.max(0, adjustedY)}px`;
    }
  }, [x, y]);

  const MenuItem = ({
    icon: Icon,
    label,
    onClick,
    disabled = false,
    shortcut
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    shortcut?: string;
  }) => (
    <button
      className={`context-menu-item ${disabled ? 'disabled' : ''}`}
      onClick={() => {
        if (!disabled) {
          onClick();
          onClose();
        }
      }}
      disabled={disabled}
    >
      <Icon size={16} />
      <span>{label}</span>
      {shortcut && <span className="shortcut">{shortcut}</span>}
    </button>
  );

  const Separator = () => <div className="context-menu-separator" />;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      {item ? (
        <>
          <MenuItem
            icon={Eye}
            label="Open"
            onClick={onOpen}
            shortcut="Enter"
          />
          {onDownload && item.kind === 'file' && (
            <MenuItem
              icon={Download}
              label="Download"
              onClick={onDownload}
            />
          )}
          <Separator />
          <MenuItem
            icon={Copy}
            label="Copy"
            onClick={onCopy}
            shortcut="Ctrl+C"
          />
          <MenuItem
            icon={Scissors}
            label="Cut"
            onClick={onCut}
            shortcut="Ctrl+X"
          />
          <MenuItem
            icon={ClipboardPaste}
            label="Paste"
            onClick={onPaste}
            disabled={!hasClipboard}
            shortcut="Ctrl+V"
          />
          <Separator />
          <MenuItem
            icon={Edit}
            label="Rename"
            onClick={onRename}
            shortcut="F2"
          />
          <MenuItem
            icon={Trash2}
            label="Delete"
            onClick={onDelete}
            shortcut="Delete"
          />
          <Separator />
          {onAddBookmark && item.kind === 'directory' && (
            <MenuItem
              icon={Star}
              label="Add to bookmarks"
              onClick={onAddBookmark}
            />
          )}
        </>
      ) : (
        <>
          <MenuItem
            icon={ClipboardPaste}
            label="Paste"
            onClick={onPaste}
            disabled={!hasClipboard}
            shortcut="Ctrl+V"
          />
          <Separator />
          <MenuItem
            icon={FolderPlus}
            label="New Folder"
            onClick={onCreateDirectory}
            shortcut="Ctrl+Shift+N"
          />
          <MenuItem
            icon={FilePlus}
            label="New File"
            onClick={onCreateFile}
            shortcut="Ctrl+Alt+N"
          />
        </>
      )}
    </div>
  );
}
