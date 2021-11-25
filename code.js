'use strinct';

class Pitch {
	constructor(type, speed) {
		this.Type = type
		this.Speed = speed
		this.WasHitted = false
	}
}

class Batter {

	constructor(name, sickness, fastball, change, curve, slider, knuckles) {
		this.Name = name
		this.Sickness = sickness
		this.Fastball = fastball
		this.Change = change
		this.Curve = curve
		this.Slider = slider
		this.Knuckles = knuckles
		this.PitchHistory = []
	}

	async swing(pitch) {
		let contactProbability = this.getContactProbability(pitch, this)
		const willHitTheBall = Math.random() > 1 - (contactProbability / 100)

		if (willHitTheBall) {
			console.log('hitted');
			await moveBallToRandomPosition()
		} else {
			console.log('---not hitted---');
		}

		const batterElement = document.querySelector('.batter');
		batterElement.style.transform = 'rotate(-90deg)'
		await sleep(400)
		batterElement.style.transform = 'rotate(0deg)'
	}

	getContactProbability(pitch, batter) {
		let probabilityPercentage = batter[pitch.Type]
		probabilityPercentage -= sickessProbabilityDecrease[batter.Sickness]
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
	sickPlayerProbability: 0.40
}

const sickessProbabilityDecrease = {
	flu: 5,
	hangover: 10,
	badNight: 20,
	none: 0
}

const state = {
	currentBatter : null
}

const fieldContainer = document.querySelector('.field-container');
const foulzoneLeft = document.querySelector('.foulzone-left');
const foulzoneRight = document.querySelector('.foulzone-right');
const ball = document.querySelector('.ball');

main()

function main() {
	setRandomBatter()
	// setInterval(() => {
	// 	pitchAndSwing()
	// }, 2000);
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
}

async function moveBallToRandomPosition() {
	let x = randomIntFromInterval(1, 1000)
	let y = randomIntFromInterval(1, 1000)

	//todo: try to use the id of the pitch to avoid creating a new div for the ball

	let ball = document.createElement('div')
	fieldContainer.appendChild(ball)
	ball.id = crypto.randomUUID()
	ball.classList.add('obj', 'ball', 'flying')
	ball.style.top = '718px'
	ball.style.left = '493px'

	await sleep(50)
	ball.style.top = `${y}px`
	ball.style.left = `${x}px`

	let isFoul = isFoulPitch(x, y)
}

function isFoulPitch(x2, y2) {
	const y1 = 735
	const x1 = 500

	if (y2 > y1) {
		console.log('foul y')
		return true
	}

	const angleRad = Math.atan((y2 - y1) / (x2 - x1))
	const angle = (angleRad * 180 / Math.PI) * -1;


	if (angle > -45 && angle < 45) {
		console.log('foul')
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

async function throwBall() {
	let pitch = getRandomPitch()

	let ball = document.createElement('div')
	ball.classList.add('obj','ball', 'released'+pitch.Speed)

	fieldContainer.appendChild(ball)

	let ballDuration = 700 + ((10 - (pitch.Speed / 10) ) * 70)

	await sleep(ballDuration)
	ball.remove();
	
	return pitch
}


function isFoul() {
	
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