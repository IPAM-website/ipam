export const parseCSV = (
  file: File,
): Promise<{ headers: string[]; data: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      // Determina il delimitatore (virgola o punto e virgola)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";

      const headers = firstLine.split(delimiter).map((h) => h.trim());

      const data = lines.slice(1).map((line) => {
        const values = line.split(delimiter);
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index]?.trim() || "";
          return obj;
        }, {} as any);
      });

      resolve({ headers, data });
    };

    reader.onerror = () => reject(new Error("Errore nella lettura del file"));
    reader.readAsText(file);
  });
};
