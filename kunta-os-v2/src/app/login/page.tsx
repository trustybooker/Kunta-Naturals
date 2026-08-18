import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="shell">
      <section className="card" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Secure admin</p>
        <h1>Login</h1>
        <p>Manage products, content, approvals, files, leads, orders, and analytics from one protected workspace. First-time setup is restricted to fifynow@gmail.com.</p>
        <LoginForm />
      </section>
    </main>
  );
}
