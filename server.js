const express = require('express');
const axios = require('axios');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();

const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const { rateLimit } = require('express-rate-limit');

app.use(express.json());


//rate limiter 

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
});

app.use(limiter);

// connect db
mongoose.connect(process.env.MONGO_URI);

app.post('/register', async (req,res) => {
    try{
        //console.log(req.body);
        const { username , password , gen_password } = req.body;
        if(!username || !password || !gen_password) {
            return res.status(400).send('required things were note there ');
        }

        const existed_user = await User.findOne({ username });
        if(existed_user) {
            return res.status(400).send('user already existed !');
        }

        if(gen_password !== process.env.GEN_PASS) {
            return res.status(400).send('Invalid try !');
        }
        
        const hashed_password = await bcrypt.hash(password, 10);

        const new_user = await User.create({ username , password:hashed_password });

        res.status(200).json({user:new_user});
    }
    catch(error) {
        return res.status(500).send('Error while registering user : '+error.message);
    }
});

app.post('/login', async (req,res) => {
    try{

        const { username , password } = req.body;

        if(!username || !password) {
            return res.status(400).send('empty required things !');
        }
        const user = await User.findOne({ username });
        const is_correct = bcrypt.compare(password, user.password);
        if(!user && !is_correct) {
            return res.status(400).send('invalid credentials');
        }
        const token = await jwt.sign({id:user.id}, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });

        res.status(200).json({user, token});
    }catch(error){
        return res.status(500).send('Error while user login : '+error.message);
    }
});

const privateRoute = async(req, res, next) => {
    let token = req.headers.authorization;
    if(token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }
    //console.log('token : ', token);
    
    if(!token || token === 'none') {
        return res.status(400).send('Access Denied !');
    }
    try{
        const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
        //console.log('Decoded : ',decoded);
        req.userId = decoded.id;
        next();

    }catch(error){
        return res.status(400).send('Invalid Token !'+error.message);
    }
}

function error(res,message) {
    return res.status(500).json({error:message});
}

app.get('/increase-limit', privateRoute, async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        user.accessLimit = user.accessLimit + 10;
        await user.save();
        res.status(200).json({user});
    }catch(error) {
        return res.status(500).send('error while increasing limit '+ error.message );
    }
});

app.get('/', privateRoute, async (req,res) => {
    try{
        const user = await User.findById(req.userId);
        if(user.accessLimit <= 0) {
            return res.status(400).send('Maximum limit of requests reached ');
        }

        const { location } = req.query;
        if(!location) {
            return error(res,'location is required')
        }
        const exact = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${process.env.TOKEN}`);
        //console.log(exact.data);
        const {lat , lon }= exact.data[0];
        if(!lat || !lon) {
            //return res.json(exact)
            return error(res,'error while getting lat, lon'+exact);
        }
        const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        //console.log(weather);

        user.accessLimit = user.accessLimit - 1;
        await user.save();

        res.status(200).json(weather.data);
        
    }
    catch(error){
        res.status(500).send(error)
    }
});

app.listen(5000, () => {
    console.log('Listening on 5000');
    console.log('ENV : ',process.env.ENV);
});