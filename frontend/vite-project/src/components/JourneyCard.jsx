import { FaArrowRight, FaBookOpen, FaGlobe, FaLock, FaRegCalendarAlt, FaUsers } from "react-icons/fa";



function VisibilityIcon({ visibility }) {
  if (visibility === "public") {
    return <FaGlobe />;
  }

  if (visibility === "followers") {
    return <FaUsers />;
  }

  return <FaLock />;
}


function JourneyCard({ journey, onOpen }) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-[#DDE4DD] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#BDCEC1] hover:shadow-lg hover:shadow-[#294C46]/5 dark:border-[#344A40] dark:bg-[#20342B] dark:hover:border-[#526C5B]">
      {/* Cover */}
      <button
        type="button"
        onClick={() => onOpen(journey)}
        className={`relative flex h-44 w-full items-end overflow-hidden bg-gradient-to-br ${journey.cover} p-5 text-left sm:h-48`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 transition-opacity group-hover:from-black/40" />

        <div className="relative flex w-full items-end justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white backdrop-blur-sm">
            <FaBookOpen className="h-4 w-4" />
          </div>

          <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {journey.entries} entries
          </span>
        </div>
      </button>

      {/* Details */}
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-semibold leading-snug text-[#294C46] dark:text-[#E0EAE2]">
            {journey.title}
          </h3>

          <span
            title={
              journey.visibility === "public"
                ? "Public"
                : journey.visibility === "followers"
                  ? "Followers only"
                  : "Only me"
            }
            className="mt-1 shrink-0 text-[#82958A] dark:text-[#A6BBAA]"
          >
            <VisibilityIcon visibility={journey.visibility} />
          </span>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-[13px] leading-5 text-[#78877F] dark:text-[#ADBCB1]">
          {journey.description}
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-[#EDF0EC] pt-3 dark:border-[#344A40]">
          <span className="flex min-w-0 items-center gap-2 text-[11px] text-[#89968D] dark:text-[#A6B7AA]">
            <FaRegCalendarAlt className="shrink-0" />
            <span className="truncate">{journey.date}</span>
          </span>

          <button
            type="button"
            onClick={() => onOpen(journey)}
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[#477461] transition hover:text-[#294C46] dark:text-[#B4D2BE] dark:hover:text-white"
          >
            Open
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default JourneyCard