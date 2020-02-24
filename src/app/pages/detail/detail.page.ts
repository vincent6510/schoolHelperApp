import { Component, OnInit, NgZone } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Entity } from 'src/app/models/entity';
import { HelperService } from 'src/app/services/helper.service';
import { ToastController, AlertController, LoadingController, NavController } from '@ionic/angular';

declare var awanis: any;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  entity: Entity;
  readyToScan = false;
  connectStatus = 0; // 0=connecting, 1=connected, 2=failed
  statusMessage: string;
  mode:string = '';

  constructor(private dataService: DataService,
    private helperService: HelperService,
    private ngZone: NgZone,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private nav: NavController) { }

  ngOnInit() {
    this.entity = this.dataService.getData();
  }

  assignCard() {
    this.mode = 'assign';
    this.prepareToScan();
  }
  
  replaceCard() {
    this.mode = 'replace';
    this.prepareToScan();
  }

  async removeCard() {
    const alert = await this.alertController.create({
      message: 'Confirm to remove card from profile?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.mode = 'remove';
            
            this.helperService.removeCardFromEntity(this.entity.id).subscribe(
              value => 
              {
                this.ngZone.run(() => {
                  this.entity = value['entity'];
                });
                this.showAlert('Remove Card Success', 'Card Id ' + this.entity.card_no + ' removed.');
              },
              error => {
                var errObj = error['error'];
                this.showAlert('Remove Card Error', errObj['error']);
              },
              () => {
                this.blenfcStopSearchCard();
                this.setStatusMessage('');
              }
            );
          }
        }
      ]
    })
    alert.present();
  }
  
  prepareToScan() {
    this.setConnectStatus(0);
    this.setScanStatus(false);
    
    var that = this;
    awanis.blenfc.getconnectionstatus(
      {
      },
      function (resp) {
        console.log(resp);
        if (resp == 'notfound' || resp == 'disconnected') {
          that.blenfcConnect();
        }
        else if (resp == 'connected') {
          that.setConnectStatus(1);
          that.setStatusMessage('BLE device connected.');
          that.setScanStatus(true);
          that.blenfcSearchCard();
        }
      },
      function (err) {
        alert(err)
      })
  }

  blenfcConnect() {
    this.setConnectStatus(0);
    this.setStatusMessage('Connecting BLE device...');
    var that = this;
    awanis.blenfc.connect(
    {
    },
    function (resp) {
      that.setConnectStatus(1);
      that.setStatusMessage('BLE device connected.');
      console.log('success ' + JSON.stringify(resp));
      that.setScanStatus(true);
      that.blenfcSearchCard();
    },
    function (err) {
      that.setConnectStatus(2);
      that.scanError(err);
      console.log('error ' + JSON.stringify(err));
      that.setScanStatus(false);
    })
  }
  
  blenfcSearchCard() {
    if (!this.readyToScan) {
      return;
    }

    this.setStatusMessage('Ready to read card');

    var that = this;
    awanis.blenfc.autosearchcard(
    {
    },
    async function (resp) {
      console.log('success ' + JSON.stringify(resp));

      var card_id = resp['data'];

      const loading = await that.loadingController.create({
        message: that.mode + ' [' + card_id + '] ...'
      });

      await loading.present();

      that.setScanStatus(false);

      //call api 
      if (that.mode == 'assign') {
        that.helperService.assignCardToEntity(that.entity.id, card_id).subscribe(
          value => 
          {
            that.ngZone.run(() => {
              that.entity = value['entity'];
            });
            that.showAlert('Assign Card Success', 'Card Id ' + that.entity.card_no + ' assigned.');
            that.setStatusMessage('');
          },
          error => {
            var errObj = error['error'];
            that.showAlert('Assign Card Error', errObj['error']);
            that.setStatusMessage('');
          },
          () => {
            that.blenfcStopSearchCard();
          }
        );
      }
      else if (that.mode == 'replace') {
        if (card_id == that.entity.card_no) {
          that.showAlert('Replace Card Error', 'Same card detected.');
          that.setStatusMessage('');
        }
        else
        {
          that.helperService.replaceCardToEntity(that.entity.id, card_id).subscribe(
            value => 
            {
              that.ngZone.run(() => {
                that.entity = value['entity'];
              });
              that.showAlert('Replace Card Success', 'Card Id ' + that.entity.card_no + ' assigned.');
              that.setStatusMessage('');
            },
            error => {
              var errObj = error['error'];
              that.showAlert('Replace Card Error', errObj['error']);
              that.setStatusMessage('');
            },
            () => {
              that.blenfcStopSearchCard();
            }
          );
        }
      }
        
      loading.dismiss();

    },
    function (err) {
      console.log('error ' + JSON.stringify(err));
    });
  }

  blenfcStopSearchCard() {
    console.log('blenfcStopSearchCard');
    awanis.blenfc.stopautosearchcard(
      {
      },
      function (resp) {
        console.log(resp);
      },
      function (err) {
        console.log(err)
      })
  }
  
  blenfcGetMessage(): void {
    awanis.blenfc.getmessage(
    {
    },
    function (resp) {
      alert(resp);
    },
    function (err) {
      alert(err)
       
    })
  }

  blenfcGetConnStatus(): void {
    awanis.blenfc.getconnectionstatus(
      {
      },
      function (resp) {
        alert(resp);
      },
      function (err) {
        alert(err)
         
      })
  }

  async scanError(error) {
    this.setStatusMessage('Error ' + error);
    let toast = await this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  async showAlert(title, message) {
    let alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    alert.present();
  }

  setConnectStatus(status) {
    this.ngZone.run(() => {
      this.connectStatus = status;
    });
  }

  setScanStatus(status) {
    this.ngZone.run(() => {
      this.readyToScan = status;
    });
  }

  setStatusMessage(message) {
    //console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  back() {
    //force refresh data on entity page
    this.nav.navigateRoot('home',{
      queryParams: {refresh: new Date().getTime()}});
  }

  ionViewWillLeave() {
    this.blenfcStopSearchCard();
  }

}
