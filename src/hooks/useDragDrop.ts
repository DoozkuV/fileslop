import { useState, useCallback } from 'react';
import { FileSystemItem } from '../types/fileSystem';

interface DragState {
  isDragging: boolean;
  draggedItems: FileSystemItem[];
  dragOverTarget: string | null;
}

export function useDragDrop(
  onMoveItems: (items: FileSystemItem[], targetPath: string) => Promise<void>
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItems: [],
    dragOverTarget: null
  });

  const startDrag = useCallback((items: FileSystemItem[]) => {
    setDragState({
      isDragging: true,
      draggedItems: items,
      dragOverTarget: null
    });
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItems: [],
      dragOverTarget: null
    });
  }, []);

  const setDragOverTarget = useCallback((target: string | null) => {
    setDragState(prev => ({
      ...prev,
      dragOverTarget: target
    }));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, items: FileSystemItem[]) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(items.map(item => item.path)));
    startDrag(items);
  }, [startDrag]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    endDrag();
  }, [endDrag]);

  const handleDragOver = useCallback((e: React.DragEvent, targetPath?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (targetPath && targetPath !== dragState.dragOverTarget) {
      setDragOverTarget(targetPath);
    }
  }, [dragState.dragOverTarget, setDragOverTarget]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverTarget(null);
    }
  }, [setDragOverTarget]);

  const handleDrop = useCallback(async (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    
    try {
      const draggedPaths = JSON.parse(e.dataTransfer.getData('application/json'));
      const draggedItems = dragState.draggedItems.filter(item => 
        draggedPaths.includes(item.path)
      );

      if (draggedItems.length > 0 && !draggedItems.some(item => item.path === targetPath)) {
        await onMoveItems(draggedItems, targetPath);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    } finally {
      endDrag();
    }
  }, [dragState.draggedItems, onMoveItems, endDrag]);

  const canDrop = useCallback((targetPath: string) => {
    if (!dragState.isDragging || dragState.draggedItems.length === 0) {
      return false;
    }

    return !dragState.draggedItems.some(item => 
      item.path === targetPath || targetPath.startsWith(item.path + '/')
    );
  }, [dragState.isDragging, dragState.draggedItems]);

  return {
    ...dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    canDrop
  };
}