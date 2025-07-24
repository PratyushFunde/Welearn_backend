const express=require('express');

const userRouter=express.Router();

const userController=require('../controllers/userController');

userRouter.get('/test',userController.test);
userRouter.post('/createUser',userController.createUser);
userRouter.post('/verifyOtp',userController.verifyOtp);
userRouter.post('/login',userController.loginUser);


module.exports=userRouter;