import LeftSidebar from "../components/LeftSidebar";
import PostsSection from "../components/PostsSection";
import RightSidebar from "../components/RightSidebar";

const Home = ({setUser, currentUserId}) => {
    return <div className="flex">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId}/>
        <PostsSection/>
        <RightSidebar/>
    </div>
}

export default Home;