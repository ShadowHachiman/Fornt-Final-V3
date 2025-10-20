import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './core/service/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import {provideRouter} from "@angular/router";
import {routes} from "./app.routes";

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
      withFetch()
    )
  ]
};
