
import React from "react";
import type { ImageWithQuantity } from "../utils/imageUtils";
import styles from "./ImageList.module.css";
import QuantityInput from "./QuantityInput";

interface ImageListProps {
  images: ImageWithQuantity[];
  updateQuantity: (index: number, quantity: number) => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}

const ImageList: React.FC<ImageListProps> = ({ images, updateQuantity, onReorder, onRemove }) => {
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      onReorder(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div>
      {images.map((img, index) => (
        <div
          key={index}
          className={styles.imageItem}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={e => e.preventDefault()}
          style={{ cursor: 'grab', opacity: dragItem.current === index ? 0.5 : 1 }}
        >
          <button
            className={styles.removeButton}
            onClick={() => onRemove(index)}
            title="Remover imagem"
          >
            ×
          </button>
          <img
            src={img.url}
            alt={`preview-${index}`}
            className={styles.imagePreview}
          />
          <label className={styles.quantityLabel}>
            <span style={{ marginRight: '18px' }}>Quantidade:</span>
            <QuantityInput
              value={img.quantity}
              onChange={val => updateQuantity(index, val)}
              onBlur={() => {
                if (!img.quantity || img.quantity < 1) {
                  updateQuantity(index, 1);
                }
              }}
              className={styles.quantityInput}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
