import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService} from '../user.service';
import { GameService} from '../game.service';
import { CoolSessionStorage } from 'angular2-cool-storage';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  gameHistory  = [];

	errorMessage: string;
	mode = 'Observable';
	sessionStorage: CoolSessionStorage;
	user: any = {};

   constructor(sessionStorage: CoolSessionStorage, private router: Router, private userService: UserService, private gameService: GameService) {
        this.sessionStorage = sessionStorage;   
    }

  ngOnInit() {
	let loggedUser = this.sessionStorage.getItem('user');
		if (loggedUser) {
			this.user = JSON.parse(loggedUser);
		} else {
			this.user = null;
		}

	  this.userService.getGamesHistory(this.user.email)
										.subscribe( resp => {
													console.log(resp);
													this.gameHistory = resp.resultObj;
										},
										error =>  this.errorMessage = <any>error
										);

  }

  viewStats(index) {
   
    console.log("inside view game stats");
	console.log(this.gameHistory[index]);
	this.gameService.setGameStats(this.gameHistory[index]);
	this.router.navigateByUrl("/game-stats");
  }
}
