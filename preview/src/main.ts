import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppModule } from './app/app.module';


export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

const providers = [
  { 
    provide: 'BASE_URL', 
    useFactory: getBaseUrl, 
    deps: []
  }
];

// Bootstrap do AppModule
platformBrowserDynamic(providers).bootstrapModule(AppModule).catch(err => console.log(err));