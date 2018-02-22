console.log('Loading Gnosis SDK Example...')
const output = document.getElementById('output')

function log(title, message, logItems) {
  // console.log(title, message)
  const outputItem = document.createElement('div')
  const logItemsContent = logItems.map(logItem => `<li><div>${logItem}</div></li>`).join('\n')
  outputItem.innerHTML = `
<h2>${title}</h2>
<div>${message}</div>
<ul>${logItemsContent}</ul>
`
  output.appendChild(outputItem)
}

async function mathExample(gnosis) {
  const ONE = Math.pow(2, 64)

  const math = await gnosis.contracts.Math.deployed()
  const lnResult = await math.ln(3 * ONE)
  const result = lnResult.valueOf() / ONE

  log(
    'Math Example',
    'Loads Math contract and display the result of invoking an operation',
    [ `<span class="code">Math.ln(3) = ${result}</span>`]
  )
}


async function examplePublishEvent(gnosis) {
  const logItems = []

  // Publish event
  const ipfsHash = await gnosis.publishEventDescription({
    title: 'Who will win the U.S. presidential election of 2016?',
    description: 'Every four years, the citizens of the United States vote for their next president...',
    resolutionDate: '2016-11-08T23:00:00-05:00',
    outcomes: ['Clinton', 'Trump', 'Other'],
  })
  logItems.push(`
  <p>Published event. We've got the hash 
    <span class="code">
      ${ipfsHash}
    </span>.
  </p>
  <p>Check the result in: <br />
    <a href="https://ipfs.infura.io/api/v0/cat?stream-channels=true&arg=${ipfsHash}">
      https://ipfs.infura.io/api/v0/cat?stream-channels=true&arg=${ipfsHash}
    </a>
  </p>
`)

  // Load event
  const eventDescription = await gnosis.loadEventDescription(ipfsHash)
  const eventDescriptionJson = JSON.stringify(eventDescription)
  logItems.push(`
<p>Load event. Event data:</p>
<p class="code">${eventDescriptionJson}</p>`)

  log('Publish Event', `Example on using <em>publishEventDescription</em> 
and <em>loadEventDescription</em>`, logItems)
}

Gnosis.create().then(gnosis => {
  console.log('Loaded gnosis', gnosis)

  mathExample(gnosis)
  examplePublishEvent(gnosis)
})