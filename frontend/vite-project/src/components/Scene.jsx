import { useEffect, useRef, useState } from "react";
import {
    FaHeart,
    FaRegHeart,
    FaRegComment,
    FaVolumeMute,
    FaVolumeUp,
    FaPlay,
    FaPaperPlane,
} from "react-icons/fa";

const Scene = ({
    scene,
    isActive,
    onVisible,
    onLike,
    onComment,
}) => {
    const videoRef = useRef(null);
    const sectionRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState("");

    const videoUrl = scene.video_url || scene.media_url || "";
    const creator = scene.username || "solace_user";
    const avatar = scene.profile_pic_url || "";
    const caption = scene.caption || "";

    // Detect the scene currently visible in the scrolling feed.
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    entry.intersectionRatio >= 0.6
                ) {
                    onVisible?.();
                }
            },
            { threshold: [0.6] }
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, [scene.id, onVisible]);

    // Only the active scene should play.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            video.muted = isMuted;

            video.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [isActive, isMuted]);

    const togglePlayback = async () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            try {
                await video.play();
                setIsPlaying(true);
            } catch {
                setIsPlaying(false);
            }
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const submitComment = (event) => {
        event.preventDefault();

        const content = commentText.trim();
        if (!content) return;

        onComment?.(scene.id, content);
        setCommentText("");
    };

    const comments = scene.comments || [];

    return (
        <section
            ref={sectionRef}
            className="relative flex h-[100dvh] min-h-[500px] w-full snap-start snap-always items-center justify-center overflow-hidden bg-[#F6F7F4] dark:bg-black"
        >
            {/* Centered video frame — everything overlaid on the video lives inside */}
            <div className="relative h-[min(82dvh,780px)] w-[min(100%,440px)] overflow-hidden rounded-none bg-black shadow-[0_40px_90px_-30px_rgba(20,40,35,0.55)] ring-1 ring-black/5 sm:rounded-[28px] dark:ring-white/10">
                {videoUrl ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="absolute inset-0 h-full w-full cursor-pointer object-contain"
                        loop
                        playsInline
                        muted={isMuted}
                        preload="metadata"
                        onClick={togglePlayback}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
                        Video unavailable
                    </div>
                )}

                {/* Soft gradients for readability */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

                {/* Scene label */}
                <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur-xl">
                    A moment in motion
                </div>

                {/* Play indicator */}
                {!isPlaying && videoUrl && (
                    <button
                        onClick={togglePlayback}
                        className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl transition hover:bg-white/25 active:scale-95"
                        aria-label="Play scene"
                    >
                        <FaPlay size={18} className="ml-1" />
                    </button>
                )}

                {/* Action buttons */}
                <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-5 text-white sm:right-4">
                    <button
                        onClick={() => onLike?.(scene.id)}
                        className="group flex flex-col items-center gap-1.5"
                        aria-label={scene.is_liked ? "Unlike scene" : "Like scene"}
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-xl transition group-hover:bg-white/20 group-active:scale-90">
                            {scene.is_liked ? (
                                <FaHeart className="text-[18px] text-rose-400" />
                            ) : (
                                <FaRegHeart className="text-[18px]" />
                            )}
                        </span>
                        <span className="text-[11px] font-medium tabular-nums text-white/90">
                            {scene.likes_count}
                        </span>
                    </button>

                    <button
                        onClick={() => setCommentsOpen(true)}
                        className="group flex flex-col items-center gap-1.5"
                        aria-label="Open comments"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-xl transition group-hover:bg-white/20 group-active:scale-90">
                            <FaRegComment className="text-[18px]" />
                        </span>
                        <span className="text-[11px] font-medium tabular-nums text-white/90">
                            {scene.comments_count}
                        </span>
                    </button>

                    <button
                        onClick={() => setIsMuted((previous) => !previous)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-xl transition hover:bg-white/20 active:scale-90"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                        {isMuted ? (
                            <FaVolumeMute size={16} />
                        ) : (
                            <FaVolumeUp size={16} />
                        )}
                    </button>
                </div>

                {/* Creator information and caption */}
                <div className="absolute bottom-6 left-5 right-20 z-10 text-white">
                    <div className="mb-2.5 flex items-center gap-2.5">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={`${creator}'s profile`}
                                className="h-9 w-9 rounded-full object-cover ring-1 ring-white/40"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold ring-1 ring-white/30 backdrop-blur-xl">
                                {creator.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <span className="max-w-[180px] truncate text-sm font-semibold tracking-tight">
                            @{creator.replace(/^@/, "")}
                        </span>

                        {/* {scene.id.startsWith("local-") && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/80 ring-1 ring-white/20 backdrop-blur-xl">
                                LOCAL DEMO
                            </span>
                        )} */}
                    </div>

                    {caption && (
                        <p className="max-w-md whitespace-pre-wrap break-words text-[13px] leading-relaxed text-white/90">
                            {caption}
                        </p>
                    )}
                </div>

                {/* Comments drawer */}
                {commentsOpen && (
                    <div
                        className="absolute inset-0 z-30 flex items-end bg-black/50 backdrop-blur-[2px]"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                setCommentsOpen(false);
                            }
                        }}
                    >
                        <div className="flex max-h-[75%] w-full flex-col rounded-t-[28px] bg-[#F6F7F4] text-[#294C46] shadow-2xl dark:bg-[#141C18] dark:text-white">
                            <div className="mx-auto mt-3 h-1 w-9 rounded-full bg-[#294C46]/15 dark:bg-white/20" />

                            <div className="flex items-center justify-between px-6 pb-3 pt-4">
                                <div>
                                    <h3 className="text-[15px] font-semibold tracking-tight">
                                        Comments
                                    </h3>
                                    <p className="mt-0.5 text-xs text-[#294C46]/55 dark:text-white/50">
                                        {comments.length} comments
                                    </p>
                                </div>

                                <button
                                    onClick={() => setCommentsOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-[#294C46]/60 transition hover:bg-[#294C46]/5 dark:text-white/60 dark:hover:bg-white/10"
                                    aria-label="Close comments"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="h-px bg-[#294C46]/10 dark:bg-white/10" />

                            {/* Comment list */}
                            <div className="min-h-24 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                                {comments.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <FaRegComment className="mx-auto mb-3 text-xl opacity-30" />
                                        <p className="text-sm font-medium">
                                            Start the conversation
                                        </p>
                                        <p className="mt-1 text-xs text-[#294C46]/55 dark:text-white/50">
                                            Be the first to comment on this scene.
                                        </p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#294C46]/10 text-xs font-semibold dark:bg-white/10">
                                                {(comment.username || "u")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold">
                                                    @{(comment.username || "user").replace(/^@/, "")}
                                                </p>
                                                <p className="mt-0.5 break-words text-[13px] leading-relaxed text-[#294C46]/85 dark:text-white/80">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add a comment */}
                            <form
                                onSubmit={submitComment}
                                className="flex items-center gap-2 border-t border-[#294C46]/10 px-5 pb-6 pt-4 dark:border-white/10"
                            >
                                <input
                                    value={commentText}
                                    onChange={(event) =>
                                        setCommentText(event.target.value)
                                    }
                                    placeholder="Write a comment..."
                                    maxLength={2000}
                                    className="min-w-0 flex-1 rounded-full bg-[#294C46]/5 px-4 py-3 text-sm outline-none ring-1 ring-transparent transition placeholder:text-[#294C46]/40 focus:bg-white focus:ring-[#294C46]/30 dark:bg-white/5 dark:placeholder:text-white/35 dark:focus:bg-white/10 dark:focus:ring-emerald-600/60"
                                />

                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#294C46] text-white transition hover:bg-[#1D3832] active:scale-95 disabled:opacity-30 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                                    aria-label="Post comment"
                                >
                                    <FaPaperPlane size={14} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Scene;