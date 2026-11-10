
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyProfilePage = ({ currentUserId }) => {
    const params = useParams();
    const userid = params.userid;

    const [clickedProfilePic, setClickedProfilePic] = useState(false);
    const [image, setImage] = useState(null);

    const [user, setUser] = useState({});
    const [friends, setFriends] = useState([]);
    const [sentRequest, setSentRequest] = useState(false);

    // Posts
    const [posts, setPosts] = useState([]);

    // Scenes (lazy-loaded)
    const [scenes, setScenes] = useState([]);
    const [scenesFetched, setScenesFetched] = useState(false);
    const [scenesLoading, setScenesLoading] = useState(false);
    const [scenesError, setScenesError] = useState("");

    // Tabs
    const [activeTab, setActiveTab] = useState("posts");

    // Scene deletion
    const [deletingSceneId, setDeletingSceneId] = useState(null);

    const isOwnProfile = Number(currentUserId) === Number(userid);

    const cardCorners = [
        "rounded-[26px_26px_26px_12px]",
        "rounded-[20px_28px_14px_28px]",
        "rounded-[28px_16px_28px_28px]",
        "rounded-[16px_28px_24px_28px]",
        "rounded-[28px_24px_16px_28px]",
    ];

    // Fetch friend request status
    useEffect(() => {
        const checkSentRequest = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/sent_friend_request/${currentUserId}/${userid}`
                );

                if (!res.ok) return;

                const data = await res.json();
                setSentRequest(data);
            } catch (error) {
                console.error("Error checking friend request:", error);
            }
        };

        if (currentUserId && userid && !isOwnProfile) {
            checkSentRequest();
        }
    }, [currentUserId, userid, isOwnProfile]);

    // Fetch profile
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/users/${userid}`);

                if (!res.ok) {
                    throw new Error("Unable to fetch profile.");
                }

                setUser(await res.json());
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        if (userid) getUser();
    }, [userid]);

    // Fetch friends
    useEffect(() => {
        const getFriends = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/friends/${currentUserId}`
                );

                if (!res.ok) return;

                const data = await res.json();

                setFriends(data.map((friend) => Number(friend.id)));
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };

        if (currentUserId) getFriends();
    }, [currentUserId]);

    // Fetch Posts immediately when profile loads
    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/userposts/${userid}`
                );

                if (!res.ok) {
                    throw new Error("Unable to fetch posts.");
                }

                const data = await res.json();
                setPosts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        if (userid) getPosts();
    }, [userid]);

    // Fetch Scenes only when the Scenes tab is selected
    const handleScenesTabClick = async () => {
        setActiveTab("scenes");

        // Don't fetch again if Scenes have already been fetched
        if (scenesFetched || scenesLoading) return;

        try {
            setScenesLoading(true);
            setScenesError("");

            const res = await fetch(
                `${BACKEND_URL}/api/scenes/${userid}`, {
                credentials: "include"
            }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Unable to load Scenes."
                );
            }

            const fetchedScenes = Array.isArray(data)
                ? data
                : data.scenes || [];

            setScenes(fetchedScenes);
            setScenesFetched(true);
        } catch (error) {
            console.error("Error fetching Scenes:", error);
            setScenesError(error.message || "Something went wrong.");
        } finally {
            setScenesLoading(false);
        }
    };

    // Delete Scene
    const handleDeleteScene = async (sceneId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this Scene? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setDeletingSceneId(sceneId);

            const res = await fetch(
                `${BACKEND_URL}/api/scenes/${sceneId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to delete Scene."
                );
            }

            // Remove deleted Scene from local state
            setScenes((previousScenes) =>
                previousScenes.filter(
                    (scene) => Number(scene.id) !== Number(sceneId)
                )
            );
        } catch (error) {
            console.error("Error deleting Scene:", error);
            alert(error.message || "Unable to delete Scene.");
        } finally {
            setDeletingSceneId(null);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();

        if (!image) return;

        const form = new FormData();
        form.append("profileImage", image);

        try {
            const res = await fetch(
                `${BACKEND_URL}/api/profile_image/${userid}`,
                {
                    method: "PATCH",
                    body: form,
                    credentials: "include",
                }
            );

            if (res.ok) {
                setClickedProfilePic(false);
                setImage(null);

                // Refresh profile to display updated picture
                const userRes = await fetch(
                    `${BACKEND_URL}/api/users/${userid}`
                );

                if (userRes.ok) {
                    setUser(await userRes.json());
                }
            }
        } catch (error) {
            console.error("Profile image upload failed:", error);
        }
    };

    const handleClickFollowButton = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `${BACKEND_URL}/api/friend_requests/${currentUserId}/${userid}`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (res.ok) {
                setSentRequest(true);
            }
        } catch (error) {
            console.error("Follow request failed:", error);
        }
    };

    const handleClickUnfollowButton = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `${BACKEND_URL}/api/friends/${userid}/${currentUserId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (res.ok) {
                setFriends((previousFriends) =>
                    previousFriends.filter(
                        (friend) => friend !== Number(userid)
                    )
                );
            }
        } catch (error) {
            console.error("Unfollow failed:", error);
        }
    };

    return (
        <>
            <div className="flex w-full flex-col pt-14 transition-all md:flex-row md:pt-0">

                {/* Profile picture modal */}
                {clickedProfilePic && (
                    <div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-[#17251F]/60 px-4 backdrop-blur-sm"
                        onClick={() => setClickedProfilePic(false)}
                    >
                        <div
                            className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] text-[#294C46] shadow-[0_20px_50px_-20px_rgba(41,76,70,0.45)] dark:border-[#344A43] dark:bg-[#1D3028] dark:text-[#E1EAE4]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-center border-b border-[#DFE6E0] py-4 text-sm font-semibold dark:border-[#344A43]">
                                Change Profile Photo
                            </div>

                            <div className="flex flex-col items-center justify-center border-b border-[#DFE6E0] px-4 py-5 dark:border-[#344A43]">
                                <form>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="image"
                                        className="cursor-pointer text-xs text-[#536E62] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#E9EFEB] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#294C46] hover:file:bg-[#DFE9E3] dark:text-[#C4D9CC] dark:file:bg-[#30483B] dark:file:text-[#E1EAE4]"
                                        onChange={(e) => {
                                            setImage(e.target.files[0]);
                                        }}
                                    />
                                </form>

                                <button
                                    type="button"
                                    disabled={!image}
                                    className="mt-3 rounded-full bg-[#397E6D] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#2F6A5B] disabled:opacity-50 dark:bg-[#78BFA7] dark:text-[#17251F]"
                                    onClick={handleImageUpload}
                                >
                                    Upload Photo
                                </button>
                            </div>

                            <div className="flex cursor-pointer items-center justify-center border-b border-[#DFE6E0] py-4 text-sm font-semibold text-[#397E6D] transition hover:bg-[#E9EFEB] dark:border-[#344A43] dark:text-[#A9DCC8]">
                                Remove Current Photo
                            </div>

                            <div
                                className="flex cursor-pointer items-center justify-center py-4 text-sm font-semibold text-[#C96D70] transition hover:bg-[#E9EFEB]"
                                onClick={() => setClickedProfilePic(false)}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                )}

                <main className="main-section w-full px-4 pb-32 pt-6 text-[#294C46] sm:px-6 md:pb-40 md:pt-10 dark:text-[#E1EAE4]">

                    {/* Profile header */}
                    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] px-5 py-8 shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors duration-300 dark:border-[#344A43] dark:bg-[#1D3028] md:flex-row md:px-8 md:py-10">

                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                if (isOwnProfile) {
                                    setClickedProfilePic(true);
                                }
                            }}
                        >
                            <div className="rounded-full border-2 border-[#78BFA7] p-1 transition hover:border-[#397E6D] dark:hover:border-[#A9DCC8]">
                                <img
                                    src={user.profile_pic_url}
                                    alt=""
                                    className="h-28 w-28 rounded-full object-cover md:h-36 md:w-36"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col items-center md:ml-10 md:mt-0 md:flex-row">
                            <div className="text-center text-lg font-semibold text-[#294C46] dark:text-[#E1EAE4] md:text-left md:text-xl">
                                <h1>{user.full_name}</h1>
                            </div>

                            <div className="mt-4 flex flex-wrap justify-center gap-2 md:ml-8 md:mt-0 md:justify-start">

                                {isOwnProfile ? (
                                    <button className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4]">
                                        Edit profile
                                    </button>
                                ) : friends.includes(Number(userid)) ? (
                                    <button
                                        onClick={handleClickUnfollowButton}
                                        className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4]"
                                    >
                                        Unfollow
                                    </button>
                                ) : sentRequest ? (
                                    <button
                                        disabled
                                        className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4]"
                                    >
                                        Sent Request
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleClickFollowButton}
                                        className="rounded-full bg-[#397E6D] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#2F6A5B] dark:bg-[#78BFA7] dark:text-[#17251F]"
                                    >
                                        Follow
                                    </button>
                                )}

                                <button className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4]">
                                    View Archive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content tabs */}
                    <div className="mt-8">

                        <div className="border-b border-[#D6DFD9] dark:border-[#344A43]">
                            <div className="flex items-center justify-center gap-12">

                                {/* Posts tab */}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("posts")}
                                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition ${activeTab === "posts"
                                            ? "text-[#397E6D] dark:text-[#A9DCC8]"
                                            : "text-[#82978C] hover:text-[#294C46] dark:hover:text-[#E1EAE4]"
                                        }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="4" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="m21 15-5-5L5 21" />
                                    </svg>

                                    Posts

                                    {activeTab === "posts" && (
                                        <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#397E6D] dark:bg-[#A9DCC8]" />
                                    )}
                                </button>

                                {/* Scenes tab */}
                                <button
                                    type="button"
                                    onClick={handleScenesTabClick}
                                    className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold transition ${activeTab === "scenes"
                                            ? "text-[#397E6D] dark:text-[#A9DCC8]"
                                            : "text-[#82978C] hover:text-[#294C46] dark:hover:text-[#E1EAE4]"
                                        }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="4" />
                                        <path d="m10 8 6 4-6 4z" />
                                    </svg>

                                    Scenes

                                    {activeTab === "scenes" && (
                                        <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#397E6D] dark:bg-[#A9DCC8]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Posts content */}
                        {activeTab === "posts" && (
                            <section className="pt-6">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                                            Posts
                                        </h2>
                                        <p className="mt-1 text-sm text-[#82978C] dark:text-gray-400">
                                            A collection of shared moments
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-[#E8EEE7] px-3 py-1 text-xs font-semibold text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                                        {posts.length} {posts.length === 1 ? "post" : "posts"}
                                    </span>
                                </div>

                                {posts.length === 0 ? (
                                    <div className="flex min-h-56 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D8E1D6] px-5 text-center dark:border-gray-700">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EEE7] text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="26"
                                                height="26"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect x="3" y="3" width="18" height="18" rx="4" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <path d="m21 15-5-5L5 21" />
                                            </svg>
                                        </div>

                                        <h3 className="text-base font-semibold">
                                            No posts yet
                                        </h3>

                                        <p className="mt-2 max-w-sm text-sm text-[#75877E] dark:text-gray-400">
                                            Shared moments will find their place here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5 xl:columns-5">
                                        {posts.map((post, index) => (
                                            <article
                                                key={post.id ?? post._id}
                                                className="group mb-4 break-inside-avoid sm:mb-5"
                                            >
                                                <Link
                                                    to={`/posts/${post.id ?? post._id}`}
                                                    aria-label={`View post ${index + 1}`}
                                                    className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#719987] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-950"
                                                >
                                                    <div
                                                        className={`relative isolate overflow-hidden bg-[#E9EDE7] dark:bg-gray-800 ${cardCorners[index % cardCorners.length]
                                                            }`}
                                                    >
                                                        {post.resource_type === "video" ? (
                                                            <video
                                                                src={post.imageUrl}
                                                                muted
                                                                loop
                                                                playsInline
                                                                preload="metadata"
                                                                className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={post.imageUrl}
                                                                alt={post.caption || "Profile post"}
                                                                loading="lazy"
                                                                className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                                                            />
                                                        )}

                                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                                        {post.resource_type === "video" && (
                                                            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="15"
                                                                    height="15"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path d="m8 5 12 7-12 7z" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {post.caption && (
                                                        <p className="mt-2 px-1 text-sm font-medium leading-5 text-[#354F45] dark:text-gray-200">
                                                            {post.caption}
                                                        </p>
                                                    )}
                                                </Link>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Scenes content */}
                        {activeTab === "scenes" && (
                            <section className="pt-6">

                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                                            Scenes
                                        </h2>
                                        <p className="mt-1 text-sm text-[#82978C] dark:text-gray-400">
                                            Short videos worth sharing
                                        </p>
                                    </div>

                                    {scenesFetched && (
                                        <span className="rounded-full bg-[#E8EEE7] px-3 py-1 text-xs font-semibold text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                                            {scenes.length} {scenes.length === 1 ? "Scene" : "Scenes"}
                                        </span>
                                    )}
                                </div>

                                {/* Loading */}
                                {scenesLoading && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="aspect-[9/14] animate-pulse rounded-2xl bg-[#E7EBE5] dark:bg-gray-800"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Error */}
                                {!scenesLoading && scenesError && (
                                    <div className="flex min-h-48 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D8E1D6] px-5 text-center dark:border-gray-700">
                                        <p className="text-sm text-[#75877E] dark:text-gray-400">
                                            {scenesError}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setScenesFetched(false);
                                                setScenesError("");
                                                handleScenesTabClick();
                                            }}
                                            className="mt-4 rounded-full bg-[#397E6D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2F6A5B]"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {/* Empty state */}
                                {!scenesLoading &&
                                    !scenesError &&
                                    scenesFetched &&
                                    scenes.length === 0 && (
                                        <div className="flex min-h-56 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D8E1D6] px-5 text-center dark:border-gray-700">
                                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EEE7] text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                                                ▶
                                            </div>

                                            <h3 className="text-base font-semibold">
                                                No Scenes yet
                                            </h3>

                                            <p className="mt-2 max-w-sm text-sm text-[#75877E] dark:text-gray-400">
                                                Short videos will appear here when shared.
                                            </p>
                                        </div>
                                    )}

                                {/* Scenes grid */}
                                {!scenesLoading &&
                                    !scenesError &&
                                    scenesFetched &&
                                    scenes.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                                            {scenes.map((scene) => (
                                                <article
                                                    key={scene.id}
                                                    className="group relative overflow-hidden rounded-2xl bg-[#E9EDE7] dark:bg-gray-800"
                                                >
                                                    <video
                                                        src={scene.video_url}
                                                        controls
                                                        playsInline
                                                        preload="metadata"
                                                        className="aspect-[9/14] w-full object-cover"
                                                    />

                                                    {/* Delete button: only on own profile */}
                                                    {isOwnProfile && (
                                                        <button
                                                            type="button"
                                                            disabled={deletingSceneId === scene.id}
                                                            onClick={() => handleDeleteScene(scene.id)}
                                                            aria-label="Delete Scene"
                                                            title="Delete Scene"
                                                            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-100 backdrop-blur-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                                                        >
                                                            {deletingSceneId === scene.id ? (
                                                                <span className="text-xs">...</span>
                                                            ) : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="17"
                                                                    height="17"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M3 6h18" />
                                                                    <path d="M8 6V4h8v2" />
                                                                    <path d="m19 6-1 14H6L5 6" />
                                                                    <path d="M10 11v5M14 11v5" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    )}

                                                    {scene.caption && (
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
                                                            <p className="line-clamp-2 text-xs font-medium text-white">
                                                                {scene.caption}
                                                            </p>
                                                        </div>
                                                    )}
                                                </article>
                                            ))}

                                        </div>
                                    )}
                            </section>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default MyProfilePage;
