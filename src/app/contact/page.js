// app/about/page.tsx
"use client";

import Image from "next/image"; 
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

        try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error.");
    }
  }

  return (
    <main className="display-headings m-0 pr-3 min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-3xl mx-auto pt-2">
      <h2 className="font-bold pl-3 text-brand-brown/90 dark:text-brand-cream">Would you like to tell us something?</h2>

      <h4 className="mt-6 px-10 pb-15 text-brand-brown/90 dark:text-brand-cream"> If you have a suggestion, a question or you just want to say hi, you can fill out the form!</h4>
    
        <form
          onSubmit={onSubmit}
          className="mx-auto max-w-md space-y-6 rounded-lg border-2 border-brand-cream bg-brand-orange dark:bg-brand-brown p-6"
        >

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-brand-brown dark:text-brand-orange">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-input bg-brand-cream dark:bg-brand-cream px-3 py-2 text-brand-brown dark:text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-brown"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-brand-brown dark:text-brand-orange">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-brand-cream dark:bg-brand-cream px-3 py-2 text-brand-brown dark:text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-brown"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-brand-brown dark:text-brand-orange">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none rounded-md border border-input bg-brand-cream dark:bg-brand-cream px-3 py-2 text-brand-brown dark:text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-brown"
        />
      </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mx-auto block w-42 rounded-full bg-brand-blue px-4 py-2 text-brand-cream hover:bg-brand-brown dark:hover:bg-brand-orange dark:hover:text-brand-brown hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send message"}
          </button>
      
          {status === "sent" && (
            <p className="text-sm text-brand-brown/90 dark:text-brand-cream/90">
              Message sent.
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
          )}

          <p className="text-xs text-brand-brown/80 dark:text-brand-cream/80">
            Powered by Brevo
          </p>
        </form>

    <div className="flex items-center justify-center pt-20 pb-10 text-brand-brown">
    <Image
                src="/icons/EduiconPale.png"
                alt="Edurater logo"
                width={70}
                height={70}
                className="rounded-full"
                priority
              />
</div>
      </div>
    </main>
  );
}
