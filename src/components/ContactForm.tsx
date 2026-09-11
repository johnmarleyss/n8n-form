"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitForm, type SubmitState } from "@/app/actions";

const initialState: SubmitState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
    >
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {messages[0]}
    </p>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const labelClass = "mb-1 block text-sm font-medium text-zinc-900 dark:text-zinc-100";

export function ContactForm() {
  const [state, formAction] = useActionState(submitForm, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5" noValidate>
      <div>
        <label htmlFor="nome" className={labelClass}>
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
        <FieldError messages={state.errors?.nome} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
        <FieldError messages={state.errors?.email} />
      </div>

      <div>
        <label htmlFor="telefone" className={labelClass}>
          Telefone
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          required
          autoComplete="tel"
          className={inputClass}
        />
        <FieldError messages={state.errors?.telefone} />
      </div>

      <div>
        <label htmlFor="empresa" className={labelClass}>
          Empresa <span className="text-zinc-400">(opcional)</span>
        </label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          autoComplete="organization"
          className={inputClass}
        />
        <FieldError messages={state.errors?.empresa} />
      </div>

      <div>
        <label htmlFor="interesse" className={labelClass}>
          Interesse
        </label>
        <input
          id="interesse"
          name="interesse"
          type="text"
          required
          placeholder="Ex.: Desenvolvimento de sistema"
          className={inputClass}
        />
        <FieldError messages={state.errors?.interesse} />
      </div>

      <div>
        <label htmlFor="orcamento" className={labelClass}>
          Orçamento estimado <span className="text-zinc-400">(opcional)</span>
        </label>
        <input
          id="orcamento"
          name="orcamento"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Ex.: 15000"
          className={inputClass}
        />
        <FieldError messages={state.errors?.orcamento} />
      </div>

      <div>
        <label htmlFor="mensagem" className={labelClass}>
          Mensagem
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={5}
          required
          className={`${inputClass} resize-none`}
        />
        <FieldError messages={state.errors?.mensagem} />
      </div>

      {state.status !== "idle" && (
        <p
          role="status"
          aria-live="polite"
          className={
            state.status === "success"
              ? "text-sm text-green-600 dark:text-green-400"
              : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
