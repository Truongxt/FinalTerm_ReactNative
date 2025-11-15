import * as SQLite from "expo-sqlite";

let db: any = null;

function wrapLegacy(rawDb: any) {
  return {
    execAsync: (sql: string) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => {
            tx.executeSql(sql, [], (_: any, res: any) => resolve(res), (_: any, err: any) => reject(err));
          },
          (err: any) => reject(err)
        );
      }),
    runAsync: (sql: string, params: any[] = []) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => {
            tx.executeSql(sql, params, (_: any, res: any) => resolve(res), (_: any, err: any) => reject(err));
          },
          (err: any) => reject(err)
        );
      }),
    getAllAsync: (sql: string, params: any[] = []) =>
      new Promise((resolve, reject) => {
        rawDb.transaction(
          (tx: any) => {
            tx.executeSql(sql, params, (_: any, res: any) => {
              const rows = [];
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
          (tx: any) => {
            tx.executeSql(sql, params, (_: any, res: any) => {
              if (res.rows.length > 0) resolve(res.rows.item(0));
              else resolve({});
            }, (_: any, err: any) => reject(err));
          },
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
  const sqliteAny = SQLite as any;
  // prefer openDatabaseAsync when available (newer expo-sqlite)
  if (sqliteAny.openDatabaseAsync && typeof sqliteAny.openDatabaseAsync === "function") {
    db = await sqliteAny.openDatabaseAsync("readinglist.db");
    return db;
  }
  // fallback to legacy openDatabase and wrap
  if (sqliteAny.openDatabase && typeof sqliteAny.openDatabase === "function") {
    const raw = sqliteAny.openDatabase("readinglist.db");
    db = wrapLegacy(raw);
    return db;
  }
  throw new Error("expo-sqlite openDatabase is not available");
};
