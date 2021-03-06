import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AddPlacePage } from '../add-place/add-place';
import { Place } from '../../models/place';
import { PlaceService } from '../../services/places';
import { PlacePage } from '../place/place';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  addPlacePage = AddPlacePage;
  places: Place[] = [];

  constructor(public navCtrl: NavController, 
              private placesService: PlaceService,
              private modalCtrl: ModalController) {

  }

  ngOnInit() {
    this.placesService.fetchPlaces()
      .then(
        (places: Place[]) => {
          this.places = places;
      })
  }

  ionViewWillEnter() {
    this.places = this.placesService.loadPlaces();
  }

  onOpenPlace(place: Place, index: number) {
    const modal = this.modalCtrl.create(PlacePage, {place: place, index: index})
    modal.present();
  }

}
