import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { Menu } from 'src/app/shared-elements/utils/entities/menu';
import { SubMenu } from 'src/app/shared-elements/utils/entities/sub-menu';

@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.scss']
})
export class MenuListItemComponent implements OnInit {
  isMenuExpanded = false;
  isFatherSelected: boolean;
  @HostBinding("attr.aria-expanded") ariaExpanded = this.isMenuExpanded;
  @Input() item: Menu;
  @Input() isSidenavExpanded: boolean;
  @Input() isSidenavShowing: boolean;
  @Input() depth: number;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private sidebarService: SidebarService
  ) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {
    this.isFatherSelected = false;
    this.sidebarService.channel$.subscribe((isOpen: boolean) => {
      // if (!this.isSidenavExpanded) {
      this.isMenuExpanded = isOpen;
      // }
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log(this.item.listArbolModulo);
        for (let i = 0; i < this.item.listArbolModulo.length; i++) {
          if (this.item.listArbolModulo[i].routeAngular === event.url) {
            this.isFatherSelected = true;
            return;
          } else {
            this.isFatherSelected = false;
          }
        }
      }
    });
  }

  onItemSelected(item) {
    if (item.listArbolModulo && item.listArbolModulo.length) {
      this.isMenuExpanded = !this.isMenuExpanded;
    }
  }

  isActiveFatherRoute() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.item.listArbolModulo.forEach((child: SubMenu) => {
          console.log("routeChild: ", child.routeAngular);
          console.log("routeReal: ", event.url);
          if (child.routeAngular === event.url) {
            this.isFatherSelected = true;
          } else {
            this.isFatherSelected = false;
          }
          console.log("isFatherSelected: ", this.isFatherSelected);
        });
      }
    });
  }

  getLabelByLanguaje(cadena: string): string {
    const languaje = this.translate.store.currentLang;
    let sRet = cadena + "";
    switch (languaje) {
      case "es":
        sRet = sRet.split(";")[0].substring(sRet.indexOf("=") + 1);
        break;
      case "en":
        sRet = sRet.split(";")[1].substring(sRet.indexOf("=") + 1);
        break;
    }
    return " " + sRet;
  }
}
