import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const SESSION_USER = "pg_user";
const SESSION_TOKEN = "pg_token";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export function useAuth() {
  // Muat status user dan token dari localStorage agar tetap login saat halaman direfresh
  const [user, setUser] = useState(() => read(SESSION_USER, null));
  const [token, setToken] = useState(() => read(SESSION_TOKEN, null));

  const register = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return data.detail || "Gagal mendaftar. Silakan coba lagi.";
      }
      
      return ""; // Mengembalikan string kosong = sukses (Auth.jsx akan otomatis pindah ke mode login)
    } catch (error) {
      console.error("Register Error:", error);
      return "Terjadi masalah jaringan. Pastikan backend berjalan.";
    }
  };

  const login = async ({ email, password }) => {
    try {
      // FastAPI OAuth2 membutuhkan format URL Encoded form, dengan key 'username'
      const formData = new URLSearchParams();
      formData.append("username", email.trim().toLowerCase());
      formData.append("password", password);

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return data.detail || "Email atau kata sandi salah.";
      }

      // Berhasil login, simpan token dan user
      const loggedUser = { email: data.email };
      const accessToken = data.access_token;

      localStorage.setItem(SESSION_USER, JSON.stringify(loggedUser));
      localStorage.setItem(SESSION_TOKEN, JSON.stringify(accessToken));
      
      setUser(loggedUser);
      setToken(accessToken);
      
      return ""; // Sukses
    } catch (error) {
      console.error("Login Error:", error);
      return "Terjadi masalah jaringan. Pastikan backend berjalan.";
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_USER);
    localStorage.removeItem(SESSION_TOKEN);
    setUser(null);
    setToken(null);
  };

  // Sekarang kita juga mengekspor `token` agar bisa dipakai App.jsx
  return { user, token, register, login, logout };
}