// Tipo para imagem com quantidade
export type ImageWithQuantity = {
  file: File;
  url: string;
  quantity: number;
};

// Lê arquivo como DataURL
export const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Rotaciona imagem se necessário (vertical para horizontal)
export const rotateImage = (img: HTMLImageElement): string => {
  const canvas = document.createElement("canvas");
  canvas.width = img.height;
  canvas.height = img.width;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return canvas.toDataURL("image/jpeg", 1.0);
};
