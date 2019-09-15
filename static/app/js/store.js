import { set, get, del } from './idb-keyval.js';
import { ServiceError } from './utils.js';
import register from './views/register.js';

Vue.use(Vuex);

const AUTH_ACCOUNT_INFO = 'authAccountInfo';
const AUTH_ACCESS_TOKEN = 'authAccessToken';
const AUTH_REFRESH_TOKEN = 'auth-refresh-token';
const get_auth_access_token = async () => await get(AUTH_ACCESS_TOKEN);
const set_auth_access_token = async token => await set(AUTH_ACCESS_TOKEN, token);
const del_auth_access_token = async () => await del(AUTH_ACCESS_TOKEN);

const Ajax = axios.create({
  baseURL: window.NTLDR_API_ENDPOINT,
  timeout: 30000,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'LOCATION-Action': 'hero',
  },
});

Ajax.interceptors.request.use(async config => {
  try {
    const token = await get_auth_access_token();
    config.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
  } catch (e) {
    console.error('Setting interceptor error', e);
  }
  return config;
});

// SOURCES
const sources = {
  namespaced: true,
  state: {
    data: [],
  },
  getters: {},
  actions: {
    loading(context, loading) {
      context.commit('loading', loading);
    },
    async fetch({ commit, dispatch, state }, force = false) {
      if (state.data.length === 0 || force) {
        dispatch('loading', true);
        const resp = await Ajax.get('/sources/');
        commit('loadSources', resp.data.data);
        dispatch('loading', false);
      }
    },
    async update({ dispatch }, data) {
      dispatch('loading', true);
      const url = data.id ? `/sources/${data.id}/` : `/sources/`;
      try {
        await Ajax.post(url, { data });
        dispatch('fetch', true);
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },
  },
  mutations: {
    loadSources(state, data) {
      state.data = data;
    },
  },
};

// FEEDS
const feeds = {
  namespaced: true,
  state: {
    data: [],
  },
  getters: {},
  actions: {
    loading(context, loading) {
      context.commit('loading', loading);
    },
    async fetch({ commit, dispatch, state }, force = false) {
      if (state.data.length === 0 || force) {
        dispatch('loading', true);
        const resp = await Ajax.get('/feeds/');
        commit('loadSources', resp.data.data);
        dispatch('loading', false);
      }
    },
    async update({ dispatch }, data) {
      dispatch('loading', true);
      const url = data.id ? `/feeds/${data.id}/` : `/feeds/`;
      try {
        await Ajax.post(url, { data });
        dispatch('fetch', true);
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },
  },
  mutations: {
    loadSources(state, data) {
      state.data = data;
    },
  },
};

// SOURCES
const posts = {
  namespaced: true,
  state: {
    data: [],
  },
  getters: {},
  actions: {
    loading(context, loading) {
      context.commit('loading', loading);
    },
    async fetch({ commit, dispatch, state }, query = {}) {
      dispatch('loading', true);
      const resp = await Ajax.get('/posts/', { params: query });
      return resp.data;
    },
    async delete({ commit, dispatch, state }, data) {
      dispatch('loading', true);
      try {
        await Ajax.post(`/posts/${data.id}/`, { data });
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },
  },
  mutations: {},
};

const auth = {
  namespaced: true,
  state: {
    authenticated: false,
    auth_access_token: null,
    auth_refresh_token: null,
    accountInfo: {},
  },
  actions: {
    async clear({ commit }) {
      await del_auth_access_token();
      await set(AUTH_ACCOUNT_INFO, null);
      commit('setAuthAccessToken', null);
      commit('setAccountInfo', null);
    },

    async logout({ dispatch }) {
      dispatch('clear');
    },

    async register({ commit, dispatch, state }, data) {
      try {
        await dispatch('clear');
        await Ajax.post(`/auth/register/`, { data });
        await dispatch('appStatus', null, { root: true });
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },

    /**
     * To load the auth data from cache
     * @param {} param0
     */
    async loadAuthAccessToken({ commit }) {
      const token = await get_auth_access_token();
      const accountInfo = await get(AUTH_ACCOUNT_INFO);
      if (token) {
        commit('setAuthAccessToken', token);
        commit('setAccountInfo', accountInfo);
      } else {
        commit('setAuthAccessToken', null);
        commit('setAccountInfo', null);
      }
    },

    /**
     * Login to get the token
     * @param {*} param0
     * @param {*} data
     */
    async fetchToken({ commit, dispatch, state }, data) {
      try {
        await dispatch('clear');

        const resp = await Ajax.post(`/auth/token/`, { data });
        if (resp.data.access_token) {
          const access_token = resp.data.access_token;
          await set_auth_access_token(access_token);
          commit('setAuthAccessToken', access_token);
        }
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },

    /**
     * Fetch Account Info
     * @param {*} param0
     * @param {*} data
     */
    async fetchAccountInfo({ commit, dispatch, state }, data) {
      try {
        const resp = await Ajax.get(`/auth/account/`);
        if (resp.data.data) {
          const data = resp.data.data;
          await set(AUTH_ACCOUNT_INFO, data);
          commit('setAccountInfo', data);
        }
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },
    /**
     * Fetch Account Info
     * @param {*} param0
     * @param {*} data
     */
    async updateAccountInfo({ commit, dispatch, state }, data) {
      try {
        const resp = await Ajax.post(`/auth/account/`, { data });
        if (resp.data.data) {
          const data = resp.data.data;
          await set(AUTH_ACCOUNT_INFO, data);
          commit('setAccountInfo', data);
        }
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
          throw e;
        }
      }
    },
  },

  mutations: {
    setAuthAccessToken(state, token) {
      state.auth_access_token = token;
      state.authenticated = token ? true : false;
    },
    setAccountInfo(state, data) {
      state.accountInfo = data;
    },
  },
};

export default new Vuex.Store({
  modules: {
    sources,
    feeds,
    posts,
    auth,
  },
  state: {
    appStatus: {},
    loading: false,
    error: false,
    message: '',
  },
  actions: {
    async appStatus({ commit }) {
      try {
        const resp = await Ajax.get(`/app-status/`);
        commit('appStatus', resp.data.data);
      } catch (e) {
        if (e.response) {
          throw new ServiceError(e.response);
        } else {
          console.warn('STORE ERROR', e);
        }
      }
    },
  },
  mutations: {
    loading(state, loading) {
      state.loading = loading;
    },
    appStatus(state, status) {
      state.appStatus = status;
    },
  },
});
