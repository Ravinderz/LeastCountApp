const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const mongojs = require('mongojs');
const mongoose = require('mongoose');
const config = require('./config');
const user   = require('./src/models/User');
const game   = require('./src/models/Game');

const app = express();

const db = mongoose.connect(config.database);

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

const routes = express.Router();

routes.get('/test', function (req, res) {
  res.send('Our Sample API is up...');
});

routes.post('/register',function(req,res){
	var host = req.body.host;
	var newUser = new user({
		firstName : req.body.user.firstname,
		lastName : req.body.user.lastname,
		email : req.body.user.email,
		password : req.body.user.password,
		phone : req.body.user.phone
	});

			newUser.save(function(err){
			 if(err) {
				console.log('Error Inserting New Data');
				if (err.name === 'ValidationError') {
					for (field in err.errors) {
					console.log(err.errors[field].message);
					}
				}
				if(err.name === 'MongoError' && err.code === 11000){
					console.log("mongo error");
					return res.json({success:false,message:"email already exists"});
				}
			}else{
				res.json({success:true, message : 'User had been registered successfully. Please wait while we redirect you to login'});
			}
		});
});

//authenticate a user
routes.post('/login',function(req,res){
	console.log(req.body.user);
	user.findOne({
	email : req.body.user.email,
	'isActive':true
	},function(err,user){
		if(err) throw err;
		if(!user){
			res.json({success:false,message : 'Authentication failed! User not found'});
		}else if(user){

			 // check if password matches
			 console.log(user);
			 console.log(user.email);
			if(user.password != req.body.user.password){
			res.json({success:false, message : 'Authentication failed! invalid username and password'});
			}else{

				 // if user is found and password is right


				// return the information including token as JSON
				res.json({
					success:true,
					message : 'user login successfull',
					obj : user
				});
			}
		}
	});
});

// Currently not using
routes.post('/createGame',function(req,res){
	
	var newGame = new game({
		gameName : req.body.game.gamename,
		playersCount : req.body.game.playersCount,
		gameScore : req.body.game.gamescore,
		players :req.body.game.players
	});
		newGame.save(function(err){
			 if(err) {
				console.log('Error Inserting New Data');
				if (err.name === 'ValidationError') {
					for (field in err.errors) {
					console.log(err.errors[field].message); 
					}
				}
				if(err.name === 'MongoError' && err.code === 11000){
					console.log("mongo error");
					return res.json({success:false,message:"error"});
				}
			}else{
				res.json({success:true, message : 'game created successfully', obj:newGame});
			}
		});
		
});

//to like a post
/*routes.post('/saveGame/:gameId',function(req,res){
	console.log(req.body.game.players);
	game.find({'_id':req.params.gameId},function(err,game){
			if(err) throw err;
			if(!game){
				res.json({success:false,message : 'Game with id : '+req.params.gameId+' could not be found'});
			}else{
				game.update(
					{'_id':req.params.game},
					{$set:{winner : req.body.game.winner, 'players' : req.body.game.players}},
					{upsert:false,new:true},
					function(err,doc){
						if(err) throw err;
						return res.json({success:true,message:'post liked successfully',doc:doc});
					}
				);
			}
	});
});*/

//to save a game
routes.post('/saveGame/:gameId',function(req,res){
	console.log(req.body.game.players);
	game.findOneAndUpdate(
		{_id : req.params.gameId}, 
		{$set:{winner : req.body.game.winner, players: req.body.game.players}},
		{upsert:false, new:true},
		function(err,game) {
			if(err) {
				throw err;
			}else{
				res.json({success:true,message : 'Game successfully saved',obj:game});
			}
	});
});


// Set our api routes
app.use('/api/v1.0', routes);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '5000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
