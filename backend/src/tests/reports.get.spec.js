import request from 'supertest';
import app from '../app.js';
import { connectMongo, disconnectMongo } from '../db/mongoose.js';

import { env } from '../config/env.js';
import path from 'path';

describe('List & Get', () => {
  beforeAll(async () => {
    await connectMongo(env.mongoUri);
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  test('list shows uploaded reports and detail returns full document', async () => {
    const up1 = await request(app).post('/api/reports/upload')
      .attach('file', path.join(__dirname, 'fixtures/experian1.xml'));
    const up2 = await request(app).post('/api/reports/upload')
      .attach('file', path.join(__dirname, 'fixtures/experian2.xml'));

    const list = await request(app).get('/api/reports?search=Gautam');
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);

    const detail = await request(app).get(`/api/reports/${up1.body.reportId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.basic.pan).toBe('ABCDE1234F');
    expect(detail.body.accounts.length).toBe(3);
  });

  test('404 on unknown id', async () => {
    const res = await request(app).get('/api/reports/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});
