import { NgModule, ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule, MatCheckboxModule, MatIconModule, MatCardModule, MatTableModule, MatSidenavModule, MatTooltipModule } from '@angular/material';
//import { JwtStorageService } from '@service/jwt-storage';
import { AuthGuardService } from '@service/auth-guard';
import { HttpService } from '@service/http';
import { CacheService } from '@service/cache';
import { TokenStorageService } from './auth/token-storage.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSidenavModule,
    MatTooltipModule
  ],
  declarations: [],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AppShareModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppShareModule,
      providers: [
        TokenStorageService,
        AuthGuardService,
        HttpService,
        CacheService
      ]
    }
  }
}
