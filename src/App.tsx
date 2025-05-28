import React, { useState } from "react";
import jsPDF from "jspdf";

const App: React.FC = () => {
  const [images, setImages] = useState<
    { file: File; url: string; quantity: number }[]
  >([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
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

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const generatePDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;

    const rotateImage = (img: HTMLImageElement): string => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      return canvas.toDataURL("image/jpeg", 1.0);
    };

    let halfPageIndex = 0;

    for (const img of images) {
      for (let i = 0; i < img.quantity; i++) {
        const imgData = await readFileAsDataURL(img.file);
        const image = new Image();
        image.src = imgData;

        await new Promise((resolve) => {
          image.onload = () => resolve(null);
        });

        let finalImgData = imgData;
        let imgNaturalWidth = image.width;
        let imgNaturalHeight = image.height;

        if (imgNaturalHeight > imgNaturalWidth) {
          finalImgData = rotateImage(image);
          [imgNaturalWidth, imgNaturalHeight] = [
            imgNaturalHeight,
            imgNaturalWidth,
          ];
        }

        const maxWidth = pageWidth - 2 * margin;
        const maxHeight = pageHeight / 2 - 2 * margin;

        const widthRatio = maxWidth / imgNaturalWidth;
        const heightRatio = maxHeight / imgNaturalHeight;
        const scale = Math.min(widthRatio, heightRatio);

        const imgWidth = imgNaturalWidth * scale;
        const imgHeight = imgNaturalHeight * scale;

        if (halfPageIndex % 2 === 0 && halfPageIndex !== 0) {
          doc.addPage();
        }

        const y =
          (halfPageIndex % 2 === 0 ? margin : pageHeight / 2 + margin) +
          (maxHeight - imgHeight) / 2;
        const x = margin + (maxWidth - imgWidth) / 2;

        doc.addImage(finalImgData, "JPEG", x, y, imgWidth, imgHeight);

        halfPageIndex++;
      }
    }

    doc.save("output.pdf");
  };

  return (
    <div className="app-container">
      <div
        style={{
          margin: "0 auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#121212",
          color: "#f0f0f0",
          minHeight: "100vh",
          maxWidth: "600px",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: 24, marginBottom: 20 }}>
          Gerador de PDF da Talia
        </h1>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#1e1e1e",
            border: "1px solid #333",
            color: "#f0f0f0",
            borderRadius: 6,
            marginBottom: 20,
          }}
        />

        <div>
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <img
                src={img.url}
                alt={`preview-${index}`}
                style={{
                  width: 100,
                  height: "auto",
                  borderRadius: 8,
                  border: "1px solid #444",
                }}
              />
              <label style={{ flex: 1 }}>
                Quantidade:{" "}
                <input
                  type="number"
                  min={1}
                  value={img.quantity === 0 ? "" : img.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateQuantity(index, val === "" ? 0 : parseInt(val));
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      updateQuantity(index, 1);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: 6,
                    borderRadius: 6,
                    border: "1px solid #444",
                    backgroundColor: "#1e1e1e",
                    color: "#f0f0f0",
                  }}
                />
              </label>
            </div>
          ))}
        </div>

        {images.length > 0 && (
          <button
            onClick={generatePDF}
            style={{
              width: "100%",
              padding: "12px 20px",
              backgroundColor: "#007bff",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderRadius: 6,
              fontSize: 16,
            }}
          >
            Gerar PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
