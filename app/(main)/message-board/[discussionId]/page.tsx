"use client";

import React, { useState, useEffect, useCallback, Fragment, useMemo} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useAuth, type User as AuthUser } from "@/contexts/auth-context";
import { db, storage } from "@/lib/config";
import { doc, collection, addDoc, query, orderBy, serverTimestamp, deleteDoc, updateDoc, increment, arrayUnion, arrayRemove, runTransaction, onSnapshot} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { ChevronLeft, Clock, AlertCircle, Edit, Trash2, Heart, Save, XCircle, BookOpen, Users, File as FileIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Discussion, Comment } from "@/types/community";

const getMediaType = (url: string): 'image' | 'video' | 'unknown' => { const pathWithoutQuery = url.split('?')[0].split('#')[0]; const lowerPath = pathWithoutQuery.toLowerCase(); if (/\.(jpg|jpeg|png|gif|webp|avif)$/.test(lowerPath)) return 'image'; if (/\.(mp4|webm|ogg|mov|avi)$/.test(lowerPath)) return 'video'; return 'unknown'; }

function MediaItem({ url, index }: { url: string; index: number }) {
    const { t } = useLanguage();
    const [hasError, setHasError] = useState(false);
    const mediaType = getMediaType(url);
    const handleError = () => { console.warn(`Failed to load media: ${url}`); setHasError(true); };
    if (hasError) { return ( <div className="relative aspect-video rounded-md overflow-hidden border bg-destructive/10 flex items-center justify-center text-destructive text-xs p-2"> <div className="text-center"> <AlertCircle className="h-6 w-6 mx-auto mb-1" /> <span>{t('community.mediaRemovedError')}</span> </div> </div> ); }
    return (
        <div className="relative rounded-md overflow-hidden border bg-muted" style={{ aspectRatio: "16 / 9", minHeight: 220 }}>
            {mediaType === 'image' && <img src={url} alt={t('community.mediaImageAlt')} className="object-contain w-full h-full" onError={handleError} loading="lazy" />}
            {mediaType === 'video' && <video src={url} controls className="object-contain w-full h-full bg-black" onError={handleError} preload="metadata" />}
            {mediaType === 'unknown' && <div className="flex items-center justify-center h-full text-muted-foreground" title={url}><FileIcon className="h-6 w-6" /></div>}
        </div>
     );
}

async function fetchOEmbedData(url: string): Promise<any> { console.warn("fetchOEmbedData is using a placeholder."); await new Promise(res => setTimeout(res, 500)); if (url.includes("youtube.com") || url.includes("youtu.be")) { const videoIdMatch = url.match(/(?:v=|\/embed\/|\/)([\w-]{11})/); const videoId = videoIdMatch ? videoIdMatch[1] : null; if (videoId) { return { html: `<iframe width="100%" style="aspect-ratio: 16 / 9;" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`, type: 'video' }; } } return null; }
function OEmbedDisplay({ url }: { url: string }) { const { t } = useLanguage(); const [embedData, setEmbedData] = useState<any>(null); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null); useEffect(() => { let isMounted = true; setIsLoading(true); setError(null); fetchOEmbedData(url).then(data => { if (isMounted && data) { setEmbedData(data); } }).catch(err => { if (isMounted) setError(t('community.embedFetchError')); }).finally(() => { if (isMounted) setIsLoading(false); }); return () => { isMounted = false }; }, [url, t]); if (isLoading) { return <div className="text-center text-sm text-muted-foreground py-2 my-2">{t('community.embedLoading')}</div>; } if (error || !embedData || !embedData.html) { return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{url}</a>; } return ( <div className="oembed-container my-4 max-w-full [&>iframe]:max-w-full [&>iframe]:aspect-video" dangerouslySetInnerHTML={{ __html: embedData.html }} /> ); }
function renderContentWithEmbeds(content: string): React.ReactNode[] { const urlRegex = /(\s|^)(https?:\/\/[^\s<>"]+)/g; const parts: (string | { type: 'url'; value: string })[] = []; let lastIndex = 0; let match; while ((match = urlRegex.exec(content)) !== null) { if (match.index > lastIndex) { parts.push(content.substring(lastIndex, match.index)); } if (match[1]) { parts.push(match[1]); } parts.push({ type: 'url', value: match[2] }); lastIndex = match.index + match[0].length; } if (lastIndex < content.length) { parts.push(content.substring(lastIndex)); } return parts.map((part, index) => { if (typeof part === 'string') { return part.split('\n').map((line, lineIndex) => ( <Fragment key={`${index}-${lineIndex}`}> {lineIndex > 0 && <br />} {line} </Fragment> )); } else if (part.type === 'url') { return <OEmbedDisplay key={`${part.value}-${index}`} url={part.value} />; } return null; }); }

export default function DiscussionDetailPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const discussionId = typeof params?.discussionId === 'string' && params.discussionId.length > 0 ? params.discussionId : null;
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCommentsLoading, setIsCommentsLoading] = useState(true);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{type:'success'|'error', message: string} | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeletingDiscussion, setIsDeletingDiscussion] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isLikingDiscussion, setIsLikingDiscussion] = useState(false);
    const [hasLikedDiscussion, setHasLikedDiscussion] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [editedCategory, setEditedCategory] = useState<"learning" | "support" | undefined>(undefined);
    const [editedTags, setEditedTags] = useState<string[]>([]);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const allTags = ["Beginner", "Intermediate", "Advanced", "Practice", "Resources", "Teaching", "Community", "Finger Spelling", "Comparison", "ASL", "Meetup", "Accra", "Emotions", "Expressions", "Children", "Parents", "Support Group"];
    const canPostOrInteract = !!(user && user.emailVerified);
    const canModifyDiscussion = user?.uid === discussion?.authorId;

    useEffect(() => {
        if (!discussionId) {
            setIsLoading(false);
            setIsCommentsLoading(false);
            setError(t("community.discussion.notFound"));
            setDiscussion(null);
            setComments([]);
            return;
        }
        setIsLoading(true);
        setIsCommentsLoading(true);
        setError(null);

        const discussionDocRef = doc(db, "discussions", discussionId);
        const unsubscribeDiscussion = onSnapshot(discussionDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const fetchedDiscussion = { id: docSnap.id, ...docSnap.data() } as Discussion;
                setDiscussion(fetchedDiscussion);
                if (user) {
                    setHasLikedDiscussion(fetchedDiscussion.likedBy?.includes(user.uid) ?? false);
                } else {
                    setHasLikedDiscussion(false);
                }
                setError(null);
            } else {
                setError(t("community.discussion.notFound"));
                setDiscussion(null);
                setComments([]);
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error listening to discussion:", err);
            setError(t("community.discussion.fetchError"));
            setIsLoading(false);
        });

        const commentsColRef = collection(db, "discussions", discussionId, "comments");
        const commentsQuery = query(commentsColRef, orderBy("createdAt", "asc"));
        const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => {
            const fetchedComments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            setComments(fetchedComments);
            setIsCommentsLoading(false);
            setCommentError(null);
        }, (err) => {
            console.error("Error listening to comments:", err);
            setCommentError(t('community.fetchError'));
            setIsCommentsLoading(false);
        });

        return () => {
            unsubscribeDiscussion();
            unsubscribeComments();
        };
    }, [discussionId, t, user]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canPostOrInteract || !newComment.trim() || !user || !discussionId) return;
        setIsSubmittingComment(true);
        setSubmitStatus(null);
        const authorName = user.displayName || t('common.anonymousUser');
        const authorInitials = (authorName || '??').substring(0, 2).toUpperCase();
        const authorPhotoURL = user.photoURL ?? null;
        try {
            const commentData = {
                content: newComment.trim(),
                authorId: user.uid,
                authorName: authorName,
                authorInitials: authorInitials,
                authorPhotoURL: authorPhotoURL,
                createdAt: serverTimestamp(),
                discussionId: discussionId,
                likeCount: 0,
                likedBy: [],
                moderationStatus: 'PENDING', // Initial status
                isHidden: true // Start hidden
            };
            const commentsColRef = collection(db, "discussions", discussionId!, "comments");
            await addDoc(commentsColRef, commentData);
            const discussionDocRef = doc(db, "discussions", discussionId!);
            await updateDoc(discussionDocRef, { replyCount: increment(1) });
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { commentedOnDiscussionIds: arrayUnion(discussionId) });
            setNewComment("");
            // Don't show success immediately, let listener handle UI update
            // setSubmitStatus({ type: 'success', message: t("community.comment.success")! });
            // setTimeout(() => setSubmitStatus(null), 3000);
        } catch (err) {
            console.error("Error posting comment or updating user doc:", err);
            setSubmitStatus({ type: 'error', message: t("community.comment.error")! });
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleLikeDiscussion = async () => {
        if (!canPostOrInteract || !user || !discussion || isLikingDiscussion) {
            if(!user || !user.emailVerified) alert(t("community.loginToLikeTooltip"));
            return;
        }
        setIsLikingDiscussion(true);
        const discussionRef = doc(db, "discussions", discussion.id);
        const alreadyLiked = discussion.likedBy?.includes(user.uid) ?? false;
        try {
            await updateDoc(discussionRef, {
                likeCount: increment(alreadyLiked ? -1 : 1),
                likedBy: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Error updating like status:", error);
            alert(t("community.likeError"));
        } finally {
            setIsLikingDiscussion(false);
        }
    };

    const handleDeleteDiscussion = async () => {
        if (!canModifyDiscussion || isDeletingDiscussion || !discussion) return;
        setIsDeletingDiscussion(true);
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
            router.push('/message-board');
        } catch (error) {
            console.error("Error deleting discussion:", error);
            setDeleteError(t('community.deleteError'));
        } finally {
            setIsDeletingDiscussion(false);
        }
    };

    const handleDeleteComment = useCallback(async (commentId: string) => {
        if (!commentId || !discussionId || !user) return;
        try {
            const discussionRef = doc(db, "discussions", discussionId);
            const commentRef = doc(db, "discussions", discussionId, "comments", commentId);
            await runTransaction(db, async (transaction) => {
                const discussionSnap = await transaction.get(discussionRef);
                if (!discussionSnap.exists()) {
                    throw t('community.discussionNotFoundDuringDelete');
                }
                transaction.delete(commentRef);
                const currentReplyCount = discussionSnap.data()?.replyCount ?? 0;
                if (currentReplyCount > 0) {
                    transaction.update(discussionRef, { replyCount: increment(-1) });
                } else {
                    console.warn("Attempted to decrement reply count below zero.");
                }
            });
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert(t('community.commentDeleteError'));
        }
    }, [discussionId, user, t]);

    const handleEditToggle = () => {
        if (!discussion) return;
        setEditError(null);
        if (!isEditing) {
            setEditedTitle(discussion.title);
            setEditedContent(discussion.content);
            setEditedCategory(discussion.category);
            setEditedTags(discussion.tags || []);
        }
        setIsEditing(!isEditing);
    };

    const handleUpdateDiscussion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canModifyDiscussion || !discussionId || !editedTitle.trim() || !editedContent.trim() || !editedCategory) {
            setEditError(t('community.editDiscussionErrorRequired'));
            return;
        }
        setIsSavingEdit(true);
        setEditError(null);
        try {
            const discussionRef = doc(db, "discussions", discussionId);
            const updateData = {
                title: editedTitle.trim(),
                content: editedContent.trim(),
                excerpt: editedContent.trim().substring(0, 150) + (editedContent.trim().length > 150 ? "..." : ""),
                category: editedCategory,
                tags: editedTags,
                lastUpdatedAt: serverTimestamp(),
                moderationStatus: 'PENDING', // Re-trigger moderation on edit
                textModerationStatus: 'PENDING',
                isHidden: true // Hide again until re-moderated
            };
            await updateDoc(discussionRef, updateData as any);
            setIsEditing(false); // Listener will update the UI
        } catch (error) {
            console.error("Error updating discussion:", error);
            setEditError(t("community.editDiscussionErrorUpdate"));
        } finally {
            setIsSavingEdit(false);
        }
    };

    const toggleEditTag = (tag: string) => {
        setEditedTags((prev) =>
            prev.length < 5 && !prev.includes(tag)
                ? [...prev, tag]
                : prev.filter((t) => t !== tag)
        );
    };

    const visibleComments = useMemo(() => {
        return comments.filter(comment => !comment.isHidden || user?.uid === comment.authorId);
    }, [comments, user?.uid]);

    const formattedDate = discussion?.createdAt?.toDate ? discussion.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '...';

    if (isLoading) return <div className="min-h-[70vh] flex items-center justify-center"><LoadingSpinner size="lg" /><p className="ml-3 text-muted-foreground">{t("community.discussion.loading")}</p></div>;
    if (error) return <div className="container max-w-4xl mx-auto py-8 px-4"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>{t('common.errorTitle')}</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;
    if (discussion?.isHidden && !canModifyDiscussion) { return ( <main className="min-h-screen content-bg-1 py-8 md:py-12"><div className="container max-w-4xl mx-auto px-4"> <div> <Link href="/message-board" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"> <ChevronLeft className="h-4 w-4 mr-1" /> {t('community.backToDiscussions')} </Link> </div> <Alert variant="destructive" className="mt-6"><AlertCircle className="h-4 w-4" /><AlertTitle>{t('common.contentUnavailableTitle')}</AlertTitle><AlertDescription>{t("community.discussion.hidden")}</AlertDescription></Alert></div></main> ); }
    if (!discussion) return <div className="container max-w-4xl mx-auto py-8 px-4"><Alert><AlertCircle className="h-4 w-4" /><AlertTitle>{t('common.notFoundTitle')}</AlertTitle><AlertDescription>{t("community.discussion.notFound")}</AlertDescription></Alert></div>;

    return (
        <main className="min-h-screen content-bg-1 py-8 md:py-12">
            <div className="container max-w-4xl mx-auto px-4 space-y-6 md:space-y-8">
                <div> <Link href="/message-board" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"> <ChevronLeft className="h-4 w-4 mr-1" /> {t('community.backToDiscussions')} </Link> </div>
                <Card className={cn( "card-standard glass-card-content overflow-hidden", discussion.isHidden && canModifyDiscussion && "border-orange-400 border-2 opacity-90" )}>
                    <CardHeader className="pb-4">
                         {discussion.isHidden && canModifyDiscussion && ( <div className="mb-2 flex items-center gap-1.5 text-xs text-orange-600 border border-orange-200 bg-orange-50/50 rounded px-2 py-1 w-fit"> <Lock className="h-3 w-3" /> <span>{t('community.discussionHiddenByModerator')}</span> </div> )}
                         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            {isEditing ? ( <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="text-xl md:text-2xl font-semibold h-10 flex-grow" disabled={isSavingEdit} aria-label={t("community.editDiscussionTitleLabel")} /> ) : ( <CardTitle className="text-xl md:text-2xl font-semibold break-words flex-grow">{discussion.title}</CardTitle> )}
                            {canModifyDiscussion && !isEditing && ( <div className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0"> <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary" onClick={handleEditToggle}> <Edit className="h-4 w-4 mr-1" /> {t('community.editPost')} </Button> <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}> <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 px-2 text-muted-foreground hover:text-destructive")}> <Trash2 className="h-4 w-4 mr-1" /> {t('community.deletePost')} </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle><span suppressHydrationWarning>{t('community.deleteConfirmTitle')}</span></DialogTitle> <DialogDescription> <span suppressHydrationWarning>{t('community.deleteConfirmMessage')}</span> </DialogDescription> {deleteError && <p className="text-sm text-red-600 pt-2">{deleteError}</p>} </DialogHeader> <DialogFooter className="sm:justify-between gap-2"> <DialogClose className={cn(buttonVariants({ variant: "ghost" }), !isDeletingDiscussion ? '' : 'opacity-50 cursor-not-allowed')} disabled={isDeletingDiscussion}> <span suppressHydrationWarning>{t("common.cancel")}</span> </DialogClose> <Button type="button" variant="destructive" onClick={handleDeleteDiscussion} disabled={isDeletingDiscussion}> {isDeletingDiscussion && <LoadingSpinner size="sm" className="mr-2" />} <span suppressHydrationWarning>{isDeletingDiscussion ? t('community.deleteLoading') : t('community.deleteConfirmAction')}</span> </Button> </DialogFooter> </DialogContent> </Dialog> </div> )}
                         </div>
                         {isEditing ? (
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-medium"><span suppressHydrationWarning>{t("community.editCategoryLabel")}</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button type="button" variant="outline" className={cn("text-sm justify-center h-9", editedCategory === "learning" && "bg-primary/10 border-primary text-primary")} onClick={() => setEditedCategory("learning")} disabled={isSavingEdit}> <BookOpen className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>{t("community.newDiscussion.form.categoryLearning")}</span> </Button>
                                    <Button type="button" variant="outline" className={cn("text-sm justify-center h-9", editedCategory === "support" && "bg-primary/10 border-primary text-primary")} onClick={() => setEditedCategory("support")} disabled={isSavingEdit}> <Users className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>{t("community.newDiscussion.form.categorySupport")}</span> </Button>
                                </div>
                            </div>
                         ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-2"> <Avatar className="h-6 w-6"> <AvatarImage src={discussion.authorPhotoURL || undefined} alt={discussion.authorName} /> <AvatarFallback className="text-xs">{discussion.authorInitials}</AvatarFallback> </Avatar> <span>{t('community.postedBy')} <span className="font-medium text-foreground">{discussion.authorName}</span></span> </div>
                                <div className="flex items-center gap-1"> <Clock className="h-3.5 w-3.5" /> <span>{formattedDate}</span> </div>
                            </div>
                         )}
                         {isEditing ? (
                            <div className="space-y-2 pt-3">
                                <label className="text-xs font-medium"><span suppressHydrationWarning>{t("community.editTagsLabel")}</span></label>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map( (tag) => ( <Button key={tag} type="button" variant={editedTags.includes(tag) ? "secondary" : "outline"} size="sm" className={cn("text-xs rounded-full h-7 px-2.5")} onClick={() => toggleEditTag(tag)} disabled={isSavingEdit || (editedTags.length >= 5 && !editedTags.includes(tag))}> {tag} </Button> ) )}
                                </div>
                            </div>
                         ) : (
                            discussion.tags && discussion.tags.length > 0 && ( <div className="flex flex-wrap gap-1.5 pt-3"> {discussion.tags.map((tag) => ( <span key={tag} className="text-xs bg-accent/60 px-2 py-0.5 rounded-full"> {tag} </span> ))} </div> )
                         )}
                    </CardHeader>
                    <CardContent className={cn(!isEditing && "text-sm sm:text-base")}>
                        {isEditing ? ( <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[200px] resize-none" disabled={isSavingEdit} aria-label={t("community.editDiscussionContentLabel")} /> ) : ( <> <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground whitespace-pre-wrap break-words">{renderContentWithEmbeds(discussion.content)}</div> {discussion.mediaURLs && discussion.mediaURLs.length > 0 && ( <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose"> {discussion.mediaURLs.map((url, index) => ( <MediaItem key={url + index} url={url} index={index} /> ))} </div> )} </> )}
                        {editError && <p className="text-sm text-red-600 pt-2">{editError}</p>}
                    </CardContent>
                    <CardFooter className="pt-4 flex items-center gap-4 text-sm text-muted-foreground">
                         {isEditing ? ( <div className="flex w-full justify-end gap-2"> <Button variant="ghost" onClick={handleEditToggle} disabled={isSavingEdit}> <XCircle className="h-4 w-4 mr-1.5"/> {t('common.cancel')} </Button> <Button onClick={handleUpdateDiscussion} disabled={isSavingEdit}> <Save className="h-4 w-4 mr-1.5"/> {isSavingEdit ? t('community.savingChangesButton') : t('community.saveChangesButton')} </Button> </div> ) : ( <> <Button variant="ghost" size="sm" className={cn("flex items-center gap-1 p-1 h-auto", hasLikedDiscussion && "text-red-500 hover:text-red-600")} onClick={handleLikeDiscussion} disabled={isLikingDiscussion || !canPostOrInteract} title={canPostOrInteract ? (hasLikedDiscussion ? t("community.unlikeDiscussionTooltip") : t("community.likeDiscussionTooltip")) : t("community.loginToLikeTooltip")}> <Heart className={cn("h-4 w-4", hasLikedDiscussion && "fill-current")} /> <span>{discussion.likeCount ?? 0}</span> </Button> </> )}
                         {/* Removed comment count from here */}
                    </CardFooter>
                </Card>
                <div className="space-y-4">
                    <h2 className="text-lg md:text-xl font-semibold border-b pb-2">{t("community.discussion.commentsTitle")} ({visibleComments.length})</h2>
                    {canPostOrInteract ? (
                        <form onSubmit={handleCommentSubmit} className="space-y-2">
                            {submitStatus && <Alert variant={submitStatus.type === 'success' ? 'default' : 'destructive'} className="text-sm"><AlertTitle>{submitStatus.type === 'success' ? t('common.successTitle') : t('common.errorTitle')}</AlertTitle><AlertDescription>{submitStatus.message}</AlertDescription></Alert>}
                            <Textarea placeholder={t("community.addCommentPlaceholder")} value={newComment} onChange={(e) => setNewComment(e.target.value)} required className="min-h-[80px] resize-none" disabled={isSubmittingComment} />
                            <div className="flex justify-end"> <Button type="submit" disabled={isSubmittingComment || !newComment.trim()}> {isSubmittingComment && <LoadingSpinner size="sm" className="mr-2" />} {isSubmittingComment ? t('community.commenting') : t('community.commentSubmit')} </Button> </div>
                        </form>
                    ) : (
                        <Card className="card-standard glass-card-content text-center py-4 px-4"> <p className="text-sm text-muted-foreground"><span suppressHydrationWarning>{t("community.loginToComment")}</span></p> <Link href="/sign-in" className="mt-2 inline-block"> <Button size="sm"><span suppressHydrationWarning>{t("nav.signin")}</span></Button> </Link> </Card>
                    )}
                    {isCommentsLoading ? ( <div className="text-center py-6"><LoadingSpinner size="md" /><p className="text-sm text-muted-foreground mt-2">{t("community.commentsLoading")}</p></div> )
                     : commentError ? ( <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>{t('common.errorTitle')}</AlertTitle><AlertDescription>{commentError}</AlertDescription></Alert> )
                     : visibleComments.length === 0 && comments.length > 0 ? ( <p className="text-sm text-muted-foreground text-center py-6">{t('community.someCommentsHidden') ?? "Some comments may be hidden pending review."}</p> )
                     : visibleComments.length === 0 ? ( <p className="text-sm text-muted-foreground text-center py-6">{t("community.noComments")}</p> )
                     : ( <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 600 }}> {visibleComments.map((comment) => ( <CommentCard key={comment.id} comment={comment} t={t} user={user} onDeleteComment={handleDeleteComment} canPostOrInteract={canPostOrInteract} /> ))} </div> )}
                </div>
            </div>
        </main>
    );
}


function CommentCard({ comment, t, user, onDeleteComment, canPostOrInteract }: { comment: Comment, t: (key: string, options?: { [key: string]: any }) => string | undefined, user: AuthUser | null, onDeleteComment: (commentId: string) => void, canPostOrInteract: boolean }) {
    const formattedDate = comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('common.unknownDate');
    const canDeleteComment = user?.uid === comment.authorId;
    const [isLiking, setIsLiking] = useState(false);
    const [internalLikeCount, setInternalLikeCount] = useState(comment.likeCount ?? 0);
    const [hasLiked, setHasLiked] = useState(comment.likedBy?.includes(user?.uid ?? '') ?? false);
    const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
    const [isDeletingCommentState, setIsDeletingCommentState] = useState(false);

    useEffect(() => {
        setInternalLikeCount(comment.likeCount ?? 0);
        setHasLiked(comment.likedBy?.includes(user?.uid ?? '') ?? false);
    }, [comment.likeCount, comment.likedBy, user?.uid]);

    const handleLikeComment = async () => {
        if (!canPostOrInteract || !user || isLiking) {
            if(!user || !user.emailVerified) alert(t("community.loginToLikeCommentTooltip"));
            return;
        }
        setIsLiking(true);
        const commentRef = doc(db, "discussions", comment.discussionId, "comments", comment.id);
        const alreadyLiked = hasLiked;
        try {
            await runTransaction(db, async (transaction) => {
                const commentSnap = await transaction.get(commentRef);
                if (!commentSnap.exists()) {
                    throw t('community.commentNotFoundDuringLike');
                }
                const currentData = commentSnap.data();
                const currentLikedBy = currentData.likedBy as string[] || [];
                const userHasLikedInDb = currentLikedBy.includes(user.uid);
                let newLikedBy: string[];
                const likeIncrement = userHasLikedInDb ? -1 : 1;
                if (userHasLikedInDb) {
                    newLikedBy = currentLikedBy.filter(id => id !== user.uid);
                } else {
                    newLikedBy = [...currentLikedBy, user.uid];
                }
                transaction.update(commentRef, { likeCount: increment(likeIncrement), likedBy: newLikedBy });
            });
        } catch (error) {
            console.error("Error updating comment like status:", error);
            alert(t("community.likeError"));
        } finally {
            setIsLiking(false);
        }
    };

    const confirmDeleteComment = async () => {
        setIsDeletingCommentState(true);
        await onDeleteComment(comment.id);
        // Closing the dialog etc. will happen naturally if component unmounts
        // or can be handled in the calling component if needed
    }

     if (comment.isHidden && !(user?.uid === comment.authorId)) {
         return (
             <Card className="card-standard glass-card-content overflow-hidden border-dashed border-orange-300 bg-orange-50/30 opacity-80">
                 <CardContent className="p-3 sm:p-4 text-xs text-orange-700 flex items-center gap-2">
                     <Lock className="h-3 w-3 flex-shrink-0" />
                     <span>{t("community.commentHidden")}</span>
                 </CardContent>
             </Card>
         );
     }

    return (
        <Card className={cn("card-standard glass-card-content overflow-hidden", comment.isHidden && (user?.uid === comment.authorId) && "border-orange-400 border-2 opacity-90")}>
            <CardContent className="p-3 sm:p-4">
                 {comment.isHidden && (user?.uid === comment.authorId) && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-orange-600 border border-orange-200 bg-orange-50/50 rounded px-2 py-1 w-fit">
                       <Lock className="h-3 w-3" />
                       <span>{t('community.commentHiddenByModerator')}</span>
                    </div>
                 )}
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 mt-1"> <AvatarImage src={comment.authorPhotoURL || undefined} alt={comment.authorName} /> <AvatarFallback className="text-xs">{comment.authorInitials}</AvatarFallback> </Avatar>
                    <div className="flex-grow min-w-0">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1"> <span className="text-sm font-medium text-foreground break-words">{comment.authorName}</span> <span className="text-xs text-muted-foreground flex-shrink-0">{formattedDate}</span> </div>
                         <div className="text-sm text-foreground whitespace-pre-wrap break-words">{renderContentWithEmbeds(comment.content)}</div>
                         <div className="mt-2 flex items-center gap-2"> <Button variant="ghost" size="sm" className={cn("flex items-center gap-1 p-1 h-auto text-muted-foreground text-xs", hasLiked && "text-red-500 hover:text-red-600")} onClick={handleLikeComment} disabled={isLiking || !canPostOrInteract} title={canPostOrInteract ? (hasLiked ? t("community.unlikeCommentTooltip") : t("community.likeCommentTooltip")) : t("community.loginToLikeCommentTooltip")}> <Heart className={cn("h-3.5 w-3.5", hasLiked && "fill-current")} /> <span>{internalLikeCount}</span> </Button> </div>
                    </div>
                    {canDeleteComment && (
                        <Dialog open={showDeleteCommentDialog} onOpenChange={setShowDeleteCommentDialog}>
                             <DialogTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0")} title={t('community.comment.delete')}> <Trash2 className="h-3.5 w-3.5" /> </DialogTrigger>
                             <DialogContent>
                                <DialogHeader> <DialogTitle><span suppressHydrationWarning>{t('community.deleteConfirmTitle')}</span></DialogTitle> <DialogDescription> <span suppressHydrationWarning>{t('community.commentDeleteConfirmMessage')}</span> </DialogDescription> </DialogHeader>
                                <DialogFooter className="sm:justify-end gap-2">
                                    <DialogClose className={cn(buttonVariants({ variant: "ghost" }), isDeletingCommentState ? 'opacity-50 cursor-not-allowed' : '')} disabled={isDeletingCommentState}> <span suppressHydrationWarning>{t("common.cancel")}</span> </DialogClose>
                                    <Button type="button" variant="destructive" onClick={confirmDeleteComment} disabled={isDeletingCommentState}> {isDeletingCommentState && <LoadingSpinner size="sm" className="mr-2" />} <span suppressHydrationWarning>{isDeletingCommentState ? t('community.commentDeleteLoading') : t('community.comment.deleteConfirmAction')}</span> </Button>
                                </DialogFooter>
                             </DialogContent>
                        </Dialog>
                     )}
                 </div>
            </CardContent>
        </Card>
    );
}