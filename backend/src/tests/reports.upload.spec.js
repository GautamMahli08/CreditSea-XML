import request from "supertest";
import app from "../app.js";
import { connectMongo, disconnectMongo } from "../db/mongoose.js";

import { env } from "../config/env.js";
import path from "path";
import { Report } from "../models/Report.js";

describe("Upload XML", () => {
  beforeAll(async () => {
    await connectMongo(env.mongoUri);
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  afterEach(async () => {
    await Report.deleteMany({});
  });

  test("accepts valid XML, creates report", async () => {
    const res = await request(app)
      .post("/api/reports/upload")
      .attach("file", path.join(__dirname, "fixtures/experian1.xml"));

    expect(res.status).toBe(201);
    expect(res.body.reportId).toBeDefined();

    const report = await Report.findById(res.body.reportId);
    expect(report.basic.name).toBe("Gautam Mahli");
    expect(report.summary.totalAccounts).toBe(3);
    expect(report.summary.securedAmount).toBeGreaterThan(0);
  });

  test("rejects non-xml", async () => {
    const res = await request(app)
      .post("/api/reports/upload")
      .attach("file", Buffer.from("hello"), "readme.txt");

    expect(res.status).toBe(415);
    expect(res.body.error).toMatch(/Only .xml/);
  });
});
