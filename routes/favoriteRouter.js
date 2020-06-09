/**
 * favorite router
 * Apr. 2020
 * 
 * refs. used: https://stackoverflow.com/questions/61088593/typeerror-cannot-create-property-id-on-number-1-when-trying-to-submit-to-m
 */

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');
const User = require('../models/users');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
	.options(cors.corsWithOptions, (req,res) => {
		res.sendStatus(200); })

	.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
		console.log('userId: ' + req.user._id + '\n');
		Favorites.findOne({user: req.user._id})
		.populate('user')
		.then((favorite) => {
			if (favorite!=null) {
				var aFavDishes = new Array();
				for (var i = 0; i <= (favorite.dishes.length -1); i++) {
					aFavDishes[i] = favorite.dishes[i]._id;
				}
				Dishes.find({'_id': { $in: aFavDishes} })
				.populate('dishes')
				.then((dishes) => {
					let myFavoritePost =
					[{ 
						_id: favorite._id,
						updatedAt: favorite.updatedAt,
						createdAt: favorite.createdAt,
						__v: favorite.__v,
						user: favorite.user,
						dishes: dishes
					}];
					console.log(dishes);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(myFavoritePost);
				})
			}
			else {
				err = new Error("This user doesn't have any favorites yet");
				err.status = 404;
				return next(err);
			}
			
		}, 	(err) => next(err))
		.catch( (err) => next(err) )
	})
	/****
	// use only to help debugging
	.get(cors.corsWithOptions, (req,res,next) => {
		Favorites.find({})
		.then((favorite) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(favorite);
		}), (err) => next(err)
		.catch( (err) => next(err) );
	})
	/*****/
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		var dishes = valid_dishes(req.body);

		console.log('userId: ' + req.user._id + '\n');
		Favorites.findOne({user: req.user._id})
		.then((favorite) => {
			if (favorite==null) {
				console.log("User without favorites");
				objFavorite = newFavorite(req);
				objFavorite.dishes = dishes;
				objFavorite.save()
				.then((favorite) => {
					console.log("Favorite updated: ", favorite);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				}, (err) => next(err))			
				.catch( (err) => next(err) );
			}
			else{
				console.log("User found");
				favorite.dishes = dishes;
				favorite.save()
				.then((favorite) => {
					console.log("Favorite updated: ", favorite);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(favorite);
				}, (err) => next(err))			
				.catch( (err) => next(err) );
			}
		},
		(err) => next(err))
		.catch( (err) => next(err) );		
	})

	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /favorites');
	})

	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		// first of all, we need to locate the user that corresponds to Favorites document
		Favorites.findOne({user: req.user._id})
		.then((favorite) => {
			if (favorite==null) {
				console.log("user not found");
				err = new Error('User has no favorites.');
		        err.status = 404;
		        return next(err);
			}
			else{
				Favorites.findByIdAndRemove(favorite._id)
				.then((resp) => {
					console.log("All favorites of this user has been removed");
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				}, 	(err) => next(err))
			   .catch( (err) => next(err) );
		   }
		}, 	(err) => next(err))
		.catch( (err) => next(err) );
	})


// ---------------------------------------------------

favoriteRouter.route('/:dishID')
	.options(cors.corsWithOptions, (req,res) => {
		res.sendStatus(200); })

	.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
		console.log('userId: ' + req.user._id + '\n');
		Favorites.findOne({user: req.user._id})
		.populate('user')
		.then((favorite) => {
			if (favorite!=null) {
				const dishID = req.params.dishID;

				if (favorite.dishes.id(dishID)) {	
					// first, valid dishID
					Dishes.findById(req.params.dishID)
					.then((dish) => {
						favorite.dishes[0] = getDishObject(dish);
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(favorite);
					})
				}
				else{
					console.log("user hasn't this favorite dish!");
					err = new Error("User hasn't this dish as a favorite.");
					err.status = 404;
					return next(err);
					}
			}
			else {
				err = new Error("This user doesn't have any favorites yet");
				err.status = 404;
				return next(err);
			}
			
		}, 	(err) => next(err))
		.catch( (err) => next(err) )
	})

	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		console.log('dishId parameter: ' + req.params.dishID + '\n');
		// first of all, we need to locate the user that corresponds to Favorites document
		Favorites.findOne({user: req.user._id})		
		.then((favorite) => {
			if (favorite==null) {
				console.log("User not found");
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json("This user doesn't have any favorites yet");
			}
			else{
				const dishID = req.params.dishID;

				if (favorite.dishes.id(dishID)) {
					console.log("User has already this favorite "+dishID);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json('This favorite ('+dishID+') is already associated to this user');
				}
				else{
					Dishes.findById(dishID).then((dish) => {
						if (dish) {
							objFavorite = newFavorite(req);
							console.log(objFavorite);
							favorite.dishes.push(objFavorite)
							favorite.save();
							console.log("Favorite created: ", favorite);
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(favorite);
						}
						else{
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json('Invalid dish id: '+dishID);
						}
					})
				}
			}
		}, (err) => next(err))
		.catch( (err) => next(err) );
	})

	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	  	res.statusCode = 403;
	  	res.end('PUT operation not supported on /favorites/'+ req.params.dishID);
	})

	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		// first of all, we need to locate the user that corresponds to Favorites document
		Favorites.findOne({user: req.user._id})
		.then((favorite) => {
			if (favorite==null) {
				console.log("user not found");
				err = new Error('User has no favorites.');
		        err.status = 404;
		        return next(err);

			}
			else{
				var bRemoved = false;
				var dishID = req.params.dishID;
				
				for (var i = (favorite.dishes.length -1); i >= 0; i--) {
					// if this 'dishID' is inserted in dishes collection, delete it
					if (favorite.dishes.id(dishID)) {
						favorite.dishes.id(dishID).remove();
						bRemoved = true;
					}
				}
				if (bRemoved) {
					favorite.save()
					.then((resp) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(resp);
						console.log('Deleted favorite dish: ' + dishID);
					}, (err) => next(err))
					.catch( (err) => next(err) )
				}
				else{
					console.log("User hasn't this favorite "+dishID);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json("This favorite ("+dishID+") isn't associated to this user");
				}
			}
		})
		.catch( (err) => next(err) )
	})

function valid_dishes(reqBody) {
	var aDishesValid = new Array();

	for (var i = (reqBody.length -1); i >= 0; i--) {
		let dishID = reqBody[i]._id;
		// if 'dishID' isn't  inserted in dishes collection, remove from req.body
		Dishes.findById(dishID)
		.then((dish) => {
			if (dish) {
				var objDish = new Object();
				objDish['_id'] = dishID;
				aDishesValid.push( objDish );
			}
			else{
				console.log("Invalid dish id: "+dishID);
			}
		})
	}
	return(aDishesValid);
}

function getDishObject(dish) {
	var objDish = new Dishes();
	
	with(objDish) {
		_id = dish._id;
		label = dish.label;
		featured = dish.featured;
		name = dish.name;
		image = dish.image;
		category = dish.category;
		price = dish.price;
		description = dish.description
	}
	return objDish;
}

function newFavorite(req) {
	var objFavorite = new Favorites();

	objFavorite.user = req.user._id;
	objFavorite.dishes = req.body;
	return objFavorite;
}


//	export this module
module.exports = favoriteRouter;
