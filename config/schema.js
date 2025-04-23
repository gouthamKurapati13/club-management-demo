import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

export const boards = pgTable("boards", {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    name: varchar("name").notNull(),
    price: integer("price").notNull(),
    startedAt: varchar("startedAt").default(null), // Ensure this matches the database column name
    endedAt: varchar("endedAt").default(null),
    products: varchar("products").default(null), // Store JSON data
    totalPrice: integer("totalPrice").default(0)
});

export const snacks = pgTable("snacks", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    price: integer("price").notNull(),
});

export const customers = pgTable("customers", {
   id: serial("id").primaryKey(),
   name: varchar("name").notNull(),
   phoneNo: varchar("phoneNo", {length: 10}).notNull(),
   discount: integer("discount").notNull()
});

export const staff = pgTable("staff", {
    id: serial("id").primaryKey(),
    username: varchar("username").notNull(),
    password: varchar("password").notNull(),
    role: varchar("role").notNull()
 });

 export const history = pgTable("history", {
    id: serial("id").primaryKey(),
    createdAt: varchar("createdAt").notNull(),
    boardId: integer("boardId").notNull(),
    totalPrice: integer("totalPrice").notNull(),
    products: varchar("products").notNull(),
    staffId: integer("staffId").notNull(),
    customer: varchar("phoneNo", {length: 10}).notNull()
 });