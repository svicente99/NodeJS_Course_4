var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Users = require('./models/users');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var FacebookTokenStrategy = require('passport-facebook-token'); 

var config = require('./config.js');

exports.local = passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        Users.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req, res, next) {
    Users.findOne({_id: req.user._id})
    .then((user) => {
        console.log("User: ", req.user);
        if (user.admin) {
            next();
        }
        else {
            err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        } 
    }, (err) => next(err))
    .catch((err) => next(err))
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy(
	{clientID: config.facebook.clientID,
	 clientSecret: config.facebook.clientSecret
    }, 
    (accessToken, refreshToken, profile, done) => 
    {
		Users.findOne( {facebookId: profile.id}, (err, user) => {
			if (err) {
				return done(err, false);
			}
			if (!err && user !== null) {
				return done(null, user);
			}
			else{
				user = new Users( {username: profile.displayName} );
				user.facebookId = profile.id;
				user.firstName = profile.name.givenName;
				user.lastName = profile.name.familyName;
				user.save( (err,user) => {
					if (err) 
						return done(err, false);
					else
						return done(null, user);
				})
			}
		});
    }
));
