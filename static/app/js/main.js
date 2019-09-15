import store from './store.js';
import components from './components.js';
import HomeView from './views/home.js';
import LoginView from './views/login.js';
import SourcesView from './views/sources.js';
import FeedsView from './views/feeds.js';
import PostsView from './views/posts.js';
import AccountView from './views/account.js';
import serviceErrorView from './views/service-error.js';
import RegisterView from './views/register.js';

Vue.config.devtools = true;

const router = new VueRouter({
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/sources', component: SourcesView },
    { path: '/feeds', component: FeedsView },
    { path: '/posts', component: PostsView },
    { path: '/account', component: AccountView },
    { path: '/error', component: serviceErrorView },
  ],
});

// Load Auth Token
store.dispatch('auth/loadAuthAccessToken');

router.beforeEach(async (to, from, next) => {
  if (!store.state.appStatus.ping) {
    await store.dispatch('appStatus');
  }

  if (!store.state.appStatus.ping && to.path !== '/error') {
    next({ path: 'error' });
    console.warn('NewsTLDR ping failed!', to.path);
  } else {
    if (!store.state.appStatus.registered && to.path !== '/register') {
      next({ path: 'register' });
    } else if (!['/', '/login', '/error', '/register'].includes(to.path)) {
      if (store.state.auth.authenticated) {
        next();
      } else {
        next({ path: 'login' });
      }
    } else {
      next();
    }
  }
});

new Vue({
  el: '#app',
  store,
  router,
  vuetify: new Vuetify(),
  async created() {},
  methods: {
    logout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/');
    },
  },
});
