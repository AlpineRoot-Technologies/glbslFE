import React, { useState, useEffect } from "react";
import BreadCrumb from "../../../BreadCrumb/BreadCrumb";
import { BsDownload, BsEye, BsShare } from "react-icons/bs";
import { HiArrowLongLeft } from "react-icons/hi2";
import { Link } from "react-router-dom";
import PDFViewer from "../../../Components/Reports/PDFViewer";
import { useLanguage } from '../../../contexts/LanguageContext';
import { noticesService, googleDriveHelpers, getStrapiMediaUrl } from "../../../services/strapi";
import Swal from "sweetalert2";

// TypeScript interface for Notice from Sanity CMS with Hybrid Upload Support
interface StrapiNotice {
  _id: string;
  title: string;
  slug: string;
  content?: any[]; // Portable Text blocks
  noticeType?: string;
  publishDate?: string;
  expiryDate?: string;
  isUrgent?: boolean;
  priority?: number;
  isActive?: boolean;
  noticeImage?: any; // Sanity image object
  // HYBRID UPLOAD FIELDS
  fileSource?: "Upload" | "Google_Drive";
  uploadedFile?: {
    asset?: {
      url?: string;
    };
  };
  // GOOGLE DRIVE FIELDS
  attachmentFileId?: string;
  attachmentFileName?: string;
  attachmentFileSize?: string;
  viewCount?: number;
  tags?: string[];
  displayPopup?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

// Helper function to extract text from rich content
const extractTextFromContent = (content?: Array<any>): string => {
  if (!content || !Array.isArray(content)) return '';
  
  return content.map(block => {
    if (block.children && Array.isArray(block.children)) {
      return block.children.map((child: any) => child.text || '').join('');
    }
    return '';
  }).join(' ');
};

// HYBRID FILE HANDLING UTILITIES
// Get file URL based on source (Google Drive or Direct Upload)
const getNoticeFileUrl = (notice: StrapiNotice): string | null => {
  if (notice.fileSource === 'Google_Drive' && notice.attachmentFileId) {
    return `https://drive.google.com/file/d/${notice.attachmentFileId}/view`;
  } else if (notice.fileSource === 'Upload' && notice.uploadedFile?.asset?.url) {
    return notice.uploadedFile.asset.url;
  }
  return null;
};

// Get download URL based on source
const getNoticeDownloadUrl = (notice: StrapiNotice): string | null => {
  if (notice.fileSource === 'Google_Drive' && notice.attachmentFileId) {
    return googleDriveHelpers.getDownloadUrl(notice.attachmentFileId);
  } else if (notice.fileSource === 'Upload' && notice.uploadedFile?.asset?.url) {
    return notice.uploadedFile.asset.url;
  }
  return null;
};

// Get file name for display
const getNoticeFileName = (notice: StrapiNotice): string => {
  if (notice.fileSource === 'Google_Drive' && notice.attachmentFileName) {
    return notice.attachmentFileName;
  } else if (notice.fileSource === 'Upload' && notice.attachmentFileName) {
    return notice.attachmentFileName;
  }
  return 'Attachment';
};

// Check if notice has any file attached (PDF / doc upload or Drive)
const hasNoticeFile = (notice: StrapiNotice): boolean => {
  return (
    (notice.fileSource === 'Google_Drive' && !!notice.attachmentFileId) ||
    (notice.fileSource === 'Upload' && !!notice.uploadedFile?.asset?.url)
  );
};

const hasNoticeImage = (notice: StrapiNotice): boolean => !!notice.noticeImage;

const hasDownloadableAttachment = (notice: StrapiNotice): boolean => {
  if (hasNoticeFile(notice)) return true;
  if (hasNoticeImage(notice)) return !!getStrapiMediaUrl(notice.noticeImage);
  return false;
};

// Get file size for display
const getNoticeFileSize = (notice: StrapiNotice): string => {
  if (notice.fileSource === 'Google_Drive' && notice.attachmentFileSize) {
    return notice.attachmentFileSize;
  }
  return '';
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<StrapiNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<StrapiNotice | null>(null);
  const [imageViewer, setImageViewer] = useState<{ url: string; title: string } | null>(null);

  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await noticesService.getNotices();
        setNotices(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setError('Failed to load notices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [language]); // Depend on language from context

  const handleDownload = (notice: StrapiNotice) => {
    const downloadUrl = getNoticeDownloadUrl(notice);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      return;
    }
    if (hasNoticeImage(notice)) {
      const url = getStrapiMediaUrl(notice.noticeImage);
      if (url) {
        window.open(url, '_blank');
        return;
      }
    }
    alert(t('notices.no_file'));
  };

  const handleView = (notice: StrapiNotice) => {
    if (hasNoticeFile(notice)) {
      setSelectedNotice(notice);
      setViewerOpen(true);
      return;
    }
    if (hasNoticeImage(notice)) {
      const url = getStrapiMediaUrl(notice.noticeImage);
      if (url) {
        setImageViewer({ url, title: notice.title });
        return;
      }
    }
    Swal.fire({
      icon: 'info',
      title: notice.title,
      html: `<p class="text-sm leading-6 text-left">${extractTextFromContent(notice.content) || 'No additional details available.'}</p>`,
      confirmButtonColor: '#DAA520',
      confirmButtonText: 'Close',
    });
  };

  const handleShare = async (notice: StrapiNotice) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${notice.title} - GLBSL`,
          text: `Check out our notice: ${notice.title}`,
          url: `${window.location.origin}/reports/notices/${notice._id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert(`${notice.title} link copied to clipboard!`);
      }
    } else {
      alert(`${notice.title} link copied to clipboard!`);
    }
  };

  return (
    <section className="">
      {/* Image-only viewer */}
      {imageViewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75" role="dialog" aria-modal="true">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-white dark:bg-normalBlack rounded-lg shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8] dark:border-[#333]">
              <h3 className="font-Garamond font-semibold text-lightBlack dark:text-white truncate pr-4">{imageViewer.title}</h3>
              <button
                type="button"
                onClick={() => setImageViewer(null)}
                className="shrink-0 px-3 py-1 text-sm bg-khaki text-white rounded hover:opacity-90"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto p-4 flex justify-center">
              <img src={imageViewer.url} alt={imageViewer.title} className="max-w-full max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {selectedNotice && (
        <PDFViewer
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedNotice(null);
          }}
          fileUrl={selectedNotice.fileSource === 'Google_Drive' 
            ? selectedNotice.attachmentFileId || '' 
            : getNoticeFileUrl(selectedNotice) || ''}
          fileName={getNoticeFileName(selectedNotice)}
          fileSource={selectedNotice.fileSource}
        />
      )}

      <BreadCrumb title={t('nav.notices')} home={"/"} />

      <div className="bg-whiteSmoke dark:bg-lightBlack py-20 2xl:py-[120px]">
        <div className="Container">
          {/* Section heading */}
          <div
            className="flex justify-center"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl 2xl:text-[38px] leading-7 sm:leading-8 md:leading-9 lg:leading-[42px] 2xl:leading-[52px] text-lightBlack dark:text-white font-Garamond font-semibold capitalize">
                {t('notices.page_title')}
              </h1>
              <div className="flex items-center justify-center text-center mx-auto mt-2 lg:mt-[6px]">
                <div className="w-[100px] h-[1px] bg-[#ccc] dark:bg-[#3b3b3b] mr-5 "></div>
                <img
                  src="/images/home-1/gurans.png"
                  className="h-6 w-auto object-contain"
                  alt="Gurans Laghubitta logo"
                />
                <div className="w-[100px] h-[1px] bg-[#ccc] dark:bg-[#3b3b3b] ml-5"></div>
              </div>
              <p className="text-center text-base lg:text-lg leading-[26px] text-gray dark:text-lightGray font-Lora font-normal mt-[10px]">
                {t('notices.page_subtitle')}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-khaki"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notices...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Notices list (table on md+, stacked rows on small screens) */}
          {!loading && !error && (
            <>
              {notices.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 dark:text-gray-400">{t('notices.no_notices')}</p>
                </div>
              ) : (
                <div className="mt-10 overflow-x-auto rounded-sm border border-[#e8e8e8] dark:border-[#424242] bg-white dark:bg-lightBlack shadow-sm">
                  <table className="w-full min-w-[640px] text-left border-collapse font-Lora">
                    <thead>
                      <tr className="bg-khaki/15 dark:bg-khaki/20 border-b border-[#e8e8e8] dark:border-[#333]">
                        <th className="px-4 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white w-14">
                          {t('notices.col_sn')}
                        </th>
                        <th className="px-4 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white">
                          {t('notices.col_notice')}
                        </th>
                        <th className="px-4 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white whitespace-nowrap w-40">
                          {t('notices.col_date')}
                        </th>
                        <th className="px-4 py-3 text-xs font-Garamond font-semibold uppercase tracking-wide text-lightBlack dark:text-white text-right w-52">
                          {t('notices.col_actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map((notice, index) => {
                        const summary = extractTextFromContent(notice.content);
                        const truncated =
                          summary.length > 160 ? `${summary.slice(0, 160).trim()}…` : summary || '—';
                        return (
                          <tr
                            key={notice._id}
                            className="border-b border-[#e8e8e8] dark:border-[#333] last:border-b-0 hover:bg-[#faf8f5] dark:hover:bg-[#1a1a1a] transition-colors"
                          >
                            <td className="px-4 py-4 align-top text-sm text-gray dark:text-lightGray tabular-nums">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                {notice.isUrgent && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white">
                                    {t('notices.urgent')}
                                  </span>
                                )}
                              </div>
                              <p className="font-Garamond font-semibold text-lightBlack dark:text-white text-base leading-snug">
                                {notice.title}
                              </p>
                              <p className="text-sm text-gray dark:text-lightGray mt-1 leading-relaxed line-clamp-2 md:line-clamp-3">
                                {truncated}
                              </p>
                              {hasNoticeFile(notice) && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  {getNoticeFileName(notice)}
                                  {getNoticeFileSize(notice) ? ` · ${getNoticeFileSize(notice)}` : ''}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-gray dark:text-lightGray whitespace-nowrap">
                              {notice.publishDate ? formatDate(notice.publishDate) : '—'}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleView(notice)}
                                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-khaki text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                                >
                                  <BsEye className="w-3.5 h-3.5 shrink-0" />
                                  {t('notices.view')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(notice)}
                                  disabled={!hasDownloadableAttachment(notice)}
                                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <BsDownload className="w-3.5 h-3.5 shrink-0" />
                                  {t('notices.download')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShare(notice)}
                                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-lightGray px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                                >
                                  <BsShare className="w-3.5 h-3.5 shrink-0" />
                                  {t('notices.share')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Back to Reports Navigation */}
          <div className="flex justify-center mt-16">
            <Link
              to="/reports"
              className="flex items-center text-khaki hover:text-opacity-80 transition-colors duration-300"
            >
              <HiArrowLongLeft className="w-5 h-5 mr-2" />
              {t('reports.back_to_all')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticePage;
