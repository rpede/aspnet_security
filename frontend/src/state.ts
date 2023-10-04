import {Injectable} from "@angular/core";
import {User} from "./models";

@Injectable({
  providedIn: 'root'
})
export class State {
  users: User[] = [];
}
