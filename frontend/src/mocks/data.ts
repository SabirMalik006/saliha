import type { GalleryItem, Service } from '@/types';

/* ==========================================================================
   DEVELOPMENT MOCK DATA — NOT REAL CLINIC CONTENT
   --------------------------------------------------------------------------
   Used only when `VITE_USE_MOCK_API=true` (the default for local dev).
   All clinic facts below come from the approved brief. Any item the clinic
   has not yet approved (photography, map pin, email) is intentionally empty.
   ========================================================================== */

const stamp = (index: number) =>
  new Date(Date.UTC(2025, 0, 1 + index, 9, 30)).toISOString();

export const mockServices: Service[] = [
  {
    id: 'svc-1',
    slug: 'antenatal-pregnancy-care',
    title: 'Antenatal & Pregnancy Care',
    shortDescription:
      'Routine pregnancy consultation, monitoring and guidance through pregnancy.',
    fullDescription:
      'Pregnancy is a demanding period, and consistent guidance makes it easier to navigate. This service covers routine antenatal consultations through the different stages of pregnancy, including review of symptoms, interpretation of routine investigations, guidance on nutrition and activity, and advice on warning signs that need prompt medical review.\n\nConsultations are scheduled within the evening clinic hours so working patients and family members can attend. Where a situation requires hospital-level assessment, the doctor will advise clearly on referral and next steps.\n\nThis is general obstetric information. Your consultation will be based on your own history and examination findings.',
    icon: 'pregnancy',
    imageUrl: '/images/doctor/dr-saleha.png',
    imageAlt: 'Dr. Saleha Ibtisam — Consultant Gynecologist & Obstetrician',
    featured: true,
    published: true,
    displayOrder: 1,
    seoTitle: 'Antenatal & Pregnancy Care in Rawalpindi | Specialist Clinic',
    metaDescription:
      'Routine antenatal and pregnancy care consultations with Dr. Saleha Ibtisam at Specialist Clinic, Morgah, Rawalpindi. Evening clinic 6 PM to 9 PM.',
    createdAt: stamp(0),
    updatedAt: stamp(0),
  },
  {
    id: 'svc-2',
    slug: 'menstrual-womens-health-problems',
    title: "Menstrual & Women's Health Problems",
    shortDescription:
      'Consultation for menstrual concerns and common gynecological health issues.',
    fullDescription:
      'Many menstrual and gynecological concerns are manageable once they are assessed early. This service covers consultations for irregular or heavy periods, painful menstruation, premenstrual symptoms, abnormal bleeding patterns, and related concerns.\n\nThe consultation focuses on understanding the pattern of symptoms, relevant history, and what further evaluation is appropriate. Treatment options are discussed in plain language so you understand what is being suggested and why.\n\nIf any symptom requires urgent review, please contact the clinic directly so the team can advise you appropriately.',
    icon: 'menstrual',
    imageUrl: '/images/logo/clinic-logo-512.jpg',
    imageAlt: 'Specialist Clinic — reception and clinic facility',
    featured: true,
    published: true,
    displayOrder: 2,
    seoTitle: "Menstrual & Women's Health Problems | Specialist Clinic Rawalpindi",
    metaDescription:
      'Consultation for irregular periods, heavy bleeding, menstrual pain and common gynecological health concerns in Morgah, Rawalpindi.',
    createdAt: stamp(1),
    updatedAt: stamp(1),
  },
  {
    id: 'svc-3',
    slug: 'infertility-evaluation-treatment',
    title: 'Infertility Evaluation & Treatment',
    shortDescription:
      'Assessment and treatment guidance for couples facing difficulty conceiving.',
    fullDescription:
      'Difficulty conceiving can be stressful, and a structured assessment helps bring clarity. This service covers consultation for couples who have not conceived after a period of trying, including discussion of the timing of attempts, relevant history for both partners, and which evaluations are reasonable to begin with.\n\nTreatment planning depends on the findings and is discussed individually. No outcome can be guaranteed, and your consultation will be based on the information available at the time.\n\nBoth partners are welcome to attend. Please bring any previous test reports you already have.',
    icon: 'fertility',
    imageUrl: '/images/doctor/dr-saleha.png',
    imageAlt: 'Dr. Saleha Ibtisam — specialist consultation',
    featured: true,
    published: true,
    displayOrder: 3,
    seoTitle: 'Infertility Evaluation & Treatment in Rawalpindi | Specialist Clinic',
    metaDescription:
      'Consultation and evaluation guidance for couples facing difficulty conceiving. Evening appointments at Specialist Clinic, Morgah, Rawalpindi.',
    createdAt: stamp(2),
    updatedAt: stamp(2),
  },
  {
    id: 'svc-4',
    slug: 'family-planning',
    title: 'Family Planning',
    shortDescription: 'Counseling on family planning and suitable contraceptive options.',
    fullDescription:
      'Family planning is an important part of reproductive healthcare. This service covers counselling on spacing and timing of pregnancies, suitable contraceptive methods, and what to consider when choosing an option.\n\nDifferent methods work in different situations. The consultation reviews your health history, any current medications, and your priorities before discussing options.\n\nThe aim is to support informed decisions. Nothing is prescribed without a consultation and your agreement.',
    icon: 'family-planning',
    imageUrl: '/images/logo/clinic-logo-256.jpg',
    imageAlt: 'Specialist Clinic — professional women’s health care facility',
    featured: true,
    published: true,
    displayOrder: 4,
    seoTitle: 'Family Planning Counselling | Specialist Clinic Rawalpindi',
    metaDescription:
      'Family planning counselling and discussion of suitable contraceptive options with Dr. Saleha Ibtisam in Morgah, Rawalpindi.',
    createdAt: stamp(3),
    updatedAt: stamp(3),
  },
  {
    id: 'svc-5',
    slug: 'antenatal-follow-up-care',
    title: 'Antenatal Follow-up & Pregnancy Monitoring',
    shortDescription:
      'Ongoing antenatal follow-up to monitor maternal and fetal wellbeing throughout pregnancy.',
    fullDescription:
      'Regular antenatal follow-up helps detect concerns early and keeps you informed at every stage. This service focuses on ongoing monitoring, reviewing investigation results, tracking growth and wellbeing, and addressing new symptoms as pregnancy progresses.\n\nAppointments are planned with enough time to discuss your questions in detail. Clear explanations help you know what to expect next and when to seek care.\n\nConsultations follow the approved clinic schedule during evening hours for your convenience.',
    icon: 'pregnancy',
    imageUrl: '/images/logo/clinic-logo-128.jpg',
    imageAlt: 'Specialist Clinic — trusted women’s health care',
    featured: true,
    published: true,
    displayOrder: 5,
    seoTitle: 'Antenatal Follow-up Care in Rawalpindi | Specialist Clinic',
    metaDescription:
      'Ongoing antenatal follow-up and pregnancy monitoring with Dr. Saleha Ibtisam at Specialist Clinic, Morgah, Rawalpindi.',
    createdAt: stamp(4),
    updatedAt: stamp(4),
  },
];

export const mockGalleryItems: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Dr. Saleha Ibtisam',
    caption: 'Consultant Gynecologist & Obstetrician — Specialist Clinic, Morgah, Rawalpindi.',
    altText: 'Dr. Saleha Ibtisam — Consultant Gynecologist & Obstetrician at Specialist Clinic',
    category: 'clinic',
    imageUrl: '/images/doctor/dr-saleha.png',
    thumbnailUrl: null,
    displayOrder: 1,
    published: true,
    createdAt: stamp(0),
    updatedAt: stamp(0),
  },
  {
    id: 'gal-2',
    title: 'Specialist Clinic — Main Logo',
    caption: 'Official clinic logo representing safe care and expert guidance.',
    altText: 'Specialist Clinic logo — women’s health clinic in Morgah, Rawalpindi',
    category: 'clinic',
    imageUrl: '/images/logo/clinic-logo-512.jpg',
    thumbnailUrl: null,
    displayOrder: 2,
    published: true,
    createdAt: stamp(1),
    updatedAt: stamp(1),
  },
  {
    id: 'gal-3',
    title: 'Clinic Facility',
    caption: 'Professional clinic space designed for women’s health consultations.',
    altText: 'Specialist Clinic facility — consultation and care environment',
    category: 'clinic',
    imageUrl: '/images/logo/clinic-logo-256.jpg',
    thumbnailUrl: null,
    displayOrder: 3,
    published: true,
    createdAt: stamp(2),
    updatedAt: stamp(2),
  },
  {
    id: 'gal-4',
    title: 'Clinic Identity',
    caption: 'Trusted women’s health care in Morgah, Rawalpindi.',
    altText: 'Specialist Clinic — trusted women’s health care facility',
    category: 'clinic',
    imageUrl: '/images/logo/clinic-logo-128.jpg',
    thumbnailUrl: null,
    displayOrder: 4,
    published: true,
    createdAt: stamp(3),
    updatedAt: stamp(3),
  },
  {
    id: 'gal-5',
    title: 'Specialist Clinic — Official Photo',
    caption: 'Clinic branding and identity for Specialist Clinic.',
    altText: 'Specialist Clinic — official clinic photograph',
    category: 'clinic',
    imageUrl: '/images/logo/WhatsApp Image 2026-10-05 at 12.09.30 PM.jpeg',
    thumbnailUrl: null,
    displayOrder: 5,
    published: true,
    createdAt: stamp(4),
    updatedAt: stamp(4),
  },
];