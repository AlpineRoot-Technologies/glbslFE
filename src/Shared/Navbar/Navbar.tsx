import React, { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useScrollPosition from "./useScrollPosition";
import { FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import SearchBar from "../SearchBar/SearchBar";

// ─── menu data ───────────────────────────────────────────────────────────────
interface MenuLeaf {
  label: string;
  to: string;
}
interface MenuItem {
  key: string;
  labelKey: string;
  to?: string; // if no children, navigate directly
  children?: MenuLeaf[];
}

const useMenuConfig = (t: (k: string) => string): MenuItem[] => [
  {
    key: 'about',
    labelKey: 'nav.about',
    children: [
      { label: t('submenu.about_us'), to: '/about' },
      { label: t('submenu.board_directors'), to: '/board-of-directors' },
      { label: t('submenu.management_team'), to: '/management-team' },
      { label: t('submenu.committee'), to: '/committee' },
      { label: t('submenu.organization_structure'), to: '/organization-structure' },
    ],
  },
  {
    key: 'services',
    labelKey: 'nav.services',
    children: [
      { label: t('submenu.all_services'), to: '/services' },
      { label: t('submenu.loan_services'), to: '/services/loan' },
      { label: t('submenu.savings_services'), to: '/services/savings' },
      { label: t('submenu.remittance_services'), to: '/services/remittance' },
      { label: t('submenu.member_welfare'), to: '/services/member-welfare' },
    ],
  },
  {
    key: 'reports',
    labelKey: 'nav.reports',
    children: [
      { label: t('submenu.all_reports'), to: '/reports' },
      { label: t('submenu.quarterly_report'), to: '/reports/quarterly-report' },
      { label: t('submenu.annual_report'), to: '/reports/annual-report' },
      { label: t('submenu.agm_minutes'), to: '/reports/agm-minutes' },
      { label: t('submenu.base_rate'), to: '/reports/base-rate' },
      { label: t('submenu.staff_training'), to: '/reports/staff-training' },
      { label: t('submenu.governance_report'), to: '/reports/governance-report' },
      { label: t('submenu.interest_rate'), to: '/reports/interest-rate' },
      { label: t('submenu.financial_indicator'), to: '/reports/financial-indicator' },
    ],
  },
  { key: 'branches', labelKey: 'nav.branches', to: '/branches' },
  { key: 'notices', labelKey: 'nav.notices', to: '/reports/notices' },
  {
    key: 'career',
    labelKey: 'nav.career',
    children: [
      { label: t('submenu.career_notices'), to: '/career/notices' },
      { label: t('submenu.apply_for_job'), to: '/career/apply' },
      { label: t('submenu.application_form'), to: '/career/application-form' },
    ],
  },
  {
    key: 'online',
    labelKey: 'nav.online',
    children: [
      { label: t('submenu.emi_calculator'), to: '/online/emi-calculator' },
      { label: t('submenu.interest_calculator'), to: '/online/interest-calculator' },
      { label: t('submenu.apply_for_loan'), to: '/online/apply-for-loan' },
    ],
  },
  {
    key: 'gunaso',
    labelKey: 'nav.gunaso',
    children: [
      { label: t('submenu.register_complaint'), to: '/gunaso/register-complaint' },
      { label: t('submenu.register_complaint_nrb'), to: '/gunaso/register-complaint-nrb' },
    ],
  },
  { key: 'contact', labelKey: 'nav.contact', to: '/contact' },
];

// ─── component ───────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const scrollPosition = useScrollPosition();
  const location = useLocation();
  const navbarBgColor = "lg:bg-khaki";

  const menu = useMenuConfig(t);

  // Close drawer whenever route changes
  useEffect(() => {
    setIsOpen(false);
    setOpenAccordion(null);
  }, [location.pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ne' : 'en');

  const closeDrawer = () => {
    setIsOpen(false);
    setOpenAccordion(null);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => (prev === key ? null : key));
  };

  return (
    <>
      <nav className={`w-full 2xl:fixed font-Lora z-10 2xl:px-5 2xl:py-4 transition-all duration-300 ${navbarBgColor}`}>
        <div className="2xl:px-10">
          <div className="flex flex-col 2xl:flex-row items-center justify-between 2xl:min-h-[80px]">

            {/* Desktop logo */}
            <div className="2xl:p-2 2xl:pr-3 3xl:pr-6 flex-shrink-0">
              <Link to="/">
                <img
                  src="/images/home-1/logo-1.png"
                  className="hidden 2xl:block h-16 w-auto max-w-[320px] object-contain"
                  alt="Gurans Laghubitta logo"
                />
              </Link>
            </div>

            {/* Mobile top bar */}
            <div className="px-3 w-full 2xl:hidden flex justify-between text-lightBlack bg-khaki h-[70px] items-center">
              <Link to="/">
                <img
                  src="/images/home-1/logo-1.png"
                  className="h-12 w-auto max-w-[200px] object-contain"
                  alt="Gurans Laghubitta logo"
                />
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleLanguage}
                  className="language-toggle text-white font-Lora text-sm font-semibold"
                  title={language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
                >
                  {language === 'en' ? 'NE' : 'EN'}
                </button>
                <button
                  onClick={() => setIsOpen(true)}
                  className="focus:outline-none p-1"
                  aria-label="Open menu"
                >
                  <FaBars className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* ── Desktop nav links ── */}
            <ul className="hidden 2xl:flex text-sm text-lightBlack uppercase font-normal font-Nepali min-h-[4rem] items-center flex-1 justify-center">
              {menu.map((item) => (
                <li key={item.key} className="relative group">
                  {item.children ? (
                    <>
                      <NavLink
                        to="#"
                        className="flex items-center text-lightBlack dark:text-white px-2 3xl:px-3 py-2 transition-all duration-300 nav-item whitespace-nowrap"
                      >
                        <span className="nav-item">{t(item.labelKey)}</span>
                        <BiChevronDown className="ml-1 flex-shrink-0" />
                      </NavLink>
                      <div className="absolute pt-8 z-20 hidden group-hover:block">
                        <ul className="shadow-2xl rounded-sm bg-white text-black w-[250px] text-left dark:bg-normalBlack dark:text-white text-sm py-4">
                          {item.children.map((child) => (
                            <div key={child.to} className="px-5 group/sub hover:bg-khaki hover:text-white">
                              <li className="hover:ml-3 duration-300">
                                <NavLink to={child.to} className="py-2 block">
                                  {child.label}
                                </NavLink>
                              </li>
                            </div>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <NavLink
                      to={item.to!}
                      className="flex items-center text-lightBlack dark:text-white px-2 3xl:px-3 py-2 transition-all duration-300 nav-item whitespace-nowrap"
                    >
                      <span className="nav-item">{t(item.labelKey)}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop right controls */}
            <div className="hidden 2xl:flex items-center pl-3 3xl:pl-6 gap-3 3xl:gap-4 flex-shrink-0">
              <SearchBar />
              <button onClick={toggleLanguage} className="cursor-pointer">
                <span
                  className="language-toggle"
                  title={language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
                >
                  {language === 'en' ? 'NE' : 'EN'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile sliding drawer ── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 2xl:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[80vw] max-w-[340px] bg-white dark:bg-normalBlack z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out 2xl:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 bg-khaki flex-shrink-0">
          <Link to="/" onClick={closeDrawer}>
            <img
              src="/images/home-1/logo-1.png"
              className="h-10 w-auto max-w-[160px] object-contain"
              alt="Gurans Laghubitta logo"
            />
          </Link>
          <button onClick={closeDrawer} aria-label="Close menu" className="p-1">
            <IoMdClose className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Search inside drawer */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <SearchBar isMobile={true} />
        </div>

        {/* Drawer menu items (scrollable) */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menu.map((item) => (
            <div key={item.key} className="border-b border-gray-100 dark:border-gray-700">
              {item.children ? (
                <>
                  {/* Accordion toggle */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold uppercase text-lightBlack dark:text-white font-Nepali tracking-wide hover:bg-gray-50 dark:hover:bg-lightBlack transition-colors"
                    onClick={() => toggleAccordion(item.key)}
                    aria-expanded={openAccordion === item.key}
                  >
                    <span>{t(item.labelKey)}</span>
                    <BiChevronRight
                      className={`w-5 h-5 text-khaki transition-transform duration-200 ${
                        openAccordion === item.key ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Accordion content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openAccordion === item.key ? 'max-h-[500px]' : 'max-h-0'
                    }`}
                  >
                    <ul className="bg-gray-50 dark:bg-lightBlack">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            onClick={closeDrawer}
                            className={({ isActive }) =>
                              `block px-8 py-3 text-sm font-Lora transition-colors ${
                                isActive
                                  ? 'text-khaki font-semibold bg-khaki/10'
                                  : 'text-gray-600 dark:text-lightGray hover:text-khaki hover:bg-khaki/5'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.to!}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center px-5 py-4 text-sm font-semibold uppercase font-Nepali tracking-wide transition-colors ${
                      isActive
                        ? 'text-khaki bg-khaki/10'
                        : 'text-lightBlack dark:text-white hover:text-khaki hover:bg-gray-50 dark:hover:bg-lightBlack'
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 flex items-center justify-between bg-gray-50 dark:bg-lightBlack">
          <span className="text-xs font-Lora text-gray-500 dark:text-lightGray">
            {language === 'en' ? 'Language' : 'भाषा'}
          </span>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-khaki text-white text-sm font-semibold font-Lora rounded hover:bg-opacity-90 transition-all"
          >
            {language === 'en' ? 'नेपाली' : 'English'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
