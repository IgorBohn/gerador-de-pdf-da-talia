import React from "react";
import styles from "./ImageUploader.module.css";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
}


const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const inputId = "uploader-input";
  return (
    <div className={styles.uploaderWrapper}>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (!e.target.files) return;
          onUpload(Array.from(e.target.files));
        }}
        className={styles.uploaderInput}
      />
      <label htmlFor={inputId} className={styles.uploaderLabel}>
        Escolher arquivos
      </label>
    </div>
  );
};

export default ImageUploader;
