'use strict'

const fs = require('fs')
const readline = require('readline')
const lset = require('lodash.set')
const lget = require('lodash.get')

const [,,filename] = process.argv


const intersections = {}
const streets = {}

var filestream = fs.createReadStream(filename);
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

rl.on('close', () => {
    console.log('||||||||||', JSON.stringify(intersections))
    console.log('||||||||||', JSON.stringify(streets))
})