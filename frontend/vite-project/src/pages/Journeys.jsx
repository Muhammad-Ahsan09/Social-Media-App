
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

import {
    FaBookOpen,
    FaPlus,
    FaSearch,
    FaGlobe,
    FaLock,
    FaUsers,
    FaEllipsisH,
    FaTimes,
    FaArrowRight,
    FaRegCalendarAlt,
} from "react-icons/fa";
import JourneyCard from "../components/JourneyCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export default function Journeys() {
    const [activeTab, setActiveTab] = useState("mine");
    const [filter, setFilter] = useState("ongoing");
    const [search, setSearch] = useState("");
    // const [journeys, setJourneys] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newJourney, setNewJourney] = useState({
        title: "",
        description: "",
        visibility: "private",
        coverFile: null,
    });

    const [coverPreview, setCoverPreview] = useState("");

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const {
        data: journeys = [],
        isLoading: journeysLoading,
        isError: journeysError,
        error,
    } = useQuery({
        queryKey: ["myJourneys"],

        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/api/journeys`, {
                method: "GET",
                credentials: "include",
            });

            const data = await res.json();
            console.log(data)

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch Journeys");
            }

            return data.journeys;
        },
    });


    const {
        data: discoverJourneys = [],
        isLoading: discoverLoading,
        isError: discoverError,
        error: discoverErrorMessage,
    } = useQuery({
        queryKey: ["publicJourneys"],

        queryFn: async () => {
            const res = await fetch(
                `${BACKEND_URL}/api/journeys/public?page=1&limit=12`
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to fetch public Journeys"
                );
            }

            return data.journeys;
        },

        enabled: activeTab === "discover",
    });

    const createJourneyMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await fetch(`${BACKEND_URL}/api/journeys`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create Journey");
            }

            return data.journey;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["myJourneys"],
            });

            queryClient.invalidateQueries({
                queryKey: ["publicJourneys"],
            });

            setNewJourney({
                title: "",
                description: "",
                visibility: "private",
                coverFile: null,
            });

            setCoverPreview("");

            setFilter("ongoing");
            setActiveTab("mine");
            setSearch("");
            setShowCreateModal(false);
        },

        onError: (error) => {
            console.error("Create Journey failed:", error);
        },
    });



    const visibleJourneys = useMemo(() => {
        const query = search.trim().toLowerCase();

        return journeys.filter((journey) => {
            const matchesFilter =
                filter === "all" || journey.status === filter;

            const matchesSearch =
                !query ||
                journey.title.toLowerCase().includes(query) ||
                journey.description.toLowerCase().includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [journeys, filter, search]);

    const visibleDiscoverJourneys = useMemo(() => {
        const query = search.trim().toLowerCase();

        return discoverJourneys.filter((journey) => {
            return (
                !query ||
                journey.title?.toLowerCase().includes(query) ||
                journey.description?.toLowerCase().includes(query) ||
                journey.full_name?.toLowerCase().includes(query) ||
                journey.username?.toLowerCase().includes(query)
            );
        });
    }, [discoverJourneys, search]);


    const handleCreateJourney = (event) => {
        event.preventDefault();

        if (!newJourney.title.trim()) return;

        const formData = new FormData();

        formData.append("title", newJourney.title.trim());
        formData.append("description", newJourney.description.trim());
        formData.append("visibility", newJourney.visibility);
        formData.append("status", "ongoing");

        if (newJourney.coverFile) {
            formData.append("cover", newJourney.coverFile);
        }

        createJourneyMutation.mutate(formData);
    };


    const handleOpenJourney = (journey) => {
        // Journey detail page navigation will be connected next.
        navigate(`/journeys/${journey.id}`);
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#F6F7F4] text-[#294C46] transition-colors duration-300 dark:bg-gray-950 dark:text-[#E1EAE4] md:flex-row">

            <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#84948A] dark:text-[#91A99A]">
                                <FaBookOpen />
                                Your stories, your way
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight text-[#294C46] dark:text-[#E1EAE4] sm:text-4xl">
                                Journeys
                            </h1>

                            <p className="mt-2 max-w-lg text-sm leading-6 text-[#7A8980] dark:text-[#AFC0B3]">
                                Every chapter holds a story worth keeping.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#385B50] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#294C46] focus:outline-none focus:ring-2 focus:ring-[#86A895] focus:ring-offset-2 dark:bg-[#D5E5D8] dark:text-[#203A30] dark:hover:bg-[#E4EFE5] dark:focus:ring-offset-[#182823] sm:self-auto"
                        >
                            <FaPlus className="text-xs" />
                            Create Journey
                        </button>
                    </header>

                    {/* Tabs */}
                    <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[#DDE4DD] dark:border-[#344A40]">
                        <div className="flex gap-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("mine");
                                    setSearch("");
                                }}
                                className={`relative pb-3 text-sm transition ${activeTab === "mine"
                                    ? "font-semibold text-[#385B50] dark:text-[#D5E5D8]"
                                    : "text-[#89968D] hover:text-[#385B50] dark:text-[#A6B7AA] dark:hover:text-[#D5E5D8]"
                                    }`}
                            >
                                My Journeys
                                {activeTab === "mine" && (
                                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#527B66] dark:bg-[#B6D4BD]" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("discover");
                                    setSearch("");
                                }}
                                className={`relative pb-3 text-sm transition ${activeTab === "discover"
                                    ? "font-semibold text-[#385B50] dark:text-[#D5E5D8]"
                                    : "text-[#89968D] hover:text-[#385B50] dark:text-[#A6B7AA] dark:hover:text-[#D5E5D8]"
                                    }`}
                            >
                                Discover
                                {activeTab === "discover" && (
                                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#527B66] dark:bg-[#B6D4BD]" />
                                )}
                            </button>
                        </div>

                        <div className="relative mb-2 w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8A9A90]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={
                                    activeTab === "mine"
                                        ? "Search your Journeys..."
                                        : "Search Journeys or people..."
                                }
                                className="h-10 w-full rounded-xl border border-[#DDE4DD] bg-white pl-9 pr-3 text-xs text-[#294C46] outline-none transition placeholder:text-[#9AA59D] focus:border-[#9CB9A5] focus:ring-2 focus:ring-[#DDEBE2] dark:border-[#344A40] dark:bg-[#20342B] dark:text-[#E1EAE4] dark:placeholder:text-[#84998B] dark:focus:border-[#597966] dark:focus:ring-[#30483B]"
                            />
                        </div>
                    </div>

                    {/* My Journeys */}
                    {activeTab === "mine" && (
                        <>
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Your chapters
                                    </h2>
                                    <p className="mt-1 text-xs text-[#89968D] dark:text-[#A6B7AA]">
                                        Your personal collection of life's experiences.
                                    </p>
                                </div>

                                <div className="flex rounded-xl border border-[#DDE4DD] bg-white p-1 dark:border-[#344A40] dark:bg-[#20342B]">
                                    {[
                                        { value: "ongoing", label: "Ongoing" },
                                        { value: "completed", label: "Completed" },
                                        { value: "all", label: "All" },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => setFilter(item.value)}
                                            className={`rounded-lg px-3 py-2 text-[11px] transition ${filter === item.value
                                                ? "bg-[#DDEBE2] font-semibold text-[#294C46] dark:bg-[#385344] dark:text-[#E0F0E5]"
                                                : "text-[#89968D] hover:text-[#385B50] dark:text-[#A6B7AA] dark:hover:text-white"
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {journeysLoading ? (

                                <div className="flex min-h-72 items-center justify-center">
                                    <p className="text-sm text-[#89968D]">
                                        Loading your Journeys...
                                    </p>
                                </div>

                            ) : journeysError ? (

                                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                                    <h3 className="text-lg font-semibold">
                                        Couldn't load your Journeys
                                    </h3>

                                    <p className="mt-2 text-sm text-[#89968D]">
                                        {error.message}
                                    </p>

                                    <button
                                        onClick={() => queryClient.invalidateQueries({
                                            queryKey: ["myJourneys"],
                                        })}
                                        className="mt-4 rounded-xl bg-[#385B50] px-4 py-2 text-sm text-white"
                                    >
                                        Try again
                                    </button>
                                </div>

                            ) : visibleJourneys.length > 0 ? (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {visibleJourneys.map((journey) => (
                                        <JourneyCard
                                            key={journey.id}
                                            journey={journey}
                                            onOpen={handleOpenJourney}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD8CD] px-6 py-12 text-center dark:border-[#40574A]">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7EEE6] text-[#527B66] dark:bg-[#30483B] dark:text-[#C2DCC8]">
                                        <FaBookOpen className="text-xl" />
                                    </div>

                                    <h3 className="text-lg font-semibold">
                                        {search
                                            ? "No Journeys found"
                                            : filter === "completed"
                                                ? "No completed chapters yet"
                                                : "Your next chapter starts here"}
                                    </h3>

                                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#89968D] dark:text-[#A6B7AA]">
                                        {search
                                            ? "Try a different search term."
                                            : "Create a Journey to collect the memories, experiences, and moments that matter to you."}
                                    </p>

                                    {!search && filter !== "completed" && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(true)}
                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#385B50] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#294C46] dark:bg-[#D5E5D8] dark:text-[#203A30]"
                                        >
                                            <FaPlus className="text-xs" />
                                            Create your first Journey
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    {/* Discover */}
                    {activeTab === "discover" && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold">
                                    Stories from others
                                </h2>

                                <p className="mt-1 text-xs text-[#89968D] dark:text-[#A6B7AA]">
                                    Discover the chapters people choose to share with the world.
                                </p>
                            </div>

                            {/* Loading */}
                            {discoverLoading ? (
                                <div className="flex min-h-72 items-center justify-center">
                                    <p className="text-sm text-[#89968D] dark:text-[#A6B7AA]">
                                        Discovering stories...
                                    </p>
                                </div>

                            ) : discoverError ? (

                                /* Error */
                                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                                    <h3 className="text-lg font-semibold">
                                        Couldn't load Discover
                                    </h3>

                                    <p className="mt-2 text-sm text-[#89968D]">
                                        {discoverErrorMessage.message}
                                    </p>

                                    <button
                                        onClick={() =>
                                            queryClient.invalidateQueries({
                                                queryKey: ["publicJourneys"],
                                            })
                                        }
                                        className="mt-4 rounded-xl bg-[#385B50] px-4 py-2 text-sm text-white"
                                    >
                                        Try again
                                    </button>
                                </div>

                            ) : visibleDiscoverJourneys.length > 0 ? (

                                /* Journey Cards */
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                                    {visibleDiscoverJourneys.map((journey) => (
                                        <article
                                            key={journey.id}
                                            className="group min-w-0 overflow-hidden rounded-2xl border border-[#DDE4DD] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#BDCEC1] hover:shadow-lg hover:shadow-[#294C46]/5 dark:border-[#344A40] dark:bg-[#20342B] dark:hover:border-[#526C5B]"
                                        >

                                            {/* Cover */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenJourney(journey)}
                                                className="relative flex h-44 w-full items-end overflow-hidden bg-gradient-to-br from-[#D6E2D1] via-[#A7BFA2] to-[#6D8B75] p-5 text-left sm:h-48"
                                            >
                                                {journey.cover_url && (
                                                    <img
                                                        src={journey.cover_url}
                                                        alt={`${journey.title} cover`}
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                    />
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                                <div className="relative flex w-full items-center justify-between">
                                                    <FaBookOpen className="text-xl text-white" />

                                                    <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
                                                        {Number(journey.entries) || 0} entries
                                                    </span>
                                                </div>
                                            </button>

                                            {/* Details */}
                                            <div className="p-4 sm:p-5">

                                                <h3 className="text-base font-semibold">
                                                    {journey.title}
                                                </h3>

                                                <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#78877F] dark:text-[#ADBCB1]">
                                                    {journey.description || "No description provided."}
                                                </p>

                                                {/* Creator */}
                                                <div className="mt-4 flex items-center gap-3 border-t border-[#EDF0EC] pt-3 dark:border-[#344A40]">

                                                    {journey.profile_pic_url ? (
                                                        <img
                                                            src={journey.profile_pic_url}
                                                            alt={journey.full_name}
                                                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3EBE2] text-xs font-semibold text-[#385B50] dark:bg-[#385344] dark:text-[#D5E5D8]">
                                                            {(journey.full_name || journey.username || "?")
                                                                .split(" ")
                                                                .map((part) => part[0])
                                                                .join("")
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold">
                                                            {journey.full_name || journey.username}
                                                        </p>

                                                        <p className="truncate text-[11px] text-[#89968D] dark:text-[#A6B7AA]">
                                                            @{journey.username}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenJourney(journey)}
                                                        aria-label={`Open ${journey.title}`}
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E7EEE6] text-[#385B50] transition hover:bg-[#D8E5D8] dark:bg-[#30483B] dark:text-[#D5E5D8] dark:hover:bg-[#405B49]"
                                                    >
                                                        <FaArrowRight className="text-xs" />
                                                    </button>

                                                </div>
                                            </div>
                                        </article>
                                    ))}

                                </div>

                            ) : (

                                /* Empty State */
                                <div className="py-16 text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7EEE6] text-[#527B66] dark:bg-[#30483B] dark:text-[#C2DCC8]">
                                            <FaBookOpen className="text-xl" />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold">
                                        {search
                                            ? "No Journeys found"
                                            : "No public Journeys yet"}
                                    </h3>

                                    <p className="mt-2 text-sm text-[#89968D] dark:text-[#A6B7AA]">
                                        {search
                                            ? "Try a different search term."
                                            : "Be among the first to share your story with the world."}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Create Journey Modal */}
                {showCreateModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#14251E]/45 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setShowCreateModal(false);
                            }
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="create-journey-title"
                            className="w-full max-w-lg rounded-2xl border border-[#DDE4DD] bg-[#F9FAF7] p-6 shadow-2xl dark:border-[#40574C] dark:bg-[#20342B] sm:p-8"
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2
                                        id="create-journey-title"
                                        className="text-xl font-semibold"
                                    >
                                        Begin a new chapter
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-[#89968D] dark:text-[#A6B7AA]">
                                        Give your Journey a name. You can add memories as you go.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    aria-label="Close modal"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#78877F] transition hover:bg-[#E8EEE7] dark:text-[#B3C6B9] dark:hover:bg-[#30483B]"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleCreateJourney} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="journey-title"
                                        className="mb-2 block text-xs font-semibold"
                                    >
                                        Journey title
                                    </label>

                                    <input
                                        id="journey-title"
                                        type="text"
                                        maxLength={100}
                                        required
                                        autoFocus
                                        value={newJourney.title}
                                        onChange={(event) =>
                                            setNewJourney((previous) => ({
                                                ...previous,
                                                title: event.target.value,
                                            }))
                                        }
                                        placeholder="e.g. My University Years"
                                        className="h-11 w-full rounded-xl border border-[#D6DFD9] bg-white px-4 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#86A895] focus:ring-2 focus:ring-[#DDEBE2] dark:border-[#40574C] dark:bg-[#182823] dark:text-[#E1EAE4] dark:placeholder:text-[#84998B] dark:focus:border-[#6B967C] dark:focus:ring-[#30483B]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="journey-description"
                                        className="mb-2 block text-xs font-semibold"
                                    >
                                        Description
                                        <span className="ml-2 font-normal text-[#89968D]">
                                            Optional
                                        </span>
                                    </label>

                                    <textarea
                                        id="journey-description"
                                        rows={3}
                                        maxLength={500}
                                        value={newJourney.description}
                                        onChange={(event) =>
                                            setNewJourney((previous) => ({
                                                ...previous,
                                                description: event.target.value,
                                            }))
                                        }
                                        placeholder="What is this chapter about?"
                                        className="w-full resize-none rounded-xl border border-[#D6DFD9] bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-[#A0AAA2] focus:border-[#86A895] focus:ring-2 focus:ring-[#DDEBE2] dark:border-[#40574C] dark:bg-[#182823] dark:text-[#E1EAE4] dark:placeholder:text-[#84998B] dark:focus:border-[#6B967C] dark:focus:ring-[#30483B]"
                                    />
                                </div>


                                {/* Journey Cover Image */}
                                <div>
                                    <label
                                        htmlFor="journey-cover"
                                        className="mb-2 block text-xs font-semibold"
                                    >
                                        Cover image
                                        <span className="ml-2 font-normal text-[#89968D]">
                                            Optional
                                        </span>
                                    </label>

                                    <label
                                        htmlFor="journey-cover"
                                        className="group relative flex min-h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#C8D7CA] bg-[#EDF2EB] transition hover:border-[#86A895] dark:border-[#40574C] dark:bg-[#182823]"
                                    >
                                        {coverPreview ? (
                                            <>
                                                <img
                                                    src={coverPreview}
                                                    alt="Journey cover preview"
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />

                                                <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />

                                                <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-[#294C46] shadow-sm">
                                                    Change cover
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center px-5 py-7 text-center">
                                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#527B66] shadow-sm dark:bg-[#30483B] dark:text-[#D5E5D8]">
                                                    <FaPlus />
                                                </div>

                                                <span className="text-sm font-medium">
                                                    Choose a cover image
                                                </span>

                                                <span className="mt-1 text-xs text-[#89968D] dark:text-[#A6B7AA]">
                                                    JPG, PNG or WebP
                                                </span>
                                            </div>
                                        )}

                                        <input
                                            id="journey-cover"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="sr-only"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;

                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert("Please choose an image smaller than 5 MB.");
                                                    event.target.value = "";
                                                    return;
                                                }

                                                setNewJourney((previous) => ({
                                                    ...previous,
                                                    coverFile: file,
                                                }));

                                                setCoverPreview(URL.createObjectURL(file));
                                            }}
                                        />
                                    </label>

                                    {coverPreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewJourney((previous) => ({
                                                    ...previous,
                                                    coverFile: null,
                                                }));
                                                setCoverPreview("");

                                                const input = document.getElementById("journey-cover");
                                                if (input) input.value = "";
                                            }}
                                            className="mt-2 text-xs font-medium text-[#89968D] transition hover:text-red-500"
                                        >
                                            Remove cover image
                                        </button>
                                    )}
                                </div>


                                <div>
                                    <label
                                        htmlFor="journey-visibility"
                                        className="mb-2 block text-xs font-semibold"
                                    >
                                        Who can see this Journey?
                                    </label>

                                    <select
                                        id="journey-visibility"
                                        value={newJourney.visibility}
                                        onChange={(event) =>
                                            setNewJourney((previous) => ({
                                                ...previous,
                                                visibility: event.target.value,
                                            }))
                                        }
                                        className="h-11 w-full rounded-xl border border-[#D6DFD9] bg-white px-3 text-sm outline-none focus:border-[#86A895] dark:border-[#40574C] dark:bg-[#182823] dark:text-[#E1EAE4]"
                                    >
                                        <option value="private">Only me</option>
                                        <option value="public">Public</option>
                                        <option value="followers">Followers</option>
                                    </select>

                                    <p className="mt-2 text-[11px] leading-5 text-[#89968D] dark:text-[#A6B7AA]">
                                        You can change your Journey's visibility later.
                                    </p>
                                </div>

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="h-11 rounded-xl border border-[#D6DFD9] px-5 text-sm font-medium transition hover:bg-[#EDF1EB] dark:border-[#40574C] dark:hover:bg-[#30483B]"
                                    >
                                        Cancel
                                    </button>
                                    {createJourneyMutation.isError && (
                                        <p className="text-sm text-red-500">
                                            {createJourneyMutation.error.message}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={createJourneyMutation.isPending}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#385B50] px-5 text-sm font-medium text-white transition hover:bg-[#294C46] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#D5E5D8] dark:text-[#203A30]"
                                    >
                                        {createJourneyMutation.isPending ? (
                                            "Creating..."
                                        ) : (
                                            <>
                                                <FaPlus className="text-xs" />
                                                Create Journey
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
