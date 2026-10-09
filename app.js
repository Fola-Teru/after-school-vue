const { createApp } = Vue;

createApp({
  data() {
    return {
      lessons: [],
      cart: [],
      showCart: false,
      name: '',
      phone: '',
      orderMessage: '',
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
        this.orderMessage = '';
        this.cart.push(lesson._id);
        lesson.space -= 1;
      }
    },
    toggleCart() {
      this.showCart = !this.showCart;
    },
    removeFromCart(index) {
      const lessonId = this.cart[index];
      const lesson = this.lessons.find(item => item._id === lessonId);
      if (lesson) {
        lesson.space += 1;
      }
      this.cart.splice(index, 1);
      if (this.cart.length === 0) {
        this.showCart = false;
      }
    },
    async checkout() {
      if (!this.formValid || this.cart.length === 0) {
        return;
      }

      try {
        const counts = {};
        for (const id of this.cart) {
          counts[id] = (counts[id] || 0) + 1;
        }
        const lessonIDs = Object.keys(counts);
        const items = lessonIDs.map(lessonID => ({
          lessonID,
          spaces: counts[lessonID]
        }));

        const response = await fetch(this.baseUrl + '/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.name,
            phone: this.phone,
            lessonIDs,
            items
          })
        });
        if (!response.ok) {
          throw new Error(`Order submission failed (HTTP ${response.status})`);
        }

        await Promise.all(lessonIDs.map(async id => {
          const lesson = this.lessons.find(item => item._id === id);
          if (!lesson) {
            throw new Error(`Could not find lesson ${id} to update`);
          }

          const updateResponse = await fetch(this.baseUrl + '/lessons/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ space: lesson.space })
          });
          if (!updateResponse.ok) {
            throw new Error(`Lesson update failed (HTTP ${updateResponse.status})`);
          }
        }));

        const customerName = this.name;
        this.orderMessage = `Order submitted, thank you, ${customerName}`;
        this.cart = [];
        this.name = '';
        this.phone = '';
        this.showCart = false;
      } catch (error) {
        console.error('Checkout failed:', error);
        this.orderMessage = 'Checkout failed. Please try again.';
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
    nameValid() {
      return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(this.name);
    },
    phoneValid() {
      return /^\d+$/.test(this.phone);
    },
    formValid() {
      return this.nameValid && this.phoneValid;
    },
    cartItems() {
      return this.cart
        .map(id => this.lessons.find(lesson => lesson._id === id))
        .filter(Boolean);
    },
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
