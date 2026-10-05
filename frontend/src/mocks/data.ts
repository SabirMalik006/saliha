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
    imageUrl: null,
    imageAlt: null,
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
    imageUrl: null,
    imageAlt: null,
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
    imageUrl: null,
    imageAlt: null,
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
    imageUrl: null,
    imageAlt: null,
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
    slug: 'normal-c-section-deliveries',
    title: 'Normal & C-Section Deliveries',
    shortDescription:
      'Maternity care and delivery planning, including normal delivery and C-section when clinically required.',
    fullDescription:
      'Delivery care requires planning well ahead of the due date. This service covers antenatal follow-up, discussion of birth plans, and preparation for delivery.\n\nThe mode of delivery depends on clinical findings and circumstances at the time of labour. Normal delivery and caesarean section are both valid approaches when they are clinically appropriate, and the decision is always based on the safety of mother and baby.\n\nNo method of delivery can be guaranteed in advance. The doctor will explain the recommended plan and the reasons behind it at each stage.',
    icon: 'delivery',
    imageUrl: null,
    imageAlt: null,
    featured: true,
    published: true,
    displayOrder: 5,
    seoTitle: 'Normal & C-Section Delivery Care in Rawalpindi | Specialist Clinic',
    metaDescription:
      'Maternity care and delivery planning with Dr. Saleha Ibtisam, including normal delivery and C-section care in Morgah, Rawalpindi.',
    createdAt: stamp(4),
    updatedAt: stamp(4),
  },
  {
    id: 'svc-6',
    slug: 'menopause-care-guidance',
    title: 'Menopause Care & Guidance',
    shortDescription:
      'Consultation and support for symptoms and health concerns related to menopause.',
    fullDescription:
      'Menopause is a natural transition, but its symptoms can affect daily life and wellbeing. This service covers consultation for hot flushes, sleep disturbance, mood changes, changes in bleeding patterns, and concerns about bone and heart health.\n\nThe consultation reviews your symptoms and overall health, and discusses management options including lifestyle measures and, where appropriate, medical treatment.\n\nSymptoms after menopause can occasionally signal something that needs investigation. Your consultation will help clarify what should be assessed.',
    icon: 'menopause',
    imageUrl: null,
    imageAlt: null,
    featured: true,
    published: true,
    displayOrder: 6,
    seoTitle: 'Menopause Care & Guidance | Specialist Clinic Rawalpindi',
    metaDescription:
      'Consultation and support for menopausal symptoms and related health concerns at Specialist Clinic, Morgah, Rawalpindi.',
    createdAt: stamp(5),
    updatedAt: stamp(5),
  },
  {
    id: 'svc-7',
    slug: 'gynecological-surgeries',
    title: 'Gynecological Surgeries',
    shortDescription:
      'Consultation and surgical management for appropriate gynecological conditions.',
    fullDescription:
      'Some gynecological conditions are best managed surgically. This service covers consultation for conditions where an operation may be appropriate, discussion of the expected course, risks, and alternatives, and pre- and post-operative care where the procedure is carried out.\n\nWhether an operation is suitable is decided after assessment. Laparoscopic and open approaches are discussed where relevant to the condition.\n\nSurgical outcomes cannot be guaranteed. You will receive an explanation of the specific risks that apply to your situation before any decision is made.',
    icon: 'surgery',
    imageUrl: null,
    imageAlt: null,
    featured: true,
    published: true,
    displayOrder: 7,
    seoTitle: 'Gynecological Surgery Consultation | Specialist Clinic Rawalpindi',
    metaDescription:
      'Consultation and surgical management for appropriate gynecological conditions with Dr. Saleha Ibtisam in Morgah, Rawalpindi.',
    createdAt: stamp(6),
    updatedAt: stamp(6),
  },
  {
    id: 'svc-8',
    slug: 'general-obstetrics-gynecology',
    title: 'General Obstetrics & Gynecology',
    shortDescription:
      'Comprehensive consultation for pregnancy and women’s reproductive health concerns.',
    fullDescription:
      'This is a general consultation covering the breadth of obstetrics and gynecology, including areas not listed separately above. It is suitable for a first discussion, for follow-up of an existing plan, or when you are unsure which service your concern falls under.\n\nBring any previous reports, medication list, or referral letters you have. That information helps make the consultation more useful from the first visit.\n\nIf your concern requires urgent attention, please contact the clinic by phone instead of waiting for an appointment.',
    icon: 'general',
    imageUrl: null,
    imageAlt: null,
    featured: true,
    published: true,
    displayOrder: 8,
    seoTitle: 'General Obstetrics & Gynecology Consultation | Specialist Clinic',
    metaDescription:
      'Comprehensive obstetrics and gynecology consultation with Dr. Saleha Ibtisam at Specialist Clinic, Morgah, Rawalpindi.',
    createdAt: stamp(7),
    updatedAt: stamp(7),
  },
];

export const mockGalleryItems: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Clinic Reception',
    caption: 'Reception area where appointment requests are confirmed.',
    altText: 'Placeholder illustration representing the clinic reception and waiting area at Specialist Clinic.',
    category: 'clinic',
    imageUrl: '/images/gallery/reception.svg',
    thumbnailUrl: null,
    displayOrder: 1,
    published: true,
    createdAt: stamp(0),
    updatedAt: stamp(0),
  },
  {
    id: 'gal-2',
    title: 'Consultation Room',
    caption: 'Private consultation room available during evening clinic hours.',
    altText: 'Placeholder illustration representing a private consultation room at Specialist Clinic.',
    category: 'clinic',
    imageUrl: '/images/gallery/consultation-room.svg',
    thumbnailUrl: null,
    displayOrder: 2,
    published: true,
    createdAt: stamp(1),
    updatedAt: stamp(1),
  },
  {
    id: 'gal-3',
    title: 'Care & Examination Area',
    caption: 'Prepared examination area for obstetric and gynecological care.',
    altText: 'Placeholder illustration representing a prepared examination area at Specialist Clinic.',
    category: 'clinic',
    imageUrl: '/images/gallery/care-area.svg',
    thumbnailUrl: null,
    displayOrder: 3,
    published: true,
    createdAt: stamp(2),
    updatedAt: stamp(2),
  },
  {
    id: 'gal-4',
    title: 'Women’s Health Awareness',
    caption: 'Educational material shared during awareness discussions.',
    altText: 'Placeholder illustration representing a women’s health awareness educational session.',
    category: 'awareness',
    imageUrl: '/images/gallery/awareness-session.svg',
    thumbnailUrl: null,
    displayOrder: 4,
    published: true,
    createdAt: stamp(3),
    updatedAt: stamp(3),
  },
  {
    id: 'gal-5',
    title: 'Community Health Event',
    caption: 'Clinic participation in a community health discussion.',
    altText: 'Placeholder illustration representing a community health event hosted by Specialist Clinic.',
    category: 'events',
    imageUrl: '/images/gallery/event-education.svg',
    thumbnailUrl: null,
    displayOrder: 5,
    published: true,
    createdAt: stamp(4),
    updatedAt: stamp(4),
  },
  {
    id: 'gal-6',
    title: 'Appointment Promotion',
    caption: 'Appointment promotion artwork awaiting clinic approval.',
    altText: 'Placeholder illustration representing promotional artwork for clinic appointments.',
    category: 'promotional',
    imageUrl: '/images/gallery/promo-card.svg',
    thumbnailUrl: null,
    displayOrder: 6,
    published: true,
    createdAt: stamp(5),
    updatedAt: stamp(5),
  },
];