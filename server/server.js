const express = require('express');
const mongoose = require('mongoose');

var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

app.use((req, res, next) => {  //CORS
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
    next();
  });

//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }))

//To parse json data
app.use(bodyParser.json()) // or app.use(express.json()); // To parse JSON bodies

// for parsing multipart/form-data
app.use(upload.array()); 

const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/DevQALink-DB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Jobs routes
const waitingJobsRoutes = require('./routes/jobsRoutes/waitingJobsRoute');
const readyJobsRoutes = require('./routes/jobsRoutes/readyJobsRoute');
app.use('/jobs/waitingJobs', waitingJobsRoutes);
app.use('/jobs/readyJobs', readyJobsRoutes);


// Qa routes
const testsRoutes = require('./routes/qaRoutes/testsRoute');
app.use('/tests', testsRoutes);

// Builds routes
const buildsRoutes = require('./routes/buildsRoutes/versionBuildRoute');
app.use('/builds', buildsRoutes);

// Management routes
const serversRoutes = require('./routes/managementRoutes/serversRoute');
const clustersRoutes = require('./routes/managementRoutes/clustersRoute');
const poolsRoutes = require('./routes/managementRoutes/poolsRoute');
app.use('/management/servers', serversRoutes);
app.use('/management/clusters', clustersRoutes);
app.use('/management/pools', poolsRoutes);


// const poolsRoutes = require('./routes/pools');
// app.use('/pools', poolsRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
