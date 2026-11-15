import { useState } from "react";

const USERS = "pg_users";
const SESSION = "pg_session";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

async function hash(text) {
  if (!globalThis.crypto?.subtle) {
    let h = 5381;
    for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
    return `fallback-${h}`;
  }
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const publicUser = (u) => ({ name: u.name, email: u.email });

export function useAuth() {
  const [user, setUser] = useState(() => {
    const email = read(SESSION, null);
    const found = read(USERS, []).find((u) => u.email === email);
    return found ? publicUser(found) : null;
  });

  const register = async ({ name, email, password }) => {
    const mail = email.trim().toLowerCase();
    const users = read(USERS, []);
    if (users.some((u) => u.email === mail)) return "Email ini sudah terdaftar. Silakan masuk.";
    const account = { name: name.trim(), email: mail, pass: await hash(password) };
    localStorage.setItem(USERS, JSON.stringify([...users, account]));
    localStorage.setItem(SESSION, JSON.stringify(mail));
    setUser(publicUser(account));
    return "";
  };

  const login = async ({ email, password }) => {
    const mail = email.trim().toLowerCase();
    const account = read(USERS, []).find((u) => u.email === mail);
    if (!account || account.pass !== (await hash(password))) return "Email atau kata sandi salah.";
    localStorage.setItem(SESSION, JSON.stringify(mail));
    setUser(publicUser(account));
    return "";
  };

  const logout = () => {
    localStorage.removeItem(SESSION);
    setUser(null);
  };

  return { user, register, login, logout };
}
