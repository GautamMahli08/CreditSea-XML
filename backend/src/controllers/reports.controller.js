import fs from 'fs/promises';
import { parseXmlBuffer } from '../services/xml.service.js';
import { mapXmlToReport } from '../utils/xmlMapper.js';
import { createOrUpsertReport, listReports, getReportById } from '../services/report.service.js';

export async function uploadReport (req, res, next) {
  try {
    if (!req.file) {
      const err = new Error('XML file is required under field "file"');
      err.status = 400;
      throw err;
    }
    const buf = await fs.readFile(req.file.path);
    const xmlJson = parseXmlBuffer(buf);
    const dto = mapXmlToReport(xmlJson);
    const saved = await createOrUpsertReport(dto);
    res.status(201).json({ reportId: saved._id, message: 'Uploaded & processed' });
  } catch (e) {
    next(e);
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path).catch(() => {});
    }
  }
}

export async function listReportsCtrl (req, res, next) {
  try {
    const { page = '1', limit = '10', search, pan, from, to } = req.query;
    const data = await listReports({
      page: Number(page), limit: Number(limit), search, pan, from, to
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getReportCtrl (req, res, next) {
  try {
    const { id } = req.params;
    const doc = await getReportById(id);
    if (!doc) {
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }
    res.json(doc);
  } catch (e) {
    next(e);
  }
}
