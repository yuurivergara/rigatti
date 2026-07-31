import { useState } from 'react';
import { errorMessage } from '../../api/http';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../ui/Button';
import { Field, TextInput } from '../ui/Field';
import { Alert } from '../ui/Feedback';

type Mode = 'login' | 'register';

const EMPTY = { companyName: '', name: '', email: '', password: '' };

export function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível concluir'));
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  }

  return (
    <>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {mode === 'register' && (
          <>
            <Field label="Empresa">
              <TextInput
                required
                minLength={2}
                value={form.companyName}
                onChange={(event) => update('companyName')(event.target.value)}
              />
            </Field>
            <Field label="Seu nome">
              <TextInput
                required
                minLength={2}
                value={form.name}
                onChange={(event) => update('name')(event.target.value)}
              />
            </Field>
          </>
        )}

        <Field label="E-mail">
          <TextInput
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email')(event.target.value)}
          />
        </Field>

        <Field label="Senha" hint={mode === 'register' ? 'Mínimo de 8 caracteres.' : undefined}>
          <TextInput
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={(event) => update('password')(event.target.value)}
          />
        </Field>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar empresa'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === 'login' ? 'Ainda não tem empresa? ' : 'Já tem conta? '}
        <button type="button" onClick={switchMode} className="font-medium text-indigo underline-offset-2 hover:underline">
          {mode === 'login' ? 'Cadastrar' : 'Entrar'}
        </button>
      </p>

      {mode === 'login' && <SeedAccounts />}
    </>
  );
}

function SeedAccounts() {
  const accounts = [
    ['Rigatti Móveis', 'admin@rigatti.com', 'user@rigatti.com'],
    ['TechNova', 'admin@technova.com', 'user@technova.com'],
  ];

  return (
    <div className="mt-6 border border-rule bg-paper p-3">
      <p className="eyebrow">contas do seed · senha senha1234</p>
      <dl className="mt-2 space-y-1 font-mono text-[11px] text-ink-soft">
        {accounts.map(([company, admin, member]) => (
          <div key={company} className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink">{company}</dt>
            <dd>
              {admin} · {member}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
