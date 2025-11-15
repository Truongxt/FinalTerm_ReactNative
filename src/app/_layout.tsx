import { Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    // dynamic import to avoid requiring native modules during route parsing
    (async () => {
      try {
        const mod = await import("../db/book");
        if (mod.createBooksTable) await mod.createBooksTable();
        if (mod.seedBooks) await mod.seedBooks();
      } catch (e) {
        console.warn("DB create/seed failed:", e);
      }
    })();
  }, []);

  return <Stack />;
}
