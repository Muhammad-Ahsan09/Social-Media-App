import MomentsSection from "./MomentsSection"
import Posts from "./Posts"


const PostsSection = () => {
  return (
    <main className="w-full min-w-0 flex-1 pb-24 pt-16 text-[#294C46] transition-colors duration-200 dark:text-[#E1EAE4] md:pb-8 md:pt-5 ">
      {/* Moments */}
      <section className="mb-5 px-3 sm:px-5 md:px-4">
        <div className="overflow-hidden rounded-2xl border border-[#DCE4DC] bg-white shadow-sm shadow-[#294C46]/[0.04] dark:border-[#344A43] dark:bg-[#1D3028]">
          <div className="px-4 pt-4 sm:px-5">
            <MomentsSection />
          </div>
        </div>
      </section>

      {/* Posts Feed */}
      <section className="w-full min-w-0">
        <Posts />
      </section>
    </main>
  );
};

export default PostsSection;