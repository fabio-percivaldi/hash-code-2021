'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const lset = require('lodash.set')
const lget = require('lodash.get')

const [,,filepath] = process.argv

const filename = path.basename(filepath  ?? './input/d.txt')
const intersections = {}
const streets = {}

var filestream = fs.createReadStream(filepath ?? './input/d.txt');
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
    const [pathLength] = streetsPath
    for(let i = 1; i < parseInt(pathLength); i++) {
        const streetName = streetsPath[i]
        const intersectionId = lget(streets, [streetName, 'end'], null)
        const intersection = lget(intersections, [intersectionId, 'input', streetName, 'queue'])
        intersection.push({ carId: index, score: getCarScore(), nextHop: streetsPath.slice(2) })
    }
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

// "0": {
//     "input": {
//       "rue-de-londres": {
//         "queue": [
//           {
//             "carId": 0,
//             "score": 0,
//             "nextHop": [
//               "rue-d-amsterdam",
//               "rue-de-moscou",
//               "rue-de-rome"
//             ]
//           }
//         ]
//       }
//     },
//     "output": {
//       "rue-d-amsterdam": {
//         "queue": [
          
//         ]
//       }
//     }
//   }

// "rue-de-londres": {
//     "start": "2",
//     "end": "0",
//     "mileage": "1"
//   }

// {
//     '0': [ { routeName: 'rue-de-londres', duration: 1 } ],
//     '1': [
//       { routeName: 'rue-d-amsterdam', duration: 1 },
//       { routeName: 'rue-d-athenes', duration: 1 }
//     ],
//     '2': [ { routeName: 'rue-de-moscou', duration: 1 } ],
//     '3': [ { routeName: 'rue-de-rome', duration: 1 } ]
//   }
const computeSchedule = () => {
    const schedule = {}
    Object.keys(intersections).forEach(intersectionId => {
        schedule[intersectionId] = []
        Object.entries(intersections[intersectionId].input).forEach(([routeName, routObj]) => {
            const duration = routObj.queue.length === 0 ? 1 : routObj.queue.length
            schedule[intersectionId].push({ routeName, duration})
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