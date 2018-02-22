console.log('Loading Gnosis SDK Example...')

async function mathExample(gnosis) {
  const ONE = Math.pow(2, 64)

  const math = await gnosis.contracts.Math.deployed()
  const lnResult = await math.ln(3 * ONE)

  console.log('[mathExample] Math.ln(3) = %s', lnResult.valueOf() / ONE)
}

Gnosis.create().then(gnosis => {
  console.log('Loaded gnosis', gnosis)

  mathExample(gnosis)
})