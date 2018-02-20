import { EPSILON } from './constants'
import { offsetFromZero } from '../utils'

const sqrt3 = Math.sqrt(3)

export function setFactory({ Hex }) {
    /**
     * @memberof Hex#
     * @instance
     *
     * @param {*} coordinates   Same parameters as the {@link Hex} factory.
     * @returns {hex}           Itself with the passed parameters merged into it.
     *
     * @example
     * const Hex = Honeycomb.extendHex()
     *
     * const hex = Hex({ x: 1, y: 2, a: 3, b: 4 })          // { a: 3, b: 4, x: 1, y: 2 }
     * const updatedHex = hex.set({ x: 0, y: -1, b: 5 })    // { a: 3, b: 5, x: 0, y: -1 }
     * hex === updatedHex                                   // true: hex is updated in-place
     */
    return function set(...args) {
        return Object.assign(this, Hex(...args))
    }
}

/**
 * @memberof Hex#
 * @returns {Object}    The hex's cartesian `x` and `y` coordinates.
 *
 * @example
 * const Hex = Honeycomb.extendHex()
 *
 * Hex().coordinates()      // { x: 0, y: 0 }
 * Hex(1, 2).coordinates()  // { x: 1, y: 2 }
 */
export function coordinates() {
    return { x: this.x, y: this.y }
}

/**
 * @memberof Hex#
 * @returns {Object}    The hex's cube `q`, `r` and `s` coordinates.
 *
 * @example
 * const Hex = Honeycomb.extendHex()
 *
 * Hex().cube()     // { q: 0, r: 0, s: 0 }
 * Hex(1, 2).cube() // { q: 0, r: 2, s: -2 }
 */
export function cube() {
    return { q: this.q, r: this.r, s: this.s }
}

/**
 * @memberof Hex#
 *
 * @todo make this a static (and instance?) method
 *
 * @param {Object} cubeCoordinates      At least the `q` and `r` cube coordinates.
 * @param {number} cubeCoordinates.q    The `q` cube coordinate.
 * @param {number} cubeCoordinates.r    The `r` cube coordinate.
 * @param {number} [cubeCoordinates.s]  The optional `s` cube coordinate.
 *
 * @returns {Object}                    The hex's cartesian `x` and `y` coordinates.
 *
 * @example
 * const Hex = Honeycomb.extendHex()
 *
 * Hex().cubeToCartesian({ q: 1, r: 2, s: -3 }) // { x: 2, y: 2 }
 * // the `s` coordinate isn't required:
 * Hex().cubeToCartesian({ q: -3, r: 5 })       // { x: -1, y: 5 }
 */
export function cubeToCartesian({ q, r }) {
    let x, y

    if (this.isPointy()) {
        x = q + offsetFromZero(this.offset, r)
        y = r
    } else {
        x = q
        y = r + offsetFromZero(this.offset, q)
    }

    return { x, y }
}

/**
 * @memberof Hex#
 *
 * @todo make this a static (and instance?) method
 *
 * @param {Object} cartesianCoordinates     The `x` and `y` cartesian coordinate.
 * @param {number} cartesianCoordinates.x   The `x` cartesian coordinate.
 * @param {number} cartesianCoordinates.y   The `y` cartesian coordinate.
 *
 * @returns {Object}                        The hex's cube `q`, `r` and `s` coordinates.
 *
 * @example
 * const Hex = Honeycomb.extendHex()
 *
 * Hex().cartesianToCube({ x: 4, y: -2 }) // { q: 5, r: -2, s: -3 }
 */
export function cartesianToCube({ x, y }) {
    let q, r

    if (this.isPointy()) {
        q = x - offsetFromZero(this.offset, y)
        r = y
    } else {
        q = x
        r = y - offsetFromZero(this.offset, x)
    }

    return { q, r, s: -q - r }
}
/**
 * @memberof Hex#
 * @returns {boolean}   Whether hexes have a pointy ⬢ orientation.
 */
export function isPointy() {
    return this.orientation.toLowerCase() === 'pointy'
}

/**
 * @memberof Hex#
 * @returns {boolean}   Whether hexes have a flat ⬣ orientation.
 */
export function isFlat() {
    return this.orientation.toLowerCase() === 'flat'
}

/**
 * @memberof Hex#
 * @returns {number}    The distance between opposite corners of a hex.
 */
export function oppositeCornerDistance() {
    return this.size * 2
}

/**
 * @memberof Hex#
 * @returns {number}    The distance between opposite sides of a hex.
 */
export function oppositeSideDistance() {
    return sqrt3 / 2 * this.oppositeCornerDistance()
}

/**
 * @memberof Hex#
 * @returns {number}    The (horizontal) width of a hex.
 */
export function width() {
    return this.isPointy() ?
        this.oppositeSideDistance() :
        this.oppositeCornerDistance()
}

/**
 * @memberof Hex#
 * @returns {number}    The (vertical) height of a hex.
 */
export function height() {
    return this.isPointy() ?
        this.oppositeCornerDistance() :
        this.oppositeSideDistance()
}

export function cornersFactory({ Point }) {
    /**
     * @memberof Hex#
     * @instance
     * @returns {point[]}
     * Array of corner points relative to the {@link Hex#origin|hex's origin}.
     * Starting at the top right corner for pointy hexes and the right corner for flat hexes.
     *
     * @example
     * // a hex's origin defaults to its top left corner (as if it's a rectangle)
     * const Hex1 = Honeycomb.extendHex({ size: 30 })
     * Hex1().corners() // [
     *                  //    { x: 51.96152422706631, y: 15 },
     *                  //    { x: 51.96152422706631, y: 45 },
     *                  //    { x: 25.980762113533157, y: 60 },
     *                  //    { x: 0, y: 45 },
     *                  //    { x: 0, y: 15 },
     *                  //    { x: 25.980762113533157, y: 0 }
     *                  // ]
     *
     * // set the origin to a hex's center
     * const Hex2 = Honeycomb.extendHex({ size: 30, origin: [25.980762113533157, 30] })
     * Hex2().corners() // [
     *                  //    { x: 25.980762113533157, y: -15 },
     *                  //    { x: 25.980762113533157, y: 15 },
     *                  //    { x: 0, y: 30 },
     *                  //    { x: -25.980762113533157, y: 15 },
     *                  //    { x: -25.980762113533157, y: -15 },
     *                  //    { x: 0, y: -30 }
     *                  // ]
     */
    return function corners() {
        const width = this.width()
        const height = this.height()
        const { x, y } = this.origin

        if (this.isPointy()) {
            return [
                Point(width - x, height * 0.25 - y),
                Point(width - x, height * 0.75 - y),
                Point(width * 0.5 - x, height - y),
                Point(0 - x, height * 0.75 - y),
                Point(0 - x, height * 0.25 - y),
                Point(width * 0.5 - x, 0 - y)
            ]
        } else {
            return [
                Point(width - x, height * 0.5 - y),
                Point(width * 0.75 - x, height - y),
                Point(width * 0.25 - x, height - y),
                Point(0 - x, height * 0.5 - y),
                Point(width * 0.25 - x, 0 - y),
                Point(width * 0.75 - x, 0 - y)
            ]
        }
    }
}

export function centerFactory({ Point }) {
    /**
     * @memberof Hex#
     * @instance
     * @returns {point} Point relative to the {@link Hex#origin|hex's origin}.
     * Note that the default origin is the top left corner, so the default center is
     * `{ x: hexWidth / 2, y: hexHeight / 2 }`.
     *
     * @example
     * const Hex1 = Honeycomb.extendHex({ size: 10 })
     * Hex1().center()  // { x: 8.660254037844386, y: 10 }
     *
     * const Hex2 = Honeycomb.extendHex({ size: 10, origin: [5, 5] })
     * Hex2().center()  // { x: 3.6602540378443855, y: 5 }
     */
    return function center() {
        const { x, y } = this.origin
        return Point(this.width() / 2 - x, this.height() / 2 - y)
    }
}

export function toPointFactory({ Point }) {
    /**
     * @memberof Hex#
     * @instance
     * @returns {point} The hex's origin point.
     *
     * @example
     * const Hex = Honeycomb.extendHex({ size: 30 })
     * Hex().toPoint()          // { x: 0, y: 0 }
     * Hex(-2, -5).toPoint()    // { x: -77.94228634059947, y: -225 }
     */
    return function toPoint() {
        const { q, r, size } = this
        let x, y

        if (this.isPointy()) {
            x = size * sqrt3 * (q + r / 2)
            y = size * 3/2 * r
        } else {
            x = size * 3/2 * q
            y = size * sqrt3 * (r + q / 2)
        }

        return Point(x, y)
    }
}

export function addFactory({ Hex, Point }) {
    /**
     * @memberof Hex#
     * @instance
     *
     * @todo Accept any number of hexes to add.
     *
     * @param {point} point The hex (or point) that will be added to the current.
     * @returns {hex}       A *new* hex where the passed hex's coordinates are added to the current.
     *                      Any custom properties are copied.
     */
    return function add(point) {
        const { x, y } = Point(point)
        // use call() to bind any custom properties to Hex(), which get merged into the resulting hex.
        return Hex.call(this, this.x + x, this.y + y)
    }
}

export function subtractFactory({ Hex, Point }) {
    /**
     * @memberof Hex#
     * @instance
     *
     * @todo Accept any number of hexes to subtract.
     *
     * @param {point} point The hex (or point) that will be subtracted from the current.
     * @returns {hex}       A *new* hex where the passed hex's coordinates are subtracted from the current.
     *                      Any custom properties are copied.
     */
    return function subtract(point) {
        const { x, y } = Point(point)
        // use call() to bind any custom properties to Hex(), which get merged into the resulting hex.
        return Hex.call(this, this.x - x, this.y - y)
    }
}

export function equalsFactory({ Point }) {
    /**
     * @memberof Hex#
     * @instance
     *
     * @param {point} point The hex (or point) whose coordinates will be compared against the current hex.
     * @returns {boolean}   Whether the coordinates of the current and the passed point are equal.
     */
    return function equals(point) {
        const { x, y } = Point(point)
        return this.x === x && this.y === y
    }
}

/**
 * @memberof Hex#
 *
 * @see {@link https://www.redblobgames.com/grids/hexagons/#distances|redblobgames.com}
 *
 * @param   {hex} hex   The last hex (cannot be a {@link point}).
 * @returns {number}    The amount of hexes from the current to (and excluding) the last hex.
 *
 * @example
 * const Hex = Honeycomb.extendHex()
 *
 * Hex().distance(Hex(1, 0))        // 1
 * Hex(-2, -2).distance(Hex(4, 1))  // 8
 */
export function distance(hex) {
    return Math.max(
        Math.abs(this.q - hex.q),
        Math.abs(this.r - hex.r),
        Math.abs(this.s - hex.s)
    )
}

export function roundFactory({ Hex }) {
    /**
     * Rounds the current floating point hex coordinates to their nearest integer hex coordinates.
     *
     * @memberof Hex#
     * @see {@link https://www.redblobgames.com/grids/hexagons/#rounding|redblobgames.com}
     *
     * @returns {hex}   A *new* hex with rounded coordinates.
     *                  Any custom properties are copied.
     *
     * @example
     * const Hex = Honeycomb.extendHex()
     * Hex(3.1415, 0.5).round() // { x: 3, y: 1 }
     */
    return function round() {
        let { q, r, s } = this
        let roundedQ = Math.round(q)
        let roundedR = Math.round(r)
        let roundedS = Math.round(s)
        const diffQ = Math.abs(q - roundedQ)
        const diffR = Math.abs(r - roundedR)
        const diffS = Math.abs(s - roundedS)

        if (diffQ > diffR && diffQ > diffS) {
            roundedQ = -roundedR - roundedS
        } else if (diffR > diffS) {
            roundedR = -roundedQ - roundedS
        } else {
            roundedS = -roundedQ - roundedR
        }

        // use call() to bind any custom properties to Hex(), which get merged into the resulting hex.
        return Hex.call(this, { q: roundedQ, r: roundedR, s: roundedS })
    }
}

export function lerpFactory({ Hex }) {
    /**
     * Returns an interpolation between the current hex and the passed hex for a `t` between 0 and 1.
     * More info on [wikipedia](https://en.wikipedia.org/wiki/Linear_interpolation).
     *
     * @memberof Hex#
     *
     * @param   {hex} hex   The other hex (cannot be a {@link point}).
     * @param   {number} t  A "parameter" between 0 and 1.
     *
     * @returns {hex}       A new hex (likely with floating point coordinates).
     *                      Any custom properties are copied.
     */
    return function lerp(hex, t) {
        const q = this.q * (1 - t) + hex.q * t
        const r = this.r * (1 - t) + hex.r * t
        // use call() to bind any custom properties to Hex(), which get merged into the resulting hex.
        return Hex.call(this, { q, r, s: -q - r })
    }
}

/**
 * @memberof Hex#
 * @see {@link https://www.redblobgames.com/grids/hexagons/#line-drawing|redblobgames.com}
 *
 * @returns {hex}   A *new* hex with a tiny offset from the current hex.
 *                  Useful for interpolating in a consistent direction.
 */
export function nudge() {
    return this.add(EPSILON)
}

/**
 * @memberof Hex#
 * @returns {string}    A string representation of the hex.
 */
export function toString() {
    return `${this.x},${this.y}`
}
