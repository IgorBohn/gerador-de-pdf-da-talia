import { useId } from 'react';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  /** Callback executado quando arquivos são selecionados */
  onUpload: (files: File[]) => void;
}

/**
 * Componente para upload de imagens
 * Permite seleção múltipla de arquivos de imagem
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  // Gera ID único para acessibilidade
  const inputId = useId();

  /**
   * Processa a mudança no input de arquivo
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    onUpload(Array.from(files));
    
    // Limpa o input para permitir upload do mesmo arquivo novamente
    e.target.value = '';
  };

  return (
    <div className={styles.uploaderWrapper}>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className={styles.uploaderInput}
        aria-label="Selecionar imagens para upload"
      />
      <label htmlFor={inputId} className={styles.uploaderLabel}>
        Escolher arquivos
      </label>
    </div>
  );
};

export default ImageUploader;
