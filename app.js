const { createApp } = Vue;

createApp({
  data() {
    return {
      lessons: [],
      cart: [],
      loading: true,
      error: '',
      baseUrl: 'https://m00999082-after-school.onrender.com',
      sortBy: 'topic',
      sortOrder: 'asc'
    };
  },
  methods: {
    addToCart(lesson) {
      if (lesson.space > 0) {
        this.cart.push(lesson._id);
        lesson.space -= 1;
      }
    },
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
  computed: {
    sortedLessons() {
      const lessons = [...this.lessons];
      return lessons.sort((a, b) => {
        const result = ['price', 'space'].includes(this.sortBy)
          ? a[this.sortBy] - b[this.sortBy]
          : a[this.sortBy].localeCompare(b[this.sortBy]);
        return this.sortOrder === 'desc' ? result * -1 : result;
      });
    }
  },
  created() {
    this.fetchLessons();
  }
}).mount('#app');
