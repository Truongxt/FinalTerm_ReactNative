import * as SQLite from "expo-sqlite";

export type Book = {
	id?: number;
	title: string;
	author?: string | null;
	status?: "planning" | "reading" | "done";
	created_at?: number;
};

const db = (SQLite as any).openDatabase("reading_list.db");

function executeSql<T = any>(sql: string, params: any[] = []): Promise<T> {
	return new Promise((resolve, reject) => {
		db.transaction((tx) => {
			tx.executeSql(
				sql,
				params,
				(_, result) => resolve(result as unknown as T),
				(_, err) => {
					reject(err);
					return false;
				}
			);
		}, (txErr) => reject(txErr));
	});
}

export async function initDB(): Promise<void> {
	try {
		await executeSql(
			`CREATE TABLE IF NOT EXISTS books(
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				author TEXT,
				status TEXT DEFAULT 'planning',
				created_at INTEGER
			);`
		);

		// Seed sample data if table empty
		const res: any = await executeSql(`SELECT COUNT(*) as cnt FROM books;`);
		const count = res.rows?.item ? res.rows.item(0).cnt : (res.rows.length ? res.rows.length : 0);
		if (count === 0) {
			const now = Date.now();
			const samples: Book[] = [
				{ title: "Clean Code", author: "Robert C. Martin", status: "planning", created_at: now },
				{ title: "Atomic Habits", author: "James Clear", status: "planning", created_at: now - 1000 },
			];

			await new Promise<void>((resolve, reject) => {
				db.transaction((tx) => {
					for (const b of samples) {
						tx.executeSql(
							`INSERT INTO books (title, author, status, created_at) VALUES (?, ?, ?, ?);`,
							[b.title, b.author ?? null, b.status ?? "planning", b.created_at ?? Date.now()]
						);
					}
				}, (err) => reject(err), () => resolve());
			});
		}
	} catch (err) {
		console.warn("initDB error:", err);
		throw err;
	}
}

export async function getAllBooks(): Promise<Book[]> {
	const res: any = await executeSql(`SELECT * FROM books ORDER BY created_at DESC;`);
	const items: Book[] = [];
	try {
		const rows = res.rows;
		for (let i = 0; i < rows.length; i++) {
			items.push(rows.item(i));
		}
	} catch (e) {
		// older result shape fallback
		if (res.rows && Array.isArray(res.rows)) {
			return res.rows;
		}
	}
	return items;
}

export async function insertBook(book: Book): Promise<number> {
	const created = book.created_at ?? Date.now();
	const res: any = await executeSql(
		`INSERT INTO books (title, author, status, created_at) VALUES (?, ?, ?, ?);`,
		[book.title, book.author ?? null, book.status ?? "planning", created]
	);
	try {
		return res.insertId ?? res.rows.insertId ?? 0;
	} catch {
		return 0;
	}
}

export async function updateBook(id: number, fields: Partial<Book>): Promise<void> {
	const set: string[] = [];
	const params: any[] = [];
	if (fields.title !== undefined) {
		set.push("title = ?");
		params.push(fields.title);
	}
	if (fields.author !== undefined) {
		set.push("author = ?");
		params.push(fields.author);
	}
	if (fields.status !== undefined) {
		set.push("status = ?");
		params.push(fields.status);
	}
	if (set.length === 0) return;
	params.push(id);
	await executeSql(`UPDATE books SET ${set.join(", ")} WHERE id = ?;`, params);
}

export async function deleteBook(id: number): Promise<void> {
	await executeSql(`DELETE FROM books WHERE id = ?;`, [id]);
}

export async function importBooksFromArray(books: Book[]): Promise<{ added: number; skipped: number }> {
	let added = 0;
	let skipped = 0;
	await new Promise<void>((resolve, reject) => {
		db.transaction((tx) => {
			for (const b of books) {
				tx.executeSql(
					`SELECT COUNT(*) as cnt FROM books WHERE title = ?;`,
					[b.title],
					(_, r) => {
						const cnt = r.rows.item(0).cnt;
						if (cnt === 0) {
							tx.executeSql(`INSERT INTO books (title, author, status, created_at) VALUES (?, ?, ?, ?);`, [b.title, b.author ?? null, b.status ?? 'planning', b.created_at ?? Date.now()]);
							added++;
						} else {
							skipped++;
						}
					}
				);
			}
		}, (err) => reject(err), () => resolve());
	});
	return { added, skipped };
}

export default {
	initDB,
	getAllBooks,
	insertBook,
	updateBook,
	deleteBook,
	importBooksFromArray,
};
