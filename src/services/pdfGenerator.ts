import jsPDF from 'jspdf';
import type { ImageWithQuantity, PDFConfig, ImageDimensions } from '../types';
import { PDF_DEFAULTS, IMAGE_CONFIG, UI_CONFIG } from '../constants';
import { readFileAsDataURL, rotateImage, loadImage } from '../utils/imageUtils';

/**
 * Serviço responsável pela geração de PDFs
 */
export class PDFGeneratorService {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;

  constructor(config: Partial<PDFConfig> = {}) {
    this.margin = config.margin ?? PDF_DEFAULTS.MARGIN;
    
    this.doc = new jsPDF({
      unit: PDF_DEFAULTS.UNIT,
      format: PDF_DEFAULTS.PAGE_FORMAT,
    });

    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  /**
   * Calcula as dimensões e posição da imagem na página
   */
  private calculateImageDimensions(
    imgWidth: number,
    imgHeight: number,
    halfPageIndex: number
  ): ImageDimensions {
    const maxWidth = this.pageWidth - 2 * this.margin;
    const maxHeight = this.pageHeight / UI_CONFIG.IMAGES_PER_PAGE - 2 * this.margin;

    const widthRatio = maxWidth / imgWidth;
    const heightRatio = maxHeight / imgHeight;
    const scale = Math.min(widthRatio, heightRatio);

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    const isTopHalf = halfPageIndex % UI_CONFIG.IMAGES_PER_PAGE === 0;
    const y = (isTopHalf ? this.margin : this.pageHeight / UI_CONFIG.IMAGES_PER_PAGE + this.margin) + 
              (maxHeight - scaledHeight) / 2;
    const x = this.margin + (maxWidth - scaledWidth) / 2;

    return {
      width: scaledWidth,
      height: scaledHeight,
      x,
      y,
    };
  }

  /**
   * Processa uma imagem individual e retorna os dados formatados
   */
  private async processImage(file: File): Promise<{
    data: string;
    width: number;
    height: number;
  }> {
    const imgData = await readFileAsDataURL(file);
    const image = await loadImage(imgData);

    let finalImgData = imgData;
    let imgWidth = image.width;
    let imgHeight = image.height;

    // Rotaciona imagem vertical para horizontal
    if (imgHeight > imgWidth) {
      finalImgData = rotateImage(image);
      [imgWidth, imgHeight] = [imgHeight, imgWidth];
    }

    return {
      data: finalImgData,
      width: imgWidth,
      height: imgHeight,
    };
  }

  /**
   * Adiciona uma nova página se necessário
   */
  private addPageIfNeeded(halfPageIndex: number): void {
    if (halfPageIndex % UI_CONFIG.IMAGES_PER_PAGE === 0 && halfPageIndex !== 0) {
      this.doc.addPage();
    }
  }

  /**
   * Gera o PDF com as imagens fornecidas
   * @param images Array de imagens com suas quantidades
   * @param fileName Nome do arquivo (opcional)
   * @returns Promise que resolve quando o PDF é salvo
   */
  async generatePDF(images: ImageWithQuantity[], fileName?: string): Promise<void> {
    if (images.length === 0) {
      throw new Error('Nenhuma imagem fornecida');
    }

    let halfPageIndex = 0;

    for (const img of images) {
      const processedImage = await this.processImage(img.file);

      // Adiciona a imagem N vezes conforme a quantidade
      for (let i = 0; i < img.quantity; i++) {
        this.addPageIfNeeded(halfPageIndex);

        const dimensions = this.calculateImageDimensions(
          processedImage.width,
          processedImage.height,
          halfPageIndex
        );

        this.doc.addImage(
          processedImage.data,
          IMAGE_CONFIG.EXPORT_FORMAT,
          dimensions.x,
          dimensions.y,
          dimensions.width,
          dimensions.height
        );

        halfPageIndex++;
      }
    }

    // Salva o PDF
    const finalFileName = this.formatFileName(fileName || PDF_DEFAULTS.DEFAULT_FILE_NAME);
    this.doc.save(finalFileName);
  }

  /**
   * Formata o nome do arquivo, adicionando .pdf se necessário
   */
  private formatFileName(name: string): string {
    const trimmedName = name.trim();
    return trimmedName.toLowerCase().endsWith('.pdf') 
      ? trimmedName 
      : `${trimmedName}.pdf`;
  }
}

/**
 * Função helper para gerar PDF de forma simplificada
 */
export async function generatePDF(
  images: ImageWithQuantity[],
  fileName?: string,
  config?: Partial<PDFConfig>
): Promise<void> {
  const generator = new PDFGeneratorService(config);
  await generator.generatePDF(images, fileName);
}
