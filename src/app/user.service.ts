import { Injectable }              from '@angular/core';
import { Http, Response }          from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from './user';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {
	
	createCircleUrl = "http://localhost:5000/api/v1.0/user/create/circle";
	saveCircleUrl = "http://localhost:5000/api/v1.0/user/edit/circle";
	

  constructor(private http: Http) { }

  updateGameMsgOption (value: any, apiUrl : string): Observable<any> {
	let headers = new Headers({ 'Content-Type': 'application/json' });
	let options = new RequestOptions({ headers: headers });
	return this.http.post(apiUrl, { value }, options)
             .map(this.extractData)
             .catch(this.handleError);

}

	getGamesHistory(email: string){
	let getHistoryUrl = 'http://localhost:5000/api/v1.0/user/getHistory/';
	getHistoryUrl = getHistoryUrl + email; 
	let headers = new Headers({ 'Content-Type': 'application/json' });
	let options = new RequestOptions({ headers: headers });
	return this.http.get(getHistoryUrl,options)
             .map(this.extractData)
             .catch(this.handleError);
	}
	
	createCircle(user: any){
		console.log(user);
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.createCircleUrl, { user }, options)
             .map(this.extractData)
             .catch(this.handleError);
	}
	
	saveCircle(user: any){
		console.log(user);
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		return this.http.post(this.saveCircleUrl, { user }, options)
             .map(this.extractData)
             .catch(this.handleError);
	}	

 private extractData(res: Response) {
    let body = res.json();
    return body || { };
  }

  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}