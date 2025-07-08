const { pool } = require("../database");


const getChat = async (req, res) => {
    try {
        
        const {friend_id, current_user_id} = req.params;
        

        const chat = await pool.query(`
        SELECT * FROM chats WHERE sender_id = ? AND reciever_id = ?
        UNION
        SELECT * FROM chats WHERE reciever_id = ? AND sender_id = ?
        ORDER BY timestamp;
        `, [current_user_id, friend_id, current_user_id, friend_id])

        console.log(chat[0])
        res.json(chat[0])

    } catch (error) {
        console.log(error.message)
    }
}

const sendMessage = async (req, res) => {
    try {
        const reciever_id = req.params.friend_id;
        const sender_id = req.body.current_user_id;
        const message = req.body.message


        await pool.query(`
        INSERT INTO chats(sender_id, reciever_id, message) values (?, ?, ?);`, [sender_id, reciever_id, message])

        res.json({message: "message sent successfully"})


    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {getChat, sendMessage}