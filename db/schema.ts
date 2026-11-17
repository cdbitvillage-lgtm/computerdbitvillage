import {
  pgTable,
  text,
  jsonb,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
const base = () => ({
  id: text("id").primaryKey(),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const courses = pgTable("courses", {
  ...base(),
  published: boolean("published").default(false).notNull(),
}).enableRLS();
export const batches = pgTable("batches", {
  ...base(),
  courseId: text("course_id").references(() => courses.id),
  published: boolean("published").default(false).notNull(),
}).enableRLS();
export const admissions = pgTable("admissions", {
  ...base(),
  courseId: text("course_id")
    .references(() => courses.id)
    .notNull(),
  batchId: text("batch_id")
    .references(() => batches.id)
    .notNull(),
  status: text("status").default("Pending").notNull(),
}).enableRLS();
export const students = pgTable("students", {
  ...base(),
  admissionId: text("admission_id")
    .references(() => admissions.id)
    .unique(),
  courseId: text("course_id").references(() => courses.id),
  batchId: text("batch_id").references(() => batches.id),
  status: text("status").default("Active").notNull(),
  userId: text("user_id").unique(),
}).enableRLS();
export const attendance = pgTable(
  "attendance",
  {
    ...base(),
    studentId: text("student_id")
      .references(() => students.id)
      .notNull(),
    date: text("date").notNull(),
    status: text("status").notNull(),
  },
  (t) => [uniqueIndex("attendance_student_date").on(t.studentId, t.date)],
).enableRLS();
export const examinations = pgTable("examinations", {
  ...base(),
  courseId: text("course_id").references(() => courses.id),
  batchId: text("batch_id").references(() => batches.id),
}).enableRLS();
export const subjects = pgTable("subjects", {
  ...base(),
  examinationId: text("examination_id")
    .references(() => examinations.id)
    .notNull(),
}).enableRLS();
export const results = pgTable(
  "results",
  {
    ...base(),
    studentId: text("student_id")
      .references(() => students.id)
      .notNull(),
    examinationId: text("examination_id")
      .references(() => examinations.id)
      .notNull(),
    published: boolean("published").default(false).notNull(),
  },
  (t) => [uniqueIndex("results_student_exam").on(t.studentId, t.examinationId)],
).enableRLS();
export const certificates = pgTable("certificates", {
  ...base(),
  studentId: text("student_id")
    .references(() => students.id)
    .notNull(),
  published: boolean("published").default(false).notNull(),
  status: text("status").default("Verified").notNull(),
}).enableRLS();
export const products = pgTable("products", {
  ...base(),
  published: boolean("published").default(false).notNull(),
  price: integer("price"),
  stock: integer("stock").default(0).notNull(),
}).enableRLS();
export const orders = pgTable("orders", {
  ...base(),
  status: text("status").default("Pending").notNull(),
  total: integer("total").notNull(),
}).enableRLS();
export const orderItems = pgTable("order_items", {
  ...base(),
  orderId: text("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: text("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
}).enableRLS();
export const serviceRequests = pgTable("service_requests", {
  ...base(),
  status: text("status").default("Pending").notNull(),
}).enableRLS();
export const notices = pgTable("notices", {
  ...base(),
  published: boolean("published").default(false).notNull(),
}).enableRLS();
export const gallery = pgTable("gallery", {
  ...base(),
  published: boolean("published").default(false).notNull(),
}).enableRLS();
export const settings = pgTable("settings", { ...base() }).enableRLS();
export const profiles = pgTable("profiles", {
  ...base(),
  userId: text("user_id").unique().notNull(),
}).enableRLS();
export const userRoles = pgTable("user_roles", {
  ...base(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
}).enableRLS();
