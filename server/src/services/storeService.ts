import { db } from "../db/database";

export const storeService = {
  getAll(): Record<string, string> {
    const rows = db.prepare("SELECT key, value FROM store_settings").all() as { key: string; value: string }[];
    const res: Record<string, string> = {};
    for (const r of rows) res[r.key] = r.value;
    return res;
  },

  get(key: string, defaultValue = ""): string {
    const row = db.prepare("SELECT value FROM store_settings WHERE key = ?").get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  },

  setMany(entries: Record<string, string>): void {
    const stmt = db.prepare("INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    const tx = db.transaction((data: Record<string, string>) => {
      for (const [k, v] of Object.entries(data)) {
        stmt.run(k, v);
      }
    });
    tx(entries);
  }
};
