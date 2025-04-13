"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, GraduationCap, ChevronRight } from "lucide-react" // Removed unused icons
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Fallback Texts specific to this page
const fallbacks = {
    heroTitle: "Careers & Scholarships",
    heroSubtitle: "Explore career opportunities and scholarship programs for GSL users and interpreters.",
    interpreterTitle: "GSL Interpreter Careers",
    interpreterDesc: "Skilled GSL interpreters are in high demand across various sectors. Explore career opportunities and professional development resources.",
    interpreterPoint1: "Educational institutions",
    interpreterPoint2: "Healthcare settings",
    interpreterPoint3: "Government and public services",
    interpreterPoint4: "Corporate and business environments",
    interpreterCta: "Explore Interpreter Careers",
    interpreterImageAlt: "GSL interpreter at work",
    scholarshipsTitle: "Scholarship Programs",
    scholarshipsDesc: "We offer financial support to help deaf students pursue higher education and professional development.",
    scholarshipsPoint1: "Undergraduate scholarships.",
    scholarshipsPoint2: "Graduate research grants.",
    scholarshipsPoint3: "Vocational training support.",
    scholarshipsPoint4: "Professional certification funding.",
    scholarshipsCta: "Apply for Scholarships",
    scholarshipsImageAlt: "Deaf student in graduation cap",
    developmentTitle: "Professional Development",
    developmentDesc: "Enhance your skills and credentials with our professional development programs for GSL users and interpreters.",
    devCard1Title: "GSL Interpreter Certification",
    devCard1Desc: "Become a certified GSL interpreter",
    devCard1Content: "Our comprehensive certification program prepares you for professional interpreting...",
    devCard1Alt: "GSL Interpreter Certification program image",
    devCard1Btn: "Learn More", // Corresponds to common.learnMore
    devCard2Title: "Advanced GSL Workshops",
    devCard2Desc: "Specialized training for specific domains",
    devCard2Content: "Enhance your GSL skills in specialized areas...",
    devCard2Alt: "Advanced GSL Workshops image",
    devCard2Btn: "View Workshops", // Unique button text
    devCard3Title: "Deaf Leadership Program",
    devCard3Desc: "Develop leadership and advocacy skills",
    devCard3Content: "Our leadership program empowers deaf individuals...",
    devCard3Alt: "Deaf Leadership Program image",
    devCard3Btn: "Apply Now", // Corresponds to common.applyNow
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
    successButton: "Read Success Stories"
};


export default function CareersScholarshipsPage() {
  const { t, isLoading } = useLanguage() // Use hook

  // Data using corrected/intended keys
  const trainingPrograms = [
    { id: 1, titleKey: "careers.development.card1.title", descriptionKey: "careers.development.card1.description", contentKey: "careers.development.card1.content", image: "/placeholder.svg?height=200&width=350", altKey: "careers.development.card1.alt", buttonKey: "common.learnMore", iconColor: "pink", fallbackButton: fallbacks.devCard1Btn },
    { id: 2, titleKey: "careers.development.card2.title", descriptionKey: "careers.development.card2.description", contentKey: "careers.development.card2.content", image: "/placeholder.svg?height=200&width=350", altKey: "careers.development.card2.alt", buttonKey: "careers.development.card2.button", iconColor: "purple", fallbackButton: fallbacks.devCard2Btn },
    { id: 3, titleKey: "careers.development.card3.title", descriptionKey: "careers.development.card3.description", contentKey: "careers.development.card3.content", image: "/placeholder.svg?height=200&width=350", altKey: "careers.development.card3.alt", buttonKey: "common.applyNow", iconColor: "indigo", fallbackButton: fallbacks.devCard3Btn },
  ];

  const jobListings = [
    { id: "interpreter", typeKey: "careers.jobBoard.type.fullTime", titleKey: "careers.jobBoard.interpreter.title", locationKey: "careers.jobBoard.interpreter.location", requirementsKey: "careers.jobBoard.interpreter.requirements", salaryKey: "careers.jobBoard.interpreter.salary", compensationKey: null },
    { id: "teacher", typeKey: "careers.jobBoard.type.fullTime", titleKey: "careers.jobBoard.teacher.title", locationKey: "careers.jobBoard.teacher.location", requirementsKey: "careers.jobBoard.teacher.requirements", salaryKey: "careers.jobBoard.teacher.salary", compensationKey: null },
    { id: "content-creator", typeKey: "careers.jobBoard.type.partTime", titleKey: "careers.jobBoard.contentCreator.title", locationKey: "careers.jobBoard.contentCreator.location", requirementsKey: "careers.jobBoard.contentCreator.requirements", salaryKey: null, compensationKey: "careers.jobBoard.contentCreator.compensation" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding hero-bg">
        {/* ... blobs ... */}
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero">
                {isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("careers.hero.title") ?? fallbacks.heroTitle}</span>}
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                {isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("careers.hero.subtitle") ?? fallbacks.heroSubtitle}</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GSL Interpreter Careers Section */}
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
               <h2 className="heading-2 gradient-text-heading">
                  {isLoading ? fallbacks.interpreterTitle : <span suppressHydrationWarning>{t("careers.interpreter.title") ?? fallbacks.interpreterTitle}</span>}
               </h2>
               <p className="text-muted-foreground md:text-lg/relaxed">
                  {isLoading ? fallbacks.interpreterDesc : <span suppressHydrationWarning>{t("careers.interpreter.description") ?? fallbacks.interpreterDesc}</span>}
               </p>
               <ul className="grid gap-3">
                 {[1, 2, 3, 4].map((num) => (
                   <li key={num} className="flex items-start gap-3">
                     <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-pink-500 flex-shrink-0 glow-primary" />
                     <span className="text-base text-muted-foreground text-enhanced">{isLoading ? fallbacks[`interpreterPoint${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`careers.interpreter.point${num}`) ?? fallbacks[`interpreterPoint${num}` as keyof typeof fallbacks]}</span>}</span>
                   </li>
                 ))}
               </ul>
               <Button size="lg" className="mt-2 btn-gradient"> {/* Primary */}
                  {isLoading ? fallbacks.interpreterCta : <span suppressHydrationWarning>{t("careers.interpreter.cta") ?? fallbacks.interpreterCta}</span>}
               </Button>
             </div>
           </div>
         </div>
      </section>

      {/* Scholarship Programs Section */}
      <section id="scholarships" className="section-padding content-bg-2">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
             <div className="space-y-4 lg:space-y-5">
               <h2 className="heading-2 gradient-text-heading">
                 {isLoading ? fallbacks.scholarshipsTitle : <span suppressHydrationWarning>{t("careers.scholarships.title") ?? fallbacks.scholarshipsTitle}</span>}
               </h2>
               <p className="text-muted-foreground md:text-lg/relaxed">
                 {isLoading ? fallbacks.scholarshipsDesc : <span suppressHydrationWarning>{t("careers.scholarships.description") ?? fallbacks.scholarshipsDesc}</span>}
               </p>
               <ul className="grid gap-3">
                 {[1, 2, 3, 4].map((num) => (
                   <li key={num} className="flex items-start gap-3">
                     <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-purple-500 flex-shrink-0 glow-purple" />
                     <span className="text-base text-muted-foreground text-enhanced">{isLoading ? fallbacks[`scholarshipsPoint${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`careers.scholarships.point${num}`) ?? fallbacks[`scholarshipsPoint${num}` as keyof typeof fallbacks]}</span>}</span>
                   </li>
                 ))}
               </ul>
               <Button size="lg" className="mt-2 btn-gradient"> {/* Primary */}
                  {isLoading ? fallbacks.scholarshipsCta : <span suppressHydrationWarning>{t("careers.scholarships.cta") ?? fallbacks.scholarshipsCta}</span>}
               </Button>
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

      {/* Professional Development Section */}
      <section id="development" className="section-padding content-bg-1">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
             <div className="space-y-2 max-w-3xl">
               <h2 className="heading-2 gradient-text-heading">
                  {isLoading ? fallbacks.developmentTitle : <span suppressHydrationWarning>{t("careers.development.title") ?? fallbacks.developmentTitle}</span>}
               </h2>
               <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  {/* Using the description key from the structure */}
                  {isLoading ? fallbacks.developmentDesc : <span suppressHydrationWarning>{t("careers.development.description") ?? fallbacks.developmentDesc}</span>}
               </p>
             </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
             {trainingPrograms.map((program) => (
               <Card key={program.id} className="card-standard glass-card-content subtle-shadow flex flex-col h-full">
                 <CardHeader className="p-0">
                   <div className="overflow-hidden aspect-[16/9]"><Image src={program.image} width={350} height={200} alt={isLoading ? `Training ${program.id} Alt` : t(program.altKey) ?? `Training ${program.id} Alt`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/></div>
                   <div className="p-4 md:p-5">
                      <CardTitle className={cn("text-lg font-semibold transition-colors",program.iconColor === "pink" && "group-hover:text-pink-600",program.iconColor === "purple" && "group-hover:text-purple-600",program.iconColor === "indigo" && "group-hover:text-indigo-600")}>
                         {isLoading ? `Training ${program.id} Title` : <span suppressHydrationWarning>{t(program.titleKey) ?? `Training ${program.id} Title`}</span>}
                     </CardTitle>
                     <CardDescription className="text-sm mt-1">{isLoading ? `Training ${program.id} Desc` : <span suppressHydrationWarning>{t(program.descriptionKey) ?? `Training ${program.id} Desc`}</span>}</CardDescription>
                   </div>
                 </CardHeader>
                 <CardContent className="p-4 md:p-5 flex-grow"><p className="text-sm text-muted-foreground">{isLoading ? `Training ${program.id} Content` : <span suppressHydrationWarning>{t(program.contentKey) ?? `Training ${program.id} Content`}</span>}</p></CardContent>
                 <CardFooter className="p-4 md:p-5 mt-auto">
                   <Button className="w-full btn-gradient"> {/* Primary */}
                      {isLoading ? program.fallbackButton : <span suppressHydrationWarning>{t(program.buttonKey) ?? program.fallbackButton}</span>}
                   </Button>
                 </CardFooter>
               </Card>
             ))}
           </div>
         </div>
      </section>

      {/* Career Opportunities Section */}
      <section id="opportunities" className="section-padding content-bg-2">
          <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
                  <div className="space-y-2 max-w-3xl">
                      <h2 className="heading-2 gradient-text-heading">
                          {isLoading ? fallbacks.opportunitiesTitle : <span suppressHydrationWarning>{t("careers.opportunities.title") ?? fallbacks.opportunitiesTitle}</span>}
                      </h2>
                  </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                  {jobListings.map((job) => (
                      <Card key={job.id} className="card-standard glass-card-content subtle-shadow flex flex-col h-full">
                          <CardHeader className="p-4 md:p-5">
                              <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full mb-2">{isLoading ? (job.typeKey === "careers.jobBoard.type.fullTime" ? fallbacks.jobTypeFull : fallbacks.jobTypePart) : <span suppressHydrationWarning>{t(job.typeKey) ?? job.typeKey}</span>}</span>
                              <CardTitle className="text-lg font-semibold">{isLoading ? `Job Title ${job.id}` : <span suppressHydrationWarning>{t(job.titleKey) ?? `Job Title ${job.id}`}</span>}</CardTitle>
                              <CardDescription className="text-sm text-muted-foreground">{isLoading ? `Job Location ${job.id}` : <span suppressHydrationWarning>{t(job.locationKey) ?? `Job Location ${job.id}`}</span>}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 md:p-5 flex-grow">
                              <p className="text-sm text-muted-foreground mb-1">{isLoading ? `Job Req ${job.id}` : <span suppressHydrationWarning>{t(job.requirementsKey) ?? `Job Req ${job.id}`}</span>}</p>
                              <p className="text-sm font-medium text-foreground">
                                  {isLoading
                                      ? (job.salaryKey ? fallbacks.jobInterpreterSal : fallbacks.jobCreatorComp) // Example fallback logic
                                      : <span suppressHydrationWarning>{job.salaryKey ? (t(job.salaryKey) ?? job.salaryKey) : (job.compensationKey ? (t(job.compensationKey) ?? job.compensationKey) : '')}</span>
                                  }
                              </p>
                          </CardContent>
                          <CardFooter className="p-4 md:p-5 mt-auto bg-muted/50">
                              <Button variant="outline" size="sm" className="w-full btn-secondary"> {/* Secondary */}
                                 {isLoading ? fallbacks.jobViewDetails : <span suppressHydrationWarning>{t("careers.jobBoard.viewDetails") ?? fallbacks.jobViewDetails}</span>}
                              </Button>
                          </CardFooter>
                      </Card>
                  ))}
              </div>
              <div className="flex justify-center mt-10 lg:mt-12">
                  <Button variant="outline" size="lg" className="btn-secondary group"> {/* Secondary */}
                      {isLoading ? fallbacks.jobViewAll : <span suppressHydrationWarning>{t("careers.jobBoard.viewAll") ?? fallbacks.jobViewAll}</span>}
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </div>
          </div>
      </section>

      {/* Success Stories Section */}
      <section id="success" className="section-padding content-bg-1">
           <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
               <div className="flex flex-col items-center justify-center space-y-4 text-center">
                   <div className="space-y-2 max-w-3xl">
                       <h2 className="heading-2 gradient-text-heading">
                           {isLoading ? fallbacks.successTitle : <span suppressHydrationWarning>{t("careers.success.title") ?? fallbacks.successTitle}</span>}
                       </h2>
                       <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                           {isLoading ? fallbacks.successDesc : <span suppressHydrationWarning>{t("careers.success.description") ?? fallbacks.successDesc}</span>}
                       </p>
                       <Button variant="outline" size="lg" className="mt-4 btn-secondary group"> {/* Secondary */}
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
