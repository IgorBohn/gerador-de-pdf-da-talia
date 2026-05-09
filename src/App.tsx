import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageList from './components/ImageList';
import QuantityInput from './components/QuantityInput';
import type { ImageWithQuantity } from './types';
import { createPreviewURL, revokePreviewURL } from './utils/imageUtils';
import { generatePDF } from './services/pdfGenerator';
import { IMAGE_CONFIG, PDF_DEFAULTS, MESSAGES } from './constants';
import styles from './styles/App.module.css';

/**
 * Componente principal da aplicação de geração de PDFs
 */
const App: React.FC = () => {
  const [images, setImages] = useState<ImageWithQuantity[]>([]);
  const [batchQuantity, setBatchQuantity] = useState<number>(IMAGE_CONFIG.DEFAULT_QUANTITY);
  const [pdfName, setPdfName] = useState<string>(PDF_DEFAULTS.DEFAULT_FILE_NAME);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza a quantidade de todas as imagens de uma vez
   */
  const handleApplyBatchQuantity = (): void => {
    setImages((prev) => prev.map((img) => ({ ...img, quantity: batchQuantity })));
  };

  /**
   * Processa o upload de novos arquivos de imagem
   */
  const handleImageUpload = (files: File[]): void => {
    const newImages = files.map((file) => ({
      file,
      url: createPreviewURL(file),
      quantity: IMAGE_CONFIG.DEFAULT_QUANTITY,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setError(null);
  };

  /**
   * Atualiza a quantidade de uma imagem específica
   */
  const handleUpdateQuantity = (index: number, quantity: number): void => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  /**
   * Reordena as imagens na lista (drag and drop)
   */
  const handleReorder = (fromIndex: number, toIndex: number): void => {
    setImages((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  };

  /**
   * Remove uma imagem da lista
   */
  const handleRemove = (index: number): void => {
    setImages((prev) => {
      const imageToRemove = prev[index];
      // Libera a URL temporária para evitar memory leaks
      revokePreviewURL(imageToRemove.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  /**
   * Gera o PDF com as imagens selecionadas
   */
  const handleGeneratePDF = async (): Promise<void> => {
    if (images.length === 0) {
      setError(MESSAGES.ERRORS.NO_IMAGES);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await generatePDF(images, pdfName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGES.ERRORS.GENERATE_PDF_ERROR;
      setError(errorMessage);
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.content}>
        <h1 className={styles.title}>Gerador de PDF da Talia</h1>
        
        <div className={styles.uploader}>
          <ImageUploader onUpload={handleImageUpload} />
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <>
            <div className={styles.controls}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  <span>Quantidade em lote:</span>
                  <QuantityInput
                    value={batchQuantity}
                    onChange={setBatchQuantity}
                    className={styles.quantityInput}
                  />
                </label>
                <button 
                  className={styles.applyButton} 
                  onClick={handleApplyBatchQuantity}
                  type="button"
                >
                  Aplicar
                </button>
              </div>

              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  <span>Nome do PDF:</span>
                  <input
                    type="text"
                    value={pdfName}
                    onChange={(e) => setPdfName(e.target.value)}
                    className={styles.textInput}
                    placeholder="Nome do arquivo.pdf"
                  />
                </label>
              </div>
            </div>

            <div className={styles.imageList}>
              <ImageList
                images={images}
                updateQuantity={handleUpdateQuantity}
                onReorder={handleReorder}
                onRemove={handleRemove}
              />
            </div>

            <button
              className={styles.generateButton}
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              type="button"
            >
              {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
