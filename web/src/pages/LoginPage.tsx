import { AuthForm } from '../components/auth/AuthForm';
import { ThemeToggle } from '../components/layout/ThemeToggle';

export function LoginPage() {
  return (
    <div className="grid min-h-full place-items-center p-5">
      <div className="w-full max-w-md border border-rule bg-surface p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">catálogo multi-empresa</p>
            <h1 className="mt-1.5 text-2xl font-semibold">Entrar</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Gerencie os produtos da sua empresa e converse com o assistente.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
