import { PDF_DEFAULTS } from '../constants';

/**
 * Lê um arquivo de imagem como DataURL
 * @param file Arquivo de imagem a ser lido
 * @returns Promise que resolve com a DataURL da imagem
 * @throws Error se houver falha na leitura do arquivo
 */
export const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });

/**
 * Carrega uma imagem a partir de uma DataURL
 * @param dataUrl URL da imagem
 * @returns Promise que resolve com o elemento HTMLImageElement
 * @throws Error se houver falha ao carregar a imagem
 */
export const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Erro ao carregar imagem'));
    image.src = dataUrl;
  });

/**
 * Rotaciona uma imagem em 90 graus (vertical para horizontal)
 * @param img Elemento de imagem a ser rotacionado
 * @param quality Qualidade da imagem de saída (0-1)
 * @returns DataURL da imagem rotacionada
 */
export const rotateImage = (
  img: HTMLImageElement,
  quality: number = PDF_DEFAULTS.IMAGE_QUALITY
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = img.height;
  canvas.height = img.width;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível obter contexto do canvas');
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  
  return canvas.toDataURL('image/jpeg', quality);
};

/**
 * Valida se um arquivo é uma imagem válida
 * @param file Arquivo a ser validado
 * @returns true se for uma imagem válida
 */
export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Cria URL temporária para preview de arquivo
 * @param file Arquivo para criar preview
 * @returns URL temporária do arquivo
 */
export const createPreviewURL = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Libera URL temporária criada para preview
 * @param url URL a ser liberada
 */
export const revokePreviewURL = (url: string): void => {
  URL.revokeObjectURL(url);
};
