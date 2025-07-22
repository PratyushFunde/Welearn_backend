const express=require('express')

const app=express();

app.use((req,res)=>{
    console.log(req.path,req.method)
})

const PORT=8000;

app.listen(PORT,()=>{
    console.log(`Server is listening on http://localhost:${PORT}`)
})