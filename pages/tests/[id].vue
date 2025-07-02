<template>
  <div class="p-6">
    <div v-if="test">
      <h1 class="text-2xl font-bold mb-2">📝 {{ test.title }}</h1>
      <p class="text-gray-600 mb-1">{{ test.description }}</p>
      <p class="text-sm">⏱ Duration: {{ test.duration }} minutes</p>

      <!-- Countdown -->
      <p v-if="started" class="text-blue-600 font-semibold mt-2">
        ⏳ Remaining Time: {{ Math.floor(remainingTime / 60) }}:{{
          (remainingTime % 60).toString().padStart(2, "0")
        }}
      </p>

      <!-- Start Button -->
      <div v-if="!started && !showModal" class="mt-6">
        <button
          @click="startTest"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🎬 Start Test
        </button>
      </div>

      <!-- 📸 Mirror video + 🖼️ Face overlay -->
      <div class="mt-6 relative w-full max-w-md aspect-video mx-auto">
        <video
          ref="videoRef"
          v-show="started"
          autoplay
          muted
          playsinline
          class="rounded border w-full h-full object-cover"
          style="transform: scaleX(-1)"
        />
        <canvas
          ref="canvasRef"
          class="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />
      </div>

      <!-- Questions -->
      <div v-if="started" class="mt-8 space-y-6">
        <div v-for="(q, idx) in test.questions" :key="idx">
          <p class="font-semibold mb-2">{{ idx + 1 }}. {{ q.text }}</p>
          <ul class="space-y-1">
            <li
              v-for="(option, letter) in q.options"
              :key="letter"
              class="ml-4"
            >
              <label class="cursor-pointer">
                <input type="radio" :name="`q-${idx}`" class="mr-2" />
                {{ letter }}. {{ option }}
              </label>
            </li>
          </ul>
        </div>
      </div>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <div
          class="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full"
        >
          <h2 class="text-xl font-bold text-red-600">🚫 Cheating Detected!</h2>
          <p class="mt-2">You are blocked for 3 seconds.</p>
          <p class="text-sm text-gray-500 mt-1">Redirecting soon...</p>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="text-red-600">❌ Test not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMockTests } from "~/composables/useMockTests";
import { useFaceTracking } from "~/composables/useFaceTracking";
import { useCookie } from "#app";

const route = useRoute();
const router = useRouter();
const testId = Number(route.params.id);
const allTests = useMockTests();
const test = allTests.find((t) => t.id === testId);

const started = ref(false);
const showModal = ref(false);
const remainingTime = ref(0);
let countdownInterval: NodeJS.Timeout | null = null;

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const blockedUntil = useCookie<number | null>("blockedUntil", {
  default: () => null,
});

const { loadModels, startTracking, isCheating } = useFaceTracking();

// Start timer
const startCountdown = () => {
  remainingTime.value = test?.duration * 60 || 0;
  countdownInterval = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      clearInterval(countdownInterval!);
      started.value = false;
      alert("⏰ Time is up!");
    }
  }, 1000);
};

// Handle cheating
const handleCheating = async () => {
  const now = Date.now();
  blockedUntil.value = now + 3000;
  started.value = false;
  showModal.value = true;

  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));
  showModal.value = false;
  router.replace(`/tests/${testId}`);
};

// Main test starter
const startTest = async () => {
  await loadModels();
  await nextTick(); // Ensure DOM is updated before accessing videoRef

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.onloadedmetadata = () => {
        started.value = true;
        startTracking(videoRef.value!, canvasRef.value!); // <--- canvasRef qo‘shilgan
      };
    }
    let attempts = 0;
    while (!videoRef.value && attempts < 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      started.value = true;

      const canvas = canvasRef.value;
      const video = videoRef.value;
      if (canvas && video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      console.log("📹 Video stream started");
      startTracking(video, canvas);
      startCountdown();
    } else {
      console.warn("⚠️ videoRef is null");
    }
  } catch (err) {
    console.error("🚨 Camera error:", err);
  }
};

// React to cheating detection
watch(isCheating, async (cheated) => {
  if (cheated) {
    console.warn("🚨 Cheating detected!");
    await fetch("https://httpbin.org/post", {
      method: "POST",
      body: JSON.stringify({
        test_id: testId,
        user_id: 1,
        reason: "looked away 3 times",
        timestamp: new Date().toISOString(),
      }),
      headers: { "Content-Type": "application/json" },
    });

    await handleCheating();
  }
});

// Cookie-based block on page load
onMounted(() => {
  const now = Date.now();
  if (blockedUntil.value && blockedUntil.value > now) {
    showModal.value = true;
    const waitTime = blockedUntil.value - now;
    setTimeout(() => {
      showModal.value = false;
      router.replace(`/tests/${testId}`);
    }, waitTime);
  }
});
</script>
