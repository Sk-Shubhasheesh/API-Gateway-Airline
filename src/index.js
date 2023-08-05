const express = require('express');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');

const app = express();
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	max: 3, // Limit each IP to 3 requests per `window` 
	
})
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Apply the rate limiting middleware to all requests
app.use(limiter)


app.use('/flightsService', createProxyMiddleware({ 
	target: ServerConfig.FLIGHT_SERVICE, 
	changeOrigin: true,
    pathRewrite: {'^/flightsService' : '/'}
 }));
app.use('/bookingService', createProxyMiddleware({ 
	target: ServerConfig.BOOKING_SERVICE, 
	changeOrigin: true,
	pathRewrite: {'^/bookingService' : '/'} }));
app.use('/api', apiRoutes);


app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
   
});
