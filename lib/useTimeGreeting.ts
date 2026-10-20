import { useEffect, useState } from "react";

export function useTimeGreeting() {
  const [greeting, setGreeting] = useState("Halo");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 10) setGreeting("Selamat Pagi");
    else if (hour < 15) setGreeting("Selamat Siang");
    else if (hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
  }, []);

  return greeting;
}
