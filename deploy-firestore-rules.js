#!/usr/bin/env node

/**
 * Script para atualizar as regras do Firestore
 * Execute: node deploy-firestore-rules.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Atualizando regras do Firestore...')

try {
  // Verificar se o Firebase CLI está instalado
  try {
    execSync('firebase --version', { stdio: 'pipe' })
  } catch (error) {
    console.error(
      '❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools'
    )
    process.exit(1)
  }

  // Verificar se está logado no Firebase
  try {
    execSync('firebase projects:list', { stdio: 'pipe' })
  } catch (error) {
    console.error('❌ Não está logado no Firebase. Execute: firebase login')
    process.exit(1)
  }

  // Verificar se o arquivo firestore.rules existe
  const rulesPath = path.join(__dirname, 'firestore.rules')
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ Arquivo firestore.rules não encontrado')
    process.exit(1)
  }

  // Deploy das regras
  console.log('📝 Fazendo deploy das regras...')
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' })

  console.log('✅ Regras do Firestore atualizadas com sucesso!')
  console.log('🔧 As seguintes coleções têm permissões configuradas:')
  console.log('   - users')
  console.log('   - disciplines')
  console.log('   - certificados')
} catch (error) {
  console.error('❌ Erro ao atualizar regras:', error.message)
  process.exit(1)
}
