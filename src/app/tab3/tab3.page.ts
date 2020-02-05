import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, AlertController } from '@ionic/angular';
import { NotificationsService } from '../services/notifications.service';
import { SurveyCacheService } from '../services/survey-cache.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import * as moment from 'moment';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  // stores the user's UUID
  uuid : String;

  // flag to track whether the user is in a study
  isEnrolled = false;

  // flag to track whether notifications are enabled
  notificationsEnabled : boolean = true;
  
  // store a reference to the study object
  study = {
    properties: {
      study_name: "",
      instructions: "",
      support_email: "",
      support_url: "",
      ethics: "",
      pls: ""
    }
  };

  constructor(private storage: Storage,
    private navController: NavController,
    private alertController: AlertController,
    private iab: InAppBrowser,
    private surveyCacheService: SurveyCacheService,
    private notificsationsService: NotificationsService) {}

  ionViewWillEnter() {

    this.isEnrolled = false;
    // localForage used as workaround to db readiness issues
    // https://github.com/ionic-team/ionic-storage/issues/168
    this.storage.ready().then((localForage) => {
      localForage.ready(() => {

        Promise.all([this.storage.get("current-study"), this.storage.get("uuid"), this.storage.get("notifications-enabled"), this.storage.get("logs")]).then(values => {

          // check if user is currently enrolled in study
          // to show/hide additional options
          let studyObject = values[0];
          if (studyObject !== null) {
            this.isEnrolled = true;
            this.study = JSON.parse(studyObject);
          } else {
            this.isEnrolled = false;
          }

          // get the uuid from storage to display in the list
          this.uuid = values[1];
          
          // get the status of the notifications
          let notificationsEnabled = values[2];
          if (notificationsEnabled === null) this.notificationsEnabled = false;
          else this.notificationsEnabled = notificationsEnabled;

          // log the user visiting this tab
          let logs = values[3];
          let logEvent = {
            timestamp: moment().format(),
            page: 'settings',
            module_index: -1,
            uploaded: false
            //
          };
          logs.push(logEvent);
          this.storage.set('logs', logs);
        }); 
      });
    });
  }

  /**
   * Display a dialog to withdraw from the study
   */
  async withdrawFromStudy() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'By withdrawing, you will lose all progress.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Withdraw',
          handler: () => {
            // remove the study data from storage
            this.storage.remove("current-study").then(() => {
              this.storage.remove('study-tasks').then(() => {
                this.storage.remove('logs').then(() => {

                
                  // cancel all notifications
                  this.notificsationsService.cancelAllNotifications();

                  // delete all cached data
                  this.storage.remove("logs");

                  // navigate to the home tab
                  this.navController.navigateRoot('/');
                });
              });
            });
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Enables/disables the notifications
   */
  toggleNotifications() {
    // update the notifications flag
    this.storage.set('notifications-enabled', this.notificationsEnabled);
    // set the next 30 notifications (cancels all notifications before setting them if enabled)
    this.notificsationsService.setNext30Notifications();
  }

  /**
   * Opens the support website for the current study in a web browser
   * @param support_url The current study's support website URL
   */
  openSupportURL(support_url) {
    //window.location.href = support_url;
    const browser = this.iab.create(support_url, "_system");
  }

  /**
   * Opens a new email addressed to the current study's support email address
   * @param support_email The current study's support email address
   * @param study_name The current study's name
   */
  openSupportEmail(support_email, study_name) {
    window.location.href = "mailto:"+support_email+"?subject=Support: "+study_name;
  }

}
