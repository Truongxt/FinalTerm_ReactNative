import { deleteBook, getAllBooks, insertBook, updateBook } from "@/db/book";
import { useEffect, useState, useCallback } from "react";

export default function useBooks() {
  const [books, setBooks] = useState([]);

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
  };
}
