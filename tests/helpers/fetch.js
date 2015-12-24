import http from 'http';


export const fetch = (method, params) => {
  return new Promise((resolve) => {
    http[method](params, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const obj = JSON.parse(data);
        resolve(obj);
      });
    });
  });
};
