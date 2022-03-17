import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading:boolean = false;
  isCaching:boolean = false;

  constructor(public loadingController: LoadingController) { }

  /**
   * Displays the loading dialog
   * @param msg The message to display in the loading dialog
   */
  async present(msg) {
    this.isLoading = true
    return await this.loadingController.create({
      message: msg,
      spinner: "crescent",
      duration: 7000
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'))
        }
      })
    })
  }

  /**
   * Dismisses the loading dialog
   */
  async dismiss() {
    this.isLoading = false
    this.isCaching = false
    const loader = await this.loadingController.getTop()
    return await loader.dismiss()
  }

}
