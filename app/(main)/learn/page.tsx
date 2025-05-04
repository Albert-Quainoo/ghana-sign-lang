"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Video, BookOpen, Search, Clock, CheckCircle, Lock, Circle, ArrowLeft, TrendingUp, List, LayoutGrid, Check} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";



// --- Interfaces (Assume defined correctly) ---
interface Lesson {
  id: number
  titleKey: string
  descriptionKey: string
  durationKey: string
  image: string
  altKey: string
}
interface LessonLevels {
  beginner: Lesson[]
  intermediate: Lesson[]
  advanced: Lesson[]
}
interface PracticeItem {
  id: number
  titleKey: string
  descriptionKey: string
  image: string
  altKey: string
}
interface Resource {
  id: number
  titleKey: string
  descriptionKey: string
  image: string
  altKey: string
  href: string
  buttonTextKey: string
  icon: React.ElementType
}
interface DictionarySignData {
  definitionKey: string
  image: string
}
interface CourseLesson {
  id: number
  title: string
  description: string
  duration: string
  type: "video" | "interactive" | "practice"
  completed: boolean
  locked: boolean
}
interface CourseModule {
  id: number
  title: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  lessonsCount: number
  progress: number
  image: string
  alt: string
  lessons: CourseLesson[]
}


// --- Data (Keep your initial data definitions) ---
const initialCourseModules: CourseModule[] = [ { id: 1, title: "GSL Fundamentals", description: "Master the basics of Ghanaian Sign Language", level: "Beginner", duration: "4 weeks", lessonsCount: 4, progress: 25, image: "/placeholder.svg?height=200&width=350", alt: "GSL Fundamentals course thumbnail", lessons: [ { id: 1, title: "Introduction to GSL", description: "History and importance", duration: "15 min", type: "video", completed: true, locked: false }, { id: 2, title: "Basic Greetings", description: "Hello, goodbye, introductions", duration: "20 min", type: "interactive", completed: false, locked: false }, { id: 3, title: "Numbers 1-10", description: "Counting in GSL", duration: "25 min", type: "practice", completed: false, locked: true }, { id: 4, title: "Family Signs", description: "Signs for family members", duration: "30 min", type: "video", completed: false, locked: true }, ], }, { id: 2, title: "Everyday Conversations", description: "Communicate in common daily situations", level: "Beginner", duration: "6 weeks", lessonsCount: 2, progress: 0, image: "/placeholder.svg?height=200&width=350", alt: "Everyday Conversations course thumbnail", lessons: [ { id: 1, title: "Asking Questions", description: "Forming questions in GSL", duration: "25 min", type: "interactive", completed: false, locked: false }, { id: 2, title: "Shopping Vocabulary", description: "Signs for shopping", duration: "30 min", type: "video", completed: false, locked: true }, ], }, ];
const initialLessonsData: LessonLevels = { beginner: [ { id: 1, titleKey: "learn.lessons.beginner.1.title", descriptionKey: "learn.lessons.beginner.1.description", durationKey: "learn.lessons.beginner.1.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.beginner.1.alt" }, { id: 2, titleKey: "learn.lessons.beginner.2.title", descriptionKey: "learn.lessons.beginner.2.description", durationKey: "learn.lessons.beginner.2.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.beginner.2.alt" }, { id: 3, titleKey: "learn.lessons.beginner.3.title", descriptionKey: "learn.lessons.beginner.3.description", durationKey: "learn.lessons.beginner.3.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.beginner.3.alt" }, ], intermediate: [ { id: 7, titleKey: "learn.lessons.intermediate.7.title", descriptionKey: "learn.lessons.intermediate.7.description", durationKey: "learn.lessons.intermediate.7.duration", image: "/placeholder.svg?height=200&width=350", altKey: "learn.lessons.intermediate.7.alt" }, ], advanced: [], };
const initialPracticeItemsData: PracticeItem[] = [ { id: 1, titleKey: "learn.practice.1.title", descriptionKey: "learn.practice.1.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.practice.1.alt" }, { id: 2, titleKey: "learn.practice.2.title", descriptionKey: "learn.practice.2.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.practice.2.alt" }, ];
const initialResourcesData: Resource[] = [ { id: 2, titleKey: "learn.resources.community.title", descriptionKey: "learn.resources.community.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.resources.community.alt", href: "/message-board", buttonTextKey: "learn.resources.community.button", icon: MessageSquare }, { id: 3, titleKey: "learn.resources.video.title", descriptionKey: "learn.resources.video.description", image: "/placeholder.svg?height=200&width=350", altKey: "learn.resources.video.alt", href: "/learn?tab=resources#video-library", buttonTextKey: "learn.resources.video.button", icon: Video }, ];
const initialMockDictionarySigns: Record<string, DictionarySignData> = { hello: { definitionKey: "dictionary.hello.definition", image: "/placeholder.svg?height=100&width=100&text=Hello" }, thank: { definitionKey: "dictionary.thank.definition", image: "/placeholder.svg?height=100&width=100&text=Thank" }, you: { definitionKey: "dictionary.you.definition", image: "/placeholder.svg?height=100&width=100&text=You" }, please: { definitionKey: "dictionary.please.definition", image: "/placeholder.svg?height=100&width=100&text=Please" }, help: { definitionKey: "dictionary.help.definition", image: "/placeholder.svg?height=100&width=100&text=Help" }, learn: { definitionKey: "dictionary.learn.definition", image: "/placeholder.svg?height=100&width=100&text=Learn" }, sign: { definitionKey: "dictionary.sign.definition", image: "/placeholder.svg?height=100&width=100&text=Sign" }, language: { definitionKey: "dictionary.language.definition", image: "/placeholder.svg?height=100&width=100&text=Language" }, };

// --- Fallbacks ---
const fallbacks = { heroBadge: "Learn Ghanaian Sign Language", heroTitle: "Learn Ghanaian Sign Language", heroSubtitle: "Explore our comprehensive collection of GSL lessons and practice exercises, from beginner to advanced levels.", heroSearchPlaceholder: "Search lessons and practice exercises...", searchAriaLabel: "Search lessons and practice exercises", lessonsTab: "Lessons", practiceTab: "Practice", resourcesTab: "Resources", dictionaryTab: "Dictionary", lessonsTitle: "GSL Lessons", lessonsSubtitle: "Start your GSL journey with these structured lessons designed by experts.", viewToggleModules: "Course Modules", viewToggleIndividual: "Individual Lessons", modulesLessonsLabel: "lessons", modulesProgressLabel: "% complete", modulesButtonStart: "Start Course", modulesButtonContinue: "Continue Learning", levelBeginner: "Beginner", levelIntermediate: "Intermediate", levelAdvanced: "Advanced", lessonsButtonStart: "Start Lesson", comingSoon: "Coming Soon!", fundamentalsTitle: "GSL Fundamentals: Course Content", fundamentalsDesc: "Master the basics of Ghanaian Sign Language with our comprehensive beginner course", lessonTypeVideo: "Video", lessonTypeInteractive: "Interactive", lessonTypePractice: "Practice", lessonStart: "Start Lesson", lessonReview: "Review Lesson", lessonUnlock: "Unlock Lesson", practiceTitle: "Practice Exercises", practiceSubtitle: "Reinforce your GSL skills with these interactive practice exercises.", practiceComingSoonTitle: "More Practice Soon!", practiceComingSoon: "Practice exercises coming soon!", practiceButtonStart: "Start Practice", resourcesTitle: "Learning Resources", resourcesSubtitle: "Access additional resources to enhance your GSL learning journey.", resourcesCommunityButton: "Join Forum", resourcesVideoButton: "Watch Videos", dictionaryTitle: "GSL Dictionary", dictionarySubtitle: "Look up specific signs and their definitions.", dictionarySearchPlaceholder: "Search for signs...", dictionaryNoResults: "No signs found.", dictionarySignAlt: "Sign language sign illustration", interactiveBadge: "Interactive Learning", interactiveTitle: "Interactive Learning Experience", interactiveSubtitle: "Our interactive practice modules use video recognition technology to provide real-time feedback on your signing technique.", interactivePoint1: "Record yourself signing and get instant feedback", interactivePoint2: "Compare your signs with native GSL users", interactivePoint3: "Track your progress over time", interactiveCta: "Try Interactive Practice", interactiveImageAlt: "Interactive practice interface", modulesNoResults: "No course modules found matching your search.", lessonsNoResults: "No individual lessons found matching your search.", lessonsAdvancedComingSoon: "Advanced lessons are in development. Check back soon!", practiceNoResults: "No practice items found matching your search.", resourcesNoResults: "No resources found matching your search.", backToCourses: "Back to Courses", };

// Type for translation function
type TFunction = (key: string) => string | undefined;

// --- Main Component ---
export default function Learn() {
  const { t, isLoading: isLanguageLoading } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("lessons");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("modules");
  const [activeLevel, setActiveLevel] = useState("beginner");
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [dictionarySearch, setDictionarySearch] = useState("");

  const [filteredCourseModules, setFilteredCourseModules] = useState<CourseModule[]>(initialCourseModules);
  const [filteredLessonsData, setFilteredLessonsData] = useState<LessonLevels>(initialLessonsData);
  const [filteredPracticeItems, setFilteredPracticeItems] = useState<PracticeItem[]>(initialPracticeItemsData);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(initialResourcesData);
  const [filteredDictionarySigns, setFilteredDictionarySigns] = useState<[string, DictionarySignData][]>(Object.entries(initialMockDictionarySigns));

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && ["lessons", "practice", "resources", "dictionary"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
    setDictionarySearch("");
    setSelectedModule(null); // Reset selected module when changing tabs
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({ path: url.toString() }, '', url.toString());
  };

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    setFilteredCourseModules(
      lowerCaseQuery === "" ? initialCourseModules : initialCourseModules.filter( (module) => (module.title?.toLowerCase() ?? "").includes(lowerCaseQuery) || (module.description?.toLowerCase() ?? "").includes(lowerCaseQuery) || (module.level?.toLowerCase() ?? "").includes(lowerCaseQuery) || module.lessons.some(lesson => (lesson.title?.toLowerCase() ?? "").includes(lowerCaseQuery) || (lesson.description?.toLowerCase() ?? "").includes(lowerCaseQuery)) ) );
    const filterLessons = (lessons: Lesson[]) => lessons.filter(lesson => (t(lesson.titleKey) || lesson.titleKey || '').toLowerCase().includes(lowerCaseQuery) || (t(lesson.descriptionKey) || lesson.descriptionKey || '').toLowerCase().includes(lowerCaseQuery) );
    setFilteredLessonsData( lowerCaseQuery === "" ? initialLessonsData : { beginner: filterLessons(initialLessonsData.beginner), intermediate: filterLessons(initialLessonsData.intermediate), advanced: filterLessons(initialLessonsData.advanced), } );
    setFilteredPracticeItems( lowerCaseQuery === "" ? initialPracticeItemsData : initialPracticeItemsData.filter( (item) => (t(item.titleKey) || item.titleKey || "").toLowerCase().includes(lowerCaseQuery) || (t(item.descriptionKey) || item.descriptionKey || "").toLowerCase().includes(lowerCaseQuery) ) );
    setFilteredResources( lowerCaseQuery === "" ? initialResourcesData : initialResourcesData.filter( (resource) => (t(resource.titleKey) || resource.titleKey || "").toLowerCase().includes(lowerCaseQuery) || (t(resource.descriptionKey) || resource.descriptionKey || "").toLowerCase().includes(lowerCaseQuery) ) );
  }, [searchQuery, t]);

  useEffect(() => {
    const lowerCaseDictQuery = dictionarySearch.toLowerCase().trim();
    setFilteredDictionarySigns( lowerCaseDictQuery === "" ? Object.entries(initialMockDictionarySigns) : Object.entries(initialMockDictionarySigns).filter(([key, sign]) => key.toLowerCase().includes(lowerCaseDictQuery) || (t(sign.definitionKey) || sign.definitionKey || "").toLowerCase().includes(lowerCaseDictQuery) ) );
  }, [dictionarySearch, t]);

  const handleModuleSelect = (module: CourseModule) => { setSelectedModule(module); };
  const handleBackToModules = () => { setSelectedModule(null); };

  if (authLoading || isLanguageLoading) {
    return ( <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white"> <LoadingSpinner size="lg" /> <p className="mt-4 text-gray-600">{t("common.loading") ?? "Loading..."}</p> </div> );
  }
  if (!user) { return null; }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <section className="section-padding hero-bg relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative max-w-screen-lg mx-auto z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-pink-100 text-pink-700 text-sm font-medium"> <BookOpen className="h-4 w-4 mr-1.5 text-pink-600" /> <span suppressHydrationWarning>{t("learn.hero.badge") || fallbacks.heroBadge}</span> </div>
            <h1 className="heading-1 gradient-text-hero w-full"> <span suppressHydrationWarning>{t("learn.hero.title") || fallbacks.heroTitle}</span> </h1>
            <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg/relaxed text-enhanced w-full"> <span suppressHydrationWarning>{t("learn.hero.subtitle") || fallbacks.heroSubtitle}</span> </p>
            <div className="w-full max-w-md pt-6"> <div className="relative"> <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> <Input type="search" placeholder={t("learn.hero.searchPlaceholder") || fallbacks.heroSearchPlaceholder} className="w-full rounded-full border border-gray-200 bg-white shadow-sm pl-10 pr-4 py-2 text-sm h-11 focus:ring-2 focus:ring-pink-300 focus:border-pink-400" aria-label={t("learn.hero.searchAriaLabel") || fallbacks.searchAriaLabel} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> </div> </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center pb-8 sticky top-14 z-20 pt-4 bg-gradient-to-b from-white/90 via-white/90 to-transparent backdrop-blur-sm -mb-1">
        <div className="bg-gray-100/60 rounded-full p-1 flex space-x-1 shadow-sm border border-gray-200/50 overflow-x-auto max-w-full">
           <button onClick={() => handleTabChange("lessons")} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap`, activeTab === "lessons" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <span suppressHydrationWarning>{t("learn.tabs.lessons") || fallbacks.lessonsTab}</span> </button>
           <button onClick={() => handleTabChange("practice")} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap`, activeTab === "practice" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <span suppressHydrationWarning>{t("learn.tabs.practice") || fallbacks.practiceTab}</span> </button>
           <button onClick={() => handleTabChange("resources")} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap`, activeTab === "resources" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <span suppressHydrationWarning>{t("learn.tabs.resources") || fallbacks.resourcesTab}</span> </button>
           <button onClick={() => handleTabChange("dictionary")} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap`, activeTab === "dictionary" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <span suppressHydrationWarning>{t("learn.tabs.dictionary") || fallbacks.dictionaryTab}</span> </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 pt-8 rounded-lg shadow-sm relative">
         <div className="relative z-10">
          {activeTab === "lessons" && (
             <div className={cn(selectedModule ? "animate-in fade-in" : "")}>
                {selectedModule ? (
                   <div>
                       <button onClick={handleBackToModules} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"> <ArrowLeft className="h-4 w-4 mr-1.5"/> <span suppressHydrationWarning>{t("learn.backToCourses") ?? fallbacks.backToCourses}</span> </button>
                       <div className="text-center mb-8"> <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{selectedModule.title}</h1> <p className="text-gray-600 max-w-3xl mx-auto">{selectedModule.description}</p> </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         {selectedModule.lessons.map((lesson, index) => {
                            let lessonTypeText: string | undefined;
                            switch (lesson.type) { case 'video': lessonTypeText = t('learn.lessonCard.type.video'); break; case 'interactive': lessonTypeText = t('learn.lessonCard.type.interactive'); break; case 'practice': lessonTypeText = t('learn.lessonCard.type.practice'); break; default: lessonTypeText = lesson.type; }
                            const fallbackLessonType = lesson.type === 'video' ? fallbacks.lessonTypeVideo : lesson.type === 'interactive' ? fallbacks.lessonTypeInteractive : fallbacks.lessonTypePractice;
                            return (
                               <div key={lesson.id} className="glass-card-content rounded-xl shadow-md overflow-hidden border border-gray-100/50 flex flex-col">
                                   <div className="p-5 flex-grow">
                                       <div className="flex items-start mb-3"> <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0"> <span className="text-gray-600 font-semibold text-sm">{index + 1}</span> </div> <div className="flex-grow"> <h3 className="font-semibold text-base text-gray-800">{lesson.title}</h3> <p className="text-gray-500 text-sm mt-0.5">{lesson.description}</p> </div> <div className="ml-3 flex-shrink-0 mt-0.5"> {lesson.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : lesson.locked ? <Lock className="h-5 w-5 text-gray-400" /> : <Circle className="h-5 w-5 text-gray-300" />} </div> </div>
                                       <div className="flex items-center justify-between text-xs text-gray-500 mt-4"> <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {lesson.duration}</div> <div className="flex items-center font-medium px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: lesson.type === 'video' ? '#eff6ff' : lesson.type === 'interactive' ? '#f3e8ff' : '#f0fdf4', color: lesson.type === 'video' ? '#3b82f6' : lesson.type === 'interactive' ? '#a855f7' : '#22c55e' }}> {lesson.type === "video" && <Video className="h-3 w-3 mr-1" />} {lesson.type === "interactive" && <Check className="h-3 w-3 mr-1" />} {lesson.type === "practice" && <List className="h-3 w-3 mr-1" />} <span suppressHydrationWarning className="capitalize">{lessonTypeText ?? fallbackLessonType}</span> </div> </div>
                                   </div>
                                   <div className="p-4 border-t border-gray-100/50">
                                        {/* Corrected Button JSX */}
                                        <button className={cn(`w-full py-2 rounded-lg text-sm font-semibold transition-opacity`, lesson.locked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'text-white btn-gradient')} disabled={lesson.locked}>
                                            <span suppressHydrationWarning>
                                                {lesson.locked
                                                    ? t("learn.lessonCard.button.unlock") ?? fallbacks.lessonUnlock
                                                    : lesson.completed
                                                    ? t("learn.lessonCard.button.review") ?? fallbacks.lessonReview
                                                    : t("learn.lessonCard.button.start") ?? fallbacks.lessonStart}
                                            </span>
                                        </button>
                                    </div>
                               </div>
                           )}
                         )}
                       </div>
                   </div>
                ) : (
                    <>
                       <div className="text-center mb-10"> <h1 className="text-3xl font-bold gradient-text-heading mb-2"><span suppressHydrationWarning>{t("learn.lessons.title") || fallbacks.lessonsTitle}</span></h1> <p className="text-gray-600 max-w-2xl mx-auto text-enhanced"><span suppressHydrationWarning>{t("learn.lessons.subtitle") || fallbacks.lessonsSubtitle}</span></p> </div>
                       <div className="flex justify-center mb-10"> <div className="bg-gray-100/60 rounded-full p-1 flex space-x-1 shadow-sm border border-gray-200/50"> <button onClick={() => setViewMode("modules")} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium flex items-center transition-colors duration-150`, viewMode === "modules" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <LayoutGrid className="h-4 w-4 mr-1.5" /> <span suppressHydrationWarning>{t("learn.lessons.viewToggle.modules") || fallbacks.viewToggleModules}</span> </button> <button onClick={() => setViewMode("individual")} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium flex items-center transition-colors duration-150`, viewMode === "individual" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <List className="h-4 w-4 mr-1.5" /> <span suppressHydrationWarning>{t("learn.lessons.viewToggle.individual") || fallbacks.viewToggleIndividual}</span> </button> </div> </div>
                       {viewMode === "modules" && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {filteredCourseModules.length > 0 ? (
                                filteredCourseModules.map((module) => (
                                    <div key={module.id} className="glass-card-content rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-100/50 flex flex-col" onClick={() => handleModuleSelect(module)}>
                                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100"> <Image src={module.image} alt={module.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={module.image?.includes('placeholder.svg')} /> <div className="absolute top-3 right-3 bg-green-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-green-800 flex items-center border border-green-200/50"> <TrendingUp className="h-3 w-3 mr-1" /> {module.level} </div> </div>
                                        <div className="p-5 flex-grow flex flex-col"> <h3 className="font-semibold text-lg text-gray-800 mb-1">{module.title}</h3> <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{module.description}</p> <div className="flex items-center justify-between text-xs text-gray-500 mb-2"> <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{module.duration}</div> <div className="flex items-center"><BookOpen className="h-3.5 w-3.5 mr-1" />{module.lessonsCount} <span suppressHydrationWarning>{t("learn.modules.lessonsLabel") || fallbacks.modulesLessonsLabel}</span></div> </div> <div className="relative pt-1 mb-4"> <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200"> <div style={{ width: `${module.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-500 to-purple-500 rounded"></div> </div> <div className="flex justify-end mt-1"><span className="text-xs text-gray-500">{module.progress}<span suppressHydrationWarning>{t("learn.modules.progressLabel") || fallbacks.modulesProgressLabel}</span></span></div> </div>
                                            {/* Corrected Button JSX */}
                                            <button className="w-full py-2 rounded-lg text-sm font-semibold text-white btn-gradient mt-auto">
                                                <span suppressHydrationWarning>
                                                    {module.progress > 0 ? t("learn.modules.button.continue") || fallbacks.modulesButtonContinue : t("learn.modules.button.start") || fallbacks.modulesButtonStart}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                              ) : ( <p className="text-center text-gray-500 md:col-span-2 py-8"> <span suppressHydrationWarning> {t("learn.modules.noResults") ?? fallbacks.modulesNoResults} </span> </p> )}
                           </div>
                         )}
                         {viewMode === "individual" && (
                           <div>
                             <div className="flex justify-center mb-10"> <div className="bg-gray-100/60 rounded-full p-1 flex space-x-1 shadow-sm border border-gray-200/50"> {['beginner', 'intermediate', 'advanced'].map((level) => { let levelText: string | undefined; let fallbackLevelText: string; switch(level) { case 'beginner': levelText = t('learn.modules.level.beginner'); fallbackLevelText = fallbacks.levelBeginner; break; case 'intermediate': levelText = t('learn.modules.level.intermediate'); fallbackLevelText = fallbacks.levelIntermediate; break; case 'advanced': levelText = t('learn.modules.level.advanced'); fallbackLevelText = fallbacks.levelAdvanced; break; default: levelText = level; fallbackLevelText = level; } return <button key={level} onClick={() => setActiveLevel(level)} className={cn(`px-4 py-1.5 rounded-full text-sm font-medium flex items-center transition-colors duration-150`, activeLevel === level ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-900 hover:bg-white/50")}> <TrendingUp className={cn(`h-4 w-4 mr-1.5`, level === 'beginner' ? 'text-green-500' : level === 'intermediate' ? 'text-blue-500' : 'text-purple-500')} /> <span suppressHydrationWarning>{levelText || fallbackLevelText}</span> </button> })} </div> </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {filteredLessonsData[activeLevel as keyof LessonLevels]?.length > 0 ? ( (filteredLessonsData[activeLevel as keyof LessonLevels] || []).map((lesson) => ( <LessonCard key={lesson.id} lesson={lesson} t={t} fallbacks={fallbacks} /> )) ) : ( <div className="col-span-full flex flex-col items-center justify-center py-16 glass-card-content rounded-xl shadow-md border border-gray-100/50"> <Search className="h-12 w-12 text-gray-300 mb-4" /> <p className="text-gray-500"> <span suppressHydrationWarning> {t("learn.lessons.noResults") ?? fallbacks.lessonsNoResults} </span> </p> {activeLevel === 'advanced' && !searchQuery && ( <p className="text-gray-500 text-center max-w-md text-sm mt-2"> <span suppressHydrationWarning>{t("learn.lessons.advancedComingSoon") ?? fallbacks.lessonsAdvancedComingSoon}</span> </p> )} </div> )}
                             </div>
                           </div>
                         )}
                     </>
                 )}
               </div>
           )}

          {activeTab === "practice" && (
             <div>
                <div className="text-center mb-10"> <h1 className="text-3xl font-bold gradient-text-heading mb-2"><span suppressHydrationWarning>{t("learn.practice.title") || fallbacks.practiceTitle}</span></h1> <p className="text-gray-600 max-w-2xl mx-auto text-enhanced"><span suppressHydrationWarning>{t("learn.practice.subtitle") || fallbacks.practiceSubtitle}</span></p> </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {filteredPracticeItems.length > 0 ? ( filteredPracticeItems.map((practice) => <PracticeCard key={practice.id} practice={practice} t={t} fallbacks={fallbacks} />) ) : ( <div className="col-span-full flex flex-col items-center justify-center py-16 glass-card-content rounded-xl shadow-md border border-gray-100/50"> <Search className="h-12 w-12 text-gray-300 mb-4" /> <p className="text-gray-500"> <span suppressHydrationWarning> {t("learn.practice.noResults") ?? fallbacks.practiceNoResults} </span> </p> {!searchQuery && ( <> <h3 className="text-lg font-semibold text-gray-600 mb-2 mt-4"><span suppressHydrationWarning>{t("learn.practice.comingSoonTitle") || fallbacks.practiceComingSoonTitle}</span></h3> <p className="text-gray-500 text-center max-w-md text-sm"><span suppressHydrationWarning>{t("learn.practice.comingSoon") || fallbacks.practiceComingSoon}</span></p> </> )} </div> )}
                 </div>
              </div>
           )}

           {activeTab === "resources" && (
              <div>
                 <div className="text-center mb-10"> <h1 className="text-3xl font-bold gradient-text-heading mb-2"><span suppressHydrationWarning>{t("learn.resources.title") || fallbacks.resourcesTitle}</span></h1> <p className="text-gray-600 max-w-2xl mx-auto text-enhanced"><span suppressHydrationWarning>{t("learn.resources.subtitle") || fallbacks.resourcesSubtitle}</span></p> </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {filteredResources.length > 0 ? ( filteredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} t={t} fallbacks={fallbacks} />) ) : ( <p className="text-center text-gray-500 md:col-span-2 py-8"> <span suppressHydrationWarning> {t("learn.resources.noResults") ?? fallbacks.resourcesNoResults} </span> </p> )}
                 </div>
               </div>
           )}

           {activeTab === "dictionary" && (
              <div>
                 <div className="text-center mb-10"> <h1 className="text-3xl font-bold gradient-text-heading mb-2"><span suppressHydrationWarning>{t("learn.dictionary.title") || fallbacks.dictionaryTitle}</span></h1> <p className="text-gray-600 max-w-2xl mx-auto text-enhanced"><span suppressHydrationWarning>{t("learn.dictionary.subtitle") || fallbacks.dictionarySubtitle}</span></p> </div>
                 <div className="max-w-xl mx-auto mb-10"> <div className="relative"> <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> <Input type="search" value={dictionarySearch} onChange={(e) => setDictionarySearch(e.target.value)} placeholder={t("learn.dictionary.searchPlaceholder") || fallbacks.dictionarySearchPlaceholder} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white text-sm" /> </div> </div>
                 {filteredDictionarySigns.length === 0 ? ( <div className="text-center py-16 glass-card-content rounded-xl shadow-md border border-gray-100/50"> <Search className="h-12 w-12 mx-auto text-gray-300 mb-4"/> <p className="text-gray-500"> <span suppressHydrationWarning> {t("learn.dictionary.noResults") ?? fallbacks.dictionaryNoResults} </span> </p> </div> ) : ( <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"> {filteredDictionarySigns.map(([key, sign]) => ( <div key={key} className="glass-card-content rounded-lg shadow overflow-hidden border border-gray-100/50 hover:shadow-md transition-shadow"> <div className="p-4 flex flex-col items-center"> <div className="bg-gray-100 rounded-md p-2 mb-3 w-24 h-24 flex items-center justify-center"> <Image src={sign.image || "/placeholder.svg"} alt={`${t("learn.dictionary.signAlt") || fallbacks.dictionarySignAlt}: ${key}`} width={80} height={80} className="object-contain" unoptimized={sign.image?.includes('placeholder.svg')}/> </div> <h3 className="font-semibold text-sm text-center capitalize text-gray-800">{key}</h3> <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2"><span suppressHydrationWarning>{t(sign.definitionKey) || sign.definitionKey}</span></p> </div> </div> ))} </div> )}
               </div>
           )}

        </div>
      </div>
    </main>
  );
}


const LessonCard: React.FC<{ lesson: Lesson; t: TFunction; fallbacks: Record<string, string>}> = ({ lesson, t, fallbacks }) => (
  <div className="glass-card-content rounded-xl shadow-md overflow-hidden border border-gray-100/50 flex flex-col">
    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image src={lesson.image || "/placeholder.svg"} alt={t(lesson.altKey) || `Image for ${lesson.titleKey}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={lesson.image?.includes('placeholder.svg')} />
    </div>
    <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-gray-800 mb-1"><span suppressHydrationWarning>{t(lesson.titleKey) || lesson.titleKey}</span></h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow"><span suppressHydrationWarning>{t(lesson.descriptionKey) || lesson.descriptionKey}</span></p>
        <div className="flex items-center justify-between mb-5 mt-auto pt-2"> <div className="flex items-center text-xs text-gray-500"> <Clock className="h-3.5 w-3.5 mr-1" /> <span suppressHydrationWarning>{t(lesson.durationKey) || lesson.durationKey}</span> </div> </div>
        <button className="w-full py-2 rounded-lg text-sm font-semibold text-white btn-gradient"> <span suppressHydrationWarning>{t("learn.lessons.button.start") || fallbacks.lessonsButtonStart}</span> </button>
    </div>
  </div>
);

const PracticeCard: React.FC<{ practice: PracticeItem; t: TFunction; fallbacks: Record<string, string>}> = ({ practice, t, fallbacks }) => (
   <div className="glass-card-content rounded-xl shadow-md overflow-hidden border border-gray-100/50 flex flex-col">
     <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
         <Image src={practice.image || "/placeholder.svg"} alt={t(practice.altKey) || `Image for ${practice.titleKey}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={practice.image?.includes('placeholder.svg')} />
     </div>
     <div className="p-5 flex-grow flex flex-col">
         <h3 className="font-semibold text-lg text-gray-800 mb-1"><span suppressHydrationWarning>{t(practice.titleKey) || practice.titleKey}</span></h3>
         <p className="text-gray-600 text-sm mb-5 line-clamp-2 flex-grow"><span suppressHydrationWarning>{t(practice.descriptionKey) || practice.descriptionKey}</span></p>
         <button className="w-full py-2 rounded-lg text-sm font-semibold text-white btn-gradient mt-auto"> <span suppressHydrationWarning>{t("learn.practice.button.start") || fallbacks.practiceButtonStart}</span> </button>
     </div>
   </div>
);

const ResourceCard: React.FC<{ resource: Resource; t: TFunction; fallbacks: Record<string, string>}> = ({ resource, t}) => (
   <div className="glass-card-content rounded-xl shadow-md overflow-hidden border border-gray-100/50 flex flex-col">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <Image src={resource.image || "/placeholder.svg"} alt={t(resource.altKey) || `Image for ${resource.titleKey}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={resource.image?.includes('placeholder.svg')} />
      </div>
      <div className="p-5 flex-grow flex flex-col">
         <div className="flex items-center mb-1">
           <resource.icon className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0" />
           <h3 className="font-semibold text-lg text-gray-800"><span suppressHydrationWarning>{t(resource.titleKey) || resource.titleKey}</span></h3>
         </div>
         <p className="text-gray-600 text-sm mb-5 line-clamp-2 flex-grow"><span suppressHydrationWarning>{t(resource.descriptionKey) || resource.descriptionKey}</span></p>
         <Link href={resource.href} className="block w-full py-2 rounded-lg text-sm font-semibold text-white btn-gradient text-center mt-auto">
           <span suppressHydrationWarning>{t(resource.buttonTextKey) || resource.buttonTextKey}</span>
         </Link>
      </div>
   </div>
);