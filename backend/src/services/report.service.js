import { Report } from '../models/Report.js';

export async function createOrUpsertReport (dto) {
  // upsert key: reference if available, else (pan + generatedAt)
  const key = dto.reference
    ? { reference: dto.reference }
    : (dto.basic?.pan && dto.generatedAt
        ? { 'basic.pan': dto.basic.pan, generatedAt: dto.generatedAt }
        : null);

  if (!key) {
    const doc = await Report.create(dto);
    return doc;
  }
  const doc = await Report.findOneAndUpdate(key, dto, { upsert: true, new: true, setDefaultsOnInsert: true });
  return doc;
}

export async function listReports ({ page = 1, limit = 10, search, pan, from, to }) {
  const q = {};
  if (search) {
    q.$or = [
      { 'basic.name': new RegExp(search, 'i') },
      { 'basic.pan': new RegExp(search, 'i') }
    ];
  }
  if (pan) q['basic.pan'] = new RegExp(`^${pan}$`, 'i');
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Report.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select({
        'basic.name': 1, 'basic.pan': 1, 'basic.creditScore': 1,
        'summary.totalAccounts': 1, 'summary.currentBalanceAmount': 1,
        createdAt: 1
      }),
    Report.countDocuments(q)
  ]);
  return { items, page, limit, total };
}

export async function getReportById (id) {
  const doc = await Report.findById(id);
  return doc;
}
