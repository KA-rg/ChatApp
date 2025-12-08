const express=require('express');
const router=express.Router();
const{
    getMessages,
    createMessage,
    deleteAllMessages
}=require('../controllers/messageControllers')

// Route to get messages 

router.get('/',getMessages);

// Routes to post the messages
router.post('/',createMessage);

//Delete the messages

router.delete('/',deleteAllMessages);


module.exports=router;