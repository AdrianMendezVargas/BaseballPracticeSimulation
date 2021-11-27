'use strinct';

class Pitch {
	constructor(type, speed) {
		this.Type = type
		this.Speed = speed
		this.WasHitted = false
		this.IsFoul = false
	}
}

class Batter {

	constructor(name, sickness, fastball, change, curve, slider, knuckles) {
		this.Name = name
		this.Sickness = sickness
		this.InitialSickness = sickness
		this.Fastball = fastball
		this.Change = change
		this.Curve = curve
		this.Slider = slider
		this.Knuckles = knuckles
		this.HitsPercentage = 0
		this.PitchHistory = []
	}

	async swing(pitch) {
		let contactProbability = this.getContactProbability(pitch)
		const willHitTheBall = Math.random() > 1 - (contactProbability / 100)

		//todo: Update indicators here (optional)
		if (willHitTheBall) {
			pitch.WasHitted = true
			playBatSound()
			pitch.IsFoul = await HitBallToRandomPosition()
		} else {

		}

		this.addPitchTohistory(pitch)

		const batterElement = document.querySelector('.batter');
		batterElement.style.transform = 'rotate(-90deg)'
		await sleep(400)
		batterElement.style.transform = 'rotate(0deg)'
	}

	addPitchTohistory(pitch) {
		this.PitchHistory.push(pitch)
	}

	getContactProbability(pitch) {
		let probabilityPercentage = this[pitch.Type]
		probabilityPercentage -= sickessProbabilityDecrease[this.Sickness]

		if (this.PitchHistory.length > 0) {

			const lastPitch = this.PitchHistory[this.PitchHistory.length - 1]

			if (lastPitch.Type == pitch.Type) {
				probabilityPercentage += (config.probabilityIncreaseOnepeatedPitch * 100)
			}
		}

		return probabilityPercentage
	}
}

const PitchTypes = {
	fastball: 'Fastball',
	change: 'Change',
	curve: 'Curve',
	slider: 'Slider',
	knuckles: 'Knuckles'
}

const SicknessTypes = {
	flu: 'flu',
	hangover: 'hangover',
	badNight: 'badNight',
	none: 'none'
}

const config = {
	sickPlayerProbability: 0.40,
	foulProbability: 0.30,
	sicknessRecoveryPitchs: 2,
	pitchPerBatter: 10,
	batterPerSimulation: 5,
	probabilityIncreaseOnepeatedPitch: 0.10
}

const sickessProbabilityDecrease = {
	flu: 5,
	hangover: 10,
	badNight: 20,
	none: 0
}

let historyBatters = []

const state = {
	currentBatter: null,
	isMachineOn: false
}

let machineInterval

const fieldContainer = document.querySelector('.field-container');
const foulzoneLeft = document.querySelector('.foulzone-left');
const foulzoneRight = document.querySelector('.foulzone-right');
const ball = document.querySelector('.ball');

const pitchCountElement = document.getElementById('pitchCount');
const hitsCountElement = document.getElementById('hitsCount');
const foulsCountElement = document.getElementById('fouldCount');
const missedCountElement = document.getElementById('missedCount');

const pitchTypeElement = document.getElementById('pitchType');
const pitchSpeedElement = document.getElementById('speed');
const batterNameElement = document.getElementById('name');
const batterHealthElement = document.getElementById('health');
const fastballPercentageElement = document.getElementById('fastballPercentage');
const changePercentageElement = document.getElementById('changePercentage');
const curvePercentageElement = document.getElementById('curvePercentage');
const sliderPercentageElement = document.getElementById('sliderPercentage');
const knucklesPercentageElement = document.getElementById('knucklesPercentage');
const hitsPercentageElement = document.getElementById('hitsPercentage');

const startButtonElement = document.getElementById('startButton');

const summaryDialogElement = document.getElementById('summaryDialog');
const summaryModalBodyElement = document.getElementById('summaryModalBody');

const battersHistoryCountElement = document.getElementById('battersHistoryCount');

const sickPlayerProbabilityInput = document.getElementById('sickPlayerProbabilityInput');
const foulProbabilityInput = document.getElementById('foulProbabilityInput');
const probabilityIncreaseOnepeatedPitchInput = document.getElementById('probabilityIncreaseOnepeatedPitchInput');
const sicknessRecoveryPitchsInput = document.getElementById('sicknessRecoveryPitchsInput');
const pitchPerBatterInput = document.getElementById('pitchPerBatterInput');
const batterPerSimulationInput = document.getElementById('batterPerSimulationInput');


main()

function main() {
	showVariablesValues()
	setRandomBatter()
	addListeners()
}

function addListeners() {
	sickPlayerProbabilityInput.addEventListener('change', ()=> {
		config.sickPlayerProbability = sickPlayerProbabilityInput.value / 100
	})

	foulProbabilityInput.addEventListener('change', () => {
		config.foulProbability = foulProbabilityInput.value / 100
	})

	probabilityIncreaseOnepeatedPitchInput.addEventListener('change', () => {
		config.probabilityIncreaseOnepeatedPitch = probabilityIncreaseOnepeatedPitchInput.value / 100
	})

	sicknessRecoveryPitchsInput.addEventListener('change', () => {
		config.sicknessRecoveryPitchs = sicknessRecoveryPitchsInput.value / 100
	})

	pitchPerBatterInput.addEventListener('change', () => {
		config.pitchPerBatter = pitchPerBatterInput.value / 100
	})

	batterPerSimulationInput.addEventListener('change', () => {
		config.batterPerSimulation = batterPerSimulationInput.value / 100
	})
}

function showVariablesValues() {
	sickPlayerProbabilityInput.value = config.sickPlayerProbability * 100
	foulProbabilityInput.value = config.foulProbability * 100
	probabilityIncreaseOnepeatedPitchInput.value = config.probabilityIncreaseOnepeatedPitch * 100
	sicknessRecoveryPitchsInput.value = config.sicknessRecoveryPitchs
	pitchPerBatterInput.value = config.pitchPerBatter
	batterPerSimulationInput.value = config.batterPerSimulation
}

function turnMachineOn() {
	startButtonElement.classList.remove('btn-outline-primary')
	startButtonElement.classList.add('btn-primary')
	startButtonElement.innerHTML = 'Apagar maquina'

	machineInterval = setInterval(async () => {
		await pitchAndSwing()
		updateDinamicStatistics()
		checkBatterForChange()
		checkBatterHealth()
	}, 2000)

	state.isMachineOn = true
}

function HandleStartClick() {
	if (state.isMachineOn) {
		turnMachineOff()
		
	} else {
		turnMachineOn()
	}
}

function HandleStopSimulationClick() {
	changeBatter()
	showSummary()
}

function resetSimulation() {
	historyBatters = []
	summaryModalBodyElement.innerHTML = ''
	reserStats()
}

function turnMachineOff() {
	startButtonElement.classList.remove('btn-primary')
	startButtonElement.classList.add('btn-outline-primary')
	startButtonElement.innerHTML = 'Encender maquina'
	clearInterval(machineInterval)
	state.isMachineOn = false
}

function checkBatterHealth() {
	if (state.currentBatter.PitchHistory.length >= config.sicknessRecoveryPitchs) {
		state.currentBatter.Sickness = SicknessTypes.none
		showBatterInfo()
	}
}

function checkBatterForChange() {
	
	if (state.currentBatter.PitchHistory.length >= config.pitchPerBatter) {
		changeBatter()
	}

	if (historyBatters.length >= config.batterPerSimulation) {
		showSummary()
	}

}

function changeBatter() {
	historyBatters.push(state.currentBatter)
	setRandomBatter()
	reserStats()
}

function showSummary() {
	turnMachineOff()
	addSicknessInfoToSummary()
	addBattersInfoToSummary()
	showSummaryDialog()
}

function addSicknessInfoToSummary() {
	let CommonSicknessElement = createMostCommonSicknessesElement(getMostCommomSicknesses());
	summaryModalBodyElement.appendChild(CommonSicknessElement);
}

function showSummaryDialog() {
	const modal = bootstrap.Modal.getOrCreateInstance(summaryDialogElement);
	modal.show();
}

function addBattersInfoToSummary() {

	let headerElement = document.createElement('h4')
	headerElement.classList.add('summaryBattersHeader')
	headerElement.innerHTML = 'Detalle de bateadores'

	summaryModalBodyElement.appendChild(headerElement);

	historyBatters.forEach(batter => {
		let batterRecordElement = createRecordElementFromBatter(batter);
		summaryModalBodyElement.appendChild(batterRecordElement)
	});
}

function createMostCommonSicknessesElement(diseasesArray) {
	let diseasesElement = document.createElement('div')

	diseasesElement.innerHTML = `
		<p><strong>Enfermedad mas comun: </strong><span>${diseasesArray.join(', ')}</span></p>
	`
	return diseasesElement
}

function getMostCommomSicknesses() {
	
	let fluCount = 0
	let hangoverCount = 0
	let badNightCount = 0

	historyBatters.forEach(batter => {
		if (batter.InitialSickness == SicknessTypes.flu) {
			fluCount++

		} else if (batter.InitialSickness == SicknessTypes.hangover) {
			hangoverCount++

		} else if (batter.InitialSickness == SicknessTypes.badNight){
			badNightCount++
		}
	})

	let max = Math.max(fluCount, hangoverCount, badNightCount)

	let commonSickness = []
	
	if (max == 0) {
		commonSickness = ['No hubieron enfermos']

	} else {
		if (fluCount == max) {
			commonSickness.push(SicknessTypes.flu)

		}
		if (hangoverCount == max) {
			commonSickness.push(SicknessTypes.hangover)

		}
		if (badNightCount == max) {
			commonSickness.push(SicknessTypes.badNight)

		}
	}

	return commonSickness
}

function createRecordElementFromBatter(batter) {

	let fastballCount = 0
	let changeCount = 0
	let curveCount = 0
	let sliderCount = 0
	let knucklesCount = 0

	let hits = batter.PitchHistory.filter(pitch => !pitch.IsFoul && pitch.WasHitted)

	hits.forEach(pitch => {
		if (pitch.Type == PitchTypes.fastball) {
			fastballCount++

		} else if (pitch.Type == PitchTypes.change) {
			changeCount++

		} else if (pitch.Type == PitchTypes.curve) {
			curveCount++

		} else if (pitch.Type == PitchTypes.slider) {
			sliderCount++

		} else {
			knucklesCount++
		}
	});

	let max = Math.max(fastballCount, changeCount, curveCount, sliderCount, knucklesCount)

	let greatters = []

	if (max == 0) {
		greatters = ['Ninguno']

	} else {

		if (fastballCount == max) {
			greatters.push(PitchTypes.fastball)

		}
		if (changeCount == max) {
			greatters.push(PitchTypes.change)

		}
		if (curveCount == max) {
			greatters.push(PitchTypes.curve)

		}
		if (sliderCount == max) {
			greatters.push(PitchTypes.slider)

		} if (knucklesCount == max) {
			greatters.push(PitchTypes.knuckles)
		}
	}

	let recordElement = document.createElement('div')
	recordElement.classList.add('batter-record', 'd-flex', 'flex-column')
	recordElement.innerHTML = `
		<p class="text-center"><strong>${batter.Name}</strong></p>
		<p><strong>%Bateo: </strong><span>${batter.HitsPercentage}</span></p>
		<p><strong>Enfermedad: </strong><span>${batter.InitialSickness}</span></p>
		<p><strong>Lanzamiento favorito: </strong><span>${greatters.join(', ')}</span></p>
	`
	return recordElement
}

function reserStats() {
	cleanField()
	updateDinamicStatistics()
}

function cleanField() {
	const balls = document.querySelectorAll('.ballContainer')
	balls.forEach(ballElement => {
		ballElement.remove()
	});
}

function setRandomBatter() {
	state.currentBatter = new Batter(
		'Player' + randomIntFromInterval(1, 1000),	//name
		getRandomHealth(), 							//health
		randomIntFromInterval(70, 100), 			//fastball
		randomIntFromInterval(60, 100), 			//change
		randomIntFromInterval(70, 90), 				//curve
		randomIntFromInterval(60, 90), 				//slider
		randomIntFromInterval(70, 100) 				//knuckles
	)
	showBatterInfo()
}

function showBatterInfo() {
	batterNameElement.innerHTML = state.currentBatter.Name
	batterHealthElement.innerHTML = state.currentBatter.Sickness + ' (-' + sickessProbabilityDecrease[state.currentBatter.Sickness] + '%)'
	fastballPercentageElement.innerHTML = state.currentBatter.Fastball + '%'
	changePercentageElement.innerHTML = state.currentBatter.Change + '%'
	curvePercentageElement.innerHTML = state.currentBatter.Curve + '%'
	sliderPercentageElement.innerHTML = state.currentBatter.Slider + '%'
	knucklesPercentageElement.innerHTML = state.currentBatter.Knuckles + '%'
}

function updateDinamicStatistics() {
	//Pitches
	let hitsCount = 0
	let foulsCount = 0
	let missedCount = 0

	state.currentBatter.PitchHistory.forEach(pitch => {
		if (!pitch.WasHitted) {
			missedCount++
		} else {
			if (pitch.IsFoul) {
				foulsCount++
			} else {
				hitsCount++
			}
		}
	});

	pitchCountElement.innerHTML = state.currentBatter.PitchHistory.length
	hitsCountElement.innerHTML = hitsCount
	foulsCountElement.innerHTML = foulsCount
	missedCountElement.innerHTML = missedCount

	let hitsPercentage = ((hitsCount / state.currentBatter.PitchHistory.length) * 100).toPrecision(4) + '%'
	state.currentBatter.HitsPercentage = hitsPercentage

	hitsPercentageElement.innerHTML = hitsPercentage

	//Batters History Count
	battersHistoryCountElement.innerHTML = historyBatters.length
}

function setCurrentPitch(pitch) {
	pitchTypeElement.innerHTML = pitch.Type
	pitchSpeedElement.innerHTML = pitch.Speed
}

async function HitBallToRandomPosition() {
	let x = randomIntFromInterval(1, 1000)
	let y = randomIntFromInterval(-100, 900)

	let isFoul = isFoulZone(x, y)

	const willBeFoul = Math.random() < config.foulProbability
	
	if (!willBeFoul && isFoul) { //should be hit but is foul
		y = y <= 110
			? randomIntFromInterval(111, 900)
			: y
		
		if (x > 500) {
			while (isFoulZone(x, y)) {
				x -= randomIntFromInterval(20, 80)
				x = x < 500 ? 500 : x
			}
		}else {
			while (isFoulZone(x, y)) {
				x += randomIntFromInterval(20, 80)
				x = x > 500 ? 500 : x
			}
		}
	} else if (willBeFoul && !isFoul) { //should be foul but is hit

		if (x > 500) {
			while (!isFoulZone(x, y)) {
				x += randomIntFromInterval(20, 80)
			}
		} else {
			while (!isFoulZone(x, y)) {
				x -= randomIntFromInterval(20, 80)
			}
		}
	}
	
	//todo: try to use the id of the pitch to avoid creating a new div for the ball
	let ball = createBallElement()
	fieldContainer.appendChild(ball)
	ball.id = crypto.randomUUID()

	ball.classList.add('flying')

	ball.firstChild.classList.add('flying')
	ball.style.bottom = '115px'
	ball.style.left = '493px'

	await sleep(50)
	sleep(1000).then(() => {
		ball.classList.remove('flying')
	})

	ball.style.bottom = `${y}px`
	ball.style.left = `${x}px`

	return isFoulZone(x, y)
}

function playBatSound() {
	var audio = new Audio('hit.mp3');
	audio.play();
}

function isFoulZone(x2, y2) {
	const y1 = 110
	const x1 = 500

	if (y2 < y1) {
		return true
	}

	const angleRad = Math.atan((y2 - y1) / (x2 - x1))
	const angle = (angleRad * 180 / Math.PI) * -1;


	if (angle > -45 && angle < 45) {
		return true
	}

	return false
}

function getRandomHealth() {
	let isSick = Math.random() > 1 - config.sickPlayerProbability

	if (!isSick) {
		return SicknessTypes.none
	}

	let sicknessNumber = randomIntFromInterval(1, 3)

	if (sicknessNumber == 1) {
		return SicknessTypes.flu

	} else if (sicknessNumber == 2) {
		return SicknessTypes.hangover

	} else {
		return SicknessTypes.badNight
	}
}

async function pitchAndSwing() {
	let pitch = await throwBall()
	await state.currentBatter.swing(pitch)
}

function createBallElement(pitch = null) {
	let ballContainer = document.createElement('div')
	ballContainer.classList.add('ballContainer')

	pitch ? ballContainer.classList.add('released' + pitch.Speed) : ''

	let ball = document.createElement('div')
	ball.classList.add('obj', 'ball')
	ballContainer.appendChild(ball)
	return ballContainer
}

async function throwBall() {
	let pitch = getRandomPitch()
	setCurrentPitch(pitch)

	let ball = createBallElement(pitch)

	fieldContainer.appendChild(ball)

	await sleep(50)
	ball.firstChild.style.transform = 'rotate(360deg)'

	let ballDuration = 700 + ((10 - (pitch.Speed / 10) ) * 70)

	await sleep(ballDuration - 50)
	ball.remove();
	
	return pitch
}


function getRandomPitch() {
	let pitchNumber = randomIntFromInterval(1, 5)
	let pitchType

	if (pitchNumber == 1) {
		pitchType = PitchTypes.fastball

	} else if (pitchNumber == 2) {
		pitchType = PitchTypes.change
		
	} else if (pitchNumber == 3) {
		pitchType = PitchTypes.curve

	} else if (pitchNumber == 4) {
		pitchType = PitchTypes.slider

	} else {
		pitchType = PitchTypes.knuckles
	}

	let speed = randomIntFromInterval(5, 10) * 10

	return new Pitch(pitchType, speed)
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}