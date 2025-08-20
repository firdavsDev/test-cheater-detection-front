<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100">
    <div class="max-w-xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex flex-col items-center">
      <h1 class="text-3xl font-extrabold text-center mb-4 text-green-700">📋 Test List</h1>
      <p class="text-center text-gray-600 mb-8">
        Welcome to <span class="font-semibold text-green-700">UzDavKarantin</span>! This platform helps monitor and manage online tests securely. Select a test below to get started.
      </p>
      <ul class="space-y-3 w-full">
        <li
          v-for="test in tests"
          :key="test.id"
          class="bg-green-50 p-4 rounded-lg shadow-md border border-green-200 hover:bg-green-100 transition"
        >
          <NuxtLink :to="`/tests/${test.id}`" class="text-blue-700 font-medium hover:underline">
            {{ test.title }} <span class="text-gray-500">({{ test.duration }} mins)</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMockTests } from '~/composables/useMockTests'

const tests = useMockTests()
</script>
<style>
.min-h-screen {
  min-height: 100vh;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, #eff6ff, #d1fae5);
}
.max-w-xl {
  max-width: 36rem;
}
.w-full {
  width: 100%;
}
.bg-white {
  background-color: #fff;
}
.rounded-xl {
  border-radius: 0.75rem;
}
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05);
}
.border {
  border-width: 1px;
}
.border-gray-200 {
  border-color: #e5e7eb;
}
.p-8 {
  padding: 2rem;
}
.flex-col {
  flex-direction: column;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.font-extrabold {
  font-weight: 800;
}
.text-center {
  text-align: center;
}
.mb-4 {
  margin-bottom: 1rem;
}
.text-green-700 {
  color: #15803d;
}
.text-gray-600 {
  color: #4b5563;
}
.mb-8 {
  margin-bottom: 2rem;
}
.font-semibold {
  font-weight: 600;
}
.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.75rem;
}
.bg-green-50 {
  background-color: #f0fdf4;
}
.p-4 {
  padding: 1rem;
}
.rounded-lg {
  border-radius: 0.5rem;
}
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.05), 0 2px 4px -1px rgba(59, 130, 246, 0.03);
}
.border-green-200 {
  border-color: #bbf7d0;
}
.hover\:bg-green-100:hover {
  background-color: #dcfce7;
}
.transition {
  transition: background-color 0.2s;
}
.text-blue-700 {
  color: #1d4ed8;
}
.font-medium {
  font-weight: 500;
}
.hover\:underline:hover {
  text-decoration: underline;
}
.text-gray-500 {
  color: #6b7280;
}
</style>