import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import BottomNavbar from "../components/BottomNavbar"

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
    <div className="flex flex-col md:flex-row">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId}/>
    
        <div className="flex w-5/6 flex-wrap">
            {
                posts.map((post) => <div className="m-2">
                    <img src={`${post.imageUrl}`}
                    className="max-h-72"    
                alt="" />
                </div>)
            }
        </div>
    </div>

    <BottomNavbar/>

    </>
}

export default Explore