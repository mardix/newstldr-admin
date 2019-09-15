Vue.component('loading-bar', {
  template: `
  <v-card-text>
    <v-container>
        <v-progress-linear
        indeterminate
        rounded
        height="6"></v-progress-linear>
        <slot></slot>
    </v-container>
  </v-card-text>
  `,
});

Vue.component('loading', {
  template: `
  <v-card-text>
    <v-container>
        <v-progress-linear
        indeterminate
        rounded
        height="6"></v-progress-linear>
    </v-container>
  </v-card-text>
  `,
});

export default null;
