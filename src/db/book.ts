import { getDB } from "./db";

export const createBooksTable = async () => {
  const db = await getDB();
  await db.execAsync(`
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
  const db = await getDB();
  const count = await db.getFirstAsync(`SELECT COUNT(*) as c FROM books`);
  if (count.c === 0) {
    const now = Date.now();
    await db.runAsync(
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
  const db = await getDB();
  return await db.getAllAsync(`SELECT * FROM books ORDER BY created_at DESC`);
};

export const getBookById = async (id: number) => {
  const db = await getDB();
  return await db.getFirstAsync(`SELECT * FROM books WHERE id = ?`, [id]);
};

export const insertBook = async (title: string, author: string) => {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO books (title, author, status, created_at)
     VALUES (?, ?, 'planning', ?)`,
    [title, author, Date.now()]
  );
};

export const updateBook = async (id: number, data: any) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE books SET title=?, author=?, status=? WHERE id=?`,
    [data.title, data.author, data.status, id]
  );
};

export const deleteBook = async (id: number) => {
  const db = await getDB();
  await db.runAsync(`DELETE FROM books WHERE id=?`, [id]);
};
