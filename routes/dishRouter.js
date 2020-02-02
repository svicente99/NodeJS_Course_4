const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
	.get((req,res,next) => {
		Dishes.find({})
		.then((dishes) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dishes);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post((req, res, next) => {
		Dishes.create(req.body)
		.then((dish) => {
			console.log("Dish created: ", dish);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes');
	})
	.delete((req, res, next) => {
		Dishes.remove({})
		.then((resp) => {
			console.log("Dishes removed");
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})


// ---------------------------------------------------

dishRouter.route('/:dishId')
	.get((req,res,next) => {
		Dishes.findById(req.params.dishId)
		.then((dish) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish);
			console.log('Will send details of the dish: ' + req.params.dishId);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.post((req, res, next) => {
	  	res.statusCode = 403;
	  	res.end('POST operation not supported on /dishes/'+ req.params.dishId);
	})
	.put((req, res, next) => {
		Dishes.findByIdAndUpdate(req.params.dishId, {
			$set: req.body
		}, { new: true })
		.then((dish) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish);
	  		console.log('Updating the dish: ' + req.params.dishId + '\n');
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})
	.delete((req, res, next) => {
		Dishes.findByIdAndRemove(req.params.dishId)
		.then((resp) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(resp);
			console.log('Deleting dish: ' + req.params.dishId);
		},
		 (err) => next(err))
		.catch( (err) => next(err) );
	})


//	export this module
module.exports = dishRouter;
