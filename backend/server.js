const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const dotenv = require('dotenv');

//dotenv in our server
dotenv.config();


const app = express();
const PORT = 5000;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Routes in server file
app.use('/api/messages',require('./routes/messageRoutes'));

// root route
app.get('/', (req, res) => {
    res.send({
        message: " Chat API Server",
        version: '1.0.0',
        endpoints: {
            getMessages: "GET /api/messages",
            createMessages: "POST /api/messages",
            deleteMessages: "DELETE /api/messages",
        }
    })
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error:err.message,
  });
});

app.listen(PORT, () => {
    console.log(chalk.green(`Server running on port ${PORT}`));
});
