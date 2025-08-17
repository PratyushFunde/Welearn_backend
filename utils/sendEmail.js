const nodemailer=require('nodemailer');

const sendEmail=async(to,subject,text,html)=>{
    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.GOOGLE_MAIL_PASS
        }
    });

    await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject,
        text,
        html
    })

}

module.exports=sendEmail;