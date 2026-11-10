"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/components/client";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
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
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <i><Image src="/images/crest.png" alt="" width={96} height={96} priority /></i>
        <h1>Admin sign in</h1>
        <p>For coaches and the cashier.</p>
        <label>
          Staff password
          <input name="password" type="password" required autoComplete="current-password" autoFocus />
        </label>
        {error && <div className="msg err" role="alert">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <Link className="link" href="/">← Back to website</Link>
      </form>
    </div>
  );
}
