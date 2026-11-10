"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Notice, PageHeader, api } from "@/components/client";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("POST", "/api/auth", { password: new FormData(e.currentTarget).get("password") });
      router.replace("/admin");
      router.refresh();
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Staff sign in" lead="For coaches and the cashier." />
      <section>
        <div className="wrap">
          <form className="card login" onSubmit={submit}>
            <label htmlFor="password" style={{ marginTop: 0 }}>Staff password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus />
            <button className="btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
            <Notice state={error ? { ok: false, text: error } : null} />
          </form>
        </div>
      </section>
    </>
  );
}
