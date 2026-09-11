import { z } from "zod";

/**
 * Esquema de validação do formulário.
 * Os campos e nomes aqui definem exatamente o JSON enviado ao webhook do n8n.
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
    .min(8, "Informe um telefone válido.")
    .max(30, "Telefone muito longo."),
  empresa: z
    .string()
    .trim()
    .max(160, "Nome da empresa muito longo.")
    .optional()
    .or(z.literal("")),
  interesse: z
    .string()
    .trim()
    .min(2, "Conte pra gente qual é o seu interesse.")
    .max(200, "Texto muito longo."),
  orcamento: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number("Informe um valor numérico.")
      .positive("Orçamento deve ser maior que zero.")
      .optional()
  ),
  mensagem: z
    .string()
    .trim()
    .min(10, "A mensagem deve ter pelo menos 10 caracteres.")
    .max(2000, "Mensagem muito longa."),
});

export type FormValues = z.infer<typeof formSchema>;
