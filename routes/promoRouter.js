const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promotions = require('../models/promotions');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
	.options(cors.corsWithOptions, (req,res) => {
		res.sendStatus(200); })
	.get(cors.cors, (req,res,next) => {
		Promotions.find({})
		.then((promotions) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(promotions);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Promotions.create(req.body)
		.then((promotion) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(promotion);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /promotions');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Promotions.remove({})
		.then((resp) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})


// -----------------------------------------------------------

promotionRouter.route('/:promotionID')
	.options(cors.corsWithOptions, (req,res) => {
		res.sendStatus(200); })
	.get(cors.corsWithOptions, cors.cors, (req,res,next) => {
		Promotions.findById(req.params.promotionID)
		.then((promotion) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(promotion);
			console.log('Will send details of the promotion: ' + req.params.promotionID);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	  	res.statusCode = 403;
	  	res.end('POST operation not supported on /promotions/'+ req.params.promotionID);
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		console.log("Updating data to "+req.params.promotionID);
		/* I put this debug message to show the real price stored in db. 
           Because in my Ubuntu installation, the browser doesn't show decimals with dot */
		if(req.body.price!=null)
   		  console.log("(this is the price = "+req.body.price+")");
		Promotions.findByIdAndUpdate(req.params.promotionID, {
			$set: req.body
		}, { new: true })
		.then((promotion) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(promotion);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Promotions.findByIdAndRemove(req.params.promotionID)
		.then((resp) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
			console.log('Deleting promotion: ' + req.params.promotionID);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})

// -----------------------------------------------------------

//	export this module
module.exports = promotionRouter;
