export default {
  template: `
  <v-row align="center" justify="center">
    <v-col align="center">
        <v-img
        :src="randImg"
        max-width="1200"
        max-height="500"
        contain
      ></v-img>
    </v-col>
  </v-row>  
  `,
  data() {
    return {
      staticUrl: window.STATIC_URL,
      imgs: ['africa-wp.jpg', 'ethiopia-wp.jpg', 'haiti-wp.jpg', 'haiti-wp2.jpg'],
    };
  },
  computed: {
    randImg() {
      const img = this.imgs[Math.floor(Math.random() * this.imgs.length)];
      return this.staticUrl + `app/imgs/${img}`;
    },
  },
};
