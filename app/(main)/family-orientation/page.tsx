"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Sparkles, ChevronRight, BookOpen, Video } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

// Fallback Texts
const fallbacks = {
    heroTitle: "Family Orientation",
    heroSubtitle: "Support for families with deaf members to create inclusive environments and effectively communicate.",
    supportingTitle: "Supporting Your Deaf Family Member",
    supportingDesc: "Creating a supportive and inclusive environment is essential for the well-being and development of deaf family members.",
    supportingPoint1: "Learn basic GSL signs to establish fundamental communication",
    supportingPoint2: "Create visual cues and signals throughout your home",
    supportingPoint3: "Encourage all family members to participate in GSL learning",
    supportingImageAlt: "Family communicating with sign language",
    parentsTitle: "For Parents",
    parentsDesc: "Resources to help parents communicate effectively with deaf children and create inclusive family environments.",
    parentsCard1Title: "Communication Basics for Parents",
    parentsCard1Desc: "Essential GSL signs for parents",
    parentsCard1Content: "Learn the fundamental signs that will help you communicate effectively with your deaf child.",
    parentsCard1Time: "15 min read",
    parentsCard1Button: "Read Guide",
    parentsCard1Alt: "Parent learning sign language",
    parentsCard2Title: "Creating an Inclusive Home",
    parentsCard2Desc: "Tips for a deaf-friendly environment",
    parentsCard2Content: "Simple adjustments to make your home more accessible and comfortable for deaf family members.",
    parentsCard2Time: "10 min read",
    parentsCard2Button: "View Tips",
    parentsCard2Alt: "Inclusive home environment",
    childrenTitle: "For Children",
    childrenDesc: "Fun and engaging resources to help children learn Ghanaian Sign Language through play and interactive activities.",
    childrenCard1Title: "Fun GSL Games for Kids",
    childrenCard1Desc: "Interactive learning activities",
    childrenCard1Content: "Engaging games that help children learn Ghanaian Sign Language through play.",
    childrenCard1Time: "20 min activity",
    childrenCard1Button: "Start Playing",
    childrenCard1Alt: "Children playing sign language games",
    childrenCard2Title: "Animated GSL Stories",
    childrenCard2Desc: "Visual storytelling for young learners",
    childrenCard2Content: "Watch animated stories that incorporate Ghanaian Sign Language, perfect for young learners.",
    childrenCard2Time: "5 min video",
    childrenCard2Button: "Watch Video",
    childrenCard2Alt: "Animated sign language story",
    supportTitle: "Support Network",
    supportDesc: "Connect with other families and professionals to share experiences and get expert guidance.",
    supportCard1Title: "Local Support Groups",
    supportCard1Desc: "Connect with other families",
    supportCard1Content: "Join local support groups where families with deaf members share experiences and advice.",
    supportCard1Point1: "Regular meetups in major Ghanaian cities",
    supportCard1Point2: "Online community forums for remote support",
    supportCard1Point3: "Shared resources and learning materials",
    supportCard1Button: "Find Groups",
    supportCard2Title: "Professional Guidance",
    supportCard2Desc: "Expert advice and counseling",
    supportCard2Content: "Access professional guidance from GSL experts, educators, and counselors specialized in deaf communication.",
    supportCard2Point1: "One-on-one consultation sessions",
    supportCard2Point2: "Family communication strategy development",
    supportCard2Point3: "Progress tracking and personalized advice",
    supportCard2Button: "Book Consultation",
    ctaTitle: "Start Your Family's GSL Journey Today",
    ctaDesc: "Begin learning Ghanaian Sign Language together and create a more inclusive family environment.",
    ctaButton1: "Explore Learning Resources",
    ctaButton2: "Contact Support Team",
};

export default function FamilyOrientationPage() {
  const { t, isLoading } = useLanguage(); // Use hook

  // Data using keys
  const parentResources = [
    { id: 1, titleKey: "family.parents.card1.title", descriptionKey: "family.parents.card1.description", contentKey: "family.parents.card1.content", timeKey: "family.parents.card1.time", buttonKey: "family.parents.card1.button", icon: BookOpen, image: "/placeholder.svg?height=200&width=350", altKey: "family.parents.card1.alt", fallbackButton: fallbacks.parentsCard1Button },
    { id: 2, titleKey: "family.parents.card2.title", descriptionKey: "family.parents.card2.description", contentKey: "family.parents.card2.content", timeKey: "family.parents.card2.time", buttonKey: "family.parents.card2.button", icon: Heart, image: "/placeholder.svg?height=200&width=350", altKey: "family.parents.card2.alt", fallbackButton: fallbacks.parentsCard2Button },
  ];
  const childrenResources = [
    { id: 1, titleKey: "family.children.card1.title", descriptionKey: "family.children.card1.description", contentKey: "family.children.card1.content", timeKey: "family.children.card1.time", buttonKey: "family.children.card1.button", icon: Sparkles, image: "/placeholder.svg?height=200&width=350", altKey: "family.children.card1.alt", fallbackButton: fallbacks.childrenCard1Button },
    { id: 2, titleKey: "family.children.card2.title", descriptionKey: "family.children.card2.description", contentKey: "family.children.card2.content", timeKey: "family.children.card2.time", buttonKey: "family.children.card2.button", icon: Video, image: "/placeholder.svg?height=200&width=350", altKey: "family.children.card2.alt", fallbackButton: fallbacks.childrenCard2Button },
  ];
  const supportNetwork = [
    { id: 1, titleKey: "family.support.card1.title", descriptionKey: "family.support.card1.description", contentKey: "family.support.card1.content", pointsKeys: ["family.support.card1.point1", "family.support.card1.point2", "family.support.card1.point3"], buttonKey: "family.support.card1.button", fallbackButton: fallbacks.supportCard1Button },
    { id: 2, titleKey: "family.support.card2.title", descriptionKey: "family.support.card2.description", contentKey: "family.support.card2.content", pointsKeys: ["family.support.card2.point1", "family.support.card2.point2", "family.support.card2.point3"], buttonKey: "family.support.card2.button", fallbackButton: fallbacks.supportCard2Button },
  ];


  return (
    <>
      {/* Hero Section */}
      <section className="section-padding hero-bg">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero">
                {isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("family.hero.title") ?? fallbacks.heroTitle}</span>}
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                {isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("family.hero.subtitle") ?? fallbacks.heroSubtitle}</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supporting Section */}
      <section className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4 lg:space-y-5">
              <h2 className="heading-2 gradient-text-heading">
                {isLoading ? fallbacks.supportingTitle : <span suppressHydrationWarning>{t("family.supporting.title") ?? fallbacks.supportingTitle}</span>}
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed">
                {isLoading ? fallbacks.supportingDesc : <span suppressHydrationWarning>{t("family.supporting.description") ?? fallbacks.supportingDesc}</span>}
              </p>
              <ul className="grid gap-3">
                 {[1, 2, 3].map(num => (
                   <li key={num} className="flex items-start gap-3">
                     <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full glow-primary bg-pink-500 flex-shrink-0" />
                     <span className="text-base text-muted-foreground">
                       {isLoading ? fallbacks[`supportingPoint${num}` as keyof typeof fallbacks] : <span suppressHydrationWarning>{t(`family.supporting.point${num}`) ?? fallbacks[`supportingPoint${num}` as keyof typeof fallbacks]}</span>}
                     </span>
                   </li>
                 ))}
              </ul>
            </div>
            <div className="flex justify-center">
               <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                 <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 rotate-3 prismatic-glow"></div>
                 <Image src="/placeholder.svg?height=400&width=600" width={600} height={400} priority alt={isLoading ? fallbacks.supportingImageAlt : t("family.supporting.imageAlt") ?? fallbacks.supportingImageAlt} className="rounded-xl relative shadow-lg object-cover border-4 border-background rotate-3 w-full h-auto img-duotone-pink-purple"/>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources for Parents Section */}
      <section id="parents" className="section-padding content-bg-2">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
            <div className="space-y-2 max-w-3xl">
              <h2 className="heading-2 gradient-text-heading">
                {isLoading ? fallbacks.parentsTitle : <span suppressHydrationWarning>{t("family.parents.title") ?? fallbacks.parentsTitle}</span>}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                {isLoading ? fallbacks.parentsDesc : <span suppressHydrationWarning>{t("family.parents.description") ?? fallbacks.parentsDesc}</span>}
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {parentResources.map((resource) => (
              <Card key={resource.id} className="card-standard glass-card-content gradient-border subtle-shadow flex flex-col h-full shine-effect">
                <CardHeader className="p-0">
                  <div className="overflow-hidden aspect-[16/9]"><Image src={resource.image} width={350} height={200} alt={isLoading ? `Parent resource ${resource.id}` : t(resource.altKey) ?? `Parent resource ${resource.id}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 img-duotone-blue-purple"/></div>
                  <div className="p-4 md:p-5">
                    <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors flex items-center">
                       <resource.icon className="w-5 h-5 mr-2 text-primary/80 glow-primary" />
                       {isLoading ? `Parent Title ${resource.id}` : <span suppressHydrationWarning>{t(resource.titleKey) ?? `Parent Title ${resource.id}`}</span>}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">{isLoading ? `Parent Desc ${resource.id}` : <span suppressHydrationWarning>{t(resource.descriptionKey) ?? `Parent Desc ${resource.id}`}</span>}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-5 flex-grow">
                  <p className="text-sm text-muted-foreground">{isLoading ? `Parent Content ${resource.id}` : <span suppressHydrationWarning>{t(resource.contentKey) ?? `Parent Content ${resource.id}`}</span>}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                     <resource.icon className="mr-1 h-3.5 w-3.5 text-primary/70 glow-primary" />
                    <span>{isLoading ? "Time" : <span suppressHydrationWarning>{t(resource.timeKey) ?? "Time"}</span>}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 md:p-5 mt-auto">
                  <Button className="w-full btn-gradient"> {/* Primary */}
                    {isLoading ? resource.fallbackButton : <span suppressHydrationWarning>{t(resource.buttonKey) ?? resource.fallbackButton}</span>}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources for Children Section */}
      <section id="children" className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
             <div className="space-y-2 max-w-3xl">
               <h2 className="heading-2 gradient-text-heading">
                  {isLoading ? fallbacks.childrenTitle : <span suppressHydrationWarning>{t("family.children.title") ?? fallbacks.childrenTitle}</span>}
               </h2>
               <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  {isLoading ? fallbacks.childrenDesc : <span suppressHydrationWarning>{t("family.children.description") ?? fallbacks.childrenDesc}</span>}
               </p>
             </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
             {childrenResources.map((resource) => (
               <Card key={resource.id} className="card-standard glass-card-content gradient-border subtle-shadow flex flex-col h-full shine-effect">
                 <CardHeader className="p-0">
                   <div className="overflow-hidden aspect-[16/9]"><Image src={resource.image} width={350} height={200} alt={isLoading ? `Child resource ${resource.id}` : t(resource.altKey) ?? `Child resource ${resource.id}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 img-duotone-pink-purple"/></div>
                   <div className="p-4 md:p-5">
                     <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors flex items-center">
                        <resource.icon className="w-5 h-5 mr-2 text-primary/80 glow-primary" />
                        {isLoading ? `Child Title ${resource.id}` : <span suppressHydrationWarning>{t(resource.titleKey) ?? `Child Title ${resource.id}`}</span>}
                     </CardTitle>
                     <CardDescription className="text-sm mt-1">{isLoading ? `Child Desc ${resource.id}` : <span suppressHydrationWarning>{t(resource.descriptionKey) ?? `Child Desc ${resource.id}`}</span>}</CardDescription>
                   </div>
                 </CardHeader>
                 <CardContent className="p-4 md:p-5 flex-grow">
                   <p className="text-sm text-muted-foreground">{isLoading ? `Child Content ${resource.id}` : <span suppressHydrationWarning>{t(resource.contentKey) ?? `Child Content ${resource.id}`}</span>}</p>
                   <div className="mt-3 flex items-center text-xs text-muted-foreground">
                      <resource.icon className="mr-1 h-3.5 w-3.5 text-primary/70 glow-primary" />
                     <span>{isLoading ? "Time/Activity" : <span suppressHydrationWarning>{t(resource.timeKey) ?? "Time/Activity"}</span>}</span>
                   </div>
                 </CardContent>
                 <CardFooter className="p-4 md:p-5 mt-auto">
                   <Button className="w-full btn-gradient"> {/* Primary */}
                     {isLoading ? resource.fallbackButton : <span suppressHydrationWarning>{t(resource.buttonKey) ?? resource.fallbackButton}</span>}
                   </Button>
                 </CardFooter>
               </Card>
             ))}
           </div>
         </div>
      </section>

      {/* Support Network Section */}
      <section id="support" className="section-padding content-bg-2">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
             <div className="space-y-2 max-w-3xl">
               <h2 className="heading-2 gradient-text-heading">
                  {isLoading ? fallbacks.supportTitle : <span suppressHydrationWarning>{t("family.support.title") ?? fallbacks.supportTitle}</span>}
               </h2>
               <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  {isLoading ? fallbacks.supportDesc : <span suppressHydrationWarning>{t("family.support.description") ?? fallbacks.supportDesc}</span>}
               </p>
             </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
             {supportNetwork.map((item) => (
               <Card key={item.id} className="card-standard glass-card-content shine-effect subtle-shadow">
                 <CardHeader>
                   <CardTitle className="text-xl font-semibold">{isLoading ? `Support Title ${item.id}` : <span suppressHydrationWarning>{t(item.titleKey) ?? `Support Title ${item.id}`}</span>}</CardTitle>
                   <CardDescription>{isLoading ? `Support Desc ${item.id}` : <span suppressHydrationWarning>{t(item.descriptionKey) ?? `Support Desc ${item.id}`}</span>}</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <p className="mb-4 text-sm text-muted-foreground">{isLoading ? `Support Content ${item.id}` : <span suppressHydrationWarning>{t(item.contentKey) ?? `Support Content ${item.id}`}</span>}</p>
                   <ul className="space-y-2">
                     {item.pointsKeys.map((pointKey, index) => (
                       <li key={index} className="flex items-start gap-2">
                         <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-purple-400 glow-purple flex-shrink-0" />
                         <span className="text-sm text-muted-foreground">{isLoading ? `Point ${index+1}` : <span suppressHydrationWarning>{t(pointKey) ?? `Point ${index+1}`}</span>}</span>
                       </li>
                     ))}
                   </ul>
                 </CardContent>
                 <CardFooter>
                   <Button variant="outline" className="w-full sm:w-auto btn-secondary"> {/* Secondary */}
                      {isLoading ? item.fallbackButton : <span suppressHydrationWarning>{t(item.buttonKey) ?? item.fallbackButton}</span>}
                   </Button>
                 </CardFooter>
               </Card>
             ))}
           </div>
         </div>
      </section>

      {/* Start Your Journey section */}
      <section className="section-padding cta-bg">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="heading-2 text-white">
                 {isLoading ? fallbacks.ctaTitle : <span suppressHydrationWarning>{t("family.cta.title") ?? fallbacks.ctaTitle}</span>}
              </h2>
              <p className="max-w-[900px] text-white/80 md:text-xl/relaxed">
                 {isLoading ? fallbacks.ctaDesc : <span suppressHydrationWarning>{t("family.cta.description") ?? fallbacks.ctaDesc}</span>}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/learn" scroll={true}>
                  <Button size="lg" className="btn-gradient"> {/* Secondary */}
                     {isLoading ? fallbacks.ctaButton1 : <span suppressHydrationWarning>{t("family.cta.button1") ?? fallbacks.ctaButton1}</span>}
                  </Button>
                </Link>
                <Link href="/contact" scroll={true}>
                  <Button variant="outline" size="lg" className="btn-secondary"> {/* Secondary */}
                     {isLoading ? fallbacks.ctaButton2 : <span suppressHydrationWarning>{t("family.cta.button2") ?? fallbacks.ctaButton2}</span>}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}