<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">🧪 Available Tests</h1>
    <ul class="space-y-4">
      <li
        v-for="test in tests"
        :key="test.id"
        class="p-4 border rounded-lg shadow hover:shadow-lg transition"
      >
        <h2 class="text-xl font-semibold">{{ test.title }}</h2>
        <p class="text-sm text-gray-600">{{ test.description }}</p>
        <p class="text-sm">⏱ {{ test.duration }} minutes</p>
        <NuxtLink
          class="mt-2 inline-block text-blue-600 hover:underline"
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
