console.log('Loading Gnosis SDK Example...')
const output = document.getElementById('output')

function log (title, message) {
  console.log(title, message)
  const outputItem = document.createElement('div')
  outputItem.innerHTML =`
<h2>${title}</h2>
<p>${message}</p>
`
  output.appendChild(outputItem)
}

async function mathExample(gnosis) {
  const ONE = Math.pow(2, 64)

  const math = await gnosis.contracts.Math.deployed()
  const lnResult = await math.ln(3 * ONE)

  log('Math Example', 'Math.ln(3) = ' + lnResult.valueOf() / ONE)
}

Gnosis.create().then(gnosis => {
  console.log('Loaded gnosis', gnosis)

  mathExample(gnosis)
})