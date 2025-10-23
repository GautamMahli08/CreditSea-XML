import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadReport, listReportsCtrl, getReportCtrl } from '../controllers/reports.controller.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadReport);
router.get('/', listReportsCtrl);
router.get('/:id', getReportCtrl);

export default router;
