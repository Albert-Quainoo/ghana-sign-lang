"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronRight, BookOpen, Users, Briefcase, Headphones } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useState} from "react"

// Fallback texts for Home Page
const fallbacks = {
  heroBadge: "Learn Ghanaian Sign Language",
  heroTitle: "Making Communication Beautiful & Accessible",
  heroSubtitle:
    "Master Ghanaian Sign Language (GSL) through our interactive lessons, practice exercises, and comprehensive resources.",
  heroCtaStart: "Start Learning",
  heroCtaExplore: "Explore Resources",
  heroImageAlt: "Students learning sign language",
  featuredLearningTitle: "Learning Made Delightful",
  featuredLearningSubtitle: "Our platform makes learning Ghanaian Sign Language accessible and engaging for everyone.",
  stepLearnTitle: "Learn",
  stepLearnDesc: "Start with our structured lessons designed by GSL experts",
  stepLearnLongDesc:
    "Our comprehensive curriculum covers everything from basic signs to complex conversations in Ghanaian Sign Language.",
  stepLearnCta: "View Lessons",
  stepFamilyTitle: "Family Orientation",
  stepFamilyDesc: "Support for families with deaf members",
  stepFamilyLongDesc:
    "Resources and guidance for families to create inclusive environments and effectively communicate with deaf family members.",
  stepFamilyCta: "Family Resources",
  stepCareerTitle: "Career Aid",
  stepCareerDesc: "Professional development for GSL users",
  stepCareerLongDesc:
    "Career resources, job opportunities, and professional development for GSL users and interpreters.",
  stepCareerCta: "Career Resources",
  whyTitle: "Why Learn Ghanaian Sign Language?",
  whyDesc:
    "GSL is the primary sign language used by the Deaf community in Ghana, with its own unique grammar and vocabulary distinct from other sign languages.",
  whyPoint1: "Connect with over 300,000 GSL users in Ghana",
  whyPoint2: "Contribute to a more inclusive society",
  whyPoint3: "Experience Ghanaian culture through its sign language",
  whyPoint4: "Enhance your cognitive abilities and spatial awareness",
  whyImageAlt: "People communicating in Ghanaian Sign Language",
  translatorTitle: "Ghanaian Sign Language Translator",
  translatorDesc:
    "Our translator tool converts text to Ghanaian Sign Language signs, helping bridge communication gaps between hearing and deaf individuals.",
  translatorPoint1: "Convert text to GSL signs instantly",
  translatorPoint2: "Facilitate communication with deaf family members or friends",
  translatorPoint3: "Learn GSL signs for common words and phrases",
  translatorCta: "Try Translator",
  translatorImageAlt: "GSL Translator demonstration",
  featuredContentTitle: "Featured Learning Content",
  featuredContentDesc: "Explore some of our most popular Ghanaian Sign Language lessons and practice exercises.",
  featuredGreetingsAlt: "Basic greetings in GSL",
  featuredGreetingsTitle: "Basic Greetings",
  featuredGreetingsDesc: "Learn essential greetings in GSL",
  featuredGreetingsContent: "Master how to say hello, goodbye, and introduce yourself in Ghanaian Sign Language.",
  featuredFamilyAlt: "Family signs in GSL",
  featuredFamilyTitle: "Family Signs",
  featuredFamilyDesc: "Learn signs for family members",
  featuredFamilyContent: "Learn how to sign mother, father, sister, brother and other family-related terms in GSL.",
  featuredNumbersAlt: "Numbers in GSL",
  featuredNumbersTitle: "Numbers & Counting",
  featuredNumbersDesc: "Master numbers in GSL",
  featuredNumbersContent: "Learn to count and express numbers in Ghanaian Sign Language with our interactive lesson.",
  featuredViewAll: "View All Learning Content",
  joinCommunityTitle: "Join Our Community",
  joinCommunityDesc: "Subscribe to our newsletter to receive updates on new lessons and GSL resources.",
  joinCommunityPlaceholder: "Enter your email",
  joinCommunityButton: "Subscribe",
  joinCommunityPrivacy: "We respect your privacy. Unsubscribe at any time.",
}

export default function Home() {
  const { t, isLoading: isLanguageLoading} = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMessage(null);
    if (!newsletterEmail) return; // Basic check

    setNewsletterLoading(true);
    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newsletterEmail })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Subscription failed.');
        }

        setNewsletterMessage({ type: 'success', text: result.message || 'Subscribed successfully!' });
        setNewsletterEmail(''); // Clear input on success

    } catch (error: unknown) {
         const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
         setNewsletterMessage({ type: 'error', text: message });
         console.error("Newsletter submit error:", error);
    } finally {
        setNewsletterLoading(false);
    }
};

  const steps = [
    {
      id: 1,
      icon: BookOpen,
      titleKey: "home.steps.learn.title",
      descriptionKey: "home.steps.learn.description",
      longDescriptionKey: "home.steps.learn.longDescription",
      linkTextKey: "home.steps.learn.cta",
      linkHref: "/learn",
      fallbackTitle: fallbacks.stepLearnTitle,
      fallbackDesc: fallbacks.stepLearnDesc,
      fallbackLongDesc: fallbacks.stepLearnLongDesc,
      fallbackLinkText: fallbacks.stepLearnCta,
    },
    {
      id: 2,
      icon: Users,
      titleKey: "home.steps.family.title",
      descriptionKey: "home.steps.family.description",
      longDescriptionKey: "home.steps.family.longDescription",
      linkTextKey: "home.steps.family.cta",
      linkHref: "/family-orientation",
      fallbackTitle: fallbacks.stepFamilyTitle,
      fallbackDesc: fallbacks.stepFamilyDesc,
      fallbackLongDesc: fallbacks.stepFamilyLongDesc,
      fallbackLinkText: fallbacks.stepFamilyCta,
    },
    {
      id: 3,
      icon: Briefcase,
      titleKey: "home.steps.career.title",
      descriptionKey: "home.steps.career.description",
      longDescriptionKey: "home.steps.career.longDescription",
      linkTextKey: "home.steps.career.cta",
      linkHref: "/careers-scholarships",
      fallbackTitle: fallbacks.stepCareerTitle,
      fallbackDesc: fallbacks.stepCareerDesc,
      fallbackLongDesc: fallbacks.stepCareerLongDesc,
      fallbackLinkText: fallbacks.stepCareerCta,
    },
  ]

  return (
    <>
      <section className="section-padding hero-bg">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 mx-auto text-center">
              <div className="inline-flex items-center justify-center p-1 rounded-full bg-pink-100 text-pink-700">
                <div className="rounded-full bg-white p-1">
                  <Headphones className="h-4 w-4" />
                </div>
                <span className="ml-2 mr-3 text-sm font-medium">
                  {isLanguageLoading ? (
                    fallbacks.heroBadge
                  ) : (
                    <span suppressHydrationWarning>{t("home.hero.badge") ?? fallbacks.heroBadge}</span>
                  )}
                </span>
              </div>
              <h1 className="heading-1 lg:text-6xl gradient-text-hero mx-auto text-center">
                {isLanguageLoading ? (
                  fallbacks.heroTitle
                ) : (
                  <span suppressHydrationWarning>{t("home.hero.title") ?? fallbacks.heroTitle}</span>
                )}
              </h1>
              <p className="max-w-[700px] mx-auto text-center text-muted-foreground md:text-xl/relaxed text-enhanced">
                {isLanguageLoading ? (
                  fallbacks.heroSubtitle
                ) : (
                  <span suppressHydrationWarning>{t("home.hero.subtitle") ?? fallbacks.heroSubtitle}</span>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href={ user ? "/learn": "/sign-up"} scroll={true} className="w-full sm:w-auto">
                  <Button size="lg" className="btn-gradient w-full">
                  {authLoading ? "..." : (isLanguageLoading ?
          fallbacks.heroCtaStart :
                      <span suppressHydrationWarning>{t("home.hero.cta.start") ?? fallbacks.heroCtaStart}</span>
                    )}
                  </Button>
                </Link>
                <Link href="/learn?tab=resources" scroll={true} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="btn-secondary w-full">
                    {isLanguageLoading ? (
                      fallbacks.heroCtaExplore
                    ) : (
                      <span suppressHydrationWarning>{t("home.hero.cta.explore") ?? fallbacks.heroCtaExplore}</span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
              <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 rotate-3 prismatic-glow"></div>
              <Image
                src="/placeholder.svg?height=400&width=600"
                width={600}
                height={400}
                alt={isLanguageLoading ? fallbacks.heroImageAlt : (t("home.hero.imageAlt") ?? fallbacks.heroImageAlt)}
                className="rounded-xl relative shadow-lg object-cover border-4 border-background rotate-3 w-full h-auto img-duotone-pink-purple"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="featured-learning" className="section-padding content-bg-2">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
            <div className="space-y-2 max-w-3xl">
              <h2 className="heading-2 gradient-text-heading">
                {isLanguageLoading ? (
                  fallbacks.featuredLearningTitle
                ) : (
                  <span suppressHydrationWarning>
                    {t("home.featuredLearning.title") ?? fallbacks.featuredLearningTitle}
                  </span>
                )}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed text-enhanced">
                {isLanguageLoading ? (
                  fallbacks.featuredLearningSubtitle
                ) : (
                  <span suppressHydrationWarning>
                    {t("home.featuredLearning.subtitle") ?? fallbacks.featuredLearningSubtitle}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {steps.map((step) => (
              <Card
                key={step.id}
                className="card-standard glass-card-content gradient-border subtle-shadow shine-effect"
              >
                <CardHeader className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg glow-purple">
                      <step.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground purple-highlight">
                      {isLanguageLoading ? (
                        step.fallbackTitle
                      ) : (
                        <span suppressHydrationWarning>{t(step.titleKey) ?? step.fallbackTitle}</span>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-muted-foreground text-enhanced font-medium">
                    {isLanguageLoading ? (
                      step.fallbackDesc
                    ) : (
                      <span suppressHydrationWarning>{t(step.descriptionKey) ?? step.fallbackDesc}</span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-enhanced text-sm mt-2">
                    {isLanguageLoading ? (
                      step.fallbackLongDesc
                    ) : (
                      <span suppressHydrationWarning>{t(step.longDescriptionKey) ?? step.fallbackLongDesc}</span>
                    )}
                  </p>
                  <div className="mt-4">
                    <Link
                      href={step.linkHref}
                      className="text-primary hover:text-primary/80 font-medium flex items-center text-sm"
                    >
                      {isLanguageLoading ? (
                        step.fallbackLinkText
                      ) : (
                        <span suppressHydrationWarning>{t(step.linkTextKey) ?? step.fallbackLinkText}</span>
                      )}{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="why-learn" className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
            <div className="space-y-2 max-w-3xl mx-auto text-center">
              <h2 className="heading-2 gradient-text-heading mx-auto text-center">
                {isLanguageLoading ? (
                  fallbacks.whyTitle
                ) : (
                  <span suppressHydrationWarning>{t("home.why.title") ?? fallbacks.whyTitle}</span>
                )}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed text-enhanced">
                {isLanguageLoading ? (
                  fallbacks.whyDesc
                ) : (
                  <span suppressHydrationWarning>{t("home.why.desc") ?? fallbacks.whyDesc}</span>
                )}
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <ul className="grid gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-start gap-3 purple-accent">
                    <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-purple-500 flex-shrink-0 glow-purple" />
                    <span className="text-base text-muted-foreground text-enhanced">
                      {isLanguageLoading ? (
                        fallbacks[`whyPoint${num}` as keyof typeof fallbacks]
                      ) : (
                        <span suppressHydrationWarning>
                          {t(`home.why.point${num}`) ?? fallbacks[`whyPoint${num}` as keyof typeof fallbacks]}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 rotate-3 prismatic-glow"></div>
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt={isLanguageLoading ? fallbacks.whyImageAlt : (t("home.why.imageAlt") ?? fallbacks.whyImageAlt)}
                  className="rounded-xl relative shadow-lg object-cover border-4 border-background rotate-3 w-full h-auto img-duotone-pink-purple"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="translator-section" className="section-padding content-bg-2">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                <div className="absolute -inset-2 gradient-artsy-3 rounded-2xl blur-lg opacity-75 rotate-3 prismatic-glow"></div>
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt={
                    isLanguageLoading
                      ? fallbacks.translatorImageAlt
                      : (t("home.translator.imageAlt") ?? fallbacks.translatorImageAlt)
                  }
                  className="rounded-xl relative shadow-lg object-cover border-4 border-background rotate-3 w-full h-auto img-duotone-blue-purple"
                />
              </div>
            </div>
            <div className="space-y-4 lg:space-y-5 order-1 lg:order-2">
              <h2 className="heading-2 gradient-text-heading">
                {isLanguageLoading ? (
                  fallbacks.translatorTitle
                ) : (
                  <span suppressHydrationWarning>{t("home.translator.title") ?? fallbacks.translatorTitle}</span>
                )}
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed text-enhanced">
                {isLanguageLoading ? (
                  fallbacks.translatorDesc
                ) : (
                  <span suppressHydrationWarning>{t("home.translator.desc") ?? fallbacks.translatorDesc}</span>
                )}
              </p>
              <ul className="grid gap-3">
                {[1, 2, 3].map((num) => (
                  <li key={num} className="flex items-start gap-3 purple-accent">
                    <span className="mt-1 flex h-2 w-2 translate-y-1 rounded-full bg-purple-500 flex-shrink-0 glow-purple" />
                    <span className="text-base text-muted-foreground text-enhanced">
                      {isLanguageLoading ? (
                        fallbacks[`translatorPoint${num}` as keyof typeof fallbacks]
                      ) : (
                        <span suppressHydrationWarning>
                          {t(`home.translator.point${num}`) ??
                            fallbacks[`translatorPoint${num}` as keyof typeof fallbacks]}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/translator" scroll={true} className="inline-block">
                  <Button className="btn-gradient px-6 w-full sm:w-auto">
                    {isLanguageLoading ? (
                      fallbacks.translatorCta
                    ) : (
                      <span suppressHydrationWarning>{t("home.translator.cta") ?? fallbacks.translatorCta}</span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-content" className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10 lg:mb-12">
            <div className="space-y-2 max-w-3xl mx-auto text-center">
              <h2 className="heading-2 gradient-text-heading mx-auto text-center">
                {isLanguageLoading ? (
                  fallbacks.featuredContentTitle
                ) : (
                  <span suppressHydrationWarning>
                    {t("home.featuredContent.title") ?? fallbacks.featuredContentTitle}
                  </span>
                )}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed text-enhanced">
                {isLanguageLoading ? (
                  fallbacks.featuredContentDesc
                ) : (
                  <span suppressHydrationWarning>
                    {t("home.featuredContent.desc") ?? fallbacks.featuredContentDesc}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <Card className="card-standard glass-card-content gradient-border subtle-shadow shine-effect">
              <CardHeader className="p-0">
                <div className="overflow-hidden aspect-[16/9]">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    width={350}
                    height={200}
                    alt={
                      isLanguageLoading
                        ? fallbacks.featuredGreetingsAlt
                        : (t("home.featuredContent.greetings.alt") ?? fallbacks.featuredGreetingsAlt)
                    }
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 md:p-5">
                  <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors">
                    {isLanguageLoading ? (
                      fallbacks.featuredGreetingsTitle
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.featuredContent.greetings.title") ?? fallbacks.featuredGreetingsTitle}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {isLanguageLoading ? (
                      fallbacks.featuredGreetingsDesc
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.featuredContent.greetings.description") ?? fallbacks.featuredGreetingsDesc}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-5 flex-grow">
                <p className="text-sm text-muted-foreground">
                  {isLanguageLoading ? (
                    fallbacks.featuredGreetingsContent
                  ) : (
                    <span suppressHydrationWarning>
                      {t("home.featuredContent.greetings.content") ?? fallbacks.featuredGreetingsContent}
                    </span>
                  )}
                </p>
              </CardContent>
              <CardFooter className="p-4 md:p-5 mt-auto">
                <Link href="/sign-up" className="w-full">
                  <Button className="w-full btn-gradient">
                    {isLanguageLoading ? (
                      fallbacks.heroCtaStart
                    ) : (
                      <span suppressHydrationWarning>{t("home.hero.cta.start") ?? fallbacks.heroCtaStart}</span>
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="card-standard glass-card-content gradient-border subtle-shadow shine-effect">
              <CardHeader className="p-0">
                <div className="overflow-hidden aspect-[16/9]">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    width={350}
                    height={200}
                    alt={
                      isLanguageLoading
                        ? fallbacks.featuredFamilyAlt
                        : (t("home.featuredContent.family.alt") ?? fallbacks.featuredFamilyAlt)
                    }
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 md:p-5">
                  <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors">
                    {isLanguageLoading ? (
                      fallbacks.featuredFamilyTitle
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.featuredContent.family.title") ?? fallbacks.featuredFamilyTitle}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {isLanguageLoading ? (
                      fallbacks.featuredFamilyDesc
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.featuredContent.family.description") ?? fallbacks.featuredFamilyDesc}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-5 flex-grow">
                <p className="text-sm text-muted-foreground">
                  {isLanguageLoading ? (
                    fallbacks.featuredFamilyContent
                  ) : (
                    <span suppressHydrationWarning>
                      {t("home.featuredContent.family.content") ?? fallbacks.featuredFamilyContent}
                    </span>
                  )}
                </p>
              </CardContent>
              <CardFooter className="p-4 md:p-5 mt-auto">
                <Link href="/sign-up" className="w-full">
                  <Button className="w-full btn-gradient">
                    {isLanguageLoading ? (
                      fallbacks.heroCtaStart
                    ) : (
                      <span suppressHydrationWarning>{t("home.hero.cta.start") ?? fallbacks.heroCtaStart}</span>
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="card-standard glass-card-content gradient-border subtle-shadow shine-effect">
              <CardHeader className="p-0">
                <div className="overflow-hidden aspect-[16/9]">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    width={350}
                    height={200}
                    alt={
                      isLanguageLoading
                        ? fallbacks.featuredNumbersAlt
                        : (t("home.featuredContent.numbers.alt") ?? fallbacks.featuredNumbersAlt)
                    }
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 md:p-5">
                  <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors">
                    {isLanguageLoading ? (
                      fallbacks.featuredNumbersTitle
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.featuredContent.numbers.title") ?? fallbacks.featuredNumbersTitle}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {isLanguageLoading ? (
                      fallbacks.featuredNumbersDesc
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.featuredContent.numbers.description") ?? fallbacks.featuredNumbersDesc}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-5 flex-grow">
                <p className="text-sm text-muted-foreground">
                  {isLanguageLoading ? (
                    fallbacks.featuredNumbersContent
                  ) : (
                    <span suppressHydrationWarning>
                      {t("home.featuredContent.numbers.content") ?? fallbacks.featuredNumbersContent}
                    </span>
                  )}
                </p>
              </CardContent>
              <CardFooter className="p-4 md:p-5 mt-auto">
                <Link href="/sign-up" className="w-full">
                  <Button className="w-full btn-gradient">
                    {isLanguageLoading ? (
                      fallbacks.heroCtaStart
                    ) : (
                      <span suppressHydrationWarning>{t("home.hero.cta.start") ?? fallbacks.heroCtaStart}</span>
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/learn">
              <Button variant="outline" className="btn-secondary">
                {isLanguageLoading ? (
                  fallbacks.featuredViewAll
                ) : (
                  <span suppressHydrationWarning>{t("home.featuredContent.viewAll") ?? fallbacks.featuredViewAll}</span>
                )}{" "}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="join-community" className="section-padding cta-bg">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl mx-auto text-center">
              <h2 className="heading-2 text-white mx-auto text-center">
                {isLanguageLoading ? (
                  fallbacks.joinCommunityTitle
                ) : (
                  <span suppressHydrationWarning>{t("home.joinCommunity.title") ?? fallbacks.joinCommunityTitle}</span>
                )}
              </h2>
              <p className="max-w-[900px] text-white/80 md:text-xl/relaxed">
                {isLanguageLoading ? (
                  fallbacks.joinCommunityDesc
                ) : (
                  <span suppressHydrationWarning>{t("home.joinCommunity.desc") ?? fallbacks.joinCommunityDesc}</span>
                )}
              </p>
              <form
                className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-md mx-auto"
                onSubmit={handleNewsletterSubmit}
              >
                <div className="flex w-full items-center space-x-2 rounded-lg border border-white/20 bg-white/10 p-1 pr-1.5 h-12">
                  <Input
                    type="email"
                    placeholder={
                      isLanguageLoading
                        ? fallbacks.joinCommunityPlaceholder
                        : (t("home.joinCommunity.placeholder") ?? fallbacks.joinCommunityPlaceholder)
                    }
                    className="flex-grow h-full border-none bg-transparent text-white placeholder:text-white/60 focus:ring-0 focus:outline-none px-3"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={newsletterLoading}
                  />
                  <Button type="submit" className="h-full shrink-0 rounded-md bg-white px-3 text-purple-600 hover:bg-white/90 text-sm" disabled={newsletterLoading}>
                    {isLanguageLoading ? (
                      fallbacks.joinCommunityButton
                    ) : (
                      <span suppressHydrationWarning>
                        {t("home.joinCommunity.button") ?? fallbacks.joinCommunityButton}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
              {newsletterMessage && (
                <p className={`mt-3 text-sm ${newsletterMessage.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                  {newsletterMessage.text}
                  </p>
              )}
            
              <p className="text-xs text-white/60 mt-2">
                {isLanguageLoading ? (
                  fallbacks.joinCommunityPrivacy
                ) : (
                  <span suppressHydrationWarning>
                    {t("home.joinCommunity.privacy") ?? fallbacks.joinCommunityPrivacy}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
