const express=require('express');
const multer=require('multer');
const authMiddleware = require('../middlewares/auth');
const userRouter=express.Router();

const upload = multer({ dest: 'uploads/' });

const userController=require('../controllers/userController');


userRouter.get('/test',userController.test);
userRouter.post('/createUser',userController.createUser);
userRouter.post('/verifyOtp',userController.verifyOtp);
userRouter.post('/login',userController.loginUser);

userRouter.post('/analyzeResume',authMiddleware,upload.single('file'),userController.analyzeResume);

module.exports=userRouter;