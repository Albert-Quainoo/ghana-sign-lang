"use client"

import { useLanguage } from "@/contexts/language-context";
import { Shield } from "lucide-react";

const fallbacks = {
    footerPrivacy: "Privacy Policy", // From footer key
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your information",
    lastUpdated: "Last Updated: April 9, 2025",
    introductionTitle: "Introduction",
    introductionContent: "At Lending A Helping Ear, we respect your privacy...", 
    collectionTitle: "Information We Collect",
    collectionDesc: "We may collect the following types of information:",
    collectionItem1Title: "Personal Information",
    collectionItem1Desc: "Name, email address, phone number...",
    collectionItem2Title: "Account Information",
    collectionItem2Desc: "Login credentials, account preferences...",
    collectionItem3Title: "Usage Data",
    collectionItem3Desc: "Information about how you use our website...",
    collectionItem4Title: "Technical Data",
    collectionItem4Desc: "IP address, browser type...",
    usageTitle: "How We Use Your Information",
    usageDesc: "We use your information for the following purposes:",
    usageItem1: "To provide and maintain our services",
    usageItem2: "To personalize your learning experience",
    usageItem3: "To communicate with you about your account or our services",
    usageItem4: "To improve our website and services",
    usageItem5: "To process payments and manage subscriptions",
    usageItem6: "To comply with legal obligations",
    securityTitle: "Data Security",
    securityContent: "We implement appropriate security measures...",
    cookiesTitle: "Cookies and Tracking Technologies",
    cookiesContent: "We use cookies and similar tracking technologies...",
    thirdPartyTitle: "Third-Party Services",
    thirdPartyContent: "We may use third-party services...",
    rightsTitle: "Your Rights",
    rightsDesc: "Depending on your location, you may have certain rights...",
    rightsItem1: "The right to access your personal information",
    rightsItem2: "The right to correct inaccurate information",
    rightsItem3: "The right to delete your information",
    rightsItem4: "The right to restrict or object to processing",
    rightsItem5: "The right to data portability",
    rightsItem6: "The right to withdraw consent",
    changesTitle: "Changes to This Privacy Policy",
    changesContent: "We may update our Privacy Policy from time to time...",
    contactTitle: "Contact Us",
    contactDesc: "If you have any questions about this Privacy Policy, please contact us at:",
    contactEmail: "privacy@signed-in-app.com", // Updated placeholder
    contactPhone: "+233 20 123 4567",
    contactAddress: "123 Education Street, Accra, Ghana",
};

export default function PrivacyPage() {
  const { t, isLoading } = useLanguage();

  return (
    <>
      <section className="section-padding hero-bg">
        <div className="container px-4 md:px-6 relative max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center p-1 rounded-full bg-purple-100 text-purple-700 mb-4 mx-auto w-fit">
                <div className="rounded-full bg-white p-1 glow-purple"><Shield className="h-4 w-4" /></div>
                <span className="ml-2 mr-3 text-sm font-medium">{isLoading ? fallbacks.footerPrivacy : <span suppressHydrationWarning>{t("footer.privacy") ?? fallbacks.footerPrivacy}</span>}</span>
              </div>
              <h1 className="heading-1 gradient-text-hero">{isLoading ? fallbacks.title : <span suppressHydrationWarning>{t("privacy.title") ?? fallbacks.title}</span>}</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed text-enhanced">{isLoading ? fallbacks.subtitle : <span suppressHydrationWarning>{t("privacy.subtitle") ?? fallbacks.subtitle}</span>}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="privacy-content" className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
           <div className="prose prose-purple dark:prose-invert max-w-none card-standard glass-card-content p-6 md:p-8 subtle-shadow rounded-xl">
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.introductionTitle : <span suppressHydrationWarning>{t("privacy.introduction.title") ?? fallbacks.introductionTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.introductionContent : <span suppressHydrationWarning>{t("privacy.introduction.content") ?? fallbacks.introductionContent}</span>}</p>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.collectionTitle : <span suppressHydrationWarning>{t("privacy.collection.title") ?? fallbacks.collectionTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.collectionDesc : <span suppressHydrationWarning>{t("privacy.collection.description") ?? fallbacks.collectionDesc}</span>}</p>
              <ul>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectionItem1Title : <span suppressHydrationWarning>{t("privacy.collection.item1.title") ?? fallbacks.collectionItem1Title}</span>}</strong>: {isLoading ? fallbacks.collectionItem1Desc : <span suppressHydrationWarning>{t("privacy.collection.item1.description") ?? fallbacks.collectionItem1Desc}</span>}</li>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectionItem2Title : <span suppressHydrationWarning>{t("privacy.collection.item2.title") ?? fallbacks.collectionItem2Title}</span>}</strong>: {isLoading ? fallbacks.collectionItem2Desc : <span suppressHydrationWarning>{t("privacy.collection.item2.description") ?? fallbacks.collectionItem2Desc}</span>}</li>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectionItem3Title : <span suppressHydrationWarning>{t("privacy.collection.item3.title") ?? fallbacks.collectionItem3Title}</span>}</strong>: {isLoading ? fallbacks.collectionItem3Desc : <span suppressHydrationWarning>{t("privacy.collection.item3.description") ?? fallbacks.collectionItem3Desc}</span>}</li>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectionItem4Title : <span suppressHydrationWarning>{t("privacy.collection.item4.title") ?? fallbacks.collectionItem4Title}</span>}</strong>: {isLoading ? fallbacks.collectionItem4Desc : <span suppressHydrationWarning>{t("privacy.collection.item4.description") ?? fallbacks.collectionItem4Desc}</span>}</li>
              </ul>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.usageTitle : <span suppressHydrationWarning>{t("privacy.usage.title") ?? fallbacks.usageTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.usageDesc : <span suppressHydrationWarning>{t("privacy.usage.description") ?? fallbacks.usageDesc}</span>}</p>
              <ul>{[1, 2, 3, 4, 5, 6].map(num => (<li key={num} className="text-enhanced purple-accent pl-3">{isLoading ? fallbacks[`usageItem${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`privacy.usage.item${num}`) ?? fallbacks[`usageItem${num}` as keyof typeof fallbacks]}</span>}</li>))}</ul>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.securityTitle : <span suppressHydrationWarning>{t("privacy.security.title") ?? fallbacks.securityTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.securityContent : <span suppressHydrationWarning>{t("privacy.security.content") ?? fallbacks.securityContent}</span>}</p>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.cookiesTitle : <span suppressHydrationWarning>{t("privacy.cookies.title") ?? fallbacks.cookiesTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.cookiesContent : <span suppressHydrationWarning>{t("privacy.cookies.content") ?? fallbacks.cookiesContent}</span>}</p>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.thirdPartyTitle : <span suppressHydrationWarning>{t("privacy.thirdParty.title") ?? fallbacks.thirdPartyTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.thirdPartyContent : <span suppressHydrationWarning>{t("privacy.thirdParty.content") ?? fallbacks.thirdPartyContent}</span>}</p>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.rightsTitle : <span suppressHydrationWarning>{t("privacy.rights.title") ?? fallbacks.rightsTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.rightsDesc : <span suppressHydrationWarning>{t("privacy.rights.description") ?? fallbacks.rightsDesc}</span>}</p>
              <ul>{[1, 2, 3, 4, 5, 6].map(num => (<li key={num} className="text-enhanced purple-accent pl-3">{isLoading ? fallbacks[`rightsItem${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`privacy.rights.item${num}`) ?? fallbacks[`rightsItem${num}` as keyof typeof fallbacks]}</span>}</li>))}</ul>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.changesTitle : <span suppressHydrationWarning>{t("privacy.changes.title") ?? fallbacks.changesTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.changesContent : <span suppressHydrationWarning>{t("privacy.changes.content") ?? fallbacks.changesContent}</span>}</p>

              <h2 className="gradient-text-heading">{isLoading ? fallbacks.contactTitle : <span suppressHydrationWarning>{t("privacy.contact.title") ?? fallbacks.contactTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.contactDesc : <span suppressHydrationWarning>{t("privacy.contact.description") ?? fallbacks.contactDesc}</span>}</p>
              <p className="text-enhanced purple-accent pl-3">
                 Email: <a href={`mailto:${fallbacks.contactEmail}`} className="text-purple-600 hover:text-purple-800">{isLoading? fallbacks.contactEmail : <span suppressHydrationWarning>{t("privacy.contact.email") ?? fallbacks.contactEmail}</span>}</a><br />
                 Phone: <a href={`tel:${fallbacks.contactPhone}`} className="text-purple-600 hover:text-purple-800">{isLoading? fallbacks.contactPhone : <span suppressHydrationWarning>{t("privacy.contact.phone") ?? fallbacks.contactPhone}</span>}</a><br />
                 Address: {isLoading? fallbacks.contactAddress : <span suppressHydrationWarning>{t("privacy.contact.address") ?? fallbacks.contactAddress}</span>}
              </p>

             <p className="text-sm text-muted-foreground mt-8 text-enhanced">{isLoading ? fallbacks.lastUpdated : <span suppressHydrationWarning>{t("privacy.lastUpdated") ?? fallbacks.lastUpdated}</span>}</p>
           </div>
        </div>
      </section>
    </>
  )
}