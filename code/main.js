import kaboom from "kaboom"
import big from "./big"
import patrol from "./patrol"
import loadAssets from "./assets"

kaboom({
    background: [51, 151, 255] // The RGB code
})
loadAssets()

// define some constants
const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

let hasstar = false;
console.log(hasstar);

const LEVELS = [
    [
        "          $$$$             ",
        "                           ",
        "      %                    ",
        "                           ",
        "                           ",
        "                           ",
        "    _%_%_                  ",
        "                           ",
        "                           ",
        "                ~  > >   @=",
        "===========================",
    ],
    [
        "     $    $    $          $",
        "     $    $    $          $",
        "                    _      ",
        "                   __      ",
        "                  ___      ",
        "                 ____      ",
        "                _____      ",
        "     >    >    ______     @",
        "===========================",
    ],
    [
        "       $$$$$               ",
        "       _____               ",
        "                           ",
        "                $$$        ",
        "               _____       ",
        "   _%_                     ",
        "                           ",
        "      >  >  >  >         @=",
        "===========================",
    ],
    [
        "        $$$$$              ",
        "       _______             ",
        "                           ",
        "                           ",
        "    >                      ",
        "   _%_                     ",
        "                           ",
        "             =     $$$$  @=",
        "==============   ==========",
    ],
    [
        "                           ",
        "       __                  ",
        "      ____                 ",
        "      _  _                 ",
        "    ___  ___               ",
        "    ________               ",
        "    ___  ___               ",
        "    ___  ___    $$$$     @=",
        "===========================",
    ],
    [
        "               ____        ",
        "              __  __       ",
        "              __ ;__       ",
        "             ________      ",
        "            ____  ____     ",
        " _%_        ____  ____     ",
        "            ____  ____     ",
        "=        :  ____  ____    =",
        "===========================",
    ]
]

// define what each symbol means in the level graph
const levelConf = {
    // grid size
    width: 64,
    height: 64,
    // define each object as a list of components
    "=": () => [
        sprite("brick"),
        area(),
        solid(),
        origin("bot"),
    ],
    "$": () => [
        sprite("coin"),
        area(),
        pos(0, -9),
        origin("bot"),
        "coin",
    ],
    "%": () => [
        sprite("mysterybox"),
        area(),
        solid(),
        origin("bot"),
        "prize",
    ],
    "#": () => [
        sprite("mushroom"),
        area(),
        origin("bot"),
        body(),
        "mushroom",
    ],
    ">": () => [
        sprite("goomba"),
        area(),
        origin("bot"),
        body(),
        patrol(),
        "enemy",
    ],
    "@": () => [
        sprite("flag"),
        area({ scale: 0.5, }),
        origin("bot"),
        pos(0, -12),
        "flag",
    ],
    "_": () => [
        sprite("flyingbrick"),
        area(),
        solid(),
        origin("bot"),
        "flyingbrick"
    ],
    "~": () => [
        sprite("pipe"),
        area(),
        solid(),
        origin("bot"),
        "pipe"
    ],
    ";": () => [
        sprite("peach"),
        area(),
        origin("bot"),
        body(),
        patrol(),
        "peach"
    ],
    ":": () => [
        sprite("bowser"),
        area(),
        origin("bot"),
        body(),
        patrol(),
        "bowser"
    ]
}

const HIDDENLEVELS = [
    [
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "            ````         ~ ",
        "===========================",
    ]
]

const hiddenLevelConf = {
    // grid size
    width: 64,
    height: 64,
    // define each object as a list of components
    "=": () => [
        sprite("brick"),
        area(),
        solid(),
        origin("bot"),
    ],
    "$": () => [
        sprite("coin"),
        area(),
        pos(0, -9),
        origin("bot"),
        "coin",
    ],
    "%": () => [
        sprite("mysterybox"),
        area(),
        solid(),
        origin("bot"),
        "prize",
    ],
    "#": () => [
        sprite("mushroom"),
        area(),
        origin("bot"),
        body(),
        "mushroom",
    ],
    ">": () => [
        sprite("goomba"),
        area(),
        origin("bot"),
        body(),
        patrol(),
        "enemy",
    ],
    "@": () => [
        sprite("flag"),
        area({ scale: 0.5, }),
        origin("bot"),
        pos(0, -12),
        "flag",
    ],
    "_": () => [
        sprite("flyingbrick"),
        area(),
        solid(),
        origin("bot"),
    ],
    "~": () => [
        sprite("pipe"),
        area(),
        solid(),
        origin("bot"),
        "pipe"
    ],
    "`": () => [
        sprite("star"),
        area(),
        solid(),
        origin("bot"),
        "star"
    ],
    "|": () => [
        sprite("bomb"),
        area(),
        origin("bot"),
        body(),
        "bomb",
    ]
}

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

    gravity(3200)

    // add level to scene
    const level = addLevel(LEVELS[levelId ?? 0], levelConf)

    // define player object
    const player = add([
        sprite("mario"),
        pos(0, 0),
        area(),
        scale(1),
        // makes it fall to gravity and jumpable
        body(),
        // the custom component we defined above
        big(),
        origin("bot"),
        health(3),
    ])

    // action() runs every frame
    player.onUpdate(() => {
        // center camera to player
        camPos(player.pos)
        // check fall death
        if (player.pos.y >= FALL_DEATH) {
            go("lose")
        }
    })

    // if player onCollide with any obj with "danger" tag, lose
    player.onCollide("danger", () => {
        go("lose")
        play("hit")
    })

    player.onCollide("pipe", () => {
        if (!player.isGrounded()) {
            go("hidden")
            play("hit")
        }
    })

    player.onCollide("flag", () => {
        play("portal")
        if (levelId + 1 < LEVELS.length) {
            hasstar = false;
            go("game", {
                levelId: levelId + 1,
                coins: coins,
            })
        } else {
            go("win")
        }
    })

    player.onGround((l) => {
        if (l.is("enemy")) {
            player.jump(JUMP_FORCE * 1.5)
            destroy(l)
            addKaboom(player.pos)
            play("powerup")
        }
    });

    player.onCollide("enemy", (e, col) => {
        if (hasstar == true) {
            destroy(e)
            addKaboom(player.pos)
        } else {
            play("hit")
            go("lose")
        }
        // if it's not from the top, die
    })

    let hasmushroom = false

    // grow an mushroom if player's head bumps into an obj with "prize" tag
    player.onHeadbutt((obj) => {
        if (obj.is("prize") && !hasmushroom) {
            const mushroom = level.spawn("#", obj.gridPos.sub(0, 1))
            mushroom.jump()
            hasmushroom = true
            play("blip")
        }
    })

    // player grows big onCollide with an "mushroom" obj
    player.onCollide("mushroom", (a) => {
        destroy(a)
        // as we defined in the big() component
        player.biggify(10)
        hasmushroom = false
        play("powerup")
    })

    player.onCollide("peach", () => {
        play("hit"),
        go("win")
    })

    let coinPitch = 0

    onUpdate(() => {
        if (coinPitch > 0) {
            coinPitch = Math.max(0, coinPitch - dt() * 100)
        }
    })

    player.onCollide("coin", (c) => {
        destroy(c)
        play("coin", {
            detune: coinPitch,
        })
        coinPitch += 100
        coins += 1
        coinsLabel.text = coins
    })


    const coinsLabel = add([
        text(coins),
        pos(24, 24),
        fixed(),
    ])

    // jump with space
    onKeyPress("space", () => {
        // these 2 functions are provided by body() component
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyPress("up", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyPress("w", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyDown("left", () => {
        player.move(-MOVE_SPEED, 0)
    })

    onKeyDown("a", () => {
        player.move(-MOVE_SPEED, 0)
    })

    onKeyDown("right", () => {
        player.move(MOVE_SPEED, 0)
    })

    onKeyDown("d", () => {
        player.move(MOVE_SPEED, 0)
    })

    onKeyPress("down", () => {
        player.weight = 3
    })

    onKeyPress("s", () => {
        player.weight = 3
    })

    onKeyRelease("down", () => {
        player.weight = 1
    })

    onKeyRelease("s", () => {
        player.weight = 1
    })

    onKeyPress("f", () => {
        fullscreen(!fullscreen())
    })

    onKeyPress("e", () => {
        if (player.isGrounded()) {
            destroyAll("bowser")
            destroyAll("flyingbrick")
        }
    })

})

scene("lose", () => {
    add([
        text("You Lose"),
    ])
    onKeyPress(() => go("game"))
})

scene("win", () => {
    add([
        text("You Win"),
    ])
    onKeyPress(() => go("game"))
})

// change so that the level and levelconfig is outside of the scene and then do it the same way as the normal levels



scene("hidden", ({ hiddenLevelId } = { hiddenLevelId: 0 }) => {

    gravity(3200)
    // add level to scene
    const level = addLevel(HIDDENLEVELS[hiddenLevelId ?? 0], hiddenLevelConf)

    const player = add([
        sprite("mario"),
        pos(0, 0),
        area(),
        scale(1),
        // makes it fall to gravity and jumpable
        body(),
        // the custom component we defined above
        big(),
        origin("bot"),
        health(3),
    ])

    player.onUpdate(() => {
        // center camera to player
        camPos(player.pos)
        // check fall death
        if (player.pos.y >= FALL_DEATH) {
            go("lose")
        }
    })

    // jump with space
    onKeyPress("space", () => {
        // these 2 functions are provided by body() component
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyPress("up", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyPress("w", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE)
        }
    })

    onKeyDown("left", () => {
        player.move(-MOVE_SPEED, 0)
    })

    onKeyDown("a", () => {
        player.move(-MOVE_SPEED, 0)
    })

    onKeyDown("right", () => {
        player.move(MOVE_SPEED, 0)
    })

    onKeyDown("d", () => {
        player.move(MOVE_SPEED, 0)
    })

    onKeyPress("down", () => {
        player.weight = 3
    })

    onKeyPress("s", () => {
        player.weight = 3
    })

    onKeyRelease("down", () => {
        player.weight = 1
    })

    onKeyRelease("s", () => {
        player.weight = 1
    })

    onKeyPress("f", () => {
        fullscreen(!fullscreen())
    })

    player.onCollide("pipe", () => {
        go("game")
        play("hit")

    })

    player.onCollide("star", (s) => {
        destroy(s)
        play("powerup")
        player.biggify(5)
        player.heal(2)
        hasstar = true;
        console.log(hasstar);
    })




})

go("game")