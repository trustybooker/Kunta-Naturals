import { AppHeader } from '@/components/app-header';

export default function LoginPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="card" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Secure admin</p>
        <h1>Login</h1>
        <p>This page is ready for Supabase Auth. Add Supabase keys, enable email login, then wire the form action.</p>
        <form className="form-grid">
          <label>Email<input className="input" type="email" placeholder="owner@example.com" /></label>
          <label>Password<input className="input" type="password" placeholder="••••••••" /></label>
          <button type="button">Login when Supabase is connected</button>
        </form>
      </section>
    </main>
  );
}
