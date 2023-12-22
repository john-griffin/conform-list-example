import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, connection } from "./db";

migrate(db, { migrationsFolder: "drizzle" });
connection.close();
