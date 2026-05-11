/**
 * Backfill `teamSection` on existing person documents (management/corporate).
 * Safe: only writes when teamSection is currently empty.
 *
 * Usage (PowerShell):
 *   $env:SANITY_TOKEN="YOUR_TOKEN"
 *   node scripts/assign-team-sections.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'v41axjo7',
  dataset: 'production',
  apiVersion: '2026-03-08',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

function isManagementDeputyExecutivePosition(p) {
  if (p.includes('dceo')) return true;
  if (p.includes('deputy chief') || p.includes('deputy executive')) return true;
  if (p.includes('deputy') && p.includes('chief') && p.includes('executive')) return true;
  if (p.includes('deputy') && p.includes('ceo')) return true;
  if (p.includes('उपप्रमुख कार्यकारी')) return true;
  return false;
}

function deriveManagementSection(positionRaw) {
  const p = String(positionRaw || '').toLowerCase();
  if (p.includes('monitoring') || p.includes('supervision') || p.includes('अनुगमन')) return 'managementMonitoringOfficers';
  if (isManagementDeputyExecutivePosition(p)) return 'managementDeputyCEO';
  if (
    p.includes('chief executive') ||
    p.includes('cheif executive') ||
    p.includes('ceo') ||
    p.includes('प्रमुख कार्यकारी')
  ) {
    return 'managementCEO';
  }
  if (p.includes('head') || p.includes('प्रमुख')) return 'managementDepartmentHeads';
  if (p.includes('officer') || p.includes('अधिकृत') || p.includes('अधिकारी')) return 'managementMonitoringOfficers';
  return 'managementOfficers';
}

function deriveCorporateSection(positionRaw, personType) {
  if (personType === 'monitoringSupervision') return 'corporateMonitoringOfficers';
  const p = String(positionRaw || '').toLowerCase();
  if (p.includes('monitoring') || p.includes('supervision') || p.includes('अनुगमन')) return 'corporateMonitoringOfficers';
  if (p.includes('chief') || p.includes('head') || p.includes('director') || p.includes('प्रमुख') || p.includes('निर्देशक')) {
    return 'corporateLeadership';
  }
  return 'corporateOfficers';
}

if (!process.env.SANITY_TOKEN) {
  console.error('SANITY_TOKEN is required.');
  process.exit(1);
}

const people = await client.fetch(
  '*[_type == "person" && (personType == "managementTeam" || personType == "corporateTeam" || personType == "monitoringSupervision")] {_id, personType, position, teamSection}',
);

let updated = 0;
for (const p of people) {
  if (p.teamSection) continue;
  const section =
    p.personType === 'managementTeam'
      ? deriveManagementSection(p.position)
      : deriveCorporateSection(p.position, p.personType);
  await client.patch(p._id).set({ teamSection: section }).commit();
  updated++;
  console.log(`Updated ${p._id} -> ${section}`);
}

console.log(`Done. Updated ${updated} documents.`);
