
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaCamera,
  FaEllipsisH,
  FaGlobe,
  FaHeart,
  FaLock,
  FaPlus,
  FaShareAlt,
  FaUsers,
} from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const visibilityOptions = {
  private: { label: "Only me", Icon: FaLock },
  public: { label: "Public", Icon: FaGlobe },
  followers: { label: "Followers", Icon: FaUsers },
};

function JourneyEntry({ entry, onAddMedia, uploadingMedia, mediaUploadError }) {
  const media = entry.media || [];

  return (
    <article className="relative pb-9 pl-10">
      {/* Timeline marker */}
      <span
        className="absolute left-[3px] top-1 flex h-6 w-6
          items-center justify-center rounded-full border
          border-[#C8D8CD] bg-[#E7EFE9] text-[#456B59]
          dark:border-[#415B4A] dark:bg-[#293D30]
          dark:text-[#C4D9C9]"
      >
        <FaCamera size={10} />
      </span>

      {/* Entry date */}
      <p
        className="mb-2 text-xs font-medium uppercase tracking-wider
          text-[#7A8C80] dark:text-[#A4B8AA]"
      >
        {entry.createdAt ||
          (entry.entry_date
            ? new Date(entry.entry_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            : "")}
      </p>

      {/* Entry card */}
      <div
        className="overflow-hidden rounded-2xl border border-[#DCE5DE]
          bg-white dark:border-[#34483D] dark:bg-[#1D2B24]"
      >
        <div className="p-5">
          {/* Title */}
          {entry.title && (
            <h2
              className="text-lg font-semibold text-[#294C46]
                dark:text-[#E0EBE2]"
            >
              {entry.title}
            </h2>
          )}

          {/* Reflection */}
          {(entry.text || entry.content) && (
            <p
              className="mt-2 whitespace-pre-wrap text-sm leading-7
                text-[#64766B] dark:text-[#B3C6B9]"
            >
              {entry.text || entry.content}
            </p>
          )}
        </div>

        {/* Media gallery */}
        {media.length > 0 && (
          <div
            className={`grid gap-1.5 px-5 pb-5 ${media.length === 1
              ? "grid-cols-1"
              : "grid-cols-2"
              }`}
          >
            {media.map((item) => (
              <div
                key={item.id || item.media_url}
                className="min-w-0 overflow-hidden rounded-xl
                  bg-[#EDF1ED] dark:bg-[#142019]"
              >
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    controls
                    preload="metadata"
                    playsInline
                    className="max-h-[420px] w-full object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <a
                    href={item.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    aria-label={`View ${item.caption || "memory image"
                      } in full size`}
                  >
                    <img
                      src={item.media_url}
                      alt={item.caption || entry.title || "Memory photo"}
                      loading="lazy"
                      className="max-h-[420px] w-full object-cover
                        transition-opacity hover:opacity-90"
                    />
                  </a>
                )}

                {item.caption && (
                  <p
                    className="px-3 py-2 text-xs leading-5
                      text-[#64766B] dark:text-[#B3C6B9]"
                  >
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add media to this existing memory */}
        <div className="px-5 pb-4">
          <label
            className={`inline-flex cursor-pointer items-center gap-2
            rounded-lg border border-[#C8D8CD] px-3 py-2
            text-sm font-medium text-[#456B59] transition
            hover:bg-[#EDF3EE]
            dark:border-[#415B4A] dark:text-[#C4D9C9]
            dark:hover:bg-[#293D30]
            ${uploadingMedia ? "pointer-events-none opacity-60" : ""}`}
          >
            <FaPlus />

            {uploadingMedia ? "Uploading media..." : "Add media"}

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              disabled={uploadingMedia}
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                onAddMedia(entry.id, files);

                // Allow selecting the same file again later
                e.target.value = "";
              }}
            />
          </label>

          {mediaUploadError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {mediaUploadError}
            </p>
          )}
        </div>

        {/* Entry footer */}
        <div
          className="flex items-center gap-4 border-t border-[#EDF0EC]
            px-5 py-3 text-xs text-[#7A8C80]
            dark:border-[#34483D] dark:text-[#A4B8AA]"
        >
          <span className="inline-flex items-center gap-1.5">
            <FaHeart />
            Memory
          </span>

          {media.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <FaCamera />
              {media.length} {media.length === 1 ? "attachment" : "attachments"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function JourneyDetails() {
  const { journeyId } = useParams();
  const navigate = useNavigate();

  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingMediaEntryId, setUploadingMediaEntryId] = useState(null);
  const [mediaUploadError, setMediaUploadError] = useState("");
  const [error, setError] = useState("");
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryError, setEntryError] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryText, setEntryText] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const fetchJourneyDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Fetch journey details
        const journeyResponse = await fetch(
          `${BACKEND_URL}/api/journeys/${journeyId}`,
          {
            credentials: "include",
          }
        );

        const journeyData = await journeyResponse.json();

        if (!journeyResponse.ok || !journeyData.success) {
          throw new Error(
            journeyData.message || "Failed to fetch journey"
          );
        }

        // 2. Fetch journey entries, including their media
        const entriesResponse = await fetch(
          `${BACKEND_URL}/api/journeys/${journeyId}/entries`,
          {
            credentials: "include",
          }
        );

        const entriesData = await entriesResponse.json();

        if (!entriesResponse.ok || !entriesData.success) {
          throw new Error(
            entriesData.message || "Failed to fetch journey entries"
          );
        }

        // 3. Combine journey details with the fetched entries
        setJourney({
          ...journeyData.journey,
          entries: entriesData.entries || [],
        });
      } catch (error) {
        console.error("Fetch Journey Details Error:", error);
        setError(error.message || "Failed to load journey");
      } finally {
        setLoading(false);
      }
    };

    if (journeyId) {
      fetchJourneyDetails();
    }
  }, [journeyId]);

  const handleAddMedia = async (entryId, files) => {
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      setMediaUploadError("You can upload a maximum of 10 files at once.");
      return;
    }

    try {
      setUploadingMediaEntryId(entryId);
      setMediaUploadError("");

      const formData = new FormData();

      files.forEach((file) => {
        formData.append("media", file);
      });

      // Upload media to the existing memory
      const response = await fetch(
        `${BACKEND_URL}/api/journeys/${journeyId}/entries/${entryId}/media`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload media.");
      }

      // Refresh entries so the UI receives the latest media
      const entriesResponse = await fetch(
        `${BACKEND_URL}/api/journeys/${journeyId}/entries`,
        {
          credentials: "include",
        }
      );

      const entriesData = await entriesResponse.json();

      if (!entriesResponse.ok || !entriesData.success) {
        throw new Error(
          entriesData.message || "Media uploaded, but refreshing memories failed."
        );
      }

      setJourney((current) => ({
        ...current,
        entries: entriesData.entries || [],
      }));
    } catch (error) {
      console.error("Add Journey Media Error:", error);
      setMediaUploadError(error.message || "Failed to upload media.");
    } finally {
      setUploadingMediaEntryId(null);
    }
  };


  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] p-8 text-center
      text-[#294C46] dark:bg-[#142019] dark:text-[#E0EBE2]">
        Loading Journey...
      </main>
    );
  }

  if (error || !journey) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] p-8 text-center
      text-[#294C46] dark:bg-[#142019] dark:text-[#E0EBE2]">
        <h1 className="text-xl font-semibold">
          {error === "Journey not found"
            ? "Journey not found"
            : "Unable to load Journey"}
        </h1>

        <p className="mt-2 text-sm text-gray-500">{error}</p>

        <button
          onClick={() => navigate("/journeys")}
          className="mt-5 rounded-xl bg-[#DDEBE2] px-4 py-2
          text-sm font-medium text-[#294C46]"
        >
          Back to Journeys
        </button>
      </main>
    );
  }

  const visibility =
    visibilityOptions[journey.visibility] || visibilityOptions.private;

  const VisibilityIcon = visibility.Icon;



  const handleAddEntry = async (e) => {
    e.preventDefault();

    if (!entryTitle.trim() && !entryText.trim() && selectedFiles.length === 0) {
      setEntryError("Add a title, reflection, or media file.");
      return;
    }

    try {
      setSavingEntry(true);
      setEntryError("");

      const formData = new FormData();

      formData.append("title", entryTitle.trim());
      formData.append("content", entryText.trim());
      formData.append("entry_date", `${entryDate} 12:00:00`);

      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      const response = await fetch(
        `${BACKEND_URL}/api/journeys/${journeyId}/entries`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save memory.");
      }

      const savedEntry = data.entry;

      if (!savedEntry) {
        throw new Error("Memory was saved, but no entry was returned.");
      }

      const formattedEntry = {
        id: savedEntry.id,
        title: savedEntry.title || "Untitled memory",
        text: savedEntry.content ?? "",
        date: savedEntry.entry_date
          ? String(savedEntry.entry_date).slice(0, 10)
          : entryDate,
        createdAt: new Date(
          savedEntry.entry_date || `${entryDate}T12:00:00`
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        media: savedEntry.media || [],
      };

      setJourney((current) => ({
        ...current,
        entries: [...(current.entries || []), formattedEntry].sort(
          (a, b) => a.date.localeCompare(b.date)
        ),
      }));

      setEntryTitle("");
      setEntryText("");
      setSelectedFiles([]);
      setEntryDate(new Date().toISOString().slice(0, 10));
      setShowEntryForm(false);
    } catch (error) {
      console.error("Add memory error:", error);
      setEntryError(error.message || "Something went wrong.");
    } finally {
      setSavingEntry(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] px-4 py-6
      text-[#294C46] dark:bg-[#142019] dark:text-[#E0EBE2]
      sm:px-8 lg:px-12">

      <div className="mx-auto max-w-4xl">
        {/* Back navigation */}
        <Link
          to="/journeys"
          className="mb-6 inline-flex items-center gap-2
            text-sm text-[#64766B] transition hover:text-[#294C46]
            dark:text-[#B3C6B9] dark:hover:text-white"
        >
          <FaArrowLeft />
          Back to Journeys
        </Link>

        {/* Journey cover */}
        <section
          className={`relative overflow-hidden rounded-3xl
          ${journey.cover || "bg-gradient-to-br from-[#789786] to-[#294C46]"}
          px-6 py-10 text-white sm:px-10 sm:py-14`}
        >
          {/* Actual cover image */}
          {journey.cover && (
            <img
              src={journey.cover}
              alt={`${journey.title} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/35" />

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48
    rounded-full border border-white/20" />
          <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32
    rounded-full border border-white/20" />

          {/* Journey details */}
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2
      rounded-full border border-white/20 bg-black/20
      px-3 py-1.5 text-xs backdrop-blur-sm">
              <VisibilityIcon visibility={journey.visibility} />
              {visibility.label} Journey
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {journey.title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
              {journey.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4
      text-sm text-white/90">
              <span className="inline-flex items-center gap-2">
                <FaBookOpen />
                {journey.entries.length} entries
              </span>

              <span className="inline-flex items-center gap-2">
                <FaCalendarAlt />
                {journey.status === "ongoing" ? "In progress" : "Completed"}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setShowEntryForm(true)}
                className="inline-flex items-center gap-2 rounded-xl
          bg-white px-4 py-2.5 text-sm font-semibold
          text-[#294C46] transition hover:bg-[#EDF3EE]"
              >
                <FaPlus />
                Add memory
              </button>

              <button
                onClick={() => alert("Connect this button to Journey editing.")}
                className="inline-flex items-center gap-2 rounded-xl
          border border-white/40 bg-white/10 px-4 py-2.5
          text-sm font-medium backdrop-blur-sm transition hover:bg-white/20"
              >
                Edit Journey
              </button>

              <button
                onClick={() =>
                  alert("Sharing will be implemented with permissions.")
                }
                aria-label="Share Journey"
                className="flex h-10 w-10 items-center justify-center
          rounded-xl border border-white/40 bg-white/10
          backdrop-blur-sm transition hover:bg-white/20"
              >
                <FaShareAlt />
              </button>
            </div>
          </div>
        </section>

        {/* Timeline heading */}
        <section className="mt-10">
          <div className="mb-7 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase
                tracking-[0.18em] text-[#819387]">
                Your story, unfolding
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Journey timeline
              </h2>
            </div>

            <span className="text-sm text-[#7A8C80]
              dark:text-[#A4B8AA]">
              {journey.entries.length} memories
            </span>
          </div>

          {journey.entries.length > 0 ? (
            <div className="relative">
              <div className="absolute bottom-10 left-[14px] top-2
                w-px bg-[#D5E0D8] dark:bg-[#34483D]" />

              {journey.entries.map((entry) => (
                <JourneyEntry
                  key={entry.id}
                  entry={entry}
                  onAddMedia={handleAddMedia}
                  uploadingMedia={uploadingMediaEntryId === entry.id}
                  mediaUploadError={
                    mediaUploadError && uploadingMediaEntryId === entry.id
                      ? mediaUploadError
                      : ""
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed
              border-[#C8D8CD] px-6 py-12 text-center
              dark:border-[#415B4A]">
              <FaBookOpen className="mx-auto text-3xl
                text-[#91A99A]" />
              <h3 className="mt-4 font-semibold">
                Your story starts here
              </h3>
              <p className="mt-2 text-sm text-[#7A8C80]
                dark:text-[#A4B8AA]">
                Add your first memory to begin this Journey.
              </p>
              <button
                onClick={() => setShowEntryForm(true)}
                className="mt-5 rounded-xl bg-[#DDEBE2] px-4 py-2
                  text-sm font-semibold text-[#294C46]"
              >
                Add your first memory
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Add memory modal */}
      {showEntryForm && (
        <div
          className="fixed inset-0 z-50 flex items-center
            justify-center bg-black/45 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowEntryForm(false);
            }
          }}
        >
          <form
            onSubmit={handleAddEntry}
            className="w-full max-w-lg rounded-2xl border
              border-[#DCE5DE] bg-[#F9FAF7] p-6 shadow-xl
              dark:border-[#34483D] dark:bg-[#1D2B24]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Add a memory
                </h2>
                <p className="mt-1 text-sm text-[#7A8C80]
                  dark:text-[#A4B8AA]">
                  Add another moment to your story.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEntryForm(false);
                  setEntryError("");
                }}
                className="rounded-lg p-2 hover:bg-[#E9EFEB]
                  dark:hover:bg-[#304238]"
                aria-label="Close modal"
              >
                <FaEllipsisH />
              </button>
            </div>

            <label className="mt-6 block text-sm font-medium">
              Memory title
              <input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="Give this memory a name"
                className="mt-2 w-full rounded-xl border
                  border-[#D6DFD9] bg-white px-4 py-3 text-sm
                  outline-none focus:border-[#829D8A]
                  dark:border-[#415348] dark:bg-[#142019]"
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Date
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="mt-2 w-full rounded-xl border
                  border-[#D6DFD9] bg-white px-4 py-3 text-sm
                  outline-none focus:border-[#829D8A]
                  dark:border-[#415348] dark:bg-[#142019]"
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Your reflection
              <textarea
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="What do you want to remember about this day?"
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border
                  border-[#D6DFD9] bg-white px-4 py-3 text-sm
                  outline-none focus:border-[#829D8A]
                  dark:border-[#415348] dark:bg-[#142019]"
              />
            </label>

            {/* Media upload */}
            <div className="mt-5">
              <label className="block text-sm font-medium">
                Photos and videos
                <span className="ml-2 text-xs font-normal text-[#82958A]">
                  Optional
                </span>
              </label>

              <label
                className="mt-2 flex cursor-pointer flex-col items-center
      justify-center rounded-xl border border-dashed
      border-[#C8D8CD] bg-[#F1F5F1] px-4 py-6
      transition hover:border-[#829D8A] hover:bg-[#E9F0EA]
      dark:border-[#415348] dark:bg-[#19271F]
      dark:hover:bg-[#24362B]"
              >
                <FaCamera className="text-2xl text-[#668675]" />

                <span className="mt-3 text-sm font-medium">
                  Choose photos or videos
                </span>

                <span className="mt-1 text-xs text-[#7A8C80] dark:text-[#A4B8AA]">
                  Select multiple files
                </span>

                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    setSelectedFiles(Array.from(e.target.files || []));
                    setEntryError("");
                  }}
                />
              </label>

              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="flex items-center justify-between gap-3
            rounded-lg border border-[#DCE5DE] bg-white
            px-3 py-2 text-sm dark:border-[#34483D]
            dark:bg-[#142019]"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {file.type.startsWith("video/") ? (
                          <FaBookOpen className="shrink-0 text-[#668675]" />
                        ) : (
                          <FaCamera className="shrink-0 text-[#668675]" />
                        )}

                        <span className="truncate">{file.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFiles((files) =>
                            files.filter((_, i) => i !== index)
                          )
                        }
                        className="shrink-0 text-xs font-medium
              text-red-600 hover:text-red-700"
                        aria-label={`Remove ${file.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <p className="text-xs text-[#7A8C80] dark:text-[#A4B8AA]">
                    {selectedFiles.length} file(s) selected
                  </p>
                </div>
              )}
            </div>

            {/* Upload error */}
            {entryError && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {entryError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEntryForm(false)}
                className="rounded-xl px-4 py-2.5 text-sm
                  text-[#64766B] hover:bg-[#E9EFEB]
                  dark:text-[#B3C6B9] dark:hover:bg-[#304238]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingEntry}
                className="rounded-xl bg-[#527568] px-5 py-2.5
                text-sm font-semibold text-white transition hover:bg-[#426455]
                disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEntry ? "Saving..." : "Save memory"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
