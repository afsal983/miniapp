import axios from 'axios';
import axiosRetry from 'axios-retry';
import {store} from '../redux/store';

//export const BASE_URL = 'https://apis.smeeye.com:10001';
export const BASE_URL = 'https://devsalonapp.smeeye.com/secretkeeper';
axiosRetry(axios, { retries: 3 });
const instance = axios.create({
  baseURL: BASE_URL,
});
instance.CancelToken = axios.CancelToken;

// request interceptor
instance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  async response => {
    try {
      return response;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async error => {
    return Promise.reject(error);
  },
);

export default instance;
