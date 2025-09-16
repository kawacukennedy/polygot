import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get(__ENV.BASE_URL + '/api/v1/products');
  check(res, { 'status is 200': (r) => r.status === 200 });
}