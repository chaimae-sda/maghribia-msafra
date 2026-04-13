import fs from 'fs';

const baseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.bin',
  'age_gender_model-weights_manifest.json',
  'age_gender_model.bin'
];

async function downloadModels() {
  for (const file of files) {
    console.log(`Downloading ${file}...`);
    const res = await fetch(`${baseUrl}/${file}`);
    if (!res.ok) throw new Error(`Failed to fetch ${file}: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(`public/models/${file}`, buffer);
    console.log(`${file} downloaded. Size: ${buffer.length} bytes`);
  }
}

downloadModels().catch(console.error);
