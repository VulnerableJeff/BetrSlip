import Tesseract from "tesseract.js";

export async function ocrImage(file: File): Promise<string> {
  // @ts-ignore: tesseract typings can be noisy in TS projects
  const { data } = await Tesseract.recognize(file, "eng");
  return (data?.text ?? "").trim();
}
