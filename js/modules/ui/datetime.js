function updateDateTime() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Precisão dos milissegundos
  const ms = now.getMilliseconds()
  const delay = 1000 - ms

  document.getElementById(
    'current-datetime'
  ).textContent = `${dateStr} · ${timeStr}`

  setTimeout(() => {
    updateDateTime()
  }, delay)
}

export function setupDateTime() {
  updateDateTime()
}
