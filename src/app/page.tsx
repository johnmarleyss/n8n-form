import { ContactForm } from "@/components/ContactForm";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <main className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Fale conosco
        </h1>
        <p className="mt-1 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Preencha os dados abaixo. Seu envio será processado automaticamente.
        </p>
        <ContactForm />
      </main>
    </div>
  );
}
