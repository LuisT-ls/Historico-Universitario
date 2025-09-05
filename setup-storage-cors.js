// Script para configurar CORS no Firebase Storage
// Execute com: node setup-storage-cors.js

const { Storage } = require('@google-cloud/storage')
const fs = require('fs')

// Configuração do Firebase Storage
const storage = new Storage({
  projectId: 'seu-projeto-id', // Substitua pelo ID do seu projeto
  keyFilename: 'path/to/service-account-key.json' // Caminho para a chave de serviço
})

const bucketName = 'seu-projeto-id.appspot.com' // Substitua pelo nome do seu bucket

async function setupCORS() {
  try {
    const bucket = storage.bucket(bucketName)

    // Configuração CORS para permitir uploads de PDF
    const cors = [
      {
        origin: ['*'], // Em produção, especifique os domínios permitidos
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        responseHeader: ['Content-Type', 'Access-Control-Allow-Origin'],
        maxAgeSeconds: 3600
      }
    ]

    await bucket.setCorsConfiguration(cors)
    console.log('✅ CORS configurado com sucesso para o Firebase Storage')
    console.log('📁 Bucket:', bucketName)
    console.log('🔧 Configuração CORS aplicada')
  } catch (error) {
    console.error('❌ Erro ao configurar CORS:', error)
  }
}

// Executar configuração
setupCORS()
