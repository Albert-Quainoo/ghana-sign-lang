"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, type ChangeEvent} from "react"; 
import { useLanguage } from "@/contexts/language-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Users, BookOpen, Search, PlusCircle, MessageCircleIcon as MessageIcon, Clock, Filter, ChevronRight, Volume2, Eye, Menu, X, AlertCircle, Edit, Trash2, Heart, Paperclip, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, type User } from "@/contexts/auth-context";
import { useMediaQuery } from "@/hooks/use-mobile";
import { db, storage } from "@/lib/config";
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, QueryConstraint, deleteDoc, doc, documentId, getDoc, updateDoc, increment, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Discussion } from "@/types/community";


const allTags = ["Beginner", "Intermediate", "Advanced", "Practice", "Resources", "Teaching", "Community", "Finger Spelling", "Comparison", "GSL", "Meetup", "Accra", "Emotions", "Expressions", "Children", "Parents", "Support Group"];

function DiscussionCard({ discussion, t, user}: { discussion: Discussion, t: (key: string) => string | undefined, user: User | null, refetchDiscussions: () => void, updateDiscussionInList: (id: string, updates: Partial<Discussion>) => void }) {
    const router = useRouter();
    const formattedDate = discussion.createdAt?.toDate ? discussion.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : t('common.unknownDate');
    const canModify = user?.uid === discussion.authorId;
    const canInteract = !!(user && user.emailVerified);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [internalLikeCount, setInternalLikeCount] = useState(discussion.likeCount ?? 0);
    const [hasLiked, setHasLiked] = useState(discussion.likedBy?.includes(user?.uid ?? '') ?? false);
    const [submitStatus, setSubmitStatus] = useState<{type:'success'|'error', message: string} | null>(null);

    useEffect(() => {
        setInternalLikeCount(discussion.likeCount ?? 0);
        setHasLiked(discussion.likedBy?.includes(user?.uid ?? '') ?? false);
    }, [discussion.likeCount, discussion.likedBy, user?.uid]);

    const handleEdit = () => { router.push(`/message-board/${discussion.id}`); };
    const handleDelete = async () => {
        if (!canModify || isDeleting) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            if (discussion.mediaURLs && discussion.mediaURLs.length > 0) {
                for (const url of discussion.mediaURLs) {
                    try {
                        const fileRef = ref(storage, url);
                        await deleteObject(fileRef);
                    } catch (storageError) {
                        console.warn(`Failed to delete media file ${url}:`, storageError);
                    }
                }
            }
            const postDocRef = doc(db, "discussions", discussion.id);
            await deleteDoc(postDocRef);
            setShowDeleteDialog(false);
        } catch (error) {
            console.error("Error deleting discussion:", error);
            setDeleteError(t('community.deleteError') ?? 'Failed to delete discussion.'); // Fix: Provide fallback for t()
        } finally {
            setIsDeleting(false);
        }
    };
    const handleLike = async () => {
        if (!canInteract || !user || isLiking) {
            if(!user || !user.emailVerified) setSubmitStatus({type: 'error', message: t("community.loginToLikeTooltip")!});
            setTimeout(()=>setSubmitStatus(null), 4000);
            return;
        }
        setIsLiking(true);
        const discussionRef = doc(db, "discussions", discussion.id);
        const alreadyLiked = hasLiked;
        const optimisticLikeCount = internalLikeCount + (alreadyLiked ? -1 : 1);
        setInternalLikeCount(optimisticLikeCount);
        setHasLiked(!alreadyLiked);
        try {
            await updateDoc(discussionRef, {
                likeCount: increment(alreadyLiked ? -1 : 1),
                likedBy: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Error updating like status:", error);
            setInternalLikeCount(discussion.likeCount ?? 0);
            setHasLiked(discussion.likedBy?.includes(user?.uid ?? '') ?? false);
            setSubmitStatus({type: 'error', message: t("community.likeError")!});
            setTimeout(()=>setSubmitStatus(null), 4000);
        } finally {
            setIsLiking(false);
        }
    };

    if (discussion.isHidden && !canModify) {
        return null;
    }

    return (
        <Card className={cn("card-standard glass-card-content overflow-hidden hover:shadow-lg transition-shadow duration-200", discussion.isHidden && canModify && "border-orange-400 border-2 opacity-75")}>
             {submitStatus && <Alert variant={submitStatus.type === 'success' ? 'default' : 'destructive'} className="text-sm m-4 border-0"><AlertTitle>{submitStatus.type === 'success' ? t('common.successTitle') : t('common.errorTitle')}</AlertTitle><AlertDescription>{submitStatus.message}</AlertDescription></Alert>}
            <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                     {discussion.isHidden && canModify && ( <div className="mb-2 flex items-center gap-1.5 text-xs text-orange-600 border border-orange-200 bg-orange-50/50 rounded px-2 py-1 w-fit"> <Lock className="h-3 w-3" /> <span>{t('community.discussionHiddenByModerator')}</span> </div> )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3"> <Link href={`/message-board/${discussion.id}`} className="hover:text-primary transition-colors flex-grow min-w-0"> <h3 className="text-base sm:text-lg font-semibold line-clamp-2 break-words">{discussion.title}</h3> </Link> <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 mt-1 sm:mt-0"> <Clock className="h-3 w-3 flex-shrink-0" /> <span>{formattedDate}</span> </div> </div>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3"> {discussion.excerpt} </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4"> {discussion.tags?.slice(0, 4).map((tag) => ( <span key={tag} className="text-xs bg-accent/60 px-2 py-0.5 rounded-full truncate max-w-[150px]"> {tag} </span> ))} {(discussion.tags?.length ?? 0) > 4 && <span className="text-xs text-muted-foreground py-0.5">...</span>} </div>
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0"> <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0"> <AvatarImage src={discussion.authorPhotoURL || undefined} alt={discussion.authorName} /> <AvatarFallback className="text-xs sm:text-sm">{discussion.authorInitials}</AvatarFallback> </Avatar> <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] xs:max-w-none"> {discussion.authorName} </span> </div>
                        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0">
                            <Button variant="ghost" size="sm" className={cn("flex items-center gap-1 p-1 h-auto text-muted-foreground text-xs", hasLiked && "text-red-500 hover:text-red-600")} onClick={handleLike} disabled={isLiking || !canInteract} title={canInteract ? (hasLiked ? t("community.unlikeDiscussionTooltip") : t("community.likeDiscussionTooltip")) : t("community.loginToLikeTooltip")}> <Heart className={cn("h-3.5 w-3.5", hasLiked && "fill-current")} /> <span>{internalLikeCount}</span> </Button>
                            <div className="flex items-center gap-1 text-muted-foreground"> <MessageIcon className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="text-xs">{discussion.replyCount ?? 0}</span> </div>
                            {canModify && ( <> <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary" onClick={handleEdit} title={t('community.editPost')}> <Edit className="h-3.5 w-3.5" /> </Button>
                                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                        <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive")} title={t('community.deletePost')}><Trash2 className="h-3.5 w-3.5" /></DialogTrigger>
                                        <DialogContent> <DialogHeader> <DialogTitle><span suppressHydrationWarning>{t('community.deleteConfirmTitle')}</span></DialogTitle> <DialogDescription> <span suppressHydrationWarning>{t('community.deleteConfirmMessage')}</span> </DialogDescription> {deleteError && <p className="text-sm text-red-600 pt-2">{deleteError}</p>} </DialogHeader> <DialogFooter className="sm:justify-between gap-2"> <DialogClose className={cn(buttonVariants({ variant: "ghost" }), !isDeleting ? '' : 'opacity-50 cursor-not-allowed')} disabled={isDeleting}> <span suppressHydrationWarning>{t("common.cancel")}</span> </DialogClose> <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}> {isDeleting && <LoadingSpinner size="sm" className="mr-2" />} <span suppressHydrationWarning>{isDeleting ? t('community.deleteLoading') : t('community.deleteConfirmAction')}</span> </Button> </DialogFooter> </DialogContent>
                                    </Dialog>
                                </>
                            )}
                            <Link href={`/message-board/${discussion.id}`}> <Button variant="ghost" size="sm" className="text-xs h-7 px-2 sm:h-8 sm:px-3 flex items-center gap-1"> <span suppressHydrationWarning>{t('community.viewDiscussion')}</span> <ChevronRight className="h-3 w-3" /> </Button> </Link>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function Sidebar({ isLoading, t, selectedTags, toggleTag, isMobileSidebarOpen, setIsMobileSidebarOpen, allTags }: { isLoading: boolean; t: (key: string) => string | undefined; selectedTags: string[]; toggleTag: (tag: string) => void; isMobileSidebarOpen: boolean; setIsMobileSidebarOpen: (open: boolean) => void; allTags: string[] }) {
    const isMobile = useMediaQuery("(max-width: 1023px)");
    return (
        <div className={cn( "lg:col-span-1 space-y-4 sm:space-y-6 min-w-0", isMobile && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 pt-16 overflow-y-auto lg:static lg:p-0 lg:pt-0 lg:z-0 lg:bg-transparent lg:backdrop-blur-none", !isMobileSidebarOpen && isMobile && "hidden" )}>
            {isMobile && ( <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setIsMobileSidebarOpen(false)}> <X className="h-5 w-5" /> <span className="sr-only"><span suppressHydrationWarning>{t('a11y.closeSidebar')}</span></span> </Button> )}
            <Card className="card-standard glass-card-content"> <CardHeader className="pb-3"> <CardTitle className="text-base sm:text-lg"><span suppressHydrationWarning>{t("community.sidebar.join.title")}</span></CardTitle> <CardDescription><span suppressHydrationWarning>{t("community.sidebar.join.description")}</span></CardDescription> </CardHeader> <CardContent> <Button className="w-full btn-gradient" onClick={() => { document.getElementById("new-discussion")?.scrollIntoView({ behavior: "smooth" }); if (isMobile) setIsMobileSidebarOpen(false); }}> <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>{t("community.sidebar.join.button")}</span> </Button> </CardContent> </Card>
            <Card className="card-standard glass-card-content"> <CardHeader className="pb-3"> <CardTitle className="text-base sm:text-lg"><span suppressHydrationWarning>{t("community.sidebar.tags.title")}</span></CardTitle> </CardHeader> <CardContent> <div className="flex flex-wrap gap-1.5 sm:gap-2"> {allTags.map((tag) => ( <Button key={tag} variant={selectedTags.includes(tag) ? "secondary": "outline"} size="sm" className={cn("text-xs rounded-full h-7 px-2.5 sm:h-8 sm:px-3")} onClick={() => toggleTag(tag)}> {tag} </Button> ))} </div> </CardContent> </Card>
            <Card className="card-standard glass-card-content"> <CardHeader className="pb-3"> <CardTitle className="text-base sm:text-lg"><span suppressHydrationWarning>{t("community.sidebar.accessibility.title")}</span></CardTitle> </CardHeader> <CardContent className="space-y-3"> <div className="flex items-center justify-between"> <span className="text-sm"><span suppressHydrationWarning>{t("a11y.highContrast")}</span></span> <Button variant="outline" size="icon" className="h-8 w-8" aria-label={t("a11y.highContrast")}> <Eye className="h-4 w-4" /> </Button> </div> <div className="flex items-center justify-between"> <span className="text-sm"><span suppressHydrationWarning>{t("a11y.textToSpeech")}</span></span> <Button variant="outline" size="icon" className="h-8 w-8" aria-label={t("a11y.textToSpeech")}> <Volume2 className="h-4 w-4" /> </Button> </div> <div className="flex items-center justify-between"> <span className="text-sm"><span suppressHydrationWarning>{t("a11y.fontSize")}</span></span> <div className="flex gap-1"> <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label={t("a11y.fontSizeDec")}>A-</Button> <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label={t("a11y.fontSizeInc")}>A+</Button> </div> </div> </CardContent> </Card>
        </div>
    )
}

function GuidelinesCard({ t }: { t: (key: string) => string | undefined }) {
    return (
        <Card className="card-standard glass-card-content">
            <CardHeader className="p-4 sm:p-6"> <CardTitle className="text-base sm:text-lg"><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.title")}</span></CardTitle> <CardDescription><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.description")}</span></CardDescription> </CardHeader>
            <CardContent className="space-y-2 text-sm px-4 sm:px-6 pb-4 sm:pb-6">
                <p><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guidelinesTitle")}</span></p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline1")}</span></li>
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline2")}</span></li>
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline3")}</span></li>
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline4")}</span></li>
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline5")}</span></li>
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline6")}</span></li>
                    <li><span suppressHydrationWarning>{t("community.newDiscussion.sidebar.guideline7")}</span></li>
                </ul>
            </CardContent>
        </Card>
    );
}

export default function MessageBoardPage() {
  const { t, isLoading: isLanguageLoading } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterParam = searchParams?.get('filter');
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isFetchingDiscussions, setIsFetchingDiscussions] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [newDiscussionCategory, setNewDiscussionCategory] = useState<"learning" | "support" | "">("");
  const [newDiscussionTags, setNewDiscussionTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type:'success'|'error', message: string} | null>(null);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'my-posts' | 'my-comments'>( filterParam === 'my-posts' ? 'my-posts' : filterParam === 'my-comments' ? 'my-comments' : 'all' );
  const isLoading = isLanguageLoading || authLoading;
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const canPostOrComment = !!(user && user.emailVerified);
  const MAX_FILE_SIZE_MB = 25;
  const MAX_TOTAL_FILES = 3;

  useEffect(() => {
    const newFilter = searchParams?.get('filter');
    setCurrentFilter(newFilter === 'my-posts' ? 'my-posts' : newFilter === 'my-comments' ? 'my-comments' : 'all');
  }, [searchParams]);

  const fetchAndSetDiscussions = useCallback((querySnapshot: any) => {
      let fetchedDiscussions = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Discussion));
      const queryLower = searchQuery.toLowerCase().trim();
      if (queryLower) {
          fetchedDiscussions = fetchedDiscussions.filter((d: Discussion) =>
              d.title.toLowerCase().includes(queryLower) ||
              (d.excerpt ?? "").toLowerCase().includes(queryLower) ||
              (d.tags ?? []).some((tag: string) => tag.toLowerCase().includes(queryLower))
          );
      }
      if (selectedTags.length > 0) {
          fetchedDiscussions = fetchedDiscussions.filter((d: Discussion) =>
              (d.tags ?? []).some((tag: string) => selectedTags.includes(tag))
          );
      }
       fetchedDiscussions = fetchedDiscussions.filter((d: Discussion) => !d.isHidden || d.authorId === user?.uid);
      setDiscussions(fetchedDiscussions);
      setIsFetchingDiscussions(false);
      setFetchError(null);
  }, [searchQuery, selectedTags, user?.uid]);


  useEffect(() => {
    setIsFetchingDiscussions(true);
    setFetchError(null);
    let unsubscribe = () => {};
    try {
        const constraints: QueryConstraint[] = [];
        let q: any;
        if (currentFilter === 'my-posts' && user?.uid) {
            constraints.push(where("authorId", "==", user.uid));
            if (sortBy === 'popular') {
                constraints.push(orderBy("likeCount", "desc"));
            }
            constraints.push(orderBy("createdAt", "desc"));
            constraints.push(limit(50));
            q = query(collection(db, "discussions"), ...constraints);
        } else if (currentFilter === 'my-comments' && user?.uid) {
            const fetchCommentedDiscussions = async () => {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const commentedIds = userData.commentedOnDiscussionIds as string[] || [];
                    if (commentedIds.length > 0) {
                        const discussionIdsToFetch = commentedIds.slice(0, 30);
                        const commentedConstraints: QueryConstraint[] = [where(documentId(), 'in', discussionIdsToFetch)];
                        const commentedQuery = query(collection(db, "discussions"), ...commentedConstraints);
                        const querySnapshot = await getDocs(commentedQuery);
                        let fetched = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Discussion));
                         fetched = fetched.filter((d: Discussion) => !d.isHidden || d.authorId === user?.uid);
                        fetched.sort((a, b) => (b.lastUpdatedAt || b.createdAt).toMillis() - (a.lastUpdatedAt || a.createdAt).toMillis());
                        setDiscussions(fetched);
                        setIsFetchingDiscussions(false);
                         setFetchError(null);
                    } else {
                        setDiscussions([]);
                        setIsFetchingDiscussions(false);
                    }
                } else {
                    setDiscussions([]);
                    setIsFetchingDiscussions(false);
                    setFetchError(t("community.noUserCommentData"));
                }
            };
            fetchCommentedDiscussions().catch(err => {
                 console.error("Error fetching commented discussions:", err);
                 setFetchError(t("community.fetchError"));
                 setIsFetchingDiscussions(false);
             });
            return;

        } else {
            if (activeTab !== 'all') {
                constraints.push(where("category", "==", activeTab));
            }
            if (sortBy === 'popular') {
                constraints.push(orderBy("likeCount", "desc"));
            }
             constraints.push(orderBy("createdAt", "desc"));
            constraints.push(limit(50));
            q = query(collection(db, "discussions"), ...constraints);
        }
        unsubscribe = onSnapshot(q, fetchAndSetDiscussions, (error) => {
            console.error("Error listening to discussions:", error);
            setFetchError(t("community.fetchError"));
            setIsFetchingDiscussions(false);
        });
    } catch (error) {
        console.error("Error setting up discussion listener:", error);
        setFetchError(t("community.fetchError"));
        setIsFetchingDiscussions(false);
    }
    return () => unsubscribe();
  }, [activeTab, sortBy, fetchAndSetDiscussions, currentFilter, user?.uid, t]);

   const updateDiscussionInList = useCallback((id: string, updates: Partial<Discussion>) => {}, []);

   const handleTabChange = (value: string) => { setActiveTab(value); };
   const toggleTag = (tag: string) => { setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])); };
   const toggleNewDiscussionTag = (tag: string) => { setNewDiscussionTags((prev) => prev.length < 5 && !prev.includes(tag) ? [...prev, tag] : prev.filter((t) => t !== tag) ); };
   const handleFilterChange = (filter: 'all' | 'my-posts' | 'my-comments') => { setCurrentFilter(filter); const newSearchParams = new URLSearchParams(searchParams?.toString() ?? ""); if (filter === 'my-posts' || filter === 'my-comments') { newSearchParams.set('filter', filter); } else { newSearchParams.delete('filter'); } router.push(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false }); };
   const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => { setSubmitStatus(null); if (event.target.files) { const files = event.target.files; if (files.length > MAX_TOTAL_FILES) { setSubmitStatus({type: 'error', message: t("community.fileCountError")! }); event.target.value = ''; setSelectedFiles(null); setTimeout(() => setSubmitStatus(null), 5000); return; } let oversizedFiles = []; for (let i = 0; i < files.length; i++) { if (files[i].size > MAX_FILE_SIZE_MB * 1024 * 1024) { oversizedFiles.push(files[i].name); } } if (oversizedFiles.length > 0) { setSubmitStatus({type: 'error', message: `${t("community.fileSizeError")} (${oversizedFiles.join(', ')})` }); event.target.value = ''; setSelectedFiles(null); setTimeout(() => setSubmitStatus(null), 5000); return; } setSelectedFiles(files); } else { setSelectedFiles(null); } };

   const createNewDiscussion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canPostOrComment || !newDiscussionTitle || !newDiscussionContent || !newDiscussionCategory) {
            setSubmitStatus({ type: 'error', message: canPostOrComment ? 'Please fill in all required fields.' : t("community.loginToPost")! });
            setTimeout(() => setSubmitStatus(null), 4000);
            return;
        }
        if (!user) {
            setSubmitStatus({ type: 'error', message: 'User data not loaded, please wait.' });
            setTimeout(() => setSubmitStatus(null), 4000);
            return;
        }
        setIsSubmitting(true);
        setIsUploadingMedia(!!selectedFiles && selectedFiles.length > 0);
        setUploadProgress(0);
        setSubmitStatus(null);
        let discussionDocRef;
        let newDiscussionId = '';
        let mediaUrls: string[] = [];
        let uploadErrorOccurred = false;
        try {
            const authorName = user.displayName || "Anonymous User";
            const authorInitials = (authorName).substring(0, 2).toUpperCase();
            const authorPhotoURL = user.photoURL ?? null;
            const discussionDataPlaceholder = {
                title: newDiscussionTitle.trim(),
                category: newDiscussionCategory,
                content: newDiscussionContent.trim(),
                excerpt: newDiscussionContent.trim().substring(0, 150) + (newDiscussionContent.trim().length > 150 ? "..." : ""),
                tags: newDiscussionTags,
                authorId: user.uid,
                authorName: authorName,
                authorInitials: authorInitials,
                authorPhotoURL: authorPhotoURL,
                createdAt: serverTimestamp(),
                likeCount: 0,
                replyCount: 0,
                likedBy: [],
                mediaURLs: [],
                moderationStatus: 'PENDING',
                textModerationStatus: 'PENDING',
                isHidden: true
            };
            discussionDocRef = await addDoc(collection(db, "discussions"), discussionDataPlaceholder);
            newDiscussionId = discussionDocRef.id;
            if (selectedFiles && selectedFiles.length > 0) {
                 setIsUploadingMedia(true);
                 const uploadPromises = Array.from(selectedFiles).map(file => {
                    const fileMetadata = { contentType: file.type, customMetadata: { discussionId: newDiscussionId } };
                    const storageRef = ref(storage, `discussionsMedia/${user.uid}/${newDiscussionId}_${Date.now()}_${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file, fileMetadata);
                    return new Promise<string>((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => { setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
                            (error) => { console.error("Upload failed for file:", file.name, error); reject(error); },
                            async () => { try { const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); resolve(downloadURL); } catch (urlError) { reject(urlError); } }
                        );
                    });
                 });
                 try {
                    const urls = await Promise.all(uploadPromises);
                    mediaUrls.push(...urls);
                    await updateDoc(discussionDocRef, { mediaURLs: mediaUrls });
                 } catch (uploadError: unknown) {
                    uploadErrorOccurred = true;
                    console.error("One or more media uploads failed:", uploadError);
                    let errorMsg = t("community.mediaUploadError")!;
                    if (typeof uploadError === 'object' && uploadError !== null && 'code' in uploadError) {
                        const code = (uploadError as { code: string }).code;
                        if (code === 'storage/unauthorized') { errorMsg = `Upload failed: File might be too large (max ${MAX_FILE_SIZE_MB}MB) or you lack permission.`; }
                         else if (code === 'storage/canceled') { errorMsg = 'Upload canceled.'; }
                    }
                    setSubmitStatus({ type: 'error', message: errorMsg });
                    console.warn("Upload failed, attempting to remove placeholder document.");
                     await deleteDoc(discussionDocRef);
                 } finally {
                     setIsUploadingMedia(false);
                     setUploadProgress(0);
                 }
            }
             if (uploadErrorOccurred) {
                 setIsSubmitting(false);
                 setTimeout(() => setSubmitStatus(null), 5000);
                 return;
             }
            setSubmitStatus({ type: 'success', message: t("community.newDiscussion.success")! });
            setNewDiscussionTitle("");
            setNewDiscussionContent("");
            setNewDiscussionCategory("");
            setNewDiscussionTags([]);
            setSelectedFiles(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Error during discussion creation process:", error);
            setSubmitStatus({ type: 'error', message: t("community.newDiscussion.error")! });
             if (discussionDocRef && !uploadErrorOccurred) {
                try {
                     await deleteDoc(discussionDocRef);
                     console.log("Deleted placeholder discussion doc due to creation error after potential media stage.")
                } catch (deleteErr) {
                     console.error("Failed to delete placeholder doc after creation error:", deleteErr);
                }
             }
        } finally {
            setIsSubmitting(false);
            setIsUploadingMedia(false);
            setUploadProgress(0);
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };


   if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center content-bg-1">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600"><span suppressHydrationWarning>{t("common.loading")}</span></p>
            </div>
        );
   }

  return (
    <>
      <section className="section-padding hero-bg py-6 sm:py-8 md:py-12">
          <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center">
                  <div className="space-y-2">
                      <h1 className="heading-1 gradient-text-hero text-3xl sm:text-4xl md:text-5xl"> <span suppressHydrationWarning>{t("community.title")}</span> </h1>
                      <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed"> <span suppressHydrationWarning>{t("community.subtitle")}</span> </p>
                  </div>
              </div>
          </div>
      </section>
      <section className="section-padding content-bg-1 py-6 sm:py-8 md:py-12">
          <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
              <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-4">
                 {isMobile && ( <div className="lg:hidden mb-2"> <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-lg" onClick={() => setIsMobileSidebarOpen(true)}> <Menu className="h-4 w-4" /> <span suppressHydrationWarning>{t("community.showSidebar")}</span> </Button> </div> )}
                 <Sidebar isLoading={isLoading} t={t} selectedTags={selectedTags} toggleTag={toggleTag} isMobileSidebarOpen={isMobileSidebarOpen} setIsMobileSidebarOpen={setIsMobileSidebarOpen} allTags={allTags} />
                 <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0" id="discussion-list-top">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div className="relative flex-grow"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /> <Input ref={searchInputRef} placeholder={ t("community.searchPlaceholder") } className="pl-10 rounded-lg h-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> </div>
                        <div className="flex gap-2 justify-end sm:justify-start flex-shrink-0"> <div className="relative"> <Button variant="outline" className="flex items-center gap-2 h-10 px-4 rounded-lg" onClick={() => setShowFilters(!showFilters)}> <Filter className="h-4 w-4" /> <span className="hidden xs:inline"><span suppressHydrationWarning>{t("common.filter")}</span></span> </Button> {showFilters && ( <Card className="absolute right-0 mt-2 w-64 z-20 p-4 shadow-lg bg-popover border"> <div className="space-y-4"> <div className="space-y-2"> <h3 className="text-sm font-medium"><span suppressHydrationWarning>{t("common.sortBy")}</span></h3> <div className="grid grid-cols-2 gap-2"> <Button variant="outline" size="sm" className={cn("text-xs", sortBy === "recent" && "bg-primary/10 border-primary text-primary")} onClick={() => { setSortBy("recent"); setShowFilters(false); }}><span suppressHydrationWarning>{t("common.mostRecent")}</span></Button> <Button variant="outline" size="sm" className={cn("text-xs", sortBy === "popular" && "bg-primary/10 border-primary text-primary")} onClick={() => { setSortBy("popular"); setShowFilters(false); }}><span suppressHydrationWarning>{t("common.mostPopular")}</span></Button> </div> </div> <div className="space-y-2"> <h3 className="text-sm font-medium"><span suppressHydrationWarning>{t("common.filterByTags")}</span></h3> <div className="flex flex-wrap gap-2"> {allTags.map((tag) => ( <Button key={tag} variant={selectedTags.includes(tag) ? "secondary" : "outline"} size="sm" className={cn("text-xs rounded-full h-7 px-2.5")} onClick={() => toggleTag(tag)}> {tag} </Button> ))} </div> </div> </div> </Card> )} </div> </div>
                    </div>
                    <div className="flex border-b">
                         <button onClick={() => handleFilterChange('all')} className={cn( "py-2 px-4 text-sm font-medium transition-colors", currentFilter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground' )}> <span suppressHydrationWarning>{t("community.tabs.all")}</span> </button>
                         {user && ( <> <button onClick={() => handleFilterChange('my-posts')} className={cn( "py-2 px-4 text-sm font-medium transition-colors", currentFilter === 'my-posts' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground' )}> <span suppressHydrationWarning>{t("community.myPosts")}</span> </button> <button onClick={() => handleFilterChange('my-comments')} className={cn( "py-2 px-4 text-sm font-medium transition-colors", currentFilter === 'my-comments' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground' )}> <span suppressHydrationWarning>{t("community.myComments")}</span> </button> </> )}
                    </div>
                    {currentFilter === 'all' && ( <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full pt-4"> <TabsList className="grid grid-cols-3 mb-4 sm:mb-6 w-full sm:w-auto sm:inline-grid"> <TabsTrigger value="all" className="rounded-lg truncate text-xs sm:text-sm py-1.5 sm:py-2"><span suppressHydrationWarning>{t("community.tabs.all")}</span></TabsTrigger> <TabsTrigger value="learning" className="rounded-lg truncate text-xs sm:text-sm py-1.5 sm:py-2"><span suppressHydrationWarning>{t("community.tabs.learning")}</span></TabsTrigger> <TabsTrigger value="support" className="rounded-lg truncate text-xs sm:text-sm py-1.5 sm:py-2"><span suppressHydrationWarning>{t("community.tabs.support")}</span></TabsTrigger> </TabsList> </Tabs> )}
                    <div className="space-y-4 mt-0">
                        {isFetchingDiscussions ? ( <div className="text-center py-12"><LoadingSpinner size="md" /></div> ) :
                         fetchError ? ( <Alert variant="destructive" className="text-sm"> <AlertCircle className="h-4 w-4" /> <AlertTitle>{t('common.errorTitle')}</AlertTitle> <AlertDescription>{fetchError}</AlertDescription> </Alert> ) :
                         discussions.length > 0 ? ( discussions.map((discussion) => (<DiscussionCard key={discussion.id} discussion={discussion} t={t} user={user} refetchDiscussions={() => {}} updateDiscussionInList={updateDiscussionInList} />)) ) :
                         ( <div className="text-center py-8 sm:py-12"> <MessageSquare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-4" /> <h3 className="text-base sm:text-lg font-medium"><span suppressHydrationWarning>{t(currentFilter === 'my-comments' ? "community.noCommentedPosts" : "community.noDiscussions.title")}</span></h3> <p className="text-sm text-muted-foreground"><span suppressHydrationWarning>{t("community.noDiscussions.description")}</span></p> </div> )}
                    </div>
                 </div>
              </div>
          </div>
      </section>
      <section id="new-discussion" className="section-padding content-bg-2 py-6 sm:py-8 md:py-12 scroll-mt-16">
          <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
              <div className="lg:hidden mb-6"> <GuidelinesCard t={t} /> </div>
              <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-4">
                 <div className="lg:col-span-1 min-w-0 hidden lg:block"> <GuidelinesCard t={t} /> </div>
                 <div className="lg:col-span-3 min-w-0">
                    {canPostOrComment ? (
                        <form onSubmit={createNewDiscussion}>
                            <Card className="card-standard glass-card-content">
                                <CardHeader className="p-4 sm:p-6"> <CardTitle className="text-base sm:text-lg"><span suppressHydrationWarning>{t("community.newDiscussion.form.title")}</span></CardTitle> </CardHeader>
                                <CardContent className="space-y-4 px-4 sm:px-6">
                                    {submitStatus && <Alert variant={submitStatus.type === 'success' ? 'default' : 'destructive'} className="text-sm"><AlertTitle>{submitStatus.type === 'success' ? t('common.successTitle') : t('common.errorTitle')}</AlertTitle><AlertDescription>{submitStatus.message}</AlertDescription></Alert>}
                                    <div className="space-y-2"> <label htmlFor="discussion-title" className="text-sm font-medium"><span suppressHydrationWarning>{t("community.newDiscussion.form.titleLabel")}</span></label> <Input id="discussion-title" placeholder={ t("community.newDiscussion.form.titlePlaceholder") } value={newDiscussionTitle} onChange={(e) => setNewDiscussionTitle(e.target.value)} required disabled={isSubmitting || isUploadingMedia} /> </div>
                                    <div className="space-y-2"> <label className="text-sm font-medium"><span suppressHydrationWarning>{t("community.newDiscussion.form.categoryLabel")}</span></label> <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> <Button type="button" variant="outline" className={cn("text-sm justify-center sm:justify-start h-10", newDiscussionCategory === "learning" && "bg-primary/10 border-primary text-primary")} onClick={() => setNewDiscussionCategory("learning")} disabled={isSubmitting || isUploadingMedia}> <BookOpen className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>{t("community.newDiscussion.form.categoryLearning")}</span> </Button> <Button type="button" variant="outline" className={cn("text-sm justify-center sm:justify-start h-10", newDiscussionCategory === "support" && "bg-primary/10 border-primary text-primary")} onClick={() => setNewDiscussionCategory("support")} disabled={isSubmitting || isUploadingMedia}> <Users className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>{t("community.newDiscussion.form.categorySupport")}</span> </Button> </div> </div>
                                    <div className="space-y-2"> <label htmlFor="discussion-content" className="text-sm font-medium"><span suppressHydrationWarning>{t("community.newDiscussion.form.contentLabel")}</span></label> <Textarea id="discussion-content" placeholder={ t("community.newDiscussion.form.contentPlaceholder") } className="min-h-[150px] resize-none" value={newDiscussionContent} onChange={(e) => setNewDiscussionContent(e.target.value)} required disabled={isSubmitting || isUploadingMedia}/> </div>
                                    <div className="space-y-2"> <label htmlFor="media-upload" className={cn("text-sm font-medium flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800", (isSubmitting || isUploadingMedia) && "text-muted-foreground hover:text-muted-foreground cursor-not-allowed" )}> <Paperclip className="h-4 w-4" /> <span suppressHydrationWarning>{t("community.attachMediaLabel")}</span> </label> <Input id="media-upload" ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} disabled={isSubmitting || isUploadingMedia}/> {selectedFiles && selectedFiles.length > 0 && ( <div className="text-xs text-muted-foreground mt-1 space-y-1"> <span>Selected:</span> {Array.from(selectedFiles).map(file => (<span key={file.name} className="ml-2 inline-block bg-secondary px-1.5 py-0.5 rounded">{file.name}</span>))} </div> )} {isUploadingMedia && ( <div className="space-y-1 pt-2"> <Progress value={uploadProgress} className="h-2" /> <p className="text-xs text-muted-foreground"><span suppressHydrationWarning>{t("community.uploadProgress")}</span> {uploadProgress.toFixed(0)}%</p> </div> )} </div>
                                    <div className="space-y-2"> <label className="text-sm font-medium"><span suppressHydrationWarning>{t("community.newDiscussion.form.tagsLabel")}</span></label> <div className="flex flex-wrap gap-2"> {allTags.map( (tag) => ( <Button key={tag} type="button" variant={newDiscussionTags.includes(tag) ? "secondary" : "outline"} size="sm" className={cn("text-xs rounded-full h-7 px-2.5")} onClick={() => toggleNewDiscussionTag(tag)} disabled={isSubmitting || isUploadingMedia || (newDiscussionTags.length >= 5 && !newDiscussionTags.includes(tag))}> {tag} </Button> ) )} </div> </div>
                                </CardContent>
                                <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-4 sm:p-6"> <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setNewDiscussionTitle(''); setNewDiscussionContent(''); setNewDiscussionCategory(''); setNewDiscussionTags([]); setSelectedFiles(null); setSubmitStatus(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} disabled={isSubmitting || isUploadingMedia}> <span suppressHydrationWarning>{t("common.cancel")}</span> </Button> <Button type="submit" className="btn-gradient w-full sm:w-auto" disabled={ isSubmitting || isUploadingMedia || !user || !newDiscussionTitle || !newDiscussionContent || !newDiscussionCategory }> {(isSubmitting || isUploadingMedia) && <LoadingSpinner size="sm" className="mr-2"/>} <span suppressHydrationWarning>{isSubmitting ? t('community.newDiscussion.loading') : t("community.newDiscussion.form.submitButton")}</span> </Button> </CardFooter>
                            </Card>
                        </form>
                    ) : (
                        <Card className="card-standard glass-card-content text-center p-6 sm:p-8"> <CardHeader> <CardTitle><span suppressHydrationWarning>{t("community.loginToPostTitle")}</span></CardTitle> <CardDescription><span suppressHydrationWarning>{t("community.loginToPost")}</span></CardDescription> </CardHeader> <CardContent> <Link href="/sign-in"> <Button className="btn-gradient"><span suppressHydrationWarning>{t("nav.signin")}</span></Button> </Link> </CardContent> </Card>
                    )}
                 </div>
              </div>
          </div>
      </section>
      {!user && (
        <section className="section-padding cta-bg py-8 md:py-12">
            <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2 max-w-3xl">
                         <h2 className="heading-2 text-white text-2xl sm:text-3xl"> <span suppressHydrationWarning>{t("community.cta.title")}</span> </h2>
                         <p className="max-w-[900px] text-white/80 text-sm sm:text-base md:text-xl/relaxed"> <span suppressHydrationWarning>{t("community.cta.description")}</span> </p>
                         <div className="flex flex-col xs:flex-row gap-3 justify-center pt-4"> <Link href="/sign-up" scroll={true} className="w-full xs:w-auto"> <Button size="lg" className="btn-gradient w-full"><span suppressHydrationWarning>{t("community.cta.button1")}</span></Button> </Link> <Link href="/sign-in" scroll={true} className="w-full xs:w-auto"> <Button variant="outline" size="lg" className="btn-outline prismatic-glow w-full"><span suppressHydrationWarning>{t("community.cta.button2")}</span></Button> </Link> </div>
                    </div>
                </div>
            </div>
        </section>
      )}
    </>
  )
}