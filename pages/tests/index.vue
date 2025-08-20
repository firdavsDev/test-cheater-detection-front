<template>
  <div class="tests-container">
    <h1 class="tests-title">🧪 Available Tests</h1>
    <ul class="tests-list">
      <li
        v-for="test in tests"
        :key="test.id"
        class="test-item"
      >
        <h2 class="test-item-title">{{ test.title }}</h2>
        <p class="test-item-desc">{{ test.description }}</p>
        <p class="test-item-duration">⏱ {{ test.duration }} minutes</p>
        <NuxtLink
          class="test-item-link"
          :to="`/tests/${test.id}`"
        >
          Start Test →
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const tests = useMockTests()
</script>

<style scoped>
.tests-container {
  padding: 2rem;
  background: #f9fafb;
  min-height: 100vh;
}
.tests-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #22223b;
}
.tests-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.test-item {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(34, 34, 59, 0.05);
  transition: box-shadow 0.2s;
  margin-bottom: 1.5rem;
}
.test-item:hover {
  box-shadow: 0 4px 16px rgba(34, 34, 59, 0.12);
}
.test-item-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #22223b;
}
.test-item-desc {
  font-size: 1rem;
  color: #4a4e69;
  margin-bottom: 0.5rem;
}
.test-item-duration {
  font-size: 0.95rem;
  color: #9a8c98;
  margin-bottom: 0.75rem;
}
.test-item-link {
  color: #3a86ff;
  text-decoration: none;
  font-weight: 500;
  transition: text-decoration 0.2s;
}
.test-item-link:hover {
  text-decoration: underline;
  color: #00509e;
}
</style>
