import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { mockStore } from './store';
import type {
  AppointmentRequest,
  AppointmentRequestInput,
  ContactInquiry,
  ContactInquiryInput,
  GalleryItem,
  Service,
} from '@/types';
import {
  isValidEmail,
  isValidPakistaniPhone,
} from '@/utils/validation';

/* ==========================================================================
   DEVELOPMENT MOCK ADAPTER
   --------------------------------------------------------------------------
   A full in-browser stand-in for the backend, wired in through the axios
   `adapter` option in `apiClient.ts`. It only runs when
   VITE_USE_MOCK_API=true. Set that flag to `false` (or remove it) and every
   request goes to the real API instead — no component changes required.
   ========================================================================== */

/** Credentials accepted by the mock. Development only — never a real secret. */
export const MOCK_ADMIN_CREDENTIALS = {
  identifier: 'admin@specialistclinic.test',
  password: 'ClinicDev2025!',
} as const;

const LATENCY_MS = 220;

/** Thrown to simulate a validation failure from the server. */
class MockValidationError extends Error {
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super('Validation failed');
    this.name = 'MockValidationError';
    this.fieldErrors = fieldErrors;
  }
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function makeResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    headers: { 'content-type': 'application/json' },
    config,
  };
}

function fail(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
  fieldErrors?: Record<string, string>,
): Promise<never> {
  const payload: Record<string, unknown> = { message };
  if (fieldErrors) payload.errors = fieldErrors;
  const response = makeResponse(config, payload, status);
  return Promise.reject(
    new AxiosError(message, String(status), config, null, response),
  );
}

/** Read a JSON or FormData request body. */
function readBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  const { data } = config;
  if (!data) return {};

  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const result: Record<string, unknown> = {};
    data.forEach((value, key) => {
      if (typeof value === 'string') result[key] = value;
      else if (value instanceof File) result[key] = value;
    });
    return result;
  }

  return data as Record<string, unknown>;
}

const asString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();

const asNullable = (value: unknown): string | null => {
  const text = asString(value);
  return text === '' ? null : text;
};

function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return {
    items: slice,
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  };
}

function requireMockSession(config: InternalAxiosRequestConfig) {
  if (!mockStore.getSession()) {
    return fail(config, 401, 'Authentication required.');
  }
  return null;
}

/* --------------------------------------------------------------------------
   Validation mirrors the rules a real backend must apply.
   -------------------------------------------------------------------------- */

function validateContactPayload(
  body: Record<string, unknown>,
): asserts body is Record<string, unknown> & { payload: ContactInquiryInput } {
  const errors: Record<string, string> = {};

  const fullName = asString(body.fullName);
  if (fullName.length < 2 || fullName.length > 80) {
    errors.fullName = 'Full name must be between 2 and 80 characters.';
  }

  const phone = asString(body.phone);
  if (!isValidPakistaniPhone(phone)) {
    errors.phone = 'Enter a valid Pakistani phone number.';
  }

  const email = asString(body.email);
  if (email && !isValidEmail(email)) errors.email = 'Enter a valid email address.';

  const message = asString(body.message);
  if (message.length < 10 || message.length > 1500) {
    errors.message = 'Message must be between 10 and 1,500 characters.';
  }

  const subject = asString(body.subject);
  if (!['appointment', 'service-question', 'general-inquiry'].includes(subject)) {
    errors.subject = 'Choose a valid subject.';
  }

  if (body.consent !== true && body.consent !== 'true') {
    errors.consent = 'Consent is required.';
  }

  if (Object.keys(errors).length) throw new MockValidationError(errors);

  (body as Record<string, unknown> & { payload: ContactInquiryInput }).payload = {
    fullName,
    phone,
    email: email || undefined,
    subject: subject as ContactInquiryInput['subject'],
    message,
    consent: true,
  };
}

function validateAppointmentPayload(
  body: Record<string, unknown>,
): asserts body is Record<string, unknown> & { payload: AppointmentRequestInput } {
  const errors: Record<string, string> = {};

  const patientName = asString(body.patientName);
  if (patientName.length < 2 || patientName.length > 80) {
    errors.patientName = 'Patient name must be between 2 and 80 characters.';
  }

  const phone = asString(body.phone);
  if (!isValidPakistaniPhone(phone)) {
    errors.phone = 'Enter a valid Pakistani phone number.';
  }

  const email = asString(body.email);
  if (email && !isValidEmail(email)) errors.email = 'Enter a valid email address.';

  const preferredDate = asString(body.preferredDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    errors.preferredDate = 'Choose a valid preferred date.';
  }

  const preferredTime = asString(body.preferredTime);
  if (!preferredTime) errors.preferredTime = 'Choose a preferred time slot.';

  const patientType = asString(body.patientType);
  if (!['new', 'returning'].includes(patientType)) {
    errors.patientType = 'Choose whether this is a new or returning patient.';
  }

  const note = asString(body.note);
  if (note.length > 800) errors.note = 'Note must be under 800 characters.';

  if (body.consent !== true && body.consent !== 'true') {
    errors.consent = 'Consent is required.';
  }

  if (Object.keys(errors).length) throw new MockValidationError(errors);

  (body as Record<string, unknown> & { payload: AppointmentRequestInput }).payload = {
    patientName,
    phone,
    email: email || undefined,
    preferredDate,
    preferredTime,
    serviceId: asString(body.serviceId) || undefined,
    patientType: patientType as AppointmentRequestInput['patientType'],
    note: note || undefined,
    consent: true,
  };
}

/* --------------------------------------------------------------------------
   Adapter
   -------------------------------------------------------------------------- */

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();

  const rawUrl = `${config.url ?? ''}`;
  const full = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : `${window.location.origin}${config.baseURL ?? ''}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;

  let parsed: URL;
  try {
    parsed = new URL(full);
  } catch {
    return fail(config, 404, 'The requested endpoint could not be found.');
  }

  let path = parsed.pathname;
  if (path.startsWith('/api')) path = path.slice(4);
  path = path.replace(/\/+$/, '') || '/';

  const params = parsed.searchParams;
  const method = (config.method ?? 'get').toUpperCase();
  const body = readBody(config);
  const segments = path.split('/').filter(Boolean);

  /* ---------------------------------------------------------------- auth */
  if (path === '/auth/login' && method === 'POST') {
    const identifier = asString(body.identifier ?? body.email ?? body.username);
    const password = asString(body.password);

    if (!identifier || !password) {
      return fail(config, 422, 'Enter both your email and password.', {
        ...(identifier ? {} : { identifier: 'Enter your email or username.' }),
        ...(password ? {} : { password: 'Enter your password.' }),
      });
    }

    if (
      identifier.toLowerCase() !== MOCK_ADMIN_CREDENTIALS.identifier ||
      password !== MOCK_ADMIN_CREDENTIALS.password
    ) {
      return fail(config, 401, 'Incorrect email or password.');
    }

    const user = {
      id: 'mock-admin-1',
      name: 'Development Admin',
      email: MOCK_ADMIN_CREDENTIALS.identifier,
      role: 'admin' as const,
    };
    mockStore.setSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return makeResponse(config, { user }, 200);
  }

  if (path === '/auth/logout' && method === 'POST') {
    mockStore.setSession(null);
    return makeResponse(config, { success: true }, 200);
  }

  if (path === '/auth/me' && method === 'GET') {
    const session = mockStore.getSession();
    if (!session) return fail(config, 401, 'Authentication required.');
    return makeResponse(config, {
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  }

  /* ------------------------------------------------------- public content */
  if (path === '/services' && method === 'GET') {
    const all = mockStore.listServices();
    const published = all.filter((item) => item.published);
    const search = (params.get('search') ?? '').toLowerCase();
    const filtered = search
      ? published.filter(
          (item) =>
            item.title.toLowerCase().includes(search) ||
            item.shortDescription.toLowerCase().includes(search),
        )
      : published;
    return makeResponse(config, filtered);
  }

  if (path === '/services/featured' && method === 'GET') {
    const limit = Number(params.get('limit') ?? 8);
    return makeResponse(
      config,
      mockStore
        .listServices()
        .filter((item) => item.published && item.featured)
        .slice(0, limit),
    );
  }

  if (segments[0] === 'services' && segments.length === 2 && method === 'GET') {
    const slug = decodeURIComponent(segments[1]);
    const service = mockStore.getServiceBySlug(slug);
    if (!service || !service.published) {
      return fail(config, 404, 'This service is not available.');
    }
    return makeResponse(config, service);
  }

  if (path === '/gallery' && method === 'GET') {
    const items = mockStore.listGallery().filter((item) => item.published);
    const category = params.get('category');
    const filtered =
      category && category !== 'all'
        ? items.filter((item) => item.category === category)
        : items;
    return makeResponse(config, filtered);
  }

  if (path === '/settings/public' && method === 'GET') {
    const settings = mockStore.getSettings();
    return makeResponse(config, {
      clinicName: settings.clinicName,
      doctorName: settings.doctorName,
      doctorDesignation: settings.doctorDesignation,
      carePhilosophy: settings.carePhilosophy,
      addressLine: settings.addressLine,
      addressLandmark: settings.addressLandmark,
      addressCity: settings.addressCity,
      clinicHours: settings.clinicHours,
      phone: settings.phone,
      phoneDisplay: settings.phoneDisplay,
      alternatePhone: settings.alternatePhone,
      alternatePhoneDisplay: settings.alternatePhoneDisplay,
      whatsappNumber: settings.whatsappNumber,
      whatsappDisplay: settings.whatsappDisplay,
      mapUrl: settings.mapUrl,
      social: settings.social,
    });
  }

  /* ------------------------------------------------------ public  submissions */
  if (path === '/contact' && method === 'POST') {
    // Honeypot tripped: silently reject without storing anything.
    if (asString(body.company)) {
      return fail(config, 422, 'Your message could not be submitted.');
    }
    try {
      validateContactPayload(body);
    } catch (error) {
      if (error instanceof MockValidationError) {
        return fail(
          config,
          422,
          'Some of the information provided needs attention.',
          error.fieldErrors,
        );
      }
      throw error;
    }
    const payload = (body as { payload: ContactInquiryInput }).payload;
    const created = mockStore.createInquiry({
      fullName: payload.fullName,
      phone: payload.phone,
      email: asNullable(payload.email),
      subject: payload.subject,
      message: payload.message,
    });
    return makeResponse(config, { id: created.id, received: true }, 201);
  }

  if (path === '/appointments' && method === 'POST') {
    if (asString(body.company)) {
      return fail(config, 422, 'Your request could not be submitted.');
    }
    try {
      validateAppointmentPayload(body);
    } catch (error) {
      if (error instanceof MockValidationError) {
        return fail(
          config,
          422,
          'Some of the information provided needs attention.',
          error.fieldErrors,
        );
      }
      throw error;
    }
    const payload = (body as { payload: AppointmentRequestInput }).payload;
    const service = payload.serviceId
      ? mockStore.getServiceById(payload.serviceId)
      : undefined;
    const created = mockStore.createAppointment({
      patientName: payload.patientName,
      phone: payload.phone,
      email: asNullable(payload.email),
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      serviceId: service?.id ?? null,
      serviceName: service?.title ?? (payload.serviceId ? null : 'Other'),
      patientType: payload.patientType,
      note: payload.note ?? null,
    });
    return makeResponse(
      config,
      { id: created.id, received: true, status: created.status },
      201,
    );
  }

  /* ------------------------------------------------------------ admin area */
  if (segments[0] === 'admin') {
    const authError = requireMockSession(config);
    if (authError) return authError as never;

    const section = segments[1];
    const id = segments[2];

    if (section === 'dashboard' && method === 'GET') {
      const inquiries = mockStore.listInquiries();
      const appointments = mockStore.listAppointments();
      const services = mockStore.listServices();
      const galleryItems = mockStore.listGallery();

      return makeResponse(config, {
        newInquiries: inquiries.filter((item) => item.status === 'new').length,
        totalInquiries: inquiries.length,
        newAppointments: appointments.filter((item) => item.status === 'new').length,
        totalAppointments: appointments.length,
        publishedServices: services.filter((item) => item.published).length,
        totalServices: services.length,
        publishedGalleryItems: galleryItems.filter((item) => item.published).length,
        totalGalleryItems: galleryItems.length,
        recentInquiries: inquiries.slice(0, 5),
        recentAppointments: appointments.slice(0, 5),
      });
    }

    if (section === 'services') {
      if (id === 'reorder' && method === 'POST') {
        const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
        return makeResponse(config, mockStore.reorderServices(ids));
      }

      if (!id && method === 'GET') {
        const page = Number(params.get('page') ?? 1);
        const limit = Number(params.get('limit') ?? 50);
        const search = (params.get('search') ?? '').toLowerCase();
        const status = params.get('status');
        let all = mockStore.listServices();
        if (status && status !== 'all') {
          all = all.filter((item) => item.published === (status === 'published'));
        }
        const filtered = search
          ? all.filter(
              (item) =>
                item.title.toLowerCase().includes(search) ||
                item.slug.includes(search),
            )
          : all;
        return makeResponse(config, paginate(filtered, page, limit));
      }

      if (!id && method === 'POST') {
        const title = asString(body.title);
        if (!title) return fail(config, 422, 'Service title is required.', { title: 'Required.' });
        const slug = asString(body.slug) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (mockStore.getServiceBySlug(slug)) {
          return fail(config, 409, 'A service with this slug already exists.', {
            slug: 'This URL slug is already in use.',
          });
        }
        const created = mockStore.createService({
          slug,
          title,
          shortDescription: asString(body.shortDescription),
          fullDescription: asString(body.fullDescription),
          icon: (asString(body.icon) || 'general') as Service['icon'],
          imageUrl: asNullable(body.imageUrl),
          imageAlt: asNullable(body.imageAlt),
          featured: Boolean(body.featured),
          published: Boolean(body.published),
          displayOrder: Number(body.displayOrder ?? 0),
          seoTitle: asNullable(body.seoTitle),
          metaDescription: asNullable(body.metaDescription),
        });
        return makeResponse(config, created, 201);
      }

      if (id && method === 'GET') {
        const service = mockStore.getServiceById(id);
        if (!service) return fail(config, 404, 'Service not found.');
        return makeResponse(config, service);
      }

      if (id && (method === 'PUT' || method === 'PATCH')) {
        const existing = mockStore.getServiceById(id);
        if (!existing) return fail(config, 404, 'Service not found.');

        const slug = asString(body.slug) || existing.slug;
        const clash = mockStore.getServiceBySlug(slug);
        if (clash && clash.id !== id) {
          return fail(config, 409, 'A service with this slug already exists.', {
            slug: 'This URL slug is already in use.',
          });
        }

        const updated = mockStore.updateService(id, {
          title: asString(body.title) || existing.title,
          slug,
          shortDescription: asString(body.shortDescription),
          fullDescription: asString(body.fullDescription),
          icon: (asString(body.icon) || existing.icon) as Service['icon'],
          imageUrl: body.imageUrl === undefined ? existing.imageUrl : asNullable(body.imageUrl),
          imageAlt: body.imageAlt === undefined ? existing.imageAlt : asNullable(body.imageAlt),
          featured: body.featured === undefined ? existing.featured : Boolean(body.featured),
          published: body.published === undefined ? existing.published : Boolean(body.published),
          displayOrder:
            body.displayOrder === undefined
              ? existing.displayOrder
              : Number(body.displayOrder),
          seoTitle: body.seoTitle === undefined ? existing.seoTitle : asNullable(body.seoTitle),
          metaDescription:
            body.metaDescription === undefined
              ? existing.metaDescription
              : asNullable(body.metaDescription),
        });
        return makeResponse(config, updated);
      }

      if (id && method === 'DELETE') {
        if (!mockStore.deleteService(id)) return fail(config, 404, 'Service not found.');
        return makeResponse(config, { success: true });
      }
    }

    if (section === 'gallery') {
      if (!id && method === 'GET') {
        const page = Number(params.get('page') ?? 1);
        const limit = Number(params.get('limit') ?? 50);
        const status = params.get('status');
        const search = (params.get('search') ?? '').toLowerCase();
        let items = mockStore.listGallery();
        if (status && status !== 'all') {
          items = items.filter((item) => item.published === (status === 'published'));
        }
        if (search) {
          items = items.filter(
            (item) =>
              item.title.toLowerCase().includes(search) ||
              item.altText.toLowerCase().includes(search),
          );
        }
        return makeResponse(config, paginate(items, page, limit));
      }

      if (!id && method === 'POST') {
        const file = body.image instanceof File ? (body.image as File) : null;
        const title = asString(body.title);
        if (!title) {
          return fail(config, 422, 'Image title is required.', { title: 'Required.' });
        }
        if (!file && !asString(body.imageUrl)) {
          return fail(config, 422, 'Select an image to upload.', {
            imageUrl: 'Choose an image file.',
          });
        }
        if (file && file.size > 5 * 1024 * 1024) {
          return fail(config, 413, 'Image must be 5 MB or smaller.');
        }

        // In a real deployment the server stores the file and returns a CDN URL.
        // The mock uses an object URL so the preview is genuinely live.
        const imageUrl = file ? URL.createObjectURL(file) : asString(body.imageUrl);

        const created = mockStore.createGalleryItem({
          title,
          caption: asNullable(body.caption),
          altText: asString(body.altText) || title,
          category: (asString(body.category) || 'clinic') as GalleryItem['category'],
          imageUrl,
          thumbnailUrl: null,
          displayOrder: Number(body.displayOrder ?? 0),
          published: Boolean(body.published),
        });
        return makeResponse(config, created, 201);
      }

      if (id && method === 'PATCH') {
        const existing = mockStore.getGalleryItem(id);
        if (!existing) return fail(config, 404, 'Gallery item not found.');
        const updated = mockStore.updateGalleryItem(id, {
          title: asString(body.title) || existing.title,
          caption: body.caption === undefined ? existing.caption : asNullable(body.caption),
          altText: asString(body.altText) || existing.altText,
          category: (asString(body.category) || existing.category) as GalleryItem['category'],
          published:
            body.published === undefined ? existing.published : Boolean(body.published),
          displayOrder:
            body.displayOrder === undefined
              ? existing.displayOrder
              : Number(body.displayOrder),
        });
        return makeResponse(config, updated);
      }

      if (id && method === 'DELETE') {
        if (!mockStore.deleteGalleryItem(id)) return fail(config, 404, 'Gallery item not found.');
        return makeResponse(config, { success: true });
      }
    }

    if (section === 'inquiries') {
      if (!id && method === 'GET') {
        const page = Number(params.get('page') ?? 1);
        const limit = Number(params.get('limit') ?? 25);
        const search = (params.get('search') ?? '').toLowerCase();
        const status = params.get('status');

        let items = mockStore.listInquiries();
        if (status && status !== 'all') {
          items = items.filter((item) => item.status === status);
        }
        if (search) {
          items = items.filter(
            (item) =>
              item.fullName.toLowerCase().includes(search) ||
              item.phone.toLowerCase().includes(search),
          );
        }
        return makeResponse(config, paginate(items, page, limit));
      }

      if (id && method === 'GET') {
        const inquiry = mockStore.getInquiry(id);
        if (!inquiry) return fail(config, 404, 'Inquiry not found.');
        return makeResponse(config, inquiry);
      }

      if (id && (method === 'PATCH' || method === 'PUT')) {
        const existing: ContactInquiry | undefined = mockStore.getInquiry(id);
        if (!existing) return fail(config, 404, 'Inquiry not found.');
        const updated = mockStore.updateInquiry(id, {
          status: (asString(body.status) || existing.status) as ContactInquiry['status'],
          internalNotes:
            body.internalNotes === undefined
              ? existing.internalNotes
              : asNullable(body.internalNotes),
        });
        return makeResponse(config, updated);
      }
    }

    if (section === 'appointments') {
      if (!id && method === 'GET') {
        const page = Number(params.get('page') ?? 1);
        const limit = Number(params.get('limit') ?? 25);
        const search = (params.get('search') ?? '').toLowerCase();
        const status = params.get('status');

        let items = mockStore.listAppointments();
        if (status && status !== 'all') {
          items = items.filter((item) => item.status === status);
        }
        if (search) {
          items = items.filter(
            (item) =>
              item.patientName.toLowerCase().includes(search) ||
              item.phone.toLowerCase().includes(search),
          );
        }
        return makeResponse(config, paginate(items, page, limit));
      }

      if (id && method === 'GET') {
        const appointment: AppointmentRequest | undefined = mockStore.getAppointment(id);
        if (!appointment) return fail(config, 404, 'Appointment request not found.');
        return makeResponse(config, appointment);
      }

      if (id && (method === 'PATCH' || method === 'PUT')) {
        const existing = mockStore.getAppointment(id);
        if (!existing) return fail(config, 404, 'Appointment request not found.');
        const updated = mockStore.updateAppointment(id, {
          status: (asString(body.status) || existing.status) as AppointmentRequest['status'],
          confirmedDate:
            body.confirmedDate === undefined
              ? existing.confirmedDate
              : asNullable(body.confirmedDate),
          confirmedTime:
            body.confirmedTime === undefined
              ? existing.confirmedTime
              : asNullable(body.confirmedTime),
          internalNotes:
            body.internalNotes === undefined
              ? existing.internalNotes
              : asNullable(body.internalNotes),
        });
        return makeResponse(config, updated);
      }
    }

    if (section === 'settings') {
      if (method === 'GET') return makeResponse(config, mockStore.getSettings());
      if (method === 'PUT' || method === 'PATCH') {
        const updated = mockStore.updateSettings(
          body as Parameters<typeof mockStore.updateSettings>[0],
        );
        return makeResponse(config, updated);
      }
    }

    return fail(config, 404, 'The requested admin endpoint could not be found.');
  }

  return fail(config, 404, 'The requested endpoint could not be found.');
};