const dotenv=require('dotenv');
const bodyParser=require("body-parser");
dotenv.config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors')
const fs = require('fs');
const path = require('path');



const userRouter=require('./routers/userRouter');
const audioRouter = require('./routers/audioRouter');

const app=express();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
// app.use(express.urlencoded({ extended: true }));

app.use((req,res,next)=>{
    console.log(req.path,req.method);
    next();
})


app.use('/api/user',jsonParser,userRouter);

app.use('/api/audio',jsonParser,audioRouter)

const PORT=process.env.PORT;
const MONGO_URI=process.env.MONGODB_URI;
mongoose.connect(MONGO_URI).then(()=>{

    app.listen(process.env.PORT,()=>{
        console.log(`Server is listening on http://localhost:${PORT}`)
    })
})
