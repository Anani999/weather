#This weather api uses two third party API's for fetching weather data of a perticular city 
1. api.openweathermap.org to getting coordinates of a specific city by name or pincode etc., 
2. api.open-meteo.com/v1/forecast , an open source weather info fetching api using cordinates(latitude, longitude)

#The Backend was build by Nodejs using expressJS framework to build the API's 

#Features 
  1.Authentication : using jsonwebtoken, bcrypt and some logic , token based authentication 
  2.Rate Limiter : using express-rate-limit library , with maximum of 10 requests in 1 minute 
  3.Limit to access weather fetches : Implemented logic as user has a default of 50 times to get weather data , and can use /increase-limit endpoint to increase this limit , as for now no additional logic was implemented in increasing the limit, but we can integrate a payment method here to get a payment and them increasing the limit, now it just increases the limit by just making the get request and limit has a limit of 100 and further it can't be increased giving an error if tried  
  
#I have implemented authentication to access only authenticated users to access the main weather fetching api
  1.Used jsonwebtoken, bcrypt and some logic to implement authentication logic and using mongodb as the database
  
#The backend service provides total of 4 API endpoints 
  1. /register - to register the user and save in the db
  2. /login - to login using registered details and to get the access token
  3. / - the default or the main api to fetch weather data, it takes location as the required query parameter , where we have to specify the name of the major city, and it was private or secure api as we have to provide token which we received while login api as a bearer token 
  4. /increase-limit - api used to increase the access limit for / the default api, each request increases the access limit by 10

#Languages and tech stack 
  1.Nodejs - runtime environment for javascript
  2.ExpressJS - framework for building Backend API's 
  3.MongoDB - Object type database, for storing and retrieving Data

#Agenda/Goal of the project
  there is nothing costum service this project provides here it uses to thirdparty api's and works as a bridge to fetch weather data direcly using city name etc., as part of my curiosity on and to improve my skill's in backend development this is just a learning project with main intension of learning , 
  I have deployed this in render.com which is a cloud platform and it was not live you can test this service at https://weather-0g3y.onrender.com , 

#Limitations/Drawbacks 
  1. It cannot accurately give weather information of areas which were not mojor cities, so because the openweathermap was provides coordinates for only major cities it fails when you give small cities and you may get an 500(internal error response)
  2. The weather info may not accurate each time, most of the time the weather info was close to google weather but sometimes the winds speed may have large difference with google weather as this project uses open-meteo which was an opensource api service for fetching weather info , it has this drawback
  3. loading/respond speed , as I am using free tier of the render cloud without an continues activity ,the api wont work and it takes long time (50s) for getting response without any previous activity 
