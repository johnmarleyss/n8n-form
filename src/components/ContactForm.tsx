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

export function ContactForm() {
  const [state, formAction] = useActionState(submitForm, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5" noValidate>
      <div>
        <label
          htmlFor="nome"
          className="mb-1 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <FieldError messages={state.errors?.nome} />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <FieldError messages={state.errors?.email} />
      </div>

      <div>
        <label
          htmlFor="telefone"
          className="mb-1 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Telefone <span className="text-zinc-400">(opcional)</span>
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <FieldError messages={state.errors?.telefone} />
      </div>

      <div>
        <label
          htmlFor="mensagem"
          className="mb-1 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Mensagem
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={5}
          required
          className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
