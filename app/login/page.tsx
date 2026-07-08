import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/overview");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl2 bg-brand-gradient text-lg font-black shadow-glow">
            L
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none">LifeOS</h1>
            <p className="text-sm text-muted">Личный центр управления</p>
          </div>
        </div>
        <div className="panel p-6">
          <h2 className="mb-1 text-lg font-semibold">Вход</h2>
          <p className="mb-5 text-sm text-muted">
            Доступ только для владельца системы.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
