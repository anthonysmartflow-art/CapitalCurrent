import { hostedApi } from '../server/hosted-api.mjs';
export default function handler(req, res) { return hostedApi('providers', req, res); }
