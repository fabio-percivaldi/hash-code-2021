'use strict'
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const lset = require('lodash.set')
const lget = require('lodash.get')
const lomitBy = require('lodash.omitby')

const inputFileNames = ['a.txt', 'b.txt', 'c.txt', 'd.txt', 'e.txt', 'f.txt']
const readFileAndComputeSchedule = (filename) => {
    const intersections = {}
    const streets = {}

    var filestream = fs.createReadStream(path.join(__dirname, 'input', filename));
    const rl = readline.createInterface(filestream)

    let totalDuration, intersectionsCount, streetsCount, carsCount, score

    const getCarMileage = (streetsPath) => {
        return streetsPath.reduce((acc, curr) => {
            const { mileage } = streets[curr]
            return acc + parseInt(mileage)
        }, 0)
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

        for (let i = 1; i < parseInt(pathLength); i++) {
            const streetName = streetsPath[i]
            const intersectionId = lget(streets, [streetName, 'end'], null)
            const intersectionQueue = lget(intersections, [intersectionId, 'input', streetName, 'queue'])
            const mileage = getCarMileage(streetsPath.slice(1))
            if(mileage <= totalDuration) {
                intersectionQueue.push({ carId: index, nextHop: streetsPath.slice(2), stepCounter: i })
            } else {
                skippedCard += 1
            }
        }
    }

    let index = -1
    let carId = -1
    let skippedCard = 0
    rl.on('line', (line) => {
        index += 1
        if (index === 0) {
            [totalDuration, intersectionsCount, streetsCount, carsCount, score] = line.split(' ')
            totalDuration = parseInt(totalDuration)
            intersectionsCount = parseInt(intersectionsCount)
            streetsCount = parseInt(streetsCount)
            carsCount = parseInt(carsCount)
            return
        }
        if (index <= streetsCount) {
            addStreet(line, intersections, streets)
            return
        }
        carId += 1
        addCar(line, carId, intersections, streets)
    });

    const computeSchedule = () => {
        let schedule = {}
        let totalPassingThroughCarsCounter = 0
        let streetLightCount = 0
        // calcolo del totale delle macchine che passano per ogni nodo
        Object.keys(intersections).forEach(intersectionId => {
            streetLightCount += Object.values(intersections[intersectionId].input).length
            Object.values(intersections[intersectionId].input).forEach(routeObj => {
                const { queue } = routeObj
                totalPassingThroughCarsCounter += queue.length
            })
        })
        const averageCarPerTrafficLight = totalPassingThroughCarsCounter / streetLightCount
        Object.keys(intersections).forEach(intersectionId => {
            schedule[intersectionId] = []
            Object.entries(intersections[intersectionId].input).forEach(([routeName, routeObj]) => {
                const { queue } = routeObj
                if(queue.length === 0) {
                    return
                }
                // non ha molto senso attualmente questo check andrebbe rivisto
                // if(queue.length === 1 && averageCarPerTrafficLight > 5) {
                //     return
                // }
                const totalCarCount = queue.length === 1 ? 2 : queue.length
                const duration = Math.floor(Math.log2(totalCarCount))
                if (duration === 0) {
                    return
                }
                const initialQueue = queue.filter(car => car.stepCounter === 1)
                schedule[intersectionId].push({ routeName, duration, initialQueueLenght: initialQueue.length })
                // ordino per la strada con più macchina in coda
                schedule[intersectionId] = schedule[intersectionId].sort((schedule1, schedule2) => {
                    if(schedule1.initialQueueLenght > schedule2.initialQueueLenght) {
                        return -1
                    }
                    if(schedule1.initialQueueLenght < schedule2.initialQueueLenght) {
                        return 1
                    }
                    return 0
                })
            })
        })
        schedule = lomitBy(schedule, (obj) => {
            return obj.length === 0
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
        console.log('||||||||', skippedCard)
    })
}
inputFileNames.forEach(filename => {
    readFileAndComputeSchedule(filename)
})
