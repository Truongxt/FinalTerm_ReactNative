let db: any = null;

function wrapLegacy(rawDb: any) {
  return {
    execAsync: (sql: string) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => tx.executeSql(sql, [], (_: any, res: any) => resolve(res), (_: any, err: any) => reject(err)),
          (err: any) => reject(err)
        );
      }),
    runAsync: (sql: string, params: any[] = []) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => tx.executeSql(sql, params, (_: any, res: any) => resolve(res), (_: any, err: any) => reject(err)),
          (err: any) => reject(err)
        );
      }),
    getAllAsync: (sql: string, params: any[] = []) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => {
            tx.executeSql(sql, params, (_: any, res: any) => {
              const rows: any[] = [];
              for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
              resolve(rows);
            }, (_: any, err: any) => reject(err));
          },
          (err: any) => reject(err)
        );
      }),
    getFirstAsync: (sql: string, params: any[] = []) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => tx.executeSql(sql, params, (_: any, res: any) => (res.rows.length > 0 ? resolve(res.rows.item(0)) : resolve({})), (_: any, err: any) => reject(err)),
          (err: any) => reject(err)
        );
      }),
  };
}

function createMockDb() {
  console.warn("expo-sqlite not available — using in-memory mock DB. Persistence disabled.");
  return {
    execAsync: async () => ({}),
    runAsync: async () => ({}),
    getAllAsync: async () => [] as any[],
    getFirstAsync: async () => ({}),
  };
}

export const getDB = async () => {
  if (db) return db;

  try {
    const sqliteAny = await import("expo-sqlite");
    const sqliteModule: any = sqliteAny;
    const keys = Object.keys(sqliteModule);
    console.log("expo-sqlite keys:", keys);

    // Try legacy openDatabase first (if available on this build)
    if (sqliteModule.openDatabase && typeof sqliteModule.openDatabase === "function") {
      try {
        const raw = sqliteModule.openDatabase("readinglist.db");
        db = wrapLegacy(raw);
        console.log("Using legacy openDatabase (wrapped)");
        return db;
      } catch (e) {
        console.warn("legacy openDatabase failed:", e);
      }
    }

    // Try async openDatabase (newer expo)
    if (sqliteModule.openDatabaseAsync && typeof sqliteModule.openDatabaseAsync === "function") {
      try {
        db = await sqliteModule.openDatabaseAsync("readinglist.db");
        console.log("Using openDatabaseAsync");
        return db;
      } catch (e) {
        console.warn("openDatabaseAsync failed:", e);
      }
    }

    console.warn("expo-sqlite openDatabase API unavailable or failing, falling back to mock DB");
    db = createMockDb();
    return db;
  } catch (err) {
    console.warn("getDB import/open error — using mock DB:", err);
    db = createMockDb();
    return db;
  }
};

export const runAsync = async (sql: string, params: any[] = []) => {
  const database = await getDB();
  return database.runAsync(sql, params);
};

export const getAllAsync = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  const database = await getDB();
  const rows: any[] = await database.getAllAsync(sql, params);
  return rows as T[];
};

export const getFirstAsync = async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
  const rows = await getAllAsync<T>(sql, params);
  return rows[0] ?? null;
};
