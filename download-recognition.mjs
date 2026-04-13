import fs from 'fs';

const baseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

const faceRecognitionFiles = [
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin',
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model.bin'
];

async function downloadModels() {
  for (const file of faceRecognitionFiles) {
    console.log(`Downloading ${file}...`);
    const res = await fetch(`${baseUrl}/${file}`);
    if (!res.ok) {
       console.error(`Failed to fetch ${file}: ${res.status} ${res.statusText}`);
       continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(`public/models/${file}`, buffer);
    console.log(`${file} downloaded. Size: ${buffer.length} bytes`);
  }
}

downloadModels().catch(console.error);
