"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyNewMessage } from "@/lib/notifications/dispatch";
import type { MessageAttachmentType } from "@/types/database";

async function assertParticipant(conversationId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !data) return { error: "Conversation not found" };
  if (data.buyer_id !== userId && data.seller_id !== userId) {
    return { error: "Unauthorized" };
  }

  return { success: true as const };
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const conversationId = formData.get("conversation_id") as string;
  const content = (formData.get("content") as string)?.trim() ?? "";
  const attachmentUrl = (formData.get("attachment_url") as string) || null;
  const attachmentName = (formData.get("attachment_name") as string) || null;
  const attachmentType = (formData.get("attachment_type") as MessageAttachmentType) || null;

  if (!conversationId) return { error: "Invalid conversation" };
  if (!content && !attachmentUrl) return { error: "Message is empty" };

  const access = await assertParticipant(conversationId, user.id);
  if ("error" in access) return access;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content || null,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      attachment_type: attachmentType,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (conversation) {
    const recipientId =
      conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (recipientId) {
      await notifyNewMessage(recipientId, senderProfile?.full_name ?? "User", conversationId);
    }
  }

  await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "conversation_id,user_id" }
  );

  revalidatePath("/dashboard/messages");
  return { success: true as const, messageId: data.id };
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const access = await assertParticipant(conversationId, user.id);
  if ("error" in access) return access;

  const { error } = await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "conversation_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/messages");
  return { success: true };
}

export async function uploadMessageAttachment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const file = formData.get("file") as File | null;
  const conversationId = formData.get("conversation_id") as string;

  if (!file || !conversationId) return { error: "Invalid upload" };

  const access = await assertParticipant(conversationId, user.id);
  if ("error" in access) return access;

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const path = `${user.id}/${conversationId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("message-attachments")
    .upload(path, file, { upsert: false });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("message-attachments").getPublicUrl(path);

  const attachmentType: MessageAttachmentType = file.type.startsWith("image/")
    ? "image"
    : "file";

  return {
    success: true as const,
    url: publicUrl,
    name: file.name,
    type: attachmentType,
  };
}

export async function getOrCreateConversation(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, owner_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError || !property) return { error: "Property not found" };
  if (property.owner_id === user.id) return { error: "Cannot message yourself" };

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("property_id", propertyId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) return { success: true, conversationId: existing.id };

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      property_id: propertyId,
      buyer_id: user.id,
      seller_id: property.owner_id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/messages");
  return { success: true, conversationId: data.id };
}
