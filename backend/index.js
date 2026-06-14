const express = require("express")
const { signup, login, logout } = require("./controllers/auth-controllers")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { uploadPost, getPosts, likePost, getLikedPosts, unlikePost, getPost, getUserPosts, deletePost } = require("./controllers/posts-contoller")
const multer = require("multer")
const path = require("path")
const { getUserData, getFriendSuggestions, isSignedIn, updateProfileImage, sendFollowRequest, getFriendRequests, acceptFriendRequest, getFriends, unfriendUser, checkSentFriendRequest } = require("./controllers/user-controllers")
const {getChat, sendMessage} = require("./controllers/chat-controllers")
const { getSearchResults } = require("./controllers/search-controllers")
const { postComment, getComments } = require("./controllers/comment-controllers")
const {app, server} = require("./socket/socket")
const dotenv = require("dotenv")


dotenv.config()

// const app = express()

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         let destinationPath = ""

//         if(file.fieldname === "file"){
//             destinationPath = "public/post-images"
//         }

//         else if(file.fieldname === "profileImage")
//         {
//             destinationPath = "public/profile-images"
//         }
//         return cb(null, destinationPath)
//     },

//     filename: (req, file, cb) => {
//         return cb(null, `${Date.now()}-${file.originalname}`)
//     }

// })

const storage = multer.memoryStorage()

const upload = multer({storage})


app.use(cors({
    origin: "https://social-media-app-d66c.vercel.app",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(express.static("public"))

app.get("/", (req, res) => {
    return res.send("<h1>Server working</h1>")
})

app.post("/api/auth/signup", signup)
app.post("/api/auth/login",  login)
app.post("/api/auth/logout",  logout)

app.get("/api/users/:userid", getUserData)
app.get("/api/issignedin", isSignedIn)

app.get("/api/friendsuggestions/:userid", getFriendSuggestions)

app.post("/api/friend_requests/:sender_id/:reciever_id", sendFollowRequest)

app.post("/api/posts", upload.single("file"),  uploadPost)
app.get("/api/posts" , getPosts)
app.delete("/api/posts/:postid", deletePost)
app.get("/api/userposts/:userid", getUserPosts)


app.get("/api/posts/:post_id", getPost)

app.patch("/api/friend_request/:sender_id/:reciever_id", acceptFriendRequest)
app.delete("/api/friends/:user1_id/:user2_id", unfriendUser)

app.get("/api/friend_requests/:userid", getFriendRequests)

app.get("/api/friends/:userid", getFriends)
app.get("/api/sent_friend_request/:senderid/:recieverid", checkSentFriendRequest)

app.get("/api/chats/:friend_id/:current_user_id", getChat)
app.post("/api/chats/:friend_id", sendMessage)
app.post("/api/comments/:user_id/:post_id", postComment)
app.get("/api/comments/:post_id", getComments)

app.patch("/api/posts/like/:postid/:userid", likePost)
app.patch("/api/posts/unlike/:postid/:userid", unlikePost)

app.get("/api/liked_posts/:userid", getLikedPosts)

app.get("/api/search/:search_query", getSearchResults)

app.patch("/api/profile_image/:userid", upload.single("profileImage") ,updateProfileImage)
// upload.single("profileImage"), 

const PORT = process.env.PORT || 8000

server.listen(PORT,  () => {
    console.log("sever started at port 8000")
})