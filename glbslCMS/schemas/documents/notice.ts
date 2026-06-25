import {defineType, defineField, type SlugifierFn} from 'sanity'

/**
 * Custom slugifier that handles non-Latin titles (Nepali/Devanagari etc.).
 *
 * Strategy:
 *  1. Attempt standard ASCII slug from the title.
 *  2. If that produces fewer than 3 usable characters (Devanagari strips to nothing),
 *     fall back to a deterministic unique slug: notice-YYYYMMDD-<5 random chars>.
 *
 * This means Nepali notices always get a valid, unique slug without manual effort.
 */
const noticeSlugify: SlugifierFn = (input: string) => {
  const ascii = input
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, '') // strip non-ASCII (Devanagari etc.)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (ascii.length >= 3) return ascii.slice(0, 200)

  // Fallback: date + random suffix → reproducible-looking, definitely unique
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const randPart = Math.random().toString(36).slice(2, 7)
  return `notice-${datePart}-${randPart}`
}

export default defineType({
  name: 'notice',
  title: 'Notice',
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'Auto-generated from the title. For Nepali titles a unique date-based slug is created automatically — just click "Generate".',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200,
        slugify: noticeSlugify,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'noticeType',
      title: 'Notice Type',
      type: 'string',
      options: {
        list: [
          {title: 'General', value: 'general'},
          {title: 'Regulatory', value: 'regulatory'},
          {title: 'Urgent', value: 'urgent'},
          {title: 'Public', value: 'public'},
          {title: 'Internal', value: 'internal'},
          {title: 'Event', value: 'event'},
          {title: 'Career', value: 'career'},
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'expiryDate',
      title: 'Expiry Date',
      type: 'datetime',
    }),
    defineField({
      name: 'isUrgent',
      title: 'Is Urgent',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'noticeImage',
      title: 'Notice Image',
      type: 'image',
      options: {
        hotspot: true,
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
      name: 'attachmentFileId',
      title: 'Google Drive File ID',
      type: 'string',
      hidden: ({document}) => document?.fileSource !== 'Google_Drive',
    }),
    defineField({
      name: 'attachmentFileName',
      title: 'Attachment File Name',
      type: 'string',
      hidden: ({document}) => document?.fileSource !== 'Google_Drive',
    }),
    defineField({
      name: 'attachmentFileSize',
      title: 'Attachment File Size',
      type: 'string',
      hidden: ({document}) => document?.fileSource !== 'Google_Drive',
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
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
      name: 'displayPopup',
      title: 'Display as Popup',
      type: 'boolean',
      initialValue: false,
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
      title: 'Priority',
      name: 'priorityDesc',
      by: [{field: 'priority', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      noticeType: 'noticeType',
      isUrgent: 'isUrgent',
      media: 'noticeImage',
    },
    prepare({title, noticeType, isUrgent, media}) {
      return {
        title: `${isUrgent ? '🔴 ' : ''}${title}`,
        subtitle: noticeType ? noticeType.charAt(0).toUpperCase() + noticeType.slice(1) : '',
        media,
      }
    },
  },
})
