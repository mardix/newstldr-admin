import store from '../store.js';
import { ServiceError } from '../utils.js';

const DEFAULT_FORM = {
  id: null,
  name: '',
  description: '',
  is_active: true,
  is_nsfw: false,
};

const SourcesDialog = {
  store,
  template: `
  <v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="600px">

    <v-card>

      <v-card-title>
        <span class="headline"><small>Edit Sources:</small> {{ feed.name }} <small>({{ feed.id }})</small></span>

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
                <v-simple-table>
                <thead>
                  <tr>
                    <th class="text-left"></th>
                    <th class="text-left">ID</th>
                    <th class="text-left">Name</th>
                    <th class="text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in $store.state.sources.data" :key="item.id" >
                    <td><v-checkbox :value="item.id" v-model="form.sources_ids"></v-checkbox></td>
                    <td>{{ item.id }}</td>
                    <td><a href="javascript:void(false);" @click="edit(item)">{{ item.name }}</a></td>
                    <td>{{ item.type | sourceType }}</td>
                  </tr>
                </tbody>
              </v-simple-table> 

                </v-col>

              </v-row>

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
  async created() {
    await this.$store.dispatch('sources/fetch');
  },
  data: () => ({
    dialog: false,
    loading: false,
    error: false,
    errorMessage: null,
    feed: {},
    form: {
      id: null,
      sources_ids: [],
    },
  }),
  methods: {
    open(feed) {
      this.reset();
      this.feed = feed;
      this.form = {
        id: feed.id,
        sources_ids: feed.sources_ids,
      };
      this.dialog = true;
    },
    close() {
      this.reset();
      this.dialog = false;
    },
    reset() {
      this.error = false;
      this.errorMessage = null;
      this.loading = false;
    },
    async save() {
      this.loading = true;
      try {
        this.form['__ACTION__'] = 'UPDATE_SOURCES';
        await this.$store.dispatch('feeds/update', this.form);
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

// Component
const EditDialog = {
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
                <v-textarea
                    clearable
                    label="Text"
                    v-model="form.description"
                    value="This is clearable text."
                    ></v-textarea>
                </v-col>


                <v-col cols="12">
                    <v-checkbox
                    v-model="form.is_active"
                    label="Active"
                  ></v-checkbox>
                </v-col>
  

                <v-col cols="12">
                    <v-checkbox
                    v-model="form.is_nsfw"
                    label="NSFW"
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
  }),
  methods: {
    open(data = {}) {
      this.reset();
      this.form = { ...DEFAULT_FORM, ...data };
      this.title = data.id ? 'Edit Feed' : 'New Feed';
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
        await this.$store.dispatch('feeds/update', this.form);
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
    EditDialog,
    SourcesDialog,
  },
  template: `
  <div>
  

  <EditDialog ref="editDialog"></EditDialog>
  <SourcesDialog ref="sourcesDialog"></SourcesDialog>

  <h2>Feeds</h2>

  <v-simple-table>
    <thead>
      <tr>
        <th class="text-left">ID</th>
        <th class="text-left">Name</th>
        <th class="text-left">Posts</th>
        <th class="text-left">Sources</th>
        <th class="text-left">Active</th>
        <th class="text-left">NSFW</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in $store.state.feeds.data" :key="item.id" >
        <td>{{ item.id }}</td>
        <td><a href="javascript:void(false);" @click="edit(item)">{{ item.name }}</a></td>
        <td>{{ item.total_posts }}</td>
        <td><a href="javascript:void(false);" @click="editSources(item)">{{ item.total_sources }}</a></td>
        <td>{{ item.is_active | YesNo }}</td>
        <td>{{ item.is_nsfw | YesNo }}</td>
      </tr>
    </tbody>
  </v-simple-table> 
  </div>
  `,
  data() {
    return {};
  },
  async created() {
    await this.$store.dispatch('feeds/fetch');
  },
  methods: {
    edit(item) {
      this.$refs.editDialog.open(item);
    },
    editSources(item) {
      this.$refs.sourcesDialog.open(item);
    },
  },
};
