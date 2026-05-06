import { sanityFetch, urlFor } from '../lib/sanity';

// ── Locale helper ──────────────────────────────────────────────────
const ALLOWED_LOCALES = ['en', 'ne'];
const getLocale = () => {
  const lang = localStorage.getItem('language');
  return lang && ALLOWED_LOCALES.includes(lang) ? lang : 'en';
};

// ── Image URL helper (replaces getStrapiMediaUrl) ──────────────────
// Accepts either a Sanity image object or a plain URL string.
export const getStrapiMediaUrl = (source?: any): string => {
  if (!source) return '';
  if (typeof source === 'string') {
    if (source.startsWith('http')) return source;
    return '';
  }
  // Sanity image object
  return urlFor(source).auto('format').quality(80).url();
};

// ── GROQ query fragments ──────────────────────────────────────────
const PERSON_FIELDS = `
  _id,
  name,
  position,
  department,
  bio,
  email,
  phone,
  image,
  order,
  personType
`;

const REPORT_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  reportType,
  publishDate,
  fiscalYear,
  quarter,
  fileSource,
  uploadedFile { asset->{ url } },
  fileId,
  fileName,
  featured,
  isActive,
  order,
  tags,
  seoTitle,
  seoDescription
`;

const NOTICE_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  content,
  noticeType,
  publishDate,
  expiryDate,
  isUrgent,
  priority,
  isActive,
  noticeImage,
  fileSource,
  uploadedFile { asset->{ url } },
  attachmentFileId,
  attachmentFileName,
  attachmentFileSize,
  viewCount,
  tags,
  displayPopup,
  seoTitle,
  seoDescription
`;

// ── About Service ─────────────────────────────────────────────────
export const aboutService = {
  getAboutUs: async () => {
    const lang = getLocale();
    return sanityFetch<any>(
      `*[_type == "aboutUsSetting" && language == $lang][0] {
        mission, vision, goal, aboutUsDescription, aboutUsImage
      }`,
      { lang },
    );
  },

  getBoardMembers: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "person" && language == $lang && personType == "boardMember"] | order(order asc) { ${PERSON_FIELDS} }`,
      { lang },
    );
  },

  getManagementTeam: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "person" && language == $lang && personType == "managementTeam"] | order(order asc) { ${PERSON_FIELDS} }`,
      { lang },
    );
  },

  getCorporateTeam: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "person" && language == $lang && personType == "corporateTeam"] | order(order asc) { ${PERSON_FIELDS} }`,
      { lang },
    );
  },

  getCommitteeMembers: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "person" && language == $lang && personType == "committeeMember"] | order(order asc) { ${PERSON_FIELDS} }`,
      { lang },
    );
  },

  getCommittees: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "committee" && language == $lang] {
        _id,
        name,
        description,
        members[] {
          _key,
          committeePosition,
          roleDescription,
          order,
          person-> {
            _id, name, position, department, image, email, phone
          }
        }
      }`,
      { lang },
    );
  },

  getMonitoringSupervision: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "person" && language == $lang && personType == "monitoringSupervision"] | order(order asc) { ${PERSON_FIELDS} }`,
      { lang },
    );
  },

  getOrganizationStructure: async () => {
    const lang = getLocale();
    return sanityFetch<any>(
      `*[_type == "organizationStructure" && language == $lang][0] {
        title, description, structureImage
      }`,
      { lang },
    );
  },

  getInformationOfficer: async () => {
    const results = await sanityFetch<any[]>(
      `*[_type == "person" && personType == "informationOfficer"] | order(order asc) [0..0] { ${PERSON_FIELDS} }`,
      {},
    );
    return results?.[0] || null;
  },

  getComplianceOfficer: async () => {
    const results = await sanityFetch<any[]>(
      `*[_type == "person" && personType == "complianceOfficer"] | order(order asc) [0..0] { ${PERSON_FIELDS} }`,
      {},
    );
    return results?.[0] || null;
  },

  getComplaintOfficer: async () => {
    const results = await sanityFetch<any[]>(
      `*[_type == "person" && personType == "complaintOfficer"] | order(order asc) [0..0] { ${PERSON_FIELDS} }`,
      {},
    );
    return results?.[0] || null;
  },
};

// ── Services Service ──────────────────────────────────────────────
export const servicesService = {
  getLoanProducts: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "loanProduct" && language == $lang] | order(order asc) {
        _id, name, volume, rate, serviceCharge, term, order
      }`,
      { lang },
    );
  },

  getSavingsProducts: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "savingsProduct" && language == $lang] | order(order asc) {
        _id, name, interestRate, order
      }`,
      { lang },
    );
  },

  getRemittanceService: async () => {
    const lang = getLocale();
    return sanityFetch<any>(
      `*[_type == "remittanceService" && language == $lang][0] {
        title, description, images,
        features[] { _key, title, description, icon }
      }`,
      { lang },
    );
  },

  getMemberWelfareService: async () => {
    const lang = getLocale();
    return sanityFetch<any>(
      `*[_type == "memberWelfareService" && language == $lang][0] {
        title, description,
        welfareServices[] { _key, title, description, icon }
      }`,
      { lang },
    );
  },

  getServiceCategories: async () => {
    const lang = getLocale();
    return sanityFetch<any[]>(
      `*[_type == "serviceCategory" && language == $lang] | order(order asc) {
        _id, title, "slug": slug.current, description, icon, order
      }`,
      { lang },
    );
  },
};

// ── Reports Service ───────────────────────────────────────────────
// Language filter intentionally removed from all report queries:
// reports contain the same file content regardless of language, so a
// single English upload must be visible in both EN and NE views.
export const reportsService = {
  getAllReports: async () => {
    try {
      const data = await sanityFetch<any[]>(
        `*[_type == "report" && isActive == true] | order(publishDate desc, _createdAt desc) { ${REPORT_FIELDS} }`,
      );
      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching all reports:', error);
      return { data: [] };
    }
  },

  getReportsByCategory: async (categorySlug: string) => {
    try {
      const data = await sanityFetch<any[]>(
        `*[_type == "report" && isActive == true && references(*[_type == "reportCategory" && slug.current == $categorySlug]._id)] | order(publishDate desc, _createdAt desc) { ${REPORT_FIELDS} }`,
        { categorySlug },
      );
      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching reports by category:', error);
      return { data: [] };
    }
  },

  getReportsByType: async (reportType: string) => {
    try {
      const data = await sanityFetch<any[]>(
        `*[_type == "report" && isActive == true && reportType == $reportType] | order(publishDate desc, _createdAt desc) { ${REPORT_FIELDS} }`,
        { reportType },
      );
      return { data: data || [] };
    } catch (error) {
      console.error(`Error fetching reports by type ${reportType}:`, error);
      return { data: [] };
    }
  },

  getFeaturedReports: async () => {
    try {
      const data = await sanityFetch<any[]>(
        `*[_type == "report" && isActive == true && featured == true] | order(publishDate desc, _createdAt desc) { ${REPORT_FIELDS} }`,
      );
      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching featured reports:', error);
      return { data: [] };
    }
  },

  getReport: async (slug: string) => {
    try {
      return sanityFetch<any>(
        `*[_type == "report" && isActive == true && slug.current == $slug][0] { ${REPORT_FIELDS} }`,
        { slug },
      );
    } catch (error) {
      console.error('Error fetching report:', error);
      return null;
    }
  },
};

// ── Notices Service ───────────────────────────────────────────────
export const noticesService = {
  getNotices: async () => {
    try {
      const lang = getLocale();
      const data = await sanityFetch<any[]>(
        `*[_type == "notice" && isActive == true && (language == $lang || !defined(language))] | order(publishDate desc) { ${NOTICE_FIELDS} }`,
        { lang },
      );
      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching notices:', error);
      return { data: [] };
    }
  },

  // Language filter removed from getNoticesByType so career notices (which
  // contain the same content regardless of language) are always visible.
  getNoticesByType: async (noticeType: string) => {
    try {
      const data = await sanityFetch<any[]>(
        `*[_type == "notice" && noticeType == $noticeType && isActive == true] | order(publishDate desc, _createdAt desc) { ${NOTICE_FIELDS} }`,
        { noticeType },
      );
      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching notices by type:', error);
      return { data: [] };
    }
  },

  getUrgentNotices: async () => {
    try {
      const lang = getLocale();
      const data = await sanityFetch<any[]>(
        `*[_type == "notice" && isUrgent == true && isActive == true && (language == $lang || !defined(language))] | order(publishDate desc) { ${NOTICE_FIELDS} }`,
        { lang },
      );
      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching urgent notices:', error);
      return { data: [] };
    }
  },

  getNotice: async (slug: string) => {
    try {
      const lang = getLocale();
      return sanityFetch<any>(
        `*[_type == "notice" && slug.current == $slug && (language == $lang || !defined(language))][0] { ${NOTICE_FIELDS} }`,
        { lang, slug },
      );
    } catch (error) {
      console.error('Error fetching notice:', error);
      return null;
    }
  },

  getPopupNotices: async () => {
    try {
      const lang = getLocale();
      // Lean projection — only what the popup UI needs, with expiry guard
      return sanityFetch<any[]>(
        `*[_type == "notice"
            && (language == $lang || !defined(language))
            && displayPopup == true
            && isActive == true
            && (expiryDate == null || expiryDate > now())
          ] | order(priority desc, publishDate desc) {
          _id,
          title,
          "slug": slug.current,
          noticeImage,
          uploadedFile { asset->{ url, originalFilename, mimeType } }
        }`,
        { lang },
      );
    } catch (error) {
      console.error('Error fetching popup notices:', error);
      return [];
    }
  },
};

// ── Base Rate Entries Service ─────────────────────────────────────
export const baseRateService = {
  getEntries: async () => {
    try {
      return sanityFetch<any[]>(
        `*[_type == "baseRateEntry"] | order(nepaliYear desc, nepaliMonth asc) {
          _id, nepaliYear, nepaliMonth, monthlyBaseRate
        }`,
      );
    } catch (error) {
      console.error('Error fetching base rate entries:', error);
      return [];
    }
  },
};

// ── Branches Service ──────────────────────────────────────────────
export const branchesService = {
  getBranches: async () => {
    try {
      return sanityFetch<any[]>(
        `*[_type == "branch"] | order(sn asc) {
          _id, sn, name, district, municipality, ward, locality,
          contactPerson, phone, email,
          managerImage
        }`,
      );
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  },
};

// ── Hero Images Service ───────────────────────────────────────────
export const heroImagesService = {
  getHeroImages: async () => {
    try {
      return sanityFetch<any[]>(
        `*[_type == "heroImage" && isActive == true] | order(order asc) {
          _id, title, image, altText, caption, order
        }`,
      );
    } catch (error) {
      console.error('Error fetching hero images:', error);
      return [];
    }
  },
};

// ── Testimonials Service ──────────────────────────────────────────
export const testimonialsService = {
  getTestimonials: async () => {
    try {
      const lang = getLocale();
      return sanityFetch<any[]>(
        `*[_type == "testimonial" && language == $lang && isActive == true] | order(order asc) {
          _id, name, position, organization, image, testimonial, order
        }`,
        { lang },
      );
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },
};

// ── Google Drive helpers (unchanged — still used for reports/notices) ─
export const googleDriveHelpers = {
  getViewUrl: (fileId: string) =>
    `https://drive.google.com/file/d/${fileId}/preview`,

  getDownloadUrl: (fileId: string) =>
    `https://drive.google.com/uc?export=download&id=${fileId}`,

  getThumbnailUrl: (fileId: string, size: string = 'w400') =>
    `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`,

  openInNewTab: (fileId: string) => {
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
  },

  downloadFile: async (fileId: string, fileName: string, trackingCallback?: () => void) => {
    if (trackingCallback) trackingCallback();
    const link = document.createElement('a');
    link.href = googleDriveHelpers.getDownloadUrl(fileId);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
