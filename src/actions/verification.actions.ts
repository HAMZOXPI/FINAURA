"use server";



import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {

  isValidVerificationStoragePath,

  VERIFICATION_BUCKET,

} from "@/lib/verification/storage";



export interface VerificationSubmissionPayload {

  requestId: string;

  idFrontPath: string;

  idBackPath: string;

  selfiePath: string;

  proofOfAddressPath?: string | null;

}



function validateSubmissionPaths(

  sellerId: string,

  requestId: string,

  payload: VerificationSubmissionPayload

): string | null {

  if (!requestId || requestId.length < 10) {

    return "Invalid verification request";

  }



  if (!isValidVerificationStoragePath(sellerId, requestId, "id_front", payload.idFrontPath)) {

    return "Invalid document path";

  }

  if (!isValidVerificationStoragePath(sellerId, requestId, "id_back", payload.idBackPath)) {

    return "Invalid document path";

  }

  if (!isValidVerificationStoragePath(sellerId, requestId, "selfie", payload.selfiePath)) {

    return "Invalid document path";

  }

  if (

    payload.proofOfAddressPath &&

    !isValidVerificationStoragePath(

      sellerId,

      requestId,

      "proof_of_address",

      payload.proofOfAddressPath

    )

  ) {

    return "Invalid document path";

  }



  return null;

}



export async function submitVerificationRequest(payload: VerificationSubmissionPayload) {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) return { error: "Unauthorized" };



  const pathError = validateSubmissionPaths(user.id, payload.requestId, payload);

  if (pathError) return { error: pathError };



  const { data: profile } = await supabase

    .from("profiles")

    .select("is_verified")

    .eq("id", user.id)

    .single();



  if (profile?.is_verified) {

    return { error: "Your account is already verified" };

  }



  const { data: pendingRequest } = await supabase

    .from("verification_requests")

    .select("id")

    .eq("seller_id", user.id)

    .eq("status", "pending")

    .maybeSingle();



  if (pendingRequest) {

    return { error: "You already have a verification request under review" };

  }



  const uploadedPaths = [

    payload.idFrontPath,

    payload.idBackPath,

    payload.selfiePath,

    ...(payload.proofOfAddressPath ? [payload.proofOfAddressPath] : []),

  ];



  const { data: storedObjects, error: listError } = await supabase.storage

    .from(VERIFICATION_BUCKET)

    .list(`${user.id}/${payload.requestId}`);



  if (listError) {

    await supabase.storage.from(VERIFICATION_BUCKET).remove(uploadedPaths);

    return { error: listError.message };

  }



  const storedNames = new Set((storedObjects ?? []).map((item) => item.name));

  const allPathsExist = uploadedPaths.every((path) => {

    const fileName = path.split("/").pop();

    return fileName ? storedNames.has(fileName) : false;

  });



  if (!allPathsExist) {

    await supabase.storage.from(VERIFICATION_BUCKET).remove(uploadedPaths);

    return { error: "Uploaded documents could not be verified" };

  }



  const { error: insertError } = await supabase.from("verification_requests").insert({

    id: payload.requestId,

    seller_id: user.id,

    status: "pending",

    id_front: payload.idFrontPath,

    id_back: payload.idBackPath,

    selfie: payload.selfiePath,

    proof_of_address: payload.proofOfAddressPath ?? null,

  });



  if (insertError) {

    await supabase.storage.from(VERIFICATION_BUCKET).remove(uploadedPaths);

    return { error: insertError.message };

  }



  revalidatePath("/dashboard/settings");



  return { success: true };

}

