import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { appointmentsRouter } from './appointments';
import { dashboardRouter } from './dashboard';
import { galleryRouter } from './gallery';
import { inquiriesRouter } from './inquiries';
import { servicesRouter } from './services';
import { settingsRouter } from './settings';
import { uploadsRouter } from './uploads';

export const adminRouter = Router();

// Every admin endpoint requires a valid session cookie.
adminRouter.use(requireAuth);

adminRouter.use('/dashboard', dashboardRouter);
adminRouter.use('/services', servicesRouter);
adminRouter.use('/uploads', uploadsRouter);
adminRouter.use('/gallery', galleryRouter);
adminRouter.use('/inquiries', inquiriesRouter);
adminRouter.use('/appointments', appointmentsRouter);
adminRouter.use('/settings', settingsRouter);
