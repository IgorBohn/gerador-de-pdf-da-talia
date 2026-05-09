/**
 * Constantes da aplicação
 */

/** Configurações padrão do PDF */
export const PDF_DEFAULTS = {
  /** Margem padrão das páginas em pontos */
  MARGIN: 10,
  /** Qualidade padrão da imagem JPEG (0-1) */
  IMAGE_QUALITY: 1.0,
  /** Nome padrão do arquivo */
  DEFAULT_FILE_NAME: 'output',
  /** Formato do papel */
  PAGE_FORMAT: 'a4' as const,
  /** Unidade de medida */
  UNIT: 'pt' as const,
} as const;

/** Configurações de imagem */
export const IMAGE_CONFIG = {
  /** Tipos MIME aceitos para upload */
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  /** Quantidade mínima permitida */
  MIN_QUANTITY: 1,
  /** Quantidade inicial padrão */
  DEFAULT_QUANTITY: 1,
  /** Formato de exportação */
  EXPORT_FORMAT: 'JPEG' as const,
} as const;

/** Mensagens da aplicação */
export const MESSAGES = {
  ERRORS: {
    NO_IMAGES: 'Nenhuma imagem selecionada',
    INVALID_FILE_TYPE: 'Tipo de arquivo inválido',
    LOAD_IMAGE_ERROR: 'Erro ao carregar imagem',
    GENERATE_PDF_ERROR: 'Erro ao gerar PDF',
  },
  SUCCESS: {
    PDF_GENERATED: 'PDF gerado com sucesso!',
  },
} as const;

/** Configurações de UI */
export const UI_CONFIG = {
  /** Número de imagens por linha no PDF (2 = meia página cada) */
  IMAGES_PER_PAGE: 2,
} as const;
