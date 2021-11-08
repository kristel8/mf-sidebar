import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MatDrawerMode,
  MatSidenav,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SidebarService } from './services/sidebar.service';
import { ConfigUserService } from './shared-elements/services/config-user.service';
import { TokenStorageService } from './shared-elements/services/token-storage.service';
import { ConfigSegUser } from './shared-elements/utils/entities/config-seg-user';
import { Menu } from './shared-elements/utils/entities/menu';
import { StatusLogin } from './shared-elements/utils/entities/status-login';
import { take } from 'rxjs/operators';
import { timer } from 'rxjs';
import { ToggleSidebar } from './entities/toggle-sidebar';
@Component({
  selector: 'mf-hcenter3-sidebar',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'mf-hcenter3-sidebar';

  @ViewChild('sidebar', { static: false }) sidebar: MatSidenav;
  @ViewChild('content', { static: false }) content: MatSidenavContent;

  // Sidebar
  idUser: string;
  idAppRole: string;
  isExpanded = false;
  isShowing = false;
  menusConfig: Menu[];
  modeSidebar: MatDrawerMode = 'side';
  isToggled = false;

  subscription = null;
  configSegUser: ConfigSegUser;
  timer: number = 0;

  constructor(
    public configUserService: ConfigUserService,
    public translate: TranslateService,
    private tokenStorageService: TokenStorageService,
    private sidebarService: SidebarService,
    private dialogRef: MatDialog,
    private route: Router
  ) {
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/es|en/) ? browserLang : 'en');
  }


  private _listener = () => {
    this.tokenStorageService.checkUserShouldSingOut();
  };

  private _listenerNavbarToggle = () => {
    if(localStorage.getItem('toggleSidebar')) {
      const newToggleSideBar:ToggleSidebar = JSON.parse(localStorage.getItem('toggleSidebar'));
      this.isExpanded = newToggleSideBar.isExpanded;
      this.isToggled = newToggleSideBar.isToggled;
    }
  };

  public IstatusLogin: StatusLogin = {
    statusLogin: false,
    changePassword: false,
  };

  @HostListener('document:keyup', ['$event'])
  @HostListener('document:click', ['$event'])
  @HostListener('document:wheel', ['$event'])
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  initTimer(endTime: number) {
    if (
      this.configSegUser &&
      this.configSegUser.flagBlockUserInactivityPeriod == '1'
    ) {
      if (endTime != 0) {
        const interval = 1000;
        const duration = endTime * 60;

        this.subscription = timer(0, interval)
          .pipe(take(duration))
          .subscribe(
            (value) => {
              //console.log(value);
              if (value == endTime) {
                this.logout();
              }
            },
            (err) => {}
          );
      }
    }
  }

  resetTimer() {
    if (this.IstatusLogin.statusLogin) {
      this.clearTimer();
      this.initTimer(this.timer);
    }
  }

  clearTimer() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  logout() {
    this.clearTimer();
    this.IstatusLogin = { statusLogin: false, changePassword: false };
    this.tokenStorageService.signOut();
    this.dialogRef.closeAll();
    this.route.navigate(['/login']);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this._listener, false);
    window.removeEventListener('navBarToggle', this._listenerNavbarToggle, false);
  }

  ngAfterViewInit(): void {
    if (window.addEventListener) {
      window.addEventListener('storage', this._listener, false);
      window.addEventListener('navBarToggle', this._listenerNavbarToggle, false);
    }
  }

  ngOnInit() {
    // window.addEventListener('storage', () => {
    //   console.log(JSON.parse(window.localStorage.getItem('toggleSidebar')));
    // });
    console.log('Entro SIDEBAR');
    this.tokenStorageService.IstatusLoginObservable$.subscribe(
      (session: StatusLogin) => {
        console.log('hola');
        this.IstatusLogin = session;
        this.configUserService.getLastConfig().subscribe(
          (succes) => {
            //flagBlockUserInactivityPeriod
            console.log(succes);

            if (succes.flagMinimumForceChangePassword == '1') {
              //let datecaducidad= Number(this.tokenStorageService.getUser().periodoCaducidadContrasena);
              let strcaducidad =
                this.tokenStorageService.getUser().periodoCaducidadContrasena;
              let caducidaddate = new Date(
                strcaducidad.substr(0, 4) +
                  '-' +
                  strcaducidad.substr(4, 2) +
                  '-' +
                  strcaducidad.substr(6, 2) +
                  'T00:00:00'
              );

              let today = new Date();

              caducidaddate.setDate(
                caducidaddate.getDate() + succes.minimumForceChangePassword
              );

              //futureDate.setDate(futureDate.getDate() + days);

              var day = ('0' + today.getDate()).slice(-2);
              var month = ('0' + (today.getMonth() + 1)).slice(-2);
              var year = today.getFullYear();
              let datecadatoday = Number(year + month + day);

              var day = ('0' + caducidaddate.getDate()).slice(-2);
              var month = ('0' + (caducidaddate.getMonth() + 1)).slice(-2);
              var year = caducidaddate.getFullYear();
              let datecaducidad = Number(year + month + day);

              if (datecadatoday >= datecaducidad) {
                console.log('cambio');
                this.IstatusLogin.changePassword = true;
                this.tokenStorageService.changePasswordSessionView();
              }
            }

            this.configSegUser = succes as ConfigSegUser;
            if (this.configSegUser.flagBlockUserInactivityPeriod == '1') {
              this.timer = this.configSegUser.blockUserInactivityPeriod;
              this.resetTimer();
            }
          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log('no se puese asociar');
      },
      () => {
        console.log('finalizado');
      }
    );

    // const session = await this.tokenStorageService.IstatusLoginObservable$.toPromise();
    // console.log(session);
    // this.IstatusLogin = session;

    console.log(
      'Componente Padre : login: ' +
        this.IstatusLogin.statusLogin +
        ' / changePassword: ' +
        this.IstatusLogin.changePassword
    );
    // Valida si el usuario esta logeado, en caso si se recarga la pagina y el token existe.
    if (this.tokenStorageService.isLoggin()) {
      this.IstatusLogin.statusLogin = true;
      this.configUserService.getLastConfig().subscribe(
        (succes) => {
          this.configSegUser = succes as ConfigSegUser;
          this.timer = this.configSegUser.blockUserInactivityPeriod;
          this.resetTimer();
        },
        (error) => {
          console.log(error);
        }
      );
    }

    if (sessionStorage.getItem('changePassword') === 'true') {
      this.IstatusLogin.changePassword = true;
    }
    // this.getMenuConfig();

    // const change = this.storageService.changes;
    // change.subscribe((res) => console.log('TEST ALEXANDER:', res));
  }

  isLogin($event): void {
    console.log('llego al padre');
    this.IstatusLogin.statusLogin = $event.statusLogin;
    this.IstatusLogin.changePassword = $event.changePassword;
  }

  // Sidebar
  // toggleSideBar() {
  //   this.isShowing = false;
  //   this.isExpanded = !this.isExpanded;
  //   this.isToggled = !this.isToggled;
  //   this.sidebarService.isOpenSidenav(false);
  // }

  toogleMouseSideBar() {
    if (!this.isToggled) {
      this.isExpanded = !this.isExpanded;
      this.sidebarService.isOpenSidenav(false);
    }
  }

  // SideBar
  getMenuConfig() {
    if (this.tokenStorageService.isLoggin()) {
      const user = this.tokenStorageService.getUser();
      this.idUser = user.id;
      this.idAppRole = user.listRols[0].application;

      this.menusConfig = user.listRols[0].listModules;
      console.log('Menus desde el sidebar: ', this.menusConfig);
      this.proccessMenu();
    }
  }

  proccessMenu() {
    let ERASE_URL: string = '/notfound';
    for (let menu of this.menusConfig) {
      menu.menuSelected = true;
      menu.listArbolModulo.forEach((item) => {
        item.routeAngular =
          item.routeAngular == null
            ? ERASE_URL
            : item.routeAngular.replace(':codUsuario', this.idUser);
        item.routeAngular =
          item.routeAngular == null
            ? ERASE_URL
            : item.routeAngular.replace(
                ':aplicaciones',
                this.idAppRole == '0' ? 'CJCOCR&MAIN' : this.idAppRole + '&MAIN'
              );
      });
    }
  }

  mouseenter() {
    if (!this.isExpanded) {
      this.modeSidebar = 'over';
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
      this.modeSidebar = 'side';
      this.sidebarService.isOpenSidenav(false);
      // Para que el contenido se alinee a la izquierda.
      setTimeout(() => {
        this.content.getElementRef().nativeElement.style.cssText =
          'margin-left: 72px !important';
      }, 100);
    }
  }
}
