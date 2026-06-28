const SITE_URL = 'https://ptrvalina.github.io/aml-kyc-academy/';

export function shareLinkedIn(params: { title: string; summary: string; url?: string }): void {
  const url = params.url ?? SITE_URL;
  const shareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
  shareUrl.searchParams.set('url', url);
  window.open(shareUrl.toString(), '_blank', 'noopener,noreferrer,width=600,height=600');
}

export function shareFacebook(params: { url?: string; quote?: string }): void {
  const url = params.url ?? SITE_URL;
  const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
  shareUrl.searchParams.set('u', url);
  if (params.quote) shareUrl.searchParams.set('quote', params.quote);
  window.open(shareUrl.toString(), '_blank', 'noopener,noreferrer,width=600,height=600');
}

export function buildAchievementShareText(input: {
  fullName: string;
  modulesPassed: number;
  totalModules: number;
  certified: boolean;
  lang: 'ru' | 'en';
}): string {
  const name = input.fullName || (input.lang === 'ru' ? 'Студент AML/KYC Academy' : 'AML/KYC Academy student');
  if (input.certified) {
    return input.lang === 'ru'
      ? `${name} завершил(а) курс «AML/KYC Analyst: от теории к практике» — 8 модулей, тесты, практика и финальная аттестация. #AML #KYC #Compliance`
      : `${name} completed the AML/KYC Analyst course — 8 modules, tests, practice cases and final certification. #AML #KYC #Compliance`;
  }
  return input.lang === 'ru'
    ? `${name} проходит курс AML/KYC Analyst: ${input.modulesPassed}/${input.totalModules} модулей. Учусь KYC, sanctions, EDD и SAR.`
    : `${name} is studying AML/KYC Analyst: ${input.modulesPassed}/${input.totalModules} modules completed. Learning KYC, sanctions, EDD and SAR.`;
}

export { SITE_URL };
