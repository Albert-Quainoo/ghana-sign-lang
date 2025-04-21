"use client"

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Video, CheckCircle, Lock, Star, BarChart, Clock, Zap, MessageSquare, Sparkles } from "lucide-react"; // Removed unused icons
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface Lesson {
    id: number;
    titleKey: string;
    descriptionKey: string;
    durationKey: string;
    image: string;
    altKey: string;
}

interface LessonLevels {
    beginner: Lesson[];
    intermediate: Lesson[];
    advanced: Lesson[];
}

interface PracticeItem {
    id: number;
    titleKey: string;
    descriptionKey: string;
    image: string;
    altKey: string;
}

interface Resource {
    id: number;
    titleKey: string;
    descriptionKey: string;
    image: string;
    altKey: string;
    href: string;
    buttonTextKey: string;
    icon: React.ElementType;
}

interface DictionarySignData {
    definitionKey: string;
    image: string;
}

interface CourseLesson {
    id: number;
    title: string;
    description: string;
    duration: string;
    type: "video" | "interactive" | "practice";
    completed: boolean;
    locked: boolean;
}

interface CourseModule {
    id: number;
    title: string;
    description: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    duration: string;
    lessonsCount: number;
    progress: number;
    image: string;
    alt: string;
    lessons: CourseLesson[];
}

// --- Data Definitions Moved Outside Component ---
const courseModules: CourseModule[] = [
     { id: 1, title: "GSL Fundamentals", description: "Master the basics of Ghanaian Sign Language", level: "Beginner", duration: "4 weeks", lessonsCount: 4, progress: 25, image: "/placeholder.svg?height=200&width=350", alt: "GSL Fundamentals course thumbnail", lessons: [
         { id: 1, title: "Introduction to GSL", description: "Learn about the history and importance of Ghanaian Sign Language", duration: "15 min", type: "video", completed: true, locked: false },
         { id: 2, title: "Basic Greetings", description: "Learn how to say hello, goodbye, and introduce yourself", duration: "20 min", type: "interactive", completed: false, locked: false },
         { id: 3, title: "Numbers 1-10", description: "Master counting from one to ten in GSL", duration: "25 min", type: "practice", completed: false, locked: true },
         { id: 4, title: "Family Signs", description: "Learn signs for family members", duration: "30 min", type: "video", completed: false, locked: true },
     ] },
      { id: 2, title: "Everyday Conversations", description: "Learn to communicate in common daily situations", level: "Beginner", duration: "6 weeks", lessonsCount: 2, progress: 0, image: "/placeholder.svg?height=200&width=350", alt: "Everyday Conversations course thumbnail", lessons: [
         { id: 1, title: "Asking Questions", description: "Learn how to form questions in GSL", duration: "25 min", type: "interactive", completed: false, locked: false },
         { id: 2, title: "Shopping Vocabulary", description: "Essential signs for shopping and transactions", duration: "30 min", type: "video", completed: false, locked: true },
     ] },
];
const lessons: LessonLevels = {
      beginner: [
        { id: 1, titleKey: "learn.lessons.beginner.1.title", descriptionKey: "learn.lessons.beginner.1.description", durationKey: "learn.lessons.beginner.1.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.beginner.1.alt" },
        { id: 2, titleKey: "learn.lessons.beginner.2.title", descriptionKey: "learn.lessons.beginner.2.description", durationKey: "learn.lessons.beginner.2.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.beginner.2.alt" },
        { id: 3, titleKey: "learn.lessons.beginner.3.title", descriptionKey: "learn.lessons.beginner.3.description", durationKey: "learn.lessons.beginner.3.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.beginner.3.alt" },
      ],
      intermediate: [
         { id: 7, titleKey: "learn.lessons.intermediate.7.title", descriptionKey: "learn.lessons.intermediate.7.description", durationKey: "learn.lessons.intermediate.7.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.intermediate.7.alt" },
      ],
      advanced: [],
};
const practiceItems: PracticeItem[] = [
     { id: 1, titleKey: "learn.practice.1.title", descriptionKey: "learn.practice.1.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.practice.1.alt" },
     { id: 2, titleKey: "learn.practice.2.title", descriptionKey: "learn.practice.2.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.practice.2.alt" },
];
const resources: Resource[] = [
     { id: 2, titleKey: "learn.resources.community.title", descriptionKey: "learn.resources.community.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.resources.community.alt", href: "/forum", buttonTextKey: "learn.resources.community.button", icon: MessageSquare },
     { id: 3, titleKey: "learn.resources.video.title", descriptionKey: "learn.resources.video.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.resources.video.alt", href: "/videos", buttonTextKey: "learn.resources.video.button", icon: Video },
];
const mockDictionarySigns: Record<string, DictionarySignData> = {
  hello: { definitionKey: "dictionary.hello.definition", image: "/placeholder.svg?height=100&width=100&text=Hello" },
  thank: { definitionKey: "dictionary.thank.definition", image: "/placeholder.svg?height=100&width=100&text=Thank" },
  you: { definitionKey: "dictionary.you.definition", image: "/placeholder.svg?height=100&width=100&text=You" },
  please: { definitionKey: "dictionary.please.definition", image: "/placeholder.svg?height=100&width=100&text=Please" },
  help: { definitionKey: "dictionary.help.definition", image: "/placeholder.svg?height=100&width=100&text=Help" },
  learn: { definitionKey: "dictionary.learn.definition", image: "/placeholder.svg?height=100&width=100&text=Learn" },
  sign: { definitionKey: "dictionary.sign.definition", image: "/placeholder.svg?height=100&width=100&text=Sign" },
  language: { definitionKey: "dictionary.language.definition", image: "/placeholder.svg?height=100&width=100&text=Language" },
};
// --- End Data Definitions ---

export default function LearnPage() {
  const { t, isLoading } = useLanguage();
  const [activeTab, setActiveTab] = useState("lessons");
  const [dictionarySearchTerm, setDictionarySearchTerm] = useState("");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const fallbacks = {
      heroBadge: "Learn Ghanaian Sign Language",
      heroTitle: "Learn Ghanaian Sign Language",
      heroSubtitle: "Explore our comprehensive collection of GSL lessons and practice exercises, from beginner to advanced levels.",
      heroSearchPlaceholder: "Search lessons and practice exercises...",
      searchAriaLabel: "Search lessons and practice exercises",
      lessonsTab: "Lessons",
      practiceTab: "Practice",
      resourcesTab: "Resources",
      dictionaryTab: "Dictionary",
      lessonsTitle: "GSL Lessons",
      lessonsSubtitle: "Start your GSL journey with these structured lessons designed by experts.",
      viewToggleModules: "Course Modules",
      viewToggleIndividual: "Individual Lessons",
      modulesLessonsLabel: "lessons",
      modulesProgressLabel: "% complete",
      modulesButtonStart: "Start Course",
      modulesButtonContinue: "Continue Learning",
      levelBeginner: "Beginner",
      levelIntermediate: "Intermediate",
      levelAdvanced: "Advanced",
      lessonsButtonStart: "Start Lesson",
      comingSoon: "Coming Soon!",
      fundamentalsTitle: "GSL Fundamentals: Course Content",
      fundamentalsDesc: "Master the basics of Ghanaian Sign Language with our comprehensive beginner course",
      lessonTypeVideo: "video",
      lessonTypeInteractive: "interactive",
      lessonTypePractice: "practice",
      lessonStart: "Start Lesson",
      lessonReview: "Review Lesson",
      lessonUnlock: "Unlock Lesson",
      practiceTitle: "Practice Exercises",
      practiceSubtitle: "Reinforce your GSL skills with these interactive practice exercises.",
      practiceComingSoon: "Practice exercises coming soon!",
      practiceButtonStart: "Start Practice",
      resourcesTitle: "Learning Resources",
      resourcesSubtitle: "Access additional resources to enhance your GSL learning journey.",
      resourcesCommunityButton: "Join Forum",
      resourcesVideoButton: "Watch Videos",
      dictionaryTitle: "GSL Dictionary",
      dictionarySubtitle: "Look up specific signs and their definitions.",
      dictionarySearchPlaceholder: "Search for signs...",
      dictionaryNoResults: "No signs found.",
      dictionarySignAlt: "Sign language sign illustration",
      interactiveBadge: "Interactive Learning",
      interactiveTitle: "Interactive Learning Experience",
      interactiveSubtitle: "Our interactive practice modules use video recognition technology to provide real-time feedback on your signing technique.",
      interactivePoint1: "Record yourself signing and get instant feedback",
      interactivePoint2: "Compare your signs with native GSL users",
      interactivePoint3: "Track your progress over time",
      interactiveCta: "Try Interactive Practice",
      interactiveImageAlt: "Interactive practice interface",
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const validTabs = ['lessons', 'practice', 'resources', 'dictionary'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (validTabs.includes(hash)) {
            setActiveTab(hash);
        }
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    requestAnimationFrame(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', value);
        url.hash = '';
        window.history.pushState({}, '', url);
        setTimeout(() => {
            const tabsListElement = document.querySelector<HTMLElement>('[role="tablist"]');
            if (tabsListElement) {
                tabsListElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 150);
    });
  };

  const filteredCourseModules = useMemo(() => {
      if (!globalSearchTerm) return courseModules;
      const lowerSearch = globalSearchTerm.toLowerCase();
      return courseModules.filter(module => module.title.toLowerCase().includes(lowerSearch) || module.description.toLowerCase().includes(lowerSearch) || module.level.toLowerCase().includes(lowerSearch) || module.lessons.some(lesson => lesson.title.toLowerCase().includes(lowerSearch) || lesson.description.toLowerCase().includes(lowerSearch) ));
  }, [globalSearchTerm]); // Removed courseModules as it's defined outside

  const filteredIndividualLessons = useMemo(() => {
      if (!globalSearchTerm) return lessons;
      const lowerSearch = globalSearchTerm.toLowerCase();
      const filtered: LessonLevels = { beginner: [], intermediate: [], advanced: [] };
      for (const level in lessons) { const key = level as keyof LessonLevels; filtered[key] = lessons[key].filter(lesson => (t(lesson.titleKey) ?? '').toLowerCase().includes(lowerSearch) || (t(lesson.descriptionKey) ?? '').toLowerCase().includes(lowerSearch)); }
      return filtered;
  }, [globalSearchTerm, t]); // Removed lessons as it's defined outside

   const filteredPracticeItems = useMemo(() => {
       if (!globalSearchTerm) return practiceItems;
       const lowerSearch = globalSearchTerm.toLowerCase();
       return practiceItems.filter(item => (t(item.titleKey) ?? '').toLowerCase().includes(lowerSearch) || (t(item.descriptionKey) ?? '').toLowerCase().includes(lowerSearch) );
   }, [globalSearchTerm, t]); // Removed practiceItems as it's defined outside

   const filteredResources = useMemo(() => {
       if (!globalSearchTerm) return resources;
       const lowerSearch = globalSearchTerm.toLowerCase();
       return resources.filter(resource => (t(resource.titleKey) ?? '').toLowerCase().includes(lowerSearch) || (t(resource.descriptionKey) ?? '').toLowerCase().includes(lowerSearch));
   }, [globalSearchTerm, t]); // Removed resources as it's defined outside

  const filteredDictionarySigns = useMemo(() => {
    const lowerSearch = dictionarySearchTerm.toLowerCase();
    if (!lowerSearch) return Object.entries(mockDictionarySigns);
    return Object.entries(mockDictionarySigns).filter(([word]) => word.toLowerCase().includes(lowerSearch) );
  }, [dictionarySearchTerm]);


  const renderLessonCards = (level: keyof typeof lessons) => {
      const lessonsToRender = filteredIndividualLessons[level];
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {lessonsToRender.length > 0 ? ( lessonsToRender.map((lesson) => (
               <Card key={lesson.id} className="card-standard glass-card-content flex flex-col h-full">
                   <CardHeader className="p-0">
                       <div className="overflow-hidden aspect-[16/9]">
                           <Image src={lesson.image} width={350} height={200} alt={isLoading? `Image for ${lesson.titleKey}` : t(lesson.altKey) ?? `Image for ${lesson.titleKey}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/>
                       </div>
                       <div className="p-4 md:p-5">
                           <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors">{isLoading? lesson.titleKey : <span suppressHydrationWarning>{t(lesson.titleKey) ?? lesson.titleKey}</span>}</CardTitle>
                           <CardDescription className="text-sm mt-1">{isLoading? lesson.descriptionKey : <span suppressHydrationWarning>{t(lesson.descriptionKey) ?? lesson.descriptionKey}</span>}</CardDescription>
                       </div>
                   </CardHeader>
                   <CardContent className="p-4 md:p-5 flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground text-enhanced">
                         <BookOpen className="mr-1.5 h-4 w-4 text-primary/80" />
                         <span>{isLoading? lesson.durationKey : <span suppressHydrationWarning>{t(lesson.durationKey) ?? lesson.durationKey}</span>}</span>
                       </div>
                   </CardContent>
                   <CardFooter className="p-4 md:p-5 mt-auto">
                     <Button className="w-full btn-gradient">
                        {isLoading? fallbacks.lessonsButtonStart : <span suppressHydrationWarning>{t("learn.lessons.button.start") ?? fallbacks.lessonsButtonStart}</span>}
                    </Button>
                   </CardFooter>
               </Card>
            ))
          ) : (
             <p className="text-muted-foreground text-enhanced col-span-full text-center">
               {globalSearchTerm ? `No ${level} lessons found matching "${globalSearchTerm}".` : (isLoading ? fallbacks.comingSoon : <span suppressHydrationWarning>{t("common.comingSoon") ?? fallbacks.comingSoon}</span>)}
              </p>
          )}
        </div>
      );
  };


  return (
    <>
      <section className="section-padding hero-bg">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-flex items-center justify-center p-1 rounded-full bg-pink-100 text-pink-700">
                <div className="rounded-full bg-white p-1"><BookOpen className="h-4 w-4 text-pink-600"/></div>
                <span className="ml-2 mr-3 text-sm font-medium">{isLoading ? fallbacks.heroBadge : <span suppressHydrationWarning>{t("learn.hero.badge") ?? fallbacks.heroBadge}</span>}</span>
            </div>
            <h1 className="heading-1 gradient-text-hero w-full">{isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("learn.hero.title") ?? fallbacks.heroTitle}</span>}</h1>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed text-enhanced w-full">{isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("learn.hero.subtitle") ?? fallbacks.heroSubtitle}</span>}</p>
            <div className="w-full max-w-md pt-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder={isLoading ? fallbacks.heroSearchPlaceholder : t("learn.hero.searchPlaceholder") ?? fallbacks.heroSearchPlaceholder} className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm h-10" aria-label={isLoading ? fallbacks.searchAriaLabel : t("learn.hero.searchAriaLabel") ?? fallbacks.searchAriaLabel} value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} />
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding content-bg-1">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
             <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" data-orientation="horizontal">
                 <div className="flex justify-center mb-10 md:mb-10 overflow-x-auto pb-2">
                   <TabsList className="bg-muted p-1 rounded-lg h-auto flex flex-nowrap"> 
                     <TabsTrigger value="lessons" className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap">
                         {isLoading ? fallbacks.lessonsTab : <span suppressHydrationWarning>{t("learn.tabs.lessons") ?? fallbacks.lessonsTab}</span>}
                     </TabsTrigger>
                     <TabsTrigger value="practice" className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap">
                         {isLoading ? fallbacks.practiceTab : <span suppressHydrationWarning>{t("learn.tabs.practice") ?? fallbacks.practiceTab}</span>}
                     </TabsTrigger>
                     <TabsTrigger value="resources" className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap">
                         {isLoading ? fallbacks.resourcesTab : <span suppressHydrationWarning>{t("learn.tabs.resources") ?? fallbacks.resourcesTab}</span>}
                     </TabsTrigger>
                     <TabsTrigger value="dictionary" className="rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm whitespace-nowrap">
                         {isLoading ? fallbacks.dictionaryTab : <span suppressHydrationWarning>{t("learn.tabs.dictionary") ?? fallbacks.dictionaryTab}</span>}
                     </TabsTrigger>
                   </TabsList>
                 </div>

                 <TabsContent value="lessons" id="lessons" className="space-y-8">
                     <div className="space-y-3 text-center max-w-3xl mx-auto">
                         <h2 className="heading-3 gradient-text-heading">{isLoading ? fallbacks.lessonsTitle : <span suppressHydrationWarning>{t("learn.lessons.title") ?? fallbacks.lessonsTitle}</span>}</h2>
                         <p className="text-muted-foreground md:text-xl/relaxed text-enhanced">{isLoading ? fallbacks.lessonsSubtitle : <span suppressHydrationWarning>{t("learn.lessons.subtitle") ?? fallbacks.lessonsSubtitle}</span>}</p>
                     </div>
                     <Tabs defaultValue="modules" className="w-full">
                         <div className="flex justify-center mb-8"> 
                           <TabsList className="bg-muted/80 p-1 rounded-lg h-auto">
                             <TabsTrigger value="modules" className="rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">{isLoading ? fallbacks.viewToggleModules : <span suppressHydrationWarning>{t("learn.lessons.viewToggle.modules") ?? fallbacks.viewToggleModules}</span>}</TabsTrigger>
                             <TabsTrigger value="individual" className="rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">{isLoading ? fallbacks.viewToggleIndividual : <span suppressHydrationWarning>{t("learn.lessons.viewToggle.individual") ?? fallbacks.viewToggleIndividual}</span>}</TabsTrigger>
                           </TabsList>
                         </div>
                         <TabsContent value="modules" className="space-y-8">
                             <div id="modules" className="grid gap-6 md:grid-cols-2 lg:gap-8">
                                 {filteredCourseModules.map((module) => (
                                      <Card key={module.id} className="card-standard glass-card-content flex flex-col h-full overflow-hidden">
                                          <CardHeader className="p-0">
                                             <div className="overflow-hidden aspect-[16/9] relative">
                                                 <Image src={module.image} width={350} height={200} alt={module.alt} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/>
                                                 <div className="absolute top-2 right-2 bg-background/90 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                                                     {module.level === "Beginner" && <Zap className="h-3 w-3 text-green-500 mr-1" />}
                                                     {module.level === "Intermediate" && <BarChart className="h-3 w-3 text-blue-500 mr-1" />}
                                                     {module.level === "Advanced" && <Star className="h-3 w-3 text-purple-500 mr-1" />}
                                                     {module.level}
                                                 </div>
                                             </div>
                                             <div className="p-4 md:p-5">
                                                 <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors">{module.title}</CardTitle>
                                                 <CardDescription className="text-sm mt-1">{module.description}</CardDescription>
                                             </div>
                                         </CardHeader>
                                          <CardContent className="p-4 md:p-5 flex-grow space-y-3">
                                              <div className="flex items-center justify-between text-sm">
                                                  <div className="flex items-center text-muted-foreground text-enhanced"><Clock className="mr-1.5 h-4 w-4 text-primary/80" /><span>{module.duration}</span></div>
                                                  <div className="flex items-center text-muted-foreground text-enhanced"><BookOpen className="mr-1.5 h-4 w-4 text-primary/80" /><span>{module.lessonsCount} {isLoading? fallbacks.modulesLessonsLabel : t("learn.modules.lessonsLabel") ?? fallbacks.modulesLessonsLabel}</span></div>
                                              </div>
                                             <div className="w-full bg-muted rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full" style={{ width: `${module.progress}%` }}></div></div>
                                             <div className="text-xs text-muted-foreground text-enhanced text-right">{module.progress}{isLoading? fallbacks.modulesProgressLabel : t("learn.modules.progressLabel") ?? fallbacks.modulesProgressLabel}</div>
                                         </CardContent>
                                          <CardFooter className="p-4 md:p-5 mt-auto">
                                              <Button className="w-full btn-gradient">
                                                  {isLoading? (module.progress > 0 ? fallbacks.modulesButtonContinue : fallbacks.modulesButtonStart) : <span suppressHydrationWarning>{t(module.progress > 0 ? "learn.modules.button.continue" : "learn.modules.button.start") ?? (module.progress > 0 ? fallbacks.modulesButtonContinue : fallbacks.modulesButtonStart)}</span>}
                                              </Button>
                                          </CardFooter>
                                      </Card>
                                  ))}
                                 {filteredCourseModules.length === 0 && globalSearchTerm && ( <p className="text-muted-foreground text-enhanced col-span-full text-center">{`No course modules found matching "${globalSearchTerm}".`}</p> )}
                             </div>
                         </TabsContent>
                         <TabsContent value="individual">
                              <Tabs defaultValue="beginner" className="w-full">
                                 <div className="flex justify-center mb-8">
                                     <TabsList className="bg-muted/80 p-1 rounded-lg h-auto">
                                         <TabsTrigger value="beginner" className="rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">{isLoading ? fallbacks.levelBeginner : <span suppressHydrationWarning>{t("learn.lessons.level.beginner") ?? fallbacks.levelBeginner}</span>}</TabsTrigger>
                                         <TabsTrigger value="intermediate" className="rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">{isLoading ? fallbacks.levelIntermediate : <span suppressHydrationWarning>{t("learn.lessons.level.intermediate") ?? fallbacks.levelIntermediate}</span>}</TabsTrigger>
                                         <TabsTrigger value="advanced" className="rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">{isLoading ? fallbacks.levelAdvanced : <span suppressHydrationWarning>{t("learn.lessons.level.advanced") ?? fallbacks.levelAdvanced}</span>}</TabsTrigger>
                                     </TabsList>
                                 </div>
                                 <TabsContent value="beginner">{renderLessonCards("beginner")}</TabsContent>
                                 <TabsContent value="intermediate">{renderLessonCards("intermediate")}</TabsContent>
                                 <TabsContent value="advanced">{renderLessonCards("advanced")}</TabsContent>
                             </Tabs>
                         </TabsContent>
                     </Tabs>
                      <div id="video-lessons" className="pt-12 mt-12 border-t border-border/40">
                          <div className="space-y-3 max-w-3xl mx-auto mb-8">
                              <h2 className="heading-3 gradient-text-heading">{isLoading ? fallbacks.fundamentalsTitle : <span suppressHydrationWarning>{t("learn.fundamentals.title") ?? fallbacks.fundamentalsTitle}</span>}</h2>
                              <p className="text-muted-foreground text-enhanced">{isLoading ? fallbacks.fundamentalsDesc : <span suppressHydrationWarning>{t("learn.fundamentals.description") ?? fallbacks.fundamentalsDesc}</span>}</p>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                              {courseModules.length > 0 && courseModules[0].lessons.map((lesson, index) => (
                                  <Card key={lesson.id} className={cn("card-standard glass-card-content flex flex-col h-full", lesson.locked && "opacity-75")}>
                                       <CardHeader className="p-4 pb-2">
                                           <div className="flex justify-between items-start mb-2">
                                               <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-medium text-sm">{index + 1}</div>
                                               {lesson.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : lesson.locked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30"></div>}
                                           </div>
                                           <CardTitle className="text-base font-semibold">{lesson.title}</CardTitle>
                                           <CardDescription className="text-xs">{lesson.description}</CardDescription>
                                       </CardHeader>
                                       <CardContent className="px-4 pb-2 pt-0 flex-grow">
                                          <div className="flex items-center justify-between text-xs text-muted-foreground text-enhanced">
                                               <div><Clock className="mr-1 h-3.5 w-3.5" /><span>{lesson.duration}</span></div>
                                               <div>
                                                   {lesson.type === "video" && <Video className="mr-1 h-3.5 w-3.5" />}
                                                   {lesson.type === "interactive" && <Zap className="mr-1 h-3.5 w-3.5" />}
                                                   {lesson.type === "practice" && <BookOpen className="mr-1 h-3.5 w-3.5" />}
                                                   <span className="capitalize">{isLoading? lesson.type : t(`learn.lessonCard.type.${lesson.type}`) ?? lesson.type}</span>
                                               </div>
                                           </div>
                                       </CardContent>
                                       <CardFooter className="p-4 pt-2 mt-auto">
                                           <Button className={cn("w-full text-xs h-8", lesson.locked ? "btn-secondary" : "btn-gradient")} disabled={lesson.locked}>
                                                {isLoading? (lesson.completed ? fallbacks.lessonReview : lesson.locked ? fallbacks.lessonUnlock : fallbacks.lessonStart) : <span suppressHydrationWarning>{t(lesson.completed ? "learn.lessonCard.button.review" : lesson.locked ? "learn.lessonCard.button.unlock" : "learn.lessonCard.button.start") ?? (lesson.completed ? fallbacks.lessonReview : lesson.locked ? fallbacks.lessonUnlock : fallbacks.lessonStart)}</span>}
                                           </Button>
                                       </CardFooter>
                                   </Card>
                              ))}
                          </div>
                      </div>
                  </TabsContent>

                 <TabsContent value="practice" id="practice" className="space-y-8">
                     <div className="space-y-3 text-center max-w-3xl mx-auto">
                         <h2 className="heading-3 gradient-text-heading">{isLoading ? fallbacks.practiceTitle : <span suppressHydrationWarning>{t("learn.practice.title") ?? fallbacks.practiceTitle}</span>}</h2>
                         <p className="text-muted-foreground md:text-xl/relaxed text-enhanced">{isLoading ? fallbacks.practiceSubtitle : <span suppressHydrationWarning>{t("learn.practice.subtitle") ?? fallbacks.practiceSubtitle}</span>}</p>
                     </div>
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                          {filteredPracticeItems.length > 0 ? ( filteredPracticeItems.map((item) => (
                              <Card key={item.id} className="card-standard glass-card-content flex flex-col h-full">
                                 <CardHeader className="p-0">
                                      <div className="overflow-hidden aspect-[16/9]"><Image src={item.image} width={350} height={200} alt={isLoading ? `Image for ${item.titleKey}` : t(item.altKey) ?? `Image for ${item.titleKey}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/></div>
                                      <div className="p-4 md:p-5">
                                          <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors">{isLoading ? item.titleKey : <span suppressHydrationWarning>{t(item.titleKey) ?? item.titleKey}</span>}</CardTitle>
                                          <CardDescription className="text-sm mt-1">{isLoading ? item.descriptionKey : <span suppressHydrationWarning>{t(item.descriptionKey) ?? item.descriptionKey}</span>}</CardDescription>
                                      </div>
                                  </CardHeader>
                                 <CardContent className="p-4 md:p-5 flex-grow"></CardContent>
                                 <CardFooter className="p-4 md:p-5 mt-auto"><Button className="w-full btn-gradient">{isLoading ? fallbacks.practiceButtonStart : <span suppressHydrationWarning>{t("learn.practice.button.start") ?? fallbacks.practiceButtonStart}</span>}</Button></CardFooter>
                               </Card>
                           ))
                         ) : ( <p className="text-muted-foreground text-enhanced col-span-full text-center">{globalSearchTerm ? `No practice items found matching "${globalSearchTerm}".` : (isLoading ? fallbacks.practiceComingSoon : <span suppressHydrationWarning>{t("learn.practice.comingSoon") ?? fallbacks.practiceComingSoon}</span>)}</p> )}
                     </div>
                 </TabsContent>

                 <TabsContent value="resources" id="resources" className="space-y-8">
                     <div className="space-y-3 text-center max-w-3xl mx-auto">
                         <h2 className="heading-3 gradient-text-heading">{isLoading ? fallbacks.resourcesTitle : <span suppressHydrationWarning>{t("learn.resources.title") ?? fallbacks.resourcesTitle}</span>}</h2>
                         <p className="text-muted-foreground md:text-xl/relaxed text-enhanced">{isLoading ? fallbacks.resourcesSubtitle : <span suppressHydrationWarning>{t("learn.resources.subtitle") ?? fallbacks.resourcesSubtitle}</span>}</p>
                     </div>
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                         {filteredResources.map((resource) => (
                            <Card key={resource.id} className="card-standard glass-card-content flex flex-col h-full">
                               <CardHeader className="p-0">
                                    <div className="overflow-hidden aspect-[16/9]"><Image src={resource.image} width={350} height={200} alt={isLoading ? `Image for ${resource.titleKey}`: t(resource.altKey) ?? `Image for ${resource.titleKey}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"/></div>
                                     <div className="p-4 md:p-5">
                                         <CardTitle className="text-lg font-semibold group-hover:text-pink-600 transition-colors flex items-center"> <resource.icon className="w-5 h-5 mr-2 text-primary/80" />{isLoading ? resource.titleKey : <span suppressHydrationWarning>{t(resource.titleKey) ?? resource.titleKey}</span>}</CardTitle>
                                         <CardDescription className="text-sm mt-1">{isLoading ? resource.descriptionKey : <span suppressHydrationWarning>{t(resource.descriptionKey) ?? resource.descriptionKey}</span>}</CardDescription>
                                     </div>
                                 </CardHeader>
                                 <CardContent className="p-4 md:p-5 flex-grow"></CardContent>
                                 <CardFooter className="p-4 md:p-5 mt-auto">
                                   {resource.titleKey === "learn.resources.community.title" ? (
                                       <Link href="/message-board" className="w-full">
                                          <Button variant="outline" className="btn-gradient">{isLoading ? fallbacks.resourcesCommunityButton : <span suppressHydrationWarning>{t(resource.buttonTextKey) ?? fallbacks.resourcesCommunityButton}</span>}</Button>
                                      </Link>
                                   ) : (
                                      <Link href={resource.href} className="w-full">
                                          <Button variant="outline" className="btn-gradient">{isLoading ? fallbacks.resourcesVideoButton : <span suppressHydrationWarning>{t(resource.buttonTextKey) ?? fallbacks.resourcesVideoButton}</span>}</Button>
                                      </Link>
                                  )}
                                </CardFooter>
                             </Card>
                          ))}
                         {filteredResources.length === 0 && globalSearchTerm && ( <p className="text-muted-foreground text-enhanced col-span-full text-center"> {`No resources found matching "${globalSearchTerm}".`} </p> )}
                     </div>
                 </TabsContent>

                 <TabsContent value="dictionary" id="dictionary" className="space-y-8">
                     <div className="space-y-3 text-center max-w-3xl mx-auto">
                         <h2 className="heading-3 gradient-text-heading">{isLoading ? fallbacks.dictionaryTitle : <span suppressHydrationWarning>{t("learn.dictionary.title") ?? fallbacks.dictionaryTitle}</span>}</h2>
                         <p className="text-muted-foreground md:text-xl/relaxed text-enhanced">{isLoading ? fallbacks.dictionarySubtitle : <span suppressHydrationWarning>{t("learn.dictionary.subtitle") ?? fallbacks.dictionarySubtitle}</span>}</p>
                     </div>
                     <div className="w-full max-w-xl mx-auto">
                         <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input type="search" placeholder={isLoading ? fallbacks.dictionarySearchPlaceholder : t("learn.dictionary.searchPlaceholder") ?? fallbacks.dictionarySearchPlaceholder} className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm h-10" aria-label="Search dictionary signs" value={dictionarySearchTerm} onChange={(e) => setDictionarySearchTerm(e.target.value)} />
                           </div>
                       </div>
                       <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6 max-w-6xl mx-auto">
                           {filteredDictionarySigns.length > 0 ? (
                               filteredDictionarySigns.map(([word, data]: [string, DictionarySignData]) => (
                                   <Card key={word} className="card-standard glass-card-content flex flex-col min-w-0 max-w-full w-full mx-auto">
                                       <CardHeader className="p-0">
                                         <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                                           <Image
                                             src={data.image}
                                             width={120}
                                             height={120}
                                             alt={isLoading? `Sign for ${word}`: t("learn.dictionary.signAlt") ?? `Sign for ${word}`}
                                             className="object-contain"
                                           />
                                         </div>
                                       </CardHeader>
                                       <CardContent className="p-4 flex-grow min-w-0">
                                           <h3 className="font-semibold capitalize text-base mb-1 break-words truncate w-full">{word}</h3>
                                           <p className="text-sm text-muted-foreground text-enhanced mt-1 break-words w-full">{isLoading? data.definitionKey : <span suppressHydrationWarning>{t(data.definitionKey) ?? data.definitionKey}</span>}</p>
                                       </CardContent>
                                   </Card>
                               ))
                           ) : ( <p className="text-muted-foreground text-enhanced col-span-full text-center py-10"> {dictionarySearchTerm ? `No signs found matching "${dictionarySearchTerm}".` : (isLoading ? fallbacks.dictionaryNoResults : <span suppressHydrationWarning>{t("learn.dictionary.noResults") ?? fallbacks.dictionaryNoResults}</span>)} </p> )}
                       </div>
                   </TabsContent>
             </Tabs>
         </div>
      </section>
    </>
  )
}