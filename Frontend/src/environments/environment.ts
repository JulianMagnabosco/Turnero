export const environment = {
  apiUrl: (typeof window !== "undefined")?(window as any|undefined)['env']['ApiUrl'] || 'localhost:3000':'localhost:3000',
};
