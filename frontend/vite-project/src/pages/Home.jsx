import PostsSection from "../components/PostsSection";
import RightSidebar from "../components/RightSidebar";;

const Home = () => {
    return <>
        <div className="flex flex-col md:flex-row">
            <PostsSection />
            <RightSidebar />
        </div>
    </>
}

export default Home;