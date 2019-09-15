import store from '../store.js';
import { ServiceError } from '../utils.js';

export default {
  template: `
  <v-row>

    <loading-bar v-show="loading">
      <div class="text-center">Validating...</div>
    </loading-bar>

    <v-col sm="4" offset-sm="4">
 
    <v-card-text v-show="error">
      <v-alert type="error" dismissible>{{ errorMessage }}</v-alert>
    </v-card-text>
      
      <div v-show="!loading">
        <h2>Register Admin Account</h2>

        <v-form ref="form" >

          <v-text-field label="Name" :rules="[rules.required]" v-model="form.name"></v-text-field>
          
          <v-text-field label="Email" :rules="[rules.required]" v-model="form.email"></v-text-field>

          <v-text-field
          v-model="form.password"
          :rules="[rules.required]"
          value=""
          type="password"
          label="Password"
          class="input-group--focused"
        ></v-text-field>


          <v-text-field
          v-model="form.confirm_password"
          :rules="[rules.required]"
          value=""
          type="password"
          label="Confirm Password"
          class="input-group--focused"
        ></v-text-field>

          <v-btn depressed large color="primary" @click="register">Register</v-btn>
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
        name: null,
        email: null,
        password: null,
        confirm_password: null,
        __ACTION__: 'REGISTER',
      },
      rules: {
        required: value => !!value || 'Required.',
        emailMatch: () => "The email and password you entered don't match",
      },
    };
  },
  async created() {
    this.loading = true;
    await this.$store.dispatch('appStatus');
    setTimeout(() => {
      if (this.$store.state.appStatus.registered === true) {
        this.loading = false;
        this.$router.push('login');
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
    async register() {
      this.reset();
      this.loading = true;
      try {
        await this.$store.dispatch('auth/register', this.form);
        if (this.$store.state.appStatus.registered === true) {
          this.$router.push('login');
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
