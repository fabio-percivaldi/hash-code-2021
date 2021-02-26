'use strict'

const fs = require('fs')
const readline = require('readline')
const lset = require('lodash.set')

const [,,filename] = process.argv


const intersections = {}
const streets = {}

var filestream = fs.createReadStream(filename);
const rl = readline.createInterface(filestream)

let duration, intersectionsCount, streetsCount, carsCount, score

const addStreet = (street, intersections, streets) => {
    const [start, end, streetName, mileage] = street.split(' ')
    lset(intersections, [start, 'output', streetName], mileage)
    lset(intersections, [end, 'input', streetName], mileage)
    lset(streets, streetName, { start, end, mileage })
}

const addCar = (car, intersections, streets) => {
    
}
let rowCount = -1

rl.on('line', (line) => {
    rowCount += 1
    if(rowCount === 0) {
        [duration, intersectionsCount, streetsCount, carsCount, score] = line.split(' ')
        return
    }
    if(rowCount <= streetsCount) {
        addStreet(line, intersections, streets)
        return
    }
    addCar(line, intersections, streets)
});

rl.on('close', () => {
    console.log('||||||||||', JSON.stringify(intersections))
    console.log('||||||||||', JSON.stringify(streets))
})