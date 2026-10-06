import { Router } from 'express';
import {
  AppointmentRequest,
  ContactInquiry,
  GalleryItem,
  Service,
} from '../../models';
import { asyncHandler } from '../../utils/asyncHandler';

export const dashboardRouter = Router();

/** GET /admin/dashboard — counts and the five most recent records. */
dashboardRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [
      totalInquiries,
      newInquiries,
      totalAppointments,
      newAppointments,
      totalServices,
      publishedServices,
      totalGalleryItems,
      publishedGalleryItems,
      recentInquiries,
      recentAppointments,
    ] = await Promise.all([
      ContactInquiry.countDocuments(),
      ContactInquiry.countDocuments({ status: 'new' }),
      AppointmentRequest.countDocuments(),
      AppointmentRequest.countDocuments({ status: 'new' }),
      Service.countDocuments(),
      Service.countDocuments({ published: true }),
      GalleryItem.countDocuments(),
      GalleryItem.countDocuments({ published: true }),
      ContactInquiry.find().sort({ createdAt: -1 }).limit(5),
      AppointmentRequest.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      newInquiries,
      totalInquiries,
      newAppointments,
      totalAppointments,
      publishedServices,
      totalServices,
      publishedGalleryItems,
      totalGalleryItems,
      recentInquiries,
      recentAppointments,
    });
  }),
);
