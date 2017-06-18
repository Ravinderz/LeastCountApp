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

routes.post('/user/register',function(req,res){
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
routes.post('/user/login',function(req,res){
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
routes.post('/game/createGame',function(req,res){

	var newGame = new game({
		gameName : req.body.game.gamename,
		playersCount : req.body.game.playersCount,
		gameScore : req.body.game.gamescore,
		gameOwner :  req.body.game.gameOwner,
		circle :  req.body.game.circle,
		players :req.body.game.players,
		//createdTime : new Timestamp()
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

//to create circle
routes.post('/user/create/circle',function(req,res){
  // var host = req.body.host;
  var email = req.body.user.email;
  var circleDetails = {name: String,members : [String] };
  var	circles = [{name : String,members : [String] ,isActive : {type:Boolean}}];
  circleDetails = req.body.user.circleDetails;

  user.findOne({email:email},function(err,foundObj){

    if(err){
      console.log('Error Inserting New Data');
      if (err.name === 'ValidationError') {
        for (field in err.errors) {
          console.log(err.errors[field].message);

          return 	res.json({success:false, message : 'Unable to create circle'});

        }
      }

      return 	res.json({success:false, message : 'Unable to create circle'});
    }else{
      //checking if circle name already exist or not
      circles = foundObj.circles;
      for(i=0;i < circles.length ;i++){

        if(circleDetails.name === circles[i].name)
        {

          return 	res.json({success:false, message : 'Circle name already exist'});
        }
      }
      foundObj.circles.push({name:circleDetails.name,members:circleDetails.members,isActive:true});

      //foundObj.circles += circleDetails;
      foundObj.save(function(err,updateObj){

        if(err){
          console.log('Error Inserting New Data');
          if (err.name === 'ValidationError') {
            for (field in err.errors) {
              console.log(err.errors[field].message);
              return 	res.json({success:false, message : 'Unable to create circle'});
            }
          }
          return 	res.json({success:false, message : 'Unable to create circle'});
        }else{
          return 	res.json({success:true, message : 'Successfully created circle',resultObj :foundObj });
        }
      });
    }
  })
});


//to add member in  circle
routes.post('/user/edit/circle/add',function(req,res){
  // var host = req.body.host;
  var email = req.body.user.email;
  var circleName = req.body.user.circleName;
  var newMember = req.body.user.member;
  var	circles = [{name : String,members : [String] ,isActive : {type:Boolean}}];
  user.findOne({email:email},function(err,foundObj){

    if(err){
      console.log('Error Inserting New Data');
      if (err.name === 'ValidationError') {
        for (field in err.errors) {
          console.log(err.errors[field].message);

          return 	res.json({success:false, message : 'Unable to update circle'});

        }
      }

      return 	res.json({success:false, message : 'Unable to update circle'});
    }else{
    	
    	console.log("result : ",foundObj)
    	 circles = foundObj.circles;
        for(i=0;i < circles.length ;i++){

          if(circleName === circles[i].name)
          {
            if(foundObj.circles[i].members.indexOf(newMember) === -1)
            	{
            foundObj.circles[i].members.push(newMember);
            break;
            	}
            else {
            	return 	res.json({success:false, message : 'Member already exist'});
            }
          }
        }
        
       
      foundObj.save(function(err,updateObj){

        if(err){
          console.log('Error Inserting New Data');
          if (err.name === 'ValidationError') {
            for (field in err.errors) {
              console.log(err.errors[field].message);
              return 	res.json({success:false, message : 'Unable to create circle'});
            }
          }
          return 	res.json({success:false, message : 'Unable to update circle'});
        }else{
          return 	res.json({success:true, message : 'Successfully update circle',resultObj :updateObj });
        }
      });
      
    }
  })
});

//to delete a member in  circle
routes.post('/user/edit/circle/delete',function(req,res){
  // var host = req.body.host;
  var email = req.body.user.email;
  var circleName = req.body.user.circleName;
  var member = req.body.user.member;
  var	circles = [{name : String,members : [String] ,isActive : {type:Boolean}}];
  user.findOne({email:email},function(err,foundObj){

    if(err){
      console.log('Error Inserting New Data');
      if (err.name === 'ValidationError') {
        for (field in err.errors) {
          console.log(err.errors[field].message);

          return 	res.json({success:false, message : 'Unable to delete member circle'});

        }
      }

      return 	res.json({success:false, message : 'Unable to update circle'});
    }else{
    	
    	console.log("result : ",foundObj)
    	 circles = foundObj.circles;
        for(i=0;i < circles.length ;i++){

          if(circleName === circles[i].name)
          {
            if(foundObj.circles[i].members.indexOf(member) === -1)
            	{
            	return 	res.json({success:false, message : 'Member doen not exist to delete'});
            	}
            else {
            	foundObj.circles[i].members.splice(foundObj.circles[i].members.indexOf(member),1) 
            }
          }
        }
        
      foundObj.save(function(err,updateObj){

        if(err){
          console.log('Error Inserting New Data');
          if (err.name === 'ValidationError') {
            for (field in err.errors) {
              console.log(err.errors[field].message);
              return 	res.json({success:false, message : 'Unable to create circle'});
            }
          }
          return 	res.json({success:false, message : 'Unable to delete member circle'});
        }else{
          return 	res.json({success:true, message : 'Successfully delete member from circle',resultObj :updateObj });
        }
      });
      
    }
  })
});

//to get the user history based on emailId
routes.get('/user/getHistory/:emailId',function(req,res){
	 
	  var emailId = req.params.emailId;
	  

	  game.find({gameOwner:emailId}).sort({createdTime : -1}).find(function(err,foundObj){

	    if(err){
	      console.log('Error Inserting New Data');
	      if (err.name === 'ValidationError') {
	        for (field in err.errors) {
	          console.log(err.errors[field].message);

	          return 	res.json({success:false, message : 'Unable to get history'});

	        }
	      }

	      return 	res.json({success:false, message : 'Unable to get history'});
	    }else{
	    	if(!foundObj || foundObj.length === 0){
	    		return 	res.json({success:false, message : 'History not available for this user'});
	    	}
	   		return 	res.json({success:true, message : 'History available',resultObj:foundObj});
	    }
	  })
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
