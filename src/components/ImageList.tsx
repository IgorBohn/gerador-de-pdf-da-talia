import { useRef } from 'react';
import type { ImageWithQuantity } from '../types';
import { IMAGE_CONFIG } from '../constants';
import styles from './ImageList.module.css';
import QuantityInput from './QuantityInput';

interface ImageListProps {
  /** Lista de imagens com suas quantidades */
  images: ImageWithQuantity[];
  /** Callback para atualizar quantidade de uma imagem */
  updateQuantity: (index: number, quantity: number) => void;
  /** Callback para reordenar imagens (drag and drop) */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Callback para remover uma imagem */
  onRemove: (index: number) => void;
}

/**
 * Componente que exibe lista de imagens com controles de quantidade e reordenação
 */
const ImageList: React.FC<ImageListProps> = ({ 
  images, 
  updateQuantity, 
  onReorder, 
  onRemove 
}) => {
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  /**
   * Inicia o drag de um item
   */
  const handleDragStart = (index: number): void => {
    dragItemRef.current = index;
  };

  /**
   * Registra quando o cursor entra em um item durante o drag
   */
  const handleDragEnter = (index: number): void => {
    dragOverItemRef.current = index;
  };

  /**
   * Finaliza o drag e executa a reordenação se necessário
   */
  const handleDragEnd = (): void => {
    const fromIndex = dragItemRef.current;
    const toIndex = dragOverItemRef.current;

    if (
      fromIndex !== null &&
      toIndex !== null &&
      fromIndex !== toIndex
    ) {
      onReorder(fromIndex, toIndex);
    }

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  /**
   * Previne o comportamento padrão durante drag over
   */
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  /**
   * Valida e corrige a quantidade quando o input perde o foco
   */
  const handleQuantityBlur = (index: number, quantity: number): void => {
    if (!quantity || quantity < IMAGE_CONFIG.MIN_QUANTITY) {
      updateQuantity(index, IMAGE_CONFIG.MIN_QUANTITY);
    }
  };

  /**
   * Calcula a opacidade do item durante o drag
   */
  const getItemOpacity = (index: number): number => {
    return dragItemRef.current === index ? 0.5 : 1;
  };

  return (
    <div className={styles.container}>
      {images.map((img, index) => (
        <div
          key={`${img.file.name}-${index}`}
          className={styles.imageItem}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          style={{ opacity: getItemOpacity(index) }}
        >
          <button
            className={styles.removeButton}
            onClick={() => onRemove(index)}
            title="Remover imagem"
            type="button"
            aria-label={`Remover ${img.file.name}`}
          >
            ×
          </button>

          <img
            src={img.url}
            alt={`Preview ${index + 1}`}
            className={styles.imagePreview}
          />

          <label className={styles.quantityLabel}>
            <span>Quantidade:</span>
            <QuantityInput
              value={img.quantity}
              onChange={(value) => updateQuantity(index, value)}
              onBlur={() => handleQuantityBlur(index, img.quantity)}
              className={styles.quantityInput}
              min={IMAGE_CONFIG.MIN_QUANTITY}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
