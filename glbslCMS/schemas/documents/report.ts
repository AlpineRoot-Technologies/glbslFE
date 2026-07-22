import {defineType, defineField, type SlugifierFn} from 'sanity'

const reportSlugify: SlugifierFn = (input: string) => {
  const ascii = input
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (ascii.length >= 3) return ascii.slice(0, 200)

  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const randPart = Math.random().toString(36).slice(2, 7)
  return `report-${datePart}-${randPart}`
}

export default defineType({
  name: 'report',
  title: 'Report',
  type: 'document',
  fields: [
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'Auto-generated from the title. For Nepali titles a unique date-based slug is created — just click "Generate".',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200,
        slugify: reportSlugify,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.max(1000),
    }),
    defineField({
      name: 'reportType',
      title: 'Report Type',
      type: 'string',
      options: {
        list: [
          {title: 'Quarterly', value: 'quarterly'},
          {title: 'Annual', value: 'annual'},
          {title: 'AGM', value: 'agm'},
          {title: 'Base Rate', value: 'base-rate'},
          {title: 'Staff Training', value: 'staff-training'},
          {title: 'Governance', value: 'governance'},
          {title: 'Interest Rate', value: 'interest-rate'},
          {title: 'Financial Indicator', value: 'financial-indicator'},
          {title: 'CSR Report', value: 'csr'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fiscalYear',
      title: 'Fiscal Year',
      type: 'string',
    }),
    defineField({
      name: 'quarter',
      title: 'Quarter',
      type: 'string',
      options: {
        list: [
          {title: 'Q1', value: 'Q1'},
          {title: 'Q2', value: 'Q2'},
          {title: 'Q3', value: 'Q3'},
          {title: 'Q4', value: 'Q4'},
        ],
      },
    }),
    defineField({
      name: 'fileSource',
      title: 'File Source',
      type: 'string',
      options: {
        list: [
          {title: 'Upload', value: 'Upload'},
          {title: 'Google Drive', value: 'Google_Drive'},
        ],
        layout: 'radio',
      },
      initialValue: 'Upload',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'uploadedFile',
      title: 'Uploaded File',
      type: 'file',
      hidden: ({document}) => document?.fileSource === 'Google_Drive',
    }),
    defineField({
      name: 'fileId',
      title: 'Google Drive File ID',
      type: 'string',
      hidden: ({document}) => document?.fileSource !== 'Google_Drive',
      validation: (rule) => rule.max(250),
    }),
    defineField({
      name: 'fileName',
      title: 'File Name',
      type: 'string',
      hidden: ({document}) => document?.fileSource !== 'Google_Drive',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
    }),
  ],
  groups: [
    {name: 'seo', title: 'SEO', default: false},
  ],
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishDateDesc',
      by: [{field: 'publishDate', direction: 'desc'}],
    },
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      reportType: 'reportType',
      fiscalYear: 'fiscalYear',
    },
    prepare({title, reportType, fiscalYear}) {
      return {
        title,
        subtitle: [reportType, fiscalYear].filter(Boolean).join(' - '),
      }
    },
  },
})
