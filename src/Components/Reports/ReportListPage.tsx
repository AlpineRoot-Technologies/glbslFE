import React, { useState, useEffect, useCallback } from "react";
import BreadCrumb from "../../BreadCrumb/BreadCrumb";
import { BsDownload, BsEye, BsShare } from "react-icons/bs";
import { HiArrowLongLeft, HiArrowLongRight } from "react-icons/hi2";
import { Link } from "react-router-dom";
import PDFViewer from "./PDFViewer";
import { reportsService, googleDriveHelpers } from "../../services/strapi";
import { useLanguage } from "../../contexts/LanguageContext";

export interface StrapiReport {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  reportType?: string;
  publishDate?: string;
  fiscalYear?: string;
  quarter?: string;
  fileSource?: "Upload" | "Google_Drive";
  uploadedFile?: { asset?: { url?: string } };
  fileId?: string;
  fileName?: string;
  featured?: boolean;
  isActive?: boolean;
  order?: number;
  tags?: string[];
}

interface ReportListPageProps {
  reportType: string;
  breadcrumbTitle: string;
  pageTitle: string;
  pageSubtitle: string;
  hideBreadcrumb?: boolean;
  hideHeader?: boolean;
}

const PAGE_SIZE = 9;

// ── File helpers ──────────────────────────────────────────────────
const getFileUrl = (r: StrapiReport): string | null => {
  if (r.fileSource === "Google_Drive" && r.fileId)
    return `https://drive.google.com/file/d/${r.fileId}/view`;
  if (r.fileSource === "Upload" && r.uploadedFile?.asset?.url)
    return r.uploadedFile.asset.url;
  return null;
};

const getDownloadUrl = (r: StrapiReport): string | null => {
  if (r.fileSource === "Google_Drive" && r.fileId)
    return googleDriveHelpers.getDownloadUrl(r.fileId);
  if (r.fileSource === "Upload" && r.uploadedFile?.asset?.url)
    return r.uploadedFile.asset.url;
  return null;
};

const getFileName = (r: StrapiReport): string =>
  r.fileName || `${r.title}.pdf`;

const formatReportDate = (report: StrapiReport): string => {
  if (report.publishDate) {
    return new Date(report.publishDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  if (report.fiscalYear) {
    return report.quarter ? `${report.fiscalYear} · ${report.quarter}` : report.fiscalYear;
  }
  return "—";
};

// ── Component ─────────────────────────────────────────────────────
const ReportListPage: React.FC<ReportListPageProps> = ({
  reportType,
  breadcrumbTitle,
  pageTitle,
  pageSubtitle,
  hideBreadcrumb = false,
  hideHeader = false,
}) => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<StrapiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<StrapiReport | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getReportsByType(reportType);
      setReports(response.data || []);
      setCurrentPage(1);
    } catch {
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalPages = Math.ceil(reports.length / PAGE_SIZE);
  const paginatedReports = reports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleView = (report: StrapiReport) => {
    setSelectedReport(report);
    setViewerOpen(true);
  };

  const handleDownload = (report: StrapiReport) => {
    const url = getDownloadUrl(report);
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("No file available for download.");
    }
  };

  const handleShare = async (report: StrapiReport) => {
    const shareUrl = `${window.location.origin}/reports/${reportType}/${report.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${report.title} - GLBSL`, url: shareUrl });
      } catch {
        // user cancelled — silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch {
        alert(shareUrl);
      }
    }
  };

  return (
    <section>
      {!hideBreadcrumb && <BreadCrumb title={breadcrumbTitle} home="/" />}

      <div className="bg-whiteSmoke dark:bg-lightBlack py-20 2xl:py-[120px]">
        <div className="Container">
          {/* Section heading */}
          {!hideHeader && (
          <div className="flex justify-center mb-12" data-aos="fade-up" data-aos-duration="1000">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl 2xl:text-[38px] leading-tight text-lightBlack dark:text-white font-Garamond font-semibold capitalize">
                {pageTitle}
              </h1>
              <div className="flex items-center justify-center text-center mx-auto mt-2">
                <div className="w-[100px] h-[1px] bg-[#ccc] dark:bg-[#3b3b3b] mr-5" />
                <img
                  src="/images/home-1/gurans.png"
                  className="h-6 w-auto object-contain"
                  alt="Gurans Laghubitta logo"
                />
                <div className="w-[100px] h-[1px] bg-[#ccc] dark:bg-[#3b3b3b] ml-5" />
              </div>
              <p className="text-center text-sm lg:text-base leading-[26px] text-gray dark:text-lightGray font-Lora font-normal mt-[10px]">
                {pageSubtitle}
              </p>
              {reports.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {reports.length} report{reports.length !== 1 ? "s" : ""} total
                </p>
              )}
            </div>
          </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khaki mx-auto" />
                <p className="mt-4 text-gray dark:text-lightGray">Loading reports…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchReports}
                  className="px-6 py-2 bg-khaki text-white rounded hover:bg-opacity-90 transition-all duration-300"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && reports.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray dark:text-lightGray">
                No reports available at the moment.
              </p>
            </div>
          )}

          {/* Reports list (compact table) */}
          {!loading && !error && reports.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-sm border border-[#e8e8e8] dark:border-[#424242] bg-white dark:bg-lightBlack shadow-sm">
                <table className="w-full min-w-[560px] text-left border-collapse font-Lora">
                  <thead>
                    <tr className="bg-khaki/15 dark:bg-khaki/20 border-b border-[#e8e8e8] dark:border-[#333]">
                      <th className="px-3 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white w-14">
                        {t("reports.col_sn")}
                      </th>
                      <th className="px-3 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white">
                        {t("reports.col_report")}
                      </th>
                      <th className="px-3 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white whitespace-nowrap w-40">
                        {t("reports.col_date")}
                      </th>
                      <th className="px-3 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white text-right w-32">
                        {t("reports.col_actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map((report, index) => {
                      const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                      const desc = (report.description || "").trim();
                      const truncated =
                        desc.length > 140 ? `${desc.slice(0, 140).trim()}…` : desc;
                      return (
                        <tr
                          key={report._id}
                          className="border-b border-[#e8e8e8] dark:border-[#333] last:border-b-0 hover:bg-[#faf8f5] dark:hover:bg-[#1a1a1a] transition-colors"
                        >
                          <td className="px-3 py-2.5 align-middle text-sm text-gray dark:text-lightGray tabular-nums">
                            {globalIndex + 1}
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <button
                              type="button"
                              onClick={() => handleView(report)}
                              className="font-Garamond font-semibold text-left text-lightBlack dark:text-white text-base leading-snug hover:text-khaki focus:outline-none focus-visible:ring-2 focus-visible:ring-khaki/60 rounded-sm"
                            >
                              {report.title}
                            </button>
                            {truncated && (
                              <p className="text-sm text-gray dark:text-lightGray mt-0.5 leading-snug line-clamp-2">
                                {truncated}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-sm text-gray dark:text-lightGray whitespace-nowrap">
                            {formatReportDate(report)}
                          </td>
                          <td className="px-3 py-2.5 align-middle whitespace-nowrap w-[1%]">
                            <div className="flex flex-nowrap items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleView(report)}
                                className="inline-flex items-center justify-center p-2 rounded bg-khaki text-white hover:opacity-90 transition-opacity"
                                aria-label={t("reports.view")}
                                title={t("reports.view")}
                              >
                                <BsEye className="w-4 h-4 shrink-0" aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(report)}
                                disabled={!getDownloadUrl(report)}
                                className="inline-flex items-center justify-center p-2 rounded bg-green-600 text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label={t("reports.download")}
                                title={t("reports.download")}
                              >
                                <BsDownload className="w-4 h-4 shrink-0" aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShare(report)}
                                className="inline-flex items-center justify-center p-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-lightGray hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                                aria-label={t("reports.share")}
                                title={t("reports.share")}
                              >
                                <BsShare className="w-4 h-4 shrink-0" aria-hidden />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-lightGray dark:border-gray rounded-sm disabled:opacity-40 hover:bg-khaki hover:text-white hover:border-khaki transition-all duration-300"
                  >
                    <HiArrowLongLeft className="w-4 h-4" /> Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 text-sm rounded-sm border transition-all duration-300 ${
                        currentPage === page
                          ? "bg-khaki text-white border-khaki"
                          : "border-lightGray dark:border-gray hover:bg-khaki hover:text-white hover:border-khaki"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-lightGray dark:border-gray rounded-sm disabled:opacity-40 hover:bg-khaki hover:text-white hover:border-khaki transition-all duration-300"
                  >
                    Next <HiArrowLongRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Back link */}
          <div className="flex justify-center mt-16">
            <Link
              to="/reports"
              className="flex items-center text-khaki hover:text-opacity-80 transition-colors duration-300"
            >
              <HiArrowLongLeft className="w-5 h-5 mr-2" />
              Back to All Reports
            </Link>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedReport && (
        <PDFViewer
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedReport(null);
          }}
          fileUrl={
            selectedReport.fileSource === "Google_Drive"
              ? selectedReport.fileId || ""
              : getFileUrl(selectedReport) || ""
          }
          fileName={getFileName(selectedReport)}
          fileSource={selectedReport.fileSource}
        />
      )}
    </section>
  );
};

export default ReportListPage;
