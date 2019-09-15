/**
 * Service Error from the API
 */
export class ServiceError extends Error {
  constructor(response) {
    console.log('R', response);
    if (response.data && response.data.error) {
      super(response.data.message);
      this.code = response.data.code;
    } else {
      super(response.statusText);
      this.code = response.status;
    }
  }
}

export const SOURCES_TYPES = {
  rss: 'RSS',
  page_links: 'Page Links',
  youtube_channel: 'Youtube',
};

// Vue filters
Vue.filter('YesNo', b => (b ? 'Yes' : 'No'));
Vue.filter('sourceType', type => SOURCES_TYPES[type]);
Vue.filter('postType', type => _.capitalize(type));
Vue.filter('formatDateTime', isodate => dayjs(isodate).format('YYYY/MM/DD HH:mm'));
Vue.filter('formatDate', isodate => dayjs(isodate).format('YYYY/MM/DD'));
Vue.filter('formatTime', isodate => dayjs(isodate).format('HH:mm'));

export default null;
