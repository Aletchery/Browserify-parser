(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],4:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":2,"buffer":4,"ieee754":6}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}

},{}],6:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],7:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],8:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":4}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/lib/_stream_readable.js');
Stream.Writable = require('readable-stream/lib/_stream_writable.js');
Stream.Duplex = require('readable-stream/lib/_stream_duplex.js');
Stream.Transform = require('readable-stream/lib/_stream_transform.js');
Stream.PassThrough = require('readable-stream/lib/_stream_passthrough.js');
Stream.finished = require('readable-stream/lib/internal/streams/end-of-stream.js')
Stream.pipeline = require('readable-stream/lib/internal/streams/pipeline.js')

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":5,"inherits":7,"readable-stream/lib/_stream_duplex.js":13,"readable-stream/lib/_stream_passthrough.js":14,"readable-stream/lib/_stream_readable.js":15,"readable-stream/lib/_stream_transform.js":16,"readable-stream/lib/_stream_writable.js":17,"readable-stream/lib/internal/streams/end-of-stream.js":21,"readable-stream/lib/internal/streams/pipeline.js":23}],12:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],13:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.
'use strict';
/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


module.exports = Duplex;

var Readable = require('./_stream_readable');

var Writable = require('./_stream_writable');

require('inherits')(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this)}).call(this,require('_process'))
},{"./_stream_readable":15,"./_stream_writable":17,"_process":9,"inherits":7}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.
'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

require('inherits')(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":16,"inherits":7}],15:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

module.exports = Readable;
/*<replacement>*/

var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = require('events').EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/


var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*<replacement>*/


var debugUtil = require('util');

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/


var BufferList = require('./internal/streams/buffer_list');

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

require('inherits')(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":12,"./_stream_duplex":13,"./internal/streams/async_iterator":18,"./internal/streams/buffer_list":19,"./internal/streams/destroy":20,"./internal/streams/from":22,"./internal/streams/state":24,"./internal/streams/stream":25,"_process":9,"buffer":4,"events":5,"inherits":7,"string_decoder/":26,"util":3}],16:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.
'use strict';

module.exports = Transform;

var _require$codes = require('../errors').codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = require('./_stream_duplex');

require('inherits')(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":12,"./_stream_duplex":13,"inherits":7}],17:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
'use strict';

module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/

var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

require('inherits')(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex'); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":12,"./_stream_duplex":13,"./internal/streams/destroy":20,"./internal/streams/state":24,"./internal/streams/stream":25,"_process":9,"buffer":4,"inherits":7,"util-deprecate":27}],18:[function(require,module,exports){
(function (process){(function (){
'use strict';

var _Object$setPrototypeO;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var finished = require('./end-of-stream');

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;
}).call(this)}).call(this,require('_process'))
},{"./end-of-stream":21,"_process":9}],19:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('buffer'),
    Buffer = _require.Buffer;

var _require2 = require('util'),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();
},{"buffer":4,"util":3}],20:[function(require,module,exports){
(function (process){(function (){
'use strict'; // undocumented cb() API, needed for core, not for public API

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this)}).call(this,require('_process'))
},{"_process":9}],21:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;
},{"../../../errors":12}],22:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],23:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = require('../../../errors').codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;
},{"../../../errors":12,"./end-of-stream":21}],24:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":12}],25:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":5}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":10}],27:[function(require,module,exports){
(function (global){(function (){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],28:[function(require,module,exports){
const boxes = require('./index');

    
class BoxElement extends HTMLDivElement {
    constructor() {
        super();
        const temp = document.createElement('template');
        

       this.attachShadow({mode: 'open'}); 
       
      }
    }
    customElements.define("box-element", BoxElement,{extends : 'div'});

  

  /*for(var i = 0;i<boxes.length;i++){
      boxCreator(boxes[i]);
        var box = document.createElement("box-element");
        var body = document.getElementById("body");
        body.appendChild(box);
  }*/

  
},{"./index":29}],29:[function(require,module,exports){
const JsonLdParser = require("jsonld-streaming-parser").JsonLdParser;
const fs = require("fs");

var boxesId=[];
var boxes=[];
var artID=[];
var foundID = false;
var base = "http://lotrando.fit.vutbr.cz:8401/service/artifact/item/r:";
var artifact = "http://lotrando.fit.vutbr.cz:8400/service/artifact";
var pageWidth;
var pageHeight;
var tree=[];
var boxTree=[];
var target;
var target_element;
var last_active;


/*var box={
    id: "",
    backgroundColor: "",
    posX: "",
    posY: "",
    widht: "",
    height: "",
    belongsTo:"",
    color:"",
    documentOrder:"",
    fontFamily:"",
    fontSize:"",
    fontStyle:"",
    fontWeight:"",
    hasAttribute:"",
    htmlTagName:"",
    lineThrough:"",
    underline:"",
    visualHeight:"",
    visualWidth:"",
    visualX:"",
    visualY:"",
    type:""
}*/



function main(){

    position();

    boxes.sort(function(a, b){
        return a.documentOrder - b.documentOrder;
    })
    
    const view = document.getElementById("view");
    view.style.width = pageWidth + "px";
    view.style.height = pageHeight + "px";
     
     //console.log(boxesId);
     for(var i = 0; i<boxes.length;i++){
            
            const d = document.createElement('box-element');
            
            d.innerHTML = `
            <box-element id="${boxes[i].id}" style="position: absolute; top: ${boxes[i].posY}px; left: ${ boxes[i].posX }px; width: ${boxes[i].widht}px;
            height: ${ boxes[i].height }px; background-color:#${ boxes[i].backgroundColor }; color:#${boxes[i].color}; font-size:${
            boxes[i].fontSize }px; font-weight: ${ boxes[i].fontWeight}; font-family:${ boxes[i].fontFamily}; font-style: ${boxes[i].fontStyle};
             border-left:${ boxes[i].borderL.borderWidth}px ${ boxes[i].borderL.borderStyle } #${ boxes[i].borderL.borderColor };
             border-right:${ boxes[i].borderR.borderWidth}px ${ boxes[i].borderR.borderStyle } #${ boxes[i].borderR.borderColor };
             border-top:${ boxes[i].borderT.borderWidth}px ${ boxes[i].borderT.borderStyle } #${ boxes[i].borderT.borderColor };
             border-bottom:${ boxes[i].borderB.borderWidth}px ${ boxes[i].borderB.borderStyle } #${ boxes[i].borderB.borderColor };">
            ${ boxes[i].text }
            </box-element>
             `;
             view.appendChild(d);
            
            
         //    }
       //  }
        
     }
     boxTreeMaker();
     box_list(boxTree);
     view.classList.toggle("visibility");
     view.addEventListener("click", function(event){
         console.log(event.target.id + "_node");
         clickFunction(event.target.id + "_node", event.target.id);
     })

}

function position(){
    boxes.forEach(function(box){
        if(result = boxes.find( ({ id }) => id === box.boundsid)){
            box.posX = result.posX;
            box.posY = result.posY;
            box.widht = result.widht;
            box.height = result.height;
            
            const index = boxes.indexOf(result);
            if (index > -1) {
              boxes.splice(index, 1);
            }
        }
    })
}

function artifacts(data){

    var predicate = data.predicate.value;
    var subject = data.subject.value;
    
    var lastIndexS = subject.lastIndexOf('/')+1;
    var id = subject.substr(lastIndexS,subject.lenght);

    if(predicate.includes("hasParentArtifact")){
        var object = data.object.value;
        
        var lastIndexO = object.lastIndexOf('/')+1;
        var parentId = object.substr(lastIndexO,object.lenght);

        var found = false;
        artID.forEach(function(art){
            if(art.id == id){
                found = true;
                art.parentID = parentId;
            }
        })
        
        
    if(found == false){
        var art={
            id: id,
            parentID: parentId
        }
        artID.push(art);
        }
    }
    else{
        var found = false;
        artID.forEach(function(art){
            if(art.id == id){
                found = true;
            }
        })
        if(found == false){
            var art={
                id: id,
                parentID: null
            }
            
            artID.push(art);
        }
    }
}
function box_list(boxes_list){  
    const box_ul = document.getElementById("myUL2");

    

    boxes_list.forEach(function(node){
        /*li.addEventListener("click",function(event){
            target_element = document.getElementById(event.target.id);
            
        });*/

        var li = document.createElement('li');
       target_element = li;
       
        box_ul.appendChild(li);

        if(node.kids){
            var span = document.createElement('span');
            span.setAttribute("class", "caret");
            span.setAttribute("id",node.id+"_node");
            span.innerHTML = node.id;
            li.appendChild(span);

            var ul2=document.createElement('ul');
            ul2.setAttribute("class", "nested")
            li.appendChild(ul2);
            node.kids.forEach(function(kid){
                var kidLi = document.createElement('li');
                kidLi.setAttribute("id",kid+"_node");
                kidLi.innerHTML = kid;
                ul2.appendChild(kidLi);
            })
            
        }
        else{
            var span = document.createElement('span');
            span.innerHTML = node.id;
            li.appendChild(span);
        }

    });

    box_ul.addEventListener("click", function(event) {    
            clickFunction(event.target.id,event.target.innerHTML);  
    });
    var toggler = document.getElementsByClassName("caret");
    var i;

    for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
        });
    } 
      
}


function clickFunction(listid,boxid){       
            target_element.classList.remove("highlight");
            target_element = document.getElementById(listid);
            target_element.classList.add("highlight");  

            showBoxInfo(boxid);
}


function list(){
    treeMaker();
    const list = document.getElementById("list");
    

    var ul=document.createElement('ul');
    ul.setAttribute("id", "myUL")
    
    list.appendChild(ul);
    tree.forEach(function(node){
        var li = document.createElement('li');
        last_active = li;
        ul.appendChild(li);
        if(node.kids[0]){
            var span = document.createElement('span');
            span.setAttribute("class", "caret arts");
            span.innerHTML = node.id;
            li.appendChild(span);
        }
        else{
            var span = document.createElement('span');
            span.innerHTML = node.id;
            li.appendChild(span);
        }

        
        
        if(node.kids[0]){ 
            var ul2=document.createElement('ul');
            ul2.setAttribute("class", "nested arts")
            li.appendChild(ul2);
            node.kids.forEach(function(kid){
                var kidLi = document.createElement('li');
                kidLi.innerHTML = kid;
                ul2.appendChild(kidLi);
        });
        }
        
    });
    ul.addEventListener("click", function(event) {
    last_active.classList.remove("highlight");
    last_active = event.target;
    event.target.classList.add("highlight");
    target = event.target.innerHTML; 
    boxes = [];
    boxTree = [];
    //console.log(boxes);
    document.getElementById("bottom").innerHTML = "";
    document.getElementById("myUL2").innerHTML = "";
    document.getElementById("view").innerHTML = "";
    document.getElementById("view").classList.toggle("visibility");
    
    document.getElementById("loading").style.visibility = "visible";
    getArt(target);
    });
    var toggler = document.getElementsByClassName("caret");
    var i;

    for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  });
}
    
}

function getArt(target){
const artParser = new JsonLdParser();
artParser
  .on('data', saveObject)
  .on('error', console.error)
  .on('end', main);

url = base + target;

artID.forEach(function(art){
    
    if(art.id == target && art.parentID != null){
        url = base + art.parentID
    }
})
console.log(url);

fetch(url)
.then(function(body){
    return body.text();
  }).then(function(data) {
    
    artParser.write(data);
    artParser.end();
  });
}

function showBoxInfo(id){

    console.log(id);
    var foundBox;
    boxes.forEach(function(box){
        if(box.id == id){
            foundBox = box;
        }
    })
        //console.log(foundBox);
        var window = document.getElementById("bottom");
        window.innerHTML = `
        <table>
        <tr>
          <th>Attribute</th>
          <th>Value</th> 
        </tr>
        <tr>
          <td>ID</td>
          <td>${foundBox.id}</td>
        </tr>
        <tr>
          <td>Width</td>
          <td>${foundBox.widht}px</td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${foundBox.height}px</td>
        </tr>
        <tr>
          <td>PosX</td>
          <td>${foundBox.posX}px</td>
        </tr>
        <tr>
          <td>PosY</td>
          <td>${foundBox.posY}px</td>
        </tr>
        <tr>
          <td>Color</td>
          <td>#${foundBox.color}</td>
        </tr>
        <tr>
          <td>Font family</td>
          <td>${foundBox.fontFamily}</td>
        </tr>
        <tr>
          <td>Font weight</td>
          <td>${foundBox.fontWeight}</td>
        </tr>
        <tr>
          <td>Font size</td>
          <td>${foundBox.fontSize}</td>
        </tr>
        <tr>
          <td>Font style</td>
          <td>${foundBox.fontStyle}</td>
        </tr>
        <tr>
          <td>Background color</td>
          <td>#${foundBox.backgroundColor}</td>
        </tr>
        <tr>
          <td>Text</td>
          <td>${foundBox.text}</td>
        </tr>
        <tr>
          <td>Underline</td>
          <td>${foundBox.underLine}</td>
        </tr>
        <tr>
          <td>Line-trough</td>
          <td>${foundBox.lineThrough}</td>
        </tr>
        <tr>
          <td>Visual height</td>
          <td>${foundBox.visualHeight}</td>
        </tr>
        <tr>
          <td>Visual width</td>
          <td>${foundBox.visualWidth}</td>
        </tr>
        <tr>
          <td>Visual X</td>
          <td>${foundBox.visualX}</td>
        </tr>
        <tr>
          <td>Visual Y</td>
          <td>${foundBox.visualY}</td>
        </tr>
        <tr>
          <td>Type</td>
          <td>${foundBox.type}</td>
        </tr>
        <tr>
          <td>Border left</td>
          <td>${foundBox.borderL.borderWidth}px ${foundBox.borderL.borderStyle} ${foundBox.borderL.borderColor}</td>
        </tr>
        <tr>
          <td>Border top</td>
          <td>${foundBox.borderT.borderWidth}px ${foundBox.borderT.borderStyle} ${foundBox.borderT.borderColor}</td>
        </tr>
        <tr>
          <td>Border right</td>
          <td>${foundBox.borderR.borderWidth}px ${foundBox.borderR.borderStyle} ${foundBox.borderR.borderColor}</td>
        </tr>
        <tr>
          <td>Border bottom</td>
          <td>${foundBox.borderB.borderWidth}px ${foundBox.borderB.borderStyle} ${foundBox.borderB.borderColor}</td>
        </tr>
       
      </table>`
}

function boxTreeMaker(){
    var result;
    boxes.forEach(function(box){
    if(box.type == "Box"){
        if(box.isChildOf){
          if(result = boxTree.find( ({ id }) => id === box.isChildOf)){
                result.kids.push(box.id);
          }
          else{
              var node = {
              id: box.isChildOf,
              kids:[box.id],
            }
            boxTree.push(node);
          }
        }
        else if(!box.isChildOf){
            if(result = boxTree.find( ({ id }) => id === box.id)){
                return;
          }
          else{
              var node = {
              id: box.id,
              kids:[],
            }
            boxTree.push(node);
          }
        }
        }
     }) 
    console.log(boxTree);
    }
      


function treeMaker(){
    
    for(var i=0; i<artID.length; i++){
        
        if(!artID[i].parentID){
            //console.log(artID[i]);
            var parent={
                id: artID[i].id,
                kids: []
            }
            for (var j=0; j<artID.length; j++){
                if(artID[j].parentID){
                    if(artID[j].parentID == artID[i].id){
                        parent.kids.push(artID[j].id);
                    }
                }
            }
            tree.push(parent);
    }
    
}
console.log(tree);
}

function saveObject(data){
    //console.log(data);
    
    var object = data.object.value;

    if(object.includes('width=')){
  
    pageWidth = object.substr(object.indexOf('width=')+6, object.lenght);
    pageWidth = pageWidth.substr(0,pageWidth.indexOf(' '));
    
    
    pageHeight = object.substr(object.indexOf('height=')+7, object.lenght);
    pageHeight = pageHeight.substr(0,pageHeight.indexOf(' '));
    
    }
    var lastIndexO = object.lastIndexOf('#')+1;
    var value = object.substr(lastIndexO,object.lenght);
   

    var subject = data.subject.value;
    var lastIndexS = subject.lastIndexOf('/')+1;
    var id = subject.substr(lastIndexS,subject.lenght);

    var borderS = "";

    if(id.includes("Btop")){
        id = id.replace('Btop','');
        borderS = "top";
    }
    if(id.includes("Bbottom")){
        id = id.replace('Bbottom','');
        borderS = "bottom";
    }
    if(id.includes("Bleft")){
        id = id.replace('Bleft','');
        borderS = "left";
    }
    if(id.includes("Bright")){
        id = id.replace('Bright','');
        borderS = "right";
    }

    if(value== "Box"){
        boxesId.push(id);
    }

    var predicate = data.predicate.value;
    var lastIndexP = predicate.lastIndexOf('#')+1;
    var type = predicate.substr(lastIndexP,predicate.lenght);

        for(var i = 0; i<boxes.length;i++){
            
            if(id==boxes[i].id){
                foundID = true;
                
                    if(borderS=="top"){
                    switch (type) {
                    case "borderColor": 
                        boxes[i].borderT.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderT.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderT.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
                    else if(borderS=="left"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderL.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderL.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderL.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
                    else if(borderS=="bottom"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderB.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderB.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderB.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
                    else if(borderS=="right"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderR.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderR.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderR.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
               
                
                switch (type) {
                    case "bounds":
                        boxes[i].boundsid = target + "#" + value;
                        break;
                    case "backgroundColor":
                        boxes[i].backgroundColor = value;                  
                        break;
                    case "positionX":
                        boxes[i].posX = value;                      
                        break;

                    case "positionY":
                        boxes[i].posY = value;
                        break;

                    case "width":
                        boxes[i].widht = value; 
                        break;

                    case "height":
                        boxes[i].height = value;
                        break;

                    case "belongsTo":
                        boxes[i].belongsTo = value;
                        break;
                    
                    case "color":
                        boxes[i].color = value;
                        break;
                    
                    case "documentOrder":
                        boxes[i].documentOrder = value;
                        break;    
                    
                    case "fontFamily":
                        boxes[i].fontFamily = value;
                        break;

                    case "fontSize":
                        boxes[i].fontSize = value;
                        break;

                    case "fontStyle":
                        boxes[i].fontStyle = value;
                        break;

                    case "fontWeight":
                        if(value > 0,5){
                            boxes[i].fontWeight = "bold";
                        }
                        else{
                            boxes[i].fontWeight = "normal";
                        }
                        
                        break;

                    case "hasAttribute":
                        boxes[i].hasAttribute = value;
                        break;

                    case "htmlTagName":
                        boxes[i].htmlTagName = value;
                        break;
                    
                    case "lineTrough":
                        boxes[i].lineTrough = value;
                        break;

                    case "underLine":
                        boxes[i].underLine = value;
                        break;

                    case "visualHeight":
                        boxes[i].visualHeight = value;
                        break;

                    case "visualWidth":
                        boxes[i].visualWidth = value;
                        break;

                    case "visualX":
                        boxes[i].visualX = value;
                        break;

                    case "visualY":
                        boxes[i].visualY = value;
                        break;

                    case "type":
                        boxes[i].type = value;
                        break;

                    case "isChildOf":
                        boxes[i].isChildOf = target + "#" + value;
                        break;
                    
                    case "hasText":
                        boxes[i].text = value;
                        break;

                    default:
                        break;
                }
            }
        }

        if(foundID == false){
            var O ={id: id,
                    boundsid: "",
                    backgroundColor: "none",
                    posX: "0",
                    posY: "0",
                    widht: "0",
                    height: "0",
                    belongsTo:"",
                    color:"",
                    documentOrder:"",
                    fontFamily:"",
                    fontSize:"",
                    fontStyle:"",
                    fontWeight:"",
                    hasAttribute:"",
                    htmlTagName:"",
                    lineThrough:"none",
                    underLine:"none",
                    visualHeight:"",
                    visualWidth:"",
                    visualX:"",
                    visualY:"",
                    type:"",
                    isChildOf: null,
                    text:"",
                    borderL : 
                    {
                    borderColor:"",
                    borderWidth:"0",
                    borderStyle:""},
                    borderR : 
                    {
                    borderColor:"",
                    borderWidth:"0",
                    borderStyle:""},
                    borderT : 
                    {
                    borderColor:"",
                    borderWidth:"0",
                    borderStyle:""},
                    borderB : 
                    {
                    borderColor:"",
                    borderWidth:"0",
                    borderStyle:""}
                    }

                    if(borderS){
                        O.border.side=borderS;
                        switch (type) {
                            case "borderColor": 
                            O.border.borderColor = value;
                            break;
                        case "borderStyle": 
                            O.border.borderStyle = value;
                            break;
                        case "borderWidth":
                            O.border.borderWidth = value;
                            break;
                        default:
                            break;
                        }
                    }

            switch (type) {
                case "backgroundColor":
                    O.backgroundColor = value;                  
                    break;

                case "positionX":
                    O.posX = value;                      
                    break;

                case "positionY":
                    O.posY = value;
                    break;

                case "width":
                    O.widht = value; 
                    break;

                case "height":
                    O.height = value;
                    break;

                case "belongsTo":
                    O.belongsTo = value;
                    break;
                
                case "color":
                    O.color = value;
                    break;
                
                case "documentOrder":
                    O.documentOrder = value;
                    break;    
                
                case "fontFamily":
                    O.fontFamily = value;
                    break;

                case "fontSize":
                    O.fontSize = value;
                    break;

                case "fontStyle":
                    O.fontStyle = value;
                    break;

                case "fontWeight":
                    O.fontWeight = value;
                    break;

                case "hasAttribute":
                    O.hasAttribute = value;
                    break;

                case "htmlTagName":
                    O.htmlTagName = value;
                    break;
                
                case "lineTrough":
                    O.lineTrough = value;
                    break;

                case "underLine":
                    O.underLine = value;
                    break;

                case "visualHeight":
                    O.visualHeight = value;
                    break;

                case "visualWidth":
                    O.visualWidth = value;
                    break;

                case "visualX":
                    O.visualX = value;
                    break;

                case "visualY":
                    O.visualY = value;
                    break;

                case "type":
                    O.type = value;
                    break;

                case "isChildOf":
                    O.type = value;
                    break;
                case "hasText":
                    O.text = value;
                    break;
                

                default:
                    break;
            }
                boxes.push(O);
        }

        foundID = false;
}


const myParser = new JsonLdParser();

myParser
  .on('data', artifacts)
  .on('error', console.error)
  .on('end', list);


fetch(artifact)
.then(function(body){
    return body.text();
  }).then(function(data) {
    
    myParser.write(data);
    myParser.end();
  });

module.exports = [boxes];

},{"fs":1,"jsonld-streaming-parser":41}],30:[function(require,module,exports){
/* jshint esversion: 6 */
/* jslint node: true */
'use strict';

module.exports = function serialize (object) {
  if (object === null || typeof object !== 'object' || object.toJSON != null) {
    return JSON.stringify(object);
  }

  if (Array.isArray(object)) {
    return '[' + object.reduce((t, cv, ci) => {
      const comma = ci === 0 ? '' : ',';
      const value = cv === undefined || typeof cv === 'symbol' ? null : cv;
      return t + comma + serialize(value);
    }, '') + ']';
  }

  return '{' + Object.keys(object).sort().reduce((t, cv, ci) => {
    if (object[cv] === undefined ||
        typeof object[cv] === 'symbol') {
      return t;
    }
    const comma = t.length === 0 ? '' : ',';
    return t + comma + serialize(cv) + ':' + serialize(object[cv]);
  }, '') + '}';
};

},{}],31:[function(require,module,exports){
(function(self) {

var irrelevant = (function (exports) {

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  return exports;

}({}));
})(typeof self !== 'undefined' ? self : this);

},{}],32:[function(require,module,exports){
(function (Buffer){(function (){
'use strict'

var COMPATIBLE_ENCODING_PATTERN = /^utf-?8|ascii|utf-?16-?le|ucs-?2|base-?64|latin-?1$/i
var WS_TRIM_PATTERN = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
var WS_CHAR_PATTERN = /\s|\uFEFF|\xA0/
var WS_FOLD_PATTERN = /\r?\n[\x20\x09]+/g
var DELIMITER_PATTERN = /[;,"]/
var WS_DELIMITER_PATTERN = /[;,"]|\s/

/**
 * Token character pattern
 * @type {RegExp}
 * @see https://tools.ietf.org/html/rfc7230#section-3.2.6
 */
var TOKEN_PATTERN = /^[!#$%&'*+\-\.^_`|~\da-zA-Z]+$/

var STATE = {
  IDLE: 1 << 0,
  URI: 1 << 1,
  ATTR: 1 << 2,
}

function trim( value ) {
  return value.replace( WS_TRIM_PATTERN, '' )
}

function hasWhitespace( value ) {
  return WS_CHAR_PATTERN.test( value )
}

function skipWhitespace( value, offset ) {
  while( hasWhitespace( value[offset] ) ) {
    offset++
  }
  return offset
}

function needsQuotes( value ) {
  return WS_DELIMITER_PATTERN.test( value ) ||
    !TOKEN_PATTERN.test( value )
}

class Link {

  /**
   * Link
   * @constructor
   * @param {String} [value]
   * @returns {Link}
   */
  constructor( value ) {

    /** @type {Array} URI references */
    this.refs = []

    if( value ) {
      this.parse( value )
    }

  }

  /**
   * Get refs with given relation type
   * @param {String} value
   * @returns {Array<Object>}
   */
  rel( value ) {

    var links = []
    var type = value.toLowerCase()

    for( var i = 0; i < this.refs.length; i++ ) {
      if( this.refs[ i ].rel.toLowerCase() === type ) {
        links.push( this.refs[ i ] )
      }
    }

    return links

  }

  /**
   * Get refs where given attribute has a given value
   * @param {String} attr
   * @param {String} value
   * @returns {Array<Object>}
   */
  get( attr, value ) {

    attr = attr.toLowerCase()

    var links = []

    for( var i = 0; i < this.refs.length; i++ ) {
      if( this.refs[ i ][ attr ] === value ) {
        links.push( this.refs[ i ] )
      }
    }

    return links

  }

  set( link ) {
    this.refs.push( link )
    return this
  }

  has( attr, value ) {

    attr = attr.toLowerCase()

    for( var i = 0; i < this.refs.length; i++ ) {
      if( this.refs[ i ][ attr ] === value ) {
        return true
      }
    }

    return false

  }

  parse( value, offset ) {

    offset = offset || 0
    value = offset ? value.slice( offset ) : value

    // Trim & unfold folded lines
    value = trim( value ).replace( WS_FOLD_PATTERN, '' )

    var state = STATE.IDLE
    var length = value.length
    var offset = 0
    var ref = null

    while( offset < length ) {
      if( state === STATE.IDLE ) {
        if( hasWhitespace( value[offset] ) ) {
          offset++
          continue
        } else if( value[offset] === '<' ) {
          if( ref != null ) {
            ref.rel != null ?
              this.refs.push( ...Link.expandRelations( ref ) ) :
              this.refs.push( ref )
          }
          var end = value.indexOf( '>', offset )
          if( end === -1 ) throw new Error( 'Expected end of URI delimiter at offset ' + offset )
          ref = { uri: value.slice( offset + 1, end ) }
          // this.refs.push( ref )
          offset = end
          state = STATE.URI
        } else {
          throw new Error( 'Unexpected character "' + value[offset] + '" at offset ' + offset )
        }
        offset++
      } else if( state === STATE.URI ) {
        if( hasWhitespace( value[offset] ) ) {
          offset++
          continue
        } else if( value[offset] === ';' ) {
          state = STATE.ATTR
          offset++
        } else if( value[offset] === ',' ) {
          state = STATE.IDLE
          offset++
        } else {
          throw new Error( 'Unexpected character "' + value[offset] + '" at offset ' + offset )
        }
      } else if( state === STATE.ATTR ) {
        if( value[offset] ===';' || hasWhitespace( value[offset] ) ) {
          offset++
          continue
        }
        var end = value.indexOf( '=', offset )
        if( end === -1 ) throw new Error( 'Expected attribute delimiter at offset ' + offset )
        var attr = trim( value.slice( offset, end ) ).toLowerCase()
        var attrValue = ''
        offset = end + 1
        offset = skipWhitespace( value, offset )
        if( value[offset] === '"' ) {
          offset++
          while( offset < length ) {
            if( value[offset] === '"' ) {
              offset++; break
            }
            if( value[offset] === '\\' ) {
              offset++
            }
            attrValue += value[offset]
            offset++
          }
        } else {
          var end = offset + 1
          while( !DELIMITER_PATTERN.test( value[end] ) && end < length ) {
            end++
          }
          attrValue = value.slice( offset, end )
          offset = end
        }
        if( ref[ attr ] && Link.isSingleOccurenceAttr( attr ) ) {
          // Ignore multiples of attributes which may only appear once
        } else if( attr[ attr.length - 1 ] === '*' ) {
          ref[ attr ] = Link.parseExtendedValue( attrValue )
        } else {
          attrValue = attr === 'type' ?
            attrValue.toLowerCase() : attrValue
          if( ref[ attr ] != null ) {
            if( Array.isArray( ref[ attr ] ) ) {
              ref[ attr ].push( attrValue )
            } else {
              ref[ attr ] = [ ref[ attr ], attrValue ]
            }
          } else {
            ref[ attr ] = attrValue
          }
        }
        switch( value[offset] ) {
          case ',': state = STATE.IDLE; break
          case ';': state = STATE.ATTR; break
        }
        offset++
      } else {
        throw new Error( 'Unknown parser state "' + state + '"' )
      }
    }

    if( ref != null ) {
      ref.rel != null ?
        this.refs.push( ...Link.expandRelations( ref ) ) :
        this.refs.push( ref )
    }

    ref = null

    return this

  }

  toString() {

    var refs = []
    var link = ''
    var ref = null

    for( var i = 0; i < this.refs.length; i++ ) {
      ref = this.refs[i]
      link = Object.keys( this.refs[i] ).reduce( function( link, attr ) {
        if( attr === 'uri' ) return link
        return link + '; ' + Link.formatAttribute( attr, ref[ attr ] )
      }, '<' + ref.uri + '>' )
      refs.push( link )
    }

    return refs.join( ', ' )

  }

}

/**
 * Determines whether an encoding can be
 * natively handled with a `Buffer`
 * @param {String} value
 * @returns {Boolean}
 */
Link.isCompatibleEncoding = function( value ) {
  return COMPATIBLE_ENCODING_PATTERN.test( value )
}

Link.parse = function( value, offset ) {
  return new Link().parse( value, offset )
}

Link.isSingleOccurenceAttr = function( attr ) {
  return attr === 'rel' || attr === 'type' || attr === 'media' ||
    attr === 'title' || attr === 'title*'
}

Link.isTokenAttr = function( attr ) {
  return attr === 'rel' || attr === 'type' || attr === 'anchor'
}

Link.escapeQuotes = function( value ) {
  return value.replace( /"/g, '\\"' )
}

Link.expandRelations = function( ref ) {
  var rels = ref.rel.split( ' ' )
  return rels.map( function( rel ) {
    var value = Object.assign( {}, ref )
    value.rel = rel
    return value
  })
}

/**
 * Parses an extended value and attempts to decode it
 * @internal
 * @param {String} value
 * @return {Object}
 */
Link.parseExtendedValue = function( value ) {
  var parts = /([^']+)?(?:'([^']+)')?(.+)/.exec( value )
  return {
    language: parts[2].toLowerCase(),
    encoding: Link.isCompatibleEncoding( parts[1] ) ?
      null : parts[1].toLowerCase(),
    value: Link.isCompatibleEncoding( parts[1] ) ?
      decodeURIComponent( parts[3] ) : parts[3]
  }
}

/**
 * Format a given extended attribute and it's value
 * @param {String} attr
 * @param {Object} data
 * @return {String}
 */
Link.formatExtendedAttribute = function( attr, data ) {

  var encoding = ( data.encoding || 'utf-8' ).toUpperCase()
  var language = data.language || 'en'

  var encodedValue = ''

  if( Buffer.isBuffer( data.value ) && Link.isCompatibleEncoding( encoding ) ) {
    encodedValue = data.value.toString( encoding )
  } else if( Buffer.isBuffer( data.value ) ) {
    encodedValue = data.value.toString( 'hex' )
      .replace( /[0-9a-f]{2}/gi, '%$1' )
  } else {
    encodedValue = encodeURIComponent( data.value )
  }

  return attr + '=' + encoding + '\'' +
    language + '\'' + encodedValue

}

/**
 * Format a given attribute and it's value
 * @param {String} attr
 * @param {String|Object} value
 * @return {String}
 */
Link.formatAttribute = function( attr, value ) {

  if( Array.isArray( value ) ) {
    return value.map(( item ) => {
      return Link.formatAttribute( attr, item )
    }).join( '; ' )
  }

  if( attr[ attr.length - 1 ] === '*' || typeof value !== 'string' ) {
    return Link.formatExtendedAttribute( attr, value )
  }

  if( Link.isTokenAttr( attr ) ) {
    value = needsQuotes( value ) ?
      '"' + Link.escapeQuotes( value ) + '"' :
      Link.escapeQuotes( value )
  } else if( needsQuotes( value ) ) {
    value = encodeURIComponent( value )
    // We don't need to escape <SP> <,> <;> within quotes
    value = value
      .replace( /%20/g, ' ' )
      .replace( /%2C/g, ',' )
      .replace( /%3B/g, ';' )

    value = '"' + value + '"'
  }

  return attr + '=' + value

}

module.exports = Link

}).call(this)}).call(this,{"isBuffer":require("../../../../../../AppData/Roaming/npm/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"../../../../../../AppData/Roaming/npm/node_modules/browserify/node_modules/is-buffer/index.js":8}],33:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib/ContextParser"), exports);
__exportStar(require("./lib/ErrorCoded"), exports);
__exportStar(require("./lib/FetchDocumentLoader"), exports);
__exportStar(require("./lib/IDocumentLoader"), exports);
__exportStar(require("./lib/JsonLdContext"), exports);
__exportStar(require("./lib/JsonLdContextNormalized"), exports);
__exportStar(require("./lib/Util"), exports);

},{"./lib/ContextParser":34,"./lib/ErrorCoded":35,"./lib/FetchDocumentLoader":36,"./lib/IDocumentLoader":37,"./lib/JsonLdContext":38,"./lib/JsonLdContextNormalized":39,"./lib/Util":40}],34:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultExpandOptions = exports.ContextParser = void 0;
require("cross-fetch/polyfill");
const relative_to_absolute_iri_1 = require("relative-to-absolute-iri");
const ErrorCoded_1 = require("./ErrorCoded");
const FetchDocumentLoader_1 = require("./FetchDocumentLoader");
const JsonLdContextNormalized_1 = require("./JsonLdContextNormalized");
const Util_1 = require("./Util");
// tslint:disable-next-line:no-var-requires
const canonicalizeJson = require('canonicalize');
/**
 * Parses JSON-LD contexts.
 */
class ContextParser {
    constructor(options) {
        options = options || {};
        this.documentLoader = options.documentLoader || new FetchDocumentLoader_1.FetchDocumentLoader();
        this.documentCache = {};
        this.validateContext = !options.skipValidation;
        this.expandContentTypeToBase = !!options.expandContentTypeToBase;
        this.remoteContextsDepthLimit = options.remoteContextsDepthLimit || 32;
        this.redirectSchemaOrgHttps = 'redirectSchemaOrgHttps' in options ? !!options.redirectSchemaOrgHttps : true;
    }
    /**
     * Validate the given @language value.
     * An error will be thrown if it is invalid.
     * @param value An @language value.
     * @param {boolean} strictRange If the string value should be strictly checked against a regex.
     * @param {string} errorCode The error code to emit on errors.
     * @return {boolean} If validation passed.
     *                   Can only be false if strictRange is false and the string value did not pass the regex.
     */
    static validateLanguage(value, strictRange, errorCode) {
        if (typeof value !== 'string') {
            throw new ErrorCoded_1.ErrorCoded(`The value of an '@language' must be a string, got '${JSON.stringify(value)}'`, errorCode);
        }
        if (!Util_1.Util.REGEX_LANGUAGE_TAG.test(value)) {
            if (strictRange) {
                throw new ErrorCoded_1.ErrorCoded(`The value of an '@language' must be a valid language tag, got '${JSON.stringify(value)}'`, errorCode);
            }
            else {
                return false;
            }
        }
        return true;
    }
    /**
     * Validate the given @direction value.
     * An error will be thrown if it is invalid.
     * @param value An @direction value.
     * @param {boolean} strictValues If the string value should be strictly checked against a regex.
     * @return {boolean} If validation passed.
     *                   Can only be false if strictRange is false and the string value did not pass the regex.
     */
    static validateDirection(value, strictValues) {
        if (typeof value !== 'string') {
            throw new ErrorCoded_1.ErrorCoded(`The value of an '@direction' must be a string, got '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_BASE_DIRECTION);
        }
        if (!Util_1.Util.REGEX_DIRECTION_TAG.test(value)) {
            if (strictValues) {
                throw new ErrorCoded_1.ErrorCoded(`The value of an '@direction' must be 'ltr' or 'rtl', got '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_BASE_DIRECTION);
            }
            else {
                return false;
            }
        }
        return true;
    }
    /**
     * Add an @id term for all @reverse terms.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @return {IJsonLdContextNormalizedRaw} The mutated input context.
     */
    idifyReverseTerms(context) {
        for (const key of Object.keys(context)) {
            const value = context[key];
            if (value && typeof value === 'object') {
                if (value['@reverse'] && !value['@id']) {
                    if (typeof value['@reverse'] !== 'string' || Util_1.Util.isValidKeyword(value['@reverse'])) {
                        throw new ErrorCoded_1.ErrorCoded(`Invalid @reverse value, must be absolute IRI or blank node: '${value['@reverse']}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                    }
                    value['@id'] = value['@reverse'];
                    if (Util_1.Util.isPotentialKeyword(value['@reverse'])) {
                        delete value['@reverse'];
                    }
                    else {
                        value['@reverse'] = true;
                    }
                }
            }
        }
        return context;
    }
    /**
     * Expand all prefixed terms in the given context.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @param {boolean} expandContentTypeToBase If @type inside the context may be expanded
     *                                          via @base if @vocab is set to null.
     */
    expandPrefixedTerms(context, expandContentTypeToBase) {
        const contextRaw = context.getContextRaw();
        for (const key of Object.keys(contextRaw)) {
            // Only expand allowed keys
            if (Util_1.Util.EXPAND_KEYS_BLACKLIST.indexOf(key) < 0 && !Util_1.Util.isReservedInternalKeyword(key)) {
                // Error if we try to alias a keyword to something else.
                const keyValue = contextRaw[key];
                if (Util_1.Util.isPotentialKeyword(key) && Util_1.Util.ALIAS_DOMAIN_BLACKLIST.indexOf(key) >= 0) {
                    if (key !== '@type' || typeof contextRaw[key] === 'object'
                        && !(contextRaw[key]['@protected'] || contextRaw[key]['@container'] === '@set')) {
                        throw new ErrorCoded_1.ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping ${key} to ${JSON.stringify(keyValue)}`, ErrorCoded_1.ERROR_CODES.KEYWORD_REDEFINITION);
                    }
                }
                // Error if we try to alias to an illegal keyword
                if (Util_1.Util.ALIAS_RANGE_BLACKLIST.indexOf(Util_1.Util.getContextValueId(keyValue)) >= 0) {
                    throw new ErrorCoded_1.ErrorCoded(`Aliasing to certain keywords is not allowed.
Tried mapping ${key} to ${JSON.stringify(keyValue)}`, ErrorCoded_1.ERROR_CODES.INVALID_KEYWORD_ALIAS);
                }
                // Error if this term was marked as prefix as well
                if (keyValue && Util_1.Util.isPotentialKeyword(Util_1.Util.getContextValueId(keyValue))
                    && keyValue['@prefix'] === true) {
                    throw new ErrorCoded_1.ErrorCoded(`Tried to use keyword aliases as prefix: '${key}': '${JSON.stringify(keyValue)}'`, ErrorCoded_1.ERROR_CODES.INVALID_TERM_DEFINITION);
                }
                // Loop because prefixes might be nested
                while (Util_1.Util.isPrefixValue(contextRaw[key])) {
                    const value = contextRaw[key];
                    let changed = false;
                    if (typeof value === 'string') {
                        contextRaw[key] = context.expandTerm(value, true);
                        changed = changed || value !== contextRaw[key];
                    }
                    else {
                        const id = value['@id'];
                        const type = value['@type'];
                        // If @id is missing, don't allow @id to be added if @prefix: true and key not being a valid IRI.
                        const canAddIdEntry = !('@prefix' in value) || Util_1.Util.isValidIri(key);
                        if ('@id' in value) {
                            // Use @id value for expansion
                            if (id !== undefined && id !== null && typeof id === 'string') {
                                contextRaw[key]['@id'] = context.expandTerm(id, true);
                                changed = changed || id !== contextRaw[key]['@id'];
                            }
                        }
                        else if (!Util_1.Util.isPotentialKeyword(key) && canAddIdEntry) {
                            // Add an explicit @id value based on the expanded key value
                            const newId = context.expandTerm(key, true);
                            if (newId !== key) {
                                // Don't set @id if expansion failed
                                contextRaw[key]['@id'] = newId;
                                changed = true;
                            }
                        }
                        if (type && typeof type === 'string' && type !== '@vocab'
                            && (!value['@container'] || !value['@container']['@type'])
                            && canAddIdEntry) {
                            // First check @vocab, then fallback to @base
                            contextRaw[key]['@type'] = context.expandTerm(type, true);
                            if (expandContentTypeToBase && type === contextRaw[key]['@type']) {
                                contextRaw[key]['@type'] = context.expandTerm(type, false);
                            }
                            changed = changed || type !== contextRaw[key]['@type'];
                        }
                    }
                    if (!changed) {
                        break;
                    }
                }
            }
        }
    }
    /**
     * Normalize the @language entries in the given context to lowercase.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @param {IParseOptions} parseOptions The parsing options.
     */
    normalize(context, { processingMode, normalizeLanguageTags }) {
        // Lowercase language keys in 1.0
        if (normalizeLanguageTags || processingMode === 1.0) {
            for (const key of Object.keys(context)) {
                if (key === '@language' && typeof context[key] === 'string') {
                    context[key] = context[key].toLowerCase();
                }
                else {
                    const value = context[key];
                    if (value && typeof value === 'object') {
                        if (typeof value['@language'] === 'string') {
                            value['@language'] = value['@language'].toLowerCase();
                        }
                    }
                }
            }
        }
    }
    /**
     * Convert all @container strings and array values to hash-based values.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     */
    containersToHash(context) {
        for (const key of Object.keys(context)) {
            const value = context[key];
            if (value && typeof value === 'object') {
                if (typeof value['@container'] === 'string') {
                    value['@container'] = { [value['@container']]: true };
                }
                else if (Array.isArray(value['@container'])) {
                    const newValue = {};
                    for (const containerValue of value['@container']) {
                        newValue[containerValue] = true;
                    }
                    value['@container'] = newValue;
                }
            }
        }
    }
    /**
     * Normalize and apply context-levevl @protected terms onto each term separately.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @param {number} processingMode The processing mode.
     */
    applyScopedProtected(context, { processingMode }) {
        if (processingMode && processingMode >= 1.1) {
            if (context['@protected']) {
                for (const key of Object.keys(context)) {
                    if (Util_1.Util.isReservedInternalKeyword(key)) {
                        continue;
                    }
                    if (!Util_1.Util.isPotentialKeyword(key) && !Util_1.Util.isTermProtected(context, key)) {
                        const value = context[key];
                        if (value && typeof value === 'object') {
                            if (!('@protected' in context[key])) {
                                // Mark terms with object values as protected if they don't have an @protected: false annotation
                                context[key]['@protected'] = true;
                            }
                        }
                        else {
                            // Convert string-based term values to object-based values with @protected: true
                            context[key] = {
                                '@id': value,
                                '@protected': true,
                            };
                        }
                    }
                }
                delete context['@protected'];
            }
        }
    }
    /**
     * Check if the given context inheritance does not contain any overrides of protected terms.
     * @param {IJsonLdContextNormalizedRaw} contextBefore The context that may contain some protected terms.
     * @param {IJsonLdContextNormalizedRaw} contextAfter A new context that is being applied on the first one.
     * @param {IExpandOptions} expandOptions Options that are needed for any expansions during this validation.
     */
    validateKeywordRedefinitions(contextBefore, contextAfter, expandOptions) {
        for (const key of Object.keys(contextAfter)) {
            if (Util_1.Util.isTermProtected(contextBefore, key)) {
                // The entry in the context before will always be in object-mode
                // If the new entry is in string-mode, convert it to object-mode
                // before checking if it is identical.
                if (typeof contextAfter[key] === 'string') {
                    const isPrefix = Util_1.Util.isSimpleTermDefinitionPrefix(contextAfter[key], expandOptions);
                    contextAfter[key] = { '@id': contextAfter[key] };
                    // If the simple term def was a prefix, explicitly mark the term as a prefix in the expanded term definition,
                    // because otherwise we loose this information due to JSON-LD interpreting prefixes differently
                    // in simple vs expanded term definitions.
                    if (isPrefix) {
                        contextAfter[key]['@prefix'] = true;
                        contextBefore[key]['@prefix'] = true; // Also on before, to make sure the next step still considers them ==
                    }
                }
                // Convert term values to strings for each comparison
                const valueBefore = canonicalizeJson(contextBefore[key]);
                // We modify this deliberately,
                // as we need it for the value comparison (they must be identical modulo '@protected')),
                // and for the fact that this new value will override the first one.
                contextAfter[key]['@protected'] = true;
                const valueAfter = canonicalizeJson(contextAfter[key]);
                // Error if they are not identical
                if (valueBefore !== valueAfter) {
                    throw new ErrorCoded_1.ErrorCoded(`Attempted to override the protected keyword ${key} from ${JSON.stringify(Util_1.Util.getContextValueId(contextBefore[key]))} to ${JSON.stringify(Util_1.Util.getContextValueId(contextAfter[key]))}`, ErrorCoded_1.ERROR_CODES.PROTECTED_TERM_REDEFINITION);
                }
            }
        }
    }
    /**
     * Validate the entries of the given context.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @param {IParseOptions} options The parse options.
     */
    validate(context, { processingMode }) {
        for (const key of Object.keys(context)) {
            // Ignore reserved internal keywords.
            if (Util_1.Util.isReservedInternalKeyword(key)) {
                continue;
            }
            // Do not allow empty term
            if (key === '') {
                throw new ErrorCoded_1.ErrorCoded(`The empty term is not allowed, got: '${key}': '${JSON.stringify(context[key])}'`, ErrorCoded_1.ERROR_CODES.INVALID_TERM_DEFINITION);
            }
            const value = context[key];
            const valueType = typeof value;
            // First check if the key is a keyword
            if (Util_1.Util.isPotentialKeyword(key)) {
                switch (key.substr(1)) {
                    case 'vocab':
                        if (value !== null && valueType !== 'string') {
                            throw new ErrorCoded_1.ErrorCoded(`Found an invalid @vocab IRI: ${value}`, ErrorCoded_1.ERROR_CODES.INVALID_VOCAB_MAPPING);
                        }
                        break;
                    case 'base':
                        if (value !== null && valueType !== 'string') {
                            throw new ErrorCoded_1.ErrorCoded(`Found an invalid @base IRI: ${context[key]}`, ErrorCoded_1.ERROR_CODES.INVALID_BASE_IRI);
                        }
                        break;
                    case 'language':
                        if (value !== null) {
                            ContextParser.validateLanguage(value, true, ErrorCoded_1.ERROR_CODES.INVALID_DEFAULT_LANGUAGE);
                        }
                        break;
                    case 'version':
                        if (value !== null && valueType !== 'number') {
                            throw new ErrorCoded_1.ErrorCoded(`Found an invalid @version number: ${value}`, ErrorCoded_1.ERROR_CODES.INVALID_VERSION_VALUE);
                        }
                        break;
                    case 'direction':
                        if (value !== null) {
                            ContextParser.validateDirection(value, true);
                        }
                        break;
                    case 'propagate':
                        if (processingMode === 1.0) {
                            throw new ErrorCoded_1.ErrorCoded(`Found an illegal @propagate keyword: ${value}`, ErrorCoded_1.ERROR_CODES.INVALID_CONTEXT_ENTRY);
                        }
                        if (value !== null && valueType !== 'boolean') {
                            throw new ErrorCoded_1.ErrorCoded(`Found an invalid @propagate value: ${value}`, ErrorCoded_1.ERROR_CODES.INVALID_PROPAGATE_VALUE);
                        }
                        break;
                }
                // Don't allow keywords to be overridden
                if (Util_1.Util.isValidKeyword(key) && Util_1.Util.isValidKeyword(Util_1.Util.getContextValueId(value))) {
                    throw new ErrorCoded_1.ErrorCoded(`Illegal keyword alias in term value, found: '${key}': '${Util_1.Util
                        .getContextValueId(value)}'`, ErrorCoded_1.ERROR_CODES.KEYWORD_REDEFINITION);
                }
                continue;
            }
            // Otherwise, consider the key a term
            if (value !== null) {
                switch (valueType) {
                    case 'string':
                        if (Util_1.Util.getPrefix(value, context) === key) {
                            throw new ErrorCoded_1.ErrorCoded(`Detected cyclical IRI mapping in context entry: '${key}': '${JSON
                                .stringify(value)}'`, ErrorCoded_1.ERROR_CODES.CYCLIC_IRI_MAPPING);
                        }
                        if (Util_1.Util.isValidIriWeak(key)) {
                            if (value === '@type') {
                                throw new ErrorCoded_1.ErrorCoded(`IRIs can not be mapped to @type, found: '${key}': '${value}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                            }
                            else if (Util_1.Util.isValidIri(value) && value !== new JsonLdContextNormalized_1.JsonLdContextNormalized(context).expandTerm(key)) {
                                throw new ErrorCoded_1.ErrorCoded(`IRIs can not be mapped to other IRIs, found: '${key}': '${value}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                            }
                        }
                        break;
                    case 'object':
                        if (!Util_1.Util.isCompactIri(key) && !('@id' in value)
                            && (value['@type'] === '@id' ? !context['@base'] : !context['@vocab'])) {
                            throw new ErrorCoded_1.ErrorCoded(`Missing @id in context entry: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                        }
                        for (const objectKey of Object.keys(value)) {
                            const objectValue = value[objectKey];
                            if (!objectValue) {
                                continue;
                            }
                            switch (objectKey) {
                                case '@id':
                                    if (Util_1.Util.isValidKeyword(objectValue)
                                        && objectValue !== '@type' && objectValue !== '@id' && objectValue !== '@graph') {
                                        throw new ErrorCoded_1.ErrorCoded(`Illegal keyword alias in term value, found: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                                    }
                                    if (Util_1.Util.isValidIriWeak(key)) {
                                        if (objectValue === '@type') {
                                            throw new ErrorCoded_1.ErrorCoded(`IRIs can not be mapped to @type, found: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                                        }
                                        else if (Util_1.Util.isValidIri(objectValue)
                                            && objectValue !== new JsonLdContextNormalized_1.JsonLdContextNormalized(context).expandTerm(key)) {
                                            throw new ErrorCoded_1.ErrorCoded(`IRIs can not be mapped to other IRIs, found: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                                        }
                                    }
                                    if (typeof objectValue !== 'string') {
                                        throw new ErrorCoded_1.ErrorCoded(`Detected non-string @id in context entry: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
                                    }
                                    if (Util_1.Util.getPrefix(objectValue, context) === key) {
                                        throw new ErrorCoded_1.ErrorCoded(`Detected cyclical IRI mapping in context entry: '${key}': '${JSON
                                            .stringify(value)}'`, ErrorCoded_1.ERROR_CODES.CYCLIC_IRI_MAPPING);
                                    }
                                    break;
                                case '@type':
                                    if (value['@container'] === '@type' && objectValue !== '@id' && objectValue !== '@vocab') {
                                        throw new ErrorCoded_1.ErrorCoded(`@container: @type only allows @type: @id or @vocab, but got: '${key}': '${objectValue}'`, ErrorCoded_1.ERROR_CODES.INVALID_TYPE_MAPPING);
                                    }
                                    if (typeof objectValue !== 'string') {
                                        throw new ErrorCoded_1.ErrorCoded(`The value of an '@type' must be a string, got '${JSON.stringify(valueType)}'`, ErrorCoded_1.ERROR_CODES.INVALID_TYPE_MAPPING);
                                    }
                                    if (objectValue !== '@id' && objectValue !== '@vocab'
                                        && (processingMode === 1.0 || objectValue !== '@json')
                                        && (processingMode === 1.0 || objectValue !== '@none')
                                        && (objectValue[0] === '_' || !Util_1.Util.isValidIri(objectValue))) {
                                        throw new ErrorCoded_1.ErrorCoded(`A context @type must be an absolute IRI, found: '${key}': '${objectValue}'`, ErrorCoded_1.ERROR_CODES.INVALID_TYPE_MAPPING);
                                    }
                                    break;
                                case '@reverse':
                                    if (typeof objectValue === 'string' && value['@id'] && value['@id'] !== objectValue) {
                                        throw new ErrorCoded_1.ErrorCoded(`Found non-matching @id and @reverse term values in '${key}':\
'${objectValue}' and '${value['@id']}'`, ErrorCoded_1.ERROR_CODES.INVALID_REVERSE_PROPERTY);
                                    }
                                    if ('@nest' in value) {
                                        throw new ErrorCoded_1.ErrorCoded(`@nest is not allowed in the reverse property '${key}'`, ErrorCoded_1.ERROR_CODES.INVALID_REVERSE_PROPERTY);
                                    }
                                    break;
                                case '@container':
                                    if (processingMode === 1.0) {
                                        if (Object.keys(objectValue).length > 1
                                            || Util_1.Util.CONTAINERS_1_0.indexOf(Object.keys(objectValue)[0]) < 0) {
                                            throw new ErrorCoded_1.ErrorCoded(`Invalid term @container for '${key}' ('${Object.keys(objectValue)}') in 1.0, \
must be only one of ${Util_1.Util.CONTAINERS_1_0.join(', ')}`, ErrorCoded_1.ERROR_CODES.INVALID_CONTAINER_MAPPING);
                                        }
                                    }
                                    for (const containerValue of Object.keys(objectValue)) {
                                        if (containerValue === '@list' && value['@reverse']) {
                                            throw new ErrorCoded_1.ErrorCoded(`Term value can not be @container: @list and @reverse at the same time on '${key}'`, ErrorCoded_1.ERROR_CODES.INVALID_REVERSE_PROPERTY);
                                        }
                                        if (Util_1.Util.CONTAINERS.indexOf(containerValue) < 0) {
                                            throw new ErrorCoded_1.ErrorCoded(`Invalid term @container for '${key}' ('${containerValue}'), \
must be one of ${Util_1.Util.CONTAINERS.join(', ')}`, ErrorCoded_1.ERROR_CODES.INVALID_CONTAINER_MAPPING);
                                        }
                                    }
                                    break;
                                case '@language':
                                    ContextParser.validateLanguage(objectValue, true, ErrorCoded_1.ERROR_CODES.INVALID_LANGUAGE_MAPPING);
                                    break;
                                case '@direction':
                                    ContextParser.validateDirection(objectValue, true);
                                    break;
                                case '@prefix':
                                    if (objectValue !== null && typeof objectValue !== 'boolean') {
                                        throw new ErrorCoded_1.ErrorCoded(`Found an invalid term @prefix boolean in: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_PREFIX_VALUE);
                                    }
                                    if (!('@id' in value) && !Util_1.Util.isValidIri(key)) {
                                        throw new ErrorCoded_1.ErrorCoded(`Invalid @prefix definition for '${key}' ('${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_TERM_DEFINITION);
                                    }
                                    break;
                                case '@index':
                                    if (processingMode === 1.0 || !value['@container'] || !value['@container']['@index']) {
                                        throw new ErrorCoded_1.ErrorCoded(`Attempt to add illegal key to value object: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_TERM_DEFINITION);
                                    }
                                    break;
                                case '@nest':
                                    if (Util_1.Util.isPotentialKeyword(objectValue) && objectValue !== '@nest') {
                                        throw new ErrorCoded_1.ErrorCoded(`Found an invalid term @nest value in: '${key}': '${JSON.stringify(value)}'`, ErrorCoded_1.ERROR_CODES.INVALID_NEST_VALUE);
                                    }
                            }
                        }
                        break;
                    default:
                        throw new ErrorCoded_1.ErrorCoded(`Found an invalid term value: '${key}': '${value}'`, ErrorCoded_1.ERROR_CODES.INVALID_TERM_DEFINITION);
                }
            }
        }
    }
    /**
     * Apply the @base context entry to the given context under certain circumstances.
     * @param context A context.
     * @param options Parsing options.
     * @param inheritFromParent If the @base value from the parent context can be inherited.
     * @return The given context.
     */
    applyBaseEntry(context, options, inheritFromParent) {
        // In some special cases, this can be a string, so ignore those.
        if (typeof context === 'string') {
            return context;
        }
        // Give priority to @base in the parent context
        if (inheritFromParent && !('@base' in context) && options.parentContext && '@base' in options.parentContext) {
            context['@base'] = options.parentContext['@base'];
            if (options.parentContext['@__baseDocument']) {
                context['@__baseDocument'] = true;
            }
        }
        // Override the base IRI if provided.
        if (options.baseIRI && !options.external) {
            if (!('@base' in context)) {
                // The context base is the document base
                context['@base'] = options.baseIRI;
                context['@__baseDocument'] = true;
            }
            else if (context['@base'] !== null && typeof context['@base'] === 'string'
                && !Util_1.Util.isValidIri(context['@base'])) {
                // The context base is relative to the document base
                context['@base'] = relative_to_absolute_iri_1.resolve(context['@base'], options.parentContext && options.parentContext['@base'] || options.baseIRI);
            }
        }
        return context;
    }
    /**
     * Resolve relative context IRIs, or return full IRIs as-is.
     * @param {string} contextIri A context IRI.
     * @param {string} baseIRI A base IRI.
     * @return {string} The normalized context IRI.
     */
    normalizeContextIri(contextIri, baseIRI) {
        if (!Util_1.Util.isValidIri(contextIri)) {
            contextIri = relative_to_absolute_iri_1.resolve(contextIri, baseIRI);
            if (!Util_1.Util.isValidIri(contextIri)) {
                throw new Error(`Invalid context IRI: ${contextIri}`);
            }
        }
        // TODO: Temporary workaround for fixing schema.org CORS issues (https://github.com/schemaorg/schemaorg/issues/2578#issuecomment-652324465)
        if (this.redirectSchemaOrgHttps && contextIri.startsWith('http://schema.org')) {
            contextIri = 'https://schema.org/';
        }
        return contextIri;
    }
    /**
     * Parse scoped contexts in the given context.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @param {IParseOptions} options Parsing options.
     * @return {IJsonLdContextNormalizedRaw} The mutated input context.
     */
    parseInnerContexts(context, options) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const key of Object.keys(context)) {
                const value = context[key];
                if (value && typeof value === 'object') {
                    if ('@context' in value && value['@context'] !== null) {
                        // Simulate a processing based on the parent context to check if there are any (potential errors).
                        // Honestly, I find it a bit weird to do this here, as the context may be unused,
                        // and the final effective context may differ based on any other embedded/scoped contexts.
                        // But hey, it's part of the spec, so we have no choice...
                        // https://w3c.github.io/json-ld-api/#h-note-10
                        if (this.validateContext) {
                            try {
                                const parentContext = Object.assign({}, context);
                                parentContext[key] = Object.assign({}, parentContext[key]);
                                delete parentContext[key]['@context'];
                                yield this.parse(value['@context'], Object.assign(Object.assign({}, options), { parentContext, ignoreProtection: true, ignoreRemoteScopedContexts: true }));
                            }
                            catch (e) {
                                throw new ErrorCoded_1.ErrorCoded(e.message, ErrorCoded_1.ERROR_CODES.INVALID_SCOPED_CONTEXT);
                            }
                        }
                        value['@context'] = (yield this.parse(value['@context'], Object.assign(Object.assign({}, options), { minimalProcessing: true, ignoreRemoteScopedContexts: true, parentContext: context })))
                            .getContextRaw();
                    }
                }
            }
            return context;
        });
    }
    /**
     * Parse a JSON-LD context in any form.
     * @param {JsonLdContext} context A context, URL to a context, or an array of contexts/URLs.
     * @param {IParseOptions} options Optional parsing options.
     * @return {Promise<JsonLdContextNormalized>} A promise resolving to the context.
     */
    parse(context, options = {
        processingMode: ContextParser.DEFAULT_PROCESSING_MODE,
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { baseIRI, parentContext: parentContextInitial, external, processingMode, normalizeLanguageTags, ignoreProtection, minimalProcessing, } = options;
            let parentContext = parentContextInitial;
            const remoteContexts = options.remoteContexts || {};
            // Avoid remote context overflows
            if (Object.keys(remoteContexts).length >= this.remoteContextsDepthLimit) {
                throw new ErrorCoded_1.ErrorCoded('Detected an overflow in remote context inclusions: ' + Object.keys(remoteContexts), ErrorCoded_1.ERROR_CODES.CONTEXT_OVERFLOW);
            }
            if (context === null || context === undefined) {
                // Don't allow context nullification and there are protected terms
                if (!ignoreProtection && parentContext && Util_1.Util.hasProtectedTerms(parentContext)) {
                    throw new ErrorCoded_1.ErrorCoded('Illegal context nullification when terms are protected', ErrorCoded_1.ERROR_CODES.INVALID_CONTEXT_NULLIFICATION);
                }
                // Context that are explicitly set to null are empty.
                return new JsonLdContextNormalized_1.JsonLdContextNormalized(this.applyBaseEntry({}, options, false));
            }
            else if (typeof context === 'string') {
                const contextIri = this.normalizeContextIri(context, baseIRI);
                const overriddenLoad = this.getOverriddenLoad(contextIri, options);
                if (overriddenLoad) {
                    return new JsonLdContextNormalized_1.JsonLdContextNormalized(overriddenLoad);
                }
                const parsedStringContext = yield this.parse(yield this.load(contextIri), Object.assign(Object.assign({}, options), { baseIRI: contextIri, external: true, remoteContexts: Object.assign(Object.assign({}, remoteContexts), { [contextIri]: true }) }));
                this.applyBaseEntry(parsedStringContext.getContextRaw(), options, true);
                return parsedStringContext;
            }
            else if (Array.isArray(context)) {
                // As a performance consideration, first load all external contexts in parallel.
                const contextIris = [];
                const contexts = yield Promise.all(context.map((subContext, i) => {
                    if (typeof subContext === 'string') {
                        const contextIri = this.normalizeContextIri(subContext, baseIRI);
                        contextIris[i] = contextIri;
                        const overriddenLoad = this.getOverriddenLoad(contextIri, options);
                        if (overriddenLoad) {
                            return overriddenLoad;
                        }
                        return this.load(contextIri);
                    }
                    else {
                        return subContext;
                    }
                }));
                // Don't apply inheritance logic on minimal processing
                if (minimalProcessing) {
                    return new JsonLdContextNormalized_1.JsonLdContextNormalized(contexts);
                }
                const reducedContexts = yield contexts.reduce((accContextPromise, contextEntry, i) => accContextPromise
                    .then((accContext) => this.parse(contextEntry, Object.assign(Object.assign({}, options), { baseIRI: contextIris[i] || options.baseIRI, external: !!contextIris[i] || options.external, parentContext: accContext.getContextRaw(), remoteContexts: contextIris[i] ? Object.assign(Object.assign({}, remoteContexts), { [contextIris[i]]: true }) : remoteContexts }))), Promise.resolve(new JsonLdContextNormalized_1.JsonLdContextNormalized(parentContext || {})));
                // Override the base IRI if provided.
                this.applyBaseEntry(reducedContexts.getContextRaw(), options, true);
                return reducedContexts;
            }
            else if (typeof context === 'object') {
                if ('@context' in context) {
                    return yield this.parse(context['@context'], options);
                }
                // Make a deep clone of the given context, to avoid modifying it.
                context = JSON.parse(JSON.stringify(context)); // No better way in JS at the moment.
                if (parentContext) {
                    parentContext = JSON.parse(JSON.stringify(parentContext));
                }
                // We have an actual context object.
                let newContext = {};
                // According to the JSON-LD spec, @base must be ignored from external contexts.
                if (external) {
                    delete context['@base'];
                }
                // Override the base IRI if provided.
                this.applyBaseEntry(context, options, true);
                // Hashify container entries
                // Do this before protected term validation as that influences term format
                this.containersToHash(context);
                // Don't perform any other modifications if only minimal processing is needed.
                if (minimalProcessing) {
                    return new JsonLdContextNormalized_1.JsonLdContextNormalized(context);
                }
                // In JSON-LD 1.1, load @import'ed context prior to processing.
                let importContext = {};
                if ('@import' in context) {
                    if (processingMode && processingMode >= 1.1) {
                        // Only accept string values
                        if (typeof context['@import'] !== 'string') {
                            throw new ErrorCoded_1.ErrorCoded('An @import value must be a string, but got ' + typeof context['@import'], ErrorCoded_1.ERROR_CODES.INVALID_IMPORT_VALUE);
                        }
                        // Load context
                        importContext = yield this.loadImportContext(this.normalizeContextIri(context['@import'], baseIRI));
                        delete context['@import'];
                    }
                    else {
                        throw new ErrorCoded_1.ErrorCoded('Context importing is not supported in JSON-LD 1.0', ErrorCoded_1.ERROR_CODES.INVALID_CONTEXT_ENTRY);
                    }
                }
                // Merge different parts of the final context in order
                newContext = Object.assign(Object.assign(Object.assign(Object.assign({}, newContext), parentContext), importContext), context);
                const newContextWrapped = new JsonLdContextNormalized_1.JsonLdContextNormalized(newContext);
                // Parse inner contexts with minimal processing
                yield this.parseInnerContexts(newContext, options);
                // In JSON-LD 1.1, check if we are not redefining any protected keywords
                if (!ignoreProtection && parentContext && processingMode && processingMode >= 1.1) {
                    this.validateKeywordRedefinitions(parentContext, newContext, exports.defaultExpandOptions);
                }
                // In JSON-LD 1.1, @vocab can be relative to @vocab in the parent context.
                if ((newContext && newContext['@version'] || processingMode || ContextParser.DEFAULT_PROCESSING_MODE) >= 1.1
                    && ((context['@vocab'] && typeof context['@vocab'] === 'string') || context['@vocab'] === '')
                    && context['@vocab'].indexOf(':') < 0 && parentContext && '@vocab' in parentContext) {
                    newContext['@vocab'] = parentContext['@vocab'] + context['@vocab'];
                }
                this.idifyReverseTerms(newContext);
                this.expandPrefixedTerms(newContextWrapped, this.expandContentTypeToBase);
                this.normalize(newContext, { processingMode, normalizeLanguageTags });
                this.applyScopedProtected(newContext, { processingMode });
                if (this.validateContext) {
                    this.validate(newContext, { processingMode });
                }
                return newContextWrapped;
            }
            else {
                throw new ErrorCoded_1.ErrorCoded(`Tried parsing a context that is not a string, array or object, but got ${context}`, ErrorCoded_1.ERROR_CODES.INVALID_LOCAL_CONTEXT);
            }
        });
    }
    /**
     * Fetch the given URL as a raw JSON-LD context.
     * @param url An URL.
     * @return A promise resolving to a raw JSON-LD context.
     */
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // First try to retrieve the context from cache
            const cached = this.documentCache[url];
            if (cached) {
                return typeof cached === 'string' ? cached : Array.isArray(cached) ? cached.slice() : Object.assign({}, cached);
            }
            // If not in cache, load it
            let document;
            try {
                document = yield this.documentLoader.load(url);
            }
            catch (e) {
                throw new ErrorCoded_1.ErrorCoded(`Failed to load remote context ${url}: ${e.message}`, ErrorCoded_1.ERROR_CODES.LOADING_REMOTE_CONTEXT_FAILED);
            }
            // Validate the context
            if (!('@context' in document)) {
                throw new ErrorCoded_1.ErrorCoded(`Missing @context in remote context at ${url}`, ErrorCoded_1.ERROR_CODES.INVALID_REMOTE_CONTEXT);
            }
            return this.documentCache[url] = document['@context'];
        });
    }
    /**
     * Override the given context that may be loaded.
     *
     * This will check whether or not the url is recursively being loaded.
     * @param url An URL.
     * @param options Parsing options.
     * @return An overridden context, or null.
     *         Optionally an error can be thrown if a cyclic context is detected.
     */
    getOverriddenLoad(url, options) {
        if (url in (options.remoteContexts || {})) {
            if (options.ignoreRemoteScopedContexts) {
                return url;
            }
            else {
                throw new ErrorCoded_1.ErrorCoded('Detected a cyclic context inclusion of ' + url, ErrorCoded_1.ERROR_CODES.RECURSIVE_CONTEXT_INCLUSION);
            }
        }
        return null;
    }
    /**
     * Load an @import'ed context.
     * @param importContextIri The full URI of an @import value.
     */
    loadImportContext(importContextIri) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load the context
            const importContext = yield this.load(importContextIri);
            // Require the context to be a non-array object
            if (typeof importContext !== 'object' || Array.isArray(importContext)) {
                throw new ErrorCoded_1.ErrorCoded('An imported context must be a single object: ' + importContextIri, ErrorCoded_1.ERROR_CODES.INVALID_REMOTE_CONTEXT);
            }
            // Error if the context contains another @import
            if ('@import' in importContext) {
                throw new ErrorCoded_1.ErrorCoded('An imported context can not import another context: ' + importContextIri, ErrorCoded_1.ERROR_CODES.INVALID_CONTEXT_ENTRY);
            }
            return importContext;
        });
    }
}
exports.ContextParser = ContextParser;
ContextParser.DEFAULT_PROCESSING_MODE = 1.1;
exports.defaultExpandOptions = {
    allowPrefixForcing: true,
    allowPrefixNonGenDelims: false,
    allowVocabRelativeToBase: true,
};

},{"./ErrorCoded":35,"./FetchDocumentLoader":36,"./JsonLdContextNormalized":39,"./Util":40,"canonicalize":30,"cross-fetch/polyfill":31,"relative-to-absolute-iri":72}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.ErrorCoded = void 0;
/**
 * An error that has a certain error code.
 *
 * The error code can be any string.
 * All standardized error codes are listed in {@link ERROR_CODES}.
 */
class ErrorCoded extends Error {
    /* istanbul ignore next */
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.ErrorCoded = ErrorCoded;
/**
 * All standardized JSON-LD error codes.
 * @see https://w3c.github.io/json-ld-api/#dom-jsonlderrorcode
 */
// tslint:disable:object-literal-sort-keys
var ERROR_CODES;
(function (ERROR_CODES) {
    ERROR_CODES["COLLIDING_KEYWORDS"] = "colliding keywords";
    ERROR_CODES["CONFLICTING_INDEXES"] = "conflicting indexes";
    ERROR_CODES["CYCLIC_IRI_MAPPING"] = "cyclic IRI mapping";
    ERROR_CODES["INVALID_ID_VALUE"] = "invalid @id value";
    ERROR_CODES["INVALID_INDEX_VALUE"] = "invalid @index value";
    ERROR_CODES["INVALID_NEST_VALUE"] = "invalid @nest value";
    ERROR_CODES["INVALID_PREFIX_VALUE"] = "invalid @prefix value";
    ERROR_CODES["INVALID_PROPAGATE_VALUE"] = "invalid @propagate value";
    ERROR_CODES["INVALID_REVERSE_VALUE"] = "invalid @reverse value";
    ERROR_CODES["INVALID_IMPORT_VALUE"] = "invalid @import value";
    ERROR_CODES["INVALID_VERSION_VALUE"] = "invalid @version value";
    ERROR_CODES["INVALID_BASE_IRI"] = "invalid base IRI";
    ERROR_CODES["INVALID_CONTAINER_MAPPING"] = "invalid container mapping";
    ERROR_CODES["INVALID_CONTEXT_ENTRY"] = "invalid context entry";
    ERROR_CODES["INVALID_CONTEXT_NULLIFICATION"] = "invalid context nullification";
    ERROR_CODES["INVALID_DEFAULT_LANGUAGE"] = "invalid default language";
    ERROR_CODES["INVALID_INCLUDED_VALUE"] = "invalid @included value";
    ERROR_CODES["INVALID_IRI_MAPPING"] = "invalid IRI mapping";
    ERROR_CODES["INVALID_JSON_LITERAL"] = "invalid JSON literal";
    ERROR_CODES["INVALID_KEYWORD_ALIAS"] = "invalid keyword alias";
    ERROR_CODES["INVALID_LANGUAGE_MAP_VALUE"] = "invalid language map value";
    ERROR_CODES["INVALID_LANGUAGE_MAPPING"] = "invalid language mapping";
    ERROR_CODES["INVALID_LANGUAGE_TAGGED_STRING"] = "invalid language-tagged string";
    ERROR_CODES["INVALID_LANGUAGE_TAGGED_VALUE"] = "invalid language-tagged value";
    ERROR_CODES["INVALID_LOCAL_CONTEXT"] = "invalid local context";
    ERROR_CODES["INVALID_REMOTE_CONTEXT"] = "invalid remote context";
    ERROR_CODES["INVALID_REVERSE_PROPERTY"] = "invalid reverse property";
    ERROR_CODES["INVALID_REVERSE_PROPERTY_MAP"] = "invalid reverse property map";
    ERROR_CODES["INVALID_REVERSE_PROPERTY_VALUE"] = "invalid reverse property value";
    ERROR_CODES["INVALID_SCOPED_CONTEXT"] = "invalid scoped context";
    ERROR_CODES["INVALID_SCRIPT_ELEMENT"] = "invalid script element";
    ERROR_CODES["INVALID_SET_OR_LIST_OBJECT"] = "invalid set or list object";
    ERROR_CODES["INVALID_TERM_DEFINITION"] = "invalid term definition";
    ERROR_CODES["INVALID_TYPE_MAPPING"] = "invalid type mapping";
    ERROR_CODES["INVALID_TYPE_VALUE"] = "invalid type value";
    ERROR_CODES["INVALID_TYPED_VALUE"] = "invalid typed value";
    ERROR_CODES["INVALID_VALUE_OBJECT"] = "invalid value object";
    ERROR_CODES["INVALID_VALUE_OBJECT_VALUE"] = "invalid value object value";
    ERROR_CODES["INVALID_VOCAB_MAPPING"] = "invalid vocab mapping";
    ERROR_CODES["IRI_CONFUSED_WITH_PREFIX"] = "IRI confused with prefix";
    ERROR_CODES["KEYWORD_REDEFINITION"] = "keyword redefinition";
    ERROR_CODES["LOADING_DOCUMENT_FAILED"] = "loading document failed";
    ERROR_CODES["LOADING_REMOTE_CONTEXT_FAILED"] = "loading remote context failed";
    ERROR_CODES["MULTIPLE_CONTEXT_LINK_HEADERS"] = "multiple context link headers";
    ERROR_CODES["PROCESSING_MODE_CONFLICT"] = "processing mode conflict";
    ERROR_CODES["PROTECTED_TERM_REDEFINITION"] = "protected term redefinition";
    ERROR_CODES["CONTEXT_OVERFLOW"] = "context overflow";
    ERROR_CODES["INVALID_BASE_DIRECTION"] = "invalid base direction";
    ERROR_CODES["RECURSIVE_CONTEXT_INCLUSION"] = "recursive context inclusion";
    ERROR_CODES["INVALID_STREAMING_KEY_ORDER"] = "invalid streaming key order";
})(ERROR_CODES = exports.ERROR_CODES || (exports.ERROR_CODES = {}));

},{}],36:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchDocumentLoader = void 0;
require("cross-fetch/polyfill");
const ErrorCoded_1 = require("./ErrorCoded");
const http_link_header_1 = require("http-link-header");
const relative_to_absolute_iri_1 = require("relative-to-absolute-iri");
/**
 * Loads documents via the fetch API.
 */
class FetchDocumentLoader {
    constructor(fetcher) {
        this.fetcher = fetcher;
    }
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (this.fetcher || fetch)(url, { headers: new Headers({ accept: 'application/ld+json' }) });
            if (response.ok && response.headers) {
                let mediaType = response.headers.get('Content-Type');
                if (mediaType) {
                    const colonPos = mediaType.indexOf(';');
                    if (colonPos > 0) {
                        mediaType = mediaType.substr(0, colonPos);
                    }
                }
                if (mediaType === 'application/ld+json') {
                    // Return JSON-LD if proper content type was returned
                    return (yield response.json());
                }
                else {
                    // Check for alternate link for a non-JSON-LD response
                    if (response.headers.has('Link')) {
                        let alternateUrl;
                        response.headers.forEach((value, key) => {
                            if (key === 'link') {
                                const linkHeader = http_link_header_1.parse(value);
                                for (const link of linkHeader.get('type', 'application/ld+json')) {
                                    if (link.rel === 'alternate') {
                                        if (alternateUrl) {
                                            throw new Error('Multiple JSON-LD alternate links were found on ' + url);
                                        }
                                        alternateUrl = relative_to_absolute_iri_1.resolve(link.uri, url);
                                    }
                                }
                            }
                        });
                        if (alternateUrl) {
                            return this.load(alternateUrl);
                        }
                    }
                    throw new ErrorCoded_1.ErrorCoded(`Unsupported JSON-LD media type ${mediaType}`, ErrorCoded_1.ERROR_CODES.LOADING_DOCUMENT_FAILED);
                }
            }
            else {
                throw new Error(response.statusText || `Status code: ${response.status}`);
            }
        });
    }
}
exports.FetchDocumentLoader = FetchDocumentLoader;

},{"./ErrorCoded":35,"cross-fetch/polyfill":31,"http-link-header":32,"relative-to-absolute-iri":72}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
// tslint:disable:max-line-length
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonLdContextNormalized = void 0;
const relative_to_absolute_iri_1 = require("relative-to-absolute-iri");
const ContextParser_1 = require("./ContextParser");
const ErrorCoded_1 = require("./ErrorCoded");
const Util_1 = require("./Util");
/**
 * A class exposing operations over a normalized JSON-LD context.
 */
class JsonLdContextNormalized {
    constructor(contextRaw) {
        this.contextRaw = contextRaw;
    }
    /**
     * @return The raw inner context.
     */
    getContextRaw() {
        return this.contextRaw;
    }
    /**
     * Expand the term or prefix of the given term if it has one,
     * otherwise return the term as-is.
     *
     * This will try to expand the IRI as much as possible.
     *
     * Iff in vocab-mode, then other references to other terms in the context can be used,
     * such as to `myTerm`:
     * ```
     * {
     *   "myTerm": "http://example.org/myLongTerm"
     * }
     * ```
     *
     * @param {string} term A term that is an URL or a prefixed URL.
     * @param {boolean} expandVocab If the term is a predicate or type and should be expanded based on @vocab,
     *                              otherwise it is considered a regular term that is expanded based on @base.
     * @param {IExpandOptions} options Options that define the way how expansion must be done.
     * @return {string} The expanded term, the term as-is, or null if it was explicitly disabled in the context.
     * @throws If the term is aliased to an invalid value (not a string, IRI or keyword).
     */
    expandTerm(term, expandVocab, options = ContextParser_1.defaultExpandOptions) {
        const contextValue = this.contextRaw[term];
        // Immediately return if the term was disabled in the context
        if (contextValue === null || (contextValue && contextValue['@id'] === null)) {
            return null;
        }
        // Check the @id
        let validIriMapping = true;
        if (contextValue && expandVocab) {
            const value = Util_1.Util.getContextValueId(contextValue);
            if (value && value !== term) {
                if (typeof value !== 'string' || (!Util_1.Util.isValidIri(value) && !Util_1.Util.isValidKeyword(value))) {
                    // Don't mark this mapping as invalid if we have an unknown keyword, but of the correct form.
                    if (!Util_1.Util.isPotentialKeyword(value)) {
                        validIriMapping = false;
                    }
                }
                else {
                    return value;
                }
            }
        }
        // Check if the term is prefixed
        const prefix = Util_1.Util.getPrefix(term, this.contextRaw);
        const vocab = this.contextRaw['@vocab'];
        const vocabRelative = (!!vocab || vocab === '') && vocab.indexOf(':') < 0;
        const base = this.contextRaw['@base'];
        const potentialKeyword = Util_1.Util.isPotentialKeyword(term);
        if (prefix) {
            const contextPrefixValue = this.contextRaw[prefix];
            const value = Util_1.Util.getContextValueId(contextPrefixValue);
            if (value) {
                if (typeof contextPrefixValue === 'string' || !options.allowPrefixForcing) {
                    // If we have a simple term definition,
                    // check the last character of the prefix to determine whether or not it is a prefix.
                    // Validate that prefix ends with gen-delim character, unless @prefix is true
                    if (!Util_1.Util.isSimpleTermDefinitionPrefix(value, options)) {
                        // Treat the term as an absolute IRI
                        return term;
                    }
                }
                else {
                    // If we have an expanded term definition, default to @prefix: false
                    if (value[0] !== '_' && !potentialKeyword && !contextPrefixValue['@prefix'] && !(term in this.contextRaw)) {
                        // Treat the term as an absolute IRI
                        return term;
                    }
                }
                return value + term.substr(prefix.length + 1);
            }
        }
        else if (expandVocab && ((vocab || vocab === '') || (options.allowVocabRelativeToBase && (base && vocabRelative)))
            && !potentialKeyword && !Util_1.Util.isCompactIri(term)) {
            if (vocabRelative) {
                if (options.allowVocabRelativeToBase) {
                    return relative_to_absolute_iri_1.resolve(vocab, base) + term;
                }
                else {
                    throw new ErrorCoded_1.ErrorCoded(`Relative vocab expansion for term '${term}' with vocab '${vocab}' is not allowed.`, ErrorCoded_1.ERROR_CODES.INVALID_VOCAB_MAPPING);
                }
            }
            else {
                return vocab + term;
            }
        }
        else if (!expandVocab && base && !potentialKeyword && !Util_1.Util.isCompactIri(term)) {
            return relative_to_absolute_iri_1.resolve(term, base);
        }
        // Return the term as-is, unless we discovered an invalid IRI mapping for this term in the context earlier.
        if (validIriMapping) {
            return term;
        }
        else {
            throw new ErrorCoded_1.ErrorCoded(`Invalid IRI mapping found for context entry '${term}': '${JSON.stringify(contextValue)}'`, ErrorCoded_1.ERROR_CODES.INVALID_IRI_MAPPING);
        }
    }
    /**
     * Compact the given term using @base, @vocab, an aliased term, or a prefixed term.
     *
     * This will try to compact the IRI as much as possible.
     *
     * @param {string} iri An IRI to compact.
     * @param {boolean} vocab If the term is a predicate or type and should be compacted based on @vocab,
     *                        otherwise it is considered a regular term that is compacted based on @base.
     * @return {string} The compacted term or the IRI as-is.
     */
    compactIri(iri, vocab) {
        // Try @vocab compacting
        if (vocab && this.contextRaw['@vocab'] && iri.startsWith(this.contextRaw['@vocab'])) {
            return iri.substr(this.contextRaw['@vocab'].length);
        }
        // Try @base compacting
        if (!vocab && this.contextRaw['@base'] && iri.startsWith(this.contextRaw['@base'])) {
            return iri.substr(this.contextRaw['@base'].length);
        }
        // Loop over all terms in the context
        // This will try to prefix as short as possible.
        // Once a fully compacted alias is found, return immediately, as we can not go any shorter.
        const shortestPrefixing = { prefix: '', suffix: iri };
        for (const key in this.contextRaw) {
            const value = this.contextRaw[key];
            if (value && !Util_1.Util.isPotentialKeyword(key)) {
                const contextIri = Util_1.Util.getContextValueId(value);
                if (iri.startsWith(contextIri)) {
                    const suffix = iri.substr(contextIri.length);
                    if (!suffix) {
                        if (vocab) {
                            // Immediately return on compacted alias
                            return key;
                        }
                    }
                    else if (suffix.length < shortestPrefixing.suffix.length) {
                        // Overwrite the shortest prefix
                        shortestPrefixing.prefix = key;
                        shortestPrefixing.suffix = suffix;
                    }
                }
            }
        }
        // Return the shortest prefix
        if (shortestPrefixing.prefix) {
            return shortestPrefixing.prefix + ':' + shortestPrefixing.suffix;
        }
        return iri;
    }
}
exports.JsonLdContextNormalized = JsonLdContextNormalized;

},{"./ContextParser":34,"./ErrorCoded":35,"./Util":40,"relative-to-absolute-iri":72}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util {
    /**
     * Check if the given term is a valid compact IRI.
     * Otherwise, it may be an IRI.
     * @param {string} term A term.
     * @return {boolean} If it is a compact IRI.
     */
    static isCompactIri(term) {
        return term.indexOf(':') > 0 && !(term && term[0] === '#');
    }
    /**
     * Get the prefix from the given term.
     * @see https://json-ld.org/spec/latest/json-ld/#compact-iris
     * @param {string} term A term that is an URL or a prefixed URL.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @return {string} The prefix or null.
     */
    static getPrefix(term, context) {
        // Do not consider relative IRIs starting with a hash as compact IRIs
        if (term && term[0] === '#') {
            return null;
        }
        const separatorPos = term.indexOf(':');
        if (separatorPos >= 0) {
            // Suffix can not begin with two slashes
            if (term.length > separatorPos + 1
                && term.charAt(separatorPos + 1) === '/'
                && term.charAt(separatorPos + 2) === '/') {
                return null;
            }
            const prefix = term.substr(0, separatorPos);
            // Prefix can not be an underscore (this is a blank node)
            if (prefix === '_') {
                return null;
            }
            // Prefix must match a term in the active context
            if (context[prefix]) {
                return prefix;
            }
        }
        return null;
    }
    /**
     * From a given context entry value, get the string value, or the @id field.
     * @param contextValue A value for a term in a context.
     * @return {string} The id value, or null.
     */
    static getContextValueId(contextValue) {
        if (contextValue === null || typeof contextValue === 'string') {
            return contextValue;
        }
        const id = contextValue['@id'];
        return id ? id : null;
    }
    /**
     * Check if the given simple term definition (string-based value of a context term)
     * should be considered a prefix.
     * @param value A simple term definition value.
     * @param options Options that define the way how expansion must be done.
     */
    static isSimpleTermDefinitionPrefix(value, options) {
        return !Util.isPotentialKeyword(value)
            && (value[0] === '_' || options.allowPrefixNonGenDelims || Util.isPrefixIriEndingWithGenDelim(value));
    }
    /**
     * Check if the given keyword is of the keyword format "@"1*ALPHA.
     * @param {string} keyword A potential keyword.
     * @return {boolean} If the given keyword is of the keyword format.
     */
    static isPotentialKeyword(keyword) {
        return typeof keyword === 'string' && Util.KEYWORD_REGEX.test(keyword);
    }
    /**
     * Check if the given prefix ends with a gen-delim character.
     * @param {string} prefixIri A prefix IRI.
     * @return {boolean} If the given prefix IRI is valid.
     */
    static isPrefixIriEndingWithGenDelim(prefixIri) {
        return Util.ENDS_WITH_GEN_DELIM.test(prefixIri);
    }
    /**
     * Check if the given context value can be a prefix value.
     * @param value A context value.
     * @return {boolean} If it can be a prefix value.
     */
    static isPrefixValue(value) {
        return value && (typeof value === 'string' || (value && typeof value === 'object'));
    }
    /**
     * Check if the given IRI is valid.
     * @param {string} iri A potential IRI.
     * @return {boolean} If the given IRI is valid.
     */
    static isValidIri(iri) {
        return Util.IRI_REGEX.test(iri);
    }
    /**
     * Check if the given IRI is valid, this includes the possibility of being a relative IRI.
     * @param {string} iri A potential IRI.
     * @return {boolean} If the given IRI is valid.
     */
    static isValidIriWeak(iri) {
        return !!iri && iri[0] !== ':' && Util.IRI_REGEX_WEAK.test(iri);
    }
    /**
     * Check if the given keyword is a defined according to the JSON-LD specification.
     * @param {string} keyword A potential keyword.
     * @return {boolean} If the given keyword is valid.
     */
    static isValidKeyword(keyword) {
        return Util.VALID_KEYWORDS[keyword];
    }
    /**
     * Check if the given term is protected in the context.
     * @param {IJsonLdContextNormalizedRaw} context A context.
     * @param {string} key A context term.
     * @return {boolean} If the given term has an @protected flag.
     */
    static isTermProtected(context, key) {
        const value = context[key];
        return !(typeof value === 'string') && value && value['@protected'];
    }
    /**
     * Check if the given context has at least one protected term.
     * @param context A context.
     * @return If the context has a protected term.
     */
    static hasProtectedTerms(context) {
        for (const key of Object.keys(context)) {
            if (Util.isTermProtected(context, key)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check if the given key is an internal reserved keyword.
     * @param key A context key.
     */
    static isReservedInternalKeyword(key) {
        return key.startsWith('@__');
    }
}
exports.Util = Util;
// Regex for valid IRIs
Util.IRI_REGEX = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^ "<>{}|\\\[\]`#]*(#[^#]*)?$/;
// Weaker regex for valid IRIs, this includes relative IRIs
Util.IRI_REGEX_WEAK = /(?::[^:])|\//;
// Regex for keyword form
Util.KEYWORD_REGEX = /^@[a-z]+$/i;
// Regex to see if an IRI ends with a gen-delim character (see RFC 3986)
Util.ENDS_WITH_GEN_DELIM = /[:/?#\[\]@]$/;
// Regex for language tags
Util.REGEX_LANGUAGE_TAG = /^[a-zA-Z]+(-[a-zA-Z0-9]+)*$/;
// Regex for base directions
Util.REGEX_DIRECTION_TAG = /^(ltr)|(rtl)$/;
// All known valid JSON-LD keywords
// @see https://www.w3.org/TR/json-ld11/#keywords
Util.VALID_KEYWORDS = {
    '@base': true,
    '@container': true,
    '@context': true,
    '@direction': true,
    '@graph': true,
    '@id': true,
    '@import': true,
    '@included': true,
    '@index': true,
    '@json': true,
    '@language': true,
    '@list': true,
    '@nest': true,
    '@none': true,
    '@prefix': true,
    '@propagate': true,
    '@protected': true,
    '@reverse': true,
    '@set': true,
    '@type': true,
    '@value': true,
    '@version': true,
    '@vocab': true,
};
// Keys in the contexts that will not be expanded based on the base IRI
Util.EXPAND_KEYS_BLACKLIST = [
    '@base',
    '@vocab',
    '@language',
    '@version',
    '@direction',
];
// Keys in the contexts that may not be aliased from
Util.ALIAS_DOMAIN_BLACKLIST = [
    '@container',
    '@graph',
    '@id',
    '@index',
    '@list',
    '@nest',
    '@none',
    '@prefix',
    '@reverse',
    '@set',
    '@type',
    '@value',
    '@version',
];
// Keys in the contexts that may not be aliased to
Util.ALIAS_RANGE_BLACKLIST = [
    '@context',
    '@preserve',
];
// All valid @container values
Util.CONTAINERS = [
    '@list',
    '@set',
    '@index',
    '@language',
    '@graph',
    '@id',
    '@type',
];
// All valid @container values under processing mode 1.0
Util.CONTAINERS_1_0 = [
    '@list',
    '@set',
    '@index',
];

},{}],41:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib/JsonLdParser"), exports);

},{"./lib/JsonLdParser":43}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextTree = void 0;
/**
 * A tree structure that holds all contexts,
 * based on their position in the JSON object.
 *
 * Positions are identified by a path of keys.
 */
class ContextTree {
    constructor() {
        this.subTrees = {};
    }
    getContext(keys) {
        if (keys.length > 0) {
            const [head, ...tail] = keys;
            const subTree = this.subTrees[head];
            if (subTree) {
                const subContext = subTree.getContext(tail);
                if (subContext) {
                    return subContext.then(({ context, depth }) => ({ context, depth: depth + 1 }));
                }
            }
        }
        return this.context ? this.context.then((context) => ({ context, depth: 0 })) : null;
    }
    setContext(keys, context) {
        if (keys.length === 0) {
            this.context = context;
        }
        else {
            const [head, ...tail] = keys;
            let subTree = this.subTrees[head];
            if (!subTree) {
                subTree = this.subTrees[head] = new ContextTree();
            }
            subTree.setContext(tail, context);
        }
    }
    removeContext(path) {
        this.setContext(path, null);
    }
}
exports.ContextTree = ContextTree;

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonLdParser = void 0;
// tslint:disable-next-line:no-var-requires
const Parser = require('jsonparse');
const jsonld_context_parser_1 = require("jsonld-context-parser");
const stream_1 = require("stream");
const EntryHandlerArrayValue_1 = require("./entryhandler/EntryHandlerArrayValue");
const EntryHandlerContainer_1 = require("./entryhandler/EntryHandlerContainer");
const EntryHandlerInvalidFallback_1 = require("./entryhandler/EntryHandlerInvalidFallback");
const EntryHandlerPredicate_1 = require("./entryhandler/EntryHandlerPredicate");
const EntryHandlerKeywordContext_1 = require("./entryhandler/keyword/EntryHandlerKeywordContext");
const EntryHandlerKeywordGraph_1 = require("./entryhandler/keyword/EntryHandlerKeywordGraph");
const EntryHandlerKeywordId_1 = require("./entryhandler/keyword/EntryHandlerKeywordId");
const EntryHandlerKeywordIncluded_1 = require("./entryhandler/keyword/EntryHandlerKeywordIncluded");
const EntryHandlerKeywordNest_1 = require("./entryhandler/keyword/EntryHandlerKeywordNest");
const EntryHandlerKeywordType_1 = require("./entryhandler/keyword/EntryHandlerKeywordType");
const EntryHandlerKeywordUnknownFallback_1 = require("./entryhandler/keyword/EntryHandlerKeywordUnknownFallback");
const EntryHandlerKeywordValue_1 = require("./entryhandler/keyword/EntryHandlerKeywordValue");
const ParsingContext_1 = require("./ParsingContext");
const Util_1 = require("./Util");
const http_link_header_1 = require("http-link-header");
/**
 * A stream transformer that parses JSON-LD (text) streams to an {@link RDF.Stream}.
 */
class JsonLdParser extends stream_1.Transform {
    constructor(options) {
        super({ readableObjectMode: true });
        options = options || {};
        this.options = options;
        this.parsingContext = new ParsingContext_1.ParsingContext(Object.assign({ parser: this }, options));
        this.util = new Util_1.Util({ dataFactory: options.dataFactory, parsingContext: this.parsingContext });
        this.jsonParser = new Parser();
        this.contextJobs = [];
        this.typeJobs = [];
        this.contextAwaitingJobs = [];
        this.lastDepth = 0;
        this.lastKeys = [];
        this.lastOnValueJob = Promise.resolve();
        this.attachJsonParserListeners();
    }
    /**
     * Construct a JsonLdParser from the given HTTP response.
     *
     * This will throw an error if no valid JSON response is received
     * (application/ld+json, application/json, or something+json).
     *
     * For raw JSON responses, exactly one link header pointing to a JSON-LD context is required.
     *
     * This method is not responsible for handling redirects.
     *
     * @param baseIRI The URI of the received response.
     * @param mediaType The received content type.
     * @param headers Optional HTTP headers.
     * @param options Optional parser options.
     */
    static fromHttpResponse(baseIRI, mediaType, headers, options) {
        let context;
        // Special cases when receiving something else than the JSON-LD media type
        if (mediaType !== 'application/ld+json') {
            // Only accept JSON or JSON extension types
            if (mediaType !== 'application/json' && !mediaType.endsWith('+json')) {
                throw new jsonld_context_parser_1.ErrorCoded(`Unsupported JSON-LD media type ${mediaType}`, jsonld_context_parser_1.ERROR_CODES.LOADING_DOCUMENT_FAILED);
            }
            // We need exactly one JSON-LD context in the link header
            if (headers && headers.has('Link')) {
                headers.forEach((value, key) => {
                    if (key === 'link') {
                        const linkHeader = http_link_header_1.parse(value);
                        for (const link of linkHeader.get('rel', 'http://www.w3.org/ns/json-ld#context')) {
                            if (context) {
                                throw new jsonld_context_parser_1.ErrorCoded('Multiple JSON-LD context link headers were found on ' + baseIRI, jsonld_context_parser_1.ERROR_CODES.MULTIPLE_CONTEXT_LINK_HEADERS);
                            }
                            context = link.uri;
                        }
                    }
                });
            }
            if (!context && !(options === null || options === void 0 ? void 0 : options.ignoreMissingContextLinkHeader)) {
                throw new jsonld_context_parser_1.ErrorCoded(`Missing context link header for media type ${mediaType} on ${baseIRI}`, jsonld_context_parser_1.ERROR_CODES.LOADING_DOCUMENT_FAILED);
            }
        }
        // Check if the streaming profile is present
        let streamingProfile;
        if (headers && headers.has('Content-Type')) {
            const contentType = headers.get('Content-Type');
            const match = /; *profile=([^"]*)/.exec(contentType);
            if (match && match[1] === 'http://www.w3.org/ns/json-ld#streaming') {
                streamingProfile = true;
            }
        }
        return new JsonLdParser(Object.assign({ baseIRI,
            context,
            streamingProfile }, options ? options : {}));
    }
    /**
     * Parses the given text stream into a quad stream.
     * @param {NodeJS.EventEmitter} stream A text stream.
     * @return {RDF.Stream} A quad stream.
     */
    import(stream) {
        const output = new stream_1.PassThrough({ readableObjectMode: true });
        stream.on('error', (error) => parsed.emit('error', error));
        stream.on('data', (data) => output.push(data));
        stream.on('end', () => output.push(null));
        const parsed = output.pipe(new JsonLdParser(this.options));
        return parsed;
    }
    _transform(chunk, encoding, callback) {
        this.jsonParser.write(chunk);
        this.lastOnValueJob
            .then(() => callback(), (error) => callback(error));
    }
    /**
     * Start a new job for parsing the given value.
     *
     * This will let the first valid {@link IEntryHandler} handle the entry.
     *
     * @param {any[]} keys The stack of keys.
     * @param value The value to parse.
     * @param {number} depth The depth to parse at.
     * @param {boolean} lastDepthCheck If the lastDepth check should be done for buffer draining.
     * @return {Promise<void>} A promise resolving when the job is done.
     */
    async newOnValueJob(keys, value, depth, lastDepthCheck) {
        let flushStacks = true;
        // When we go up the stack, emit all unidentified values
        // We need to do this before the new job, because the new job may require determined values from the flushed jobs.
        if (lastDepthCheck && depth < this.lastDepth) {
            // Check if we had any RDF lists that need to be terminated with an rdf:nil
            const listPointer = this.parsingContext.listPointerStack[this.lastDepth];
            if (listPointer) {
                // Terminate the list if the had at least one value
                if (listPointer.value) {
                    this.emit('data', this.util.dataFactory.quad(listPointer.value, this.util.rdfRest, this.util.rdfNil, this.util.getDefaultGraph()));
                }
                // Add the list id to the id stack, so it can be used higher up in the stack
                listPointer.listId.listHead = true;
                this.parsingContext.idStack[listPointer.listRootDepth + 1] = [listPointer.listId];
                this.parsingContext.listPointerStack.splice(this.lastDepth, 1);
            }
            // Flush the buffer for lastDepth
            // If the parent key is a special type of container, postpone flushing until that parent is handled.
            if (await EntryHandlerContainer_1.EntryHandlerContainer.isBufferableContainerHandler(this.parsingContext, this.lastKeys, this.lastDepth)) {
                this.parsingContext.pendingContainerFlushBuffers
                    .push({ depth: this.lastDepth, keys: this.lastKeys.slice(0, this.lastKeys.length) });
                flushStacks = false;
            }
            else {
                await this.flushBuffer(this.lastDepth, this.lastKeys);
            }
        }
        const key = await this.util.unaliasKeyword(keys[depth], keys, depth);
        const parentKey = await this.util.unaliasKeywordParent(keys, depth);
        this.parsingContext.emittedStack[depth] = true;
        let handleKey = true;
        // Keywords inside @reverse is not allowed
        if (jsonld_context_parser_1.Util.isValidKeyword(key) && parentKey === '@reverse') {
            this.emit('error', new jsonld_context_parser_1.ErrorCoded(`Found the @id '${value}' inside an @reverse property`, jsonld_context_parser_1.ERROR_CODES.INVALID_REVERSE_PROPERTY_MAP));
        }
        // Skip further processing if one of the parent nodes are invalid.
        // We use the validationStack to reuse validation results that were produced before with common key stacks.
        let inProperty = false;
        if (this.parsingContext.validationStack.length > 1) {
            inProperty = this.parsingContext.validationStack[this.parsingContext.validationStack.length - 1].property;
        }
        for (let i = Math.max(1, this.parsingContext.validationStack.length - 1); i < keys.length - 1; i++) {
            const validationResult = this.parsingContext.validationStack[i]
                || (this.parsingContext.validationStack[i] = await this.validateKey(keys.slice(0, i + 1), i, inProperty));
            if (!validationResult.valid) {
                this.parsingContext.emittedStack[depth] = false;
                handleKey = false;
                break;
            }
            else if (!inProperty && validationResult.property) {
                inProperty = true;
            }
        }
        // Skip further processing if this node is part of a literal
        if (this.util.isLiteral(depth)) {
            handleKey = false;
        }
        // Get handler
        if (handleKey) {
            for (const entryHandler of JsonLdParser.ENTRY_HANDLERS) {
                const testResult = await entryHandler.test(this.parsingContext, this.util, key, keys, depth);
                if (testResult) {
                    // Pass processing over to the handler
                    await entryHandler.handle(this.parsingContext, this.util, key, keys, value, depth, testResult);
                    // Flag that this depth is processed
                    if (entryHandler.isStackProcessor()) {
                        this.parsingContext.processingStack[depth] = true;
                    }
                    break;
                }
            }
        }
        // Validate value indexes on the root.
        if (depth === 0 && Array.isArray(value)) {
            await this.util.validateValueIndexes(value);
        }
        // When we go up the stack, flush the old stack
        if (flushStacks && depth < this.lastDepth) {
            // Reset our stacks
            this.flushStacks(this.lastDepth);
        }
        this.lastDepth = depth;
        this.lastKeys = keys;
        // Clear the keyword cache at this depth, and everything underneath.
        this.parsingContext.unaliasedKeywordCacheStack.splice(depth - 1);
    }
    /**
     * Flush the processing stacks at the given depth.
     * @param {number} depth A depth.
     */
    flushStacks(depth) {
        this.parsingContext.processingStack.splice(depth, 1);
        this.parsingContext.processingType.splice(depth, 1);
        this.parsingContext.emittedStack.splice(depth, 1);
        this.parsingContext.idStack.splice(depth, 1);
        this.parsingContext.graphStack.splice(depth + 1, 1);
        this.parsingContext.graphContainerTermStack.splice(depth, 1);
        this.parsingContext.jsonLiteralStack.splice(depth, 1);
        this.parsingContext.validationStack.splice(depth - 1, 2);
        this.parsingContext.literalStack.splice(depth, this.parsingContext.literalStack.length - depth);
        // TODO: just like the literal stack, splice all other stack until the end as well?
    }
    /**
     * Flush buffers for the given depth.
     *
     * This should be called after the last entry at a given depth was processed.
     *
     * @param {number} depth A depth.
     * @param {any[]} keys A stack of keys.
     * @return {Promise<void>} A promise resolving if flushing is done.
     */
    async flushBuffer(depth, keys) {
        let subjects = this.parsingContext.idStack[depth];
        if (!subjects) {
            subjects = this.parsingContext.idStack[depth] = [this.util.dataFactory.blankNode()];
        }
        // Flush values at this level
        const valueBuffer = this.parsingContext.unidentifiedValuesBuffer[depth];
        if (valueBuffer) {
            for (const subject of subjects) {
                const depthOffsetGraph = await this.util.getDepthOffsetGraph(depth, keys);
                const graphs = (this.parsingContext.graphStack[depth] || depthOffsetGraph >= 0)
                    ? this.parsingContext.idStack[depth - depthOffsetGraph - 1]
                    : [await this.util.getGraphContainerValue(keys, depth)];
                if (graphs) {
                    for (const graph of graphs) {
                        // Flush values to stream if the graph @id is known
                        this.parsingContext.emittedStack[depth] = true;
                        for (const bufferedValue of valueBuffer) {
                            if (bufferedValue.reverse) {
                                this.parsingContext.emitQuad(depth, this.util.dataFactory.quad(bufferedValue.object, bufferedValue.predicate, subject, graph));
                            }
                            else {
                                this.parsingContext.emitQuad(depth, this.util.dataFactory.quad(subject, bufferedValue.predicate, bufferedValue.object, graph));
                            }
                        }
                    }
                }
                else {
                    // Place the values in the graphs buffer if the graph @id is not yet known
                    const subGraphBuffer = this.parsingContext.getUnidentifiedGraphBufferSafe(depth - await this.util.getDepthOffsetGraph(depth, keys) - 1);
                    for (const bufferedValue of valueBuffer) {
                        if (bufferedValue.reverse) {
                            subGraphBuffer.push({
                                object: subject,
                                predicate: bufferedValue.predicate,
                                subject: bufferedValue.object,
                            });
                        }
                        else {
                            subGraphBuffer.push({
                                object: bufferedValue.object,
                                predicate: bufferedValue.predicate,
                                subject,
                            });
                        }
                    }
                }
            }
            this.parsingContext.unidentifiedValuesBuffer.splice(depth, 1);
            this.parsingContext.literalStack.splice(depth, 1);
            this.parsingContext.jsonLiteralStack.splice(depth, 1);
        }
        // Flush graphs at this level
        const graphBuffer = this.parsingContext.unidentifiedGraphsBuffer[depth];
        if (graphBuffer) {
            for (const subject of subjects) {
                // A @graph statement at the root without @id relates to the default graph,
                // unless there are top-level properties,
                // others relate to blank nodes.
                const graph = depth === 1 && subject.termType === 'BlankNode'
                    && !this.parsingContext.topLevelProperties ? this.util.getDefaultGraph() : subject;
                this.parsingContext.emittedStack[depth] = true;
                for (const bufferedValue of graphBuffer) {
                    this.parsingContext.emitQuad(depth, this.util.dataFactory.quad(bufferedValue.subject, bufferedValue.predicate, bufferedValue.object, graph));
                }
            }
            this.parsingContext.unidentifiedGraphsBuffer.splice(depth, 1);
        }
    }
    /**
     * Check if at least one {@link IEntryHandler} validates the entry to true.
     * @param {any[]} keys A stack of keys.
     * @param {number} depth A depth.
     * @param {boolean} inProperty If the current depth is part of a valid property node.
     * @return {Promise<{ valid: boolean, property: boolean }>} A promise resolving to true or false.
     */
    async validateKey(keys, depth, inProperty) {
        for (const entryHandler of JsonLdParser.ENTRY_HANDLERS) {
            if (await entryHandler.validate(this.parsingContext, this.util, keys, depth, inProperty)) {
                return { valid: true, property: inProperty || entryHandler.isPropertyHandler() };
            }
        }
        return { valid: false, property: false };
    }
    /**
     * Attach all required listeners to the JSON parser.
     *
     * This should only be called once.
     */
    attachJsonParserListeners() {
        // Listen to json parser events
        this.jsonParser.onValue = (value) => {
            const depth = this.jsonParser.stack.length;
            const keys = (new Array(depth + 1).fill(0)).map((v, i) => {
                return i === depth ? this.jsonParser.key : this.jsonParser.stack[i].key;
            });
            if (!this.isParsingContextInner(depth)) { // Don't parse inner nodes inside @context
                const valueJobCb = () => this.newOnValueJob(keys, value, depth, true);
                if (!this.parsingContext.streamingProfile
                    && !this.parsingContext.contextTree.getContext(keys.slice(0, -1))) {
                    // If an out-of-order context is allowed,
                    // we have to buffer everything.
                    // We store jobs for @context's and @type's separately,
                    // because at the end, we have to process them first.
                    // We also handle @type because these *could* introduce a type-scoped context.
                    if (keys[depth] === '@context') {
                        let jobs = this.contextJobs[depth];
                        if (!jobs) {
                            jobs = this.contextJobs[depth] = [];
                        }
                        jobs.push(valueJobCb);
                    }
                    else if (keys[depth] === '@type'
                        || typeof keys[depth] === 'number' && keys[depth - 1] === '@type') { // Also capture @type with array values
                        // Remove @type from keys, because we want it to apply to parent later on
                        this.typeJobs.push({ job: valueJobCb, keys: keys.slice(0, keys.length - 1) });
                    }
                    else {
                        this.contextAwaitingJobs.push({ job: valueJobCb, keys });
                    }
                }
                else {
                    // Make sure that our value jobs are chained synchronously
                    this.lastOnValueJob = this.lastOnValueJob.then(valueJobCb);
                }
                // Execute all buffered jobs on deeper levels
                if (!this.parsingContext.streamingProfile && depth === 0) {
                    this.lastOnValueJob = this.lastOnValueJob
                        .then(() => this.executeBufferedJobs());
                }
            }
        };
        this.jsonParser.onError = (error) => {
            this.emit('error', error);
        };
    }
    /**
     * Check if the parser is currently parsing an element that is part of an @context entry.
     * @param {number} depth A depth.
     * @return {boolean} A boolean.
     */
    isParsingContextInner(depth) {
        for (let i = depth; i > 0; i--) {
            if (this.jsonParser.stack[i - 1].key === '@context') {
                return true;
            }
        }
        return false;
    }
    /**
     * Execute all buffered jobs.
     * @return {Promise<void>} A promise resolving if all jobs are finished.
     */
    async executeBufferedJobs() {
        // Handle context jobs
        for (const jobs of this.contextJobs) {
            if (jobs) {
                for (const job of jobs) {
                    await job();
                }
            }
        }
        // Clear the keyword cache.
        this.parsingContext.unaliasedKeywordCacheStack.splice(0);
        // Handle non-context jobs
        for (const job of this.contextAwaitingJobs) {
            // Check if we have a type (with possible type-scoped context) that should be handled before.
            // We check all possible parent nodes for the current job, from root to leaves.
            if (this.typeJobs.length > 0) {
                // First collect all applicable type jobs
                const applicableTypeJobs = [];
                const applicableTypeJobIds = [];
                for (let i = 0; i < this.typeJobs.length; i++) {
                    const typeJob = this.typeJobs[i];
                    if (Util_1.Util.isPrefixArray(typeJob.keys, job.keys)) {
                        applicableTypeJobs.push(typeJob);
                        applicableTypeJobIds.push(i);
                    }
                }
                // Next, sort the jobs from short to long key length (to ensure types higher up in the tree to be handled first)
                const sortedTypeJobs = applicableTypeJobs.sort((job1, job2) => job1.keys.length - job2.keys.length);
                // Finally, execute the jobs in order
                for (const typeJob of sortedTypeJobs) {
                    await typeJob.job();
                }
                // Remove the executed type jobs
                // Sort first, so we can efficiently splice
                const sortedApplicableTypeJobIds = applicableTypeJobIds.sort().reverse();
                for (const jobId of sortedApplicableTypeJobIds) {
                    this.typeJobs.splice(jobId, 1);
                }
            }
            await job.job();
        }
    }
}
exports.JsonLdParser = JsonLdParser;
JsonLdParser.DEFAULT_PROCESSING_MODE = '1.1';
JsonLdParser.ENTRY_HANDLERS = [
    new EntryHandlerArrayValue_1.EntryHandlerArrayValue(),
    new EntryHandlerKeywordContext_1.EntryHandlerKeywordContext(),
    new EntryHandlerKeywordId_1.EntryHandlerKeywordId(),
    new EntryHandlerKeywordIncluded_1.EntryHandlerKeywordIncluded(),
    new EntryHandlerKeywordGraph_1.EntryHandlerKeywordGraph(),
    new EntryHandlerKeywordNest_1.EntryHandlerKeywordNest(),
    new EntryHandlerKeywordType_1.EntryHandlerKeywordType(),
    new EntryHandlerKeywordValue_1.EntryHandlerKeywordValue(),
    new EntryHandlerContainer_1.EntryHandlerContainer(),
    new EntryHandlerKeywordUnknownFallback_1.EntryHandlerKeywordUnknownFallback(),
    new EntryHandlerPredicate_1.EntryHandlerPredicate(),
    new EntryHandlerInvalidFallback_1.EntryHandlerInvalidFallback(),
];

},{"./ParsingContext":44,"./Util":45,"./entryhandler/EntryHandlerArrayValue":50,"./entryhandler/EntryHandlerContainer":51,"./entryhandler/EntryHandlerInvalidFallback":52,"./entryhandler/EntryHandlerPredicate":53,"./entryhandler/keyword/EntryHandlerKeywordContext":55,"./entryhandler/keyword/EntryHandlerKeywordGraph":56,"./entryhandler/keyword/EntryHandlerKeywordId":57,"./entryhandler/keyword/EntryHandlerKeywordIncluded":58,"./entryhandler/keyword/EntryHandlerKeywordNest":59,"./entryhandler/keyword/EntryHandlerKeywordType":60,"./entryhandler/keyword/EntryHandlerKeywordUnknownFallback":61,"./entryhandler/keyword/EntryHandlerKeywordValue":62,"http-link-header":32,"jsonld-context-parser":33,"jsonparse":63,"stream":11}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsingContext = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const ErrorCoded_1 = require("jsonld-context-parser/lib/ErrorCoded");
const ContextTree_1 = require("./ContextTree");
const JsonLdParser_1 = require("./JsonLdParser");
/**
 * Data holder for parsing information.
 */
class ParsingContext {
    constructor(options) {
        // Initialize settings
        this.contextParser = new jsonld_context_parser_1.ContextParser({ documentLoader: options.documentLoader });
        this.streamingProfile = !!options.streamingProfile;
        this.baseIRI = options.baseIRI;
        this.produceGeneralizedRdf = !!options.produceGeneralizedRdf;
        this.allowSubjectList = !!options.allowSubjectList;
        this.processingMode = options.processingMode || JsonLdParser_1.JsonLdParser.DEFAULT_PROCESSING_MODE;
        this.strictValues = !!options.strictValues;
        this.validateValueIndexes = !!options.validateValueIndexes;
        this.defaultGraph = options.defaultGraph;
        this.rdfDirection = options.rdfDirection;
        this.normalizeLanguageTags = options.normalizeLanguageTags;
        this.streamingProfileAllowOutOfOrderPlainType = options.streamingProfileAllowOutOfOrderPlainType;
        this.topLevelProperties = false;
        this.activeProcessingMode = parseFloat(this.processingMode);
        // Initialize stacks
        this.processingStack = [];
        this.processingType = [];
        this.emittedStack = [];
        this.idStack = [];
        this.graphStack = [];
        this.graphContainerTermStack = [];
        this.listPointerStack = [];
        this.contextTree = new ContextTree_1.ContextTree();
        this.literalStack = [];
        this.validationStack = [];
        this.unaliasedKeywordCacheStack = [];
        this.jsonLiteralStack = [];
        this.unidentifiedValuesBuffer = [];
        this.unidentifiedGraphsBuffer = [];
        this.pendingContainerFlushBuffers = [];
        this.parser = options.parser;
        if (options.context) {
            this.rootContext = this.parseContext(options.context);
            this.rootContext.then((context) => this.validateContext(context));
        }
        else {
            this.rootContext = Promise.resolve(new jsonld_context_parser_1.JsonLdContextNormalized(this.baseIRI ? { '@base': this.baseIRI, '@__baseDocument': true } : {}));
        }
    }
    /**
     * Parse the given context with the configured options.
     * @param {JsonLdContext} context A context to parse.
     * @param {JsonLdContextNormalized} parentContext An optional parent context.
     * @param {boolean} ignoreProtection If @protected term checks should be ignored.
     * @return {Promise<JsonLdContextNormalized>} A promise resolving to the parsed context.
     */
    async parseContext(context, parentContext, ignoreProtection) {
        return this.contextParser.parse(context, {
            baseIRI: this.baseIRI,
            ignoreProtection,
            normalizeLanguageTags: this.normalizeLanguageTags,
            parentContext,
            processingMode: this.activeProcessingMode,
        });
    }
    /**
     * Check if the given context is valid.
     * If not, an error will be thrown.
     * @param {JsonLdContextNormalized} context A context.
     */
    validateContext(context) {
        const activeVersion = context.getContextRaw()['@version'];
        if (activeVersion) {
            if (this.activeProcessingMode && activeVersion > this.activeProcessingMode) {
                throw new ErrorCoded_1.ErrorCoded(`Unsupported JSON-LD version '${activeVersion}' under active processing mode ${this.activeProcessingMode}.`, ErrorCoded_1.ERROR_CODES.PROCESSING_MODE_CONFLICT);
            }
            else {
                if (this.activeProcessingMode && activeVersion < this.activeProcessingMode) {
                    throw new ErrorCoded_1.ErrorCoded(`Invalid JSON-LD version ${activeVersion} under active processing mode ${this.activeProcessingMode}.`, ErrorCoded_1.ERROR_CODES.INVALID_VERSION_VALUE);
                }
                this.activeProcessingMode = activeVersion;
            }
        }
    }
    /**
     * Get the context at the given path.
     * @param {keys} keys The path of keys to get the context at.
     * @param {number} offset The path offset, defaults to 1.
     * @return {Promise<JsonLdContextNormalized>} A promise resolving to a context.
     */
    async getContext(keys, offset = 1) {
        const keysOriginal = keys;
        // Ignore array keys at the end
        while (typeof keys[keys.length - 1] === 'number') {
            keys = keys.slice(0, keys.length - 1);
        }
        // Handle offset on keys
        if (offset) {
            keys = keys.slice(0, -offset);
        }
        // Determine the closest context
        const contextData = await this.getContextPropagationAware(keys);
        const context = contextData.context;
        // Process property-scoped contexts (high-to-low)
        let contextRaw = context.getContextRaw();
        for (let i = contextData.depth; i < keysOriginal.length - offset; i++) {
            const key = keysOriginal[i];
            const contextKeyEntry = contextRaw[key];
            if (contextKeyEntry && typeof contextKeyEntry === 'object' && '@context' in contextKeyEntry) {
                const scopedContext = (await this.parseContext(contextKeyEntry, contextRaw, true)).getContextRaw();
                const propagate = !(key in scopedContext)
                    || scopedContext[key]['@context']['@propagate']; // Propagation is true by default
                if (propagate !== false || i === keysOriginal.length - 1 - offset) {
                    contextRaw = scopedContext;
                    // Clean up final context
                    delete contextRaw['@propagate'];
                    contextRaw[key] = Object.assign({}, contextRaw[key]);
                    if ('@id' in contextKeyEntry) {
                        contextRaw[key]['@id'] = contextKeyEntry['@id'];
                    }
                    delete contextRaw[key]['@context'];
                    if (propagate !== false) {
                        this.contextTree.setContext(keysOriginal.slice(0, i + offset), Promise.resolve(new jsonld_context_parser_1.JsonLdContextNormalized(contextRaw)));
                    }
                }
            }
        }
        return new jsonld_context_parser_1.JsonLdContextNormalized(contextRaw);
    }
    /**
     * Get the context at the given path.
     * Non-propagating contexts will be skipped,
     * unless the context at that exact depth is retrieved.
     *
     * This ONLY takes into account context propagation logic,
     * so this should usually not be called directly,
     * call {@link #getContext} instead.
     *
     * @param keys The path of keys to get the context at.
     * @return {Promise<{ context: JsonLdContextNormalized, depth: number }>} A context and its depth.
     */
    async getContextPropagationAware(keys) {
        const originalDepth = keys.length;
        let contextData = null;
        let hasApplicablePropertyScopedContext;
        do {
            hasApplicablePropertyScopedContext = false;
            if (contextData && '@__propagateFallback' in contextData.context.getContextRaw()) {
                // If a propagation fallback context has been set,
                // fallback to that context and retry for the same depth.
                contextData.context = new jsonld_context_parser_1.JsonLdContextNormalized(contextData.context.getContextRaw()['@__propagateFallback']);
            }
            else {
                if (contextData) {
                    // If we had a previous iteration, jump to the parent of context depth.
                    // We must do this because once we get here, last context had propagation disabled,
                    // so we check its first parent instead.
                    keys = keys.slice(0, contextData.depth - 1);
                }
                contextData = await this.contextTree.getContext(keys) || { context: await this.rootContext, depth: 0 };
            }
            // Allow non-propagating contexts to propagate one level deeper
            // if it defines a property-scoped context that is applicable for the current key.
            // @see https://w3c.github.io/json-ld-api/tests/toRdf-manifest#tc012
            const lastKey = keys[keys.length - 1];
            if (lastKey in contextData.context.getContextRaw()) {
                const lastKeyValue = contextData.context.getContextRaw()[lastKey];
                if (lastKeyValue && typeof lastKeyValue === 'object' && '@context' in lastKeyValue) {
                    hasApplicablePropertyScopedContext = true;
                }
            }
        } while (contextData.depth > 0 // Root context has a special case
            && contextData.context.getContextRaw()['@propagate'] === false // Stop loop if propagation is true
            && contextData.depth !== originalDepth // Stop loop if requesting exact depth of non-propagating
            && !hasApplicablePropertyScopedContext);
        // Special case for root context that does not allow propagation.
        // Fallback to empty context in that case.
        if (contextData.depth === 0
            && contextData.context.getContextRaw()['@propagate'] === false
            && contextData.depth !== originalDepth) {
            contextData.context = new jsonld_context_parser_1.JsonLdContextNormalized({});
        }
        return contextData;
    }
    /**
     * Start a new job for parsing the given value.
     * @param {any[]} keys The stack of keys.
     * @param value The value to parse.
     * @param {number} depth The depth to parse at.
     * @param {boolean} lastDepthCheck If the lastDepth check should be done for buffer draining.
     * @return {Promise<void>} A promise resolving when the job is done.
     */
    async newOnValueJob(keys, value, depth, lastDepthCheck) {
        await this.parser.newOnValueJob(keys, value, depth, lastDepthCheck);
    }
    /**
     * Flush the pending container flush buffers
     * @return {boolean} If any pending buffers were flushed.
     */
    async handlePendingContainerFlushBuffers() {
        if (this.pendingContainerFlushBuffers.length > 0) {
            for (const pendingFlushBuffer of this.pendingContainerFlushBuffers) {
                await this.parser.flushBuffer(pendingFlushBuffer.depth, pendingFlushBuffer.keys);
                this.parser.flushStacks(pendingFlushBuffer.depth);
            }
            this.pendingContainerFlushBuffers.splice(0, this.pendingContainerFlushBuffers.length);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Emit the given quad into the output stream.
     * @param {number} depth The depth the quad was generated at.
     * @param {Quad} quad A quad to emit.
     */
    emitQuad(depth, quad) {
        if (depth === 1) {
            this.topLevelProperties = true;
        }
        this.parser.push(quad);
    }
    /**
     * Emit the given error into the output stream.
     * @param {Error} error An error to emit.
     */
    emitError(error) {
        this.parser.emit('error', error);
    }
    /**
     * Emit the given context into the output stream under the 'context' event.
     * @param {JsonLdContext} context A context to emit.
     */
    emitContext(context) {
        this.parser.emit('context', context);
    }
    /**
     * Safely get or create the depth value of {@link ParsingContext.unidentifiedValuesBuffer}.
     * @param {number} depth A depth.
     * @return {{predicate: Term; object: Term; reverse: boolean}[]} An element of
     *                                                               {@link ParsingContext.unidentifiedValuesBuffer}.
     */
    getUnidentifiedValueBufferSafe(depth) {
        let buffer = this.unidentifiedValuesBuffer[depth];
        if (!buffer) {
            buffer = [];
            this.unidentifiedValuesBuffer[depth] = buffer;
        }
        return buffer;
    }
    /**
     * Safely get or create the depth value of {@link ParsingContext.unidentifiedGraphsBuffer}.
     * @param {number} depth A depth.
     * @return {{predicate: Term; object: Term; reverse: boolean}[]} An element of
     *                                                               {@link ParsingContext.unidentifiedGraphsBuffer}.
     */
    getUnidentifiedGraphBufferSafe(depth) {
        let buffer = this.unidentifiedGraphsBuffer[depth];
        if (!buffer) {
            buffer = [];
            this.unidentifiedGraphsBuffer[depth] = buffer;
        }
        return buffer;
    }
    /**
     * @return IExpandOptions The expand options for the active processing mode.
     */
    getExpandOptions() {
        return ParsingContext.EXPAND_OPTIONS[this.activeProcessingMode];
    }
    /**
     * Shift the stack at the given offset to the given depth.
     *
     * This will override anything in the stack at `depth`,
     * and this will remove anything at `depth + depthOffset`
     *
     * @param depth The target depth.
     * @param depthOffset The origin depth, relative to `depth`.
     */
    shiftStack(depth, depthOffset) {
        // Copy the id stack value up one level so that the next job can access the id.
        const deeperIdStack = this.idStack[depth + depthOffset];
        if (deeperIdStack) {
            this.idStack[depth] = deeperIdStack;
            this.emittedStack[depth] = true;
            delete this.idStack[depth + depthOffset];
        }
        // Shorten key stack
        if (this.pendingContainerFlushBuffers.length) {
            for (const buffer of this.pendingContainerFlushBuffers) {
                if (buffer.depth >= depth + depthOffset) {
                    buffer.depth -= depthOffset;
                    buffer.keys.splice(depth, depthOffset);
                }
            }
        }
        // Splice stacks
        if (this.unidentifiedValuesBuffer[depth + depthOffset]) {
            this.unidentifiedValuesBuffer[depth] = this.unidentifiedValuesBuffer[depth + depthOffset];
            delete this.unidentifiedValuesBuffer[depth + depthOffset];
        }
        // TODO: also do the same for other stacks
    }
}
exports.ParsingContext = ParsingContext;
ParsingContext.EXPAND_OPTIONS = {
    1.0: {
        allowPrefixForcing: false,
        allowPrefixNonGenDelims: false,
        allowVocabRelativeToBase: false,
    },
    1.1: {
        allowPrefixForcing: true,
        allowPrefixNonGenDelims: false,
        allowVocabRelativeToBase: true,
    },
};

},{"./ContextTree":42,"./JsonLdParser":43,"jsonld-context-parser":33,"jsonld-context-parser/lib/ErrorCoded":35}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const rdf_data_factory_1 = require("rdf-data-factory");
const EntryHandlerContainer_1 = require("./entryhandler/EntryHandlerContainer");
// tslint:disable-next-line:no-var-requires
const canonicalizeJson = require('canonicalize');
/**
 * Utility functions and methods.
 */
class Util {
    constructor(options) {
        this.parsingContext = options.parsingContext;
        this.dataFactory = options.dataFactory || new rdf_data_factory_1.DataFactory();
        this.rdfFirst = this.dataFactory.namedNode(Util.RDF + 'first');
        this.rdfRest = this.dataFactory.namedNode(Util.RDF + 'rest');
        this.rdfNil = this.dataFactory.namedNode(Util.RDF + 'nil');
        this.rdfType = this.dataFactory.namedNode(Util.RDF + 'type');
        this.rdfJson = this.dataFactory.namedNode(Util.RDF + 'JSON');
    }
    /**
     * Helper function to get the value of a context entry,
     * or fallback to a certain value.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} contextKey A pre-defined JSON-LD key in context entries.
     * @param {string} key A context entry key.
     * @param {string} fallback A fallback value for when the given contextKey
     *                          could not be found in the value with the given key.
     * @return {string} The value of the given contextKey in the entry behind key in the given context,
     *                  or the given fallback value.
     */
    static getContextValue(context, contextKey, key, fallback) {
        const entry = context.getContextRaw()[key];
        if (!entry) {
            return fallback;
        }
        const type = entry[contextKey];
        return type === undefined ? fallback : type;
    }
    /**
     * Get the container type of the given key in the context.
     *
     * Should any context-scoping bugs should occur related to this in the future,
     * it may be required to increase the offset from the depth at which the context is retrieved by one (to 2).
     * This is because containers act 2 levels deep.
     *
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key A context entry key.
     * @return {string} The container type.
     */
    static getContextValueContainer(context, key) {
        return Util.getContextValue(context, '@container', key, { '@set': true });
    }
    /**
     * Get the value type of the given key in the context.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key A context entry key.
     * @return {string} The node type.
     */
    static getContextValueType(context, key) {
        const valueType = Util.getContextValue(context, '@type', key, null);
        if (valueType === '@none') {
            return null;
        }
        return valueType;
    }
    /**
     * Get the language of the given key in the context.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key A context entry key.
     * @return {string} The node type.
     */
    static getContextValueLanguage(context, key) {
        return Util.getContextValue(context, '@language', key, context.getContextRaw()['@language'] || null);
    }
    /**
     * Get the direction of the given key in the context.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key A context entry key.
     * @return {string} The node type.
     */
    static getContextValueDirection(context, key) {
        return Util.getContextValue(context, '@direction', key, context.getContextRaw()['@direction'] || null);
    }
    /**
     * Check if the given key in the context is a reversed property.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key A context entry key.
     * @return {boolean} If the context value has a @reverse key.
     */
    static isContextValueReverse(context, key) {
        return !!Util.getContextValue(context, '@reverse', key, null);
    }
    /**
     * Get the @index of the given key in the context.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key A context entry key.
     * @return {string} The index.
     */
    static getContextValueIndex(context, key) {
        return Util.getContextValue(context, '@index', key, context.getContextRaw()['@index'] || null);
    }
    /**
     * Check if the given key refers to a reversed property.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key The property key.
     * @param {string} parentKey The parent key.
     * @return {boolean} If the property must be reversed.
     */
    static isPropertyReverse(context, key, parentKey) {
        // '!==' is needed because reversed properties in a @reverse container should cancel each other out.
        return parentKey === '@reverse' !== Util.isContextValueReverse(context, key);
    }
    /**
     * Check if the given IRI is valid.
     * @param {string} iri A potential IRI.
     * @return {boolean} If the given IRI is valid.
     */
    static isValidIri(iri) {
        return iri !== null && jsonld_context_parser_1.Util.isValidIri(iri);
    }
    /**
     * Check if the given first array (needle) is a prefix of the given second array (haystack).
     * @param needle An array to check if it is a prefix.
     * @param haystack An array to look in.
     */
    static isPrefixArray(needle, haystack) {
        if (needle.length > haystack.length) {
            return false;
        }
        for (let i = 0; i < needle.length; i++) {
            if (needle[i] !== haystack[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Make sure that @id-@index pairs are equal over all array values.
     * Reject otherwise.
     * @param {any[]} value An array value.
     * @return {Promise<void>} A promise rejecting if conflicts are present.
     */
    async validateValueIndexes(value) {
        if (this.parsingContext.validateValueIndexes) {
            const indexHashes = {};
            for (const entry of value) {
                if (entry && typeof entry === 'object') {
                    const id = entry['@id'];
                    const index = entry['@index'];
                    if (id && index) {
                        const existingIndexValue = indexHashes[id];
                        if (existingIndexValue && existingIndexValue !== index) {
                            throw new jsonld_context_parser_1.ErrorCoded(`Conflicting @index value for ${id}`, jsonld_context_parser_1.ERROR_CODES.CONFLICTING_INDEXES);
                        }
                        indexHashes[id] = index;
                    }
                }
            }
        }
    }
    /**
     * Convert a given JSON value to an RDF term.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key The current JSON key.
     * @param value A JSON value.
     * @param {number} depth The depth the value is at.
     * @param {string[]} keys The path of keys.
     * @return {Promise<RDF.Term[]>} An RDF term array.
     */
    async valueToTerm(context, key, value, depth, keys) {
        // Skip further processing if we have an @type: @json
        if (Util.getContextValueType(context, key) === '@json') {
            return [this.dataFactory.literal(this.valueToJsonString(value), this.rdfJson)];
        }
        const type = typeof value;
        switch (type) {
            case 'object':
                // Skip if we have a null or undefined object
                if (value === null || value === undefined) {
                    return [];
                }
                // Special case for arrays
                if (Array.isArray(value)) {
                    // We handle arrays at value level so we can emit earlier, so this is handled already when we get here.
                    // Empty context-based lists are emitted at this place, because our streaming algorithm doesn't detect those.
                    if ('@list' in Util.getContextValueContainer(context, key)) {
                        if (value.length === 0) {
                            return [this.rdfNil];
                        }
                        else {
                            return this.parsingContext.idStack[depth + 1] || [];
                        }
                    }
                    await this.validateValueIndexes(value);
                    return [];
                }
                // Handle property-scoped contexts
                context = await this.getContextSelfOrPropertyScoped(context, key);
                // Handle local context in the value
                if ('@context' in value) {
                    context = await this.parsingContext.parseContext(value['@context'], (await this.parsingContext.getContext(keys, 0)).getContextRaw());
                }
                // In all other cases, we have a hash
                value = await this.unaliasKeywords(value, keys, depth, context); // Un-alias potential keywords in this hash
                if ('@value' in value) {
                    let val;
                    let valueLanguage;
                    let valueDirection;
                    let valueType;
                    let valueIndex; // We don't use the index, but we need to check its type for spec-compliance
                    for (key in value) {
                        const subValue = value[key];
                        switch (key) {
                            case '@value':
                                val = subValue;
                                break;
                            case '@language':
                                valueLanguage = subValue;
                                break;
                            case '@direction':
                                valueDirection = subValue;
                                break;
                            case '@type':
                                valueType = subValue;
                                break;
                            case '@index':
                                valueIndex = subValue;
                                break;
                            default:
                                throw new jsonld_context_parser_1.ErrorCoded(`Unknown value entry '${key}' in @value: ${JSON.stringify(value)}`, jsonld_context_parser_1.ERROR_CODES.INVALID_VALUE_OBJECT);
                        }
                    }
                    // Skip further processing if we have an @type: @json
                    if (await this.unaliasKeyword(valueType, keys, depth, true, context) === '@json') {
                        return [this.dataFactory.literal(this.valueToJsonString(val), this.rdfJson)];
                    }
                    // Validate @value
                    if (val === null) {
                        return [];
                    }
                    if (typeof val === 'object') {
                        throw new jsonld_context_parser_1.ErrorCoded(`The value of an '@value' can not be an object, got '${JSON.stringify(val)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_VALUE_OBJECT_VALUE);
                    }
                    // Validate @index
                    if (this.parsingContext.validateValueIndexes && valueIndex && typeof valueIndex !== 'string') {
                        throw new jsonld_context_parser_1.ErrorCoded(`The value of an '@index' must be a string, got '${JSON.stringify(valueIndex)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_INDEX_VALUE);
                    }
                    // Validate @language and @direction
                    if (valueLanguage) {
                        if (typeof val !== 'string') {
                            throw new jsonld_context_parser_1.ErrorCoded(`When an '@language' is set, the value of '@value' must be a string, got '${JSON.stringify(val)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_LANGUAGE_TAGGED_VALUE);
                        }
                        if (!jsonld_context_parser_1.ContextParser.validateLanguage(valueLanguage, this.parsingContext.strictValues, jsonld_context_parser_1.ERROR_CODES.INVALID_LANGUAGE_TAGGED_STRING)) {
                            return [];
                        }
                        // Language tags are always normalized to lowercase in 1.0.
                        if (this.parsingContext.normalizeLanguageTags || this.parsingContext.activeProcessingMode === 1.0) {
                            valueLanguage = valueLanguage.toLowerCase();
                        }
                    }
                    if (valueDirection) {
                        if (typeof val !== 'string') {
                            throw new Error(`When an '@direction' is set, the value of '@value' must be a string, got '${JSON.stringify(val)}'`);
                        }
                        if (!jsonld_context_parser_1.ContextParser.validateDirection(valueDirection, this.parsingContext.strictValues)) {
                            return [];
                        }
                    }
                    // Check @language and @direction
                    if (valueLanguage && valueDirection && this.parsingContext.rdfDirection) {
                        if (valueType) {
                            throw new jsonld_context_parser_1.ErrorCoded(`Can not have '@language', '@direction' and '@type' in a value: '${JSON
                                .stringify(value)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_VALUE_OBJECT);
                        }
                        return this.nullableTermToArray(this
                            .createLanguageDirectionLiteral(depth, val, valueLanguage, valueDirection));
                    }
                    else if (valueLanguage) { // Check @language
                        if (valueType) {
                            throw new jsonld_context_parser_1.ErrorCoded(`Can not have both '@language' and '@type' in a value: '${JSON.stringify(value)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_VALUE_OBJECT);
                        }
                        return [this.dataFactory.literal(val, valueLanguage)];
                    }
                    else if (valueDirection && this.parsingContext.rdfDirection) { // Check @direction
                        if (valueType) {
                            throw new jsonld_context_parser_1.ErrorCoded(`Can not have both '@direction' and '@type' in a value: '${JSON.stringify(value)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_VALUE_OBJECT);
                        }
                        return this.nullableTermToArray(this
                            .createLanguageDirectionLiteral(depth, val, valueLanguage, valueDirection));
                    }
                    else if (valueType) { // Validate @type
                        if (typeof valueType !== 'string') {
                            throw new jsonld_context_parser_1.ErrorCoded(`The value of an '@type' must be a string, got '${JSON.stringify(valueType)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_TYPED_VALUE);
                        }
                        const typeTerm = this.createVocabOrBaseTerm(context, valueType);
                        if (!typeTerm) {
                            throw new jsonld_context_parser_1.ErrorCoded(`Invalid '@type' value, got '${JSON.stringify(valueType)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_TYPED_VALUE);
                        }
                        if (typeTerm.termType !== 'NamedNode') {
                            throw new jsonld_context_parser_1.ErrorCoded(`Illegal value type (${typeTerm.termType}): ${valueType}`, jsonld_context_parser_1.ERROR_CODES.INVALID_TYPED_VALUE);
                        }
                        return [this.dataFactory.literal(val, typeTerm)];
                    }
                    // We don't pass the context, because context-based things like @language should be ignored
                    return await this.valueToTerm(new jsonld_context_parser_1.JsonLdContextNormalized({}), key, val, depth, keys);
                }
                else if ('@set' in value) {
                    // No other entries are allow in this value
                    if (Object.keys(value).length > 1) {
                        throw new jsonld_context_parser_1.ErrorCoded(`Found illegal neighbouring entries next to @set for key: '${key}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_SET_OR_LIST_OBJECT);
                    }
                    // No need to do anything here, this is handled at the deeper level.
                    return [];
                }
                else if ('@list' in value) {
                    // No other entries are allowed in this value
                    if (Object.keys(value).length > 1) {
                        throw new jsonld_context_parser_1.ErrorCoded(`Found illegal neighbouring entries next to @list for key: '${key}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_SET_OR_LIST_OBJECT);
                    }
                    const listValue = value["@list"];
                    // We handle lists at value level so we can emit earlier, so this is handled already when we get here.
                    // Empty anonymous lists are emitted at this place, because our streaming algorithm doesn't detect those.
                    if (Array.isArray(listValue)) {
                        if (listValue.length === 0) {
                            return [this.rdfNil];
                        }
                        else {
                            return this.parsingContext.idStack[depth + 1] || [];
                        }
                    }
                    else {
                        // We only have a single list element here, so emit this directly as single element
                        return await this.valueToTerm(await this.parsingContext.getContext(keys), key, listValue, depth - 1, keys.slice(0, -1));
                    }
                }
                else if ('@reverse' in value) {
                    // We handle reverse properties at value level so we can emit earlier,
                    // so this is handled already when we get here.
                    return [];
                }
                else if ('@graph' in Util.getContextValueContainer(await this.parsingContext.getContext(keys), key)) {
                    // We are processing a graph container
                    const graphContainerEntries = this.parsingContext.graphContainerTermStack[depth + 1];
                    return graphContainerEntries ? Object.values(graphContainerEntries) : [this.dataFactory.blankNode()];
                }
                else if ("@id" in value) {
                    // Use deeper context if the value node contains other properties next to @id.
                    if (Object.keys(value).length > 1) {
                        context = await this.parsingContext.getContext(keys, 0);
                    }
                    // Handle local context in the value
                    if ('@context' in value) {
                        context = await this.parsingContext.parseContext(value['@context'], context.getContextRaw());
                    }
                    if (value["@type"] === '@vocab') {
                        return this.nullableTermToArray(this.createVocabOrBaseTerm(context, value["@id"]));
                    }
                    else {
                        return this.nullableTermToArray(this.resourceToTerm(context, value["@id"]));
                    }
                }
                else {
                    // Only make a blank node if at least one triple was emitted at the value's level.
                    if (this.parsingContext.emittedStack[depth + 1]
                        || (value && typeof value === 'object' && Object.keys(value).length === 0)) {
                        return (this.parsingContext.idStack[depth + 1]
                            || (this.parsingContext.idStack[depth + 1] = [this.dataFactory.blankNode()]));
                    }
                    else {
                        return [];
                    }
                }
            case 'string':
                return this.nullableTermToArray(this.stringValueToTerm(depth, await this.getContextSelfOrPropertyScoped(context, key), key, value, null));
            case 'boolean':
                return this.nullableTermToArray(this.stringValueToTerm(depth, await this.getContextSelfOrPropertyScoped(context, key), key, Boolean(value).toString(), this.dataFactory.namedNode(Util.XSD_BOOLEAN)));
            case 'number':
                return this.nullableTermToArray(this.stringValueToTerm(depth, await this.getContextSelfOrPropertyScoped(context, key), key, value, this.dataFactory.namedNode(value % 1 === 0 && value < 1e21 ? Util.XSD_INTEGER : Util.XSD_DOUBLE)));
            default:
                this.parsingContext.emitError(new Error(`Could not determine the RDF type of a ${type}`));
                return [];
        }
    }
    /**
     * If the context defines a property-scoped context for the given key,
     * that context will be returned.
     * Otherwise, the given context will be returned as-is.
     *
     * This should be used for valueToTerm cases that are not objects.
     * @param context A context.
     * @param key A JSON key.
     */
    async getContextSelfOrPropertyScoped(context, key) {
        const contextKeyEntry = context.getContextRaw()[key];
        if (contextKeyEntry && typeof contextKeyEntry === 'object' && '@context' in contextKeyEntry) {
            context = await this.parsingContext.parseContext(contextKeyEntry, context.getContextRaw(), true);
        }
        return context;
    }
    /**
     * If the given term is null, return an empty array, otherwise return an array with the single given term.
     * @param term A term.
     */
    nullableTermToArray(term) {
        return term ? [term] : [];
    }
    /**
     * Convert a given JSON key to an RDF predicate term,
     * based on @vocab.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param key A JSON key.
     * @return {RDF.NamedNode} An RDF named node.
     */
    predicateToTerm(context, key) {
        const expanded = context.expandTerm(key, true, this.parsingContext.getExpandOptions());
        // Immediately return if the predicate was disabled in the context
        if (!expanded) {
            return null;
        }
        // Check if the predicate is a blank node
        if (expanded[0] === '_' && expanded[1] === ':') {
            if (this.parsingContext.produceGeneralizedRdf) {
                return this.dataFactory.blankNode(expanded.substr(2));
            }
            else {
                return null;
            }
        }
        // Check if the predicate is a valid IRI
        if (Util.isValidIri(expanded)) {
            return this.dataFactory.namedNode(expanded);
        }
        else {
            if (expanded && this.parsingContext.strictValues) {
                this.parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Invalid predicate IRI: ${expanded}`, jsonld_context_parser_1.ERROR_CODES.INVALID_IRI_MAPPING));
            }
            else {
                return null;
            }
        }
        return null;
    }
    /**
     * Convert a given JSON key to an RDF resource term or blank node,
     * based on @base.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param key A JSON key.
     * @return {RDF.NamedNode} An RDF named node or null.
     */
    resourceToTerm(context, key) {
        if (key.startsWith('_:')) {
            return this.dataFactory.blankNode(key.substr(2));
        }
        const iri = context.expandTerm(key, false, this.parsingContext.getExpandOptions());
        if (!Util.isValidIri(iri)) {
            if (iri && this.parsingContext.strictValues) {
                this.parsingContext.emitError(new Error(`Invalid resource IRI: ${iri}`));
            }
            else {
                return null;
            }
        }
        return this.dataFactory.namedNode(iri);
    }
    /**
     * Convert a given JSON key to an RDF resource term.
     * It will do this based on the @vocab,
     * and fallback to @base.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param key A JSON key.
     * @return {RDF.NamedNode} An RDF named node or null.
     */
    createVocabOrBaseTerm(context, key) {
        if (key.startsWith('_:')) {
            return this.dataFactory.blankNode(key.substr(2));
        }
        const expandOptions = this.parsingContext.getExpandOptions();
        let expanded = context.expandTerm(key, true, expandOptions);
        if (expanded === key) {
            expanded = context.expandTerm(key, false, expandOptions);
        }
        if (!Util.isValidIri(expanded)) {
            if (expanded && this.parsingContext.strictValues) {
                this.parsingContext.emitError(new Error(`Invalid term IRI: ${expanded}`));
            }
            else {
                return null;
            }
        }
        return this.dataFactory.namedNode(expanded);
    }
    /**
     * Ensure that the given value becomes a string.
     * @param {string | number} value A string or number.
     * @param {NamedNode} datatype The intended datatype.
     * @return {string} The returned string.
     */
    intToString(value, datatype) {
        if (typeof value === 'number') {
            if (Number.isFinite(value)) {
                const isInteger = value % 1 === 0;
                if (isInteger && (!datatype || datatype.value !== Util.XSD_DOUBLE)) {
                    return Number(value).toString();
                }
                else {
                    return value.toExponential(15).replace(/(\d)0*e\+?/, '$1E');
                }
            }
            else {
                return value > 0 ? 'INF' : '-INF';
            }
        }
        else {
            return value;
        }
    }
    /**
     * Convert a given JSON string value to an RDF term.
     * @param {number} depth The current stack depth.
     * @param {JsonLdContextNormalized} context A JSON-LD context.
     * @param {string} key The current JSON key.
     * @param {string} value A JSON value.
     * @param {NamedNode} defaultDatatype The default datatype for the given value.
     * @return {RDF.Term} An RDF term or null.
     */
    stringValueToTerm(depth, context, key, value, defaultDatatype) {
        // Check the datatype from the context
        const contextType = Util.getContextValueType(context, key);
        if (contextType) {
            if (contextType === '@id') {
                if (!defaultDatatype) {
                    return this.resourceToTerm(context, this.intToString(value, defaultDatatype));
                }
            }
            else if (contextType === '@vocab') {
                if (!defaultDatatype) {
                    return this.createVocabOrBaseTerm(context, this.intToString(value, defaultDatatype));
                }
            }
            else {
                defaultDatatype = this.dataFactory.namedNode(contextType);
            }
        }
        // If we don't find such a datatype, check the language from the context
        if (!defaultDatatype) {
            const contextLanguage = Util.getContextValueLanguage(context, key);
            const contextDirection = Util.getContextValueDirection(context, key);
            if (contextDirection && this.parsingContext.rdfDirection) {
                return this.createLanguageDirectionLiteral(depth, this.intToString(value, defaultDatatype), contextLanguage, contextDirection);
            }
            else {
                return this.dataFactory.literal(this.intToString(value, defaultDatatype), contextLanguage);
            }
        }
        // If all else fails, make a literal based on the default content type
        return this.dataFactory.literal(this.intToString(value, defaultDatatype), defaultDatatype);
    }
    /**
     * Create a literal for the given value with the given language and direction.
     * Auxiliary quads may be emitted.
     * @param {number} depth The current stack depth.
     * @param {string} value A string value.
     * @param {string} language A language tag.
     * @param {string} direction A direction.
     * @return {Term} An RDF term.
     */
    createLanguageDirectionLiteral(depth, value, language, direction) {
        if (this.parsingContext.rdfDirection === 'i18n-datatype') {
            // Create a datatyped literal, by encoding the language and direction into https://www.w3.org/ns/i18n#.
            if (!language) {
                language = '';
            }
            return this.dataFactory.literal(value, this.dataFactory.namedNode(`https://www.w3.org/ns/i18n#${language}_${direction}`));
        }
        else {
            // Reify the literal.
            const valueNode = this.dataFactory.blankNode();
            const graph = this.getDefaultGraph();
            this.parsingContext.emitQuad(depth, this.dataFactory.quad(valueNode, this.dataFactory.namedNode(Util.RDF + 'value'), this.dataFactory.literal(value), graph));
            if (language) {
                this.parsingContext.emitQuad(depth, this.dataFactory.quad(valueNode, this.dataFactory.namedNode(Util.RDF + 'language'), this.dataFactory.literal(language), graph));
            }
            this.parsingContext.emitQuad(depth, this.dataFactory.quad(valueNode, this.dataFactory.namedNode(Util.RDF + 'direction'), this.dataFactory.literal(direction), graph));
            return valueNode;
        }
    }
    /**
     * Stringify the given JSON object to a canonical JSON string.
     * @param value Any valid JSON value.
     * @return {string} A canonical JSON string.
     */
    valueToJsonString(value) {
        return canonicalizeJson(value);
    }
    /**
     * If the key is not a keyword, try to check if it is an alias for a keyword,
     * and if so, un-alias it.
     * @param {string} key A key, can be falsy.
     * @param {string[]} keys The path of keys.
     * @param {number} depth The depth to
     * @param {boolean} disableCache If the cache should be disabled
     * @param {JsonLdContextNormalized} context A context to unalias with,
     *                                           will fallback to retrieving the context for the given keys.
     * @return {Promise<string>} A promise resolving to the key itself, or another key.
     */
    async unaliasKeyword(key, keys, depth, disableCache, context) {
        // Numbers can not be an alias
        if (Number.isInteger(key)) {
            return key;
        }
        // Try to grab from cache if it was already un-aliased before.
        if (!disableCache) {
            const cachedUnaliasedKeyword = this.parsingContext.unaliasedKeywordCacheStack[depth];
            if (cachedUnaliasedKeyword) {
                return cachedUnaliasedKeyword;
            }
        }
        if (!jsonld_context_parser_1.Util.isPotentialKeyword(key)) {
            context = context || await this.parsingContext.getContext(keys);
            let unliased = context.getContextRaw()[key];
            if (unliased && typeof unliased === 'object') {
                unliased = unliased['@id'];
            }
            if (jsonld_context_parser_1.Util.isValidKeyword(unliased)) {
                key = unliased;
            }
        }
        return disableCache ? key : (this.parsingContext.unaliasedKeywordCacheStack[depth] = key);
    }
    /**
     * Unalias the keyword of the parent.
     * This adds a safety check if no parent exist.
     * @param {any[]} keys A stack of keys.
     * @param {number} depth The current depth.
     * @return {Promise<any>} A promise resolving to the parent key, or another key.
     */
    async unaliasKeywordParent(keys, depth) {
        return await this.unaliasKeyword(depth > 0 && keys[depth - 1], keys, depth - 1);
    }
    /**
     * Un-alias all keywords in the given hash.
     * @param {{[p: string]: any}} hash A hash object.
     * @param {string[]} keys The path of keys.
     * @param {number} depth The depth.
     * @param {JsonLdContextNormalized} context A context to unalias with,
     *                                           will fallback to retrieving the context for the given keys.
     * @return {Promise<{[p: string]: any}>} A promise resolving to the new hash.
     */
    async unaliasKeywords(hash, keys, depth, context) {
        const newHash = {};
        for (const key in hash) {
            newHash[await this.unaliasKeyword(key, keys, depth + 1, true, context)] = hash[key];
        }
        return newHash;
    }
    /**
     * Check if we are processing a literal (including JSON literals) at the given depth.
     * This will also check higher levels,
     * because if a parent is a literal,
     * then the deeper levels are definitely a literal as well.
     * @param {number} depth The depth.
     * @return {boolean} If we are processing a literal.
     */
    isLiteral(depth) {
        for (let i = depth; i >= 0; i--) {
            if (this.parsingContext.literalStack[i] || this.parsingContext.jsonLiteralStack[i]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check how many parents should be skipped for checking the @graph for the given node.
     *
     * @param {number} depth The depth of the node.
     * @param {any[]} keys An array of keys.
     * @return {number} The graph depth offset.
     */
    async getDepthOffsetGraph(depth, keys) {
        for (let i = depth - 1; i > 0; i--) {
            if (await this.unaliasKeyword(keys[i], keys, i) === '@graph') {
                // Skip further processing if we are already in an @graph-@id or @graph-@index container
                const containers = (await EntryHandlerContainer_1.EntryHandlerContainer.getContainerHandler(this.parsingContext, keys, i)).containers;
                if (EntryHandlerContainer_1.EntryHandlerContainer.isComplexGraphContainer(containers)) {
                    return -1;
                }
                return depth - i - 1;
            }
        }
        return -1;
    }
    /**
     * Check if the given subject is of a valid type.
     * This should be called when applying @reverse'd properties.
     * @param {Term} subject A subject.
     */
    validateReverseSubject(subject) {
        if (subject.termType === 'Literal') {
            throw new jsonld_context_parser_1.ErrorCoded(`Found illegal literal in subject position: ${subject.value}`, jsonld_context_parser_1.ERROR_CODES.INVALID_REVERSE_PROPERTY_VALUE);
        }
    }
    /**
     * Get the default graph.
     * @return {Term} An RDF term.
     */
    getDefaultGraph() {
        return this.parsingContext.defaultGraph || this.dataFactory.defaultGraph();
    }
    /**
     * Get the current graph, while taking into account a graph that can be defined via @container: @graph.
     * If not within a graph container, the default graph will be returned.
     * @param keys The current keys.
     * @param depth The current depth.
     */
    async getGraphContainerValue(keys, depth) {
        // Default to default graph
        let graph = this.getDefaultGraph();
        // Check if we are in an @container: @graph.
        const { containers, depth: depthContainer } = await EntryHandlerContainer_1.EntryHandlerContainer
            .getContainerHandler(this.parsingContext, keys, depth);
        if ('@graph' in containers) {
            // Get the graph from the stack.
            const graphContainerIndex = EntryHandlerContainer_1.EntryHandlerContainer.getContainerGraphIndex(containers, depthContainer, keys);
            const entry = this.parsingContext.graphContainerTermStack[depthContainer];
            graph = entry ? entry[graphContainerIndex] : null;
            // Set the graph in the stack if none has been set yet.
            if (!graph) {
                let graphId = null;
                if ('@id' in containers) {
                    const keyUnaliased = await this.getContainerKey(keys[depthContainer], keys, depthContainer);
                    if (keyUnaliased !== null) {
                        graphId = await this.resourceToTerm(await this.parsingContext.getContext(keys), keyUnaliased);
                    }
                }
                if (!graphId) {
                    graphId = this.dataFactory.blankNode();
                }
                if (!this.parsingContext.graphContainerTermStack[depthContainer]) {
                    this.parsingContext.graphContainerTermStack[depthContainer] = {};
                }
                graph = this.parsingContext.graphContainerTermStack[depthContainer][graphContainerIndex] = graphId;
            }
        }
        return graph;
    }
    /**
     * Get the properties depth for retrieving properties.
     *
     * Typically, the properties depth will be identical to the given depth.
     *
     * The following exceptions apply:
     * * When the parent is @reverse, the depth is decremented by one.
     * * When @nest parents are found, the depth is decremented by the number of @nest parents.
     * If in combination with the exceptions above an intermediary array is discovered,
     * the depth is also decremented by this number of arrays.
     *
     * @param keys The current key chain.
     * @param depth The current depth.
     */
    async getPropertiesDepth(keys, depth) {
        let lastValidDepth = depth;
        for (let i = depth - 1; i > 0; i--) {
            if (typeof keys[i] !== 'number') { // Skip array keys
                const parentKey = await this.unaliasKeyword(keys[i], keys, i);
                if (parentKey === '@reverse') {
                    return i;
                }
                else if (parentKey === '@nest') {
                    lastValidDepth = i;
                }
                else {
                    return lastValidDepth;
                }
            }
        }
        return lastValidDepth;
    }
    /**
     * Get the key for the current container entry.
     * @param key A key, can be falsy.
     * @param keys The key chain.
     * @param depth The current depth to get the key from.
     * @return Promise resolving to the key.
     *         Null will be returned for @none entries, with aliasing taken into account.
     */
    async getContainerKey(key, keys, depth) {
        const keyUnaliased = await this.unaliasKeyword(key, keys, depth);
        return keyUnaliased === '@none' ? null : keyUnaliased;
    }
}
exports.Util = Util;
Util.XSD = 'http://www.w3.org/2001/XMLSchema#';
Util.XSD_BOOLEAN = Util.XSD + 'boolean';
Util.XSD_INTEGER = Util.XSD + 'integer';
Util.XSD_DOUBLE = Util.XSD + 'double';
Util.RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

},{"./entryhandler/EntryHandlerContainer":51,"canonicalize":30,"jsonld-context-parser":33,"rdf-data-factory":64}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerHandlerIdentifier = void 0;
/**
 * Container handler for @id.
 *
 * It assumes that the current key is the identifier of the current value.
 * This will add this value to the parent node.
 */
class ContainerHandlerIdentifier {
    canCombineWithGraph() {
        return true;
    }
    async handle(containers, parsingContext, util, keys, value, depth) {
        let id;
        // First check if the child node already has a defined id.
        if (parsingContext.emittedStack[depth + 1] && parsingContext.idStack[depth + 1]) {
            // Use the existing identifier
            id = parsingContext.idStack[depth + 1][0];
        }
        else {
            // Create the identifier
            const keyUnaliased = await util.getContainerKey(keys[depth], keys, depth);
            const maybeId = keyUnaliased !== null
                ? await util.resourceToTerm(await parsingContext.getContext(keys), keys[depth])
                : util.dataFactory.blankNode();
            // Do nothing if the id is invalid
            if (!maybeId) {
                parsingContext.emittedStack[depth] = false; // Don't emit the predicate owning this container.
                return;
            }
            id = maybeId;
            // Insert the id into the stack so that buffered children can make us of it.
            parsingContext.idStack[depth + 1] = [id];
        }
        // Insert the id into the stack so that parents can make use of it.
        // Insert it as an array because multiple id container entries may exist
        let ids = parsingContext.idStack[depth];
        if (!ids) {
            ids = parsingContext.idStack[depth] = [];
        }
        // Only insert the term if it does not exist yet in the array.
        if (!ids.some((term) => term.equals(id))) {
            ids.push(id);
        }
        // Flush any pending flush buffers
        if (!await parsingContext.handlePendingContainerFlushBuffers()) {
            parsingContext.emittedStack[depth] = false; // Don't emit the predicate owning this container.
        }
    }
}
exports.ContainerHandlerIdentifier = ContainerHandlerIdentifier;

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerHandlerIndex = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const EntryHandlerPredicate_1 = require("../entryhandler/EntryHandlerPredicate");
const Util_1 = require("../Util");
/**
 * Container handler for @index.
 *
 * This will ignore the current key and add this entry to the parent node.
 */
class ContainerHandlerIndex {
    canCombineWithGraph() {
        return true;
    }
    async handle(containers, parsingContext, util, keys, value, depth) {
        if (!Array.isArray(value)) {
            const graphContainer = '@graph' in containers;
            // Check if the container is a property-based container by checking if there is a valid @index.
            const context = await parsingContext.getContext(keys);
            const indexKey = keys[depth - 1];
            const indexPropertyRaw = Util_1.Util.getContextValueIndex(context, indexKey);
            if (indexPropertyRaw) {
                // Validate the @index value
                if (jsonld_context_parser_1.Util.isPotentialKeyword(indexPropertyRaw)) {
                    throw new jsonld_context_parser_1.ErrorCoded(`Keywords can not be used as @index value, got: ${indexPropertyRaw}`, jsonld_context_parser_1.ERROR_CODES.INVALID_TERM_DEFINITION);
                }
                if (typeof indexPropertyRaw !== 'string') {
                    throw new jsonld_context_parser_1.ErrorCoded(`@index values must be strings, got: ${indexPropertyRaw}`, jsonld_context_parser_1.ERROR_CODES.INVALID_TERM_DEFINITION);
                }
                // When @index is used, values must be node values, unless @type: @id is defined in the context
                if (typeof value !== 'object') {
                    // Error if we don't have @type: @id
                    if (Util_1.Util.getContextValueType(context, indexKey) !== '@id') {
                        throw new jsonld_context_parser_1.ErrorCoded(`Property-based index containers require nodes as values or strings with @type: @id, but got: ${value}`, jsonld_context_parser_1.ERROR_CODES.INVALID_VALUE_OBJECT);
                    }
                    // Add an @id to the stack, so our expanded @index value can make use of it
                    const id = util.resourceToTerm(context, value);
                    if (id) {
                        parsingContext.idStack[depth + 1] = [id];
                    }
                }
                // Expand the @index value
                const indexProperty = util.createVocabOrBaseTerm(context, indexPropertyRaw);
                if (indexProperty) {
                    const indexValues = await util.valueToTerm(context, indexPropertyRaw, await util.getContainerKey(keys[depth], keys, depth), depth, keys);
                    if (graphContainer) {
                        // When we're in a graph container, attach the index to the graph identifier
                        const graphId = await util.getGraphContainerValue(keys, depth + 1);
                        for (const indexValue of indexValues) {
                            parsingContext.emitQuad(depth, util.dataFactory.quad(graphId, indexProperty, indexValue, util.getDefaultGraph()));
                        }
                    }
                    else {
                        // Otherwise, attach the index to the node identifier
                        for (const indexValue of indexValues) {
                            await EntryHandlerPredicate_1.EntryHandlerPredicate.handlePredicateObject(parsingContext, util, keys, depth + 1, indexProperty, indexValue, false);
                        }
                    }
                }
            }
            const depthOffset = graphContainer ? 2 : 1;
            await parsingContext.newOnValueJob(keys.slice(0, keys.length - depthOffset), value, depth - depthOffset, true);
            // Flush any pending flush buffers
            await parsingContext.handlePendingContainerFlushBuffers();
        }
        parsingContext.emittedStack[depth] = false; // We have emitted a level higher
    }
}
exports.ContainerHandlerIndex = ContainerHandlerIndex;

},{"../Util":45,"../entryhandler/EntryHandlerPredicate":53,"jsonld-context-parser":33}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerHandlerLanguage = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
/**
 * Container handler for @language.
 *
 * It assumes that the current key is the language of the current value.
 * This will add this value to the parent node.
 */
class ContainerHandlerLanguage {
    canCombineWithGraph() {
        return false;
    }
    async handle(containers, parsingContext, util, keys, value, depth) {
        const language = await util.getContainerKey(keys[depth], keys, depth);
        if (Array.isArray(value)) {
            // No type-checking needed, will be handled on each value when this handler is called recursively.
            value = value.map((subValue) => ({ '@value': subValue, '@language': language }));
        }
        else {
            if (typeof value !== 'string') {
                throw new jsonld_context_parser_1.ErrorCoded(`Got invalid language map value, got '${JSON.stringify(value)}', but expected string`, jsonld_context_parser_1.ERROR_CODES.INVALID_LANGUAGE_MAP_VALUE);
            }
            value = { '@value': value, '@language': language };
        }
        await parsingContext.newOnValueJob(keys.slice(0, keys.length - 1), value, depth - 1, true);
        parsingContext.emittedStack[depth] = false; // We have emitted a level higher
    }
}
exports.ContainerHandlerLanguage = ContainerHandlerLanguage;

},{"jsonld-context-parser":33}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerHandlerType = void 0;
const EntryHandlerPredicate_1 = require("../entryhandler/EntryHandlerPredicate");
const Util_1 = require("../Util");
/**
 * Container handler for @type.
 *
 * This will add this entry to the parent node, and use the current key as an rdf:type value.
 */
class ContainerHandlerType {
    canCombineWithGraph() {
        return false;
    }
    async handle(containers, parsingContext, util, keys, value, depth) {
        if (!Array.isArray(value)) {
            if (typeof value === 'string') {
                // Determine the @type of the container
                const context = await parsingContext.getContext(keys);
                const containerTypeType = Util_1.Util.getContextValueType(context, keys[depth - 1]);
                // String values refer to node references
                const id = containerTypeType === '@vocab'
                    ? await util.createVocabOrBaseTerm(context, value)
                    : await util.resourceToTerm(context, value);
                if (id) {
                    // Handle the value of this node as @id, which will also cause the predicate from above to be emitted.
                    const subValue = { '@id': id.termType === 'NamedNode' ? id.value : value };
                    await parsingContext.newOnValueJob(keys.slice(0, keys.length - 1), subValue, depth - 1, true);
                    // Set the id in the stack so it can be used for the rdf:type handling later on
                    parsingContext.idStack[depth + 1] = [id];
                }
            }
            else {
                // Other values are handled by handling them as a proper job
                // Check needed for cases where entries don't have an explicit @id
                const entryHasIdentifier = !!parsingContext.idStack[depth + 1];
                // Handle the value of this node, which will also cause the predicate from above to be emitted.
                if (!entryHasIdentifier) {
                    delete parsingContext.idStack[depth]; // Force new (blank node) identifier
                }
                await parsingContext.newOnValueJob(keys.slice(0, keys.length - 1), value, depth - 1, true);
                if (!entryHasIdentifier) {
                    parsingContext.idStack[depth + 1] = parsingContext.idStack[depth]; // Copy the id to the child node, for @type
                }
            }
            // Identify the type to emit.
            const keyOriginal = await util.getContainerKey(keys[depth], keys, depth);
            const type = keyOriginal !== null
                ? util.createVocabOrBaseTerm(await parsingContext.getContext(keys), keyOriginal)
                : null;
            if (type) {
                // Push the type to the stack using the rdf:type predicate
                await EntryHandlerPredicate_1.EntryHandlerPredicate.handlePredicateObject(parsingContext, util, keys, depth + 1, util.rdfType, type, false);
            }
            // Flush any pending flush buffers
            await parsingContext.handlePendingContainerFlushBuffers();
        }
        parsingContext.emittedStack[depth] = false; // Don't emit the predicate owning this container.
    }
}
exports.ContainerHandlerType = ContainerHandlerType;

},{"../Util":45,"../entryhandler/EntryHandlerPredicate":53}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerArrayValue = void 0;
const Util_1 = require("../Util");
/**
 * Handles values that are part of an array.
 */
class EntryHandlerArrayValue {
    isPropertyHandler() {
        return false;
    }
    isStackProcessor() {
        return true;
    }
    async validate(parsingContext, util, keys, depth, inProperty) {
        return this.test(parsingContext, util, null, keys, depth);
    }
    async test(parsingContext, util, key, keys, depth) {
        return typeof keys[depth] === 'number';
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        let parentKey = await util.unaliasKeywordParent(keys, depth);
        // Check if we have an anonymous list
        if (parentKey === '@list') {
            // Our value is part of an array
            // Determine the list root key
            let listRootKey = null;
            let listRootDepth = 0;
            for (let i = depth - 2; i > 0; i--) {
                const keyOption = keys[i];
                if (typeof keyOption === 'string' || typeof keyOption === 'number') {
                    listRootDepth = i;
                    listRootKey = keyOption;
                    break;
                }
            }
            if (listRootKey !== null) {
                // Emit the given objects as list elements
                const values = await util.valueToTerm(await parsingContext.getContext(keys), listRootKey, value, depth, keys);
                for (const object of values) {
                    await this.handleListElement(parsingContext, util, object, value, depth, keys.slice(0, listRootDepth), listRootDepth);
                }
                // If no values were found, emit a falsy list element to force an empty RDF list to be emitted.
                if (values.length === 0) {
                    await this.handleListElement(parsingContext, util, null, value, depth, keys.slice(0, listRootDepth), listRootDepth);
                }
            }
        }
        else if (parentKey === '@set') {
            // Our value is part of a set, so we just add it to the parent-parent
            await parsingContext.newOnValueJob(keys.slice(0, -2), value, depth - 2, false);
        }
        else if (parentKey !== undefined && parentKey !== '@type') {
            // Buffer our value using the parent key as predicate
            // Determine the first parent key that is *not* an array key
            // This is needed in case we have an @list container with nested arrays,
            // where each of them should produce nested RDF lists.
            for (let i = depth - 1; i > 0; i--) {
                if (typeof keys[i] !== 'number') {
                    parentKey = await util.unaliasKeyword(keys[i], keys, i);
                    break;
                }
            }
            // Check if the predicate is marked as an @list in the context
            const parentContext = await parsingContext.getContext(keys.slice(0, -1));
            if ('@list' in Util_1.Util.getContextValueContainer(parentContext, parentKey)) {
                // Our value is part of an array
                // Emit the given objects as list elements
                parsingContext.emittedStack[depth + 1] = true; // Ensure the creation of bnodes for empty nodes
                const values = await util.valueToTerm(await parsingContext.getContext(keys), parentKey, value, depth, keys);
                for (const object of values) {
                    await this.handleListElement(parsingContext, util, object, value, depth, keys.slice(0, -1), depth - 1);
                }
                // If no values were found, emit a falsy list element to force an empty RDF list to be emitted.
                if (values.length === 0) {
                    await this.handleListElement(parsingContext, util, null, value, depth, keys.slice(0, -1), depth - 1);
                }
            }
            else {
                // Copy the stack values up one level so that the next job can access them.
                parsingContext.shiftStack(depth, 1);
                // Execute the job one level higher
                await parsingContext.newOnValueJob(keys.slice(0, -1), value, depth - 1, false);
                // Remove any defined contexts at this level to avoid it to propagate to the next array element.
                parsingContext.contextTree.removeContext(keys.slice(0, -1));
            }
        }
    }
    async handleListElement(parsingContext, util, value, valueOriginal, depth, listRootKeys, listRootDepth) {
        // Buffer our value as an RDF list using the listRootKey as predicate
        let listPointer = parsingContext.listPointerStack[depth];
        if (valueOriginal !== null && (await util.unaliasKeywords(valueOriginal, listRootKeys, depth))['@value'] !== null) {
            if (!listPointer || !listPointer.value) {
                const linkTerm = util.dataFactory.blankNode();
                listPointer = { value: linkTerm, listRootDepth, listId: linkTerm };
            }
            else {
                // rdf:rest links are always emitted before the next element,
                // as the blank node identifier is only created at that point.
                // Because of this reason, the final rdf:nil is emitted when the stack depth is decreased.
                const newLinkTerm = util.dataFactory.blankNode();
                parsingContext.emitQuad(depth, util.dataFactory.quad(listPointer.value, util.rdfRest, newLinkTerm, util.getDefaultGraph()));
                // Update the list pointer for the next element
                listPointer.value = newLinkTerm;
            }
            // Emit a list element for the current value
            // Omit rdf:first if the value is invalid
            if (value) {
                parsingContext.emitQuad(depth, util.dataFactory.quad(listPointer.value, util.rdfFirst, value, util.getDefaultGraph()));
            }
        }
        else {
            // A falsy list element if found.
            // Mark it as an rdf:nil list until another valid list element comes in
            if (!listPointer) {
                listPointer = { listRootDepth, listId: util.rdfNil };
            }
        }
        parsingContext.listPointerStack[depth] = listPointer;
    }
}
exports.EntryHandlerArrayValue = EntryHandlerArrayValue;

},{"../Util":45}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerContainer = void 0;
const ContainerHandlerIdentifier_1 = require("../containerhandler/ContainerHandlerIdentifier");
const ContainerHandlerIndex_1 = require("../containerhandler/ContainerHandlerIndex");
const ContainerHandlerLanguage_1 = require("../containerhandler/ContainerHandlerLanguage");
const ContainerHandlerType_1 = require("../containerhandler/ContainerHandlerType");
const Util_1 = require("../Util");
/**
 * Handles values that are part of a container type (like @index),
 * as specified by {@link IContainerHandler}.
 */
class EntryHandlerContainer {
    /**
     * Check fit the given container is a simple @graph container.
     * Concretely, it will check if no @index or @id is active as well.
     * @param containers A container hash.
     */
    static isSimpleGraphContainer(containers) {
        return '@graph' in containers
            && (('@set' in containers && Object.keys(containers).length === 2) || Object.keys(containers).length === 1);
    }
    /**
     * Check fit the given container is a complex @graph container.
     * Concretely, it will check if @index or @id is active as well next to @graph.
     * @param containers A container hash.
     */
    static isComplexGraphContainer(containers) {
        return '@graph' in containers
            && (('@set' in containers && Object.keys(containers).length > 2)
                || (!('@set' in containers) && Object.keys(containers).length > 1));
    }
    /**
     * Create an graph container index that can be used for identifying a graph term inside the graphContainerTermStack.
     * @param containers The applicable containers.
     * @param depth The container depth.
     * @param keys The array of keys.
     * @return The graph index.
     */
    static getContainerGraphIndex(containers, depth, keys) {
        let isSimpleGraphContainer = EntryHandlerContainer.isSimpleGraphContainer(containers);
        let index = '';
        for (let i = depth; i < keys.length; i++) {
            if (!isSimpleGraphContainer || typeof keys[i] === 'number') {
                index += ':' + keys[i];
            }
            // Only allow a second 'real' key if in a non-simple graph container.
            if (!isSimpleGraphContainer && typeof keys[i] !== 'number') {
                isSimpleGraphContainer = true;
            }
        }
        return index;
    }
    /**
     * Return the applicable container type at the given depth.
     *
     * This will ignore any arrays in the key chain.
     *
     * @param {ParsingContext} parsingContext A parsing context.
     * @param {any[]} keys The array of keys.
     * @param {number} depth The current depth.
     * @return {Promise<{ containers: {[typeName: string]: boolean}, depth: number, fallback: boolean }>}
     *          All applicable containers for the given depth,
     *          the `depth` of the container root (can change when arrays are in the key chain),
     *          and the `fallback` flag that indicates if the default container type was returned
     *            (i.e., no dedicated container type is defined).
     */
    static async getContainerHandler(parsingContext, keys, depth) {
        const fallback = {
            containers: { '@set': true },
            depth,
            fallback: true,
        };
        // A flag that is enabled when @graph container should be tested in next iteration
        let checkGraphContainer = false;
        // Iterate from deeper to higher
        const context = await parsingContext.getContext(keys, 2);
        for (let i = depth - 1; i >= 0; i--) {
            if (typeof keys[i] !== 'number') { // Skip array keys
                // @graph containers without any other types are one level less deep, and require special handling
                const containersSelf = Util_1.Util.getContextValue(context, '@container', keys[i], false);
                if (containersSelf && EntryHandlerContainer.isSimpleGraphContainer(containersSelf)) {
                    return {
                        containers: containersSelf,
                        depth: i + 1,
                        fallback: false,
                    };
                }
                const containersParent = Util_1.Util.getContextValue(context, '@container', keys[i - 1], false);
                if (!containersParent) { // If we have the fallback container value
                    if (checkGraphContainer) {
                        // Return false if we were already expecting a @graph-@id of @graph-@index container
                        return fallback;
                    }
                    // Check parent-parent, we may be in a @graph-@id of @graph-@index container, which have two levels
                    checkGraphContainer = true;
                }
                else {
                    // We had an invalid container next iteration, so we now have to check if we were in an @graph container
                    const graphContainer = '@graph' in containersParent;
                    // We're in a regular container
                    for (const containerHandleName in EntryHandlerContainer.CONTAINER_HANDLERS) {
                        if (containersParent[containerHandleName]) {
                            if (graphContainer) {
                                // Only accept graph containers if their combined handlers can handle them.
                                if (EntryHandlerContainer.CONTAINER_HANDLERS[containerHandleName].canCombineWithGraph()) {
                                    return {
                                        containers: containersParent,
                                        depth: i,
                                        fallback: false,
                                    };
                                }
                                else {
                                    return fallback;
                                }
                            }
                            else {
                                // Only accept if we were not expecting a @graph-@id of @graph-@index container
                                if (checkGraphContainer) {
                                    return fallback;
                                }
                                else {
                                    return {
                                        containers: containersParent,
                                        depth: i,
                                        fallback: false,
                                    };
                                }
                            }
                        }
                    }
                    // Fail if no valid container handlers were found
                    return fallback;
                }
            }
        }
        return fallback;
    }
    /**
     * Check if we are handling a value at the given depth
     * that is part of something that should be handled as a container,
     * AND if this container should be buffered, so that it can be handled by a dedicated container handler.
     *
     * For instance, any container with @graph will NOT be buffered.
     *
     * This will ignore any arrays in the key chain.
     *
     * @param {ParsingContext} parsingContext A parsing context.
     * @param {any[]} keys The array of keys.
     * @param {number} depth The current depth.
     * @return {Promise<boolean>} If we are in the scope of a container handler.
     */
    static async isBufferableContainerHandler(parsingContext, keys, depth) {
        const handler = await EntryHandlerContainer.getContainerHandler(parsingContext, keys, depth);
        return !handler.fallback && !('@graph' in handler.containers);
    }
    isPropertyHandler() {
        return false;
    }
    isStackProcessor() {
        return true;
    }
    async validate(parsingContext, util, keys, depth, inProperty) {
        return !!await this.test(parsingContext, util, null, keys, depth);
    }
    async test(parsingContext, util, key, keys, depth) {
        const containers = Util_1.Util.getContextValueContainer(await parsingContext.getContext(keys, 2), keys[depth - 1]);
        for (const containerName in EntryHandlerContainer.CONTAINER_HANDLERS) {
            if (containers[containerName]) {
                return {
                    containers,
                    handler: EntryHandlerContainer.CONTAINER_HANDLERS[containerName],
                };
            }
        }
        return null;
    }
    async handle(parsingContext, util, key, keys, value, depth, testResult) {
        return testResult.handler.handle(testResult.containers, parsingContext, util, keys, value, depth);
    }
}
exports.EntryHandlerContainer = EntryHandlerContainer;
EntryHandlerContainer.CONTAINER_HANDLERS = {
    '@id': new ContainerHandlerIdentifier_1.ContainerHandlerIdentifier(),
    '@index': new ContainerHandlerIndex_1.ContainerHandlerIndex(),
    '@language': new ContainerHandlerLanguage_1.ContainerHandlerLanguage(),
    '@type': new ContainerHandlerType_1.ContainerHandlerType(),
};

},{"../Util":45,"../containerhandler/ContainerHandlerIdentifier":46,"../containerhandler/ContainerHandlerIndex":47,"../containerhandler/ContainerHandlerLanguage":48,"../containerhandler/ContainerHandlerType":49}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerInvalidFallback = void 0;
/**
 * A catch-all for properties, that will either emit an error or ignore,
 * depending on whether or not the `strictValues` property is set.
 */
class EntryHandlerInvalidFallback {
    isPropertyHandler() {
        return false;
    }
    isStackProcessor() {
        return true;
    }
    async validate(parsingContext, util, keys, depth, inProperty) {
        return false;
    }
    async test(parsingContext, util, key, keys, depth) {
        return true;
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        parsingContext.emittedStack[depth] = false;
    }
}
exports.EntryHandlerInvalidFallback = EntryHandlerInvalidFallback;

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerPredicate = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const Util_1 = require("../Util");
/**
 * Interprets keys as predicates.
 * The most common case in JSON-LD processing.
 */
class EntryHandlerPredicate {
    /**
     * Handle the given predicate-object by either emitting it,
     * or by placing it in the appropriate stack for later emission when no @graph and/or @id has been defined.
     * @param {ParsingContext} parsingContext A parsing context.
     * @param {Util} util A utility instance.
     * @param {any[]} keys A stack of keys.
     * @param {number} depth The current depth.
     * @param {Term} predicate The predicate.
     * @param {Term} object The object.
     * @param {boolean} reverse If the property is reversed.
     * @return {Promise<void>} A promise resolving when handling is done.
     */
    static async handlePredicateObject(parsingContext, util, keys, depth, predicate, object, reverse) {
        const depthProperties = await util.getPropertiesDepth(keys, depth);
        const depthOffsetGraph = await util.getDepthOffsetGraph(depth, keys);
        const depthPropertiesGraph = depth - depthOffsetGraph;
        const subjects = parsingContext.idStack[depthProperties];
        if (subjects) {
            // Emit directly if the @id was already defined
            for (const subject of subjects) {
                // Check if we're in a @graph context
                const atGraph = depthOffsetGraph >= 0;
                if (atGraph) {
                    const graphs = parsingContext.idStack[depthPropertiesGraph - 1];
                    if (graphs) {
                        for (const graph of graphs) {
                            // Emit our quad if graph @id is known
                            if (reverse) {
                                util.validateReverseSubject(object);
                                parsingContext.emitQuad(depth, util.dataFactory.quad(object, predicate, subject, graph));
                            }
                            else {
                                parsingContext.emitQuad(depth, util.dataFactory.quad(subject, predicate, object, graph));
                            }
                        }
                    }
                    else {
                        // Buffer our triple if graph @id is not known yet.
                        if (reverse) {
                            util.validateReverseSubject(object);
                            parsingContext.getUnidentifiedGraphBufferSafe(depthPropertiesGraph - 1).push({ subject: object, predicate, object: subject });
                        }
                        else {
                            parsingContext.getUnidentifiedGraphBufferSafe(depthPropertiesGraph - 1)
                                .push({ subject, predicate, object });
                        }
                    }
                }
                else {
                    // Emit if no @graph was applicable
                    const graph = await util.getGraphContainerValue(keys, depthProperties);
                    if (reverse) {
                        util.validateReverseSubject(object);
                        parsingContext.emitQuad(depth, util.dataFactory.quad(object, predicate, subject, graph));
                    }
                    else {
                        parsingContext.emitQuad(depth, util.dataFactory.quad(subject, predicate, object, graph));
                    }
                }
            }
        }
        else {
            // Buffer until our @id becomes known, or we go up the stack
            if (reverse) {
                util.validateReverseSubject(object);
            }
            parsingContext.getUnidentifiedValueBufferSafe(depthProperties).push({ predicate, object, reverse });
        }
    }
    isPropertyHandler() {
        return true;
    }
    isStackProcessor() {
        return true;
    }
    async validate(parsingContext, util, keys, depth, inProperty) {
        const key = keys[depth];
        if (key) {
            const context = await parsingContext.getContext(keys);
            if (await util.predicateToTerm(context, keys[depth])) {
                // If this valid predicate is of type @json, mark it so in the stack so that no deeper handling of nodes occurs.
                if (Util_1.Util.getContextValueType(context, key) === '@json') {
                    parsingContext.jsonLiteralStack[depth + 1] = true;
                }
                return true;
            }
        }
        return false;
    }
    async test(parsingContext, util, key, keys, depth) {
        return keys[depth];
    }
    async handle(parsingContext, util, key, keys, value, depth, testResult) {
        const keyOriginal = keys[depth];
        const context = await parsingContext.getContext(keys);
        const predicate = await util.predicateToTerm(context, key);
        if (predicate) {
            const objects = await util.valueToTerm(context, key, value, depth, keys);
            if (objects.length) {
                for (let object of objects) {
                    const reverse = Util_1.Util.isPropertyReverse(context, keyOriginal, await util.unaliasKeywordParent(keys, depth));
                    if (value) {
                        // Special case if our term was defined as an @list, but does not occur in an array,
                        // In that case we just emit it as an RDF list with a single element.
                        const listValueContainer = '@list' in Util_1.Util.getContextValueContainer(context, key);
                        if (listValueContainer || value['@list']) {
                            if (((listValueContainer && !Array.isArray(value) && !value['@list'])
                                || (value['@list'] && !Array.isArray(value['@list'])))
                                && object !== util.rdfNil) {
                                const listPointer = util.dataFactory.blankNode();
                                parsingContext.emitQuad(depth, util.dataFactory.quad(listPointer, util.rdfRest, util.rdfNil, util.getDefaultGraph()));
                                parsingContext.emitQuad(depth, util.dataFactory.quad(listPointer, util.rdfFirst, object, util.getDefaultGraph()));
                                object = listPointer;
                            }
                            // Lists are not allowed in @reverse'd properties
                            if (reverse && !parsingContext.allowSubjectList) {
                                throw new jsonld_context_parser_1.ErrorCoded(`Found illegal list value in subject position at ${key}`, jsonld_context_parser_1.ERROR_CODES.INVALID_REVERSE_PROPERTY_VALUE);
                            }
                        }
                    }
                    await EntryHandlerPredicate.handlePredicateObject(parsingContext, util, keys, depth, predicate, object, reverse);
                }
            }
        }
    }
}
exports.EntryHandlerPredicate = EntryHandlerPredicate;

},{"../Util":45,"jsonld-context-parser":33}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeyword = void 0;
/**
 * An abstract keyword entry handler.
 */
class EntryHandlerKeyword {
    constructor(keyword) {
        this.keyword = keyword;
    }
    isPropertyHandler() {
        return false;
    }
    isStackProcessor() {
        return true;
    }
    async validate(parsingContext, util, keys, depth, inProperty) {
        return false;
    }
    async test(parsingContext, util, key, keys, depth) {
        return key === this.keyword;
    }
}
exports.EntryHandlerKeyword = EntryHandlerKeyword;

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordContext = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @context entries.
 */
class EntryHandlerKeywordContext extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@context');
    }
    isStackProcessor() {
        return false;
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        // Error if an out-of-order context was found when support is not enabled.
        if (parsingContext.streamingProfile
            && (parsingContext.processingStack[depth]
                || parsingContext.processingType[depth]
                || parsingContext.idStack[depth] !== undefined)) {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded('Found an out-of-order context, while streaming is enabled.' +
                '(disable `streamingProfile`)', jsonld_context_parser_1.ERROR_CODES.INVALID_STREAMING_KEY_ORDER));
        }
        // Find the parent context to inherit from.
        // We actually request a context for the current depth (with fallback to parent)
        // because we want to take into account any property-scoped contexts that are defined for this depth.
        const parentContext = parsingContext.getContext(keys);
        // Set the context for this scope
        const context = parsingContext.parseContext(value, (await parentContext).getContextRaw());
        parsingContext.contextTree.setContext(keys.slice(0, -1), context);
        parsingContext.emitContext(value);
        await parsingContext.validateContext(await context);
    }
}
exports.EntryHandlerKeywordContext = EntryHandlerKeywordContext;

},{"./EntryHandlerKeyword":54,"jsonld-context-parser":33}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordGraph = void 0;
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @graph entries.
 */
class EntryHandlerKeywordGraph extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@graph');
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        // The current identifier identifies a graph for the deeper level.
        parsingContext.graphStack[depth + 1] = true;
    }
}
exports.EntryHandlerKeywordGraph = EntryHandlerKeywordGraph;

},{"./EntryHandlerKeyword":54}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordId = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @id entries.
 */
class EntryHandlerKeywordId extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@id');
    }
    isStackProcessor() {
        return false;
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        if (typeof value !== 'string') {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal @id '${value}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_ID_VALUE));
        }
        // Determine the canonical place for this id.
        // For example, @nest parents should be ignored.
        const depthProperties = await util.getPropertiesDepth(keys, depth);
        // Error if an @id for this node already existed.
        if (parsingContext.idStack[depthProperties] !== undefined) {
            if (parsingContext.idStack[depthProperties][0].listHead) {
                // Error if an @list was already defined for this node
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal neighbouring entries next to @list for key: '${keys[depth - 1]}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_SET_OR_LIST_OBJECT));
            }
            else {
                // Otherwise, the previous id was just because of an @id entry.
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found duplicate @ids '${parsingContext
                    .idStack[depthProperties][0].value}' and '${value}'`, jsonld_context_parser_1.ERROR_CODES.COLLIDING_KEYWORDS));
            }
        }
        // Save our @id on the stack
        parsingContext.idStack[depthProperties] = util.nullableTermToArray(await util.resourceToTerm(await parsingContext.getContext(keys), value));
    }
}
exports.EntryHandlerKeywordId = EntryHandlerKeywordId;

},{"./EntryHandlerKeyword":54,"jsonld-context-parser":33}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordIncluded = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @included entries.
 */
class EntryHandlerKeywordIncluded extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@included');
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        if (typeof value !== 'object') {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal @included '${value}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_INCLUDED_VALUE));
        }
        const valueUnliased = await util.unaliasKeywords(value, keys, depth, await parsingContext.getContext(keys));
        if ('@value' in valueUnliased) {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found an illegal @included @value node '${JSON.stringify(value)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_INCLUDED_VALUE));
        }
        if ('@list' in valueUnliased) {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found an illegal @included @list node '${JSON.stringify(value)}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_INCLUDED_VALUE));
        }
        parsingContext.emittedStack[depth] = false;
    }
}
exports.EntryHandlerKeywordIncluded = EntryHandlerKeywordIncluded;

},{"./EntryHandlerKeyword":54,"jsonld-context-parser":33}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordNest = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @nest entries.
 */
class EntryHandlerKeywordNest extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@nest');
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        if (typeof value !== 'object') {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found invalid @nest entry for '${key}': '${value}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_NEST_VALUE));
        }
        if ('@value' in await util.unaliasKeywords(value, keys, depth, await parsingContext.getContext(keys))) {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found an invalid @value node for '${key}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_NEST_VALUE));
        }
        parsingContext.emittedStack[depth] = false;
    }
}
exports.EntryHandlerKeywordNest = EntryHandlerKeywordNest;

},{"./EntryHandlerKeyword":54,"jsonld-context-parser":33}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordType = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
const Util_1 = require("../../Util");
const EntryHandlerPredicate_1 = require("../EntryHandlerPredicate");
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @graph entries.
 */
class EntryHandlerKeywordType extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@type');
    }
    isStackProcessor() {
        return false;
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        const keyOriginal = keys[depth];
        // The current identifier identifies an rdf:type predicate.
        // But we only emit it once the node closes,
        // as it's possible that the @type is used to identify the datatype of a literal, which we ignore here.
        const context = await parsingContext.getContext(keys);
        const predicate = util.rdfType;
        const reverse = Util_1.Util.isPropertyReverse(context, keyOriginal, await util.unaliasKeywordParent(keys, depth));
        // Handle multiple values if the value is an array
        const elements = Array.isArray(value) ? value : [value];
        for (const element of elements) {
            if (typeof element !== 'string') {
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Found illegal @type '${element}'`, jsonld_context_parser_1.ERROR_CODES.INVALID_TYPE_VALUE));
            }
            const type = util.createVocabOrBaseTerm(context, element);
            if (type) {
                await EntryHandlerPredicate_1.EntryHandlerPredicate.handlePredicateObject(parsingContext, util, keys, depth, predicate, type, reverse);
            }
        }
        // Collect type-scoped contexts if they exist
        let scopedContext = Promise.resolve(context);
        let hasTypedScopedContext = false;
        for (const element of elements.sort()) { // Spec requires lexicographical ordering
            const typeContext = Util_1.Util.getContextValue(context, '@context', element, null);
            if (typeContext) {
                hasTypedScopedContext = true;
                scopedContext = scopedContext.then((c) => parsingContext.parseContext(typeContext, c.getContextRaw()));
            }
        }
        // Error if an out-of-order type-scoped context was found when support is not enabled.
        if (parsingContext.streamingProfile
            && (hasTypedScopedContext || !parsingContext.streamingProfileAllowOutOfOrderPlainType)
            && (parsingContext.processingStack[depth] || parsingContext.idStack[depth])) {
            parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded('Found an out-of-order type-scoped context, while streaming is enabled.' +
                '(disable `streamingProfile`)', jsonld_context_parser_1.ERROR_CODES.INVALID_STREAMING_KEY_ORDER));
        }
        // If at least least one type-scoped context applies, set them in the tree.
        if (hasTypedScopedContext) {
            // Do not propagate by default
            scopedContext = scopedContext.then((c) => {
                if (!('@propagate' in c.getContextRaw())) {
                    c.getContextRaw()['@propagate'] = false;
                }
                // Set the original context at this depth as a fallback
                // This is needed when a context was already defined at the given depth,
                // and this context needs to remain accessible from child nodes when propagation is disabled.
                if (c.getContextRaw()['@propagate'] === false) {
                    c.getContextRaw()['@__propagateFallback'] = context.getContextRaw();
                }
                return c;
            });
            // Set the new context in the context tree
            parsingContext.contextTree.setContext(keys.slice(0, keys.length - 1), scopedContext);
        }
        // Flag that type has been processed at this depth
        parsingContext.processingType[depth] = true;
    }
}
exports.EntryHandlerKeywordType = EntryHandlerKeywordType;

},{"../../Util":45,"../EntryHandlerPredicate":53,"./EntryHandlerKeyword":54,"jsonld-context-parser":33}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordUnknownFallback = void 0;
const jsonld_context_parser_1 = require("jsonld-context-parser");
/**
 * A catch-all for keywords, that will either emit an error or ignore,
 * depending on whether or not the `strictValues` property is set.
 */
class EntryHandlerKeywordUnknownFallback {
    isPropertyHandler() {
        return false;
    }
    isStackProcessor() {
        return true;
    }
    async validate(parsingContext, util, keys, depth, inProperty) {
        const key = await util.unaliasKeyword(keys[depth], keys, depth);
        if (jsonld_context_parser_1.Util.isPotentialKeyword(key)) {
            // Don't emit anything inside free-floating lists
            if (!inProperty) {
                if (key === '@list') {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    async test(parsingContext, util, key, keys, depth) {
        return jsonld_context_parser_1.Util.isPotentialKeyword(key);
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        const keywordType = EntryHandlerKeywordUnknownFallback.VALID_KEYWORDS_TYPES[key];
        if (keywordType !== undefined) {
            if (keywordType && typeof value !== keywordType.type) {
                parsingContext.emitError(new jsonld_context_parser_1.ErrorCoded(`Invalid value type for '${key}' with value '${value}'`, keywordType.errorCode));
            }
        }
        else if (parsingContext.strictValues) {
            parsingContext.emitError(new Error(`Unknown keyword '${key}' with value '${value}'`));
        }
        parsingContext.emittedStack[depth] = false;
    }
}
exports.EntryHandlerKeywordUnknownFallback = EntryHandlerKeywordUnknownFallback;
EntryHandlerKeywordUnknownFallback.VALID_KEYWORDS_TYPES = {
    '@index': { type: 'string', errorCode: jsonld_context_parser_1.ERROR_CODES.INVALID_INDEX_VALUE },
    '@list': null,
    '@reverse': { type: 'object', errorCode: jsonld_context_parser_1.ERROR_CODES.INVALID_REVERSE_VALUE },
    '@set': null,
    '@value': null,
};

},{"jsonld-context-parser":33}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryHandlerKeywordValue = void 0;
const EntryHandlerKeyword_1 = require("./EntryHandlerKeyword");
/**
 * Handles @value entries.
 */
class EntryHandlerKeywordValue extends EntryHandlerKeyword_1.EntryHandlerKeyword {
    constructor() {
        super('@value');
    }
    async test(parsingContext, util, key, keys, depth) {
        return await util.unaliasKeyword(keys[depth], keys.slice(0, keys.length - 1), depth - 1, true) === '@value';
    }
    async handle(parsingContext, util, key, keys, value, depth) {
        // If the value is valid, indicate that we are processing a literal.
        // The actual value will be determined at the parent level when the @value is part of an object,
        // because we may want to take into account additional entries such as @language.
        // See {@link Util.valueToTerm}
        // Indicate that we are processing a literal, and that no later predicates should be parsed at this depth.
        parsingContext.literalStack[depth] = true;
        // Void any buffers that we may have accumulated up until now
        delete parsingContext.unidentifiedValuesBuffer[depth];
        delete parsingContext.unidentifiedGraphsBuffer[depth];
        // Indicate that we have not emitted at this depth
        parsingContext.emittedStack[depth] = false;
    }
}
exports.EntryHandlerKeywordValue = EntryHandlerKeywordValue;

},{"./EntryHandlerKeyword":54}],63:[function(require,module,exports){
(function (Buffer){(function (){
/*global Buffer*/
// Named constants with unique integer values
var C = {};
// Tokens
var LEFT_BRACE    = C.LEFT_BRACE    = 0x1;
var RIGHT_BRACE   = C.RIGHT_BRACE   = 0x2;
var LEFT_BRACKET  = C.LEFT_BRACKET  = 0x3;
var RIGHT_BRACKET = C.RIGHT_BRACKET = 0x4;
var COLON         = C.COLON         = 0x5;
var COMMA         = C.COMMA         = 0x6;
var TRUE          = C.TRUE          = 0x7;
var FALSE         = C.FALSE         = 0x8;
var NULL          = C.NULL          = 0x9;
var STRING        = C.STRING        = 0xa;
var NUMBER        = C.NUMBER        = 0xb;
// Tokenizer States
var START   = C.START   = 0x11;
var STOP    = C.STOP    = 0x12;
var TRUE1   = C.TRUE1   = 0x21;
var TRUE2   = C.TRUE2   = 0x22;
var TRUE3   = C.TRUE3   = 0x23;
var FALSE1  = C.FALSE1  = 0x31;
var FALSE2  = C.FALSE2  = 0x32;
var FALSE3  = C.FALSE3  = 0x33;
var FALSE4  = C.FALSE4  = 0x34;
var NULL1   = C.NULL1   = 0x41;
var NULL2   = C.NULL2   = 0x42;
var NULL3   = C.NULL3   = 0x43;
var NUMBER1 = C.NUMBER1 = 0x51;
var NUMBER3 = C.NUMBER3 = 0x53;
var STRING1 = C.STRING1 = 0x61;
var STRING2 = C.STRING2 = 0x62;
var STRING3 = C.STRING3 = 0x63;
var STRING4 = C.STRING4 = 0x64;
var STRING5 = C.STRING5 = 0x65;
var STRING6 = C.STRING6 = 0x66;
// Parser States
var VALUE   = C.VALUE   = 0x71;
var KEY     = C.KEY     = 0x72;
// Parser Modes
var OBJECT  = C.OBJECT  = 0x81;
var ARRAY   = C.ARRAY   = 0x82;
// Character constants
var BACK_SLASH =      "\\".charCodeAt(0);
var FORWARD_SLASH =   "\/".charCodeAt(0);
var BACKSPACE =       "\b".charCodeAt(0);
var FORM_FEED =       "\f".charCodeAt(0);
var NEWLINE =         "\n".charCodeAt(0);
var CARRIAGE_RETURN = "\r".charCodeAt(0);
var TAB =             "\t".charCodeAt(0);

var STRING_BUFFER_SIZE = 64 * 1024;

function Parser() {
  this.tState = START;
  this.value = undefined;

  this.string = undefined; // string data
  this.stringBuffer = Buffer.alloc ? Buffer.alloc(STRING_BUFFER_SIZE) : new Buffer(STRING_BUFFER_SIZE);
  this.stringBufferOffset = 0;
  this.unicode = undefined; // unicode escapes
  this.highSurrogate = undefined;

  this.key = undefined;
  this.mode = undefined;
  this.stack = [];
  this.state = VALUE;
  this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
  this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
  this.temp_buffs = { "2": new Buffer(2), "3": new Buffer(3), "4": new Buffer(4) }; // for rebuilding chars split before boundary is reached

  // Stream offset
  this.offset = -1;
}

// Slow code to string converter (only used when throwing syntax errors)
Parser.toknam = function (code) {
  var keys = Object.keys(C);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    if (C[key] === code) { return key; }
  }
  return code && ("0x" + code.toString(16));
};

var proto = Parser.prototype;
proto.onError = function (err) { throw err; };
proto.charError = function (buffer, i) {
  this.tState = STOP;
  this.onError(new Error("Unexpected " + JSON.stringify(String.fromCharCode(buffer[i])) + " at position " + i + " in state " + Parser.toknam(this.tState)));
};
proto.appendStringChar = function (char) {
  if (this.stringBufferOffset >= STRING_BUFFER_SIZE) {
    this.string += this.stringBuffer.toString('utf8');
    this.stringBufferOffset = 0;
  }

  this.stringBuffer[this.stringBufferOffset++] = char;
};
proto.appendStringBuf = function (buf, start, end) {
  var size = buf.length;
  if (typeof start === 'number') {
    if (typeof end === 'number') {
      if (end < 0) {
        // adding a negative end decreeses the size
        size = buf.length - start + end;
      } else {
        size = end - start;
      }
    } else {
      size = buf.length - start;
    }
  }

  if (size < 0) {
    size = 0;
  }

  if (this.stringBufferOffset + size > STRING_BUFFER_SIZE) {
    this.string += this.stringBuffer.toString('utf8', 0, this.stringBufferOffset);
    this.stringBufferOffset = 0;
  }

  buf.copy(this.stringBuffer, this.stringBufferOffset, start, end);
  this.stringBufferOffset += size;
};
proto.write = function (buffer) {
  if (typeof buffer === "string") buffer = new Buffer(buffer);
  var n;
  for (var i = 0, l = buffer.length; i < l; i++) {
    if (this.tState === START){
      n = buffer[i];
      this.offset++;
      if(n === 0x7b){ this.onToken(LEFT_BRACE, "{"); // {
      }else if(n === 0x7d){ this.onToken(RIGHT_BRACE, "}"); // }
      }else if(n === 0x5b){ this.onToken(LEFT_BRACKET, "["); // [
      }else if(n === 0x5d){ this.onToken(RIGHT_BRACKET, "]"); // ]
      }else if(n === 0x3a){ this.onToken(COLON, ":");  // :
      }else if(n === 0x2c){ this.onToken(COMMA, ","); // ,
      }else if(n === 0x74){ this.tState = TRUE1;  // t
      }else if(n === 0x66){ this.tState = FALSE1;  // f
      }else if(n === 0x6e){ this.tState = NULL1; // n
      }else if(n === 0x22){ // "
        this.string = "";
        this.stringBufferOffset = 0;
        this.tState = STRING1;
      }else if(n === 0x2d){ this.string = "-"; this.tState = NUMBER1; // -
      }else{
        if (n >= 0x30 && n < 0x40) { // 1-9
          this.string = String.fromCharCode(n); this.tState = NUMBER3;
        } else if (n === 0x20 || n === 0x09 || n === 0x0a || n === 0x0d) {
          // whitespace
        } else {
          return this.charError(buffer, i);
        }
      }
    }else if (this.tState === STRING1){ // After open quote
      n = buffer[i]; // get current byte from buffer
      // check for carry over of a multi byte char split between data chunks
      // & fill temp buffer it with start of this data chunk up to the boundary limit set in the last iteration
      if (this.bytes_remaining > 0) {
        for (var j = 0; j < this.bytes_remaining; j++) {
          this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + j] = buffer[j];
        }

        this.appendStringBuf(this.temp_buffs[this.bytes_in_sequence]);
        this.bytes_in_sequence = this.bytes_remaining = 0;
        i = i + j - 1;
      } else if (this.bytes_remaining === 0 && n >= 128) { // else if no remainder bytes carried over, parse multi byte (>=128) chars one at a time
        if (n <= 193 || n > 244) {
          return this.onError(new Error("Invalid UTF-8 character at position " + i + " in state " + Parser.toknam(this.tState)));
        }
        if ((n >= 194) && (n <= 223)) this.bytes_in_sequence = 2;
        if ((n >= 224) && (n <= 239)) this.bytes_in_sequence = 3;
        if ((n >= 240) && (n <= 244)) this.bytes_in_sequence = 4;
        if ((this.bytes_in_sequence + i) > buffer.length) { // if bytes needed to complete char fall outside buffer length, we have a boundary split
          for (var k = 0; k <= (buffer.length - 1 - i); k++) {
            this.temp_buffs[this.bytes_in_sequence][k] = buffer[i + k]; // fill temp buffer of correct size with bytes available in this chunk
          }
          this.bytes_remaining = (i + this.bytes_in_sequence) - buffer.length;
          i = buffer.length - 1;
        } else {
          this.appendStringBuf(buffer, i, i + this.bytes_in_sequence);
          i = i + this.bytes_in_sequence - 1;
        }
      } else if (n === 0x22) {
        this.tState = START;
        this.string += this.stringBuffer.toString('utf8', 0, this.stringBufferOffset);
        this.stringBufferOffset = 0;
        this.onToken(STRING, this.string);
        this.offset += Buffer.byteLength(this.string, 'utf8') + 1;
        this.string = undefined;
      }
      else if (n === 0x5c) {
        this.tState = STRING2;
      }
      else if (n >= 0x20) { this.appendStringChar(n); }
      else {
          return this.charError(buffer, i);
      }
    }else if (this.tState === STRING2){ // After backslash
      n = buffer[i];
      if(n === 0x22){ this.appendStringChar(n); this.tState = STRING1;
      }else if(n === 0x5c){ this.appendStringChar(BACK_SLASH); this.tState = STRING1;
      }else if(n === 0x2f){ this.appendStringChar(FORWARD_SLASH); this.tState = STRING1;
      }else if(n === 0x62){ this.appendStringChar(BACKSPACE); this.tState = STRING1;
      }else if(n === 0x66){ this.appendStringChar(FORM_FEED); this.tState = STRING1;
      }else if(n === 0x6e){ this.appendStringChar(NEWLINE); this.tState = STRING1;
      }else if(n === 0x72){ this.appendStringChar(CARRIAGE_RETURN); this.tState = STRING1;
      }else if(n === 0x74){ this.appendStringChar(TAB); this.tState = STRING1;
      }else if(n === 0x75){ this.unicode = ""; this.tState = STRING3;
      }else{
        return this.charError(buffer, i);
      }
    }else if (this.tState === STRING3 || this.tState === STRING4 || this.tState === STRING5 || this.tState === STRING6){ // unicode hex codes
      n = buffer[i];
      // 0-9 A-F a-f
      if ((n >= 0x30 && n < 0x40) || (n > 0x40 && n <= 0x46) || (n > 0x60 && n <= 0x66)) {
        this.unicode += String.fromCharCode(n);
        if (this.tState++ === STRING6) {
          var intVal = parseInt(this.unicode, 16);
          this.unicode = undefined;
          if (this.highSurrogate !== undefined && intVal >= 0xDC00 && intVal < (0xDFFF + 1)) { //<56320,57343> - lowSurrogate
            this.appendStringBuf(new Buffer(String.fromCharCode(this.highSurrogate, intVal)));
            this.highSurrogate = undefined;
          } else if (this.highSurrogate === undefined && intVal >= 0xD800 && intVal < (0xDBFF + 1)) { //<55296,56319> - highSurrogate
            this.highSurrogate = intVal;
          } else {
            if (this.highSurrogate !== undefined) {
              this.appendStringBuf(new Buffer(String.fromCharCode(this.highSurrogate)));
              this.highSurrogate = undefined;
            }
            this.appendStringBuf(new Buffer(String.fromCharCode(intVal)));
          }
          this.tState = STRING1;
        }
      } else {
        return this.charError(buffer, i);
      }
    } else if (this.tState === NUMBER1 || this.tState === NUMBER3) {
        n = buffer[i];

        switch (n) {
          case 0x30: // 0
          case 0x31: // 1
          case 0x32: // 2
          case 0x33: // 3
          case 0x34: // 4
          case 0x35: // 5
          case 0x36: // 6
          case 0x37: // 7
          case 0x38: // 8
          case 0x39: // 9
          case 0x2e: // .
          case 0x65: // e
          case 0x45: // E
          case 0x2b: // +
          case 0x2d: // -
            this.string += String.fromCharCode(n);
            this.tState = NUMBER3;
            break;
          default:
            this.tState = START;
            var result = Number(this.string);

            if (isNaN(result)){
              return this.charError(buffer, i);
            }

            if ((this.string.match(/[0-9]+/) == this.string) && (result.toString() != this.string)) {
              // Long string of digits which is an ID string and not valid and/or safe JavaScript integer Number
              this.onToken(STRING, this.string);
            } else {
              this.onToken(NUMBER, result);
            }

            this.offset += this.string.length - 1;
            this.string = undefined;
            i--;
            break;
        }
    }else if (this.tState === TRUE1){ // r
      if (buffer[i] === 0x72) { this.tState = TRUE2; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === TRUE2){ // u
      if (buffer[i] === 0x75) { this.tState = TRUE3; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === TRUE3){ // e
      if (buffer[i] === 0x65) { this.tState = START; this.onToken(TRUE, true); this.offset+= 3; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === FALSE1){ // a
      if (buffer[i] === 0x61) { this.tState = FALSE2; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === FALSE2){ // l
      if (buffer[i] === 0x6c) { this.tState = FALSE3; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === FALSE3){ // s
      if (buffer[i] === 0x73) { this.tState = FALSE4; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === FALSE4){ // e
      if (buffer[i] === 0x65) { this.tState = START; this.onToken(FALSE, false); this.offset+= 4; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === NULL1){ // u
      if (buffer[i] === 0x75) { this.tState = NULL2; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === NULL2){ // l
      if (buffer[i] === 0x6c) { this.tState = NULL3; }
      else { return this.charError(buffer, i); }
    }else if (this.tState === NULL3){ // l
      if (buffer[i] === 0x6c) { this.tState = START; this.onToken(NULL, null); this.offset += 3; }
      else { return this.charError(buffer, i); }
    }
  }
};
proto.onToken = function (token, value) {
  // Override this to get events
};

proto.parseError = function (token, value) {
  this.tState = STOP;
  this.onError(new Error("Unexpected " + Parser.toknam(token) + (value ? ("(" + JSON.stringify(value) + ")") : "") + " in state " + Parser.toknam(this.state)));
};
proto.push = function () {
  this.stack.push({value: this.value, key: this.key, mode: this.mode});
};
proto.pop = function () {
  var value = this.value;
  var parent = this.stack.pop();
  this.value = parent.value;
  this.key = parent.key;
  this.mode = parent.mode;
  this.emit(value);
  if (!this.mode) { this.state = VALUE; }
};
proto.emit = function (value) {
  if (this.mode) { this.state = COMMA; }
  this.onValue(value);
};
proto.onValue = function (value) {
  // Override me
};
proto.onToken = function (token, value) {
  if(this.state === VALUE){
    if(token === STRING || token === NUMBER || token === TRUE || token === FALSE || token === NULL){
      if (this.value) {
        this.value[this.key] = value;
      }
      this.emit(value);
    }else if(token === LEFT_BRACE){
      this.push();
      if (this.value) {
        this.value = this.value[this.key] = {};
      } else {
        this.value = {};
      }
      this.key = undefined;
      this.state = KEY;
      this.mode = OBJECT;
    }else if(token === LEFT_BRACKET){
      this.push();
      if (this.value) {
        this.value = this.value[this.key] = [];
      } else {
        this.value = [];
      }
      this.key = 0;
      this.mode = ARRAY;
      this.state = VALUE;
    }else if(token === RIGHT_BRACE){
      if (this.mode === OBJECT) {
        this.pop();
      } else {
        return this.parseError(token, value);
      }
    }else if(token === RIGHT_BRACKET){
      if (this.mode === ARRAY) {
        this.pop();
      } else {
        return this.parseError(token, value);
      }
    }else{
      return this.parseError(token, value);
    }
  }else if(this.state === KEY){
    if (token === STRING) {
      this.key = value;
      this.state = COLON;
    } else if (token === RIGHT_BRACE) {
      this.pop();
    } else {
      return this.parseError(token, value);
    }
  }else if(this.state === COLON){
    if (token === COLON) { this.state = VALUE; }
    else { return this.parseError(token, value); }
  }else if(this.state === COMMA){
    if (token === COMMA) {
      if (this.mode === ARRAY) { this.key++; this.state = VALUE; }
      else if (this.mode === OBJECT) { this.state = KEY; }

    } else if (token === RIGHT_BRACKET && this.mode === ARRAY || token === RIGHT_BRACE && this.mode === OBJECT) {
      this.pop();
    } else {
      return this.parseError(token, value);
    }
  }else{
    return this.parseError(token, value);
  }
};

Parser.C = C;

module.exports = Parser;

}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":4}],64:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib/BlankNode"), exports);
__exportStar(require("./lib/DataFactory"), exports);
__exportStar(require("./lib/DefaultGraph"), exports);
__exportStar(require("./lib/Literal"), exports);
__exportStar(require("./lib/NamedNode"), exports);
__exportStar(require("./lib/Quad"), exports);
__exportStar(require("./lib/Variable"), exports);

},{"./lib/BlankNode":65,"./lib/DataFactory":66,"./lib/DefaultGraph":67,"./lib/Literal":68,"./lib/NamedNode":69,"./lib/Quad":70,"./lib/Variable":71}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlankNode = void 0;
/**
 * A term that represents an RDF blank node with a label.
 */
class BlankNode {
    constructor(value) {
        this.termType = 'BlankNode';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'BlankNode' && other.value === this.value;
    }
}
exports.BlankNode = BlankNode;

},{}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFactory = void 0;
const BlankNode_1 = require("./BlankNode");
const DefaultGraph_1 = require("./DefaultGraph");
const Literal_1 = require("./Literal");
const NamedNode_1 = require("./NamedNode");
const Quad_1 = require("./Quad");
const Variable_1 = require("./Variable");
let dataFactoryCounter = 0;
/**
 * A factory for instantiating RDF terms and quads.
 */
class DataFactory {
    constructor(options) {
        this.blankNodeCounter = 0;
        options = options || {};
        this.blankNodePrefix = options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
    }
    /**
     * @param value The IRI for the named node.
     * @return A new instance of NamedNode.
     * @see NamedNode
     */
    namedNode(value) {
        return new NamedNode_1.NamedNode(value);
    }
    /**
     * @param value The optional blank node identifier.
     * @return A new instance of BlankNode.
     *         If the `value` parameter is undefined a new identifier
     *         for the blank node is generated for each call.
     * @see BlankNode
     */
    blankNode(value) {
        return new BlankNode_1.BlankNode(value || `${this.blankNodePrefix}${this.blankNodeCounter++}`);
    }
    /**
     * @param value              The literal value.
     * @param languageOrDatatype The optional language or datatype.
     *                           If `languageOrDatatype` is a NamedNode,
     *                           then it is used for the value of `NamedNode.datatype`.
     *                           Otherwise `languageOrDatatype` is used for the value
     *                           of `NamedNode.language`.
     * @return A new instance of Literal.
     * @see Literal
     */
    literal(value, languageOrDatatype) {
        return new Literal_1.Literal(value, languageOrDatatype);
    }
    /**
     * This method is optional.
     * @param value The variable name
     * @return A new instance of Variable.
     * @see Variable
     */
    variable(value) {
        return new Variable_1.Variable(value);
    }
    /**
     * @return An instance of DefaultGraph.
     */
    defaultGraph() {
        return DefaultGraph_1.DefaultGraph.INSTANCE;
    }
    /**
     * @param subject   The quad subject term.
     * @param predicate The quad predicate term.
     * @param object    The quad object term.
     * @param graph     The quad graph term.
     * @return A new instance of Quad.
     * @see Quad
     */
    quad(subject, predicate, object, graph) {
        return new Quad_1.Quad(subject, predicate, object, graph || this.defaultGraph());
    }
    /**
     * Create a deep copy of the given term using this data factory.
     * @param original An RDF term.
     * @return A deep copy of the given term.
     */
    fromTerm(original) {
        // TODO: remove nasty any casts when this TS bug has been fixed:
        //  https://github.com/microsoft/TypeScript/issues/26933
        switch (original.termType) {
            case 'NamedNode':
                return this.namedNode(original.value);
            case 'BlankNode':
                return this.blankNode(original.value);
            case 'Literal':
                if (original.language) {
                    return this.literal(original.value, original.language);
                }
                if (!original.datatype.equals(Literal_1.Literal.XSD_STRING)) {
                    return this.literal(original.value, this.fromTerm(original.datatype));
                }
                return this.literal(original.value);
            case 'Variable':
                return this.variable(original.value);
            case 'DefaultGraph':
                return this.defaultGraph();
            case 'Quad':
                return this.quad(this.fromTerm(original.subject), this.fromTerm(original.predicate), this.fromTerm(original.object), this.fromTerm(original.graph));
        }
    }
    /**
     * Create a deep copy of the given quad using this data factory.
     * @param original An RDF quad.
     * @return A deep copy of the given quad.
     */
    fromQuad(original) {
        return this.fromTerm(original);
    }
    /**
     * Reset the internal blank node counter.
     */
    resetBlankNodeCounter() {
        this.blankNodeCounter = 0;
    }
}
exports.DataFactory = DataFactory;

},{"./BlankNode":65,"./DefaultGraph":67,"./Literal":68,"./NamedNode":69,"./Quad":70,"./Variable":71}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGraph = void 0;
/**
 * A singleton term instance that represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
class DefaultGraph {
    constructor() {
        this.termType = 'DefaultGraph';
        this.value = '';
        // Private constructor
    }
    equals(other) {
        return !!other && other.termType === 'DefaultGraph';
    }
}
exports.DefaultGraph = DefaultGraph;
DefaultGraph.INSTANCE = new DefaultGraph();

},{}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Literal = void 0;
const NamedNode_1 = require("./NamedNode");
/**
 * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
 */
class Literal {
    constructor(value, languageOrDatatype) {
        this.termType = 'Literal';
        this.value = value;
        if (typeof languageOrDatatype === 'string') {
            this.language = languageOrDatatype;
            this.datatype = Literal.RDF_LANGUAGE_STRING;
        }
        else if (languageOrDatatype) {
            this.language = '';
            this.datatype = languageOrDatatype;
        }
        else {
            this.language = '';
            this.datatype = Literal.XSD_STRING;
        }
    }
    equals(other) {
        return !!other && other.termType === 'Literal' && other.value === this.value &&
            other.language === this.language && other.datatype.equals(this.datatype);
    }
}
exports.Literal = Literal;
Literal.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
Literal.XSD_STRING = new NamedNode_1.NamedNode('http://www.w3.org/2001/XMLSchema#string');

},{"./NamedNode":69}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedNode = void 0;
/**
 * A term that contains an IRI.
 */
class NamedNode {
    constructor(value) {
        this.termType = 'NamedNode';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'NamedNode' && other.value === this.value;
    }
}
exports.NamedNode = NamedNode;

},{}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quad = void 0;
/**
 * An instance of DefaultGraph represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
class Quad {
    constructor(subject, predicate, object, graph) {
        this.termType = 'Quad';
        this.value = '';
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
    }
    equals(other) {
        // `|| !other.termType` is for backwards-compatibility with old factories without RDF* support.
        return !!other && (other.termType === 'Quad' || !other.termType) &&
            this.subject.equals(other.subject) &&
            this.predicate.equals(other.predicate) &&
            this.object.equals(other.object) &&
            this.graph.equals(other.graph);
    }
}
exports.Quad = Quad;

},{}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
/**
 * A term that represents a variable.
 */
class Variable {
    constructor(value) {
        this.termType = 'Variable';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'Variable' && other.value === this.value;
    }
}
exports.Variable = Variable;

},{}],72:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib/Resolve"));

},{"./lib/Resolve":73}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convert the given relative IRI to an absolute IRI
 * by taking into account the given optional baseIRI.
 *
 * @param {string} relativeIRI The relative IRI to convert to an absolute IRI.
 * @param {string} baseIRI The optional base IRI.
 * @return {string} an absolute IRI.
 */
function resolve(relativeIRI, baseIRI) {
    baseIRI = baseIRI || '';
    const baseFragmentPos = baseIRI.indexOf('#');
    // Ignore any fragments in the base IRI
    if (baseFragmentPos > 0) {
        baseIRI = baseIRI.substr(0, baseFragmentPos);
    }
    // Convert empty value directly to base IRI
    if (!relativeIRI.length) {
        // At this point, the baseIRI MUST be absolute, otherwise we error
        if (baseIRI.indexOf(':') < 0) {
            throw new Error(`Found invalid baseIRI '${baseIRI}' for value '${relativeIRI}'`);
        }
        return baseIRI;
    }
    // If the value starts with a query character, concat directly (but strip the existing query)
    if (relativeIRI.startsWith('?')) {
        const baseQueryPos = baseIRI.indexOf('?');
        if (baseQueryPos > 0) {
            baseIRI = baseIRI.substr(0, baseQueryPos);
        }
        return baseIRI + relativeIRI;
    }
    // If the value starts with a fragment character, concat directly
    if (relativeIRI.startsWith('#')) {
        return baseIRI + relativeIRI;
    }
    // Ignore baseIRI if it is empty
    if (!baseIRI.length) {
        const relativeColonPos = relativeIRI.indexOf(':');
        if (relativeColonPos < 0) {
            throw new Error(`Found invalid relative IRI '${relativeIRI}' for a missing baseIRI`);
        }
        return removeDotSegmentsOfPath(relativeIRI, relativeColonPos);
    }
    // Ignore baseIRI if the value is absolute
    const valueColonPos = relativeIRI.indexOf(':');
    if (valueColonPos >= 0) {
        return removeDotSegmentsOfPath(relativeIRI, valueColonPos);
    }
    // At this point, the baseIRI MUST be absolute, otherwise we error
    const baseColonPos = baseIRI.indexOf(':');
    if (baseColonPos < 0) {
        throw new Error(`Found invalid baseIRI '${baseIRI}' for value '${relativeIRI}'`);
    }
    const baseIRIScheme = baseIRI.substr(0, baseColonPos + 1);
    // Inherit the baseIRI scheme if the value starts with '//'
    if (relativeIRI.indexOf('//') === 0) {
        return baseIRIScheme + removeDotSegmentsOfPath(relativeIRI, valueColonPos);
    }
    // Check cases where '://' occurs in the baseIRI, and where there is no '/' after a ':' anymore.
    let baseSlashAfterColonPos;
    if (baseIRI.indexOf('//', baseColonPos) === baseColonPos + 1) {
        // If there is no additional '/' after the '//'.
        baseSlashAfterColonPos = baseIRI.indexOf('/', baseColonPos + 3);
        if (baseSlashAfterColonPos < 0) {
            // If something other than a '/' follows the '://', append the value after a '/',
            // otherwise, prefix the value with only the baseIRI scheme.
            if (baseIRI.length > baseColonPos + 3) {
                return baseIRI + '/' + removeDotSegmentsOfPath(relativeIRI, valueColonPos);
            }
            else {
                return baseIRIScheme + removeDotSegmentsOfPath(relativeIRI, valueColonPos);
            }
        }
    }
    else {
        // If there is not even a single '/' after the ':'
        baseSlashAfterColonPos = baseIRI.indexOf('/', baseColonPos + 1);
        if (baseSlashAfterColonPos < 0) {
            // If we don't have a '/' after the ':',
            // prefix the value with only the baseIRI scheme.
            return baseIRIScheme + removeDotSegmentsOfPath(relativeIRI, valueColonPos);
        }
    }
    // If the value starts with a '/', then prefix it with everything before the first effective slash of the base IRI.
    if (relativeIRI.indexOf('/') === 0) {
        return baseIRI.substr(0, baseSlashAfterColonPos) + removeDotSegments(relativeIRI);
    }
    let baseIRIPath = baseIRI.substr(baseSlashAfterColonPos);
    const baseIRILastSlashPos = baseIRIPath.lastIndexOf('/');
    // Ignore everything after the last '/' in the baseIRI path
    if (baseIRILastSlashPos >= 0 && baseIRILastSlashPos < baseIRIPath.length - 1) {
        baseIRIPath = baseIRIPath.substr(0, baseIRILastSlashPos + 1);
        // Also remove the first character of the relative path if it starts with '.' (and not '..' or './')
        // This change is only allowed if there is something else following the path
        if (relativeIRI[0] === '.' && relativeIRI[1] !== '.' && relativeIRI[1] !== '/' && relativeIRI[2]) {
            relativeIRI = relativeIRI.substr(1);
        }
    }
    // Prefix the value with the baseIRI path where
    relativeIRI = baseIRIPath + relativeIRI;
    // Remove dot segment from the IRI
    relativeIRI = removeDotSegments(relativeIRI);
    // Prefix our transformed value with the part of the baseIRI until the first '/' after the first ':'.
    return baseIRI.substr(0, baseSlashAfterColonPos) + relativeIRI;
}
exports.resolve = resolve;
/**
 * Remove dot segments from the given path,
 * as described in https://www.ietf.org/rfc/rfc3986.txt (page 32).
 * @param {string} path An IRI path.
 * @return {string} A path, will always start with a '/'.
 */
function removeDotSegments(path) {
    // Prepare a buffer with segments between each '/.
    // Each segment represents an array of characters.
    const segmentBuffers = [];
    let i = 0;
    while (i < path.length) {
        // Remove '/.' or '/..'
        switch (path[i]) {
            case '/':
                if (path[i + 1] === '.') {
                    if (path[i + 2] === '.') {
                        // Start a new segment if we find an invalid character after the '.'
                        if (!isCharacterAllowedAfterRelativePathSegment(path[i + 3])) {
                            segmentBuffers.push([]);
                            i++;
                            break;
                        }
                        // Go to parent directory,
                        // so we remove a parent segment
                        segmentBuffers.pop();
                        // Ensure that we end with a slash if there is a trailing '/..'
                        if (!path[i + 3]) {
                            segmentBuffers.push([]);
                        }
                        i += 3;
                    }
                    else {
                        // Start a new segment if we find an invalid character after the '.'
                        if (!isCharacterAllowedAfterRelativePathSegment(path[i + 2])) {
                            segmentBuffers.push([]);
                            i++;
                            break;
                        }
                        // Ensure that we end with a slash if there is a trailing '/.'
                        if (!path[i + 2]) {
                            segmentBuffers.push([]);
                        }
                        // Go to the current directory,
                        // so we do nothing
                        i += 2;
                    }
                }
                else {
                    // Start a new segment
                    segmentBuffers.push([]);
                    i++;
                }
                break;
            case '#':
            case '?':
                // Query and fragment string should be appended unchanged
                if (!segmentBuffers.length) {
                    segmentBuffers.push([]);
                }
                segmentBuffers[segmentBuffers.length - 1].push(path.substr(i));
                // Break the while loop
                i = path.length;
                break;
            default:
                // Not a special character, just append it to our buffer
                if (!segmentBuffers.length) {
                    segmentBuffers.push([]);
                }
                segmentBuffers[segmentBuffers.length - 1].push(path[i]);
                i++;
                break;
        }
    }
    return '/' + segmentBuffers.map((buffer) => buffer.join('')).join('/');
}
exports.removeDotSegments = removeDotSegments;
/**
 * Removes dot segments of the given IRI.
 * @param {string} iri An IRI (or part of IRI).
 * @param {number} colonPosition The position of the first ':' in the IRI.
 * @return {string} The IRI where dot segments were removed.
 */
function removeDotSegmentsOfPath(iri, colonPosition) {
    // Determine where we should start looking for the first '/' that indicates the start of the path
    let searchOffset = colonPosition + 1;
    if (colonPosition >= 0) {
        if (iri[colonPosition + 1] === '/' && iri[colonPosition + 2] === '/') {
            searchOffset = colonPosition + 3;
        }
    }
    else {
        if (iri[0] === '/' && iri[1] === '/') {
            searchOffset = 2;
        }
    }
    // Determine the path
    const pathSeparator = iri.indexOf('/', searchOffset);
    if (pathSeparator < 0) {
        return iri;
    }
    const base = iri.substr(0, pathSeparator);
    const path = iri.substr(pathSeparator);
    // Remove dot segments from the path
    return base + removeDotSegments(path);
}
exports.removeDotSegmentsOfPath = removeDotSegmentsOfPath;
function isCharacterAllowedAfterRelativePathSegment(character) {
    return !character || character === '#' || character === '?' || character === '/';
}

},{}]},{},[29,28]);
