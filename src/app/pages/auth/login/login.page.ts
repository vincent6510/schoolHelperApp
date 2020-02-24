import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, LoadingController, Platform } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  test1 = 'pos1';
  test2 = '1234';

  appVersionStr: string;
  storageUsername: string;

  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private loadingController: LoadingController,
    private appVersion: AppVersion
  ) { }
  ngOnInit() {
  }

  
  ionViewWillEnter() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.authService.getStorageUsername().then(
          data => {
            this.storageUsername = data;
          }
        );
      }
      
      this.appVersion.getVersionNumber().then(
        (version)=>{
          this.appVersionStr = version;
        },
        error => {
          this.appVersionStr = 'N/A';
        }
      );
    });
  }
  
  async login(form: NgForm) {
    
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });

    await loading.present();
    this.authService.login(form.value.username, form.value.password).subscribe(
    //this.authService.login(this.test1, this.test2).subscribe(
      data => {
        loading.dismiss();
        //this.alertService.presentToast("Logged In");
      },
      error => {
        loading.dismiss();
        //if (error.status === 401) {
          this.alertService.presentToast(error.statusText);
        //}
        console.log(error);
      },
      () => {
        //this.dismissLogin();
        this.navCtrl.navigateRoot('/home');
      }
    );
  }
}