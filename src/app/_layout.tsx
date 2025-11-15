import "../global.css";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import db from "../db/db";

export default function Layout() {
  useEffect(() => {
    db.initDB().catch((e) => console.warn("DB init failed:", e));
  }, []);

  return <Slot />;
}
