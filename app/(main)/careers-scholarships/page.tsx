"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, /*Removed unused: Briefcase, GraduationCap, Sparkles, Users, Heart */ } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils"; 


const fallbacks = {
    heroTitle: "Careers & Scholarships",
    heroSubtitle: "Explore career opportunities and scholarship programs for GSL users and interpreters.",
    interpreterTitle: "GSL Interpreter Careers",
    interpreterDescription: "Skilled GSL interpreters are in high demand across various sectors. Explore career opportunities and professional development resources.",
    interpreterPoint1: "Educational institutions",
    interpreterPoint2: "Healthcare settings",
    interpreterPoint3: "Government and public services",
    interpreterPoint4: "Corporate and business environments",
    interpreterCta: "Explore Interpreter Careers",
    interpreterImageAlt: "GSL interpreter at work",
    scholarshipsTitle: "Scholarship Programs",
    scholarshipsDescription: "We offer financial support to help deaf students pursue higher education and professional development.",
    scholarshipsPoint1: "Undergraduate scholarships.",
    scholarshipsPoint2: "Graduate research grants.",
    scholarshipsPoint3: "Vocational training support.",
    scholarshipsPoint4: "Professional certification funding.",
    scholarshipsCta: "Apply for Scholarships",
    scholarshipsImageAlt: "Deaf student in graduation cap",
    developmentTitle: "Professional Development",
    developmentDescription: "Enhance your skills and credentials with our professional development programs for GSL users and interpreters.",
    devCard1Title: "GSL Interpreter Certification",
    devCard1Desc: "Become a certified GSL interpreter",
    devCard1Content: "Our comprehensive certification program prepares you for professional interpreting...",
    devCard1Alt: "GSL Interpreter Certification program image",
    devCard2Title: "Advanced GSL Workshops",
    devCard2Desc: "Specialized training for specific domains",
    devCard2Content: "Enhance your GSL skills in specialized areas...",
    devCard2Button: "View Workshops",
    devCard2Alt: "Advanced GSL Workshops image",
    devCard3Title: "Deaf Leadership Program",
    devCard3Desc: "Develop leadership and advocacy skills",
    devCard3Content: "Our leadership program empowers deaf individuals...",
    devCard3Alt: "Deaf Leadership Program image",
    opportunitiesTitle: "Career Opportunities",
    jobViewDetails: "View Details",
    jobViewAll: "View All Career Opportunities",
    jobTypeFull: "Full-time",
    jobTypePart: "Part-time",
    jobInterpreterTitle: "GSL Interpreter",
    jobInterpreterLoc: "Various locations in Ghana",
    jobInterpreterReq: "Requirements: GSL fluency, interpretation certification",
    jobInterpreterSal: "Salary Range: GHS 2,500 - 4,000 monthly",
    jobTeacherTitle: "GSL Teacher",
    jobTeacherLoc: "Schools for the Deaf across Ghana",
    jobTeacherReq: "Requirements: Teaching certification, GSL fluency",
    jobTeacherSal: "Salary Range: GHS 2,800 - 4,500 monthly",
    jobCreatorTitle: "GSL Content Creator",
    jobCreatorLoc: "Remote with occasional travel",
    jobCreatorReq: "Requirements: GSL fluency, content creation experience",
    jobCreatorComp: "Compensation: Project-based",
    successTitle: "Success Stories",
    successDesc: "Read about the success stories of deaf professionals and GSL interpreters who have built rewarding careers.",
    successButton: "Read Success Stories",
    commonLearnMore: "Learn More",
    commonApplyNow: "Apply Now"
};


export default function CareersScholarshipsPage() {
  const { t, isLoading } = useLanguage();

  const trainingPrograms = [
    { id: 1, titleKey: "careers.development.card1.title", descriptionKey: "careers.development.card1.description", contentKey: "careers.development.card1.content", image: "/placeholder.svg?height=200&width=350", altKey: "careers.development.card1.alt", buttonKey: "common.learnMore", iconColor: "pink", fallbackTitle: fallbacks.devCard1Title, fallbackDesc: fallbacks.devCard1Desc, fallbackContent: fallbacks.devCard1Content, fallbackAlt: fallbacks.devCard1Alt, fallbackBtn: fallbacks.commonLearnMore },
    { id: 2, titleKey: "careers.development.card2.title", descriptionKey: "careers.development.card2.description", contentKey: "careers.development.card2.content", image: "/placeholder.svg?height=200&width=350", altKey: "careers.development.card2.alt", buttonKey: "careers.development.card2.button", iconColor: "purple", fallbackTitle: fallbacks.devCard2Title, fallbackDesc: fallbacks.devCard2Desc, fallbackContent: fallbacks.devCard2Content, fallbackAlt: fallbacks.devCard2Alt, fallbackBtn: fallbacks.devCard2Button },
    { id: 3, titleKey: "careers.development.card3.title", descriptionKey: "careers.development.card3.description", contentKey: "careers.development.card3.content", image: "/placeholder.svg?height=200&width=350", altKey: "careers.development.card3.alt", buttonKey: "common.applyNow", iconColor: "indigo", fallbackTitle: fallbacks.devCard3Title, fallbackDesc: fallbacks.devCard3Desc, fallbackContent: fallbacks.devCard3Content, fallbackAlt: fallbacks.devCard3Alt, fallbackBtn: fallbacks.commonApplyNow },
  ];

  const jobListings = [
    { id: "interpreter", typeKey: "careers.jobBoard.type.fullTime", titleKey: "careers.jobBoard.interpreter.title", locationKey: "careers.jobBoard.interpreter.location", requirementsKey: "careers.jobBoard.interpreter.requirements", salaryKey: "careers.jobBoard.interpreter.salary", compensationKey: null, fbType: fallbacks.jobTypeFull, fbTitle: fallbacks.jobInterpreterTitle, fbLoc: fallbacks.jobInterpreterLoc, fbReq: fallbacks.jobInterpreterReq, fbPay: fallbacks.jobInterpreterSal },
    { id: "teacher", typeKey: "careers.jobBoard.type.fullTime", titleKey: "careers.jobBoard.teacher.title", locationKey: "careers.jobBoard.teacher.location", requirementsKey: "careers.jobBoard.teacher.requirements", salaryKey: "careers.jobBoard.teacher.salary", compensationKey: null, fbType: fallbacks.jobTypeFull, fbTitle: fallbacks.jobTeacherTitle, fbLoc: fallbacks.jobTeacherLoc, fbReq: fallbacks.jobTeacherReq, fbPay: fallbacks.jobTeacherSal },
    { id: "content-creator", typeKey: "careers.jobBoard.type.partTime", titleKey: "careers.jobBoard.contentCreator.title", locationKey: "careers.jobBoard.contentCreator.location", requirementsKey: "careers.jobBoard.contentCreator.requirements", salaryKey: null, compensationKey: "careers.jobBoard.contentCreator.compensation", fbType: fallbacks.jobTypePart, fbTitle: fallbacks.jobCreatorTitle, fbLoc: fallbacks.jobCreatorLoc, fbReq: fallbacks.jobCreatorReq, fbPay: fallbacks.jobCreatorComp },
  ];

  return (
    <>
      <section className="section-padding hero-bg">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero">{isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("careers.hero.title") ?? fallbacks.heroTitle}</span>}</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">{isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("careers.hero.subtitle") ?? fallbacks.heroSubtitle}</span>}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="interpreter-careers" className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 -rotate-3 prismatic-glow"></div>
                <Image src="/placeholder.svg?height=400&width=600" width={600} height={400} priority alt={isLoading ? fallbacks.interpreterImageAlt : t("careers.interpreter.imageAlt") ?? fallbacks.interpreterImageAlt} className="rounded-xl relative shadow-lg object-cover border-4 border-background -rotate-3 w-full h-auto img-duotone-pink-purple"/>
              </div>
            </div>
            <div className="space-y-4 lg:space-y-5 order-1 lg:order-2">
              <h2 className="heading-2 gradient-text-heading">{isLoading ? fallbacks.interpreterTitle : <span suppressHydrationWarning>{t("careers.interpreter.title") ?? fallbacks.interpreterTitle}</span>}</h2>
              <p className="text-muted-foreground md:text-lg/relaxed">{isLoading ? fallbacks.interpreterDescription : <span suppressHydrationWarning>{t("careers.interpreter.description") ?? fallbacks.interpreterDescription}</span>}</p>
              <ul className="grid gap-3">
                {[1, 2, 3, 4].map((num) => ( <li key={num} className="flex items-start gap-3"> <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-pink-500 flex-shrink-0 glow-primary" /> <span className="text-base text-muted-foreground text-enhanced">{isLoading ? fallbacks[`interpreterPoint${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`careers.interpreter.point${num}`) ?? fallbacks[`interpreterPoint${num}` as keyof typeof fallbacks]}</span>}</span></li> ))}
              </ul>
              <Button size="lg" className="mt-2 btn-gradient">{isLoading ? fallbacks.interpreterCta : <span suppressHydrationWarning>{t("careers.interpreter.cta") ?? fallbacks.interpreterCta}</span>}</Button>
            </div>
          </div>
        </div>
      </section>

      <section id="scholarships" className="section-padding content-bg-2">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
             <div className="space-y-4 lg:space-y-5">
               <h2 className="heading-2 gradient-text-heading">{isLoading ? fallbacks.scholarshipsTitle : <span suppressHydrationWarning>{t("careers.scholarships.title") ?? fallbacks.scholarshipsTitle}</span>}</h2>
               <p className="text-muted-foreground md:text-lg/relaxed">{isLoading ? fallbacks.scholarshipsDescription : <span suppressHydrationWarning>{t("careers.scholarships.description") ?? fallbacks.scholarshipsDescription}</span>}</p>
               <ul className="grid gap-3">
                 {[1, 2, 3, 4].map((num) => ( <li key={num} className="flex items-start gap-3"> <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-purple-500 flex-shrink-0 glow-purple" /> <span className="text-base text-muted-foreground text-enhanced">{isLoading ? fallbacks[`scholarshipsPoint${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`careers.scholarships.point${num}`) ?? fallbacks[`scholarshipsPoint${num}` as keyof typeof fallbacks]}</span>}</span></li> ))}
               </ul>
               <Button size="lg" className="mt-2 btn-gradient">{isLoading ? fallbacks.scholarshipsCta : <span suppressHydrationWarning>{t("careers.scholarships.cta") ?? fallbacks.scholarshipsCta}</span>}</Button>
             </div>
             <div className="flex justify-center">
                 <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                   <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 rotate-3 prismatic-glow"></div>
                   <Image src="/placeholder.svg?height=400&width=600" width={600} height={400} alt={isLoading ? fallbacks.scholarshipsImageAlt : t("careers.scholarships.imageAlt") ?? fallbacks.scholarshipsImageAlt} className="rounded-xl relative shadow-lg object-cover border-4 border-background rotate-3 w-full h-auto img-duotone-blue-purple"/>
                 </div>
             </div>
           </div>
         </div>
      </section>

      <section id="development" className="section-padding content-bg-1">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
             <div className="space-y-2 max-w-3xl">
               <h2 className="heading-2 gradient-text-heading">{isLoading ? fallbacks.developmentTitle : <span suppressHydrationWarning>{t("careers.development.title") ?? fallbacks.developmentTitle}</span>}</h2>
               <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">{isLoading ? fallbacks.developmentDescription : <span suppressHydrationWarning>{t("careers.development.description") ?? fallbacks.developmentDescription}</span>}</p>
             </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
             {trainingPrograms.map((program) => (
               <Card key={program.id} className="card-standard glass-card-content subtle-shadow flex flex-col h-full">
                 <CardHeader className="p-0">
                   <div className="overflow-hidden aspect-[16/9]">
                     <Image src={program.image} width={350} height={200} alt={isLoading ? program.fallbackAlt : t(program.altKey) ?? program.fallbackAlt} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/>
                   </div>
                   <div className="p-4 md:p-5">
                      <CardTitle className={cn("text-lg font-semibold transition-colors", program.iconColor === "pink" && "group-hover:text-pink-600", program.iconColor === "purple" && "group-hover:text-purple-600", program.iconColor === "indigo" && "group-hover:text-indigo-600")}>
                         {isLoading ? program.fallbackTitle : <span suppressHydrationWarning>{t(program.titleKey) ?? program.fallbackTitle}</span>}
                     </CardTitle>
                     <CardDescription className="text-sm mt-1">{isLoading ? program.fallbackDesc : <span suppressHydrationWarning>{t(program.descriptionKey) ?? program.fallbackDesc}</span>}</CardDescription>
                   </div>
                 </CardHeader>
                 <CardContent className="p-4 md:p-5 flex-grow">
                   <p className="text-sm text-muted-foreground">{isLoading ? program.fallbackContent : <span suppressHydrationWarning>{t(program.contentKey) ?? program.fallbackContent}</span>}</p>
                 </CardContent>
                 <CardFooter className="p-4 md:p-5 mt-auto">
                   <Button className="w-full btn-gradient">{isLoading ? program.fallbackBtn : <span suppressHydrationWarning>{t(program.buttonKey) ?? program.fallbackBtn}</span>}</Button>
                 </CardFooter>
               </Card>
             ))}
           </div>
         </div>
      </section>

      <section id="opportunities" className="section-padding content-bg-2">
          <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
                  <div className="space-y-2 max-w-3xl">
                      <h2 className="heading-2 gradient-text-heading">{isLoading ? fallbacks.opportunitiesTitle : <span suppressHydrationWarning>{t("careers.opportunities.title") ?? fallbacks.opportunitiesTitle}</span>}</h2>
                  </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {jobListings.map((job) => (
                      <Card key={job.id} className="card-standard glass-card-content subtle-shadow flex flex-col h-full">
                          <CardHeader className="p-4 md:p-5">
                              <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full mb-2">{isLoading ? job.fbType : <span suppressHydrationWarning>{t(job.typeKey) ?? job.fbType}</span>}</span>
                              <CardTitle className="text-lg font-semibold">{isLoading ? job.fbTitle : <span suppressHydrationWarning>{t(job.titleKey) ?? job.fbTitle}</span>}</CardTitle>
                              <CardDescription className="text-sm text-muted-foreground">{isLoading ? job.fbLoc : <span suppressHydrationWarning>{t(job.locationKey) ?? job.fbLoc}</span>}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 md:p-5 flex-grow">
                              <p className="text-sm text-muted-foreground mb-1">{isLoading ? job.fbReq : <span suppressHydrationWarning>{t(job.requirementsKey) ?? job.fbReq}</span>}</p>
                              <p className="text-sm font-medium text-foreground">{isLoading ? job.fbPay : <span suppressHydrationWarning>{job.salaryKey ? (t(job.salaryKey) ?? job.fbPay) : (job.compensationKey ? (t(job.compensationKey) ?? job.fbPay) : '')}</span>}</p>
                          </CardContent>
                          <CardFooter className="p-4 md:p-5 mt-auto bg-muted/50">
                              <Button variant="outline" size="sm" className="w-full btn-secondary">{isLoading ? fallbacks.jobViewDetails : <span suppressHydrationWarning>{t("careers.jobBoard.viewDetails") ?? fallbacks.jobViewDetails}</span>}</Button>
                          </CardFooter>
                      </Card>
                  ))}
              </div>
              <div className="flex justify-center mt-10 lg:mt-12">
                  <Button variant="outline" size="lg" className="btn-secondary group">
                      {isLoading ? fallbacks.jobViewAll : <span suppressHydrationWarning>{t("careers.jobBoard.viewAll") ?? fallbacks.jobViewAll}</span>}
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </div>
          </div>
      </section>

      <section id="success" className="section-padding content-bg-1">
           <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
               <div className="flex flex-col items-center justify-center space-y-4 text-center">
                   <div className="space-y-2 max-w-3xl">
                       <h2 className="heading-2 gradient-text-heading">{isLoading ? fallbacks.successTitle : <span suppressHydrationWarning>{t("careers.success.title") ?? fallbacks.successTitle}</span>}</h2>
                       <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">{isLoading ? fallbacks.successDesc : <span suppressHydrationWarning>{t("careers.success.description") ?? fallbacks.successDesc}</span>}</p>
                       <Button variant="outline" size="lg" className="mt-4 btn-secondary group">
                          {isLoading ? fallbacks.successButton : <span suppressHydrationWarning>{t("careers.success.button") ?? fallbacks.successButton}</span>}
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                       </Button>
                   </div>
               </div>
           </div>
      </section>
    </>
  )
}