const express = require('express');

const app = express();
const chalk = require('chalk');

const PORT = 5000;

// root route
app.get('/', (req, res) => {
    res.send('Hello Server');
});

// Test route
app.get('/test', (req, res) => {
    res.json({
        message: 'Server is working perfectly',
        timestamp: new Date(),
        status: 'success'
    });
});

app.listen(PORT, () => {
    console.log(chalk.green(`Server running on port ${PORT}`));
});
