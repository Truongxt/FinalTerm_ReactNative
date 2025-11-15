import { openDatabaseAsync } from "expo-sqlite";

let db: any = null;

export const getDB = async () => {
  if (!db) {
    db = await openDatabaseAsync("readinglist.db");
  }
  return db;
};
