const express = require('express')

const router = express.Router()
const Tweets = require('../models/tweets')
const user = require('./users')
const async = require('async');
const nodemailer = require('nodemailer');

router.get('/',user.isAuthenticatedUser,async (req,res)=>{
    
    try {
        const tweets = await Tweets.find({})
        res.render('home',{
            tweets : tweets
        })

    } catch {
        res.redirect('/')
    }
})

router.get('/new',user.isAuthenticatedUser,(req,res)=>{
    res.render('new',{tweet : new Tweets()})
})




router.post('/',async (req,res)=>{
    const tweet = new Tweets({
        input : req.body.input
    })
    try {
        const newTweet = await tweet.save()
        res.redirect('/tweets')
    } catch {
        res.redirect('/')
    }
})


//Edit the page
router.get('/:id',async (req,res)=>{
    try {
        const tweet = await Tweets.findById(req.params.id)
        res.render('edit',{tweet})
    } catch {
        res.redirect('/tweets')
    }
})

router.put('/:id',async (req,res)=>{
    let tweet
    try {
        tweet = await Tweets.findById(req.params.id)
        tweet.input = req.body.input
        await tweet.save()
        res.redirect(`/tweets`)
    } catch {
        res.redirect('/')
    }
})

router.delete('/:id',async (req,res)=>{
    let tweet
    try {
        tweet = await Tweets.findById(req.params.id)
        await tweet.remove()
        res.redirect('/tweets')
    } catch(e) {
        if(tweet){
            res.render('edit',{
                tweet,
                errorMessage :"Could not remove tweet"
            })
        }else{
            res.redirect('/')
        }
    }
})

router.post('/:id',async (req, res, next)=> {
    const tweet = await Tweets.findById(req.params.id)
        let smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user : process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        let mailOptions = {
            to: 'omegafreshner@gmail.com',
            from: 'Oslash Twitter ardorfresh@gmail.com',
            subject: 'Request to delete the tweet',
            text: 'Please click the following link to delete the record'+' " '+tweet.input +' " your link: \n\n' +
                'http://' + req.headers.host + '/tweets \n\n' +
                'If you are not incharge request this, please ignore this email.'
        };
        smtpTransport.sendMail(mailOptions, err=> {
            req.flash('success_msg', 'Email send with further instructions. Please check that.');
            res.redirect('/tweets');
        })
});


module.exports = router
