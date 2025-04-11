export const environment = {
  apiUrl: (typeof window !== "undefined")?(window as any|undefined)['env']['ApiUrl'] || 'localhost:8081':'localhost:8081',
};
