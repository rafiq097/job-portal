"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });

    if (res.ok) {
      router.push("/api/auth/signin");
    } else {
      const data = await res.json();
      alert(data.error || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-bold">Sign Up</h1>
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
      <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="p-2 border rounded" />
      <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border rounded" />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">Sign Up</button>
    </form>
  );
}
