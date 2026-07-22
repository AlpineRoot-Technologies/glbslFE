import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import ReportListPage from "../../../Components/Reports/ReportListPage";

const CSRReportPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <ReportListPage
      reportType="csr"
      breadcrumbTitle={t('submenu.csr_report')}
      pageTitle={t('reports.csr_title')}
      pageSubtitle={t('reports.csr_subtitle')}
    />
  );
};

export default CSRReportPage;
