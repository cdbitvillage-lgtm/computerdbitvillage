import { Hono } from "hono";
import { z } from "zod";
import { bodyLimit } from "hono/body-limit";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "../../db/index.mjs";
import { getStore } from "@netlify/blobs";
const app = new Hono();
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 5 * 1024 * 1024,
    onError: (c) => c.json({ error: "Request exceeds 5 MB" }, 413),
  }),
);
const resources = {
  courses: schema.courses,
  batches: schema.batches,
  admissions: schema.admissions,
  students: schema.students,
  attendance: schema.attendance,
  examinations: schema.examinations,
  subjects: schema.subjects,
  results: schema.results,
  certificates: schema.certificates,
  products: schema.products,
  orders: schema.orders,
  order_items: schema.orderItems,
  service_requests: schema.serviceRequests,
  notices: schema.notices,
  gallery: schema.gallery,
  settings: schema.settings,
};
const publicResources = [
  "courses",
  "batches",
  "products",
  "notices",
  "gallery",
];
const salePrice = (p) =>
  Number.isInteger(p.data.discountPrice) &&
  p.data.discountPrice > 0 &&
  p.data.discountPrice < p.price
    ? p.data.discountPrice
    : p.price;
const id = (prefix) =>
  `${prefix}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
const phone = z
  .string()
  .regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number");
const str = z.string().trim().min(2).max(200);
app.use("/api/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  if (["POST", "PUT", "DELETE"].includes(c.req.method)) {
    const origin = c.req.header("origin");
    if (origin && origin !== new URL(c.req.url).origin)
      return c.json({ error: "Invalid request origin" }, 403);
    const length = Number(c.req.header("content-length") || 0);
    if (length > 8 * 1024 * 1024)
      return c.json({ error: "Request too large" }, 413);
  }
  await next();
});
app.onError((e, c) => {
  if (e instanceof z.ZodError)
    return c.json(
      {
        error: e.issues
          .map((x) => `${x.path.join(".")}: ${x.message}`)
          .join("; "),
      },
      400,
    );
  return c.json(
    {
      error:
        "The request could not be completed. Please try again or contact the institute. No confirmation has been issued.",
    },
    503,
  );
});
async function auth(c, next) {
  const cookie = (c.req.header("cookie") || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("nf_jwt="))
    ?.slice(7);
  const token =
    c.req.header("authorization") ||
    (cookie ? "Bearer " + decodeURIComponent(cookie) : "");
  if (!token?.startsWith("Bearer "))
    return c.json({ error: "Please sign in" }, 401);
  const origin =
    process.env.URL || "https://computer-db-it-village.netlify.app";
  const response = await fetch(`${origin}/.netlify/identity/user`, {
    headers: { Authorization: token },
  });
  if (!response.ok)
    return c.json({ error: "Session expired. Please sign in again." }, 401);
  c.set("user", await response.json());
  await next();
}
app.use("/api/admin/*", auth, async (c, next) => {
  if (!c.get("user").app_metadata?.roles?.includes("admin"))
    return c.json({ error: "Administrator access required" }, 403);
  await next();
});
app.get("/api/site", async (c) => {
  const [r] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, "website"));
  return c.json({
    siteName: r?.data.siteName || "Computer DB-IT Village",
    siteDescription:
      r?.data.siteDescription || "চট্টগ্রামে কম্পিউটার প্রশিক্ষণ, বিক্রয় ও সার্ভিসিং।",
  });
});
app.get("/api/public/:resource", async (c) => {
  const name = c.req.param("resource");
  if (!publicResources.includes(name))
    return c.json({ error: "Not found" }, 404);
  const table = resources[name];
  const rows = await db
    .select()
    .from(table)
    .where(eq(table.published, true))
    .orderBy(desc(table.createdAt))
    .limit(100);
  if (name === "batches") {
    const applications = await db
      .select({
        batchId: schema.admissions.batchId,
        status: schema.admissions.status,
      })
      .from(schema.admissions);
    return c.json(
      rows.map((b) => ({
        ...b,
        data: {
          ...b.data,
          seats: Math.max(
            0,
            Number(b.data.seats || 0) -
              applications.filter(
                (a) => a.batchId === b.id && a.status !== "Rejected",
              ).length,
          ),
        },
      })),
    );
  }
  return c.json(
    name === "products"
      ? rows.map((p) => ({ ...p, regularPrice: p.price, price: salePrice(p) }))
      : rows,
  );
});
app.post("/api/admissions", async (c) => {
  const body = z
    .object({
      name: str,
      father: str,
      mother: str,
      phone,
      alternativePhone: phone.optional().or(z.literal("")),
      address: z.string().min(5).max(1000),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      gender: z.enum(["Male", "Female", "Other"]),
      qualification: str,
      courseId: str,
      batchId: str,
      photo: str,
    })
    .parse(await c.req.json());
  if (!body.photo.startsWith("student-photos/"))
    return c.json({ error: "Upload a student photo first" }, 400);
  if (body.dob > new Date().toISOString().slice(0, 10))
    return c.json({ error: "Date of birth cannot be in the future" }, 400);
  const applicationId = id("APP");
  await db.transaction(async (tx) => {
    const [batch] = await tx
      .select()
      .from(schema.batches)
      .where(
        and(
          eq(schema.batches.id, body.batchId),
          eq(schema.batches.courseId, body.courseId),
          eq(schema.batches.published, true),
        ),
      )
      .for("update");
    const [course] = await tx
      .select()
      .from(schema.courses)
      .where(
        and(
          eq(schema.courses.id, body.courseId),
          eq(schema.courses.published, true),
        ),
      );
    if (!batch || !course)
      throw new z.ZodError([
        {
          path: ["batchId"],
          code: "custom",
          message: "This batch is not accepting applications",
        },
      ]);
    const admitted = await tx
      .select({ id: schema.admissions.id, status: schema.admissions.status })
      .from(schema.admissions)
      .where(eq(schema.admissions.batchId, body.batchId));
    if (
      Number.isFinite(Number(batch.data.seats)) &&
      Number(batch.data.seats) <=
        admitted.filter((a) => a.status !== "Rejected").length
    )
      throw new z.ZodError([
        {
          path: ["batchId"],
          code: "custom",
          message:
            "This batch has no available seats. Please contact the institute.",
        },
      ]);
    await tx.insert(schema.admissions).values({
      id: applicationId,
      courseId: body.courseId,
      batchId: body.batchId,
      data: body,
    });
  });
  return c.json({ id: applicationId }, 201);
});
app.post("/api/services", async (c) => {
  const data = z
    .object({
      name: str,
      phone,
      deviceType: str,
      deviceModel: str,
      problem: z.string().min(10).max(3000),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .parse(await c.req.json());
  if (data.date < new Date().toISOString().slice(0, 10))
    return c.json({ error: "Choose today or a future service date" }, 400);
  const requestId = id("SRV");
  await db.insert(schema.serviceRequests).values({ id: requestId, data });
  return c.json({ id: requestId }, 201);
});
app.post("/api/orders", async (c) => {
  const body = z
    .object({
      name: str,
      phone,
      address: z.string().min(10).max(1000),
      items: z
        .array(z.object({ id: str, quantity: z.number().int().min(1).max(20) }))
        .min(1)
        .max(30),
    })
    .parse(await c.req.json());
  const orderId = id("ORD");
  await db.transaction(async (tx) => {
    let total = 0;
    const rows = [];
    for (const item of body.items) {
      const [p] = await tx
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, item.id))
        .for("update");
      if (!p?.published || p.data.sample || !p.price || p.stock < item.quantity)
        throw new z.ZodError([
          {
            path: ["items"],
            code: "custom",
            message: "Product is unavailable or insufficient stock",
          },
        ]);
      const price = salePrice(p);
      total += price * item.quantity;
      rows.push({
        id: id("ITEM"),
        orderId,
        productId: p.id,
        quantity: item.quantity,
        price,
        data: { name: p.data.title },
      });
      await tx
        .update(schema.products)
        .set({ stock: p.stock - item.quantity })
        .where(eq(schema.products.id, p.id));
    }
    await tx.insert(schema.orders).values({
      id: orderId,
      total,
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        payment: "Cash on Delivery",
      },
    });
    await tx.insert(schema.orderItems).values(rows);
  });
  return c.json({ id: orderId }, 201);
});
app.get("/api/results", async (c) => {
  const studentId = c.req.query("studentId"),
    examinationId = c.req.query("examinationId");
  if (!studentId || !examinationId)
    return c.json({ error: "Student ID and Examination ID are required" }, 400);
  const [r] = await db
    .select()
    .from(schema.results)
    .where(
      and(
        eq(schema.results.studentId, studentId),
        eq(schema.results.examinationId, examinationId),
        eq(schema.results.published, true),
      ),
    );
  if (!r)
    return c.json(
      {
        error:
          "No published result found. Check your IDs or contact the institute.",
      },
      404,
    );
  const [s] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.id, studentId));
  const [exam] = await db
    .select()
    .from(schema.examinations)
    .where(eq(schema.examinations.id, examinationId));
  const [course] = s.courseId
    ? await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, s.courseId))
    : [];
  return c.json({
    studentId,
    name: s.data.name,
    photo: s.data.photo
      ? `/api/result-photo?studentId=${encodeURIComponent(studentId)}&examinationId=${encodeURIComponent(examinationId)}`
      : null,
    course: course?.data.title,
    batch: s.batchId,
    examinationId,
    exam: exam?.data.title,
    date: exam?.data.date,
    marks: r.data.marks,
    total: r.data.total,
    obtained: r.data.obtained,
    percentage: r.data.percentage,
    grade: r.data.grade,
    status: r.data.status,
  });
});
app.get("/api/result-photo", async (c) => {
  const studentId = c.req.query("studentId"),
    examId = c.req.query("examinationId");
  if (!studentId || !examId) return c.notFound();
  const [r] = await db
    .select()
    .from(schema.results)
    .where(
      and(
        eq(schema.results.studentId, studentId),
        eq(schema.results.examinationId, examId),
        eq(schema.results.published, true),
      ),
    );
  if (!r) return c.notFound();
  const [student] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.id, studentId));
  const key = student?.data.photo;
  if (!key?.startsWith("student-photos/")) return c.notFound();
  const photo = await getStore("institute-uploads").get(key, {
    type: "arrayBuffer",
  });
  if (!photo) return c.notFound();
  return new Response(photo, {
    headers: {
      "Content-Type": key.endsWith("png")
        ? "image/png"
        : key.endsWith("webp")
          ? "image/webp"
          : "image/jpeg",
      "Cache-Control": "no-store",
    },
  });
});
app.get("/api/certificates/:id", async (c) => {
  const [r] = await db
    .select()
    .from(schema.certificates)
    .where(
      and(
        eq(schema.certificates.id, c.req.param("id")),
        eq(schema.certificates.published, true),
        eq(schema.certificates.status, "Verified"),
      ),
    );
  if (!r) return c.json({ error: "No verified certificate found" }, 404);
  const [s] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.id, r.studentId));
  const [course] = s.courseId
    ? await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, s.courseId))
    : [];
  return c.json({
    id: r.id,
    name: s.data.name,
    course: course?.data.title,
    completionDate: r.data.completionDate,
    status: r.status,
  });
});
async function upload(c, isPublic = false) {
  const form = await c.req.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.size > 4 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    return c.json({ error: "Choose a JPG, PNG or WebP image up to 4 MB" }, 400);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const jpeg = bytes[0] === 255 && bytes[1] === 216;
  const png = bytes[0] === 137 && bytes[1] === 80;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!jpeg && !png && !webp) return c.json({ error: "Invalid image" }, 400);
  const key = `${isPublic ? "public-images" : "student-photos"}/${crypto.randomUUID()}.${jpeg ? "jpg" : png ? "png" : "webp"}`;
  await getStore("institute-uploads").set(key, buffer);
  return c.json(
    { key, url: isPublic ? "/api/images/" + key.split("/")[1] : undefined },
    201,
  );
}
app.post("/api/uploads", (c) => upload(c));
app.post("/api/admin/uploads", (c) => upload(c, true));
app.get("/api/images/:file", async (c) => {
  const file = c.req.param("file");
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(file)) return c.notFound();
  const image = await getStore("institute-uploads").get(
    "public-images/" + file,
    { type: "arrayBuffer" },
  );
  if (!image) return c.notFound();
  return new Response(image, {
    headers: {
      "Content-Type": file.endsWith("png")
        ? "image/png"
        : file.endsWith("webp")
          ? "image/webp"
          : "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

app.get("/api/admin/photo", async (c) => {
  const key = c.req.query("key");
  if (!key?.startsWith("student-photos/")) return c.notFound();
  const photo = await getStore("institute-uploads").get(key, {
    type: "arrayBuffer",
  });
  if (!photo) return c.notFound();
  return new Response(photo, {
    headers: {
      "Content-Type": key.endsWith("png")
        ? "image/png"
        : key.endsWith("webp")
          ? "image/webp"
          : "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
});
app.get("/api/admin/:resource", async (c) => {
  const table = resources[c.req.param("resource")];
  if (!table) return c.notFound();
  return c.json(
    await db.select().from(table).orderBy(desc(table.createdAt)).limit(1000),
  );
});
app.put("/api/admin/:resource/:id", async (c) => {
  const name = c.req.param("resource"),
    table = resources[name];
  if (!table) return c.notFound();
  let body = await c.req.json();
  delete body.createdAt;
  delete body.id;
  const allowed = Object.keys(table).filter(
    (k) => !["id", "createdAt"].includes(k),
  );
  body = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k)),
  );
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data))
    return c.json({ error: "Record data is required" }, 400);
  if (
    body.published &&
    ["courses", "batches", "products", "notices", "gallery"].includes(name) &&
    !String(body.data.title || "").trim()
  )
    return c.json({ error: "A title is required before publishing" }, 400);
  if (
    name === "batches" &&
    (!Number.isInteger(body.data.seats) || body.data.seats < 0)
  )
    return c.json({ error: "Seats must be a non-negative integer" }, 400);
  if (
    ["courses", "products", "gallery"].includes(name) &&
    body.data.image &&
    !/^(https:\/\/|\/api\/images\/)/.test(body.data.image)
  )
    return c.json(
      { error: "Use an HTTPS image or an uploaded catalog image" },
      400,
    );
  if (name === "results") {
    const [student] = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, body.studentId || ""));
    const [exam] = await db
      .select()
      .from(schema.examinations)
      .where(eq(schema.examinations.id, body.examinationId || ""));
    if (
      !student ||
      !exam ||
      (exam.courseId && exam.courseId !== student.courseId) ||
      (exam.batchId && exam.batchId !== student.batchId)
    )
      return c.json(
        { error: "The examination must match the student course and batch." },
        400,
      );
    const marks = z
      .array(
        z.object({
          subject: str,
          obtained: z.number().min(0),
          total: z.number().positive(),
          pass: z.number().min(0),
        }),
      )
      .min(1)
      .parse(body.data.marks);
    if (
      new Set(marks.map((m) => m.subject.trim().toLowerCase())).size !==
      marks.length
    )
      return c.json({ error: "Each subject must appear only once" }, 400);
    if (marks.some((m) => m.obtained > m.total || m.pass > m.total))
      return c.json({ error: "Marks cannot exceed total" }, 400);
    const total = marks.reduce((a, m) => a + m.total, 0),
      obtained = marks.reduce((a, m) => a + m.obtained, 0),
      percentage = (obtained / total) * 100,
      passed = marks.every((m) => m.obtained >= m.pass);
    body.data = {
      marks,
      total,
      obtained,
      percentage: Number(percentage.toFixed(2)),
      grade: !passed
        ? "F"
        : percentage >= 80
          ? "A+"
          : percentage >= 70
            ? "A"
            : percentage >= 60
              ? "A-"
              : percentage >= 50
                ? "B"
                : percentage >= 40
                  ? "C"
                  : "D",
      status: passed ? "Pass" : "Fail",
    };
  }
  const enums = {
    students: ["Active", "Exam Pending", "Completed", "Discontinued"],
    admissions: ["Pending", "Approved", "Rejected"],
    service_requests: [
      "Pending",
      "Received",
      "In Progress",
      "Completed",
      "Cancelled",
    ],
    certificates: ["Verified", "Revoked"],
    attendance: ["Present", "Absent"],
    orders: ["Pending", "Confirmed", "Shipped", "Completed", "Cancelled"],
  };
  if (body.status && enums[name] && !enums[name].includes(body.status))
    return c.json({ error: "Invalid status" }, 400);
  if (
    name === "products" &&
    ((body.price !== null &&
      (!Number.isInteger(body.price) || body.price < 0)) ||
      !Number.isInteger(body.stock) ||
      body.stock < 0)
  )
    return c.json({ error: "Valid price and stock are required" }, 400);
  if (name === "admissions" && body.status === "Approved") {
    const [existing] = await db
      .select()
      .from(schema.admissions)
      .where(eq(schema.admissions.id, c.req.param("id")));
    if (existing?.status !== "Approved")
      return c.json(
        {
          error:
            "Use Approve to assign a student ID and create the student profile.",
        },
        400,
      );
  }
  const recordId = c.req.param("id");
  await db
    .insert(table)
    .values({ ...body, id: recordId })
    .onConflictDoUpdate({ target: table.id, set: body });
  return c.json({ id: recordId });
});
app.delete("/api/admin/:resource/:id", async (c) => {
  const table = resources[c.req.param("resource")];
  if (!table) return c.notFound();
  await db.delete(table).where(eq(table.id, c.req.param("id")));
  return c.json({ deleted: true });
});
app.post("/api/admin/approve/:id", async (c) => {
  const applicationId = c.req.param("id");
  const { studentId } = z.object({ studentId: str }).parse(await c.req.json());
  await db.transaction(async (tx) => {
    const [a] = await tx
      .select()
      .from(schema.admissions)
      .where(eq(schema.admissions.id, applicationId))
      .for("update");
    if (!a || a.status !== "Pending")
      throw new Error("Application unavailable");
    await tx.insert(schema.students).values({
      id: studentId,
      admissionId: a.id,
      courseId: a.courseId,
      batchId: a.batchId,
      status: "Active",
      data: {
        ...a.data,
        admissionDate: new Date().toISOString().slice(0, 10),
      },
    });
    await tx
      .update(schema.admissions)
      .set({ status: "Approved" })
      .where(eq(schema.admissions.id, a.id));
  });
  return c.json({ id: studentId });
});
app.post("/api/admin/attendance-bulk", async (c) => {
  const body = z
    .object({
      courseId: str,
      batchId: str,
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      records: z
        .array(
          z.object({ studentId: str, status: z.enum(["Present", "Absent"]) }),
        )
        .min(1)
        .max(200),
    })
    .parse(await c.req.json());
  await db.transaction(async (tx) => {
    for (const row of body.records) {
      const [student] = await tx
        .select()
        .from(schema.students)
        .where(
          and(
            eq(schema.students.id, row.studentId),
            eq(schema.students.courseId, body.courseId),
            eq(schema.students.batchId, body.batchId),
          ),
        );
      if (!student)
        throw new z.ZodError([
          {
            path: ["records"],
            code: "custom",
            message: "Student does not belong to this batch",
          },
        ]);
      await tx
        .insert(schema.attendance)
        .values({
          id: id("ATT"),
          studentId: row.studentId,
          date: body.date,
          status: row.status,
          data: {},
        })
        .onConflictDoUpdate({
          target: [schema.attendance.studentId, schema.attendance.date],
          set: { status: row.status },
        });
    }
  });
  return c.json({ saved: body.records.length });
});
app.get("/api/student", auth, async (c) => {
  const [student] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.userId, c.get("user").id));
  if (!student)
    return c.json(
      {
        error:
          "Your account has not been linked to a student profile. Contact the institute.",
      },
      404,
    );
  const attendance = await db
    .select()
    .from(schema.attendance)
    .where(eq(schema.attendance.studentId, student.id));
  return c.json({ student, attendance });
});
export default app;
