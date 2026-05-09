import { useState, useCallback } from 'react';
import type { ImageWithQuantity } from '../types';
import { createPreviewURL, isValidImageFile } from '../utils/imageUtils';
import { IMAGE_CONFIG, MESSAGES } from '../constants';

/**
 * Hook personalizado para gerenciar estado e validação de imagens
 */
export const useImageManager = () => {
  const [images, setImages] = useState<ImageWithQuantity[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Adiciona novas imagens validadas à lista
   */
  const addImages = useCallback((files: File[]): void => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // Valida cada arquivo
    files.forEach((file) => {
      if (isValidImageFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Mostra erro se houver arquivos inválidos
    if (invalidFiles.length > 0) {
      setError(`${MESSAGES.ERRORS.INVALID_FILE_TYPE}: ${invalidFiles.join(', ')}`);
    } else {
      setError(null);
    }

    // Adiciona apenas arquivos válidos
    if (validFiles.length > 0) {
      const newImages = validFiles.map((file) => ({
        file,
        url: createPreviewURL(file),
        quantity: IMAGE_CONFIG.DEFAULT_QUANTITY,
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  }, []);

  /**
   * Atualiza a quantidade de uma imagem específica
   */
  const updateQuantity = useCallback((index: number, quantity: number): void => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  }, []);

  /**
   * Atualiza a quantidade de todas as imagens
   */
  const updateAllQuantities = useCallback((quantity: number): void => {
    setImages((prev) => prev.map((img) => ({ ...img, quantity })));
  }, []);

  /**
   * Reordena as imagens
   */
  const reorderImages = useCallback((fromIndex: number, toIndex: number): void => {
    setImages((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  /**
   * Remove uma imagem da lista
   */
  const removeImage = useCallback((index: number): void => {
    setImages((prev) => {
      const imageToRemove = prev[index];
      // Libera a URL temporária
      URL.revokeObjectURL(imageToRemove.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * Limpa o erro
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    images,
    error,
    addImages,
    updateQuantity,
    updateAllQuantities,
    reorderImages,
    removeImage,
    clearError,
  };
};
