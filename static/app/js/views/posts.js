import store from '../store.js';
import { ServiceError } from '../utils.js';

const DEFAULT_FORM = {
  id: null,
  name: '',
  description: '',
  is_active: true,
  is_nsfw: false,
};

const eventBus = new Vue();

// Component
const ViewDialog = {
  store,
  template: `
<v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="90%">

    <v-card>
      <div>
        <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">

                  <div class="headline text-center" v-html="post.title"></div>
                  <div>
                  <v-chip class="ma-2" color="primary" label outlined>ID: {{ post.id}}</v-chip>
                  <v-chip class="ma-2" color="primary" outlined>Domain:  <a :href="post.ref_url" target="_blank">{{ post.domain}}</a></v-chip>
                  <v-chip class="ma-2" color="primary" outlined>Type:  {{ post.type | postType }}</v-chip>

                  Created At: {{ post.created_at | formatDateTime }}
                   - 
                  Published At: {{ post.created_at | formatDateTime }}
                    <br>
                  Slug: <strong>{{ post.slug }}</strong>
                  </div>
                  <hr>
                </v-col>
              </v-row>


              <v-row>
                <v-col sm="12" md="3">
                  <img :src="post.image" style="margin: 0 auto; width: 100%; max-width:460px; height: auto;">
                </v-col>

                <v-col sm="12" md="9">
                  <div v-html="post.content_html"></div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <h4>Keywords</h4>
                  <v-chip v-for="kw in post.keywords" :key="kw" class="ma-2" color="primary" label outlined>{{ kw }}</v-chip>
                </v-col>
              </v-row>
            
              <v-row>
                <v-col>
                  <h4>Authors</h4>
                  <v-chip v-for="a in post.authors" :key="kw" class="ma-2" color="primary" label outlined>{{ a }}</v-chip>
                </v-col>
              </v-row>

              <v-row>
                <v-col sm=12>
                  <h4>Social Media Embeds</h4>
                </v-col>
                <v-col>
                    <div v-for="sm in post.social_media_content" v-html="sm"></div>
                </v-col>
              </v-row>


            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-btn color="error" text v-if="enableDelete" @click="deleteDialog = true">Delete</v-btn>
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text depressed @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text depressed @click="edit" v-if="enableEdit">Edit</v-btn>
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
  data: () => ({
    post: {},
    dialog: false,
    deleteDialog: false,
    enableEdit: false,
    enableDelete: true,
    forms: {
      id: null,
    },
  }),
  methods: {
    open(post) {
      this.post = post;
      this.form = post;
      this.dialog = true;
    },
    close() {
      this.dialog = false;
    },
    async edit() {
      eventBus.$emit('EDIT_POST', this.post);
    },
    async del() {
      this.deleteDialog = false;
      this.form['__ACTION__'] = 'DELETE';
      await this.$store.dispatch('posts/delete', this.form);
      eventBus.$emit('RELOAD_POSTS_PAGE');
      this.close();
    },
  },
};

// Component
const EditDialog = {
  store,
  template: `
<v-row justify="center">

  <v-dialog v-model="dialog" persistent max-width="90%">

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
            
            <div class="flex-grow-1"></div>
            <v-btn color="blue darken-1" text depressed @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text depressed @click="save">Save</v-btn>
          </v-card-actions>
        </div>
    </v-card>
  </v-dialog>  



</v-row>
  `,
  created() {
    eventBus.$on('EDIT_POST', post => {
      this.open(post);
    });
  },

  data: () => ({
    title: 'New Source',
    dialog: false,
    loading: false,
    error: false,
    errorMessage: null,
    form: { ...DEFAULT_FORM },
  }),
  methods: {
    open(data = {}) {
      this.reset();
      this.form = { ...DEFAULT_FORM, ...data };
      this.dialog = true;
    },
    close() {
      this.reset();
      this.dialog = false;
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
    ViewDialog,
  },
  template: `
  <div>
 
  <EditDialog ref="editDialog"></EditDialog>
  <ViewDialog ref="viewDialog"></ViewDialog>
  
  <h2>Posts</h2>

    <loading v-if="loading"></loading>

    <v-simple-table>
    <thead>
      <tr>
        <th class="text-left">ID</th>
        <th class="text-left">Title</th>
        <th class="text-left">Domain</th>
        <th class="text-left">Type</th>
        <th class="text-left">Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in posts.data" :key="item.id" >
        <td>{{ item.id }}</td>
        <td><a href="javascript:void(false);" @click="view(item)" v-html="item.title"></a></td>
        <td>{{ item.domain }}</td>
        <td>{{ item.type | postType }}</a></td>
        <td>{{ item.created_at | formatDate }}</td>
      </tr>
    </tbody>
  </v-simple-table> 

    <v-pagination v-model="page" :length="posts.total_pages" circle></v-pagination>

  </div>
  `,
  data() {
    return {
      posts: {},
      page: 1,
      query: {},
      loading: false,
    };
  },
  async created() {
    await this.$store.dispatch('feeds/fetch');
    eventBus.$on('RELOAD_POSTS_PAGE', () => {
      this.getPosts();
    });
  },
  watch: {
    page(newVal) {
      this.getPosts();
    },
  },
  mounted() {
    this.getPosts();
  },
  methods: {
    view(item) {
      this.$refs.viewDialog.open(item);
    },
    async getPosts() {
      this.loading = true;
      const query = { ...this.query, page: this.page };
      this.posts = await this.$store.dispatch('posts/fetch', query);
      this.loading = false;
    },
  },
};
