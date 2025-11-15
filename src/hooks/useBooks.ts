import { deleteBook, getAllBooks, insertBook, updateBook } from "@/db/book";
import { useEffect, useState, useCallback } from "react";

export default function useBooks() {
  const [books, setBooks] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getAllBooks();
    setBooks(data);
  }, []);

  useEffect(() => {
    load();
  }, []);

  const add = async (title: string, author: string) => {
    await insertBook(title, author);
    await load();
  };

  const importFromAPI = useCallback(async (url?: string) => {
    setImportLoading(true);
    setImportError(null);
    try {
      const fetchUrl = url && url.trim() !== "" ? url : "https://openlibrary.org/subjects/programming.json?limit=10";
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const works = data.works || data.items || [];
      const existing = (books || []).map((b: any) => (b.title || "").toLowerCase());
      let added = 0;
      let skipped = 0;
      for (const w of works) {
        const title = w.title || w.name || w.title_suggest || "";
        const author = (w.authors && w.authors[0] && w.authors[0].name) || w.author_name && w.author_name[0] || "";
        if (existing.includes((title || "").toLowerCase())) {
          skipped++;
          continue;
        }
        await insertBook(title, author);
        added++;
      }
      await load();
      return { added, skipped };
    } catch (err: any) {
      setImportError(err?.message || String(err));
      throw err;
    } finally {
      setImportLoading(false);
    }
  }, [books, load]);

  const edit = async (id: number, data: any) => {
    await updateBook(id, data);
    await load();
  };

  const remove = async (id: number) => {
    await deleteBook(id);
    await load();
  };

  const cycleStatus = async (book: any) => {
    const next =
      book.status === "planning"
        ? "reading"
        : book.status === "reading"
        ? "done"
        : "planning";

    await updateBook(book.id, {
      ...book,
      status: next,
    });

    await load();
  };

  return {
    books,
    load,
    add,
    edit,
    remove,
    cycleStatus,
    importFromAPI,
    importLoading,
    importError,
  };
}
