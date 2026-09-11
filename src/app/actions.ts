"use server";

import { z } from "zod";
import { formSchema } from "@/lib/schema";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<keyof typeof formSchema.shape, string[]>>;
};

/**
 * Server Action: valida os dados do formulário e envia para o webhook do n8n.
 * A URL do webhook fica apenas no ambiente do servidor (nunca chega ao client).
 */
export async function submitForm(
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const raw = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    empresa: formData.get("empresa"),
    interesse: formData.get("interesse"),
    orcamento: formData.get("orcamento"),
    mensagem: formData.get("mensagem"),
  };

  const parsed = formSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("N8N_WEBHOOK_URL não está configurada no ambiente.");
    return {
      status: "error",
      message:
        "Formulário indisponível no momento. Tente novamente mais tarde.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `Webhook n8n retornou status ${response.status} (${response.statusText})`
      );
      return {
        status: "error",
        message: "Não foi possível enviar o formulário. Tente novamente.",
      };
    }

    return {
      status: "success",
      message: "Formulário enviado com sucesso! Em breve entraremos em contato.",
    };
  } catch (error) {
    console.error("Erro ao enviar formulário para o n8n:", error);
    return {
      status: "error",
      message: "Não foi possível enviar o formulário. Tente novamente.",
    };
  }
}
