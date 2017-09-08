import { Injectable } from '@angular/core';
//import 'rxjs/add/operator/map';

import { NavController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { firebaseConfig } from '../../assets/authenticate';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { TreeContentPage } from '../../pages/tree-content/tree-content';

@Injectable()
export class ContentProvider {

  public favorites: any = {};/* {
    '/Pharmacopeia/Analgesics/Clonidine': 'Clonidine',
    '/Pharmacopeia/Sedatives/Lorazepam':  'Lorazepam'
  }; */

  public documentObject: any = {};
  
  constructor(private storage: Storage) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    let ref = firebase.database().ref('/documents/pharmacopeia');

    ref.once('value', snapshot => this.documentObject = snapshot.val());

    // Initialize Favorites
    storage.ready().then(() => {
      storage.get('favorites').then((val) => {
        console.log('`storage.get`: ' + val);

        if (val) {
          let parsed = JSON.parse(val);

          if (parsed)
            this.favorites = parsed;
        }
      });
    });
  }

  public isAFavoritePage(path: string): boolean {
    return !!this.favorites[path];
  }

  public addFavoritePage(name: string, path: string) {
    this.favorites[path] = name;
    this.storeFavorites();
  }

  public removeFavoritePage(name: string, path: string) {
    delete this.favorites[path];
    this.storeFavorites();
  }

  private storeFavorites() {
    let favString = JSON.stringify(this.favorites);

    this.storage.ready().then(() => {
      this.storage.set('favorites', favString);
      console.log('Favorites: ' + favString);
    });
  }

  /**
   * Returns the object representing a node in the CMS document tree
   * @param path URL-like path that identifies a node in the CMS document tree
   */
  public getNodeFromPath(path: string): any {
    let pages: string[] = path.split('/').filter((o) => { return o != ''; });
    let d = this.documentObject;

    while (pages.length > 0) {
      let nodeTitle: string = pages.shift();

      for (let n of d.items)
        if (n.title == nodeTitle) {
          d = n;
          break;
        }
    }

    return d;
  }

  public navPath(path: string, nav: NavController) {
    nav.push(TreeContentPage, { content: this.getNodeFromPath(path) });
  }

  public logNavStatus(nav: NavController) {
    let navStatus = {
      length: nav.length(),
      type: nav.getType(),
      views: nav.getViews()
    };
    console.log(navStatus);
  }

}
