/**
 * Representa uma imagem carregada com sua quantidade de repetições
 */
export interface ImageWithQuantity {
  /** Arquivo de imagem original */
  file: File;
  /** URL temporária para preview */
  url: string;
  /** Quantidade de vezes que a imagem aparecerá no PDF */
  quantity: number;
}

/**
 * Configurações para geração do PDF
 */
export interface PDFConfig {
  /** Nome do arquivo PDF (sem extensão) */
  fileName: string;
  /** Margem das páginas em pontos */
  margin: number;
  /** Qualidade da imagem (0-1) */
  imageQuality: number;
}

/**
 * Dimensões de uma página
 */
export interface PageDimensions {
  /** Largura da página */
  width: number;
  /** Altura da página */
  height: number;
}

/**
 * Dimensões calculadas para uma imagem
 */
export interface ImageDimensions {
  /** Largura da imagem */
  width: number;
  /** Altura da imagem */
  height: number;
  /** Posição X */
  x: number;
  /** Posição Y */
  y: number;
}
