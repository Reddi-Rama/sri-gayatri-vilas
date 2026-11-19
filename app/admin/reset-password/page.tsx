"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully! You can now log in.");
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#101010",
      color: "#f5e9d0",
      padding: "24px"
    }}>
      <form onSubmit={handleReset} style={{
        width: "100%",
        maxWidth: "400px",
        padding: "35px",
        background: "#1b1b1b",
        border: "1px solid #b99a58",
        borderRadius: "12px"
      }}>
        <h1 style={{ marginBottom: "12px" }}>
          Reset Admin Password
        </h1>

        <p style={{ marginBottom: "25px", color: "#aaa" }}>
          Enter your new administrator password.
        </p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#b99a58",
            color: "#111",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <p style={{ marginTop: "18px" }}>{message}</p>

        <a
          href="/admin"
          style={{ color: "#d2b879", display: "block", marginTop: "15px" }}
        >
          Back to Admin Login
        </a>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  marginBottom: "16px",
  background: "#292929",
  color: "white",
  border: "1px solid #555",
  borderRadius: "6px",
  boxSizing: "border-box"
};
