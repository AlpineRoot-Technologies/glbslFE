import {type StructureBuilder} from 'sanity/structure'
import {
  CogIcon,
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BlockContentIcon,
  ImagesIcon,
  StarIcon,
  TagIcon,
  TransferIcon,
  HeartIcon,
  ComponentIcon,
  PinIcon,
  TrendUpwardIcon,
} from '@sanity/icons'

// Singleton document types that should not allow "Create new"
const singletonTypes = new Set([
  'aboutUsSetting',
  'memberWelfareService',
  'organizationStructure',
  'remittanceService',
])

// Helper to create a singleton list item
function singletonListItem(
  S: StructureBuilder,
  typeName: string,
  title: string,
  icon?: React.ComponentType
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(typeName))
}

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // === SITE SETTINGS ===
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Site Settings')
            .items([
              singletonListItem(S, 'aboutUsSetting', 'About Us', BlockContentIcon),
              singletonListItem(S, 'organizationStructure', 'Organization Structure', ComponentIcon),
            ])
        ),

      S.divider(),

      // === HERO & DISPLAY ===
      S.listItem()
        .title('Hero Images')
        .icon(ImagesIcon)
        .child(S.documentTypeList('heroImage').title('Hero Images')),

      S.divider(),

      // === PEOPLE & COMMITTEES ===
      S.listItem()
        .title('People & Committees')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('People & Committees')
            .items([
              S.listItem()
                .title('People')
                .icon(UsersIcon)
                .child(S.documentTypeList('person').title('People')),
              S.listItem()
                .title('Committees')
                .icon(UsersIcon)
                .child(S.documentTypeList('committee').title('Committees')),
            ])
        ),

      // === FINANCIAL PRODUCTS ===
      S.listItem()
        .title('Financial Products')
        .icon(CreditCardIcon)
        .child(
          S.list()
            .title('Financial Products')
            .items([
              S.listItem()
                .title('Loan Products')
                .icon(CreditCardIcon)
                .child(S.documentTypeList('loanProduct').title('Loan Products')),
              S.listItem()
                .title('Savings Products')
                .icon(CreditCardIcon)
                .child(S.documentTypeList('savingsProduct').title('Savings Products')),
            ])
        ),

      // === SERVICES ===
      S.listItem()
        .title('Services')
        .icon(TagIcon)
        .child(
          S.list()
            .title('Services')
            .items([
              S.listItem()
                .title('Service Categories')
                .icon(TagIcon)
                .child(S.documentTypeList('serviceCategory').title('Service Categories')),
              singletonListItem(S, 'memberWelfareService', 'Member Welfare Service', HeartIcon),
              singletonListItem(S, 'remittanceService', 'Remittance Service', TransferIcon),
            ])
        ),

      // === REPORTS ===
      // Organized by report type so each category has its own filtered list.
      // "Report Categories" document type is kept in the schema for data
      // compatibility but is no longer surfaced in the sidebar.
      S.listItem()
        .title('Reports')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Reports')
            .items([
              S.listItem()
                .title('All Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('All Reports')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.divider(),
              S.listItem()
                .title('Annual Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Annual Reports')
                    .filter('_type == "report" && reportType == "annual"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Quarterly Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Quarterly Reports')
                    .filter('_type == "report" && reportType == "quarterly"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('AGM Minutes')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('AGM Minutes')
                    .filter('_type == "report" && reportType == "agm"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Base Rate Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Base Rate Reports')
                    .filter('_type == "report" && reportType == "base-rate"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Staff Training Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Staff Training Reports')
                    .filter('_type == "report" && reportType == "staff-training"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Governance Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Governance Reports')
                    .filter('_type == "report" && reportType == "governance"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Interest Rate Reports')
                .icon(TrendUpwardIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Interest Rate Reports')
                    .filter('_type == "report" && reportType == "interest-rate"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Financial Indicator Reports')
                .icon(TrendUpwardIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Financial Indicator Reports')
                    .filter('_type == "report" && reportType == "financial-indicator"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('CSR Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('CSR Reports')
                    .filter('_type == "report" && reportType == "csr"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Other Reports')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('report')
                    .title('Other Reports')
                    .filter('_type == "report" && reportType == "other"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.divider(),
              S.listItem()
                .title('Base Rate Entries (Table)')
                .icon(TrendUpwardIcon)
                .child(
                  S.documentTypeList('baseRateEntry')
                    .title('Base Rate Entries')
                    .defaultOrdering([{field: 'nepaliYear', direction: 'desc'}])
                ),
            ])
        ),

      // === NOTICES ===
      S.listItem()
        .title('Notices')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Notices')
            .items([
              S.listItem()
                .title('All Notices')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('notice')
                    .title('All Notices')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
              S.listItem()
                .title('Career Notices')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('notice')
                    .title('Career Notices')
                    .filter('_type == "notice" && noticeType == "career"')
                    .defaultOrdering([{field: 'publishDate', direction: 'desc'}])
                ),
            ])
        ),

      // === BRANCHES ===
      S.listItem()
        .title('Branches')
        .icon(PinIcon)
        .child(
          S.documentTypeList('branch')
            .title('Branches')
            .defaultOrdering([{field: 'sn', direction: 'asc'}])
        ),

      // === TESTIMONIALS ===
      S.listItem()
        .title('Testimonials')
        .icon(StarIcon)
        .child(S.documentTypeList('testimonial').title('Testimonials')),
    ])

// Filter out singletons from the default "New document" menu
export const singletonActions = (prev: string[], context: {schemaType: string}) => {
  if (singletonTypes.has(context.schemaType)) {
    return prev.filter((action) => action !== 'delete')
  }
  return prev
}

export const newDocumentOptions = (prev: {templateId: string}[]) => {
  return prev.filter((template) => !singletonTypes.has(template.templateId))
}
