const { pool } = require("../database");
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const path = require("path")
const fs = require("fs")

const getUserData = async (req, res) => {
    try {

        const userid = req.params.userid;

        const response = await pool.query(`SELECT * FROM users WHERE id = ?`, [userid])

        const user = response[0][0];

        // console.log(user)
        res.json(user)
        
    } catch (error) {
        console.log(error.message)
    }
}

const isSignedIn = async (req, res) => {
    try {
        dotenv.config()
        const token = req.cookies.jwt

        // const userid = req.params.userid

        if(!token)
        {
            console.log("here 1")
            return res.send(false)
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        if(!decoded)
        {
            console.log("here 2")
            return res.send(false)
        }

        

        // if(!decoded)
        // {
        //     console.log("here 3")
        //     return res.send(false)
        // }

        const response = await pool.query(`SELECT * FROM users WHERE id = ?`, [decoded.userid])
        const user = response[0][0]

        // console.log("\n\nUser\n\n", user)
        // return res.json(true)

        if(!user)
        {
            console.log("no user")
            return res.send(false)
        }

        return res.json(user)

    } catch (error) {
        console.log(error.message)
    }
}

const updateProfileImage = async (req, res) => {
    try {
        const userid = req.params.userid
        const image_name = req.file.filename
        console.log(image_name)
        
        const response = await pool.query(`SELECT profile_pic_url FROM users WHERE id = ?;`, [userid])
        console.log(response[0][0].profile_pic_url)

        if(response[0][0].profile_pic_url != "default-profile-pic.png") {
            fs.unlink(`public/profile-images/${response[0][0].profile_pic_url}`, (err) => {
                if(err){
                    console.log(err.message)
                }
    
            });
        }
        

        await pool.query(`UPDATE users SET profile_pic_url = ? WHERE id = ?;`, [image_name, userid, image_name])

        res.status(200).json({message: "upload succesfull"})
    } catch (error) {
        console.log(error.message)
    }
}


const getFriendSuggestions = async (req, res) => {
    try {
        const userid = req.params.userid;
        const response = await pool.query(`
        SELECT * FROM users WHERE id != ? 
        AND id NOT IN (
            SELECT sender_id FROM friends_with WHERE reciever_id = ?
            UNION
            SELECT reciever_id FROM friends_with WHERE sender_id = ?
            ) ORDER BY RAND()
        LIMIT 5;`, [userid, userid, userid]);

        const friendSuggestions = response[0];

        res.json(friendSuggestions)
    } catch (error) {
        console.log(error.message)
    }
}

const sendFollowRequest = async (req, res) => {
    try {
        console.log("sending follow requests")
        const senderid = req.params.sender_id
        const recieverid = req.params.reciever_id

        const response = await pool.query("INSERT INTO follow_requests(sender_id, reciever_id) values (?, ?);", [senderid, recieverid])

        res.json({message: "request sent successfully"})
    } catch (error) {
        console.log(error.message)
    }
}

const getFriendRequests =  async (req, res) => {
    try {
        console.log("I am here")
        const userid = req.params.userid
        console.log("userid" , userid, typeof userid)
        const requests = await pool.query(`SELECT * FROM users WHERE id IN  (
            SELECT sender_id FROM follow_requests WHERE reciever_id = ? AND status = ?
        ) ;`, [userid, "pending"])
        
        console.log("requests", requests)
        res.json(requests[0])

        // console.log(requests)
    } catch (error) {
        console.log(error.message)
    }
}

const acceptFriendRequest = async (req, res) => {
    try{
        const {sender_id, reciever_id} = req.params

        await pool.query(`INSERT INTO friends_with(sender_id, reciever_id) values (?, ?)`, [sender_id, reciever_id])
        await pool.query(`UPDATE follow_requests SET status = ?
         WHERE sender_id = ? AND reciever_id = ?`, ["accepted", sender_id, reciever_id])

        res.json({message: "Tables updated succesfullt"})

    }catch(error){
        console.log(error.message)
    }
}

const unfriendUser = async (req, res) => {
    try {

        const {user1_id, user2_id} = req.params;

       await  pool.query(`
        DELETE FROM friends_with WHERE (sender_id = ? AND reciever_id = ?)
        OR (sender_id = ? AND reciever_id = ?);
        `, [user1_id, user2_id, user2_id, user1_id])

        await pool.query(`
        DELETE FROM follow_requests WHERE (sender_id = ? AND reciever_id = ?)
        OR (sender_id = ? AND reciever_id = ?)
        `, [user1_id, user2_id, user2_id, user1_id])

        res.json({message: "Unfollowed succefully"})
    } catch (error) {
        console.log(error.message)
    }
}

const getFriends = async (req, res) => {
    try {
        const userid = req.params.userid
    
        const friends = await pool.query(`SELECT * FROM users WHERE id IN (
            SELECT sender_id FROM friends_with WHERE reciever_id  = ?
            UNION
            SELECT reciever_id FROM friends_with WHERE sender_id = ?
        );`, [userid, userid])
        
        // console.log(friends)
        res.json(friends[0])

    } catch (error) {
        console.log(error.message)
    }
}

const checkSentFriendRequest = async (req, res) => {
    try {

        const senderid = req.params.senderid
        const recieverid = req.params.recieverid
        const response = await pool.query(`SELECT id FROM users WHERE id = (
            SELECT reciever_id FROM follow_requests WHERE sender_id = ? AND reciever_id = ?
        )`,[senderid, recieverid])
        
        if(response[0].length === 1){
            return res.send(true)
        }
        return res.send(false)
    } catch (error) {
        console.log(error.message)
    }
}




module.exports = {getUserData, 
    getFriendSuggestions, 
    isSignedIn,
     updateProfileImage, 
     sendFollowRequest, 
     getFriendRequests, 
     acceptFriendRequest,
     getFriends,
     unfriendUser,
     checkSentFriendRequest
    }