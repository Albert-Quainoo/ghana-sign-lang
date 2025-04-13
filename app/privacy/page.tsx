"use client"

import { useLanguage } from "@/contexts/language-context"
import { Shield } from "lucide-react"

// Fallback Texts
const fallbacks = {
    footerPrivacy: "Privacy Policy",
    heroTitle: "Privacy Policy",
    heroSubtitle: "How we collect, use, and protect your information",
    lastUpdated: "Last Updated: April 9, 2025", // Keep date static or fetch dynamically
    introTitle: "Introduction",
    introContent: "At Lending a Helping Ear, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.",
    collectTitle: "Information We Collect",
    collectDesc: "We may collect the following types of information:",
    collectItem1Title: "Personal Information",
    collectItem1Desc: "Name, email address, phone number, and other contact details you provide when signing up or contacting us.",
    collectItem2Title: "Account Information",
    collectItem2Desc: "Login credentials, account preferences, and learning progress.",
    collectItem3Title: "Usage Data",
    collectItem3Desc: "Information about how you use our website, including pages visited, time spent, and features used.",
    collectItem4Title: "Technical Data",
    collectItem4Desc: "IP address, browser type, device information, and cookies.",
    usageTitle: "How We Use Your Information",
    usageDesc: "We use your information for the following purposes:",
    usageItem1: "To provide and maintain our services",
    usageItem2: "To personalize your learning experience",
    usageItem3: "To communicate with you about your account or our services",
    usageItem4: "To improve our website and services",
    usageItem5: "To process payments and manage subscriptions",
    usageItem6: "To comply with legal obligations",
    securityTitle: "Data Security",
    securityContent: "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    cookiesTitle: "Cookies and Tracking Technologies",
    cookiesContent: "We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
    thirdPartyTitle: "Third-Party Services",
    thirdPartyContent: "We may use third-party services to support our website functionality. These services may collect information sent by your browser as part of a web page request. Their use of your information is governed by their privacy policies.",
    rightsTitle: "Your Rights",
    rightsDesc: "Depending on your location, you may have certain rights regarding your personal information, including:",
    rightsItem1: "The right to access your personal information",
    rightsItem2: "The right to correct inaccurate information",
    rightsItem3: "The right to delete your information",
    rightsItem4: "The right to restrict or object to processing",
    rightsItem5: "The right to data portability",
    rightsItem6: "The right to withdraw consent",
    changesTitle: "Changes to This Privacy Policy",
    changesContent: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date.",
    contactTitle: "Contact Us",
    contactDesc: "If you have any questions about this Privacy Policy, please contact us at:",
    contactEmail: "privacy@lendingahelpingear.org",
    contactPhone: "+233 20 123 4567",
    contactAddress: "123 Education Street, Accra, Ghana",
};


export default function PrivacyPage() {
  const { t, isLoading } = useLanguage()

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding hero-bg">
        <div className="container px-4 md:px-6 relative max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center p-1 rounded-full bg-purple-100 text-purple-700 mb-4">
                <div className="rounded-full bg-white p-1 glow-purple"><Shield className="h-4 w-4" /></div>
                 <span className="ml-2 mr-3 text-sm font-medium">{isLoading ? fallbacks.footerPrivacy : <span suppressHydrationWarning>{t("footer.privacy") ?? fallbacks.footerPrivacy}</span>}</span>
              </div>
              <h1 className="heading-1 gradient-text-hero">
                 {isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("privacy.title") ?? fallbacks.heroTitle}</span>}
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed text-enhanced">{isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("privacy.subtitle") ?? fallbacks.heroSubtitle}</span>}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="privacy-content" className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
           <div className="prose prose-purple dark:prose-invert max-w-none card-standard glass-card-content p-6 md:p-8 subtle-shadow rounded-xl">
              {/* Introduction */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.introTitle : <span suppressHydrationWarning>{t("privacy.introduction.title") ?? fallbacks.introTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.introContent : <span suppressHydrationWarning>{t("privacy.introduction.content") ?? fallbacks.introContent}</span>}</p>

              {/* Information We Collect */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.collectTitle : <span suppressHydrationWarning>{t("privacy.collection.title") ?? fallbacks.collectTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.collectDesc : <span suppressHydrationWarning>{t("privacy.collection.description") ?? fallbacks.collectDesc}</span>}</p>
              <ul>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectItem1Title : <span suppressHydrationWarning>{t("privacy.collection.item1.title") ?? fallbacks.collectItem1Title}</span>}</strong>: {isLoading ? fallbacks.collectItem1Desc : <span suppressHydrationWarning>{t("privacy.collection.item1.description") ?? fallbacks.collectItem1Desc}</span>}</li>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectItem2Title : <span suppressHydrationWarning>{t("privacy.collection.item2.title") ?? fallbacks.collectItem2Title}</span>}</strong>: {isLoading ? fallbacks.collectItem2Desc : <span suppressHydrationWarning>{t("privacy.collection.item2.description") ?? fallbacks.collectItem2Desc}</span>}</li>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectItem3Title : <span suppressHydrationWarning>{t("privacy.collection.item3.title") ?? fallbacks.collectItem3Title}</span>}</strong>: {isLoading ? fallbacks.collectItem3Desc : <span suppressHydrationWarning>{t("privacy.collection.item3.description") ?? fallbacks.collectItem3Desc}</span>}</li>
                <li className="text-enhanced"><strong className="purple-highlight">{isLoading ? fallbacks.collectItem4Title : <span suppressHydrationWarning>{t("privacy.collection.item4.title") ?? fallbacks.collectItem4Title}</span>}</strong>: {isLoading ? fallbacks.collectItem4Desc : <span suppressHydrationWarning>{t("privacy.collection.item4.description") ?? fallbacks.collectItem4Desc}</span>}</li>
              </ul>

              {/* How We Use Your Information */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.usageTitle : <span suppressHydrationWarning>{t("privacy.usage.title") ?? fallbacks.usageTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.usageDesc : <span suppressHydrationWarning>{t("privacy.usage.description") ?? fallbacks.usageDesc}</span>}</p>
              <ul>
                 {[1, 2, 3, 4, 5, 6].map(num => (
                    <li key={num} className="text-enhanced purple-accent pl-3">{isLoading ? fallbacks[`usageItem${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`privacy.usage.item${num}`) ?? fallbacks[`usageItem${num}` as keyof typeof fallbacks]}</span>}</li>
                 ))}
              </ul>

              {/* Data Security */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.securityTitle : <span suppressHydrationWarning>{t("privacy.security.title") ?? fallbacks.securityTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.securityContent : <span suppressHydrationWarning>{t("privacy.security.content") ?? fallbacks.securityContent}</span>}</p>

              {/* Cookies */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.cookiesTitle : <span suppressHydrationWarning>{t("privacy.cookies.title") ?? fallbacks.cookiesTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.cookiesContent : <span suppressHydrationWarning>{t("privacy.cookies.content") ?? fallbacks.cookiesContent}</span>}</p>

              {/* Third-Party Services */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.thirdPartyTitle : <span suppressHydrationWarning>{t("privacy.thirdParty.title") ?? fallbacks.thirdPartyTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.thirdPartyContent : <span suppressHydrationWarning>{t("privacy.thirdParty.content") ?? fallbacks.thirdPartyContent}</span>}</p>

              {/* Your Rights */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.rightsTitle : <span suppressHydrationWarning>{t("privacy.rights.title") ?? fallbacks.rightsTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.rightsDesc : <span suppressHydrationWarning>{t("privacy.rights.description") ?? fallbacks.rightsDesc}</span>}</p>
              <ul>
                 {[1, 2, 3, 4, 5, 6].map(num => (
                    <li key={num} className="text-enhanced purple-accent pl-3">{isLoading ? fallbacks[`rightsItem${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`privacy.rights.item${num}`) ?? fallbacks[`rightsItem${num}` as keyof typeof fallbacks]}</span>}</li>
                  ))}
              </ul>

              {/* Changes */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.changesTitle : <span suppressHydrationWarning>{t("privacy.changes.title") ?? fallbacks.changesTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.changesContent : <span suppressHydrationWarning>{t("privacy.changes.content") ?? fallbacks.changesContent}</span>}</p>

              {/* Contact Us */}
              <h2 className="gradient-text-heading">{isLoading ? fallbacks.contactTitle : <span suppressHydrationWarning>{t("privacy.contact.title") ?? fallbacks.contactTitle}</span>}</h2>
              <p className="text-enhanced">{isLoading ? fallbacks.contactDesc : <span suppressHydrationWarning>{t("privacy.contact.description") ?? fallbacks.contactDesc}</span>}</p>
              <p className="text-enhanced purple-accent pl-3">
                 Email: <a href={`mailto:${isLoading? fallbacks.contactEmail : t("privacy.contact.email") ?? fallbacks.contactEmail}`} className="text-purple-600 hover:text-purple-800">{isLoading? fallbacks.contactEmail : <span suppressHydrationWarning>{t("privacy.contact.email") ?? fallbacks.contactEmail}</span>}</a><br />
                 Phone: <a href={`tel:${isLoading? fallbacks.contactPhone : t("privacy.contact.phone") ?? fallbacks.contactPhone}`} className="text-purple-600 hover:text-purple-800">{isLoading? fallbacks.contactPhone : <span suppressHydrationWarning>{t("privacy.contact.phone") ?? fallbacks.contactPhone}</span>}</a><br />
                 Address: {isLoading? fallbacks.contactAddress : <span suppressHydrationWarning>{t("privacy.contact.address") ?? fallbacks.contactAddress}</span>}
              </p>

             <p className="text-sm text-muted-foreground mt-8 text-enhanced">{isLoading ? fallbacks.lastUpdated : <span suppressHydrationWarning>{t("privacy.lastUpdated") ?? fallbacks.lastUpdated}</span>}</p>
           </div>
        </div>
      </section>
    </>
  )
}