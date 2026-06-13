const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {pool} = require("../database.js")
const dotenv = require("dotenv")
const path = require("path")

const signup = async (req, res) => {
    dotenv.config()
    const secretkey = process.env.SECRET_KEY;
    try {

        const {full_name, username, email, password} = req.body;

        const profile_pic_url = " https://res.cloudinary.com/dp34vubev/image/upload/v1781372352/post-images/uhdzkp9ro0u35wr2trj1.avif"
        

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password, salt)

        const results = await pool.query(`INSERT INTO users(full_name, username, email, profile_pic_url, password)
                    VALUES (?, ?, ?, ?, ?)`, [full_name, username, email, profile_pic_url, hashedPassword]);

        const user = await pool.query(`SELECT id, full_name, username, email, profile_pic_url FROM users WHERE email = ?`, [email])

        const token = jwt.sign({userid: user[0][0].id}, secretkey, {expiresIn: '15d'})

        res.cookie('jwt', token, {
            maxAge: 15 * 24 *60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict'
        })
        
        res.status(200).json({user: user[0][0]})

    } catch(error) {
        console.log(error.message)
    }
}

const login = async (req, res) => {
    try {
        dotenv.config()
        const secretkey = process.env.SECRET_KEY;

        // profile_pic_url = path.join(__dirname, "../public/profile-images/default-profile-pic.png" )
        // const cloudinary_image_data = await cloudinary.uploader.upload(
        //     `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        //     {
        //         folder: "post-images"
        //     }
        // );

        // const profile_pic_url = cloudinary_image_data.secure_url
        // console.log(profile_pic_url)

        const {email, password} = req.body;

        const result = await pool.query("SELECT id, full_name, username, email, password FROM users WHERE email = ? ", [email])

        const user = result[0][0];

        if (!user){
            console.log("no user")
            
            return res.status(404).json({message: "Invalid credentials"})
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password || "")

        if(!isPasswordCorrect){
            console.log("no password")
            return res.status(404).json({message: "Invalid credentials"})
        }

        const token = jwt.sign({userid: user.id}, secretkey, {expiresIn: '15d'})


        res.cookie('jwt', token, {
            maxAge: 15 * 24 *60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict'
        })

        res.status(201).json(user)

    } catch (error) {
        console.log(error.message)
    }
}

const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0})
        res.json({message: "Logged out succesfully"})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {signup, login, logout}