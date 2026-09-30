import { hostedApi } from '../server/hosted-api.mjs';
export default function handler(req, res) { return hostedApi('refresh', req, res); }
