import store from '../store.js';
import { ServiceError } from '../utils.js';

const DEFAULT_FORM = {
  id: null,
  name: '',
  description: '',
  is_active: true,
  is_nsfw: false,
};

// Component
const EditDialogName = {
  store,
  template: `
<v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="600px">

    <v-card>

      <v-card-title>
        <span class="headline">Change Name</span>
      </v-card-title>
      
      <loading-bar v-show="loading">
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="close">Close</v-btn>
        </v-card-actions>
      </loading-bar>

      <v-card-text v-show="error">
        <v-alert type="error" dismissible>{{ errorMessage }}</v-alert>
      </v-card-text>

      <div v-show="!loading">
        <v-card-text>

            <v-form ref="form" >

            <v-text-field label="Name" v-model="form.name"></v-text-field>

            </v-form> 


            </v-container>

          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text depressed @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text depressed @click="save">Save</v-btn>
          </v-card-actions>
        </div>
    </v-card>
  </v-dialog>  

</v-row>
  `,
  created() {},
  data: () => ({
    dialog: false,
    deleteDialog: false,
    loading: false,
    error: false,
    errorMessage: null,
    form: {},
  }),
  methods: {
    open(data = {}) {
      this.reset();
      this.form = { ...data };
      this.dialog = true;
    },
    close() {
      this.reset();
      this.dialog = false;
    },
    reset() {
      this.form = {};
      this.error = false;
      this.errorMessage = null;
      this.loading = false;
    },
    async save() {
      this.loading = true;
      try {
        this.form['__ACTION__'] = 'CHANGE_NAME';
        await this.$store.dispatch('auth/updateAccountInfo', this.form);
        this.close();
      } catch (e) {
        if (e instanceof ServiceError) {
          this.errorMessage = e.message;
          this.error = true;
          this.loading = false;
        } else {
          this.close();
          throw e;
        }
      }
    },
  },
};

const EditDialogEmail = {
  store,
  template: `
<v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="600px">

    <v-card>

      <v-card-title>
        <span class="headline">Change Email</span>
      </v-card-title>
      
      <loading-bar v-show="loading">
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="close">Close</v-btn>
        </v-card-actions>
      </loading-bar>

      <v-card-text v-show="error">
        <v-alert type="error" dismissible>{{ errorMessage }}</v-alert>
      </v-card-text>

      <div v-show="!loading">
        <v-card-text>

            <v-form ref="form" >

            <v-text-field label="Email" v-model="form.new_email"></v-text-field>

            <v-text-field
            label="Enter Current Password"
            v-model="form.verif_password"
            value=""
            type="password"
            class="input-group--focused"></v-text-field>


            </v-form> 


            </v-container>

          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text depressed @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text depressed @click="save">Save</v-btn>
          </v-card-actions>
        </div>
    </v-card>
  </v-dialog>  

</v-row>
  `,
  created() {},
  data: () => ({
    dialog: false,
    deleteDialog: false,
    loading: false,
    error: false,
    errorMessage: null,
    form: {},
  }),
  methods: {
    open(data = {}) {
      this.reset();
      this.form = { ...data, new_email: data.email, verif_password: null };
      this.dialog = true;
    },
    close() {
      this.reset();
      this.dialog = false;
    },
    reset() {
      this.form = {};
      this.error = false;
      this.errorMessage = null;
      this.loading = false;
    },
    async save() {
      this.loading = true;
      try {
        this.form['__ACTION__'] = 'CHANGE_EMAIL';
        await this.$store.dispatch('auth/updateAccountInfo', this.form);
        this.close();
      } catch (e) {
        if (e instanceof ServiceError) {
          this.errorMessage = e.message;
          this.error = true;
          this.loading = false;
        } else {
          this.close();
          throw e;
        }
      }
    },
  },
};

const EditDialogPassword = {
  store,
  template: `
<v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="600px">

    <v-card>

      <v-card-title>
        <span class="headline">Change Password</span>
      </v-card-title>
      
      <loading-bar v-show="loading">
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="close">Close</v-btn>
        </v-card-actions>
      </loading-bar>

      <v-card-text v-show="error">
        <v-alert type="error" dismissible>{{ errorMessage }}</v-alert>
      </v-card-text>

      <div v-show="!loading">
        <v-card-text>

            <v-form ref="form" >

            <v-text-field
            label="Enter Current Password"
            v-model="form.verif_password"
            value=""
            type="password"
            class="input-group--focused"></v-text-field>

            <v-text-field
            label="New Password"
            v-model="form.new_password"
            value=""
            type="password"
            class="input-group--focused"></v-text-field>



            <v-text-field
            label="Confirm New Password"
            v-model="form.confirm_password"
            value=""
            type="password"
            class="input-group--focused"></v-text-field>


            </v-form> 


            </v-container>

          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text depressed @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text depressed @click="save">Save</v-btn>
          </v-card-actions>
        </div>
    </v-card>
  </v-dialog>  

</v-row>
  `,
  created() {},
  data: () => ({
    dialog: false,
    deleteDialog: false,
    loading: false,
    error: false,
    errorMessage: null,
    form: {},
  }),
  methods: {
    open(data = {}) {
      this.reset();
      this.form = { ...data, new_password: '', confirm_password: '', verif_password: null };
      this.dialog = true;
    },
    close() {
      this.reset();
      this.dialog = false;
    },
    reset() {
      this.form = {};
      this.error = false;
      this.errorMessage = null;
      this.loading = false;
    },
    async save() {
      this.loading = true;
      try {
        this.form['__ACTION__'] = 'CHANGE_PASSWORD';
        await this.$store.dispatch('auth/updateAccountInfo', this.form);
        this.close();
      } catch (e) {
        if (e instanceof ServiceError) {
          this.errorMessage = e.message;
          this.error = true;
          this.loading = false;
        } else {
          this.close();
          throw e;
        }
      }
    },
  },
};

// View
export default {
  store,
  components: {
    EditDialogEmail,
    EditDialogName,
    EditDialogPassword,
  },
  template: `
  <div>
  

  <EditDialogPassword ref="editDialogPassword"></EditDialogPassword>
  <EditDialogEmail ref="editDialogEmail"></EditDialogEmail>
  <EditDialogName ref="editDialogName"></EditDialogName>

  <v-card max-width="650" class="mx-auto">
    <v-card-title>{{ $store.state.auth.accountInfo.name }}</v-card-title>
    <v-card-text>Email: <strong>{{ $store.state.auth.accountInfo.email }}</strong></v-card-text>
    <v-card-text>Is Admin: <strong>{{ $store.state.auth.accountInfo.is_admin | YesNo }}</strong></v-card-text>
    <v-card-text>Created at: <strong>{{ $store.state.auth.accountInfo.created_at | formatDateTime }}</strong></v-card-text>
    <v-card-actions>
      <v-btn color="blue darken-1" text depressed @click="changeName">Change Name</v-btn>
      <v-btn color="blue darken-1" text depressed @click="changeEmail">Change Email</v-btn>
      <v-btn color="blue darken-1" text depressed @click="changePassword">Change Password</v-btn>
    </v-card-actions>
  </v-card>

  </div>
  `,
  data() {
    return {};
  },
  async created() {},
  methods: {
    changeName() {
      this.$refs.editDialogName.open(this.$store.state.auth.accountInfo);
    },
    changePassword() {
      this.$refs.editDialogPassword.open(this.$store.state.auth.accountInfo);
    },
    changeEmail() {
      this.$refs.editDialogEmail.open(this.$store.state.auth.accountInfo);
    },
  },
};
