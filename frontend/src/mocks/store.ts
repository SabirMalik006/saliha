import type {
  AppointmentRequest,
  ClinicSettings,
  ContactInquiry,
  GalleryItem,
  Service,
} from '@/types';
import { defaultClinicSettings } from '@/constants/clinic';
import { mockGalleryItems, mockServices } from './data';

/* ==========================================================================
   DEVELOPMENT MOCK STORE
   In-memory only. Nothing here is persisted and nothing here is real clinic
   data. Resets on every page refresh. Enabled only via VITE_USE_MOCK_API.
   ========================================================================== */

let services: Service[] = structuredClone(mockServices);
let gallery: GalleryItem[] = structuredClone(mockGalleryItems);
let settings: ClinicSettings = structuredClone(defaultClinicSettings);

/** Session storage keeps the dev login alive across a refresh. */
const SESSION_KEY = 'sc.mock.session';

export interface MockSession {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

let session: MockSession | null = readStoredSession();

function readStoredSession(): MockSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(value: MockSession | null): void {
  try {
    if (value) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — in-memory session still works */
  }
  session = value;
}

/* --------------------------------------------------------------------------
   Seeded sample submissions so the admin screens are reviewable.
   Explicitly labelled as sample data.
   -------------------------------------------------------------------------- */

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAhead = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
};

let inquiries: ContactInquiry[] = [
  {
    id: 'inq-1',
    fullName: 'Sample Inquiry',
    phone: '0300-1234567',
    email: 'sample@example.com',
    subject: 'appointment',
    message:
      'Sample inquiry record shown in the development mock data. Please ask about an evening appointment.',
    status: 'new',
    internalNotes: null,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'inq-2',
    fullName: 'Sample Inquiry Two',
    phone: '051-1234567',
    email: null,
    subject: 'service-question',
    message:
      'Second sample inquiry used to demonstrate the admin filters and status workflow.',
    status: 'contacted',
    internalNotes: 'Sample internal note.',
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(12),
  },
];

let appointments: AppointmentRequest[] = [
  {
    id: 'apt-1',
    patientName: 'Sample Patient',
    phone: '0312-3456789',
    email: 'patient@example.com',
    preferredDate: daysAhead(2),
    preferredTime: '19:00',
    serviceId: 'svc-1',
    serviceName: 'Antenatal & Pregnancy Care',
    patientType: 'new',
    note: 'Sample appointment request from development mock data.',
    status: 'new',
    confirmedDate: null,
    confirmedTime: null,
    internalNotes: null,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'apt-2',
    patientName: 'Sample Returning Patient',
    phone: '0333-7654321',
    email: null,
    preferredDate: daysAhead(-3),
    preferredTime: 'any',
    serviceId: 'svc-3',
    serviceName: 'Infertility Evaluation & Treatment',
    patientType: 'returning',
    note: null,
    status: 'confirmed',
    confirmedDate: daysAhead(1),
    confirmedTime: '18:30',
    internalNotes: 'Sample confirmation recorded by clinic staff.',
    createdAt: hoursAgo(76),
    updatedAt: hoursAgo(24),
  },
];

const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* --------------------------------------------------------------------------
   Accessors
   -------------------------------------------------------------------------- */

export const mockStore = {
  /* Settings */
  getSettings: (): ClinicSettings => settings,
  updateSettings: (patch: Partial<ClinicSettings>): ClinicSettings => {
    settings = { ...settings, ...patch, social: { ...settings.social, ...(patch.social ?? {}) } };
    return settings;
  },

  /* Session */
  getSession: (): MockSession | null => session,
  setSession: (value: MockSession | null) => writeStoredSession(value),

  /* Services */
  listServices: (): Service[] => [...services].sort((a, b) => a.displayOrder - b.displayOrder),
  getServiceBySlug: (slug: string): Service | undefined =>
    services.find((item) => item.slug === slug),
  getServiceById: (id: string): Service | undefined =>
    services.find((item) => item.id === id),
  createService: (input: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service => {
    const now = new Date().toISOString();
    const created: Service = { ...input, id: nextId('svc'), createdAt: now, updatedAt: now };
    services = [...services, created];
    return created;
  },
  updateService: (
    id: string,
    patch: Partial<Omit<Service, 'id' | 'createdAt'>>,
  ): Service | undefined => {
    let updated: Service | undefined;
    services = services.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    return updated;
  },
  deleteService: (id: string): boolean => {
    const before = services.length;
    services = services.filter((item) => item.id !== id);
    return services.length < before;
  },
  reorderServices: (orderedIds: string[]): Service[] => {
    const orderMap = new Map<string, number>(
      orderedIds.map((id, index) => [id, index + 1]),
    );
    services = services.map((item) => {
      const order = orderMap.get(item.id);
      return order === undefined ? item : { ...item, displayOrder: order };
    });
    return [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /* Gallery */
  listGallery: (): GalleryItem[] =>
    [...gallery].sort((a, b) => a.displayOrder - b.displayOrder),
  getGalleryItem: (id: string): GalleryItem | undefined =>
    gallery.find((item) => item.id === id),
  createGalleryItem: (
    input: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): GalleryItem => {
    const now = new Date().toISOString();
    const created: GalleryItem = { ...input, id: nextId('gal'), createdAt: now, updatedAt: now };
    gallery = [...gallery, created];
    return created;
  },
  updateGalleryItem: (
    id: string,
    patch: Partial<Omit<GalleryItem, 'id' | 'createdAt'>>,
  ): GalleryItem | undefined => {
    let updated: GalleryItem | undefined;
    gallery = gallery.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    return updated;
  },
  deleteGalleryItem: (id: string): boolean => {
    const before = gallery.length;
    gallery = gallery.filter((item) => item.id !== id);
    return gallery.length < before;
  },

  /* Inquiries */
  listInquiries: (): ContactInquiry[] =>
    [...inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getInquiry: (id: string): ContactInquiry | undefined =>
    inquiries.find((item) => item.id === id),
  createInquiry: (
    input: Omit<ContactInquiry, 'id' | 'status' | 'internalNotes' | 'createdAt' | 'updatedAt'>,
  ): ContactInquiry => {
    const now = new Date().toISOString();
    const created: ContactInquiry = {
      ...input,
      id: nextId('inq'),
      status: 'new',
      internalNotes: null,
      createdAt: now,
      updatedAt: now,
    };
    inquiries = [created, ...inquiries];
    return created;
  },
  updateInquiry: (
    id: string,
    patch: Partial<Pick<ContactInquiry, 'status' | 'internalNotes'>>,
  ): ContactInquiry | undefined => {
    let updated: ContactInquiry | undefined;
    inquiries = inquiries.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    return updated;
  },

  /* Appointments */
  listAppointments: (): AppointmentRequest[] =>
    [...appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getAppointment: (id: string): AppointmentRequest | undefined =>
    appointments.find((item) => item.id === id),
  createAppointment: (
    input: Omit<
      AppointmentRequest,
      | 'id'
      | 'status'
      | 'confirmedDate'
      | 'confirmedTime'
      | 'internalNotes'
      | 'createdAt'
      | 'updatedAt'
    >,
  ): AppointmentRequest => {
    const now = new Date().toISOString();
    const created: AppointmentRequest = {
      ...input,
      id: nextId('apt'),
      // A request is NEVER auto-confirmed by the frontend.
      status: 'new',
      confirmedDate: null,
      confirmedTime: null,
      internalNotes: null,
      createdAt: now,
      updatedAt: now,
    };
    appointments = [created, ...appointments];
    return created;
  },
  updateAppointment: (
    id: string,
    patch: Partial<
      Pick<
        AppointmentRequest,
        'status' | 'confirmedDate' | 'confirmedTime' | 'internalNotes'
      >
    >,
  ): AppointmentRequest | undefined => {
    let updated: AppointmentRequest | undefined;
    appointments = appointments.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    return updated;
  },
};