import axios from 'axios';
import axiosRetry from 'axios-retry';
import {store} from '../redux/store';
import { logout, setEmployeeToken } from '../redux/actions';



export const BASE_URL = 'https://apis.smeeye.com:9097/api';
axiosRetry(axios, { retries: 3 });
const instance = axios.create({
  baseURL: BASE_URL,
});
instance.CancelToken = axios.CancelToken;


const fetchAccessTokenFromRefreshToken = async () => {
  try {
    const storeState = store.getState();
    const authToken = storeState && storeState.base?.employeeRefreshToken ? storeState.base.employeeRefreshToken : null;
    const response = await axios({
      method: 'post',
      url: 'https://apis.smeeye.com:10001/auth/refreshtoken',
      data: {
        refresh_token: authToken,
      }
    });
    store.dispatch(setEmployeeToken(response.data.token));
    return response.data.token;
  } catch (error) {
    if(error.response && error.response.status === 401) {
      store.dispatch(logout());
      throw new Error(`Logged out`);
    }
    throw new Error(error?.response?.message || error?.message);
  }
};

// request interceptor
instance.interceptors.request.use(
  function (config) {
    const storeState = store.getState();
    const authToken = storeState && storeState.base?.employeeToken ? storeState.base.employeeToken : null;
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);



// response interceptor
instance.interceptors.response.use(
  async response => {
    try {
      return response;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async error => {
    const storeState = store.getState();
    const originalRequest = error.config;
    const refreshToken = storeState.base?.employeeRefreshToken || null;
    if (error.response && error.response.status === 401 && !originalRequest._retry && !!refreshToken) {
      try {
            originalRequest._retry = true
            const newAccessToken = await fetchAccessTokenFromRefreshToken();
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return instance(originalRequest);

      } catch (error) {
        console.error(error?.response?.message ||  error?.message);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
