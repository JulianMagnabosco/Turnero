export const environment = {
  apiUrl: (typeof window !== "undefined")?(window as any|undefined)['env']['ApiUrl'] || 'http://localhost:8081':'http://localhost:8081',
};
