const { createApp } = Vue;

createApp({
  data() {
    return {
      lessons: [],
      loading: true,
      error: '',
      baseUrl: 'https://m00999082-after-school.onrender.com'
    };
  },
  methods: {
    async fetchLessons() {
      try {
        const response = await fetch(this.baseUrl + '/lessons');
        if (!response.ok) {
          throw new Error(`Could not load lessons (HTTP ${response.status})`);
        }
        this.lessons = await response.json();
      } catch (error) {
        console.error('Failed to load lessons:', error);
        this.error = 'Unable to load lessons. Please try again later.';
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchLessons();
  }
}).mount('#app');
