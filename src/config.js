import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "srv1454.hstgr.io";
export const DB_USER = process.env.DB_USER || "u392032808_odoov1";
export const DB_PASSWORD = process.env.DB_PASSWORD || "S1st3m4s.24";
export const DB_DATABASE = process.env.DB_DATABASE || "u392032808_odoov1";
export const DB_PORT = process.env.DB_PORT || 3306;
