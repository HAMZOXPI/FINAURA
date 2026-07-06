export const VERIFICATION_BUCKET = "verification-documents";
export const MAX_VERIFICATION_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_VERIFICATION_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VERIFICATION_PROOF_TYPES = [
  ...ALLOWED_VERIFICATION_IMAGE_TYPES,
  "application/pdf",
];

export function extensionForVerificationMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "application/pdf") return "pdf";
  return "jpg";
}

export function buildVerificationStoragePath(
  sellerId: string,
  requestId: string,
  field: string,
  mime: string
): string {
  const extension = extensionForVerificationMime(mime);
  return `${sellerId}/${requestId}/${field}.${extension}`;
}

const FIELD_EXTENSIONS: Record<string, string[]> = {
  id_front: ["jpg", "png", "webp"],
  id_back: ["jpg", "png", "webp"],
  selfie: ["jpg", "png", "webp"],
  proof_of_address: ["jpg", "png", "webp", "pdf"],
};

export function isValidVerificationStoragePath(
  sellerId: string,
  requestId: string,
  field: keyof typeof FIELD_EXTENSIONS,
  path: string
): boolean {
  if (!path.startsWith(`${sellerId}/${requestId}/`)) return false;

  const fileName = path.slice(`${sellerId}/${requestId}/`.length);
  const extensions = FIELD_EXTENSIONS[field];
  return extensions.some((extension) => fileName === `${field}.${extension}`);
}
