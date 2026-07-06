"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_VERIFICATION_IMAGE_TYPES,
  ALLOWED_VERIFICATION_PROOF_TYPES,
  buildVerificationStoragePath,
  MAX_VERIFICATION_FILE_BYTES,
  VERIFICATION_BUCKET,
} from "@/lib/verification/storage";

export async function uploadVerificationDocument(
  sellerId: string,
  requestId: string,
  field: string,
  file: File,
  allowedTypes: string[]
): Promise<{ path?: string; error?: string }> {
  if (!file || file.size === 0) {
    return { error: `Missing file: ${field}` };
  }

  if (file.size > MAX_VERIFICATION_FILE_BYTES) {
    return { error: "Each file must be under 5 MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file format" };
  }

  const path = buildVerificationStoragePath(sellerId, requestId, field, file.type);
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) return { error: error.message };
  return { path };
}

export async function uploadVerificationDocuments(
  sellerId: string,
  requestId: string,
  files: {
    idFront: File;
    idBack: File;
    selfie: File;
    proofOfAddress?: File | null;
  }
): Promise<{
  paths?: {
    idFrontPath: string;
    idBackPath: string;
    selfiePath: string;
    proofOfAddressPath: string | null;
  };
  error?: string;
}> {
  const [frontResult, backResult, selfieResult] = await Promise.all([
    uploadVerificationDocument(
      sellerId,
      requestId,
      "id_front",
      files.idFront,
      ALLOWED_VERIFICATION_IMAGE_TYPES
    ),
    uploadVerificationDocument(
      sellerId,
      requestId,
      "id_back",
      files.idBack,
      ALLOWED_VERIFICATION_IMAGE_TYPES
    ),
    uploadVerificationDocument(
      sellerId,
      requestId,
      "selfie",
      files.selfie,
      ALLOWED_VERIFICATION_IMAGE_TYPES
    ),
  ]);

  if (frontResult.error) return { error: frontResult.error };
  if (backResult.error) return { error: backResult.error };
  if (selfieResult.error) return { error: selfieResult.error };

  let proofOfAddressPath: string | null = null;
  if (files.proofOfAddress && files.proofOfAddress.size > 0) {
    const proofResult = await uploadVerificationDocument(
      sellerId,
      requestId,
      "proof_of_address",
      files.proofOfAddress,
      ALLOWED_VERIFICATION_PROOF_TYPES
    );
    if (proofResult.error) {
      await removeVerificationPaths([
        frontResult.path!,
        backResult.path!,
        selfieResult.path!,
      ]);
      return { error: proofResult.error };
    }
    proofOfAddressPath = proofResult.path ?? null;
  }

  return {
    paths: {
      idFrontPath: frontResult.path!,
      idBackPath: backResult.path!,
      selfiePath: selfieResult.path!,
      proofOfAddressPath,
    },
  };
}

export async function removeVerificationPaths(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(VERIFICATION_BUCKET).remove(paths);
}
