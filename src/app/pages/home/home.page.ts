import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Category } from 'src/app/models/category';
import { Class } from 'src/app/models/class';
import { Entity } from 'src/app/models/entity';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  categories: Category[];
  classes: Class[];
  entities: Entity[];
  filteredEntities: Entity[];

  category_id: number = 0;
  class_id: number = 0;
  
  searchTerm: string = '';
  loading = false;

  constructor(private router: Router,
    private helperService: HelperService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private dataService: DataService,
    private navCtrl: NavController) { }

  ngOnInit() {
    this.entities = [];
    this.filteredEntities = [];
    this.loadData();
  }

  ionViewWillEnter() {
    console.log("ionViewWillEnter");
    this.getEntityList();
  }

  async loadData() {
    this.loading = true;
    const loading = await this.loadingController.create({
      message: 'Loading...'
    });

    await loading.present();

    this.helperService.getCategories().subscribe(value => {
      this.categories = value;
    }
    );
    
    this.helperService.getClasses().subscribe(value => {
      this.classes = value;
      loading.dismiss();
      this.loading = false;
    }
    );

  }

  getEntityList() {
    this.entities = [];
    this.filteredEntities = [];
    if (this.category_id > 0 && this.class_id > 0) {
      this.loading = true;
      this.helperService.getEntityList(this.category_id.toString(), this.class_id.toString()).subscribe(value => {
        this.entities = value;
        this.filteredEntities = this.entities;
        this.loading = false;
      }
      );
    }
  }

  filterItems() {
    if (this.searchTerm == '')
    {
      this.filteredEntities = this.entities;
    }
    else
    {
      this.filteredEntities = this.entities.filter(entity => {
        return entity.code.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1 ||
        entity.name_1.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1 ||
        entity.name_2.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
        ;
      });
    }
  }

  detail(entity: Entity) {
    this.dataService.setData(entity);
    this.router.navigate(['detail']);
  }
  
  async logout() {
    const loading = await this.loadingController.create({
      message: 'Logging out...'
    });
    await loading.present();
    this.authService.logout().subscribe(
      data => {
        loading.dismiss();
      },
      error => {
        loading.dismiss();
        console.log(error);
      },
      () => {
        this.navCtrl.navigateRoot('/login');
      }
    );
  }
}
