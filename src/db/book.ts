import { runAsync, getAllAsync, getFirstAsync } from "./db";

export const createBooksTable = async () => {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      status TEXT DEFAULT 'planning',
      created_at INTEGER
    );
  `);
};

export const seedBooks = async () => {
  const count = await getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM books`);
  if (count?.c === 0) {
    const now = Date.now();
    await runAsync(
      `INSERT INTO books (title, author, status, created_at)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
      [
        "Clean Code", "Robert C. Martin", "planning", now,
        "Atomic Habits", "James Clear", "planning", now
      ]
    );
  }
};

export const getAllBooks = async () => {
  return await getAllAsync(`SELECT * FROM books ORDER BY created_at DESC`);
};

export const getBookById = async (id: number) => {
  return await getFirstAsync(`SELECT * FROM books WHERE id = ?`, [id]);
};

export const insertBook = async (title: string, author: string) => {
  await runAsync(
    `INSERT INTO books (title, author, status, created_at)
     VALUES (?, ?, 'planning', ?)`,
    [title, author, Date.now()]
  );
};

export const updateBook = async (id: number, data: { title: string; author: string; status: string }) => {
  await runAsync(
    `UPDATE books SET title=?, author=?, status=? WHERE id=?`,
    [data.title, data.author, data.status, id]
  );
};

export const deleteBook = async (id: number) => {
  await runAsync(`DELETE FROM books WHERE id=?`, [id]);
};
