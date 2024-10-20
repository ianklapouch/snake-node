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
const gridHeight = Math.round(gridWidth / 2)

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

// start
initializeGameStates()
setUpTerminal()
drawBorders()

// game loop
let horizontalInterval
let verticalInterval

const horizontalSpeed = 75
const verticalSpeed = 150

function startGameLoop() {
    if (horizontalInterval) clearInterval(horizontalInterval);
    if (verticalInterval) clearInterval(verticalInterval);

    horizontalInterval = setInterval(() => {
        if (snake.currentDirection === Direction.LEFT || snake.currentDirection === Direction.RIGHT) {
            update();
        }
    }, horizontalSpeed);

    verticalInterval = setInterval(() => {
        if (snake.currentDirection === Direction.UP || snake.currentDirection === Direction.DOWN) {
            update();
        }
    }, verticalSpeed);
}

process.stdin.on("keypress", (_, key) => {
    if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        exit()
    }

    let directionChanged = false

    if (RightKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.LEFT) {
            snake.currentDirection = Direction.RIGHT
            directionChanged = true
        }
    }

    if (LeftKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.RIGHT) {
            snake.currentDirection = Direction.LEFT
            directionChanged = true
        }
    }

    if (UpKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.DOWN) {
            snake.currentDirection = Direction.UP
            directionChanged = true
        }
    }

    if (DownKeys.includes(key.name)) {
        if (snake.currentDirection !== Direction.UP) {
            snake.currentDirection = Direction.DOWN
            directionChanged = true
        }
    }

    if (directionChanged) {
        forceRender()
    }
})

function clearGameLoop() {
    clearInterval(horizontalInterval)
    clearInterval(verticalInterval)
}

function forceRender() {
    clearGameLoop()
    startGameLoop()
    update()
}

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
    drawInfo()

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
        process.stdout.write("██");
    }

    // render food
    setColor(Color.RED)
    process.stdout.cursorTo(food.x, food.y)
    process.stdout.write("██");
    // process.stdout.write("🍎");

    drawBorders()
}

function initializeGameStates() {
    borderPositions.top = []
    borderPositions.bottom = []
    borderPositions.left = []
    borderPositions.right = []

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

    snake.body = []
    snake.currentDirection = ""
    snake.body.push([x, y])
}

function drawInfo() {
    setColor(Color.YELLOW)

    // score
    process.stdout.cursorTo(2, 0)
    process.stdout.write(`SCORE: ${snake.body.length - 1}      HIGH SCORE: ${0}`)

    // controls
    const constrolsInfoX = gridWidth + 2
    const constrolsInfoY = 2

    process.stdout.cursorTo(constrolsInfoX, constrolsInfoY)
    process.stdout.write("CONTROLS:")

    process.stdout.cursorTo(constrolsInfoX + 2, constrolsInfoY + 2)
    process.stdout.write("MOVE:")

    process.stdout.cursorTo(constrolsInfoX + 5, constrolsInfoY + 4)
    process.stdout.write("↑")

    process.stdout.cursorTo(constrolsInfoX + 3, constrolsInfoY + 5)
    process.stdout.write("←")

    process.stdout.cursorTo(constrolsInfoX + 5, constrolsInfoY + 5)
    process.stdout.write("↓")

    process.stdout.cursorTo(constrolsInfoX + 7, constrolsInfoY + 5)
    process.stdout.write("→")

    process.stdout.cursorTo(constrolsInfoX + 15, constrolsInfoY + 4)
    process.stdout.write("W")

    process.stdout.cursorTo(constrolsInfoX + 13, constrolsInfoY + 5)
    process.stdout.write("A")

    process.stdout.cursorTo(constrolsInfoX + 15, constrolsInfoY + 5)
    process.stdout.write("S")

    process.stdout.cursorTo(constrolsInfoX + 17, constrolsInfoY + 5)
    process.stdout.write("D")

    process.stdout.cursorTo(constrolsInfoX + 25, constrolsInfoY + 4)
    process.stdout.write("K")

    process.stdout.cursorTo(constrolsInfoX + 23, constrolsInfoY + 5)
    process.stdout.write("J")

    process.stdout.cursorTo(constrolsInfoX + 25, constrolsInfoY + 5)
    process.stdout.write("H")

    process.stdout.cursorTo(constrolsInfoX + 27, constrolsInfoY + 5)
    process.stdout.write("L")

    // exit
    process.stdout.cursorTo(constrolsInfoX + 2, constrolsInfoY + 7)
    process.stdout.write("EXIT:")

    process.stdout.cursorTo(constrolsInfoX + 3, constrolsInfoY + 9)
    process.stdout.write("CTRL + C")

    process.stdout.cursorTo(constrolsInfoX + 23, constrolsInfoY + 9)
    process.stdout.write("ESC")
}

function drawBorders() {
    let char = ""

    setColor(Color.BLUE)

    for (const [x, y] of borderPositions.left) {
        char = "│"
        process.stdout.cursorTo(x, y)
        process.stdout.write(char)
    }

    for (const [x, y] of borderPositions.right) {
        char = "│"
        process.stdout.cursorTo(x, y)
        process.stdout.write(char)
    }

    for (let i = 0; i < borderPositions.top.length; i++) {
        const [x, y] = borderPositions.top[i]

        if (i === 0) {
            char = "┌"
        } else if (i === borderPositions.top.length - 1) {
            char = "┐"
        } else {
            char = "─"
        }

        process.stdout.cursorTo(x, y)
        process.stdout.write(char)
    }

    for (let i = 0; i < borderPositions.bottom.length; i++) {
        const [x, y] = borderPositions.bottom[i]

        if (i === 0) {
            char = "└"
        } else if (i === borderPositions.bottom.length - 1) {
            char = "┘"
        } else {
            char = "─"
        }

        process.stdout.cursorTo(x, y)
        process.stdout.write(char)
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

function exit() {
    // switch back to regular terminal screen
    process.stdout.write("\x1b[?1049l")

    // restore cursor
    process.stdout.write("\x1b[?25h")

    process.exit()
}

function gameOver() {
    clearGameLoop()
    initializeGameStates()
    setUpTerminal()
    drawBorders()
    startGameLoop()
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

startGameLoop()
update()
