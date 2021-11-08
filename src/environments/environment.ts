// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


const envGlobal: {[key: string]: any} = window;
export const environment = {
  production: false,
  urlGateway: envGlobal['urlGateway'],
  urlReport: envGlobal['urlReport']
};
