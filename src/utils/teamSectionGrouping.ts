export interface TeamMemberRecord {
  id: string;
  name: string;
  position: string;
  order?: number;
  teamSection?: string;
  [key: string]: any;
}

export interface TeamSectionGroup {
  key: string;
  label: string;
  members: TeamMemberRecord[];
}

const MANAGEMENT_SECTION_ORDER: { key: string; label: string }[] = [
  { key: 'managementExecutive', label: 'Executive Leadership' },
  { key: 'managementDepartmentHeads', label: 'Department Heads' },
  { key: 'managementOfficers', label: 'Officers' },
  { key: 'managementMonitoringOfficers', label: 'Monitoring Officers' },
];

const CORPORATE_SECTION_ORDER: { key: string; label: string }[] = [
  { key: 'corporateLeadership', label: 'Corporate Leadership' },
  { key: 'corporateOfficers', label: 'Officers' },
  { key: 'corporateMonitoringOfficers', label: 'Monitoring Officers' },
];

function deriveManagementSection(positionRaw: string): string {
  const p = (positionRaw || '').toLowerCase();
  if (p.includes('monitoring') || p.includes('supervision') || p.includes('अनुगमन')) {
    return 'managementMonitoringOfficers';
  }
  if (
    p.includes('chief executive') ||
    p.includes('cheif executive') ||
    p.includes('ceo') ||
    p.includes('deputy ceo') ||
    p.includes('dceo') ||
    p.includes('प्रमुख कार्यकारी') ||
    p.includes('उपप्रमुख कार्यकारी')
  ) {
    return 'managementExecutive';
  }
  if (p.includes('head') || p.includes('प्रमुख')) {
    return 'managementDepartmentHeads';
  }
  if (p.includes('officer') || p.includes('अधिकृत') || p.includes('अधिकारी')) {
    return 'managementMonitoringOfficers';
  }
  return 'managementOfficers';
}

function deriveCorporateSection(positionRaw: string): string {
  const p = (positionRaw || '').toLowerCase();
  if (p.includes('monitoring') || p.includes('supervision') || p.includes('अनुगमन')) {
    return 'corporateMonitoringOfficers';
  }
  if (
    p.includes('chief') ||
    p.includes('head') ||
    p.includes('director') ||
    p.includes('प्रमुख') ||
    p.includes('निर्देशक')
  ) {
    return 'corporateLeadership';
  }
  return 'corporateOfficers';
}

export function groupByTeamSection(
  members: TeamMemberRecord[],
  page: 'management' | 'corporate',
): TeamSectionGroup[] {
  const sectionOrder = page === 'management' ? MANAGEMENT_SECTION_ORDER : CORPORATE_SECTION_ORDER;
  const map = new Map<string, TeamSectionGroup>();

  for (const section of sectionOrder) {
    map.set(section.key, { key: section.key, label: section.label, members: [] });
  }

  for (const m of members) {
    const explicit = m.teamSection || '';
    const fallback = page === 'management' ? deriveManagementSection(m.position) : deriveCorporateSection(m.position);
    const sectionKey = explicit || fallback;

    const target = map.get(sectionKey);
    if (target) {
      target.members.push(m);
    } else {
      // Unknown custom key from CMS; keep visible instead of dropping.
      const key = sectionKey || 'other';
      if (!map.has(key)) {
        map.set(key, { key, label: key, members: [] });
      }
      map.get(key)!.members.push(m);
    }
  }

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      members: [...group.members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .filter((group) => group.members.length > 0);
}
