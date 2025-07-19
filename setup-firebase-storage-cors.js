// Script para configurar CORS no Firebase Storage
// Execute este script usando: node setup-firebase-storage-cors.js

const fs = require('fs')
const { exec } = require('child_process')

const corsConfig = [
  {
    origin: [
      'https://historicoacademico.vercel.app',
      'http://localhost:3000',
      'http://localhost:5000'
    ],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
    maxAgeSeconds: 3600,
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'User-Agent',
      'x-goog-*'
    ]
  }
]

// Salvar configuração CORS
fs.writeFileSync(
  'firebase-storage-cors.json',
  JSON.stringify(corsConfig, null, 2)
)

console.log('Arquivo firebase-storage-cors.json criado com sucesso!')
console.log('')
console.log('Para aplicar a configuração CORS, execute os seguintes comandos:')
console.log('')
console.log('1. Instale o Firebase CLI se ainda não tiver:')
console.log('   npm install -g firebase-tools')
console.log('')
console.log('2. Faça login no Firebase:')
console.log('   firebase login')
console.log('')
console.log('3. Aplique a configuração CORS:')
console.log(
  '   gsutil cors set firebase-storage-cors.json gs://historico-universitario-abc12.firebasestorage.app'
)
console.log('')
console.log('4. Verifique se foi aplicado:')
console.log(
  '   gsutil cors get gs://historico-universitario-abc12.firebasestorage.app'
)
