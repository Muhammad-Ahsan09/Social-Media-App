import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import BottomNavbar from "../components/BottomNavbar"
import TopNavbar from "../components/TopNavbar"
import { Link } from "react-router-dom"

const Explore = ({setUser, currentUserId}) => {

    const [posts, setPosts] = useState([])

    useEffect(() => {
        const getPosts = async () => {
            const res =  await fetch("https://social-media-app-five-rust.vercel.app/api/posts")
            const data = await res.json()
            setPosts(data)
         }
         getPosts()
    }, [])

    return <>
    <TopNavbar />
  
    <div className="flex flex-col md:flex-row pt-14 md:pt-0">
      <LeftSidebar
        setUser={setUser}
        currentUserId={currentUserId}
      />
  
      <div className="w-full md:w-5/6 p-2 md:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {posts.map((post) => (
            <Link to={`/posts/${post.id}`}>
            <div key={post._id}>
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-40 sm:h-56 object-cover rounded"
              />
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  
    <BottomNavbar />
  </>
}

export default Explore