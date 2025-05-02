"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Users,
  BookOpen,
  Search,
  PlusCircle,
  ThumbsUp,
  MessageCircleIcon as MessageIcon,
  Clock,
  Filter,
  ChevronRight,
  Volume2,
  Eye,
  Menu,
  X,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-mobile"

const mockDiscussions = [
  {
    id: 1,
    title: "Tips for learning finger spelling faster?",
    category: "learning",
    author: "Kofi Mensah",
    authorAvatar: "KM",
    date: "2 days ago",
    replies: 8,
    likes: 12,
    excerpt:
      "I'm struggling with finger spelling speed. Any tips or exercises that helped you improve your speed and accuracy?",
    tags: ["Beginner", "Finger Spelling", "Practice"],
  },
  {
    id: 2,
    title: "Resources for teaching GSL to young children",
    category: "support",
    author: "Ama Owusu",
    authorAvatar: "AO",
    date: "1 week ago",
    replies: 15,
    likes: 24,
    excerpt:
      "I'm looking for age-appropriate resources to teach my 5-year-old GSL. Any recommendations for games, videos, or activities?",
    tags: ["Children", "Teaching", "Resources"],
  },
  {
    id: 3,
    title: "Difference between GSL and ASL signs for common phrases",
    category: "learning",
    author: "Kwame Takyi",
    authorAvatar: "KT",
    date: "3 days ago",
    replies: 6,
    likes: 9,
    excerpt:
      "I previously learned some ASL and now I'm learning GSL. I've noticed some differences in common signs. Can someone explain the major differences?",
    tags: ["Intermediate", "Comparison", "ASL"],
  },
  {
    id: 4,
    title: "Meetup for GSL practice in Accra - Weekly sessions",
    category: "support",
    author: "Nana Ama",
    authorAvatar: "NA",
    date: "5 days ago",
    replies: 22,
    likes: 35,
    excerpt:
      "We're organizing weekly practice sessions in Accra for GSL learners of all levels. Join us every Saturday at the community center!",
    tags: ["Meetup", "Practice", "Accra"],
  },
  {
    id: 5,
    title: "How to express complex emotions in GSL?",
    category: "learning",
    author: "Yaw Mensah",
    authorAvatar: "YM",
    date: "1 day ago",
    replies: 4,
    likes: 7,
    excerpt:
      "I'm finding it challenging to express nuanced emotions in GSL. Are there specific facial expressions or modifiers that help convey subtle feelings?",
    tags: ["Advanced", "Emotions", "Expressions"],
  },
  {
    id: 6,
    title: "Support group for parents of deaf children",
    category: "support",
    author: "Abena Koranteng",
    authorAvatar: "AK",
    date: "2 weeks ago",
    replies: 18,
    likes: 29,
    excerpt:
      "I'm starting a support group for parents of deaf children. We'll share experiences, resources, and tips for creating an inclusive home environment.",
    tags: ["Parents", "Support Group", "Community"],
  },
]

// Fallback Texts
const fallbacks = {
  title: "Community Message Board",
  subtitle: "Connect with other GSL learners, share experiences, and get support from our community.",
  sidebarJoinTitle: "Join the Conversation",
  sidebarJoinDesc: "Share your questions and experiences",
  sidebarJoinButton: "New Discussion",
  sidebarTagsTitle: "Popular Tags",
  sidebarAccessTitle: "Accessibility Options",
  searchPlaceholder: "Search discussions...",
  search: "Search",
  filter: "Filter",
  sortBy: "Sort By",
  mostRecent: "Most Recent",
  mostPopular: "Most Popular",
  filterByTags: "Filter By Tags",
  applyFilters: "Apply Filters",
  tabsAll: "All Discussions",
  tabsLearning: "Learning Questions",
  tabsSupport: "Community Support",
  noDiscussionsTitle: "No discussions found",
  noDiscussionsDesc: "Try adjusting your search or filters",
  noLearningTitle: "No learning questions found",
  noLearningDesc: "Be the first to ask a question!",
  noSupportTitle: "No support discussions found",
  noSupportDesc: "Start a new support thread!",
  newDiscussionSidebarTitle: "Create Discussion",
  newDiscussionSidebarDesc: "Share your thoughts with the community",
  newDiscussionSidebarGuideTitle: "Guidelines:",
  newDiscussionSidebarGuide1: "Be respectful and inclusive",
  newDiscussionSidebarGuide2: "Use clear, descriptive titles",
  newDiscussionSidebarGuide3: "Add relevant tags to help others find your post",
  newDiscussionSidebarGuide4: "Check if your question has been asked before",
  newDiscussionFormTitle: "New Discussion",
  newDiscussionFormTitleLabel: "Title",
  newDiscussionFormTitlePlaceholder: "Enter a descriptive title for your discussion",
  newDiscussionFormCatLabel: "Category",
  newDiscussionFormCatLearning: "Learning Question",
  newDiscussionFormCatSupport: "Community Support",
  newDiscussionFormContentLabel: "Content",
  newDiscussionFormContentPlaceholder: "Describe your question or share your thoughts in detail...",
  newDiscussionFormTagsLabel: "Tags",
  newDiscussionFormSubmit: "Post Discussion",
  ctaTitle: "Join Our Community",
  ctaDesc: "Sign up to participate in discussions, ask questions, and connect with other GSL learners.",
  ctaButton1: "Create an Account",
  ctaButton2: "Sign In",
  cancel: "Cancel",
  previous: "Previous",
  next: "Next",
  showSidebar: "Show Sidebar",
  hideSidebar: "Hide Sidebar",
}

// --- Discussion Card Component ---
function DiscussionCard({ discussion }: { discussion: (typeof mockDiscussions)[0] }) {
  const isMobile = useMediaQuery("(max-width: 640px)")

  return (
    <Card className="card-standard glass-card-content overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
            <Link href={`/message-board/${discussion.id}`} className="hover:underline">
              <h3 className="text-base sm:text-lg font-semibold line-clamp-2">{discussion.title}</h3>
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{discussion.date}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
            {discussion.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {discussion.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-accent/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full truncate max-w-[120px]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarFallback className="text-xs sm:text-sm">{discussion.authorAvatar}</AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                {discussion.author}
              </span>
            </div>
            <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs">{discussion.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs">{discussion.replies}</span>
              </div>
              <Link href={`/message-board/${discussion.id}`}>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 sm:h-8 sm:px-3 flex items-center gap-1">
                  View <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
// --- End Discussion Card ---

// --- Sidebar Component ---
function Sidebar({
  isLoading,
  t,
  selectedTags,
  toggleTag,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: {
  isLoading: boolean
  t: any
  selectedTags: string[]
  toggleTag: (tag: string) => void
  isMobileSidebarOpen: boolean
  setIsMobileSidebarOpen: (open: boolean) => void
}) {
  const isMobile = useMediaQuery("(max-width: 1023px)")

  if (isMobile && !isMobileSidebarOpen) return null

  return (
    <div
      className={cn(
        "lg:col-span-1 space-y-4 sm:space-y-6 min-w-0",
        isMobile &&
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 pt-16 overflow-y-auto lg:static lg:p-0 lg:pt-0 lg:z-0 lg:bg-transparent lg:backdrop-blur-none",
      )}
    >
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      )}

      <Card className="card-standard glass-card-content">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {isLoading ? (
              fallbacks.sidebarJoinTitle
            ) : (
              <span suppressHydrationWarning>{t("community.sidebar.join.title") ?? fallbacks.sidebarJoinTitle}</span>
            )}
          </CardTitle>
          <CardDescription>
            {isLoading ? (
              fallbacks.sidebarJoinDesc
            ) : (
              <span suppressHydrationWarning>
                {t("community.sidebar.join.description") ?? fallbacks.sidebarJoinDesc}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full btn-gradient mb-4"
            onClick={() => {
              document.getElementById("new-discussion")?.scrollIntoView({ behavior: "smooth" })
              if (isMobile) setIsMobileSidebarOpen(false)
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {isLoading ? (
              fallbacks.sidebarJoinButton
            ) : (
              <span suppressHydrationWarning>{t("community.sidebar.join.button") ?? fallbacks.sidebarJoinButton}</span>
            )}
          </Button>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {isLoading ? (
                fallbacks.sidebarTagsTitle
              ) : (
                <span suppressHydrationWarning>{t("community.sidebar.tags.title") ?? fallbacks.sidebarTagsTitle}</span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Beginner", "Practice", "Resources", "Teaching", "Community"].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs rounded-full",
                    selectedTags.includes(tag) && "bg-primary/10 border-primary text-primary",
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="card-standard glass-card-content">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {isLoading ? (
              fallbacks.sidebarAccessTitle
            ) : (
              <span suppressHydrationWarning>
                {t("community.sidebar.accessibility.title") ?? fallbacks.sidebarAccessTitle}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">High Contrast</span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Text-to-Speech</span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Font Size</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                A-
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                A+
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// --- End Sidebar Component ---

export default function MessageBoardPage() {
  const { t, isLoading } = useLanguage()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDiscussions, setFilteredDiscussions] = useState(mockDiscussions)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("")
  const [newDiscussionContent, setNewDiscussionContent] = useState("")
  const [newDiscussionCategory, setNewDiscussionCategory] = useState<"learning" | "support" | "">("")
  const [newDiscussionTags, setNewDiscussionTags] = useState<string[]>([])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isMobile = useMediaQuery("(max-width: 1023px)")

  useEffect(() => {
    let filtered = [...mockDiscussions] // Start with a fresh copy
    const query = searchQuery.toLowerCase()
    if (query) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.excerpt.toLowerCase().includes(query) ||
          d.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }
    if (activeTab !== "all") {
      filtered = filtered.filter((d) => d.category === activeTab)
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((d) => d.tags.some((tag) => selectedTags.includes(tag)))
    }
    if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const parseDate = (ds: string) => {
          if (ds === "Just now") return Date.now()
          if (ds.includes("day")) return Date.now() - Number.parseInt(ds) * 86400000
          if (ds.includes("week")) return Date.now() - Number.parseInt(ds) * 604800000
          return 0
        }
        return parseDate(b.date) - parseDate(a.date)
      })
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => b.likes - a.likes)
    }
    setFilteredDiscussions(filtered) // Set the final filtered list
  }, [searchQuery, activeTab, selectedTags, sortBy]) // Re-run when filters change

  const handleSearch = () => {
    /* Logic moved to useEffect */
  }
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
    setShowFilters(false)
  }
  const toggleNewDiscussionTag = (tag: string) => {
    setNewDiscussionTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }
  const applyFilters = () => {
    setShowFilters(false)
    /* Logic moved to useEffect */
  }

  const createNewDiscussion = () => {
    const newDiscussion = {
      id: Date.now(),
      title: newDiscussionTitle,
      category: newDiscussionCategory as "learning" | "support",
      author: "You",
      authorAvatar: "YO",
      date: "Just now",
      replies: 0,
      likes: 0,
      excerpt: newDiscussionContent.substring(0, 150) + (newDiscussionContent.length > 150 ? "..." : ""),
      tags: newDiscussionTags,
    }
    mockDiscussions.unshift(newDiscussion) // Modify mock data directly (in real app, send to API)
    setFilteredDiscussions([newDiscussion, ...filteredDiscussions]) // Add to displayed list immediately
    setNewDiscussionTitle("")
    setNewDiscussionContent("")
    setNewDiscussionCategory("")
    setNewDiscussionTags([])
    document.getElementById("new-discussion")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding hero-bg py-6 sm:py-8 md:py-12">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero text-3xl sm:text-4xl md:text-5xl">
                {isLoading ? (
                  fallbacks.title
                ) : (
                  <span suppressHydrationWarning>{t("community.title") ?? fallbacks.title}</span>
                )}
              </h1>
              <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed">
                {isLoading ? (
                  fallbacks.subtitle
                ) : (
                  <span suppressHydrationWarning>{t("community.subtitle") ?? fallbacks.subtitle}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section (Discussions List + Filters) */}
      <section className="section-padding content-bg-1 py-6 sm:py-8 md:py-12">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-4">
            {/* Mobile Sidebar Toggle */}
            {isMobile && (
              <div className="lg:hidden mb-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                  {isLoading ? (
                    fallbacks.showSidebar
                  ) : (
                    <span suppressHydrationWarning>{t("community.showSidebar") ?? fallbacks.showSidebar}</span>
                  )}
                </Button>
              </div>
            )}

            {/* Sidebar (Filters, Join) */}
            <Sidebar
              isLoading={isLoading}
              t={t}
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              isMobileSidebarOpen={isMobileSidebarOpen}
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            />

            {/* Discussion List */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">
              {/* Search and Filter Bar */}
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder={
                      isLoading
                        ? fallbacks.searchPlaceholder
                        : (t("community.searchPlaceholder") ?? fallbacks.searchPlaceholder)
                    }
                    className="pl-10 rounded-lg h-9 sm:h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} className="btn-gradient h-9 sm:h-10 px-3 sm:px-4">
                    {isLoading ? (
                      fallbacks.search
                    ) : (
                      <span suppressHydrationWarning>{t("common.search") ?? fallbacks.search}</span>
                    )}
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden xs:inline">
                        {isLoading ? (
                          fallbacks.filter
                        ) : (
                          <span suppressHydrationWarning>{t("common.filter") ?? fallbacks.filter}</span>
                        )}
                      </span>
                    </Button>
                    {showFilters && (
                      <Card className="absolute right-0 mt-2 w-64 z-10 p-4 shadow-lg bg-popover border">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">
                              {isLoading ? (
                                fallbacks.sortBy
                              ) : (
                                <span suppressHydrationWarning>{t("common.sortBy") ?? fallbacks.sortBy}</span>
                              )}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn("text-xs", sortBy === "recent" && "bg-primary/10 border-primary")}
                                onClick={() => setSortBy("recent")}
                              >
                                {isLoading ? (
                                  fallbacks.mostRecent
                                ) : (
                                  <span suppressHydrationWarning>{t("common.mostRecent") ?? fallbacks.mostRecent}</span>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn("text-xs", sortBy === "popular" && "bg-primary/10 border-primary")}
                                onClick={() => setSortBy("popular")}
                              >
                                {isLoading ? (
                                  fallbacks.mostPopular
                                ) : (
                                  <span suppressHydrationWarning>
                                    {t("common.mostPopular") ?? fallbacks.mostPopular}
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">
                              {isLoading ? (
                                fallbacks.filterByTags
                              ) : (
                                <span suppressHydrationWarning>
                                  {t("common.filterByTags") ?? fallbacks.filterByTags}
                                </span>
                              )}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {["Beginner", "Intermediate", "Advanced", "Practice", "Resources"].map((tag) => (
                                <Button
                                  key={tag}
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "text-xs rounded-full",
                                    selectedTags.includes(tag) && "bg-primary/10 border-primary",
                                  )}
                                  onClick={() => toggleTag(tag)}
                                >
                                  {tag}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <Button className="w-full btn-gradient text-xs" onClick={applyFilters}>
                            {isLoading ? (
                              fallbacks.applyFilters
                            ) : (
                              <span suppressHydrationWarning>{t("common.applyFilters") ?? fallbacks.applyFilters}</span>
                            )}
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-3 mb-4 sm:mb-6 min-w-0">
                  <TabsTrigger value="all" className="rounded-lg truncate text-xs sm:text-sm py-1.5 sm:py-2">
                    {isLoading ? (
                      fallbacks.tabsAll
                    ) : (
                      <span suppressHydrationWarning>{t("community.tabs.all") ?? fallbacks.tabsAll}</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="learning" className="rounded-lg truncate text-xs sm:text-sm py-1.5 sm:py-2">
                    {isLoading ? (
                      fallbacks.tabsLearning
                    ) : (
                      <span suppressHydrationWarning>{t("community.tabs.learning") ?? fallbacks.tabsLearning}</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="support" className="rounded-lg truncate text-xs sm:text-sm py-1.5 sm:py-2">
                    {isLoading ? (
                      fallbacks.tabsSupport
                    ) : (
                      <span suppressHydrationWarning>{t("community.tabs.support") ?? fallbacks.tabsSupport}</span>
                    )}
                  </TabsTrigger>
                </TabsList>
                {/* Tab Content */}
                <TabsContent value="all" className="space-y-4">
                  {filteredDiscussions.length > 0 ? (
                    filteredDiscussions.map((discussion) => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <MessageSquare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-base sm:text-lg font-medium">
                        {isLoading ? (
                          fallbacks.noDiscussionsTitle
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.noDiscussions.title") ?? fallbacks.noDiscussionsTitle}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? (
                          fallbacks.noDiscussionsDesc
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.noDiscussions.description") ?? fallbacks.noDiscussionsDesc}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="learning" className="space-y-4">
                  {filteredDiscussions.filter((d) => d.category === "learning").length > 0 ? (
                    filteredDiscussions
                      .filter((d) => d.category === "learning")
                      .map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} />)
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-base sm:text-lg font-medium">
                        {isLoading ? (
                          fallbacks.noLearningTitle
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.noLearning.title") ?? fallbacks.noLearningTitle}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? (
                          fallbacks.noLearningDesc
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.noLearning.description") ?? fallbacks.noLearningDesc}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="support" className="space-y-4">
                  {filteredDiscussions.filter((d) => d.category === "support").length > 0 ? (
                    filteredDiscussions
                      .filter((d) => d.category === "support")
                      .map((discussion) => <DiscussionCard key={discussion.id} discussion={discussion} />)
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-base sm:text-lg font-medium">
                        {isLoading ? (
                          fallbacks.noSupportTitle
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.noSupport.title") ?? fallbacks.noSupportTitle}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? (
                          fallbacks.noSupportDesc
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.noSupport.description") ?? fallbacks.noSupportDesc}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Pagination (Example) */}
              {filteredDiscussions.length > 5 && (
                <div className="flex justify-center mt-6 sm:mt-8">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                      {isLoading ? (
                        fallbacks.previous
                      ) : (
                        <span suppressHydrationWarning>{t("common.previous") ?? fallbacks.previous}</span>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0 bg-accent">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      {isLoading ? (
                        fallbacks.next
                      ) : (
                        <span suppressHydrationWarning>{t("common.next") ?? fallbacks.next}</span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* New Discussion Form Section */}
      <section id="new-discussion" className="section-padding content-bg-2 py-6 sm:py-8 md:py-12">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-4">
            {/* Guidelines Sidebar (now static) */}
            <div className="lg:col-span-1 min-w-0 hidden lg:block">
              <Card className="card-standard glass-card-content sticky top-4">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">
                    {isLoading ? (
                      fallbacks.newDiscussionSidebarTitle
                    ) : (
                      <span suppressHydrationWarning>
                        {t("community.newDiscussion.sidebar.title") ?? fallbacks.newDiscussionSidebarTitle}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isLoading ? (
                      fallbacks.newDiscussionSidebarDesc
                    ) : (
                      <span suppressHydrationWarning>
                        {t("community.newDiscussion.sidebar.description") ?? fallbacks.newDiscussionSidebarDesc}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm px-4 sm:px-6 pb-4 sm:pb-6">
                  <p>
                    {isLoading ? (
                      fallbacks.newDiscussionSidebarGuideTitle
                    ) : (
                      <span suppressHydrationWarning>
                        {t("community.newDiscussion.sidebar.guidelinesTitle") ??
                          fallbacks.newDiscussionSidebarGuideTitle}
                      </span>
                    )}
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>
                      {isLoading ? (
                        fallbacks.newDiscussionSidebarGuide1
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.sidebar.guideline1") ?? fallbacks.newDiscussionSidebarGuide1}
                        </span>
                      )}
                    </li>
                    <li>
                      {isLoading ? (
                        fallbacks.newDiscussionSidebarGuide2
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.sidebar.guideline2") ?? fallbacks.newDiscussionSidebarGuide2}
                        </span>
                      )}
                    </li>
                    <li>
                      {isLoading ? (
                        fallbacks.newDiscussionSidebarGuide3
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.sidebar.guideline3") ?? fallbacks.newDiscussionSidebarGuide3}
                        </span>
                      )}
                    </li>
                    <li>
                      {isLoading ? (
                        fallbacks.newDiscussionSidebarGuide4
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.sidebar.guideline4") ?? fallbacks.newDiscussionSidebarGuide4}
                        </span>
                      )}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            {/* New Discussion Form */}
            <div className="lg:col-span-3 min-w-0">
              <Card className="card-standard glass-card-content">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">
                    {isLoading ? (
                      fallbacks.newDiscussionFormTitle
                    ) : (
                      <span suppressHydrationWarning>
                        {t("community.newDiscussion.form.title") ?? fallbacks.newDiscussionFormTitle}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="space-y-2">
                    <label htmlFor="discussion-title" className="text-sm font-medium break-words truncate w-full">
                      {isLoading ? (
                        fallbacks.newDiscussionFormTitleLabel
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.form.titleLabel") ?? fallbacks.newDiscussionFormTitleLabel}
                        </span>
                      )}
                    </label>
                    <Input
                      id="discussion-title"
                      placeholder={
                        isLoading
                          ? fallbacks.newDiscussionFormTitlePlaceholder
                          : (t("community.newDiscussion.form.titlePlaceholder") ??
                            fallbacks.newDiscussionFormTitlePlaceholder)
                      }
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      className="break-words w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="discussion-category" className="text-sm font-medium break-words truncate w-full">
                      {isLoading ? (
                        fallbacks.newDiscussionFormCatLabel
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.form.categoryLabel") ?? fallbacks.newDiscussionFormCatLabel}
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className={cn(
                          "text-sm justify-start",
                          newDiscussionCategory === "learning" && "bg-primary/10 border-primary",
                        )}
                        onClick={() => setNewDiscussionCategory("learning")}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        {isLoading ? (
                          fallbacks.newDiscussionFormCatLearning
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.newDiscussion.form.categoryLearning") ??
                              fallbacks.newDiscussionFormCatLearning}
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(
                          "text-sm justify-start",
                          newDiscussionCategory === "support" && "bg-primary/10 border-primary",
                        )}
                        onClick={() => setNewDiscussionCategory("support")}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {isLoading ? (
                          fallbacks.newDiscussionFormCatSupport
                        ) : (
                          <span suppressHydrationWarning>
                            {t("community.newDiscussion.form.categorySupport") ?? fallbacks.newDiscussionFormCatSupport}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="discussion-content" className="text-sm font-medium break-words truncate w-full">
                      {isLoading ? (
                        fallbacks.newDiscussionFormContentLabel
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.form.contentLabel") ?? fallbacks.newDiscussionFormContentLabel}
                        </span>
                      )}
                    </label>
                    <Textarea
                      id="discussion-content"
                      placeholder={
                        isLoading
                          ? fallbacks.newDiscussionFormContentPlaceholder
                          : (t("community.newDiscussion.form.contentPlaceholder") ??
                            fallbacks.newDiscussionFormContentPlaceholder)
                      }
                      className="min-h-[150px] sm:min-h-[200px] break-words w-full"
                      value={newDiscussionContent}
                      onChange={(e) => setNewDiscussionContent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words truncate w-full">
                      {isLoading ? (
                        fallbacks.newDiscussionFormTagsLabel
                      ) : (
                        <span suppressHydrationWarning>
                          {t("community.newDiscussion.form.tagsLabel") ?? fallbacks.newDiscussionFormTagsLabel}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Beginner", "Intermediate", "Advanced", "Practice", "Resources", "Teaching", "Community"].map(
                        (tag) => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "text-xs rounded-full",
                              newDiscussionTags.includes(tag) && "bg-primary/10 border-primary",
                            )}
                            onClick={() => toggleNewDiscussionTag(tag)}
                          >
                            {tag}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col xs:flex-row xs:justify-between gap-2 p-4 sm:p-6">
                  <Button variant="outline" className="w-full xs:w-auto order-2 xs:order-1">
                    {isLoading ? (
                      fallbacks.cancel
                    ) : (
                      <span suppressHydrationWarning>{t("common.cancel") ?? fallbacks.cancel}</span>
                    )}
                  </Button>
                  <Button
                    className="btn-gradient w-full xs:w-auto order-1 xs:order-2"
                    onClick={createNewDiscussion}
                    disabled={
                      !newDiscussionTitle ||
                      !newDiscussionContent ||
                      !newDiscussionCategory ||
                      newDiscussionTags.length === 0
                    }
                  >
                    {isLoading ? (
                      fallbacks.newDiscussionFormSubmit
                    ) : (
                      <span suppressHydrationWarning>
                        {t("community.newDiscussion.form.submitButton") ?? fallbacks.newDiscussionFormSubmit}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section-padding cta-bg py-8 md:py-12">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="heading-2 text-white text-2xl sm:text-3xl">
                {isLoading ? (
                  fallbacks.ctaTitle
                ) : (
                  <span suppressHydrationWarning>{t("community.cta.title") ?? fallbacks.ctaTitle}</span>
                )}
              </h2>
              <p className="max-w-[900px] text-white/80 text-sm sm:text-base md:text-xl/relaxed">
                {isLoading ? (
                  fallbacks.ctaDesc
                ) : (
                  <span suppressHydrationWarning>{t("community.cta.description") ?? fallbacks.ctaDesc}</span>
                )}
              </p>
              <div className="flex flex-col xs:flex-row gap-3 justify-center pt-4">
                <Link href="/sign-up" scroll={true} className="w-full xs:w-auto">
                  <Button size="lg" className="btn-gradient w-full">
                    {isLoading ? (
                      fallbacks.ctaButton1
                    ) : (
                      <span suppressHydrationWarning>{t("community.cta.button1") ?? fallbacks.ctaButton1}</span>
                    )}
                  </Button>
                </Link>
                <Link href="/sign-in" scroll={true} className="w-full xs:w-auto">
                  <Button variant="outline" size="lg" className="btn-outline prismatic-glow w-full">
                    {isLoading ? (
                      fallbacks.ctaButton2
                    ) : (
                      <span suppressHydrationWarning>{t("community.cta.button2") ?? fallbacks.ctaButton2}</span>
                    )}
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
