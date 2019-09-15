import store from '../store.js';
import { ServiceError } from '../utils.js';

export default {
  template: `
  <v-row>

    <loading-bar v-show="loading">
      <div class="text-center">Authenticating...</div>
    </loading-bar>

    <v-col sm="4" offset-sm="4">
 
    <v-card-text v-show="error">
      <v-alert type="error" dismissible>{{ errorMessage }}</v-alert>
    </v-card-text>
      
      <div v-show="!loading">
        <h2>Login</h2>

        <v-form ref="form" >
          <v-text-field label="Email" :rules="[rules.required]" v-model="form.email"></v-text-field>

          <v-text-field
          v-model="form.password"
          :rules="[rules.required]"
          value=""
          type="password"
          label="Password"
          class="input-group--focused"
          @click:append="show1 = !show1"
        ></v-text-field>


          <v-btn depressed large color="primary" @click="login">Login</v-btn>
        </v-form> 
      </div>
    </v-col>
  </v-row>
  `,
  data() {
    return {
      loading: false,
      error: false,
      errorMessage: null,
      form: {
        email: null,
        password: null,
      },
      rules: {
        required: value => !!value || 'Required.',
        emailMatch: () => "The email and password you entered don't match",
      },
    };
  },
  async created() {
    this.loading = true;
    if (!this.$store.state.auth.authenticated) {
      await this.$store.dispatch('auth/loadAuthAccessToken');
    }
    setTimeout(() => {
      if (this.$store.state.auth.authenticated) {
        this.loading = false;
        this.$router.push('posts');
      } else {
        this.loading = false;
      }
    }, 100);
  },
  methods: {
    reset() {
      this.error = false;
      this.errorMessage = null;
      this.loading = false;
    },
    async login() {
      this.reset();
      this.loading = true;
      try {
        await this.$store.dispatch('auth/fetchToken', this.form);
        if (this.$store.state.auth.authenticated) {
          await this.$store.dispatch('auth/fetchAccountInfo');
          this.$router.push('posts');
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          this.errorMessage = e.message;
          this.error = true;
          this.loading = false;
        } else {
          throw e;
        }
      }
    },
  },
};
