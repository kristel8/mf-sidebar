import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DynamicSidebarComponent } from './components/dynamic-sidebar/dynamic-sidebar.component';
import { MenuListItemComponent } from './components/menu-list-item/menu-list-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './shared-elements/utils/material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    DynamicSidebarComponent,
    MenuListItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule
  ],
  exports: [
    MenuListItemComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
