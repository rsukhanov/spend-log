"use client"
import { useEffect, useState } from "react"
import { retrieveRawInitData } from "@telegram-apps/sdk";
import { useUserStore } from "@lib/userStore";

const TELEGRAM_BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL;

export default function VerifyTelegramWebApp({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<string | null>(null);  
  const setUser = useUserStore(state => state.setUser);

  useEffect(() => {
    const verify = async () => {
      let rawInitData;
      let tgWebApp;
      try {
        rawInitData = retrieveRawInitData();
        tgWebApp = (window as any).Telegram.WebApp;
      } catch (error) {
        window.location.href = TELEGRAM_BOT_URL!;
        return;
      }
      if (!rawInitData || !tgWebApp) {
        window.location.href = TELEGRAM_BOT_URL!;
        return;
      }

      try {
        const res = await fetch("api/verify_tg_webapp", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawInitData }),
        })
        if(!res.ok){
          setState('Server error! Try later');
          return;
        }
        const data = await res.json();
        if (!data.ok) {
          setState("Error verifying Telegram Web App!" + data.error);
          return;
        }
        setUser(data.user);
        setState("OK");
        tgWebApp.ready();
      } catch (e) {
        setState(`Internal error: ${e}`);
      }
    };
    verify();
  }, []);

  if(state === "OK") {
    return <>{children}</>;
  }

  if (state) {
    return <p>{state}</p>;
  }
  
  return null;
}