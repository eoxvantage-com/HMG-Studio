const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const UUID_SOURCE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const UUID = new RegExp(`^${UUID_SOURCE}$`, "i");
const CATALOGUE = /^storage:\/\/(products|images)\/(hmg-catalogue\/[a-f0-9]{64}\.(?:jpg|jpeg|png|webp))$/;
// Audited catalogue migration only; never accept arbitrary migration folders or URLs.
const MIGRATED_CATALOGUE = /^storage:\/\/(products)\/(migration-b6cc3e51248d4cfe91f8dfcfc8fcea41\/hmg-catalogue\/[a-f0-9]{64}\.(?:jpg|jpeg|png|webp))$/;
const UPLOAD = new RegExp(`^storage://(products)/(hmg-products/${UUID_SOURCE}/${UUID_SOURCE}/[a-f0-9]{64}\\.(?:jpg|png|webp))$`);

export type ProductImageSelection = {
  file: File;
  sha256: string;
  upload: { content_base64: string; content_type: string };
};

export function privateProductImagePath(source: string): { bucket: string; path: string } | null {
  const match = CATALOGUE.exec(source) ?? MIGRATED_CATALOGUE.exec(source) ?? UPLOAD.exec(source);
  return match ? { bucket: match[1], path: match[2] } : null;
}

/** Validation is repeated by the Python command; these checks provide prompt feedback. */
export async function prepareProductImage(file: File): Promise<ProductImageSelection> {
  if (!EXTENSIONS[file.type]) throw new Error("Choose a PNG, JPEG or WebP image.");
  if (!file.size || file.size > MAX_BYTES) throw new Error("Choose a non-empty image no larger than 2 MB.");
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Unable to read this image."));
    reader.onerror = reader.onabort = () => reject(new Error("Unable to read this image."));
    reader.readAsArrayBuffer(file);
  });
  const bytes = new Uint8Array(buffer);
  const starts = (signature: number[]) => signature.every((value, index) => bytes[index] === value);
  const valid = file.type === "image/png" ? starts([137, 80, 78, 71, 13, 10, 26, 10])
    : file.type === "image/jpeg" ? starts([255, 216, 255])
      : starts([82, 73, 70, 70]) && [87, 69, 66, 80].every((value, index) => bytes[index + 8] === value);
  if (!valid) throw new Error("The file content does not match its image type.");
  if (!crypto.subtle) throw new Error("Image processing is unavailable. Open the secure app URL and try again.");
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const sha256 = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return { file, sha256, upload: { content_base64: btoa(binary), content_type: file.type } };
}

/** Expected readback only. The command derives this path independently. */
export function productImageUri(selection: ProductImageSelection, organizationId: string, productId: string): string {
  if (!UUID.test(organizationId) || !UUID.test(productId) || !/^[a-f0-9]{64}$/.test(selection.sha256) || !EXTENSIONS[selection.upload.content_type]) throw new Error("Select a valid organization before saving the image.");
  return `storage://products/hmg-products/${organizationId.toLowerCase()}/${productId.toLowerCase()}/${selection.sha256}.${EXTENSIONS[selection.upload.content_type]}`;
}
