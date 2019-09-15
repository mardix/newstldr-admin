export default {
  template: `
  <v-row>
    <v-card-text>
      <v-alert type="error">{{ code }} : {{ message }}</v-alert>
    </v-card-text>
  </v-row>
  `,
  data() {
    return {
      code: 503,
      message: 'Service Unavailable',
    };
  },
  async created() {},
};
