console.log('Loading Gnosis SDK Example...')
const output = document.getElementById('output')


Gnosis.create().then(async gnosis => {
  console.log('Loaded gnosis', gnosis)

  await mathExample(gnosis)
  const ipfsHash = await publishEventExample(gnosis)
  const oracle = await createOracleExample(ipfsHash, gnosis)
  const categoricalEvent = await createCategoricalEventExample(oracle, gnosis)
  await buyAllOutcomes(categoricalEvent, gnosis)
})


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
  console.log('mathExample: Init')
  const ONE = Math.pow(2, 64)

  const math = await gnosis.contracts.Math.deployed()
  const lnResult = await math.ln(3 * ONE)
  const result = lnResult.valueOf() / ONE

  log(
    'Math Example',
    'Loads Math contract and display the result of invoking an operation',
    [`<span class="code">Math.ln(3) = ${result}</span>`]
  )
  console.log('mathExample: Executed with result', result)
}


async function publishEventExample(gnosis) {
  console.log('publishEventDescription: Init')
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

  // Log result
  log('Publish Event', `Example on using <em>publishEventDescription</em> 
and <em>loadEventDescription</em>`, logItems)

  console.log('publishEventDescription: Published', ipfsHash)

  return ipfsHash
}

async function createOracleExample(ipfsHash, gnosis) {
  console.log('createCentralizedOracle: Init')
  const oracle = await gnosis.createCentralizedOracle(ipfsHash)
  log('Create oracle', `Example on using <em>createCentralizedOracle</em>`, [
    `Centralized Oracle created with address <span class="code">${oracle.address}</span>`
  ])

  console.log('createCentralizedOracle: Created', oracle.address)
  return oracle
}


async function createCategoricalEventExample(oracle, gnosis) {
  console.log('createCategoricalEventExample: Init')
  const event = await gnosis.createCategoricalEvent({
    collateralToken: gnosis.etherToken,
    oracle,
    // Note the outcomeCount must match the length of the outcomes array published on IPFS
    outcomeCount: 3
  })
  log('Create categorical event', `Example on using 
<em>createCategoricalEvent</em> with a previously created oracle.`, [
      `Categorical event created with address <span class="code">${event.address}</span>`,
      `If you are in <strong>Rinkeby</strong> you can see the indexed event in:
<a href="https://gnosisdb.rinkeby.gnosis.pm/api/events/${event.address}">https://gnosisdb.rinkeby.gnosis.pm/api/events/${event.address}</a>
      `
    ])

  console.log('createCategoricalEventExample: created', event.address)
  return event
}


async function buyAllOutcomes (event, gnosis) {
  console.log('buyAllOutcomes: Init')
  const logItems = []
  const depositValue = 4e18
  const txResults = await Promise.all([
      gnosis.etherToken.deposit({ value: depositValue }),
      gnosis.etherToken.approve(event.address, depositValue),
      event.buyAllOutcomes(depositValue),
  ])
  logItems.push(`Deposited <span class="code">${depositValue}</code> EtherToken`)
  logItems.push(`Approve the event contract <span class="code">${event.address} 
  </code> to use <span class="code">${depositValue}</code> EtherToken`)
  logItems.push(`Buy all outcomes for the event contract 
<span class="code">${event.address}</code>`)

  // Make sure everything worked
  const expectedEvents = [
      'Deposit',
      'Approval',
      'OutcomeTokenSetIssuance',
  ]
  txResults.forEach((txResult, i) => {
    const event = expectedEvents[i]
    console.log(`Check transaction for log ${event}`, txResult)
    Gnosis.requireEventFromTXResult(txResult, expectedEvents[i])
    logItems.push(`The transaction ${txResult} has indeed the event ${event}`)
  })

  log('Buy all outcomes', `Example on using <em>buyAllOutcomes</em>.`, logItems)
  console.log('buyAllOutcomes: All outcomes has been bought', txResults)

  return txResults
}
