import { z } from "zod";

/**
 * Esquema de validação do formulário.
 * Ajuste os campos aqui conforme os dados que o workflow do n8n espera receber.
 */
export const formSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  email: z.email("Informe um e-mail válido."),
  telefone: z
    .string()
    .trim()
    .max(30, "Telefone muito longo.")
    .optional()
    .or(z.literal("")),
  mensagem: z
    .string()
    .trim()
    .min(10, "A mensagem deve ter pelo menos 10 caracteres.")
    .max(2000, "Mensagem muito longa."),
});

export type FormValues = z.infer<typeof formSchema>;
