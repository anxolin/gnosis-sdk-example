(function () {
  console.log('Loading Gnosis SDK Example...')
  const stateDiv = document.getElementById('state')
  const outputDiv = document.getElementById('output')
  let numLoggedItems = 0
  
  const state = {
    ipfsHash: localStorage.getItem('ipfsHash') || null,
    oracle: null,
    oracleAddress: null,
    categoricalEvent: null
  }

  _printState()  

  Gnosis.create().then(async gnosis => {
    console.log('Loaded gnosis', gnosis)
    _enableDisableButtons()
  
    /*
    await mathExample(gnosis)
    const ipfsHash = await publishEventExample(gnosis)
    const oracle = await createOracleExample(ipfsHash, gnosis)
    const categoricalEvent = await createCategoricalEventExample(oracle, gnosis)
    await buyAllOutcomes(categoricalEvent, gnosis)
    */
    window.App = {
      state,
      showState,
      clearState,

      mathExample () {
        _mathExample(gnosis)
          .catch(_handleError)
      },

      async publishEventExample () {
        const ipfsHash = await _publishEventExample(gnosis)
        .catch(_handleError)

        _updateState('ipfsHash', ipfsHash)
      },

      async createOracleExample () {
        const oracle = await createOracleExample(state.ipfsHash, gnosis)
          .catch(_handleError)

        _updateState('oracle', oracle)
        _updateState('oracleAddress', oracle.address)
      },

      async createCategoricalEventExample () {
        const categoricalEvent = await _createCategoricalEventExample(state.oracle, gnosis)
          .catch(_handleError)

        _updateState('categoricalEvent', categoricalEvent)
      },

      async buyAllOutcomes () {
        await _buyAllOutcomes(state.categoricalEvent, gnosis)
          .catch(_handleError)
      }
    }
  })

  function _handleError (error) {
    log({
      title: 'Upps! there was one error there',
      message: error.message,
      items: [        
        'Read the console for more info',
        'Maybe check that the gas limit is set it properly - common issuse there ;)'
      ]
    })

    throw error
  }

  function _enableDisableButtons () {
    document.getElementById('mathExampleBtn').disabled = false
    document.getElementById('publishEventExampleBtn').disabled = false
    document.getElementById('createOracleExampleBtn').disabled = (state.ipfsHash === null)
    document.getElementById('createCategoricalEventExampleBtn').disabled = (state.oracle === null)
    document.getElementById('buyAllOutcomesBtn').disabled = (state.categoricalEvent === null)
    document.getElementById('clearState').disabled = false    
  }

  function clearState () {
    Object.keys(state).forEach(prop => {
      state[prop] = null
      localStorage.removeItem(prop)
    })
    _printState()
  }

  function showState () {
    console.log(state)
  }
  
  function _updateState (prop, value) {
    const oldValue = state[prop]
    localStorage.setItem(prop, value) 
    console.log(`Uodate state "${prop}" from ${oldValue} to ${value}`)
    state[prop] = value

    _printState()
    _enableDisableButtons()
  }

  function _printState () {
    const propertiesList = Object
      .keys(state)
      .map(prop => {
        const value = state[prop]
        return `<li><strong>${prop}</strong>: ${value}</li>`
      })
      .join('\n')

    stateDiv.innerHTML = `<ul>${propertiesList}</ul>`
  }
  
  function log({ title, message, items }) {
    numLoggedItems++

    // console.log(title, message)
    const outputItem = document.createElement('div')
    const logItemsContent = items.map(logItem => `<li><div>${logItem}</div></li>`).join('\n')
    outputItem.innerHTML = `
  <h2>${numLoggedItems} - ${title}</h2>
  <div>${message}</div>
  <ul>${logItemsContent}</ul>
  `
    outputDiv.insertBefore(outputItem, outputDiv.firstChild);
  }
  
  async function _mathExample(gnosis) {
    console.log('mathExample: Init')
    const ONE = Math.pow(2, 64)
  
    const math = await gnosis.contracts.Math.deployed()
    const lnResult = await math.ln(3 * ONE)
    const result = lnResult.valueOf() / ONE
  
    log({
      title: 'Math Example',
      message: 'Loads Math contract and display the result of invoking an operation',
      items: [
        `<span class="code">Math.ln(3) = ${result}</span>`
      ]
    })
    console.log('mathExample: Executed with result', result)
  }
  
  
  async function _publishEventExample(gnosis) {
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
    log({
      title: 'Publish Event',
      message: `Example on using <em>publishEventDescription</em> and 
<em>loadEventDescription</em>`,
      items: logItems
    })
  
    console.log('publishEventDescription: Published', ipfsHash)
  
    return ipfsHash
  }
  
  async function createOracleExample(ipfsHash, gnosis) {
    console.log('createCentralizedOracle: Init')
    const oracle = await gnosis.createCentralizedOracle(ipfsHash)
    log({
      title: 'Create oracle',
      message: `Example on using <em>createCentralizedOracle</em>`,
      items: [
        `Centralized Oracle created with address <span class="code">${oracle.address}</span>`
      ]
    })
  
    console.log('createCentralizedOracle: Created', oracle.address)
    return oracle
  }
  
  
  async function _createCategoricalEventExample(oracle, gnosis) {
    console.log('createCategoricalEventExample: Init')
    const event = await gnosis.createCategoricalEvent({
      collateralToken: gnosis.etherToken,
      oracle,
      // Note the outcomeCount must match the length of the outcomes array published on IPFS
      outcomeCount: 3
    })
    log({
      title: 'Create categorical event',
      message: `Example on using <em>createCategoricalEvent</em> with a 
previously created oracle.`,
      items: [
        `Categorical event created with address 
<span class="code">${event.address}</span>`,

        `If you are in <strong>Rinkeby</strong> you can see the indexed event 
in: <br />
<a href="https://gnosisdb.rinkeby.gnosis.pm/api/events/${event.address}">
  https://gnosisdb.rinkeby.gnosis.pm/api/events/${event.address}
</a>`
          ]
    })
  
    console.log('createCategoricalEventExample: created', event.address)
    return event
  }
  
  
  async function _buyAllOutcomes (event, gnosis) {
    console.log('buyAllOutcomes: Init')
    const logItems = []
    const depositValue = 0.01e18
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
      logItems.push(`The transaction ${txResult.tx} has indeed the event ${event}`)
    })

    log({
      title: 'Buy all outcomes',
      message: `Example on using <em>buyAllOutcomes</em>.`,
      items: logItems
    })
    console.log('buyAllOutcomes: All outcomes has been bought', txResults)
  
    return txResults
  } 
}())