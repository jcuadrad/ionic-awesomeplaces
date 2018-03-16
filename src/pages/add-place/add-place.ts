import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController, LoadingController, ToastController, normalizeURL } from 'ionic-angular';

import { SetLocationPage } from '../set-location/set-location';

import { Location } from '../../models/location';
import { Geolocation } from '@ionic-native/geolocation';
import { File, Entry, FileError } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { PlaceService } from '../../services/places';

declare var cordova: any;

@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  location: Location = {
    lat: 40.7624324,
    lng: -73.9759827
  };
  marker: Location;
  locationIsSet = false;
  imgUrl: string;

  constructor(private modalCtrl: ModalController, 
              private geolocation: Geolocation,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private camera: Camera,
              private placesService: PlaceService,
              private file: File) {}

  onSubmit(form: NgForm) {
    this.placesService
      .addPlace(form.value.title, form.value.description, this.location, this.imgUrl)
      form.reset();
      this.location = {
        lat: 40.7624324,
        lng: -73.9759827
      },
      this.imgUrl = '';
      this.locationIsSet = false;
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage, {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(
      data => {
        if (data) {
          this.location = data.markerLocation;
          this.marker = data.markerLocation;
          this.locationIsSet = true;
        }
      }
    );
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    loader.present();
    this.geolocation.getCurrentPosition()
      .then((res) => {
        console.log(res);
        loader.dismiss();
        this.location = {
          lat: res.coords.latitude,
          lng: res.coords.longitude,
        }
        this.marker = {
          lat: res.coords.latitude,
          lng: res.coords.longitude
        }
        this.locationIsSet = true;
      })
      .catch(err => {
        console.log(err);
        loader.dismiss();
        const toast = this.toastCtrl.create({
          message: 'Could not get location, please pick manually!',
          duration: 2500
        })
        toast.present();
      })
  }

  onTakePhoto() {
    const options: CameraOptions = {
      quality: 100,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }

    this.camera.getPicture(options)
      .then(imgData => {
        const currentName = imgData.replace(/^.*[\\\/]/, '');
        const path = imgData.replace(/[^\/]*$/, '');
        console.log('RAW IMAGE DATA', imgData, 'CURRENT NAME', currentName,'PATH', path);
        this.file.copyFile(path, currentName, cordova.file.dataDirectory, currentName)
          .then((data: Entry) => {
            console.log('NATIVEURL', data.nativeURL, 'DATA', JSON.stringify(data))
            this.imgUrl = normalizeURL(data.nativeURL);
            this.camera.cleanup();
          })
          .catch((err: FileError) => {
            console.log(JSON.stringify(err));
            this.imgUrl = '';
            const toast = this.toastCtrl.create({
              message: 'Could not save image, please try again',
              duration: 2500
            });
            toast.present();
            this.camera.cleanup();
          });
        // this.imgUrl = normalizeURL(imgData);
      })
      .catch(err => console.log(err));
  }
}
