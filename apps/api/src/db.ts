import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 單例。
 * 這個資料庫只用來儲存「查詢歷史」(見 prisma/schema.prisma 的註解)，
 * 絕對不會有欄位存放使用者的哩程帳號密碼或2FA驗證碼。
 */
export const prisma = new PrismaClient();
