"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.scss";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      setLoading(false);

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <h1 className={styles.title}>Create Account</h1>
        <form onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Firstname Lastname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles.registerButton}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

        <Link href="/login" className={styles.loginLink}>
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}
