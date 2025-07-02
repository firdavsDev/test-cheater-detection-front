<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">📋 Test List</h1>
    <ul class="space-y-2">
      <li
        v-for="test in tests"
        :key="test.id"
        class="bg-gray-100 p-4 rounded shadow hover:bg-gray-200"
      >
        <NuxtLink :to="`/tests/${test.id}`" class="text-blue-600 hover:underline">
          {{ test.title }} ({{ test.duration }} mins)
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useMockTests } from '~/composables/useMockTests'

const tests = useMockTests()
</script>
