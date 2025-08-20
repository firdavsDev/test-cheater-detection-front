<template>
  <div class="test-bg">
    <div class="test-card">
      <div v-if="test">
        <h1 class="test-title">
          📝 <span>{{ test.title }}</span>
        </h1>
        <p class="test-desc">{{ test.description }}</p>
        <p class="test-duration">
          ⏱ Duration: <span class="test-duration-value">{{ test.duration }}</span> minutes
        </p>

        <!-- Countdown -->
        <transition name="fade">
          <p v-if="started" class="test-countdown">
            ⏳ Remaining Time: {{ Math.floor(remainingTime / 60) }}:{{ (remainingTime % 60).toString().padStart(2, "0") }}
          </p>
        </transition>

        <!-- Start Button -->
        <div v-if="!started && !showModal" class="test-start-btn-wrap">
          <button
            @click="startTest"
            class="test-start-btn"
          >
            🎬 Start Test
          </button>
        </div>

        <!-- Mirror video + Face overlay -->
        <div class="test-video-wrap">
          <video
            ref="videoRef"
            v-show="started"
            autoplay
            muted
            playsinline
            class="test-video"
            style="transform: scaleX(-1)"
          />
          <canvas
            ref="canvasRef"
            class="test-canvas"
          />
        </div>

        <!-- Questions -->
        <div v-if="started" class="test-questions">
          <div v-for="(q, idx) in test.questions" :key="idx" class="test-question-card">
            <p class="test-question-title">{{ idx + 1 }}. {{ q.text }}</p>
            <ul class="test-options">
              <li
                v-for="(option, letter) in q.options"
                :key="letter"
                class="test-option-item"
              >
                <label class="test-option-label">
                  <input type="radio" :name="`q-${idx}`" class="test-radio" />
                  <span class="test-option-text">{{ letter }}. {{ option }}</span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <!-- Modal -->
        <transition name="fade">
          <div
            v-if="showModal"
            class="test-modal-bg"
          >
            <div class="test-modal-card animate-shake">
              <h2 class="test-modal-title">🚫 Cheating Detected!</h2>
              <p class="test-modal-block">You are blocked for 3 seconds.</p>
              <p class="test-modal-redirect">Redirecting soon...</p>
            </div>
          </div>
        </transition>
      </div>
      <div v-else>
        <p class="test-notfound">❌ Test not found</p>
      </div>
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

<style>
/* Background and card */
.test-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #7f9cf5 0%, #e9d8fd 50%, #c3dafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.test-card {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.8);
  box-shadow: 0 8px 32px rgba(60, 60, 120, 0.18);
  border-radius: 1.5rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 700px;
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.5s;
}

/* Title and description */
.test-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #4c51bf;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 2px 8px rgba(76,81,191,0.08);
}
.test-desc {
  color: #4a5568;
  margin-bottom: 1rem;
  font-size: 1.15rem;
  font-style: italic;
}
.test-duration {
  font-size: 1rem;
  color: #5a67d8;
  margin-bottom: 2rem;
}
.test-duration-value {
  font-weight: 600;
}

/* Countdown */
.test-countdown {
  color: #2563eb;
  font-weight: bold;
  font-size: 2rem;
  margin: 1rem 0 2rem 0;
  background: rgba(219,234,254,0.8);
  padding: 1rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(37,99,235,0.07);
  display: inline-block;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Start button */
.test-start-btn-wrap {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
.test-start-btn {
  padding: 1.2rem 3rem;
  background: linear-gradient(90deg, #6366f1 0%, #a78bfa 50%, #60a5fa 100%);
  color: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(76,81,191,0.12);
  font-weight: bold;
  font-size: 1.3rem;
  letter-spacing: 2px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.test-start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(76,81,191,0.18);
}

/* Video and canvas */
.test-video-wrap {
  margin-top: 2rem;
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 16/9;
  margin-left: auto;
  margin-right: auto;
}
.test-video {
  border-radius: 1rem;
  border: 2px solid #a3bffa;
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-shadow: 0 2px 12px rgba(76,81,191,0.10);
}
.test-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 10;
}

/* Questions */
.test-questions {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.test-question-card {
  background: rgba(255,255,255,0.95);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(76,81,191,0.07);
  padding: 1.5rem;
  border: 1px solid #f3f3f3;
  transition: box-shadow 0.2s;
}
.test-question-card:hover {
  box-shadow: 0 4px 16px rgba(76,81,191,0.15);
}
.test-question-title {
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.15rem;
  color: #4c51bf;
}
.test-options {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.test-option-item {
  margin-left: 1rem;
}
.test-option-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.test-radio {
  accent-color: #6366f1;
  transform: scale(1.25);
}
.test-option-text {
  color: #4a5568;
}

/* Modal */
.test-modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.test-modal-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(255,0,0,0.12);
  text-align: center;
  max-width: 350px;
  width: 100%;
  border: 1px solid #fecaca;
}
.test-modal-title {
  font-size: 2rem;
  font-weight: bold;
  color: #e53e3e;
  margin-bottom: 0.5rem;
}
.test-modal-block {
  margin-top: 1rem;
  font-size: 1.15rem;
}
.test-modal-redirect {
  font-size: 0.95rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Not found */
.test-notfound {
  color: #e53e3e;
  font-size: 1.3rem;
  font-weight: bold;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }
}
.animate-shake {
  animation: shake 0.5s;
}
</style>
