import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public router : Router) { }

  ngOnInit() {
  }

  start(){
	  this.router.navigate(['home']);
  }

}
