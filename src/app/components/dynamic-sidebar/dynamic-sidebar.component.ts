import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TokenStorageService } from 'src/app/shared-elements/services/token-storage.service';
import { Menu } from 'src/app/shared-elements/utils/entities/menu';

@Component({
  selector: 'app-dynamic-sidebar',
  templateUrl: './dynamic-sidebar.component.html',
  styleUrls: ['./dynamic-sidebar.component.scss'],
})
export class DynamicSidebarComponent implements OnInit {
  @Input() isExpanded = false;
  @Input() isShowing = false;
  menusConfig: Menu[] = [];
  idUser: string;
  idAppRole: string;
  version: string = "V.3.0.2.0";

  constructor(
    public translate: TranslateService,
    private tokenStorageService: TokenStorageService
  ) {}

  ngOnInit() {
    if (this.tokenStorageService.isLoggin()) {

      const user = this.tokenStorageService.getUser();
      console.log(user);

      this.idUser = user.id;
      this.idAppRole = user.listRols[0].application;

      console.log(user.listRols.length);

      if (user.listRols.length == 1){
        this.menusConfig = user.listRols[0].listModules.filter(x => x.nactived =="0");
      }else{

        user.listRols.forEach(rol => {
          rol.listModules.forEach(module => {
            if(module.nactived == '0'){
              this.menusConfig.push(module);
            }
          });
        });

        // Eliminar modulos repetidos
        var hash = {};
        this.menusConfig = this.menusConfig.filter(menuModule => {
          var exists = !hash[menuModule.id];
          hash[menuModule.id] = true;
          return exists;
        });

        this.menusConfig = this.menusConfig.sort((a, b) => {
          return parseInt(a.id.substring(1), 10) - parseInt(b.id.substring(1), 10);
        });

      }



      console.log('Menus desde el sidebar: ', this.menusConfig);
      this.proccessMenu();
    }
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

  proccessMenu() {
    let ERASE_URL: string = "/notfound";
    for (let menu of this.menusConfig) {
      menu.menuSelected = true;
      menu.listArbolModulo.forEach((item) => {
        item.routeAngular =
          item.routeAngular == null
            ? ERASE_URL
            : item.routeAngular.replace(":codUsuario", this.idUser);
        item.routeAngular =
          item.routeAngular == null
            ? ERASE_URL
            : item.routeAngular.replace(
                ":aplicaciones",
                this.idAppRole == "0" ? "CJCOCR&MAIN" : this.idAppRole + "&MAIN"
              );
      });
    }
  }

  toogle(fatherMenu: Menu) {
    let status = fatherMenu.menuSelected;
    fatherMenu.menuSelected = !status;
    console.log("fatherMenu.menuSelected: ", fatherMenu.menuSelected);
  }
}

