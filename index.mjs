#!/usr/bin/env node

import process from "node:process"
import { emitKeypressEvents } from "node:readline"

// constants
const Direction = {
    RIGHT: "right",
    LEFT: "left",
    UP: "up",
    DOWN: "down"
}

const Color = {
    BLACK: "\x1b[30m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m"
}

const RightKeys = ["right", "d", "l"]
const LeftKeys = ["left", "a", "h"]
const UpKeys = ["up", "w", "k"]
const DownKeys = ["down", "s", "j"]

const gridWidth = 30
const gridHeight = Math.floor(gridWidth / 2)

// game states 
let snake = {
    body: [],
    currentDirection: "",
    addBody: false
}

let food = {
    x: 9,
    y: 9
}

const borderPositions = {
    top: [],
    right: [],
    bottom: [],
    left: []
}

//start
initializeGameStates()
setUpTerminal()
drawBorders()

setInterval(() => { //game loop
    update();
}, 200)

process.stdin.on("keypress", (_, key) => {
    if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        gameOver()
    }

    if (RightKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.LEFT) {
            snake.currentDirection = Direction.RIGHT
        }
    }

    if (LeftKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.RIGHT) {
            snake.currentDirection = Direction.LEFT
        }
    }

    if (UpKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.DOWN) {
            snake.currentDirection = Direction.UP
        }
    }

    if (DownKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.UP) {
            snake.currentDirection = Direction.DOWN
        }
    }
})

function update() {
    const snakeHeadX = snake.body[0][0]
    const snakeHeadY = snake.body[0][1]

    // food collision
    if (snakeHeadX === food.x && snakeHeadY === food.y) {
        generateFood()
        snake.addBody = true
    }

    // body collision 
    for (let i = 1; i < snake.body.length; i++) {
        const [x, y] = snake.body[i]

        if (snakeHeadX === x && snakeHeadY === y) {
            gameOver()
        }
    }

    // border collision
    if (snakeHeadX <= 1 || snakeHeadX >= gridWidth || snakeHeadY <= 1 || snakeHeadY >= gridHeight) {
        gameOver()
    }

    render()
}

function render() {
    console.clear()
    setColor(Color.YELLOW)
    process.stdout.cursorTo(1, 0)
    process.stdout.write(`Score: ${snake.body.length - 1}        High Score: ${0}`)
    // process.stdout.write(`food x: ${food.x}, food y: ${food.y} --- `)
    // process.stdout.write(`snakeHead: ${snake.body[0][0]}, ${snake.body[0][1]} ---`)
    // process.stdout.write(`currentDirection: ${snake.currentDirection} ---`)
    // process.stdout.write(`size: ${snake.body.length} ---`)

    const snakeHead = snake.body[0]
    let newSnakeHead

    if (snake.addBody) {
        snake.body.push([snake.body[snake.body.length - 1].x, snake.body[snake.body.length - 1].y]);
        snake.addBody = false;
    }

    if (snake.currentDirection) {
        switch (snake.currentDirection) {
            case Direction.RIGHT:
                newSnakeHead = [snakeHead[0] + 1, snakeHead[1]]
                break;
            case Direction.LEFT:
                newSnakeHead = [snakeHead[0] - 1, snakeHead[1]]
                break;
            case Direction.UP:
                newSnakeHead = [snakeHead[0], snakeHead[1] - 1]
                break;
            case Direction.DOWN:
                newSnakeHead = [snakeHead[0], snakeHead[1] + 1]
                break;
        }

        snake.body.unshift(newSnakeHead)
        snake.body.pop()
    }

    // render snake
    setColor(Color.GREEN)
    for (const [x, y] of snake.body) {
        process.stdout.cursorTo(x, y);
        process.stdout.write("█");
    }

    // render food
    setColor(Color.RED)
    process.stdout.cursorTo(food.x, food.y)
    process.stdout.write("█");

    drawBorders()
}

function initializeGameStates() {
    for (let i = 1; i <= gridWidth; i++) {
        borderPositions.top.push([i, 1])
        borderPositions.bottom.push([i, gridHeight])
    }

    for (let i = 1; i <= gridHeight; i++) {
        borderPositions.left.push([1, i])
        borderPositions.right.push([gridWidth, i])
    }

    const x = Math.floor(gridWidth / 2)
    const y = Math.floor(gridHeight / 2)
    snake.body.push([x, y])
}

function drawBorders() {
    for (const direction in borderPositions) {
        for (const [x, y] of borderPositions[direction]) {
            process.stdout.cursorTo(x, y)
            setColor(Color.BLUE)
            process.stdout.write("█")
        }
    }
}

function setUpTerminal() {
    // set up terminal for reading key presses
    process.stdin.setRawMode(true)
    emitKeypressEvents(process.stdin)

    // use terminal alternate screen
    process.stdout.write("\x1b[?1049h")

    // hide cursor
    process.stdout.write("\x1b[?25l")
}

function gameOver() {
    process.exit()
}

function generateFood() {
    while (true) {
        const x = Math.floor(Math.random() * (gridWidth - 2)) + 2;
        const y = Math.floor(Math.random() * (gridHeight - 2)) + 2;

        food.x = x
        food.y = y

        let collision = false;
        for (const [x, y] of snake.body) {
            if (x === food.x && y === food.y) {
                collision = true;
                break;
            }
        }

        if (!collision) {
            break;
        }
    }

}

function setColor(color) {
    process.stdout.write(color)
}

update()

