import React, { useEffect, useState } from "react";
import BreadCrumb from "../../BreadCrumb/BreadCrumb";
import PersonTile from "./components/PersonTile";
import { aboutService, getStrapiMediaUrl } from "../../services/strapi";
import { mapStrapiPersonData } from "../../utils/strapiHelpers";
import { groupByTeamSection } from "../../utils/teamSectionGrouping";
import { useLanguage } from "../../contexts/LanguageContext";

const CorporateTeam: React.FC = () => {
  const [corporateMembers, setCorporateMembers] = useState<any[]>([]);
  const [monitoringMembers, setMonitoringMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const corporateData = await aboutService.getCorporateTeam();
        setCorporateMembers(
          corporateData.map((d: any) => {
            const mapped = mapStrapiPersonData(d);
            return { ...mapped, image: getStrapiMediaUrl(mapped.image) };
          })
        );

        const monitoringData = await aboutService.getMonitoringSupervision();
        setMonitoringMembers(
          monitoringData.map((d: any) => {
            const mapped = mapStrapiPersonData(d);
            return { ...mapped, image: getStrapiMediaUrl(mapped.image) };
          })
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load corporate team");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language]);

  const combinedMembers = [...corporateMembers, ...monitoringMembers];
  const groups = groupByTeamSection(combinedMembers, 'corporate');

  const renderGroups = (groupsToRender: ReturnType<typeof groupByTeamSection>) =>
    groupsToRender.map((group) => (
      <div key={group.label}>
        {groupsToRender.length > 1 && (
          <div className="flex items-center gap-4 mb-8">
            <hr className="flex-1 border-[#e8e8e8] dark:border-[#333]" />
            <h3 className="text-base font-Garamond font-semibold text-khaki uppercase tracking-widest whitespace-nowrap">
              {group.label}
            </h3>
            <hr className="flex-1 border-[#e8e8e8] dark:border-[#333]" />
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-5 lg:gap-[30px]">
          {group.members.map((m) => (
            <div key={m.id} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-20px)]">
              <PersonTile id={m.id} name={m.name} position={m.position} email={m.email} phone={m.phone} image={m.image} />
            </div>
          ))}
        </div>
      </div>
    ));

  return (
    <div>
      <BreadCrumb title={t('submenu.corporate_team')} home="/" />
      <div className="dark:bg-normalBlack py-20 2xl:py-[120px]">
        <div className="Container">
          <div className="text-center sm:px-8 md:px-[80px] lg:px-[120px] xl:px-[200px] 2xl:px-[335px] mx-auto px-5 Container">
            <div className="flex items-center justify-center space-x-2">
              <hr className="w-[100px] h-[1px] bg-lightGray dark:bg-gray text-lightGray dark:text-gray" />
              <img src="/images/home-1/gurans.png" alt="Gurans Laghubitta logo" className="h-8 w-auto object-contain" />
              <hr className="w-[100px] h-[1px] bg-lightGray dark:bg-gray text-lightGray dark:text-gray" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl 2xl:text-[38px] leading-[42px] 2xl:leading-[52px] text-lightBlack dark:text-white mt-[10px] mb-[14px] font-Garamond font-semibold uppercase">
              {t('submenu.corporate_team')}
            </h1>
            <p className="font-Lora leading-7 lg:leading-[26px] text-lightGray font-normal text-sm sm:text-base">
              Our corporate team members and monitoring supervision units
            </p>
          </div>

          {loading && <div className="text-center mt-[60px]"><p className="text-lightGray">Loading corporate team...</p></div>}
          {error && <div className="text-center mt-[60px]"><p className="text-red-500">{error}</p></div>}

          {!loading && !error && groups.length > 0 && (
            <div className="mt-[60px] space-y-14">
              {renderGroups(groups)}
            </div>
          )}

          {!loading && !error && corporateMembers.length === 0 && monitoringMembers.length === 0 && (
            <div className="text-center py-12 mt-[60px]">
              <p className="text-lightGray">No corporate team members found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateTeam;
