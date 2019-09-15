import store from '../store.js';
import { ServiceError } from '../utils.js';

const SOURCES_TYPES = {
  rss: 'RSS',
  page_links: 'Page Links',
  youtube_channel: 'Youtube',
};

const DEFAULT_FORM = {
  id: null,
  name: '',
  url: '',
  type: '',
  page_links_selector: '',
  limit: 30,
  fetch_frequency: 60,
  is_active: true,
};

const sourceType = type => SOURCES_TYPES[type];

// Component
const EditView = {
  store,
  template: `
<v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="600px">

    <template v-slot:activator="{ on }">
      <v-btn @click="open" color="pink" dark medium absolute right fab>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <v-card>

      <v-card-title>
        <span class="headline">{{ title }}</span>
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
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field label="Name*"  v-model="form.name" required></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field label="Url/Channel*"  v-model="form.url" required></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-select
                    :items="sourcesList"
                    item-text="text"
                    item-value="value"
                    label="Type*"
                    required
                    v-model="form.type"
                  ></v-select>
                </v-col>

                <v-col cols="12" v-show="form.type === 'page_links'">
                  <v-text-field label="Page Links Selector (querySelectorAll selector to find links)"  v-model="form.page_links_selector" required></v-text-field>
                </v-col>     

                <v-col cols="12">
                  <v-select
                    :items="limitList"
                    label="Total links to fetch"
                    v-model="form.limit"
                    required></v-select>
                </v-col>

                <v-col cols="12">
                  <v-select
                    :items="fetchFrequencyList"
                    label="Fetch Frequency"
                    v-model="form.fetch_frequency"
                    required></v-select>
                </v-col>

                <v-col cols="12">
                    <v-checkbox
                    v-model="form.is_active"
                    label="Active"
                  ></v-checkbox>
                </v-col>

              </v-row>


            </v-container>
            <small>*indicates required field</small>
          </v-card-text>

          <v-card-actions>
            <v-btn color="error" text v-show="this.form.id" @click="deleteDialog = true">Delete</v-btn>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text depressed @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text depressed @click="save">Save</v-btn>
          </v-card-actions>
        </div>
    </v-card>
  </v-dialog>  

  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span>Do you really want to delete this entry?</span>
      </v-card-title>
      <v-card-actions>
        <v-btn color="blue darken-1" text depressed @click="deleteDialog = false">No</v-btn>
        <v-btn color="error" text depressed @click="del">Yes, Delete this entry!</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</v-row>
  `,
  created() {},
  data: () => ({
    title: 'New Source',
    dialog: false,
    deleteDialog: false,
    loading: false,
    error: false,
    errorMessage: null,
    form: { ...DEFAULT_FORM },
    sourcesList: Object.keys(SOURCES_TYPES).reduce((pV, cK) => {
      return [...pV, { value: cK, text: SOURCES_TYPES[cK] }];
    }, []),
    limitList: [5, 10, 15, 20, 30, 50].reduce((pV, cK) => {
      return [...pV, { value: cK, text: cK }];
    }, []),
    fetchFrequencyList: [30, 60, 120, 360, 720, 1440].reduce((pV, cK) => {
      const v = cK <= 60 ? `${cK} min` : `${cK / 60} hr`;
      return [...pV, { value: cK, text: v }];
    }, []),
  }),
  methods: {
    open(data = {}) {
      this.reset();
      this.form = { ...DEFAULT_FORM, ...data };
      this.title = data.id ? 'Edit Source' : 'New Source';
      this.dialog = true;
    },
    close() {
      this.reset();
      this.dialog = false;
    },
    async del() {
      this.deleteDialog = false;
      this.form['__ACTION__'] = 'DELETE';
      await this.save();
    },
    reset() {
      this.form = { ...DEFAULT_FORM };
      this.error = false;
      this.errorMessage = null;
      this.loading = false;
    },
    async save() {
      this.loading = true;
      try {
        await this.$store.dispatch('sources/update', this.form);
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
    EditView,
  },
  template: `
  <div>
  
  <EditView ref="editor"></EditView>
  <h2>Sources</h2>

  <v-simple-table>
    <thead>
      <tr>
        <th class="text-left">ID</th>
        <th class="text-left">Name</th>
        <th class="text-left">Type</th>
        <th class="text-left">Last Fetch</th>
        <th class="text-left">Posts</th>
        <th class="text-left">Active</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in $store.state.sources.data" :key="item.id" >
        <td>{{ item.id }}</td>
        <td><a href="javascript:void(false);" @click="edit(item)">{{ item.name }}</a></td>
        <td>{{ item.type | sourceType }}</td>
        <td>{{ item.last_fetched_at | formatDateTime }}</td>
        <td>{{ item.total_posts }}</td>
        <td>{{ item.is_active | YesNo }}</td>
      </tr>
    </tbody>
  </v-simple-table> 
  </div>
  `,
  data() {
    return {};
  },
  async created() {
    await this.$store.dispatch('sources/fetch');
  },
  methods: {
    edit(item) {
      this.$refs.editor.open(item);
    },
  },
};
