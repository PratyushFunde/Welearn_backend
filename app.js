const dotenv=require('dotenv');
const bodyParser=require("body-parser");
dotenv.config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors')

const userRouter=require('./routers/userRouter')

const app=express();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cors());

app.use((req,res,next)=>{
    console.log(req.path,req.method);
    next();
})


app.use('/api/user',jsonParser,userRouter);

// const PORT=8000;

const PORT=process.env.PORT;
const MONGO_URI=process.env.MONGODB_URI;
mongoose.connect(MONGO_URI).then(()=>{

    app.listen(process.env.PORT,()=>{
        console.log(`Server is listening on http://localhost:${PORT}`)
    })
})
