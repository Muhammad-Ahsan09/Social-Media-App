const { pool } = require("../database")
const sharp = require("sharp")
const path = require("path")
const fs = require("fs")

const uploadPost = async (req, res) => {
    try {
        const {description, user_id} = req.body;
        const image_name = req.file.filename;

        const response = await pool.query("INSERT INTO posts(user_id, description, imageUrl) values (?,?,?)", [user_id, description, image_name])
        

        console.log(req.file)
        res.json({message: "Successful"})



    } catch (error) {
        console.log(error.message)        
    }
}

const getPosts = async (req, res) => {
    try {
        const response = await pool.query(`SELECT posts.id, posts.user_id, posts.description, posts.imageUrl, posts.likes,
         users.profile_pic_url, users.full_name
         FROM posts JOIN users ON posts.user_id = users.id ORDER BY RAND() LIMIT 10;`);

        const posts = response[0];

        // console.log(posts)

        

        res.json(posts)
    } catch (error) {
        console.log(error.message)
    }

}

const likePost = async (req, res) => {
    try {
        const userid = req.params.userid
        const postid = req.params.postid

        await pool.query(`
        INSERT INTO post_liked(user_id, post_id) values (?, ?)
        `, [userid, postid])

        await pool.query(`UPDATE posts SET likes = (
            SELECT COUNT(*) FROM post_liked WHERE post_id = ?
        ) WHERE id = ?`, [postid, postid])

        res.json({message: "post liked successfully"})
    } catch (error) {
        console.log(error.message)
    }
}

const unlikePost = async (req, res) => {
    try {
        const userid = req.params.userid
        const postid = req.params.postid
        console.log("UNliking")

        // await pool.query(`SET SQL_SAFE_UPDATES = 0;`)
        await pool.query(`DELETE FROM post_liked WHERE user_id = ? AND post_id = ?; `, [userid, postid])

        await pool.query(`UPDATE posts SET likes = (
            SELECT COUNT(*) FROM post_liked WHERE post_id = ?
        ) WHERE id = ?`, [postid, postid])

        res.json({message: "Post unliked successfully"})

    } catch (error) {
        console.log(error.message)
    }
}

const getLikedPosts = async (req, res) => {
    try {
        const userid = req.params.userid
        
        const posts = await pool.query(`
        SELECT id FROM posts WHERE id IN (
            SELECT post_id FROM post_liked WHERE user_id = ?
        )
        `, [userid])

        console.log(posts[0])
        res.json(posts[0])
    } catch (error) {
        console.log(error.message)
    }
}

const getPost = async (req, res) => {
    try {
        const post_id = req.params.post_id
        const response = await pool.query(`SELECT * FROM posts WHERE id = ?;`, [post_id])

        const post = response[0][0]
        console.log(post)
        res.json(post)

    } catch (error) {
        console.log(error.message)
    }
}

const getUserPosts = async (req, res) => {
    try {
        const user_id = req.params.userid;

        const response = await pool.query(`SELECT * FROM posts WHERE user_id = ?;`, [user_id])
        const posts = response[0]

        res.json(posts)

        

    } catch (error) {
        console.log(error.message)
    }
}

const deletePost = async (req, res) => {
    try {

        const postid = req.params.postid;

        const response = await pool.query(`SELECT imageUrl FROM posts WHERE id = ?; `, [postid])

        console.log(response[0][0])

        fs.unlink(`public/post-images/${response[0][0].imageUrl}`, (err) => {
            if(err){
                console.log(err.message)
            }
        })

        await pool.query(`DELETE FROM comments WHERE post_id = ?`, [postid])
        await pool.query(`DELETE FROM post_liked WHERE post_id = ?`, [postid])
        await pool.query(`DELETE FROM posts WHERE id = ?;`, [postid])
        

        res.status(200).json({message: "Post deleted succesfully"})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {uploadPost, getPosts,likePost, getLikedPosts, unlikePost,getPost, getUserPosts, deletePost}