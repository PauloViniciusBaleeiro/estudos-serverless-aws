async function handler(event, context) {
  console.log('Ambiente...', JSON.stringify(process.env, null, 2))
  console.log('Evento...', JSON.stringify(event, null, 2))

  return {
    Palmeiras: 'Tri campeão da Libertadores'
  }
}

module.exports = {
  handler
}