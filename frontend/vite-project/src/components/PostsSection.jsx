
import { useEffect, useState } from "react";
// https://r7s68t0l-5173.inc1.devtunnels.ms/
const dummyMoments = [
  {
    id: 1,
    name: "Ayesha",
    avatar: "https://i.pravatar.cc/150?img=47",
    image: "https://picsum.photos/seed/solace-ayesha/300/480",
    hasUnseen: true,
  },
  {
    id: 2,
    name: "Hamza",
    avatar: "https://i.pravatar.cc/150?img=12",
    image: "https://picsum.photos/seed/solace-hamza/300/480",
    hasUnseen: true,
  },
  {
    id: 3,
    name: "Zara",
    avatar: "https://i.pravatar.cc/150?img=44",
    image: "https://picsum.photos/seed/solace-zara/300/480",
    hasUnseen: false,
  },
  {
    id: 4,
    name: "Usman",
    avatar: "https://i.pravatar.cc/150?img=11",
    image: "https://picsum.photos/seed/solace-usman/300/480",
    hasUnseen: true,
  },
  {
    id: 5,
    name: "Fatima",
    avatar: "https://i.pravatar.cc/150?img=49",
    image: "https://picsum.photos/seed/solace-fatima/300/480",
    hasUnseen: true,
  },
  {
    id: 6,
    name: "Ali",
    avatar: "https://i.pravatar.cc/150?img=13",
    image: "https://picsum.photos/seed/solace-ali/300/480",
    hasUnseen: false,
  },
  {
    id: 7,
    name: "Noor",
    avatar: "https://i.pravatar.cc/150?img=45",
    image: "https://picsum.photos/seed/solace-noor/300/480",
    hasUnseen: true,
  },
];

const MomentsSection = () => {
  const [moments, setMoments] = useState(dummyMoments);
  const [activeMoment, setActiveMoment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMomentImage, setNewMomentImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setNewMomentImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreateMoment = (e) => {
    e.preventDefault();

    if (!previewUrl) return;

    const newMoment = {
      id: Date.now(),
      name: "You",
      avatar: previewUrl,
      image: previewUrl,
      hasUnseen: true,
      isOwn: true,
    };

    setMoments((previous) => [
      ...previous.filter((moment) => !moment.isOwn),
      newMoment,
    ]);

    setShowCreateModal(false);
    setNewMomentImage(null);
    setPreviewUrl("");
  };

  const handleOpenMoment = (moment) => {
    setActiveMoment(moment);

    setMoments((previous) =>
      previous.map((item) =>
        item.id === moment.id
          ? { ...item, hasUnseen: false }
          : item
      )
    );
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewMomentImage(null);
    setPreviewUrl("");
  };

  return (
    <>
      <section className="w-full min-w-0 py-2 text-[#294C46] dark:text-[#E1EAE4]">
        {/* Section heading */}
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Moments
              </h2>

              <span className="rounded-full bg-[#E3ECE4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#397E6D] dark:bg-[#293D30] dark:text-[#A9DCC8]">
                Today
              </span>
            </div>

            <p className="mt-1 text-xs text-[#78877F] dark:text-[#9EB1A4]">
              Little glimpses of life
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D6DFD9] bg-white px-3 py-2 text-xs font-semibold text-[#397E6D] shadow-sm transition hover:border-[#A9C6B5] hover:bg-[#F5F8F4] dark:border-[#40574C] dark:bg-[#24352B] dark:text-[#A9DCC8] dark:hover:bg-[#304438]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add moment
          </button>
        </div>

        {/* Horizontal moments feed */}
        <div className="flex gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
          {/* Create moment card */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="group relative h-[155px] w-[108px] shrink-0 overflow-hidden rounded-2xl border border-[#D6DFD9] bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#40574C] dark:bg-[#24352B] sm:h-[175px] sm:w-[120px]"
          >
            {moments.some((moment) => moment.isOwn) ? (
              <img
                src={moments.find((moment) => moment.isOwn).image}
                alt="Your latest moment"
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#F7F8F5] to-[#E5EDE6] dark:from-[#293D30] dark:to-[#1B2A21]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D6DFD9] bg-white text-[#397E6D] shadow-sm transition group-hover:scale-105 dark:border-[#40574C] dark:bg-[#24352B] dark:text-[#A9DCC8]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-[#536E62] dark:text-[#C4D9CC]">
                  Share a moment
                </span>
              </div>
            )}

            {moments.some((moment) => moment.isOwn) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-2 pb-3 pt-10">
                <span className="text-xs font-semibold text-white">
                  Your moments
                </span>
              </div>
            )}

            <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#397E6D] text-white shadow-sm dark:border-[#24352B]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>

          {/* Other users' moments */}
          {moments
            .filter((moment) => !moment.isOwn)
            .map((moment) => (
              <button
                key={moment.id}
                type="button"
                onClick={() => handleOpenMoment(moment)}
                className={`group relative h-[155px] w-[108px] shrink-0 overflow-hidden rounded-2xl border bg-[#E5EDE6] text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-[#1B2D23] sm:h-[175px] sm:w-[120px] ${
                  moment.hasUnseen
                    ? "border-[#A9C6B5] dark:border-[#587866]"
                    : "border-[#D6DFD9] dark:border-[#40574C]"
                }`}
              >
                <img
                  src={moment.image}
                  alt={`${moment.name}'s moment`}
                  className={`absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
                    moment.hasUnseen
                      ? ""
                      : "brightness-[0.88]"
                  }`}
                />

                {/* Soft image overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75" />

                {/* User avatar */}
                <div
                  className={`absolute left-2.5 top-2.5 rounded-full p-[2px] ${
                    moment.hasUnseen
                      ? "bg-gradient-to-tr from-[#78C9CD] to-[#A9DCC8]"
                      : "bg-white/70"
                  }`}
                >
                  <img
                    src={moment.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full border border-white/80 object-cover"
                  />
                </div>

                {/* User name */}
                <div className="absolute inset-x-0 bottom-0 px-2.5 pb-3 pt-8">
                  <p className="truncate text-xs font-semibold text-white">
                    {moment.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/75">
                    {moment.hasUnseen ? "New moment" : "Viewed"}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </section>

      {/* Create Moment Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleCloseCreateModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] shadow-2xl dark:border-[#344A43] dark:bg-[#1D3028]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D6DFD9] px-5 py-4 dark:border-[#344A43]">
              <div>
                <h3 className="font-semibold">Create a Moment</h3>
                <p className="mt-1 text-xs text-[#78877F] dark:text-[#9EB1A4]">
                  Share a little piece of your day.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                aria-label="Close modal"
                className="rounded-full p-2 text-[#78877F] transition hover:bg-[#E9EFEB] dark:text-[#9EB1A4] dark:hover:bg-[#304438]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMoment} className="p-5">
              <label
                htmlFor="moment-image"
                className="flex min-h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#CBD8CE] bg-[#E9EFEB] text-center transition hover:border-[#397E6D] dark:border-[#40574C] dark:bg-[#17251F] dark:hover:border-[#78BFA7]"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Moment preview"
                    className="max-h-80 w-full object-contain"
                  />
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#397E6D] dark:bg-[#253A31] dark:text-[#A9DCC8]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23"
                        height="23"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">
                      Choose a photo
                    </span>
                    <span className="mt-1 text-xs text-[#78877F] dark:text-[#9EB1A4]">
                      Select an image from your device
                    </span>
                  </>
                )}
              </label>

              <input
                id="moment-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="sr-only"
              />

              <button
                type="submit"
                disabled={!newMomentImage}
                className="mt-5 w-full rounded-xl bg-[#397E6D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2F6B5C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Share Moment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Moment Viewer */}
      {activeMoment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setActiveMoment(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-[#1D3028] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-3 right-3 top-3 z-10 h-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full w-full rounded-full bg-white" />
            </div>

            <div className="absolute left-4 right-4 top-7 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={activeMoment.avatar}
                  alt=""
                  className="h-9 w-9 rounded-full border border-white/50 object-cover"
                />
                <span className="text-sm font-medium text-white">
                  {activeMoment.name}
                </span>
              </div>

              <button
                type="button"
                aria-label="Close moment"
                onClick={() => setActiveMoment(null)}
                className="rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
              >
                ✕
              </button>
            </div>

            <img
              src={activeMoment.image}
              alt={`${activeMoment.name}'s moment`}
              className="max-h-[85vh] min-h-[400px] w-full object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MomentsSection;
