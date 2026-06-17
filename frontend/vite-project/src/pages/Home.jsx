import LeftSidebar from "../components/LeftSidebar";
import PostsSection from "../components/PostsSection";
import RightSidebar from "../components/RightSidebar";
import BottomNavbar from "../components/BottomNavbar";
import TopNavbar from "../components/TopNavbar";

const Home = ({ setUser, currentUserId }) => {
    return <>
        <TopNavbar setUser={setUser} />
        <div className="flex flex-col md:flex-row">

            <LeftSidebar setUser={setUser} currentUserId={currentUserId} />
            <PostsSection />
            <RightSidebar />
        </div>

        <BottomNavbar currentUserId={currentUserId} />
    </>
}

export default Home;