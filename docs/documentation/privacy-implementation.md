# Implementação de Privacidade

## Visão Geral

A funcionalidade de privacidade foi implementada para controlar a visibilidade dos dados do usuário no sistema. O sistema suporta dois níveis de privacidade:

- **Privado**: Dados não são visíveis publicamente
- **Público**: Dados podem ser visualizados por outros usuários

## Configuração

### 1. Configuração Básica

A privacidade é configurada através do `SettingsManager`:

```javascript
import settingsManager from './js/modules/settings.js'

// Verificar configuração atual
const privacy = settingsManager.getCurrentPrivacy()

// Verificar se está em modo privado
if (settingsManager.isPrivateMode()) {
  // Lógica para modo privado
}

// Verificar se está em modo público
if (settingsManager.isPublicMode()) {
  // Lógica para modo público
}
```

### 2. Aplicar Privacidade

```javascript
// Aplicar configuração de privacidade
settingsManager.applyPrivacy('private') // ou 'public'
```

## Controle de Interface

### 1. Elementos com Privacidade

Use atributos `data-privacy` para controlar a visibilidade:

```html
<!-- Elemento que só aparece em modo público -->
<div data-privacy="public">Conteúdo público</div>

<!-- Elemento que só aparece em modo privado -->
<div data-privacy="private">Conteúdo privado</div>
```

### 2. Dados Sensíveis

Use atributos `data-sensitive` para proteger dados sensíveis:

```html
<!-- Email será mascarado em modo privado -->
<input type="email" data-sensitive="email" />

<!-- Matrícula será ocultada em modo privado -->
<input type="text" data-sensitive="enrollment" />

<!-- Nota será mascarada em modo privado -->
<div data-sensitive="grade">8.5</div>
```

### 3. Controles de Compartilhamento

```html
<!-- Botão de compartilhamento -->
<button data-share="profile">Compartilhar</button>

<!-- Controle de compartilhamento -->
<div data-share-control="profile">Controles de compartilhamento</div>
```

## Filtros de Dados

### 1. Obter Dados Filtrados

```javascript
// Obter dados filtrados por privacidade
const filteredData = settingsManager.getFilteredData(userData, 'profile')

// Verificar se dados podem ser compartilhados
if (settingsManager.canShareData('statistics')) {
  // Compartilhar estatísticas
}

// Obter dados seguros para compartilhamento
const shareableData = settingsManager.getShareableData(data, 'profile')
```

### 2. Exportar com Privacidade

```javascript
// Exportar dados com filtros de privacidade
const exportData = settingsManager.exportDataWithPrivacy(userData, false)
```

## Eventos

### 1. Listener de Mudança

```javascript
// Escutar mudanças de privacidade
window.addEventListener('privacyChanged', event => {
  const { privacy, timestamp } = event.detail
  console.log(`Privacidade alterada para: ${privacy}`)
})
```

### 2. Configurar Listeners

```javascript
// Configurar listeners automaticamente
settingsManager.setupPrivacyListeners()
```

## Validação

### 1. Validar Configurações

```javascript
// Validar configurações de privacidade
const validatedSettings = settingsManager.validatePrivacySettings({
  privacy: 'public',
  notifications: true
})
```

## CSS Classes

### 1. Indicadores Visuais

```css
/* Indicador de privacidade */
.privacy-indicator.private {
  background-color: var(--warning-color);
}

.privacy-indicator.public {
  background-color: var(--success-color);
}

/* Elementos ocultos */
.privacy-hidden {
  display: none !important;
}

/* Dados sensíveis */
.data-hidden {
  opacity: 0.5;
  filter: blur(2px);
}
```

## Exemplos de Uso

### 1. Perfil do Usuário

```html
<div class="profile-section">
  <!-- Dados sempre visíveis -->
  <h2>Nome: <span id="userName">João Silva</span></h2>

  <!-- Dados sensíveis -->
  <p>Email: <span data-sensitive="email">joao@email.com</span></p>
  <p>Matrícula: <span data-sensitive="enrollment">202300123</span></p>

  <!-- Elementos públicos -->
  <div data-privacy="public">
    <button data-share="profile">Compartilhar Perfil</button>
  </div>
</div>
```

### 2. Estatísticas

```html
<div class="stats-section">
  <!-- Estatísticas básicas -->
  <div class="stat">
    <span>Total de Disciplinas: <span id="totalDisciplines">15</span></span>
  </div>

  <!-- Estatísticas sensíveis -->
  <div class="stat">
    <span
      >Média Geral:
      <span data-sensitive="grade" id="averageGrade">8.5</span></span
    >
  </div>

  <!-- Compartilhamento público -->
  <div data-privacy="public">
    <button data-share="statistics">Compartilhar Estatísticas</button>
  </div>
</div>
```

### 3. JavaScript

```javascript
// Carregar dados com privacidade
async function loadUserProfile() {
  const userData = await getUserData()
  const filteredData = settingsManager.getFilteredData(userData, 'profile')

  // Aplicar dados filtrados
  document.getElementById('userName').textContent = filteredData.name

  // Aplicar privacidade a elementos sensíveis
  const sensitiveElements = document.querySelectorAll('[data-sensitive]')
  sensitiveElements.forEach(element => {
    const dataType = element.getAttribute('data-sensitive')
    settingsManager.applyPrivacyToElement(element, dataType)
  })
}

// Atualizar configurações
async function updatePrivacySettings(privacy) {
  const result = await settingsManager.updateSettings({ privacy })
  if (result.success) {
    console.log('Configuração de privacidade atualizada')
  }
}
```

## Segurança

### 1. Headers de Segurança

O sistema automaticamente configura headers de segurança em modo privado:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 2. Proteção de Dados

- Dados sensíveis são mascarados em modo privado
- APIs de compartilhamento são desabilitadas
- Controles de acesso são aplicados automaticamente

## Integração com Firebase

### 1. Regras de Segurança

As regras do Firestore já estão configuradas para proteger os dados:

```javascript
// Regras para usuários
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 2. Sincronização

A privacidade é sincronizada automaticamente com o Firebase:

```javascript
// Atualizar configurações no Firebase
await settingsManager.updateSettings({
  privacy: 'public'
})
```

## Troubleshooting

### 1. Elementos não aparecem

Verifique se os atributos `data-privacy` estão corretos:

- `data-privacy="public"` - só aparece em modo público
- `data-privacy="private"` - só aparece em modo privado

### 2. Dados sensíveis não são mascarados

Verifique se os atributos `data-sensitive` estão configurados:

- `data-sensitive="email"`
- `data-sensitive="enrollment"`
- `data-sensitive="grade"`

### 3. Eventos não funcionam

Certifique-se de que os listeners estão configurados:

```javascript
// Configurar listeners
settingsManager.setupPrivacyListeners()
```

## Próximos Passos

1. **Implementar API de compartilhamento** para modo público
2. **Adicionar mais tipos de dados sensíveis**
3. **Implementar logs de auditoria** para mudanças de privacidade
4. **Adicionar notificações** quando dados são compartilhados
