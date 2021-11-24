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
}

const PitchTypes = {
	fastball: 'fastball',
	change: 'change',
	curve: 'curve',
	slider: 'slider',
	knuckles: 'knuckles'
}

const SicknessTypes = {
	fastball: 'fastball',
	change: 'change',
	curve: 'curve',
	slider: 'slider',
	knuckles: 'knuckles'
}

const config = {

}

const fieldContainer = document.querySelector('.field-container');
const foulzoneLeft = document.querySelector('.foulzone-left');
const foulzoneRight = document.querySelector('.foulzone-right');
const ball = document.querySelector('.ball');

main()

function main() {
	//throwBall *
	//swing

}

function pitchAndSwing() {
	let pitch = await throwBall()
	//I was here. hit the ball
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