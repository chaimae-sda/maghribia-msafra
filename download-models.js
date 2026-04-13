const fs = require('fs');
const https = require('https');

const baseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'age_gender_model-weights_manifest.json',
  'age_gender_model-shard1'
];

files.forEach(file => {
  const fileStream = fs.createWriteStream(`public/models/${file}`);
  https.get(`${baseUrl}/${file}`, response => {
    response.pipe(fileStream);
  });
});
