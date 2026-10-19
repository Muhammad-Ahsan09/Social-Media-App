
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

function JourneyEntry({ entry }) {
  return (
    <article className="relative pb-9 pl-10">
      {/* Timeline marker */}
      <span className="absolute left-[3px] top-1 flex h-6 w-6
        items-center justify-center rounded-full border
        border-[#C8D8CD] bg-[#E7EFE9] text-[#456B59]
        dark:border-[#415B4A] dark:bg-[#293D30]
        dark:text-[#C4D9C9]">
        <FaCamera size={10} />
      </span>

      <p className="mb-2 text-xs font-medium uppercase tracking-wider
        text-[#7A8C80] dark:text-[#A4B8AA]">
        {entry.createdAt}
      </p>

      <div className="rounded-2xl border border-[#DCE5DE]
        bg-white p-5 dark:border-[#34483D] dark:bg-[#1D2B24]">
        <h2 className="text-lg font-semibold text-[#294C46]
          dark:text-[#E0EBE2]">
          {entry.title}
        </h2>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-7
          text-[#64766B] dark:text-[#B3C6B9]">
          {entry.text}
        </p>

        <div className="mt-4 flex items-center gap-4
          text-xs text-[#7A8C80] dark:text-[#A4B8AA]">
          <span className="inline-flex items-center gap-1.5">
            <FaHeart /> Memories
          </span>
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
  const [error, setError] = useState("");
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryError, setEntryError] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryText, setEntryText] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const controller = new AbortController();

    const getJourney = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Journey ID:", journeyId);
        console.log("Backend URL:", BACKEND_URL);

        if (!journeyId) {
          throw new Error("Journey ID is missing from the URL");
        }

        const res = await fetch(
          `${BACKEND_URL}/api/journeys/${journeyId}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await res.json();

        console.log("Journey API response:", data);

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch Journey");
        }

        setJourney(data.journey);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching Journey:", err);
          setError(err.message || "Failed to load Journey");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getJourney();

    return () => controller.abort();
  }, [journeyId]);

  // Temporary mock-data lookup. Replace with an API request later.
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

    if (!entryTitle.trim() && !entryText.trim()) {
      setEntryError("Please enter a title or reflection.");
      return;
    }

    try {
      setSavingEntry(true);
      setEntryError("");

      const response = await fetch(
        `${BACKEND_URL}/api/journeys/${journeyId}/entries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: entryTitle.trim() || null,
            content: entryText.trim() || null,
            entry_date: `${entryDate} 12:00:00`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save memory.");
      }

      // Adapt this line if your controller uses a different response key.
      const savedEntry = data.entry;

      if (!savedEntry) {
        throw new Error("Memory was saved, but no entry was returned.");
      }

      // Map the backend entry into the format expected by JourneyEntry.
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
      };

      setJourney((current) => ({
        ...current,
        entries: [...(current.entries || []), formattedEntry].sort(
          (a, b) => a.date.localeCompare(b.date)
        ),
      }));

      // Reset the form after a successful save.
      setEntryTitle("");
      setEntryText("");
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
        <section className={`relative overflow-hidden rounded-3xl
          ${journey.cover} px-6 py-10 text-white sm:px-10 sm:py-14`}>

          <div className="absolute -right-12 -top-12 h-48 w-48
            rounded-full border border-white/15" />
          <div className="absolute -right-4 -top-4 h-32 w-32
            rounded-full border border-white/15" />

          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2
              rounded-full bg-black/15 px-3 py-1.5 text-xs">
              <VisibilityIcon />
              {visibility.label} Journey
            </div>

            <h1 className="text-3xl font-semibold tracking-tight
              sm:text-4xl">
              {journey.title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7
              text-white/85 sm:text-base">
              {journey.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4
              text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <FaBookOpen />
                {journey.entries.length} entries
              </span>

              <span className="inline-flex items-center gap-2">
                <FaCalendarAlt />
                {journey.status === "ongoing"
                  ? "In progress"
                  : "Completed"}
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
                onClick={() =>
                  alert("Connect this button to Journey editing.")
                }
                className="inline-flex items-center gap-2 rounded-xl
                  border border-white/35 bg-white/10 px-4 py-2.5
                  text-sm font-medium transition hover:bg-white/20"
              >
                Edit Journey
              </button>

              <button
                onClick={() =>
                  alert("Sharing will be implemented with permissions.")
                }
                aria-label="Share Journey"
                className="flex h-10 w-10 items-center justify-center
                  rounded-xl border border-white/35 transition
                  hover:bg-white/20"
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
                <JourneyEntry key={entry.id} entry={entry} />
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
                onClick={() => setShowEntryForm(false)}
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
