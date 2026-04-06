import { Button } from "@workspace/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-20 dark:bg-zinc-950">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
          Admin
        </p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Shared Button validation
        </h1>
        <p className="mb-8 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          This admin homepage is using the same Button component from the shared workspace UI package.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button>Review tasks</Button>
          <Button variant="secondary">Open dashboard</Button>
        </div>
      </section>
    </main>
  );
}
