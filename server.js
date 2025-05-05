const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(express.json());

function error(res,message) {
    return res.status(500).json({error:message});
}
app.get('/', async (req,res) => {
    try{
        
    const { location } = req.query;
        if(!location) {
            error(res,'location is required')
        }
    const exact = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${process.env.TOKEN}`);
        //console.log(exact.data);
    const {lat , lon }= exact.data[0];
    if(!lat || !lon) {
        //return res.json(exact)
        error(res,'error while getting lat, lon'+exact);
    }
    const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        //console.log(weather);
        res.status(200).json(weather.data);
        
    }
    catch(error){
        res.status(500).send(error)
    }
});

app.listen(5000, () => {
    console.log('Listening on 5000');
});