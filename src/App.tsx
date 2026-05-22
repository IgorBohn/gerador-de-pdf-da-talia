
import jsPDF from "jspdf";
import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ImageList from "./components/ImageList";
import QuantityInput from "./components/QuantityInput";
import type { ImageWithQuantity } from "./utils/imageUtils";
import { readFileAsDataURL, rotateImage } from "./utils/imageUtils";
import styles from "./styles/App.module.css";


const App: React.FC = () => {
  const [images, setImages] = useState<ImageWithQuantity[]>([]);
  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [pdfName, setPdfName] = useState<string>("output");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  
  // Atualiza a quantidade de todas as imagens
  const applyBatchQuantity = () => {
    setImages((prev) => prev.map(img => ({ ...img, quantity: batchQuantity })));
  };

  const handleImageUpload = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      quantity: 1,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const updateQuantity = (index: number, quantity: number) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    setProgress({ current: 0, total: 0 });

    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      let halfPageIndex = 0;

      const totalPages = images.reduce((sum, img) => sum + img.quantity, 0);
      setProgress({ current: 0, total: totalPages });

      const imageCache = new Map<File, { imgData: string; image: HTMLImageElement; finalImgData: string; width: number; height: number }>();

      let currentPage = 0;

      for (const img of images) {
        if (!imageCache.has(img.file)) {
          const imgData = await readFileAsDataURL(img.file);
          const image = new window.Image();
          image.src = imgData;
          await new Promise((resolve) => {
            image.onload = () => resolve(null);
          });

          let finalImgData = imgData;
          let imgNaturalWidth = image.width;
          let imgNaturalHeight = image.height;

          if (imgNaturalHeight > imgNaturalWidth) {
            finalImgData = rotateImage(image);
            [imgNaturalWidth, imgNaturalHeight] = [imgNaturalHeight, imgNaturalWidth];
          }

          imageCache.set(img.file, {
            imgData,
            image,
            finalImgData,
            width: imgNaturalWidth,
            height: imgNaturalHeight
          });
        }

        const cached = imageCache.get(img.file)!;
        const imgNaturalWidth = cached.width;
        const imgNaturalHeight = cached.height;
        const finalImgData = cached.finalImgData;

        const maxWidth = pageWidth - 2 * margin;
        const maxHeight = pageHeight / 2 - 2 * margin;
        const widthRatio = maxWidth / imgNaturalWidth;
        const heightRatio = maxHeight / imgNaturalHeight;
        const scale = Math.min(widthRatio, heightRatio);
        const imgWidth = imgNaturalWidth * scale;
        const imgHeight = imgNaturalHeight * scale;

        for (let i = 0; i < img.quantity; i++) {
          if (halfPageIndex % 2 === 0 && halfPageIndex !== 0) {
            doc.addPage();
          }

          const y =
            (halfPageIndex % 2 === 0 ? margin : pageHeight / 2 + margin) +
            (maxHeight - imgHeight) / 2;
          const x = margin + (maxWidth - imgWidth) / 2;

          doc.addImage(finalImgData, "JPEG", x, y, imgWidth, imgHeight);
          halfPageIndex++;
          currentPage++;
          
          if (currentPage % 5 === 0 || currentPage === totalPages) {
            setProgress({ current: currentPage, total: totalPages });
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
      }

      let fileName = pdfName.trim();
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
      }
      doc.save(fileName);
    } catch (error) {
      alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  return (
    <div className="app-container">
      <div className={styles.appContainer}>
        <h1 className={styles.title}>Gerador de PDF da Talia</h1>
        <div className={styles.uploader}>
          <ImageUploader onUpload={handleImageUpload} />
        </div>
        {images.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
            <label className="batchQuantityLabel" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '1.1rem', color: '#f0f0f0', fontWeight: 500 }}>
              <span>Quantidade em lote:</span>
              <QuantityInput
                value={batchQuantity}
                onChange={setBatchQuantity}
                className="batchQuantityInput"
                style={{ width: 80, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #343a40', backgroundColor: '#23272f', color: '#f0f0f0', fontSize: '1.1rem', outline: 'none' }}
              />
            </label>
            <button
              style={{
                padding: '7px 18px',
                borderRadius: 7,
                border: 'none',
                background: '#343a40',
                color: '#f0f0f0',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
                transition: 'background 0.2s, transform 0.2s',
                margin: 0,
                height: 38
              }}
              onClick={applyBatchQuantity}
              onMouseOver={e => (e.currentTarget.style.background = '#23272f')}
              onMouseOut={e => (e.currentTarget.style.background = '#343a40')}
            >
              Aplicar
            </button>
          </div>
        )}
        {images.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', color: '#f0f0f0', fontWeight: 500 }}>
              <span>Nome do PDF:</span>
              <input
                type="text"
                value={pdfName}
                onChange={e => setPdfName(e.target.value)}
                style={{ width: 220, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #343a40', backgroundColor: '#23272f', color: '#f0f0f0', fontSize: '1.1rem', outline: 'none' }}
                placeholder="Nome do arquivo.pdf"
              />
            </label>
          </div>
        )}
        <div className={styles.imageList}>
          <ImageList
            images={images}
            updateQuantity={updateQuantity}
            onReorder={(from, to) => {
              setImages(prev => {
                const updated = [...prev];
                const [removed] = updated.splice(from, 1);
                updated.splice(to, 0, removed);
                return updated;
              });
            }}
            onRemove={(index) => {
              setImages(prev => prev.filter((_, i) => i !== index));
            }}
          />
        </div>
        {images.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <button 
              className={styles.styledButton} 
              onClick={generatePDF}
              disabled={isGenerating}
              style={{
                opacity: isGenerating ? 0.6 : 1,
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
            </button>
            {progress && (
              <div style={{ 
                marginTop: 16, 
                fontSize: '1rem', 
                color: '#f0f0f0',
                fontWeight: 500
              }}>
                Processando: {progress.current} / {progress.total} páginas
                <div style={{
                  width: '100%',
                  maxWidth: 400,
                  height: 8,
                  backgroundColor: '#23272f',
                  borderRadius: 4,
                  overflow: 'hidden',
                  margin: '8px auto 0'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#4CAF50',
                    width: `${(progress.current / progress.total) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
