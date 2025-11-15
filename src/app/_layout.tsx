import { createBooksTable, seedBooks } from "@/db/book";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    (async () => {
      await createBooksTable();
      await seedBooks();
    })();
  }, []);

  return <Stack />;
}
