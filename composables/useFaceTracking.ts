import { ref } from 'vue'
import * as faceapi from 'face-api.js'

const isCheating = ref(false)
const lookAwayCount = ref(0)

const MAX_LOOK_AWAY = 3
const THRESHOLD = 30 // markazdan 30px dan ortiq harakat bo‘lsa qaradi deb hisoblanadi

export function useFaceTracking() {
    const loadModels = async () => {
        const MODEL_URL = '/models'
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL)

        console.log('✅ Models loaded.')
    }

    const startTracking = (video: HTMLVideoElement, canvas?: HTMLCanvasElement) => {
        console.log('👀 Starting face tracking...')

        const detect = async () => {
            console.log('Detect loop running');

            if (!video || video.paused || video.ended) return

            const result = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()

            if (result) {
                const nose = result.landmarks.getNose()
                const noseX = nose[3].x
                const centerX = video.videoWidth / 2
                const dx = Math.abs(noseX - centerX)

                console.log(`👃 noseX=${noseX.toFixed(2)}, center=${centerX}, dx=${dx.toFixed(2)}`)

                if (dx > THRESHOLD) {
                    lookAwayCount.value++
                    console.log(`👀 Looked away! (${lookAwayCount.value} / ${MAX_LOOK_AWAY})`)
                } else {
                    if (lookAwayCount.value > 0) {
                        console.log('🔄 Resetting lookAwayCount (back to center)')
                    }
                    lookAwayCount.value = 0
                }

                // Rasmga ramka chizish (vizual feedback)
                if (canvas) {
                    const dims = faceapi.matchDimensions(canvas, video, true)
                    const resized = faceapi.resizeResults(result, dims)
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        faceapi.draw.drawDetections(canvas, resized)
                        faceapi.draw.drawFaceLandmarks(canvas, resized)


                        // markaz chizig‘i
                        ctx.beginPath()
                        ctx.moveTo(canvas.width / 2, 0)
                        ctx.lineTo(canvas.width / 2, canvas.height)
                        ctx.strokeStyle = 'red'
                        ctx.stroke()

                        // burun nuqtasi (ko‘k doira)
                        ctx.beginPath()
                        ctx.arc(noseX, nose[3].y, 5, 0, 2 * Math.PI)
                        ctx.fillStyle = 'blue'
                        ctx.fill()

                    }
                }
            } else {
                lookAwayCount.value++
                console.log(`⚠️ Face not detected! Count: ${lookAwayCount.value}`)
            }

            // Cheating trigger
            if (lookAwayCount.value >= MAX_LOOK_AWAY) {
                console.log('🚨 CHEATING DETECTED!')
                isCheating.value = true
                return
            }

            requestAnimationFrame(detect)
        }

        detect()
    }

    return {
        isCheating,
        lookAwayCount,
        loadModels,
        startTracking
    }
}
