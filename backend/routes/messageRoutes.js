const express=require('express');
const router=express.Router();
const{
    getMessages,
    createMessage,
    deleteAllMessages,
    deleteMessage
}=require('../controllers/messageControllers')

// Route to get messages 

router.get('/',getMessages);

// Routes to post the messages
router.post('/',createMessage);

//Delete the messages

router.delete('/',deleteAllMessages);
// Delete a single message by id
router.delete('/:id', deleteMessage);

module.exports=router;