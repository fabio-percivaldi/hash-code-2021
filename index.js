'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const lset = require('lodash.set')
const lget = require('lodash.get')

const [,,filepath] = process.argv

const filename = path.basename(filepath)
const intersections = {}
const streets = {}

var filestream = fs.createReadStream(filepath ?? './input/a.txt');
const rl = readline.createInterface(filestream)

let duration, intersectionsCount, streetsCount, carsCount, score

const getCarScore = () => {
    return 0
}

const addStreet = (street, intersections, streets) => {
    const [start, end, streetName, mileage] = street.split(' ')
    lset(intersections, [start, 'output', streetName], mileage)
    lset(intersections, [start, 'output', streetName, 'queue'], [])
    lset(intersections, [end, 'input', streetName], mileage)
    lset(intersections, [end, 'input', streetName, 'queue'], [])
    lset(streets, streetName, { start, end, mileage })
}

const addCar = (car, index, intersections, streets) => {
    const streetsPath = car.split(' ')
    const [, streetName] = streetsPath
    const intersectionId = lget(streets, [streetName, 'end'], null)
    const intersection = lget(intersections, [intersectionId, 'input', streetName, 'queue'])
    intersection.push({ carId: index, score: getCarScore(), nextHop: streetsPath.slice(2) })
}

let index = -1
let carId = -1

rl.on('line', (line) => {
    index += 1
    if(index === 0) {
        [duration, intersectionsCount, streetsCount, carsCount, score] = line.split(' ')
        duration = parseInt(duration)
        intersectionsCount = parseInt(intersectionsCount)
        streetsCount = parseInt(streetsCount)
        carsCount = parseInt(carsCount)
        return
    }
    if(index <= streetsCount) {
        addStreet(line, intersections, streets)
        return
    }
    carId += 1
    addCar(line, carId, intersections, streets)
});

const computeSchedule = () => {
    const schedule = {}
    Object.keys(intersections).forEach(intersectionId => {
        schedule[intersectionId] = []
        Object.keys(intersections[intersectionId].input).forEach(routeName => {
            schedule[intersectionId].push({ routeName, duration: 1})
        })
    })
    fs.writeFileSync(path.join(__dirname, 'output', filename), '')
    fs.appendFileSync(path.join(__dirname, 'output', filename), `${Object.keys(schedule).length.toString()}\r\n`)

    Object.keys(schedule).forEach(intersectionScheduleId => { 
        fs.appendFileSync(path.join(__dirname, 'output', filename), `${intersectionScheduleId.toString()}\r\n`)
        fs.appendFileSync(path.join(__dirname, 'output', filename), `${schedule[intersectionScheduleId].length.toString()}\r\n`)

        schedule[intersectionScheduleId].forEach(street => {
            fs.appendFileSync(path.join(__dirname, 'output', filename), `${[street.routeName, street.duration].join(' ')}\r\n`)
        })
    })
}
rl.on('close', () => {
    computeSchedule()
})