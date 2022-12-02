import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';

interface CryptoModel {
  name: string;
  change: number;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  cryptoList: CryptoModel[] = [
    {
      name: 'btc',
      change: 0,
    },
  ];

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cryptoList.map((cryptoObj) => {
      this.http
        .get(
          'https://data.messari.io/api/v1/assets/' + cryptoObj.name + '/metrics'
        )
        .subscribe((res: any) => {
          cryptoObj.change =
            res.data.market_data.percent_change_usd_last_24_hours;
        });
    });
  }

  async add(): Promise<void> {
    let alertObj = await this.alertCtrl.create();
    alertObj.header = 'Add crypto';
    alertObj.inputs = [
      {
        placeholder: 'enter crypto symbol',
        name: 'name',
      },
    ];
    alertObj.buttons = [
      {
        text: 'Cancel',
      },
      {
        text: 'Submit',
        handler: (inputObj) => {
          if (inputObj) {
            this.http
              .get(
                'https://data.messari.io/api/v1/assets/' +
                  inputObj.name +
                  '/metrics'
              )
              .subscribe(
                async (res: any) => {
                  if (res.data.market_data.percent_change_usd_last_24_hours) {
                    this.cryptoList.push({
                      name: inputObj.name,
                      change: 0,
                    });
                    this.ngOnInit();
                  } else {
                    this.handleError();
                  }
                },
                (err) => {
                  this.handleError();
                }
              );
          }
        },
      },
    ];
    alertObj.present();
  }

  async handleError(): Promise<void> {
    let toastObj = await this.toastCtrl.create({
      message: 'Invalid crypto',
      duration: 1500,
      position: 'bottom',
    });
    await toastObj.present();
  }

  getColor(cryptoObj: CryptoModel): string {
    return cryptoObj.change > 0 ? 'success' : 'danger';
  }
}
