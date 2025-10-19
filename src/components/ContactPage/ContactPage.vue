<template>
  <div class="contact-container">
    <h1>Contact</h1>
    <form @submit.prevent="handleSubmit" class="contact-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="formData.email" required />
      </div>
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" v-model="formData.message" required></textarea>
      </div>
      <button type="submit">Send Message</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  name: '',
  email: '',
  message: ''
});

const handleSubmit = () => {
  // Handle form submission
  console.log('Form submitted:', formData.value);
};
</script>

<style scoped>
.contact-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.contact-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: var(--text-color);
  color: var(--bg-color);
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

</style>