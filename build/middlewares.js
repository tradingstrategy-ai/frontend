var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __require = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// node_modules/@sveltejs/adapter-node/files/shims.js
import { createRequire } from "module";

// node_modules/@sveltejs/kit/dist/install-fetch.js
import http from "http";
import https from "https";
import zlib from "zlib";
import Stream, { PassThrough, pipeline } from "stream";
import { types } from "util";
import { randomBytes } from "crypto";
import { format } from "url";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
var dataUriToBuffer$1 = src;
var ponyfill_es2018 = { exports: {} };
(function(module, exports) {
  (function(global2, factory) {
    factory(exports);
  })(commonjsGlobal, function(exports2) {
    const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
    function noop3() {
      return void 0;
    }
    function getGlobals() {
      if (typeof self !== "undefined") {
        return self;
      } else if (typeof window !== "undefined") {
        return window;
      } else if (typeof commonjsGlobal !== "undefined") {
        return commonjsGlobal;
      }
      return void 0;
    }
    const globals = getGlobals();
    function typeIsObject(x) {
      return typeof x === "object" && x !== null || typeof x === "function";
    }
    const rethrowAssertionErrorRejection = noop3;
    const originalPromise = Promise;
    const originalPromiseThen = Promise.prototype.then;
    const originalPromiseResolve = Promise.resolve.bind(originalPromise);
    const originalPromiseReject = Promise.reject.bind(originalPromise);
    function newPromise(executor) {
      return new originalPromise(executor);
    }
    function promiseResolvedWith(value) {
      return originalPromiseResolve(value);
    }
    function promiseRejectedWith(reason) {
      return originalPromiseReject(reason);
    }
    function PerformPromiseThen(promise, onFulfilled, onRejected) {
      return originalPromiseThen.call(promise, onFulfilled, onRejected);
    }
    function uponPromise(promise, onFulfilled, onRejected) {
      PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
    }
    function uponFulfillment(promise, onFulfilled) {
      uponPromise(promise, onFulfilled);
    }
    function uponRejection(promise, onRejected) {
      uponPromise(promise, void 0, onRejected);
    }
    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
      return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
    }
    function setPromiseIsHandledToTrue(promise) {
      PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
    }
    const queueMicrotask = (() => {
      const globalQueueMicrotask = globals && globals.queueMicrotask;
      if (typeof globalQueueMicrotask === "function") {
        return globalQueueMicrotask;
      }
      const resolvedPromise = promiseResolvedWith(void 0);
      return (fn) => PerformPromiseThen(resolvedPromise, fn);
    })();
    function reflectCall(F, V, args) {
      if (typeof F !== "function") {
        throw new TypeError("Argument is not a function");
      }
      return Function.prototype.apply.call(F, V, args);
    }
    function promiseCall(F, V, args) {
      try {
        return promiseResolvedWith(reflectCall(F, V, args));
      } catch (value) {
        return promiseRejectedWith(value);
      }
    }
    const QUEUE_MAX_ARRAY_SIZE = 16384;
    class SimpleQueue {
      constructor() {
        this._cursor = 0;
        this._size = 0;
        this._front = {
          _elements: [],
          _next: void 0
        };
        this._back = this._front;
        this._cursor = 0;
        this._size = 0;
      }
      get length() {
        return this._size;
      }
      push(element) {
        const oldBack = this._back;
        let newBack = oldBack;
        if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
          newBack = {
            _elements: [],
            _next: void 0
          };
        }
        oldBack._elements.push(element);
        if (newBack !== oldBack) {
          this._back = newBack;
          oldBack._next = newBack;
        }
        ++this._size;
      }
      shift() {
        const oldFront = this._front;
        let newFront = oldFront;
        const oldCursor = this._cursor;
        let newCursor = oldCursor + 1;
        const elements = oldFront._elements;
        const element = elements[oldCursor];
        if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
          newFront = oldFront._next;
          newCursor = 0;
        }
        --this._size;
        this._cursor = newCursor;
        if (oldFront !== newFront) {
          this._front = newFront;
        }
        elements[oldCursor] = void 0;
        return element;
      }
      forEach(callback) {
        let i = this._cursor;
        let node = this._front;
        let elements = node._elements;
        while (i !== elements.length || node._next !== void 0) {
          if (i === elements.length) {
            node = node._next;
            elements = node._elements;
            i = 0;
            if (elements.length === 0) {
              break;
            }
          }
          callback(elements[i]);
          ++i;
        }
      }
      peek() {
        const front = this._front;
        const cursor = this._cursor;
        return front._elements[cursor];
      }
    }
    function ReadableStreamReaderGenericInitialize(reader, stream) {
      reader._ownerReadableStream = stream;
      stream._reader = reader;
      if (stream._state === "readable") {
        defaultReaderClosedPromiseInitialize(reader);
      } else if (stream._state === "closed") {
        defaultReaderClosedPromiseInitializeAsResolved(reader);
      } else {
        defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
      }
    }
    function ReadableStreamReaderGenericCancel(reader, reason) {
      const stream = reader._ownerReadableStream;
      return ReadableStreamCancel(stream, reason);
    }
    function ReadableStreamReaderGenericRelease(reader) {
      if (reader._ownerReadableStream._state === "readable") {
        defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
      } else {
        defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
      }
      reader._ownerReadableStream._reader = void 0;
      reader._ownerReadableStream = void 0;
    }
    function readerLockException(name) {
      return new TypeError("Cannot " + name + " a stream using a released reader");
    }
    function defaultReaderClosedPromiseInitialize(reader) {
      reader._closedPromise = newPromise((resolve3, reject) => {
        reader._closedPromise_resolve = resolve3;
        reader._closedPromise_reject = reject;
      });
    }
    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
      defaultReaderClosedPromiseInitialize(reader);
      defaultReaderClosedPromiseReject(reader, reason);
    }
    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
      defaultReaderClosedPromiseInitialize(reader);
      defaultReaderClosedPromiseResolve(reader);
    }
    function defaultReaderClosedPromiseReject(reader, reason) {
      if (reader._closedPromise_reject === void 0) {
        return;
      }
      setPromiseIsHandledToTrue(reader._closedPromise);
      reader._closedPromise_reject(reason);
      reader._closedPromise_resolve = void 0;
      reader._closedPromise_reject = void 0;
    }
    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
      defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
    }
    function defaultReaderClosedPromiseResolve(reader) {
      if (reader._closedPromise_resolve === void 0) {
        return;
      }
      reader._closedPromise_resolve(void 0);
      reader._closedPromise_resolve = void 0;
      reader._closedPromise_reject = void 0;
    }
    const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
    const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
    const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
    const PullSteps = SymbolPolyfill("[[PullSteps]]");
    const NumberIsFinite = Number.isFinite || function(x) {
      return typeof x === "number" && isFinite(x);
    };
    const MathTrunc = Math.trunc || function(v) {
      return v < 0 ? Math.ceil(v) : Math.floor(v);
    };
    function isDictionary(x) {
      return typeof x === "object" || typeof x === "function";
    }
    function assertDictionary(obj, context) {
      if (obj !== void 0 && !isDictionary(obj)) {
        throw new TypeError(`${context} is not an object.`);
      }
    }
    function assertFunction(x, context) {
      if (typeof x !== "function") {
        throw new TypeError(`${context} is not a function.`);
      }
    }
    function isObject(x) {
      return typeof x === "object" && x !== null || typeof x === "function";
    }
    function assertObject(x, context) {
      if (!isObject(x)) {
        throw new TypeError(`${context} is not an object.`);
      }
    }
    function assertRequiredArgument(x, position, context) {
      if (x === void 0) {
        throw new TypeError(`Parameter ${position} is required in '${context}'.`);
      }
    }
    function assertRequiredField(x, field, context) {
      if (x === void 0) {
        throw new TypeError(`${field} is required in '${context}'.`);
      }
    }
    function convertUnrestrictedDouble(value) {
      return Number(value);
    }
    function censorNegativeZero(x) {
      return x === 0 ? 0 : x;
    }
    function integerPart(x) {
      return censorNegativeZero(MathTrunc(x));
    }
    function convertUnsignedLongLongWithEnforceRange(value, context) {
      const lowerBound = 0;
      const upperBound = Number.MAX_SAFE_INTEGER;
      let x = Number(value);
      x = censorNegativeZero(x);
      if (!NumberIsFinite(x)) {
        throw new TypeError(`${context} is not a finite number`);
      }
      x = integerPart(x);
      if (x < lowerBound || x > upperBound) {
        throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
      }
      if (!NumberIsFinite(x) || x === 0) {
        return 0;
      }
      return x;
    }
    function assertReadableStream(x, context) {
      if (!IsReadableStream(x)) {
        throw new TypeError(`${context} is not a ReadableStream.`);
      }
    }
    function AcquireReadableStreamDefaultReader(stream) {
      return new ReadableStreamDefaultReader(stream);
    }
    function ReadableStreamAddReadRequest(stream, readRequest) {
      stream._reader._readRequests.push(readRequest);
    }
    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
      const reader = stream._reader;
      const readRequest = reader._readRequests.shift();
      if (done) {
        readRequest._closeSteps();
      } else {
        readRequest._chunkSteps(chunk);
      }
    }
    function ReadableStreamGetNumReadRequests(stream) {
      return stream._reader._readRequests.length;
    }
    function ReadableStreamHasDefaultReader(stream) {
      const reader = stream._reader;
      if (reader === void 0) {
        return false;
      }
      if (!IsReadableStreamDefaultReader(reader)) {
        return false;
      }
      return true;
    }
    class ReadableStreamDefaultReader {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
        assertReadableStream(stream, "First parameter");
        if (IsReadableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive reading by another reader");
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readRequests = new SimpleQueue();
      }
      get closed() {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      cancel(reason = void 0) {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
        }
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("cancel"));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
      }
      read() {
        if (!IsReadableStreamDefaultReader(this)) {
          return promiseRejectedWith(defaultReaderBrandCheckException("read"));
        }
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("read from"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve3, reject) => {
          resolvePromise = resolve3;
          rejectPromise = reject;
        });
        const readRequest = {
          _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
          _closeSteps: () => resolvePromise({ value: void 0, done: true }),
          _errorSteps: (e) => rejectPromise(e)
        };
        ReadableStreamDefaultReaderRead(this, readRequest);
        return promise;
      }
      releaseLock() {
        if (!IsReadableStreamDefaultReader(this)) {
          throw defaultReaderBrandCheckException("releaseLock");
        }
        if (this._ownerReadableStream === void 0) {
          return;
        }
        if (this._readRequests.length > 0) {
          throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
        }
        ReadableStreamReaderGenericRelease(this);
      }
    }
    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
      cancel: { enumerable: true },
      read: { enumerable: true },
      releaseLock: { enumerable: true },
      closed: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultReader",
        configurable: true
      });
    }
    function IsReadableStreamDefaultReader(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
        return false;
      }
      return x instanceof ReadableStreamDefaultReader;
    }
    function ReadableStreamDefaultReaderRead(reader, readRequest) {
      const stream = reader._ownerReadableStream;
      stream._disturbed = true;
      if (stream._state === "closed") {
        readRequest._closeSteps();
      } else if (stream._state === "errored") {
        readRequest._errorSteps(stream._storedError);
      } else {
        stream._readableStreamController[PullSteps](readRequest);
      }
    }
    function defaultReaderBrandCheckException(name) {
      return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
    }
    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
    }).prototype);
    class ReadableStreamAsyncIteratorImpl {
      constructor(reader, preventCancel) {
        this._ongoingPromise = void 0;
        this._isFinished = false;
        this._reader = reader;
        this._preventCancel = preventCancel;
      }
      next() {
        const nextSteps = () => this._nextSteps();
        this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
        return this._ongoingPromise;
      }
      return(value) {
        const returnSteps = () => this._returnSteps(value);
        return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
      }
      _nextSteps() {
        if (this._isFinished) {
          return Promise.resolve({ value: void 0, done: true });
        }
        const reader = this._reader;
        if (reader._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("iterate"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve3, reject) => {
          resolvePromise = resolve3;
          rejectPromise = reject;
        });
        const readRequest = {
          _chunkSteps: (chunk) => {
            this._ongoingPromise = void 0;
            queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
          },
          _closeSteps: () => {
            this._ongoingPromise = void 0;
            this._isFinished = true;
            ReadableStreamReaderGenericRelease(reader);
            resolvePromise({ value: void 0, done: true });
          },
          _errorSteps: (reason) => {
            this._ongoingPromise = void 0;
            this._isFinished = true;
            ReadableStreamReaderGenericRelease(reader);
            rejectPromise(reason);
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
        return promise;
      }
      _returnSteps(value) {
        if (this._isFinished) {
          return Promise.resolve({ value, done: true });
        }
        this._isFinished = true;
        const reader = this._reader;
        if (reader._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("finish iterating"));
        }
        if (!this._preventCancel) {
          const result = ReadableStreamReaderGenericCancel(reader, value);
          ReadableStreamReaderGenericRelease(reader);
          return transformPromiseWith(result, () => ({ value, done: true }));
        }
        ReadableStreamReaderGenericRelease(reader);
        return promiseResolvedWith({ value, done: true });
      }
    }
    const ReadableStreamAsyncIteratorPrototype = {
      next() {
        if (!IsReadableStreamAsyncIterator(this)) {
          return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
        }
        return this._asyncIteratorImpl.next();
      },
      return(value) {
        if (!IsReadableStreamAsyncIterator(this)) {
          return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
        }
        return this._asyncIteratorImpl.return(value);
      }
    };
    if (AsyncIteratorPrototype !== void 0) {
      Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
    }
    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
      const reader = AcquireReadableStreamDefaultReader(stream);
      const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
      const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
      iterator._asyncIteratorImpl = impl;
      return iterator;
    }
    function IsReadableStreamAsyncIterator(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
        return false;
      }
      try {
        return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
      } catch (_a2) {
        return false;
      }
    }
    function streamAsyncIteratorBrandCheckException(name) {
      return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
    }
    const NumberIsNaN = Number.isNaN || function(x) {
      return x !== x;
    };
    function CreateArrayFromList(elements) {
      return elements.slice();
    }
    function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
      new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
    }
    function TransferArrayBuffer(O) {
      return O;
    }
    function IsDetachedBuffer(O) {
      return false;
    }
    function ArrayBufferSlice(buffer, begin, end) {
      if (buffer.slice) {
        return buffer.slice(begin, end);
      }
      const length = end - begin;
      const slice = new ArrayBuffer(length);
      CopyDataBlockBytes(slice, 0, buffer, begin, length);
      return slice;
    }
    function IsNonNegativeNumber(v) {
      if (typeof v !== "number") {
        return false;
      }
      if (NumberIsNaN(v)) {
        return false;
      }
      if (v < 0) {
        return false;
      }
      return true;
    }
    function CloneAsUint8Array(O) {
      const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
      return new Uint8Array(buffer);
    }
    function DequeueValue(container) {
      const pair = container._queue.shift();
      container._queueTotalSize -= pair.size;
      if (container._queueTotalSize < 0) {
        container._queueTotalSize = 0;
      }
      return pair.value;
    }
    function EnqueueValueWithSize(container, value, size) {
      if (!IsNonNegativeNumber(size) || size === Infinity) {
        throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
      }
      container._queue.push({ value, size });
      container._queueTotalSize += size;
    }
    function PeekQueueValue(container) {
      const pair = container._queue.peek();
      return pair.value;
    }
    function ResetQueue(container) {
      container._queue = new SimpleQueue();
      container._queueTotalSize = 0;
    }
    class ReadableStreamBYOBRequest {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get view() {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("view");
        }
        return this._view;
      }
      respond(bytesWritten) {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("respond");
        }
        assertRequiredArgument(bytesWritten, 1, "respond");
        bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
        if (this._associatedReadableByteStreamController === void 0) {
          throw new TypeError("This BYOB request has been invalidated");
        }
        if (IsDetachedBuffer(this._view.buffer))
          ;
        ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
      }
      respondWithNewView(view) {
        if (!IsReadableStreamBYOBRequest(this)) {
          throw byobRequestBrandCheckException("respondWithNewView");
        }
        assertRequiredArgument(view, 1, "respondWithNewView");
        if (!ArrayBuffer.isView(view)) {
          throw new TypeError("You can only respond with array buffer views");
        }
        if (this._associatedReadableByteStreamController === void 0) {
          throw new TypeError("This BYOB request has been invalidated");
        }
        if (IsDetachedBuffer(view.buffer))
          ;
        ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
      }
    }
    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
      respond: { enumerable: true },
      respondWithNewView: { enumerable: true },
      view: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBRequest",
        configurable: true
      });
    }
    class ReadableByteStreamController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get byobRequest() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("byobRequest");
        }
        return ReadableByteStreamControllerGetBYOBRequest(this);
      }
      get desiredSize() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("desiredSize");
        }
        return ReadableByteStreamControllerGetDesiredSize(this);
      }
      close() {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("close");
        }
        if (this._closeRequested) {
          throw new TypeError("The stream has already been closed; do not close it again!");
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== "readable") {
          throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
        }
        ReadableByteStreamControllerClose(this);
      }
      enqueue(chunk) {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("enqueue");
        }
        assertRequiredArgument(chunk, 1, "enqueue");
        if (!ArrayBuffer.isView(chunk)) {
          throw new TypeError("chunk must be an array buffer view");
        }
        if (chunk.byteLength === 0) {
          throw new TypeError("chunk must have non-zero byteLength");
        }
        if (chunk.buffer.byteLength === 0) {
          throw new TypeError(`chunk's buffer must have non-zero byteLength`);
        }
        if (this._closeRequested) {
          throw new TypeError("stream is closed or draining");
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== "readable") {
          throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
        }
        ReadableByteStreamControllerEnqueue(this, chunk);
      }
      error(e = void 0) {
        if (!IsReadableByteStreamController(this)) {
          throw byteStreamControllerBrandCheckException("error");
        }
        ReadableByteStreamControllerError(this, e);
      }
      [CancelSteps](reason) {
        ReadableByteStreamControllerClearPendingPullIntos(this);
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableByteStreamControllerClearAlgorithms(this);
        return result;
      }
      [PullSteps](readRequest) {
        const stream = this._controlledReadableByteStream;
        if (this._queueTotalSize > 0) {
          const entry = this._queue.shift();
          this._queueTotalSize -= entry.byteLength;
          ReadableByteStreamControllerHandleQueueDrain(this);
          const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
          readRequest._chunkSteps(view);
          return;
        }
        const autoAllocateChunkSize = this._autoAllocateChunkSize;
        if (autoAllocateChunkSize !== void 0) {
          let buffer;
          try {
            buffer = new ArrayBuffer(autoAllocateChunkSize);
          } catch (bufferE) {
            readRequest._errorSteps(bufferE);
            return;
          }
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: autoAllocateChunkSize,
            byteOffset: 0,
            byteLength: autoAllocateChunkSize,
            bytesFilled: 0,
            elementSize: 1,
            viewConstructor: Uint8Array,
            readerType: "default"
          };
          this._pendingPullIntos.push(pullIntoDescriptor);
        }
        ReadableStreamAddReadRequest(stream, readRequest);
        ReadableByteStreamControllerCallPullIfNeeded(this);
      }
    }
    Object.defineProperties(ReadableByteStreamController.prototype, {
      close: { enumerable: true },
      enqueue: { enumerable: true },
      error: { enumerable: true },
      byobRequest: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableByteStreamController",
        configurable: true
      });
    }
    function IsReadableByteStreamController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
        return false;
      }
      return x instanceof ReadableByteStreamController;
    }
    function IsReadableStreamBYOBRequest(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
        return false;
      }
      return x instanceof ReadableStreamBYOBRequest;
    }
    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
      const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
      if (!shouldPull) {
        return;
      }
      if (controller._pulling) {
        controller._pullAgain = true;
        return;
      }
      controller._pulling = true;
      const pullPromise = controller._pullAlgorithm();
      uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain) {
          controller._pullAgain = false;
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
      }, (e) => {
        ReadableByteStreamControllerError(controller, e);
      });
    }
    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      controller._pendingPullIntos = new SimpleQueue();
    }
    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
      let done = false;
      if (stream._state === "closed") {
        done = true;
      }
      const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
      if (pullIntoDescriptor.readerType === "default") {
        ReadableStreamFulfillReadRequest(stream, filledView, done);
      } else {
        ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
      }
    }
    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
      const bytesFilled = pullIntoDescriptor.bytesFilled;
      const elementSize = pullIntoDescriptor.elementSize;
      return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
    }
    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
      controller._queue.push({ buffer, byteOffset, byteLength });
      controller._queueTotalSize += byteLength;
    }
    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
      const elementSize = pullIntoDescriptor.elementSize;
      const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
      const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
      const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
      const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
      let totalBytesToCopyRemaining = maxBytesToCopy;
      let ready = false;
      if (maxAlignedBytes > currentAlignedBytes) {
        totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
        ready = true;
      }
      const queue = controller._queue;
      while (totalBytesToCopyRemaining > 0) {
        const headOfQueue = queue.peek();
        const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
        const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
        if (headOfQueue.byteLength === bytesToCopy) {
          queue.shift();
        } else {
          headOfQueue.byteOffset += bytesToCopy;
          headOfQueue.byteLength -= bytesToCopy;
        }
        controller._queueTotalSize -= bytesToCopy;
        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
        totalBytesToCopyRemaining -= bytesToCopy;
      }
      return ready;
    }
    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
      pullIntoDescriptor.bytesFilled += size;
    }
    function ReadableByteStreamControllerHandleQueueDrain(controller) {
      if (controller._queueTotalSize === 0 && controller._closeRequested) {
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamClose(controller._controlledReadableByteStream);
      } else {
        ReadableByteStreamControllerCallPullIfNeeded(controller);
      }
    }
    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
      if (controller._byobRequest === null) {
        return;
      }
      controller._byobRequest._associatedReadableByteStreamController = void 0;
      controller._byobRequest._view = null;
      controller._byobRequest = null;
    }
    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
      while (controller._pendingPullIntos.length > 0) {
        if (controller._queueTotalSize === 0) {
          return;
        }
        const pullIntoDescriptor = controller._pendingPullIntos.peek();
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
        }
      }
    }
    function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
      const stream = controller._controlledReadableByteStream;
      let elementSize = 1;
      if (view.constructor !== DataView) {
        elementSize = view.constructor.BYTES_PER_ELEMENT;
      }
      const ctor = view.constructor;
      const buffer = TransferArrayBuffer(view.buffer);
      const pullIntoDescriptor = {
        buffer,
        bufferByteLength: buffer.byteLength,
        byteOffset: view.byteOffset,
        byteLength: view.byteLength,
        bytesFilled: 0,
        elementSize,
        viewConstructor: ctor,
        readerType: "byob"
      };
      if (controller._pendingPullIntos.length > 0) {
        controller._pendingPullIntos.push(pullIntoDescriptor);
        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
        return;
      }
      if (stream._state === "closed") {
        const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
        readIntoRequest._closeSteps(emptyView);
        return;
      }
      if (controller._queueTotalSize > 0) {
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          ReadableByteStreamControllerHandleQueueDrain(controller);
          readIntoRequest._chunkSteps(filledView);
          return;
        }
        if (controller._closeRequested) {
          const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
          ReadableByteStreamControllerError(controller, e);
          readIntoRequest._errorSteps(e);
          return;
        }
      }
      controller._pendingPullIntos.push(pullIntoDescriptor);
      ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
      const stream = controller._controlledReadableByteStream;
      if (ReadableStreamHasBYOBReader(stream)) {
        while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
          const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
          ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
        }
      }
    }
    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
      ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
      if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
        return;
      }
      ReadableByteStreamControllerShiftPendingPullInto(controller);
      const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
      if (remainderSize > 0) {
        const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
      }
      pullIntoDescriptor.bytesFilled -= remainderSize;
      ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
      ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    }
    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        ReadableByteStreamControllerRespondInClosedState(controller);
      } else {
        ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
      }
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
      const descriptor = controller._pendingPullIntos.shift();
      return descriptor;
    }
    function ReadableByteStreamControllerShouldCallPull(controller) {
      const stream = controller._controlledReadableByteStream;
      if (stream._state !== "readable") {
        return false;
      }
      if (controller._closeRequested) {
        return false;
      }
      if (!controller._started) {
        return false;
      }
      if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
      }
      if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
        return true;
      }
      const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
      if (desiredSize > 0) {
        return true;
      }
      return false;
    }
    function ReadableByteStreamControllerClearAlgorithms(controller) {
      controller._pullAlgorithm = void 0;
      controller._cancelAlgorithm = void 0;
    }
    function ReadableByteStreamControllerClose(controller) {
      const stream = controller._controlledReadableByteStream;
      if (controller._closeRequested || stream._state !== "readable") {
        return;
      }
      if (controller._queueTotalSize > 0) {
        controller._closeRequested = true;
        return;
      }
      if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (firstPendingPullInto.bytesFilled > 0) {
          const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
          ReadableByteStreamControllerError(controller, e);
          throw e;
        }
      }
      ReadableByteStreamControllerClearAlgorithms(controller);
      ReadableStreamClose(stream);
    }
    function ReadableByteStreamControllerEnqueue(controller, chunk) {
      const stream = controller._controlledReadableByteStream;
      if (controller._closeRequested || stream._state !== "readable") {
        return;
      }
      const buffer = chunk.buffer;
      const byteOffset = chunk.byteOffset;
      const byteLength = chunk.byteLength;
      const transferredBuffer = TransferArrayBuffer(buffer);
      if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (IsDetachedBuffer(firstPendingPullInto.buffer))
          ;
        firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
      }
      ReadableByteStreamControllerInvalidateBYOBRequest(controller);
      if (ReadableStreamHasDefaultReader(stream)) {
        if (ReadableStreamGetNumReadRequests(stream) === 0) {
          ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        } else {
          const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
          ReadableStreamFulfillReadRequest(stream, transferredView, false);
        }
      } else if (ReadableStreamHasBYOBReader(stream)) {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
      } else {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
      }
      ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
    function ReadableByteStreamControllerError(controller, e) {
      const stream = controller._controlledReadableByteStream;
      if (stream._state !== "readable") {
        return;
      }
      ReadableByteStreamControllerClearPendingPullIntos(controller);
      ResetQueue(controller);
      ReadableByteStreamControllerClearAlgorithms(controller);
      ReadableStreamError(stream, e);
    }
    function ReadableByteStreamControllerGetBYOBRequest(controller) {
      if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
        const firstDescriptor = controller._pendingPullIntos.peek();
        const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
        const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
        SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
        controller._byobRequest = byobRequest;
      }
      return controller._byobRequest;
    }
    function ReadableByteStreamControllerGetDesiredSize(controller) {
      const state = controller._controlledReadableByteStream._state;
      if (state === "errored") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        if (bytesWritten !== 0) {
          throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
        }
      } else {
        if (bytesWritten === 0) {
          throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
        }
        if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
          throw new RangeError("bytesWritten out of range");
        }
      }
      firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
      ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
    }
    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
      const firstDescriptor = controller._pendingPullIntos.peek();
      const state = controller._controlledReadableByteStream._state;
      if (state === "closed") {
        if (view.byteLength !== 0) {
          throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
        }
      } else {
        if (view.byteLength === 0) {
          throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
        }
      }
      if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
        throw new RangeError("The region specified by view does not match byobRequest");
      }
      if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
        throw new RangeError("The buffer of view has different capacity than byobRequest");
      }
      if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
        throw new RangeError("The region specified by view is larger than byobRequest");
      }
      firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
      ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
    }
    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
      controller._controlledReadableByteStream = stream;
      controller._pullAgain = false;
      controller._pulling = false;
      controller._byobRequest = null;
      controller._queue = controller._queueTotalSize = void 0;
      ResetQueue(controller);
      controller._closeRequested = false;
      controller._started = false;
      controller._strategyHWM = highWaterMark;
      controller._pullAlgorithm = pullAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      controller._autoAllocateChunkSize = autoAllocateChunkSize;
      controller._pendingPullIntos = new SimpleQueue();
      stream._readableStreamController = controller;
      const startResult = startAlgorithm();
      uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableByteStreamControllerCallPullIfNeeded(controller);
      }, (r) => {
        ReadableByteStreamControllerError(controller, r);
      });
    }
    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
      const controller = Object.create(ReadableByteStreamController.prototype);
      let startAlgorithm = () => void 0;
      let pullAlgorithm = () => promiseResolvedWith(void 0);
      let cancelAlgorithm = () => promiseResolvedWith(void 0);
      if (underlyingByteSource.start !== void 0) {
        startAlgorithm = () => underlyingByteSource.start(controller);
      }
      if (underlyingByteSource.pull !== void 0) {
        pullAlgorithm = () => underlyingByteSource.pull(controller);
      }
      if (underlyingByteSource.cancel !== void 0) {
        cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
      }
      const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
      if (autoAllocateChunkSize === 0) {
        throw new TypeError("autoAllocateChunkSize must be greater than 0");
      }
      SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
    }
    function SetUpReadableStreamBYOBRequest(request, controller, view) {
      request._associatedReadableByteStreamController = controller;
      request._view = view;
    }
    function byobRequestBrandCheckException(name) {
      return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
    }
    function byteStreamControllerBrandCheckException(name) {
      return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
    }
    function AcquireReadableStreamBYOBReader(stream) {
      return new ReadableStreamBYOBReader(stream);
    }
    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
      stream._reader._readIntoRequests.push(readIntoRequest);
    }
    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
      const reader = stream._reader;
      const readIntoRequest = reader._readIntoRequests.shift();
      if (done) {
        readIntoRequest._closeSteps(chunk);
      } else {
        readIntoRequest._chunkSteps(chunk);
      }
    }
    function ReadableStreamGetNumReadIntoRequests(stream) {
      return stream._reader._readIntoRequests.length;
    }
    function ReadableStreamHasBYOBReader(stream) {
      const reader = stream._reader;
      if (reader === void 0) {
        return false;
      }
      if (!IsReadableStreamBYOBReader(reader)) {
        return false;
      }
      return true;
    }
    class ReadableStreamBYOBReader {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
        assertReadableStream(stream, "First parameter");
        if (IsReadableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive reading by another reader");
        }
        if (!IsReadableByteStreamController(stream._readableStreamController)) {
          throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readIntoRequests = new SimpleQueue();
      }
      get closed() {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      cancel(reason = void 0) {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
        }
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("cancel"));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
      }
      read(view) {
        if (!IsReadableStreamBYOBReader(this)) {
          return promiseRejectedWith(byobReaderBrandCheckException("read"));
        }
        if (!ArrayBuffer.isView(view)) {
          return promiseRejectedWith(new TypeError("view must be an array buffer view"));
        }
        if (view.byteLength === 0) {
          return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
        }
        if (view.buffer.byteLength === 0) {
          return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
        }
        if (IsDetachedBuffer(view.buffer))
          ;
        if (this._ownerReadableStream === void 0) {
          return promiseRejectedWith(readerLockException("read from"));
        }
        let resolvePromise;
        let rejectPromise;
        const promise = newPromise((resolve3, reject) => {
          resolvePromise = resolve3;
          rejectPromise = reject;
        });
        const readIntoRequest = {
          _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
          _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
          _errorSteps: (e) => rejectPromise(e)
        };
        ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
        return promise;
      }
      releaseLock() {
        if (!IsReadableStreamBYOBReader(this)) {
          throw byobReaderBrandCheckException("releaseLock");
        }
        if (this._ownerReadableStream === void 0) {
          return;
        }
        if (this._readIntoRequests.length > 0) {
          throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
        }
        ReadableStreamReaderGenericRelease(this);
      }
    }
    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
      cancel: { enumerable: true },
      read: { enumerable: true },
      releaseLock: { enumerable: true },
      closed: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamBYOBReader",
        configurable: true
      });
    }
    function IsReadableStreamBYOBReader(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
        return false;
      }
      return x instanceof ReadableStreamBYOBReader;
    }
    function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
      const stream = reader._ownerReadableStream;
      stream._disturbed = true;
      if (stream._state === "errored") {
        readIntoRequest._errorSteps(stream._storedError);
      } else {
        ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
      }
    }
    function byobReaderBrandCheckException(name) {
      return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
    }
    function ExtractHighWaterMark(strategy, defaultHWM) {
      const { highWaterMark } = strategy;
      if (highWaterMark === void 0) {
        return defaultHWM;
      }
      if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
        throw new RangeError("Invalid highWaterMark");
      }
      return highWaterMark;
    }
    function ExtractSizeAlgorithm(strategy) {
      const { size } = strategy;
      if (!size) {
        return () => 1;
      }
      return size;
    }
    function convertQueuingStrategy(init2, context) {
      assertDictionary(init2, context);
      const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
      const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
      return {
        highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
        size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
      };
    }
    function convertQueuingStrategySize(fn, context) {
      assertFunction(fn, context);
      return (chunk) => convertUnrestrictedDouble(fn(chunk));
    }
    function convertUnderlyingSink(original, context) {
      assertDictionary(original, context);
      const abort = original === null || original === void 0 ? void 0 : original.abort;
      const close = original === null || original === void 0 ? void 0 : original.close;
      const start = original === null || original === void 0 ? void 0 : original.start;
      const type = original === null || original === void 0 ? void 0 : original.type;
      const write = original === null || original === void 0 ? void 0 : original.write;
      return {
        abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
        close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
        start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
        write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
        type
      };
    }
    function convertUnderlyingSinkAbortCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSinkCloseCallback(fn, original, context) {
      assertFunction(fn, context);
      return () => promiseCall(fn, original, []);
    }
    function convertUnderlyingSinkStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertUnderlyingSinkWriteCallback(fn, original, context) {
      assertFunction(fn, context);
      return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }
    function assertWritableStream(x, context) {
      if (!IsWritableStream(x)) {
        throw new TypeError(`${context} is not a WritableStream.`);
      }
    }
    function isAbortSignal2(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      try {
        return typeof value.aborted === "boolean";
      } catch (_a2) {
        return false;
      }
    }
    const supportsAbortController = typeof AbortController === "function";
    function createAbortController() {
      if (supportsAbortController) {
        return new AbortController();
      }
      return void 0;
    }
    class WritableStream {
      constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
        if (rawUnderlyingSink === void 0) {
          rawUnderlyingSink = null;
        } else {
          assertObject(rawUnderlyingSink, "First parameter");
        }
        const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
        const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
        InitializeWritableStream(this);
        const type = underlyingSink.type;
        if (type !== void 0) {
          throw new RangeError("Invalid type is specified");
        }
        const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
        const highWaterMark = ExtractHighWaterMark(strategy, 1);
        SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
      }
      get locked() {
        if (!IsWritableStream(this)) {
          throw streamBrandCheckException$2("locked");
        }
        return IsWritableStreamLocked(this);
      }
      abort(reason = void 0) {
        if (!IsWritableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$2("abort"));
        }
        if (IsWritableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
        }
        return WritableStreamAbort(this, reason);
      }
      close() {
        if (!IsWritableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$2("close"));
        }
        if (IsWritableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
        }
        if (WritableStreamCloseQueuedOrInFlight(this)) {
          return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
        }
        return WritableStreamClose(this);
      }
      getWriter() {
        if (!IsWritableStream(this)) {
          throw streamBrandCheckException$2("getWriter");
        }
        return AcquireWritableStreamDefaultWriter(this);
      }
    }
    Object.defineProperties(WritableStream.prototype, {
      abort: { enumerable: true },
      close: { enumerable: true },
      getWriter: { enumerable: true },
      locked: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStream",
        configurable: true
      });
    }
    function AcquireWritableStreamDefaultWriter(stream) {
      return new WritableStreamDefaultWriter(stream);
    }
    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
      const stream = Object.create(WritableStream.prototype);
      InitializeWritableStream(stream);
      const controller = Object.create(WritableStreamDefaultController.prototype);
      SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
      return stream;
    }
    function InitializeWritableStream(stream) {
      stream._state = "writable";
      stream._storedError = void 0;
      stream._writer = void 0;
      stream._writableStreamController = void 0;
      stream._writeRequests = new SimpleQueue();
      stream._inFlightWriteRequest = void 0;
      stream._closeRequest = void 0;
      stream._inFlightCloseRequest = void 0;
      stream._pendingAbortRequest = void 0;
      stream._backpressure = false;
    }
    function IsWritableStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
        return false;
      }
      return x instanceof WritableStream;
    }
    function IsWritableStreamLocked(stream) {
      if (stream._writer === void 0) {
        return false;
      }
      return true;
    }
    function WritableStreamAbort(stream, reason) {
      var _a2;
      if (stream._state === "closed" || stream._state === "errored") {
        return promiseResolvedWith(void 0);
      }
      stream._writableStreamController._abortReason = reason;
      (_a2 = stream._writableStreamController._abortController) === null || _a2 === void 0 ? void 0 : _a2.abort();
      const state = stream._state;
      if (state === "closed" || state === "errored") {
        return promiseResolvedWith(void 0);
      }
      if (stream._pendingAbortRequest !== void 0) {
        return stream._pendingAbortRequest._promise;
      }
      let wasAlreadyErroring = false;
      if (state === "erroring") {
        wasAlreadyErroring = true;
        reason = void 0;
      }
      const promise = newPromise((resolve3, reject) => {
        stream._pendingAbortRequest = {
          _promise: void 0,
          _resolve: resolve3,
          _reject: reject,
          _reason: reason,
          _wasAlreadyErroring: wasAlreadyErroring
        };
      });
      stream._pendingAbortRequest._promise = promise;
      if (!wasAlreadyErroring) {
        WritableStreamStartErroring(stream, reason);
      }
      return promise;
    }
    function WritableStreamClose(stream) {
      const state = stream._state;
      if (state === "closed" || state === "errored") {
        return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
      }
      const promise = newPromise((resolve3, reject) => {
        const closeRequest = {
          _resolve: resolve3,
          _reject: reject
        };
        stream._closeRequest = closeRequest;
      });
      const writer = stream._writer;
      if (writer !== void 0 && stream._backpressure && state === "writable") {
        defaultWriterReadyPromiseResolve(writer);
      }
      WritableStreamDefaultControllerClose(stream._writableStreamController);
      return promise;
    }
    function WritableStreamAddWriteRequest(stream) {
      const promise = newPromise((resolve3, reject) => {
        const writeRequest = {
          _resolve: resolve3,
          _reject: reject
        };
        stream._writeRequests.push(writeRequest);
      });
      return promise;
    }
    function WritableStreamDealWithRejection(stream, error2) {
      const state = stream._state;
      if (state === "writable") {
        WritableStreamStartErroring(stream, error2);
        return;
      }
      WritableStreamFinishErroring(stream);
    }
    function WritableStreamStartErroring(stream, reason) {
      const controller = stream._writableStreamController;
      stream._state = "erroring";
      stream._storedError = reason;
      const writer = stream._writer;
      if (writer !== void 0) {
        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
      }
      if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
        WritableStreamFinishErroring(stream);
      }
    }
    function WritableStreamFinishErroring(stream) {
      stream._state = "errored";
      stream._writableStreamController[ErrorSteps]();
      const storedError = stream._storedError;
      stream._writeRequests.forEach((writeRequest) => {
        writeRequest._reject(storedError);
      });
      stream._writeRequests = new SimpleQueue();
      if (stream._pendingAbortRequest === void 0) {
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
      }
      const abortRequest = stream._pendingAbortRequest;
      stream._pendingAbortRequest = void 0;
      if (abortRequest._wasAlreadyErroring) {
        abortRequest._reject(storedError);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
      }
      const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
      uponPromise(promise, () => {
        abortRequest._resolve();
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
      }, (reason) => {
        abortRequest._reject(reason);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
      });
    }
    function WritableStreamFinishInFlightWrite(stream) {
      stream._inFlightWriteRequest._resolve(void 0);
      stream._inFlightWriteRequest = void 0;
    }
    function WritableStreamFinishInFlightWriteWithError(stream, error2) {
      stream._inFlightWriteRequest._reject(error2);
      stream._inFlightWriteRequest = void 0;
      WritableStreamDealWithRejection(stream, error2);
    }
    function WritableStreamFinishInFlightClose(stream) {
      stream._inFlightCloseRequest._resolve(void 0);
      stream._inFlightCloseRequest = void 0;
      const state = stream._state;
      if (state === "erroring") {
        stream._storedError = void 0;
        if (stream._pendingAbortRequest !== void 0) {
          stream._pendingAbortRequest._resolve();
          stream._pendingAbortRequest = void 0;
        }
      }
      stream._state = "closed";
      const writer = stream._writer;
      if (writer !== void 0) {
        defaultWriterClosedPromiseResolve(writer);
      }
    }
    function WritableStreamFinishInFlightCloseWithError(stream, error2) {
      stream._inFlightCloseRequest._reject(error2);
      stream._inFlightCloseRequest = void 0;
      if (stream._pendingAbortRequest !== void 0) {
        stream._pendingAbortRequest._reject(error2);
        stream._pendingAbortRequest = void 0;
      }
      WritableStreamDealWithRejection(stream, error2);
    }
    function WritableStreamCloseQueuedOrInFlight(stream) {
      if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
        return false;
      }
      return true;
    }
    function WritableStreamHasOperationMarkedInFlight(stream) {
      if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
        return false;
      }
      return true;
    }
    function WritableStreamMarkCloseRequestInFlight(stream) {
      stream._inFlightCloseRequest = stream._closeRequest;
      stream._closeRequest = void 0;
    }
    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
      stream._inFlightWriteRequest = stream._writeRequests.shift();
    }
    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
      if (stream._closeRequest !== void 0) {
        stream._closeRequest._reject(stream._storedError);
        stream._closeRequest = void 0;
      }
      const writer = stream._writer;
      if (writer !== void 0) {
        defaultWriterClosedPromiseReject(writer, stream._storedError);
      }
    }
    function WritableStreamUpdateBackpressure(stream, backpressure) {
      const writer = stream._writer;
      if (writer !== void 0 && backpressure !== stream._backpressure) {
        if (backpressure) {
          defaultWriterReadyPromiseReset(writer);
        } else {
          defaultWriterReadyPromiseResolve(writer);
        }
      }
      stream._backpressure = backpressure;
    }
    class WritableStreamDefaultWriter {
      constructor(stream) {
        assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
        assertWritableStream(stream, "First parameter");
        if (IsWritableStreamLocked(stream)) {
          throw new TypeError("This stream has already been locked for exclusive writing by another writer");
        }
        this._ownerWritableStream = stream;
        stream._writer = this;
        const state = stream._state;
        if (state === "writable") {
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
            defaultWriterReadyPromiseInitialize(this);
          } else {
            defaultWriterReadyPromiseInitializeAsResolved(this);
          }
          defaultWriterClosedPromiseInitialize(this);
        } else if (state === "erroring") {
          defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
          defaultWriterClosedPromiseInitialize(this);
        } else if (state === "closed") {
          defaultWriterReadyPromiseInitializeAsResolved(this);
          defaultWriterClosedPromiseInitializeAsResolved(this);
        } else {
          const storedError = stream._storedError;
          defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
          defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
        }
      }
      get closed() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
        }
        return this._closedPromise;
      }
      get desiredSize() {
        if (!IsWritableStreamDefaultWriter(this)) {
          throw defaultWriterBrandCheckException("desiredSize");
        }
        if (this._ownerWritableStream === void 0) {
          throw defaultWriterLockException("desiredSize");
        }
        return WritableStreamDefaultWriterGetDesiredSize(this);
      }
      get ready() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
        }
        return this._readyPromise;
      }
      abort(reason = void 0) {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
        }
        if (this._ownerWritableStream === void 0) {
          return promiseRejectedWith(defaultWriterLockException("abort"));
        }
        return WritableStreamDefaultWriterAbort(this, reason);
      }
      close() {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("close"));
        }
        const stream = this._ownerWritableStream;
        if (stream === void 0) {
          return promiseRejectedWith(defaultWriterLockException("close"));
        }
        if (WritableStreamCloseQueuedOrInFlight(stream)) {
          return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
        }
        return WritableStreamDefaultWriterClose(this);
      }
      releaseLock() {
        if (!IsWritableStreamDefaultWriter(this)) {
          throw defaultWriterBrandCheckException("releaseLock");
        }
        const stream = this._ownerWritableStream;
        if (stream === void 0) {
          return;
        }
        WritableStreamDefaultWriterRelease(this);
      }
      write(chunk = void 0) {
        if (!IsWritableStreamDefaultWriter(this)) {
          return promiseRejectedWith(defaultWriterBrandCheckException("write"));
        }
        if (this._ownerWritableStream === void 0) {
          return promiseRejectedWith(defaultWriterLockException("write to"));
        }
        return WritableStreamDefaultWriterWrite(this, chunk);
      }
    }
    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
      abort: { enumerable: true },
      close: { enumerable: true },
      releaseLock: { enumerable: true },
      write: { enumerable: true },
      closed: { enumerable: true },
      desiredSize: { enumerable: true },
      ready: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultWriter",
        configurable: true
      });
    }
    function IsWritableStreamDefaultWriter(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
        return false;
      }
      return x instanceof WritableStreamDefaultWriter;
    }
    function WritableStreamDefaultWriterAbort(writer, reason) {
      const stream = writer._ownerWritableStream;
      return WritableStreamAbort(stream, reason);
    }
    function WritableStreamDefaultWriterClose(writer) {
      const stream = writer._ownerWritableStream;
      return WritableStreamClose(stream);
    }
    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
      const stream = writer._ownerWritableStream;
      const state = stream._state;
      if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
        return promiseResolvedWith(void 0);
      }
      if (state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      return WritableStreamDefaultWriterClose(writer);
    }
    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
      if (writer._closedPromiseState === "pending") {
        defaultWriterClosedPromiseReject(writer, error2);
      } else {
        defaultWriterClosedPromiseResetToRejected(writer, error2);
      }
    }
    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
      if (writer._readyPromiseState === "pending") {
        defaultWriterReadyPromiseReject(writer, error2);
      } else {
        defaultWriterReadyPromiseResetToRejected(writer, error2);
      }
    }
    function WritableStreamDefaultWriterGetDesiredSize(writer) {
      const stream = writer._ownerWritableStream;
      const state = stream._state;
      if (state === "errored" || state === "erroring") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
    }
    function WritableStreamDefaultWriterRelease(writer) {
      const stream = writer._ownerWritableStream;
      const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
      WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
      WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
      stream._writer = void 0;
      writer._ownerWritableStream = void 0;
    }
    function WritableStreamDefaultWriterWrite(writer, chunk) {
      const stream = writer._ownerWritableStream;
      const controller = stream._writableStreamController;
      const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
      if (stream !== writer._ownerWritableStream) {
        return promiseRejectedWith(defaultWriterLockException("write to"));
      }
      const state = stream._state;
      if (state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
        return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
      }
      if (state === "erroring") {
        return promiseRejectedWith(stream._storedError);
      }
      const promise = WritableStreamAddWriteRequest(stream);
      WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
      return promise;
    }
    const closeSentinel = {};
    class WritableStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get abortReason() {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("abortReason");
        }
        return this._abortReason;
      }
      get signal() {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("signal");
        }
        if (this._abortController === void 0) {
          throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
        }
        return this._abortController.signal;
      }
      error(e = void 0) {
        if (!IsWritableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$2("error");
        }
        const state = this._controlledWritableStream._state;
        if (state !== "writable") {
          return;
        }
        WritableStreamDefaultControllerError(this, e);
      }
      [AbortSteps](reason) {
        const result = this._abortAlgorithm(reason);
        WritableStreamDefaultControllerClearAlgorithms(this);
        return result;
      }
      [ErrorSteps]() {
        ResetQueue(this);
      }
    }
    Object.defineProperties(WritableStreamDefaultController.prototype, {
      error: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "WritableStreamDefaultController",
        configurable: true
      });
    }
    function IsWritableStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
        return false;
      }
      return x instanceof WritableStreamDefaultController;
    }
    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
      controller._controlledWritableStream = stream;
      stream._writableStreamController = controller;
      controller._queue = void 0;
      controller._queueTotalSize = void 0;
      ResetQueue(controller);
      controller._abortReason = void 0;
      controller._abortController = createAbortController();
      controller._started = false;
      controller._strategySizeAlgorithm = sizeAlgorithm;
      controller._strategyHWM = highWaterMark;
      controller._writeAlgorithm = writeAlgorithm;
      controller._closeAlgorithm = closeAlgorithm;
      controller._abortAlgorithm = abortAlgorithm;
      const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
      WritableStreamUpdateBackpressure(stream, backpressure);
      const startResult = startAlgorithm();
      const startPromise = promiseResolvedWith(startResult);
      uponPromise(startPromise, () => {
        controller._started = true;
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
      }, (r) => {
        controller._started = true;
        WritableStreamDealWithRejection(stream, r);
      });
    }
    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
      const controller = Object.create(WritableStreamDefaultController.prototype);
      let startAlgorithm = () => void 0;
      let writeAlgorithm = () => promiseResolvedWith(void 0);
      let closeAlgorithm = () => promiseResolvedWith(void 0);
      let abortAlgorithm = () => promiseResolvedWith(void 0);
      if (underlyingSink.start !== void 0) {
        startAlgorithm = () => underlyingSink.start(controller);
      }
      if (underlyingSink.write !== void 0) {
        writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
      }
      if (underlyingSink.close !== void 0) {
        closeAlgorithm = () => underlyingSink.close();
      }
      if (underlyingSink.abort !== void 0) {
        abortAlgorithm = (reason) => underlyingSink.abort(reason);
      }
      SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
    }
    function WritableStreamDefaultControllerClearAlgorithms(controller) {
      controller._writeAlgorithm = void 0;
      controller._closeAlgorithm = void 0;
      controller._abortAlgorithm = void 0;
      controller._strategySizeAlgorithm = void 0;
    }
    function WritableStreamDefaultControllerClose(controller) {
      EnqueueValueWithSize(controller, closeSentinel, 0);
      WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
      try {
        return controller._strategySizeAlgorithm(chunk);
      } catch (chunkSizeE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
        return 1;
      }
    }
    function WritableStreamDefaultControllerGetDesiredSize(controller) {
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
      try {
        EnqueueValueWithSize(controller, chunk, chunkSize);
      } catch (enqueueE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
        return;
      }
      const stream = controller._controlledWritableStream;
      if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
        WritableStreamUpdateBackpressure(stream, backpressure);
      }
      WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }
    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
      const stream = controller._controlledWritableStream;
      if (!controller._started) {
        return;
      }
      if (stream._inFlightWriteRequest !== void 0) {
        return;
      }
      const state = stream._state;
      if (state === "erroring") {
        WritableStreamFinishErroring(stream);
        return;
      }
      if (controller._queue.length === 0) {
        return;
      }
      const value = PeekQueueValue(controller);
      if (value === closeSentinel) {
        WritableStreamDefaultControllerProcessClose(controller);
      } else {
        WritableStreamDefaultControllerProcessWrite(controller, value);
      }
    }
    function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
      if (controller._controlledWritableStream._state === "writable") {
        WritableStreamDefaultControllerError(controller, error2);
      }
    }
    function WritableStreamDefaultControllerProcessClose(controller) {
      const stream = controller._controlledWritableStream;
      WritableStreamMarkCloseRequestInFlight(stream);
      DequeueValue(controller);
      const sinkClosePromise = controller._closeAlgorithm();
      WritableStreamDefaultControllerClearAlgorithms(controller);
      uponPromise(sinkClosePromise, () => {
        WritableStreamFinishInFlightClose(stream);
      }, (reason) => {
        WritableStreamFinishInFlightCloseWithError(stream, reason);
      });
    }
    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
      const stream = controller._controlledWritableStream;
      WritableStreamMarkFirstWriteRequestInFlight(stream);
      const sinkWritePromise = controller._writeAlgorithm(chunk);
      uponPromise(sinkWritePromise, () => {
        WritableStreamFinishInFlightWrite(stream);
        const state = stream._state;
        DequeueValue(controller);
        if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
        }
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
      }, (reason) => {
        if (stream._state === "writable") {
          WritableStreamDefaultControllerClearAlgorithms(controller);
        }
        WritableStreamFinishInFlightWriteWithError(stream, reason);
      });
    }
    function WritableStreamDefaultControllerGetBackpressure(controller) {
      const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
      return desiredSize <= 0;
    }
    function WritableStreamDefaultControllerError(controller, error2) {
      const stream = controller._controlledWritableStream;
      WritableStreamDefaultControllerClearAlgorithms(controller);
      WritableStreamStartErroring(stream, error2);
    }
    function streamBrandCheckException$2(name) {
      return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
    }
    function defaultControllerBrandCheckException$2(name) {
      return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
    }
    function defaultWriterBrandCheckException(name) {
      return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
    }
    function defaultWriterLockException(name) {
      return new TypeError("Cannot " + name + " a stream using a released writer");
    }
    function defaultWriterClosedPromiseInitialize(writer) {
      writer._closedPromise = newPromise((resolve3, reject) => {
        writer._closedPromise_resolve = resolve3;
        writer._closedPromise_reject = reject;
        writer._closedPromiseState = "pending";
      });
    }
    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
      defaultWriterClosedPromiseInitialize(writer);
      defaultWriterClosedPromiseReject(writer, reason);
    }
    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
      defaultWriterClosedPromiseInitialize(writer);
      defaultWriterClosedPromiseResolve(writer);
    }
    function defaultWriterClosedPromiseReject(writer, reason) {
      if (writer._closedPromise_reject === void 0) {
        return;
      }
      setPromiseIsHandledToTrue(writer._closedPromise);
      writer._closedPromise_reject(reason);
      writer._closedPromise_resolve = void 0;
      writer._closedPromise_reject = void 0;
      writer._closedPromiseState = "rejected";
    }
    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
      defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterClosedPromiseResolve(writer) {
      if (writer._closedPromise_resolve === void 0) {
        return;
      }
      writer._closedPromise_resolve(void 0);
      writer._closedPromise_resolve = void 0;
      writer._closedPromise_reject = void 0;
      writer._closedPromiseState = "resolved";
    }
    function defaultWriterReadyPromiseInitialize(writer) {
      writer._readyPromise = newPromise((resolve3, reject) => {
        writer._readyPromise_resolve = resolve3;
        writer._readyPromise_reject = reject;
      });
      writer._readyPromiseState = "pending";
    }
    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
      defaultWriterReadyPromiseInitialize(writer);
      defaultWriterReadyPromiseReject(writer, reason);
    }
    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
      defaultWriterReadyPromiseInitialize(writer);
      defaultWriterReadyPromiseResolve(writer);
    }
    function defaultWriterReadyPromiseReject(writer, reason) {
      if (writer._readyPromise_reject === void 0) {
        return;
      }
      setPromiseIsHandledToTrue(writer._readyPromise);
      writer._readyPromise_reject(reason);
      writer._readyPromise_resolve = void 0;
      writer._readyPromise_reject = void 0;
      writer._readyPromiseState = "rejected";
    }
    function defaultWriterReadyPromiseReset(writer) {
      defaultWriterReadyPromiseInitialize(writer);
    }
    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
      defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
    }
    function defaultWriterReadyPromiseResolve(writer) {
      if (writer._readyPromise_resolve === void 0) {
        return;
      }
      writer._readyPromise_resolve(void 0);
      writer._readyPromise_resolve = void 0;
      writer._readyPromise_reject = void 0;
      writer._readyPromiseState = "fulfilled";
    }
    const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
    function isDOMExceptionConstructor(ctor) {
      if (!(typeof ctor === "function" || typeof ctor === "object")) {
        return false;
      }
      try {
        new ctor();
        return true;
      } catch (_a2) {
        return false;
      }
    }
    function createDOMExceptionPolyfill() {
      const ctor = function DOMException2(message, name) {
        this.message = message || "";
        this.name = name || "Error";
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      };
      ctor.prototype = Object.create(Error.prototype);
      Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
      return ctor;
    }
    const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
      const reader = AcquireReadableStreamDefaultReader(source);
      const writer = AcquireWritableStreamDefaultWriter(dest);
      source._disturbed = true;
      let shuttingDown = false;
      let currentWrite = promiseResolvedWith(void 0);
      return newPromise((resolve3, reject) => {
        let abortAlgorithm;
        if (signal !== void 0) {
          abortAlgorithm = () => {
            const error2 = new DOMException$1("Aborted", "AbortError");
            const actions = [];
            if (!preventAbort) {
              actions.push(() => {
                if (dest._state === "writable") {
                  return WritableStreamAbort(dest, error2);
                }
                return promiseResolvedWith(void 0);
              });
            }
            if (!preventCancel) {
              actions.push(() => {
                if (source._state === "readable") {
                  return ReadableStreamCancel(source, error2);
                }
                return promiseResolvedWith(void 0);
              });
            }
            shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
          };
          if (signal.aborted) {
            abortAlgorithm();
            return;
          }
          signal.addEventListener("abort", abortAlgorithm);
        }
        function pipeLoop() {
          return newPromise((resolveLoop, rejectLoop) => {
            function next(done) {
              if (done) {
                resolveLoop();
              } else {
                PerformPromiseThen(pipeStep(), next, rejectLoop);
              }
            }
            next(false);
          });
        }
        function pipeStep() {
          if (shuttingDown) {
            return promiseResolvedWith(true);
          }
          return PerformPromiseThen(writer._readyPromise, () => {
            return newPromise((resolveRead, rejectRead) => {
              ReadableStreamDefaultReaderRead(reader, {
                _chunkSteps: (chunk) => {
                  currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop3);
                  resolveRead(false);
                },
                _closeSteps: () => resolveRead(true),
                _errorSteps: rejectRead
              });
            });
          });
        }
        isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
          if (!preventAbort) {
            shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
          } else {
            shutdown(true, storedError);
          }
        });
        isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
          if (!preventCancel) {
            shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
          } else {
            shutdown(true, storedError);
          }
        });
        isOrBecomesClosed(source, reader._closedPromise, () => {
          if (!preventClose) {
            shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
          } else {
            shutdown();
          }
        });
        if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
          const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
          if (!preventCancel) {
            shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
          } else {
            shutdown(true, destClosed);
          }
        }
        setPromiseIsHandledToTrue(pipeLoop());
        function waitForWritesToFinish() {
          const oldCurrentWrite = currentWrite;
          return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
        }
        function isOrBecomesErrored(stream, promise, action) {
          if (stream._state === "errored") {
            action(stream._storedError);
          } else {
            uponRejection(promise, action);
          }
        }
        function isOrBecomesClosed(stream, promise, action) {
          if (stream._state === "closed") {
            action();
          } else {
            uponFulfillment(promise, action);
          }
        }
        function shutdownWithAction(action, originalIsError, originalError) {
          if (shuttingDown) {
            return;
          }
          shuttingDown = true;
          if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
            uponFulfillment(waitForWritesToFinish(), doTheRest);
          } else {
            doTheRest();
          }
          function doTheRest() {
            uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
          }
        }
        function shutdown(isError, error2) {
          if (shuttingDown) {
            return;
          }
          shuttingDown = true;
          if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
            uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
          } else {
            finalize(isError, error2);
          }
        }
        function finalize(isError, error2) {
          WritableStreamDefaultWriterRelease(writer);
          ReadableStreamReaderGenericRelease(reader);
          if (signal !== void 0) {
            signal.removeEventListener("abort", abortAlgorithm);
          }
          if (isError) {
            reject(error2);
          } else {
            resolve3(void 0);
          }
        }
      });
    }
    class ReadableStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get desiredSize() {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("desiredSize");
        }
        return ReadableStreamDefaultControllerGetDesiredSize(this);
      }
      close() {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("close");
        }
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
          throw new TypeError("The stream is not in a state that permits close");
        }
        ReadableStreamDefaultControllerClose(this);
      }
      enqueue(chunk = void 0) {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("enqueue");
        }
        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
          throw new TypeError("The stream is not in a state that permits enqueue");
        }
        return ReadableStreamDefaultControllerEnqueue(this, chunk);
      }
      error(e = void 0) {
        if (!IsReadableStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException$1("error");
        }
        ReadableStreamDefaultControllerError(this, e);
      }
      [CancelSteps](reason) {
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableStreamDefaultControllerClearAlgorithms(this);
        return result;
      }
      [PullSteps](readRequest) {
        const stream = this._controlledReadableStream;
        if (this._queue.length > 0) {
          const chunk = DequeueValue(this);
          if (this._closeRequested && this._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(this);
            ReadableStreamClose(stream);
          } else {
            ReadableStreamDefaultControllerCallPullIfNeeded(this);
          }
          readRequest._chunkSteps(chunk);
        } else {
          ReadableStreamAddReadRequest(stream, readRequest);
          ReadableStreamDefaultControllerCallPullIfNeeded(this);
        }
      }
    }
    Object.defineProperties(ReadableStreamDefaultController.prototype, {
      close: { enumerable: true },
      enqueue: { enumerable: true },
      error: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStreamDefaultController",
        configurable: true
      });
    }
    function IsReadableStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
        return false;
      }
      return x instanceof ReadableStreamDefaultController;
    }
    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
      const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
      if (!shouldPull) {
        return;
      }
      if (controller._pulling) {
        controller._pullAgain = true;
        return;
      }
      controller._pulling = true;
      const pullPromise = controller._pullAlgorithm();
      uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain) {
          controller._pullAgain = false;
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
      }, (e) => {
        ReadableStreamDefaultControllerError(controller, e);
      });
    }
    function ReadableStreamDefaultControllerShouldCallPull(controller) {
      const stream = controller._controlledReadableStream;
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return false;
      }
      if (!controller._started) {
        return false;
      }
      if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
      }
      const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
      if (desiredSize > 0) {
        return true;
      }
      return false;
    }
    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
      controller._pullAlgorithm = void 0;
      controller._cancelAlgorithm = void 0;
      controller._strategySizeAlgorithm = void 0;
    }
    function ReadableStreamDefaultControllerClose(controller) {
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return;
      }
      const stream = controller._controlledReadableStream;
      controller._closeRequested = true;
      if (controller._queue.length === 0) {
        ReadableStreamDefaultControllerClearAlgorithms(controller);
        ReadableStreamClose(stream);
      }
    }
    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
        return;
      }
      const stream = controller._controlledReadableStream;
      if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
        ReadableStreamFulfillReadRequest(stream, chunk, false);
      } else {
        let chunkSize;
        try {
          chunkSize = controller._strategySizeAlgorithm(chunk);
        } catch (chunkSizeE) {
          ReadableStreamDefaultControllerError(controller, chunkSizeE);
          throw chunkSizeE;
        }
        try {
          EnqueueValueWithSize(controller, chunk, chunkSize);
        } catch (enqueueE) {
          ReadableStreamDefaultControllerError(controller, enqueueE);
          throw enqueueE;
        }
      }
      ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }
    function ReadableStreamDefaultControllerError(controller, e) {
      const stream = controller._controlledReadableStream;
      if (stream._state !== "readable") {
        return;
      }
      ResetQueue(controller);
      ReadableStreamDefaultControllerClearAlgorithms(controller);
      ReadableStreamError(stream, e);
    }
    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
      const state = controller._controlledReadableStream._state;
      if (state === "errored") {
        return null;
      }
      if (state === "closed") {
        return 0;
      }
      return controller._strategyHWM - controller._queueTotalSize;
    }
    function ReadableStreamDefaultControllerHasBackpressure(controller) {
      if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
        return false;
      }
      return true;
    }
    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
      const state = controller._controlledReadableStream._state;
      if (!controller._closeRequested && state === "readable") {
        return true;
      }
      return false;
    }
    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
      controller._controlledReadableStream = stream;
      controller._queue = void 0;
      controller._queueTotalSize = void 0;
      ResetQueue(controller);
      controller._started = false;
      controller._closeRequested = false;
      controller._pullAgain = false;
      controller._pulling = false;
      controller._strategySizeAlgorithm = sizeAlgorithm;
      controller._strategyHWM = highWaterMark;
      controller._pullAlgorithm = pullAlgorithm;
      controller._cancelAlgorithm = cancelAlgorithm;
      stream._readableStreamController = controller;
      const startResult = startAlgorithm();
      uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
      }, (r) => {
        ReadableStreamDefaultControllerError(controller, r);
      });
    }
    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
      const controller = Object.create(ReadableStreamDefaultController.prototype);
      let startAlgorithm = () => void 0;
      let pullAlgorithm = () => promiseResolvedWith(void 0);
      let cancelAlgorithm = () => promiseResolvedWith(void 0);
      if (underlyingSource.start !== void 0) {
        startAlgorithm = () => underlyingSource.start(controller);
      }
      if (underlyingSource.pull !== void 0) {
        pullAlgorithm = () => underlyingSource.pull(controller);
      }
      if (underlyingSource.cancel !== void 0) {
        cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
      }
      SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
    }
    function defaultControllerBrandCheckException$1(name) {
      return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
    }
    function ReadableStreamTee(stream, cloneForBranch2) {
      if (IsReadableByteStreamController(stream._readableStreamController)) {
        return ReadableByteStreamTee(stream);
      }
      return ReadableStreamDefaultTee(stream);
    }
    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
      const reader = AcquireReadableStreamDefaultReader(stream);
      let reading = false;
      let canceled1 = false;
      let canceled2 = false;
      let reason1;
      let reason2;
      let branch1;
      let branch2;
      let resolveCancelPromise;
      const cancelPromise = newPromise((resolve3) => {
        resolveCancelPromise = resolve3;
      });
      function pullAlgorithm() {
        if (reading) {
          return promiseResolvedWith(void 0);
        }
        reading = true;
        const readRequest = {
          _chunkSteps: (chunk) => {
            queueMicrotask(() => {
              reading = false;
              const chunk1 = chunk;
              const chunk2 = chunk;
              if (!canceled1) {
                ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
              }
              if (!canceled2) {
                ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
              }
            });
          },
          _closeSteps: () => {
            reading = false;
            if (!canceled1) {
              ReadableStreamDefaultControllerClose(branch1._readableStreamController);
            }
            if (!canceled2) {
              ReadableStreamDefaultControllerClose(branch2._readableStreamController);
            }
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
        return promiseResolvedWith(void 0);
      }
      function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function startAlgorithm() {
      }
      branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
      branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
      uponRejection(reader._closedPromise, (r) => {
        ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
        ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
        if (!canceled1 || !canceled2) {
          resolveCancelPromise(void 0);
        }
      });
      return [branch1, branch2];
    }
    function ReadableByteStreamTee(stream) {
      let reader = AcquireReadableStreamDefaultReader(stream);
      let reading = false;
      let canceled1 = false;
      let canceled2 = false;
      let reason1;
      let reason2;
      let branch1;
      let branch2;
      let resolveCancelPromise;
      const cancelPromise = newPromise((resolve3) => {
        resolveCancelPromise = resolve3;
      });
      function forwardReaderError(thisReader) {
        uponRejection(thisReader._closedPromise, (r) => {
          if (thisReader !== reader) {
            return;
          }
          ReadableByteStreamControllerError(branch1._readableStreamController, r);
          ReadableByteStreamControllerError(branch2._readableStreamController, r);
          if (!canceled1 || !canceled2) {
            resolveCancelPromise(void 0);
          }
        });
      }
      function pullWithDefaultReader() {
        if (IsReadableStreamBYOBReader(reader)) {
          ReadableStreamReaderGenericRelease(reader);
          reader = AcquireReadableStreamDefaultReader(stream);
          forwardReaderError(reader);
        }
        const readRequest = {
          _chunkSteps: (chunk) => {
            queueMicrotask(() => {
              reading = false;
              const chunk1 = chunk;
              let chunk2 = chunk;
              if (!canceled1 && !canceled2) {
                try {
                  chunk2 = CloneAsUint8Array(chunk);
                } catch (cloneE) {
                  ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                  ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                  resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                  return;
                }
              }
              if (!canceled1) {
                ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
              }
              if (!canceled2) {
                ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
              }
            });
          },
          _closeSteps: () => {
            reading = false;
            if (!canceled1) {
              ReadableByteStreamControllerClose(branch1._readableStreamController);
            }
            if (!canceled2) {
              ReadableByteStreamControllerClose(branch2._readableStreamController);
            }
            if (branch1._readableStreamController._pendingPullIntos.length > 0) {
              ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
            }
            if (branch2._readableStreamController._pendingPullIntos.length > 0) {
              ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
            }
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamDefaultReaderRead(reader, readRequest);
      }
      function pullWithBYOBReader(view, forBranch2) {
        if (IsReadableStreamDefaultReader(reader)) {
          ReadableStreamReaderGenericRelease(reader);
          reader = AcquireReadableStreamBYOBReader(stream);
          forwardReaderError(reader);
        }
        const byobBranch = forBranch2 ? branch2 : branch1;
        const otherBranch = forBranch2 ? branch1 : branch2;
        const readIntoRequest = {
          _chunkSteps: (chunk) => {
            queueMicrotask(() => {
              reading = false;
              const byobCanceled = forBranch2 ? canceled2 : canceled1;
              const otherCanceled = forBranch2 ? canceled1 : canceled2;
              if (!otherCanceled) {
                let clonedChunk;
                try {
                  clonedChunk = CloneAsUint8Array(chunk);
                } catch (cloneE) {
                  ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                  ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                  resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                  return;
                }
                if (!byobCanceled) {
                  ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                }
                ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
              } else if (!byobCanceled) {
                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
              }
            });
          },
          _closeSteps: (chunk) => {
            reading = false;
            const byobCanceled = forBranch2 ? canceled2 : canceled1;
            const otherCanceled = forBranch2 ? canceled1 : canceled2;
            if (!byobCanceled) {
              ReadableByteStreamControllerClose(byobBranch._readableStreamController);
            }
            if (!otherCanceled) {
              ReadableByteStreamControllerClose(otherBranch._readableStreamController);
            }
            if (chunk !== void 0) {
              if (!byobCanceled) {
                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
              }
              if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
              }
            }
            if (!byobCanceled || !otherCanceled) {
              resolveCancelPromise(void 0);
            }
          },
          _errorSteps: () => {
            reading = false;
          }
        };
        ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
      }
      function pull1Algorithm() {
        if (reading) {
          return promiseResolvedWith(void 0);
        }
        reading = true;
        const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
        if (byobRequest === null) {
          pullWithDefaultReader();
        } else {
          pullWithBYOBReader(byobRequest._view, false);
        }
        return promiseResolvedWith(void 0);
      }
      function pull2Algorithm() {
        if (reading) {
          return promiseResolvedWith(void 0);
        }
        reading = true;
        const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
        if (byobRequest === null) {
          pullWithDefaultReader();
        } else {
          pullWithBYOBReader(byobRequest._view, true);
        }
        return promiseResolvedWith(void 0);
      }
      function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1) {
          const compositeReason = CreateArrayFromList([reason1, reason2]);
          const cancelResult = ReadableStreamCancel(stream, compositeReason);
          resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
      }
      function startAlgorithm() {
        return;
      }
      branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
      branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
      forwardReaderError(reader);
      return [branch1, branch2];
    }
    function convertUnderlyingDefaultOrByteSource(source, context) {
      assertDictionary(source, context);
      const original = source;
      const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
      const cancel = original === null || original === void 0 ? void 0 : original.cancel;
      const pull = original === null || original === void 0 ? void 0 : original.pull;
      const start = original === null || original === void 0 ? void 0 : original.start;
      const type = original === null || original === void 0 ? void 0 : original.type;
      return {
        autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
        cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
        pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
        start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
        type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
      };
    }
    function convertUnderlyingSourceCancelCallback(fn, original, context) {
      assertFunction(fn, context);
      return (reason) => promiseCall(fn, original, [reason]);
    }
    function convertUnderlyingSourcePullCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertUnderlyingSourceStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertReadableStreamType(type, context) {
      type = `${type}`;
      if (type !== "bytes") {
        throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
      }
      return type;
    }
    function convertReaderOptions(options2, context) {
      assertDictionary(options2, context);
      const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
      return {
        mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
      };
    }
    function convertReadableStreamReaderMode(mode, context) {
      mode = `${mode}`;
      if (mode !== "byob") {
        throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
      }
      return mode;
    }
    function convertIteratorOptions(options2, context) {
      assertDictionary(options2, context);
      const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
      return { preventCancel: Boolean(preventCancel) };
    }
    function convertPipeOptions(options2, context) {
      assertDictionary(options2, context);
      const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
      const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
      const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
      const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
      if (signal !== void 0) {
        assertAbortSignal(signal, `${context} has member 'signal' that`);
      }
      return {
        preventAbort: Boolean(preventAbort),
        preventCancel: Boolean(preventCancel),
        preventClose: Boolean(preventClose),
        signal
      };
    }
    function assertAbortSignal(signal, context) {
      if (!isAbortSignal2(signal)) {
        throw new TypeError(`${context} is not an AbortSignal.`);
      }
    }
    function convertReadableWritablePair(pair, context) {
      assertDictionary(pair, context);
      const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
      assertRequiredField(readable, "readable", "ReadableWritablePair");
      assertReadableStream(readable, `${context} has member 'readable' that`);
      const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
      assertRequiredField(writable2, "writable", "ReadableWritablePair");
      assertWritableStream(writable2, `${context} has member 'writable' that`);
      return { readable, writable: writable2 };
    }
    class ReadableStream2 {
      constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
        if (rawUnderlyingSource === void 0) {
          rawUnderlyingSource = null;
        } else {
          assertObject(rawUnderlyingSource, "First parameter");
        }
        const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
        const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
        InitializeReadableStream(this);
        if (underlyingSource.type === "bytes") {
          if (strategy.size !== void 0) {
            throw new RangeError("The strategy for a byte stream cannot have a size function");
          }
          const highWaterMark = ExtractHighWaterMark(strategy, 0);
          SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
        } else {
          const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
          const highWaterMark = ExtractHighWaterMark(strategy, 1);
          SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
        }
      }
      get locked() {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("locked");
        }
        return IsReadableStreamLocked(this);
      }
      cancel(reason = void 0) {
        if (!IsReadableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$1("cancel"));
        }
        if (IsReadableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
        }
        return ReadableStreamCancel(this, reason);
      }
      getReader(rawOptions = void 0) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("getReader");
        }
        const options2 = convertReaderOptions(rawOptions, "First parameter");
        if (options2.mode === void 0) {
          return AcquireReadableStreamDefaultReader(this);
        }
        return AcquireReadableStreamBYOBReader(this);
      }
      pipeThrough(rawTransform, rawOptions = {}) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("pipeThrough");
        }
        assertRequiredArgument(rawTransform, 1, "pipeThrough");
        const transform = convertReadableWritablePair(rawTransform, "First parameter");
        const options2 = convertPipeOptions(rawOptions, "Second parameter");
        if (IsReadableStreamLocked(this)) {
          throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
        }
        if (IsWritableStreamLocked(transform.writable)) {
          throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
        }
        const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
        setPromiseIsHandledToTrue(promise);
        return transform.readable;
      }
      pipeTo(destination, rawOptions = {}) {
        if (!IsReadableStream(this)) {
          return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
        }
        if (destination === void 0) {
          return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
        }
        if (!IsWritableStream(destination)) {
          return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
        }
        let options2;
        try {
          options2 = convertPipeOptions(rawOptions, "Second parameter");
        } catch (e) {
          return promiseRejectedWith(e);
        }
        if (IsReadableStreamLocked(this)) {
          return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
        }
        if (IsWritableStreamLocked(destination)) {
          return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
        }
        return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
      }
      tee() {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("tee");
        }
        const branches = ReadableStreamTee(this);
        return CreateArrayFromList(branches);
      }
      values(rawOptions = void 0) {
        if (!IsReadableStream(this)) {
          throw streamBrandCheckException$1("values");
        }
        const options2 = convertIteratorOptions(rawOptions, "First parameter");
        return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
      }
    }
    Object.defineProperties(ReadableStream2.prototype, {
      cancel: { enumerable: true },
      getReader: { enumerable: true },
      pipeThrough: { enumerable: true },
      pipeTo: { enumerable: true },
      tee: { enumerable: true },
      values: { enumerable: true },
      locked: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
        value: "ReadableStream",
        configurable: true
      });
    }
    if (typeof SymbolPolyfill.asyncIterator === "symbol") {
      Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
        value: ReadableStream2.prototype.values,
        writable: true,
        configurable: true
      });
    }
    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
      const stream = Object.create(ReadableStream2.prototype);
      InitializeReadableStream(stream);
      const controller = Object.create(ReadableStreamDefaultController.prototype);
      SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
      return stream;
    }
    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
      const stream = Object.create(ReadableStream2.prototype);
      InitializeReadableStream(stream);
      const controller = Object.create(ReadableByteStreamController.prototype);
      SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
      return stream;
    }
    function InitializeReadableStream(stream) {
      stream._state = "readable";
      stream._reader = void 0;
      stream._storedError = void 0;
      stream._disturbed = false;
    }
    function IsReadableStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
        return false;
      }
      return x instanceof ReadableStream2;
    }
    function IsReadableStreamLocked(stream) {
      if (stream._reader === void 0) {
        return false;
      }
      return true;
    }
    function ReadableStreamCancel(stream, reason) {
      stream._disturbed = true;
      if (stream._state === "closed") {
        return promiseResolvedWith(void 0);
      }
      if (stream._state === "errored") {
        return promiseRejectedWith(stream._storedError);
      }
      ReadableStreamClose(stream);
      const reader = stream._reader;
      if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
        reader._readIntoRequests.forEach((readIntoRequest) => {
          readIntoRequest._closeSteps(void 0);
        });
        reader._readIntoRequests = new SimpleQueue();
      }
      const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
      return transformPromiseWith(sourceCancelPromise, noop3);
    }
    function ReadableStreamClose(stream) {
      stream._state = "closed";
      const reader = stream._reader;
      if (reader === void 0) {
        return;
      }
      defaultReaderClosedPromiseResolve(reader);
      if (IsReadableStreamDefaultReader(reader)) {
        reader._readRequests.forEach((readRequest) => {
          readRequest._closeSteps();
        });
        reader._readRequests = new SimpleQueue();
      }
    }
    function ReadableStreamError(stream, e) {
      stream._state = "errored";
      stream._storedError = e;
      const reader = stream._reader;
      if (reader === void 0) {
        return;
      }
      defaultReaderClosedPromiseReject(reader, e);
      if (IsReadableStreamDefaultReader(reader)) {
        reader._readRequests.forEach((readRequest) => {
          readRequest._errorSteps(e);
        });
        reader._readRequests = new SimpleQueue();
      } else {
        reader._readIntoRequests.forEach((readIntoRequest) => {
          readIntoRequest._errorSteps(e);
        });
        reader._readIntoRequests = new SimpleQueue();
      }
    }
    function streamBrandCheckException$1(name) {
      return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
    }
    function convertQueuingStrategyInit(init2, context) {
      assertDictionary(init2, context);
      const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
      assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
      return {
        highWaterMark: convertUnrestrictedDouble(highWaterMark)
      };
    }
    const byteLengthSizeFunction = (chunk) => {
      return chunk.byteLength;
    };
    Object.defineProperty(byteLengthSizeFunction, "name", {
      value: "size",
      configurable: true
    });
    class ByteLengthQueuingStrategy {
      constructor(options2) {
        assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
        options2 = convertQueuingStrategyInit(options2, "First parameter");
        this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
      }
      get highWaterMark() {
        if (!IsByteLengthQueuingStrategy(this)) {
          throw byteLengthBrandCheckException("highWaterMark");
        }
        return this._byteLengthQueuingStrategyHighWaterMark;
      }
      get size() {
        if (!IsByteLengthQueuingStrategy(this)) {
          throw byteLengthBrandCheckException("size");
        }
        return byteLengthSizeFunction;
      }
    }
    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
      highWaterMark: { enumerable: true },
      size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "ByteLengthQueuingStrategy",
        configurable: true
      });
    }
    function byteLengthBrandCheckException(name) {
      return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
    }
    function IsByteLengthQueuingStrategy(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
        return false;
      }
      return x instanceof ByteLengthQueuingStrategy;
    }
    const countSizeFunction = () => {
      return 1;
    };
    Object.defineProperty(countSizeFunction, "name", {
      value: "size",
      configurable: true
    });
    class CountQueuingStrategy {
      constructor(options2) {
        assertRequiredArgument(options2, 1, "CountQueuingStrategy");
        options2 = convertQueuingStrategyInit(options2, "First parameter");
        this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
      }
      get highWaterMark() {
        if (!IsCountQueuingStrategy(this)) {
          throw countBrandCheckException("highWaterMark");
        }
        return this._countQueuingStrategyHighWaterMark;
      }
      get size() {
        if (!IsCountQueuingStrategy(this)) {
          throw countBrandCheckException("size");
        }
        return countSizeFunction;
      }
    }
    Object.defineProperties(CountQueuingStrategy.prototype, {
      highWaterMark: { enumerable: true },
      size: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
        value: "CountQueuingStrategy",
        configurable: true
      });
    }
    function countBrandCheckException(name) {
      return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
    }
    function IsCountQueuingStrategy(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
        return false;
      }
      return x instanceof CountQueuingStrategy;
    }
    function convertTransformer(original, context) {
      assertDictionary(original, context);
      const flush = original === null || original === void 0 ? void 0 : original.flush;
      const readableType = original === null || original === void 0 ? void 0 : original.readableType;
      const start = original === null || original === void 0 ? void 0 : original.start;
      const transform = original === null || original === void 0 ? void 0 : original.transform;
      const writableType = original === null || original === void 0 ? void 0 : original.writableType;
      return {
        flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
        readableType,
        start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
        transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
        writableType
      };
    }
    function convertTransformerFlushCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => promiseCall(fn, original, [controller]);
    }
    function convertTransformerStartCallback(fn, original, context) {
      assertFunction(fn, context);
      return (controller) => reflectCall(fn, original, [controller]);
    }
    function convertTransformerTransformCallback(fn, original, context) {
      assertFunction(fn, context);
      return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
    }
    class TransformStream {
      constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
        if (rawTransformer === void 0) {
          rawTransformer = null;
        }
        const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
        const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
        const transformer = convertTransformer(rawTransformer, "First parameter");
        if (transformer.readableType !== void 0) {
          throw new RangeError("Invalid readableType specified");
        }
        if (transformer.writableType !== void 0) {
          throw new RangeError("Invalid writableType specified");
        }
        const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
        const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
        const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
        const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
        let startPromise_resolve;
        const startPromise = newPromise((resolve3) => {
          startPromise_resolve = resolve3;
        });
        InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
        SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
        if (transformer.start !== void 0) {
          startPromise_resolve(transformer.start(this._transformStreamController));
        } else {
          startPromise_resolve(void 0);
        }
      }
      get readable() {
        if (!IsTransformStream(this)) {
          throw streamBrandCheckException("readable");
        }
        return this._readable;
      }
      get writable() {
        if (!IsTransformStream(this)) {
          throw streamBrandCheckException("writable");
        }
        return this._writable;
      }
    }
    Object.defineProperties(TransformStream.prototype, {
      readable: { enumerable: true },
      writable: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStream",
        configurable: true
      });
    }
    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
      function startAlgorithm() {
        return startPromise;
      }
      function writeAlgorithm(chunk) {
        return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
      }
      function abortAlgorithm(reason) {
        return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
      }
      function closeAlgorithm() {
        return TransformStreamDefaultSinkCloseAlgorithm(stream);
      }
      stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
      function pullAlgorithm() {
        return TransformStreamDefaultSourcePullAlgorithm(stream);
      }
      function cancelAlgorithm(reason) {
        TransformStreamErrorWritableAndUnblockWrite(stream, reason);
        return promiseResolvedWith(void 0);
      }
      stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
      stream._backpressure = void 0;
      stream._backpressureChangePromise = void 0;
      stream._backpressureChangePromise_resolve = void 0;
      TransformStreamSetBackpressure(stream, true);
      stream._transformStreamController = void 0;
    }
    function IsTransformStream(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
        return false;
      }
      return x instanceof TransformStream;
    }
    function TransformStreamError(stream, e) {
      ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
      TransformStreamErrorWritableAndUnblockWrite(stream, e);
    }
    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
      TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
      WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
      if (stream._backpressure) {
        TransformStreamSetBackpressure(stream, false);
      }
    }
    function TransformStreamSetBackpressure(stream, backpressure) {
      if (stream._backpressureChangePromise !== void 0) {
        stream._backpressureChangePromise_resolve();
      }
      stream._backpressureChangePromise = newPromise((resolve3) => {
        stream._backpressureChangePromise_resolve = resolve3;
      });
      stream._backpressure = backpressure;
    }
    class TransformStreamDefaultController {
      constructor() {
        throw new TypeError("Illegal constructor");
      }
      get desiredSize() {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("desiredSize");
        }
        const readableController = this._controlledTransformStream._readable._readableStreamController;
        return ReadableStreamDefaultControllerGetDesiredSize(readableController);
      }
      enqueue(chunk = void 0) {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("enqueue");
        }
        TransformStreamDefaultControllerEnqueue(this, chunk);
      }
      error(reason = void 0) {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("error");
        }
        TransformStreamDefaultControllerError(this, reason);
      }
      terminate() {
        if (!IsTransformStreamDefaultController(this)) {
          throw defaultControllerBrandCheckException("terminate");
        }
        TransformStreamDefaultControllerTerminate(this);
      }
    }
    Object.defineProperties(TransformStreamDefaultController.prototype, {
      enqueue: { enumerable: true },
      error: { enumerable: true },
      terminate: { enumerable: true },
      desiredSize: { enumerable: true }
    });
    if (typeof SymbolPolyfill.toStringTag === "symbol") {
      Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
        value: "TransformStreamDefaultController",
        configurable: true
      });
    }
    function IsTransformStreamDefaultController(x) {
      if (!typeIsObject(x)) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
        return false;
      }
      return x instanceof TransformStreamDefaultController;
    }
    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
      controller._controlledTransformStream = stream;
      stream._transformStreamController = controller;
      controller._transformAlgorithm = transformAlgorithm;
      controller._flushAlgorithm = flushAlgorithm;
    }
    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
      const controller = Object.create(TransformStreamDefaultController.prototype);
      let transformAlgorithm = (chunk) => {
        try {
          TransformStreamDefaultControllerEnqueue(controller, chunk);
          return promiseResolvedWith(void 0);
        } catch (transformResultE) {
          return promiseRejectedWith(transformResultE);
        }
      };
      let flushAlgorithm = () => promiseResolvedWith(void 0);
      if (transformer.transform !== void 0) {
        transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
      }
      if (transformer.flush !== void 0) {
        flushAlgorithm = () => transformer.flush(controller);
      }
      SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
    }
    function TransformStreamDefaultControllerClearAlgorithms(controller) {
      controller._transformAlgorithm = void 0;
      controller._flushAlgorithm = void 0;
    }
    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
      const stream = controller._controlledTransformStream;
      const readableController = stream._readable._readableStreamController;
      if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
        throw new TypeError("Readable side is not in a state that permits enqueue");
      }
      try {
        ReadableStreamDefaultControllerEnqueue(readableController, chunk);
      } catch (e) {
        TransformStreamErrorWritableAndUnblockWrite(stream, e);
        throw stream._readable._storedError;
      }
      const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
      if (backpressure !== stream._backpressure) {
        TransformStreamSetBackpressure(stream, true);
      }
    }
    function TransformStreamDefaultControllerError(controller, e) {
      TransformStreamError(controller._controlledTransformStream, e);
    }
    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
      const transformPromise = controller._transformAlgorithm(chunk);
      return transformPromiseWith(transformPromise, void 0, (r) => {
        TransformStreamError(controller._controlledTransformStream, r);
        throw r;
      });
    }
    function TransformStreamDefaultControllerTerminate(controller) {
      const stream = controller._controlledTransformStream;
      const readableController = stream._readable._readableStreamController;
      ReadableStreamDefaultControllerClose(readableController);
      const error2 = new TypeError("TransformStream terminated");
      TransformStreamErrorWritableAndUnblockWrite(stream, error2);
    }
    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
      const controller = stream._transformStreamController;
      if (stream._backpressure) {
        const backpressureChangePromise = stream._backpressureChangePromise;
        return transformPromiseWith(backpressureChangePromise, () => {
          const writable2 = stream._writable;
          const state = writable2._state;
          if (state === "erroring") {
            throw writable2._storedError;
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        });
      }
      return TransformStreamDefaultControllerPerformTransform(controller, chunk);
    }
    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
      TransformStreamError(stream, reason);
      return promiseResolvedWith(void 0);
    }
    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
      const readable = stream._readable;
      const controller = stream._transformStreamController;
      const flushPromise = controller._flushAlgorithm();
      TransformStreamDefaultControllerClearAlgorithms(controller);
      return transformPromiseWith(flushPromise, () => {
        if (readable._state === "errored") {
          throw readable._storedError;
        }
        ReadableStreamDefaultControllerClose(readable._readableStreamController);
      }, (r) => {
        TransformStreamError(stream, r);
        throw readable._storedError;
      });
    }
    function TransformStreamDefaultSourcePullAlgorithm(stream) {
      TransformStreamSetBackpressure(stream, false);
      return stream._backpressureChangePromise;
    }
    function defaultControllerBrandCheckException(name) {
      return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
    }
    function streamBrandCheckException(name) {
      return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
    }
    exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
    exports2.CountQueuingStrategy = CountQueuingStrategy;
    exports2.ReadableByteStreamController = ReadableByteStreamController;
    exports2.ReadableStream = ReadableStream2;
    exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
    exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
    exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
    exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
    exports2.TransformStream = TransformStream;
    exports2.TransformStreamDefaultController = TransformStreamDefaultController;
    exports2.WritableStream = WritableStream;
    exports2.WritableStreamDefaultController = WritableStreamDefaultController;
    exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
})(ponyfill_es2018, ponyfill_es2018.exports);
var POOL_SIZE$1 = 65536;
if (!globalThis.ReadableStream) {
  try {
    Object.assign(globalThis, __require("stream/web"));
  } catch (error2) {
    Object.assign(globalThis, ponyfill_es2018.exports);
  }
}
try {
  const { Blob: Blob2 } = __require("buffer");
  if (Blob2 && !Blob2.prototype.stream) {
    Blob2.prototype.stream = function name(params) {
      let position = 0;
      const blob = this;
      return new ReadableStream({
        type: "bytes",
        async pull(ctrl) {
          const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
          const buffer = await chunk.arrayBuffer();
          position += buffer.byteLength;
          ctrl.enqueue(new Uint8Array(buffer));
          if (position === blob.size) {
            ctrl.close();
          }
        }
      });
    };
  }
} catch (error2) {
}
var POOL_SIZE = 65536;
async function* toIterator(parts, clone2 = true) {
  for (let part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        let end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
var _parts, _type, _size, _a;
var _Blob = (_a = class {
  constructor(blobParts = [], options2 = {}) {
    __privateAdd(this, _parts, []);
    __privateAdd(this, _type, "");
    __privateAdd(this, _size, 0);
    let size = 0;
    const parts = blobParts.map((element) => {
      let part;
      if (ArrayBuffer.isView(element)) {
        part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
      } else if (element instanceof ArrayBuffer) {
        part = new Uint8Array(element.slice(0));
      } else if (element instanceof _a) {
        part = element;
      } else {
        part = new TextEncoder().encode(element);
      }
      size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
      return part;
    });
    const type = options2.type === void 0 ? "" : String(options2.type);
    __privateSet(this, _type, /[^\u0020-\u007E]/.test(type) ? "" : type);
    __privateSet(this, _size, size);
    __privateSet(this, _parts, parts);
  }
  get size() {
    return __privateGet(this, _size);
  }
  get type() {
    return __privateGet(this, _type);
  }
  async text() {
    const decoder = new TextDecoder();
    let str = "";
    for await (let part of toIterator(__privateGet(this, _parts), false)) {
      str += decoder.decode(part, { stream: true });
    }
    str += decoder.decode();
    return str;
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of toIterator(__privateGet(this, _parts), false)) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    const it = toIterator(__privateGet(this, _parts), true);
    return new ReadableStream({
      type: "bytes",
      async pull(ctrl) {
        const chunk = await it.next();
        chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
      }
    });
  }
  slice(start = 0, end = this.size, type = "") {
    const { size } = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = __privateGet(this, _parts);
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      if (added >= span) {
        break;
      }
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        let chunk;
        if (ArrayBuffer.isView(part)) {
          chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
          added += chunk.byteLength;
        } else {
          chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
          added += chunk.size;
        }
        blobParts.push(chunk);
        relativeStart = 0;
      }
    }
    const blob = new _a([], { type: String(type).toLowerCase() });
    __privateSet(blob, _size, span);
    __privateSet(blob, _parts, blobParts);
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
}, _parts = new WeakMap(), _type = new WeakMap(), _size = new WeakMap(), _a);
Object.defineProperties(_Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var Blob = _Blob;
var Blob$1 = Blob;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => randomBytes(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof Stream)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = Stream.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof Stream) {
      body.on("error", (error_) => {
        const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
        this[INTERNALS$2].error = error2;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new Blob$1([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = Stream.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof Stream)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof Stream && typeof body.getBoundary !== "function") {
    p1 = new PassThrough({ highWaterMark });
    p2 = new PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof Stream) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request;
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2].boundary);
  }
  return null;
};
var writeToStream = (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    Stream.Readable.from(body.stream()).pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
var validateHeaderName = typeof http.validateHeaderName === "function" ? http.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const error2 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw error2;
  }
};
var validateHeaderValue = typeof http.validateHeaderValue === "function" ? http.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const error2 = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
    throw error2;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers) {
      const raw = init2.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback, thisArg = void 0) {
    for (const name of this.keys()) {
      Reflect.apply(callback, thisArg, [this.get(name), name, this]);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status != null ? options2.status : 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      type: "default",
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get type() {
    return this[INTERNALS$1].type;
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response(clone(this, this.highWaterMark), {
      type: this.type,
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  static error() {
    const response = new Response(null, { status: 0, statusText: "" });
    response[INTERNALS$1].type = "error";
    return response;
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response.prototype, {
  type: { enumerable: true },
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
};
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request = class extends Body {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal != null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
    }
    this[INTERNALS] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return format(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS];
  const headers = new Headers(request[INTERNALS].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
var AbortError = class extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch(url, options_) {
  return new Promise((resolve3, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve3(response2);
      return;
    }
    const send2 = (options2.protocol === "https:" ? https : http).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof Stream.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send2(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof Stream.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve3(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = pipeline(response_, new PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve3(response);
        return;
      }
      const zlibOptions = {
        flush: zlib.Z_SYNC_FLUSH,
        finishFlush: zlib.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = pipeline(body, zlib.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve3(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = pipeline(response_, new PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? pipeline(body, zlib.createInflate(), reject) : pipeline(body, zlib.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve3(response);
        });
        return;
      }
      if (codings === "br") {
        body = pipeline(body, zlib.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve3(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve3(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}

// node_modules/@sveltejs/adapter-node/files/shims.js
Object.defineProperty(globalThis, "require", {
  enumerable: true,
  value: createRequire(import.meta.url)
});

// .svelte-kit/output/server/app.js
import cookie from "cookie";
import { v4 } from "@lukeed/uuid";
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler(__spreadProps(__spreadValues({}, request), { params }));
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = __spreadProps(__spreadValues({}, headers), { "content-type": "application/json; charset=utf-8" });
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto2 = Object.getPrototypeOf(thing);
          if (proto2 !== Object.prototype && proto2 !== null && Object.getOwnPropertyNames(proto2).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto2 = Object.getPrototypeOf(thing);
        if (proto2 === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a2) {
            var k = _a2[0], v = _a2[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue$1 = [];
function writable$1(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue$1.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue$1.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue$1.length; i += 2) {
            subscriber_queue$1[i][0](subscriber_queue$1[i + 1]);
          }
          subscriber_queue$1.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
var escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable$1($session);
    const props = {
      stores: {
        page: writable$1(null),
        navigating: writable$1(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize(__spreadProps(__spreadValues({}, error2), { name, message, stack }));
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = __spreadValues({
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity
          }, opts);
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = __spreadValues({}, opts.headers);
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = __spreadProps(__spreadValues({}, opts.headers), {
                cookie: request.headers.cookie
              });
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: __spreadValues({}, stuff)
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node(__spreadProps(__spreadValues({}, opts), {
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            }));
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node(__spreadProps(__spreadValues({}, opts), {
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  }));
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = __spreadValues(__spreadValues({}, stuff), loaded.loaded.stuff);
        }
      }
    }
  try {
    return with_cookies(await render_response(__spreadProps(__spreadValues({}, opts), {
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    })), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error(__spreadProps(__spreadValues({}, opts), {
      status: 500,
      error: error3
    })), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd2(this, _map, void 0);
    __privateSet2(this, _map, map);
  }
  get(key) {
    const value = __privateGet2(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet2(this, _map).get(key);
  }
  has(key) {
    return __privateGet2(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet2(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet2(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet2(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet2(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = __spreadProps(__spreadValues({}, incoming), {
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  });
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k in props)
    if (!keys.has(k) && k[0] !== "$")
      rest[k] = props[k];
  return rest;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, classes_to_add) {
  const attributes = Object.assign({}, ...args);
  if (classes_to_add) {
    if (attributes.class == null) {
      attributes.class = classes_to_add;
    } else {
      attributes.class += " " + classes_to_add;
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function escape_attribute_value(value) {
  return typeof value === "string" ? escape(value) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$g = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$g);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths2) {
  base = paths2.base;
  assets = paths2.assets || base;
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve22 }) => {
  const cookies = cookie.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve22(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		<script src="https://kit.fontawesome.com/d71689699d.js" crossorigin="anonymous"><\/script>\n\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-953c55f3.js",
      css: [assets + "/_app/assets/start-61d1577b.css", assets + "/_app/assets/vendor-ed0e3a7a.css"],
      js: [assets + "/_app/start-953c55f3.js", assets + "/_app/chunks/vendor-475ceb10.js", assets + "/_app/chunks/preload-helper-ec9aa979.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: null,
    template,
    trailing_slash: "never"
  };
}
var d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
var empty = () => ({});
var manifest = {
  assets: [{ "file": "robots.txt", "size": 67, "type": "text/plain" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/credentials\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/credentials.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/community\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/community.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/exchanges\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/exchanges.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/datasets\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/datasets.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/([^/]+?)\/([^/]+?)\/?$/,
      params: (m) => ({ chain: d(m[1]), exchange: d(m[2]), pair: d(m[3]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[chain]/[exchange]/[pair]/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/([^/]+?)\/([^/]+?)\/([^/]+?)\/uPlotCandlestickCore\/?$/,
      params: (m) => ({ chain: d(m[1]), exchange: d(m[2]), pair: d(m[3]) }),
      load: () => Promise.resolve().then(function() {
        return uPlotCandlestickCore;
      })
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/([^/]+?)\/([^/]+?)\/TimeSpanPerformance\/?$/,
      params: (m) => ({ chain: d(m[1]), exchange: d(m[2]), pair: d(m[3]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[chain]/[exchange]/[pair]/TimeSpanPerformance.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/([^/]+?)\/([^/]+?)\/TimeBucketSelector\/?$/,
      params: (m) => ({ chain: d(m[1]), exchange: d(m[2]), pair: d(m[3]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/([^/]+?)\/([^/]+?)\/CandleStickChart\/?$/,
      params: (m) => ({ chain: d(m[1]), exchange: d(m[2]), pair: d(m[3]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[chain]/[exchange]/[pair]/CandleStickChart.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/([^/]+?)\/?$/,
      params: (m) => ({ chain: d(m[1]), exchange_id: d(m[2]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[chain]/[exchange_id].svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve22 }) => resolve22(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/credentials.svelte": () => Promise.resolve().then(function() {
    return credentials;
  }),
  "src/routes/community.svelte": () => Promise.resolve().then(function() {
    return community;
  }),
  "src/routes/exchanges.svelte": () => Promise.resolve().then(function() {
    return exchanges;
  }),
  "src/routes/datasets.svelte": () => Promise.resolve().then(function() {
    return datasets;
  }),
  "src/routes/[chain]/[exchange]/[pair]/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/[chain]/[exchange]/[pair]/TimeSpanPerformance.svelte": () => Promise.resolve().then(function() {
    return TimeSpanPerformance$1;
  }),
  "src/routes/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte": () => Promise.resolve().then(function() {
    return TimeBucketSelector$1;
  }),
  "src/routes/[chain]/[exchange]/[pair]/CandleStickChart.svelte": () => Promise.resolve().then(function() {
    return CandleStickChart$1;
  }),
  "src/routes/[chain]/[exchange_id].svelte": () => Promise.resolve().then(function() {
    return _exchange_id_;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-226e34af.js", "css": ["assets/pages/__layout.svelte-f37b428b.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/__layout.svelte-226e34af.js", "chunks/vendor-475ceb10.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-6ba4bd93.js", "css": ["assets/vendor-ed0e3a7a.css"], "js": ["error.svelte-6ba4bd93.js", "chunks/vendor-475ceb10.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-ce4278aa.js", "css": ["assets/pages/index.svelte-35bf674c.css", "assets/bodytext-d414b76c.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/index.svelte-ce4278aa.js", "chunks/vendor-475ceb10.js"], "styles": [] }, "src/routes/credentials.svelte": { "entry": "pages/credentials.svelte-15df8a3f.js", "css": ["assets/pages/credentials.svelte-d5dc9a01.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/credentials.svelte-15df8a3f.js", "chunks/vendor-475ceb10.js"], "styles": [] }, "src/routes/community.svelte": { "entry": "pages/community.svelte-5298fa5e.js", "css": ["assets/pages/community.svelte-f8e93417.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/community.svelte-5298fa5e.js", "chunks/vendor-475ceb10.js"], "styles": [] }, "src/routes/exchanges.svelte": { "entry": "pages/exchanges.svelte-b01feebc.js", "css": ["assets/pages/[chain]/[exchange_id].svelte-cf7aabf5.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/exchanges.svelte-b01feebc.js", "chunks/vendor-475ceb10.js", "chunks/env-a13806e5.js", "chunks/formatters-70d542d8.js"], "styles": [] }, "src/routes/datasets.svelte": { "entry": "pages/datasets.svelte-e0f2f19e.js", "css": ["assets/pages/datasets.svelte-795e328c.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/datasets.svelte-e0f2f19e.js", "chunks/vendor-475ceb10.js", "chunks/env-a13806e5.js"], "styles": [] }, "src/routes/[chain]/[exchange]/[pair]/index.svelte": { "entry": "pages/[chain]/[exchange]/[pair]/index.svelte-e9865b4c.js", "css": ["assets/pages/[chain]/[exchange]/[pair]/index.svelte-e020946a.css", "assets/bodytext-d414b76c.css", "assets/vendor-ed0e3a7a.css", "assets/TimeSpanPerformance-35e9079d.css", "assets/pages/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte-6cc0f805.css", "assets/pages/[chain]/[exchange]/[pair]/CandleStickChart.svelte-29161cd6.css"], "js": ["pages/[chain]/[exchange]/[pair]/index.svelte-e9865b4c.js", "chunks/vendor-475ceb10.js", "chunks/TimeSpanPerformance-96a57b47.js", "chunks/formatters-70d542d8.js", "pages/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte-61009378.js", "pages/[chain]/[exchange]/[pair]/CandleStickChart.svelte-b8816935.js", "chunks/preload-helper-ec9aa979.js"], "styles": [] }, "src/routes/[chain]/[exchange]/[pair]/TimeSpanPerformance.svelte": { "entry": "pages/[chain]/[exchange]/[pair]/TimeSpanPerformance.svelte-bc6d10b6.js", "css": ["assets/vendor-ed0e3a7a.css", "assets/TimeSpanPerformance-35e9079d.css"], "js": ["pages/[chain]/[exchange]/[pair]/TimeSpanPerformance.svelte-bc6d10b6.js", "chunks/vendor-475ceb10.js", "chunks/TimeSpanPerformance-96a57b47.js", "chunks/formatters-70d542d8.js"], "styles": [] }, "src/routes/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte": { "entry": "pages/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte-61009378.js", "css": ["assets/pages/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte-6cc0f805.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/[chain]/[exchange]/[pair]/TimeBucketSelector.svelte-61009378.js", "chunks/vendor-475ceb10.js"], "styles": [] }, "src/routes/[chain]/[exchange]/[pair]/CandleStickChart.svelte": { "entry": "pages/[chain]/[exchange]/[pair]/CandleStickChart.svelte-b8816935.js", "css": ["assets/pages/[chain]/[exchange]/[pair]/CandleStickChart.svelte-29161cd6.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/[chain]/[exchange]/[pair]/CandleStickChart.svelte-b8816935.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-475ceb10.js", "chunks/formatters-70d542d8.js"], "styles": [] }, "src/routes/[chain]/[exchange_id].svelte": { "entry": "pages/[chain]/[exchange_id].svelte-946e888e.js", "css": ["assets/pages/[chain]/[exchange_id].svelte-cf7aabf5.css", "assets/vendor-ed0e3a7a.css"], "js": ["pages/[chain]/[exchange_id].svelte-946e888e.js", "chunks/vendor-475ceb10.js", "chunks/formatters-70d542d8.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond(__spreadProps(__spreadValues({}, request), { host }), options, { prerender });
}
function formatNumber$1(n) {
  if (n <= 1e3) {
    return (n / 1e3).toLocaleString("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  } else {
    return (n / 1e3).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
function formatDollar(n, minFrag = 3, maxFrag = 3) {
  if (n === void 0) {
    return "---";
  }
  if (n >= 1e3 * 1e3 * 1e3) {
    return "$" + (n / (1e3 * 1e3 * 1e3)).toLocaleString("en", {
      minimumFractionDigits: minFrag,
      maximumFractionDigits: maxFrag
    }) + "B";
  } else if (n >= 1e3 * 1e3) {
    return "$" + (n / (1e3 * 1e3)).toLocaleString("en", {
      minimumFractionDigits: minFrag,
      maximumFractionDigits: maxFrag
    }) + "M";
  } else if (n >= 1e3) {
    return "$" + (n / 1e3).toLocaleString("en", {
      minimumFractionDigits: minFrag,
      maximumFractionDigits: maxFrag
    }) + "k";
  } else {
    return "$" + n.toLocaleString("en", {
      minimumFractionDigits: minFrag,
      maximumFractionDigits: maxFrag
    });
  }
}
function formatPriceChange(n) {
  return (n > 0 ? "+" : "") + (n * 100).toLocaleString("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + "%";
}
function formatAmount(n) {
  return n.toLocaleString("en");
}
function formatUnixTimestamp(ts) {
  const d2 = new Date(ts * 1e3);
  return d2.toUTCString();
}
var uPlot = null;
var resizeCallback = null;
function throttle(cb, limit) {
  var wait = false;
  return () => {
    if (!wait) {
      requestAnimationFrame(cb);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
}
function fmtUSD(val, dec) {
  return "$" + val.toFixed(dec).replace(/\d(?=(\d{3})+(?:\.|$))/g, "$&,");
}
function columnHighlightPlugin({ className, style = { backgroundColor: "rgba(51,204,255,0.3)" } } = {}) {
  let underEl, overEl, highlightEl, currIdx;
  function init2(u) {
    underEl = u.under;
    overEl = u.over;
    highlightEl = document.createElement("div");
    className && highlightEl.classList.add(className);
    uPlot.assign(highlightEl.style, __spreadValues({
      pointerEvents: "none",
      display: "none",
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%"
    }, style));
    underEl.appendChild(highlightEl);
    overEl.addEventListener("mouseenter", () => {
      highlightEl.style.display = null;
    });
    overEl.addEventListener("mouseleave", () => {
      highlightEl.style.display = "none";
    });
  }
  function update(u) {
    if (currIdx !== u.cursor.idx) {
      currIdx = u.cursor.idx;
      let [iMin, iMax] = u.series[0].idxs;
      const dx = iMax - iMin;
      const width = u.bbox.width / dx / devicePixelRatio;
      const xVal = u.scales.x.distr == 2 ? currIdx : u.data[0][currIdx];
      const left = u.valToPos(xVal, "x") - width / 2;
      highlightEl.style.transform = "translateX(" + Math.round(left) + "px)";
      highlightEl.style.width = Math.round(width) + "px";
    }
  }
  return {
    opts: (u, opts) => {
      uPlot.assign(opts, {
        cursor: {
          x: false,
          y: false
        }
      });
    },
    hooks: {
      init: init2,
      setCursor: update
    }
  };
}
function legendAsTooltipPlugin({ className, style = { backgroundColor: "rgba(255, 249, 196, 0.92)", color: "black" } } = {}) {
  let legendEl;
  function init2(u, opts) {
    legendEl = u.root.querySelector(".u-legend");
    legendEl.classList.remove("u-inline");
    className && legendEl.classList.add(className);
    uPlot.assign(legendEl.style, __spreadValues({
      textAlign: "left",
      pointerEvents: "none",
      display: "none",
      position: "absolute",
      left: 0,
      top: 0,
      zIndex: 100,
      boxShadow: "2px 2px 10px rgba(0,0,0,0.5)"
    }, style));
    const idents = legendEl.querySelectorAll(".u-marker");
    for (let i = 0; i < idents.length; i++)
      idents[i].style.display = "none";
    const overEl = u.over;
    overEl.style.overflow = "visible";
    overEl.appendChild(legendEl);
    overEl.addEventListener("mouseenter", () => {
      legendEl.style.display = null;
    });
    overEl.addEventListener("mouseleave", () => {
      legendEl.style.display = "none";
    });
  }
  function update(u) {
    const { left, top } = u.cursor;
    legendEl.style.transform = "translate(" + left + "px, " + top + "px)";
  }
  return {
    hooks: {
      init: init2,
      setCursor: update
    }
  };
}
function candlestickPlugin() {
  const gap = 2;
  const shadowColor = "#000000";
  const bearishColor = "#cc0000";
  const bullishColor = "#458b00";
  const volumeBearishColor = "#bea6a0";
  const volumeBullishColor = "#a6ae9d";
  const bodyMaxWidth = 20;
  const shadowWidth = 2;
  const bodyOutline = 1;
  function drawCandles(u) {
    u.ctx.save();
    const offset = shadowWidth % 2 / 2;
    u.ctx.translate(offset, offset);
    let [iMin, iMax] = u.series[0].idxs;
    let vol0AsY = u.valToPos(0, "vol", true);
    for (let i = iMin; i <= iMax; i++) {
      let xVal = u.scales.x.distr == 2 ? i : u.data[0][i];
      let open = u.data[1][i];
      let high = u.data[2][i];
      let low = u.data[3][i];
      let close = u.data[4][i];
      let vol = u.data[5][i];
      let timeAsX = u.valToPos(xVal, "x", true);
      let lowAsY = u.valToPos(low, "y", true);
      let highAsY = u.valToPos(high, "y", true);
      let openAsY = u.valToPos(open, "y", true);
      let closeAsY = u.valToPos(close, "y", true);
      let volAsY = u.valToPos(vol, "vol", true);
      let shadowHeight = Math.max(highAsY, lowAsY) - Math.min(highAsY, lowAsY);
      let shadowX = timeAsX - shadowWidth / 2;
      let shadowY = Math.min(highAsY, lowAsY);
      u.ctx.fillStyle = shadowColor;
      u.ctx.fillRect(Math.round(shadowX), Math.round(shadowY), Math.round(shadowWidth), Math.round(shadowHeight));
      let columnWidth = u.bbox.width / (iMax - iMin);
      let bodyWidth = Math.min(bodyMaxWidth, columnWidth - gap);
      let bodyHeight = Math.max(closeAsY, openAsY) - Math.min(closeAsY, openAsY);
      let bodyX = timeAsX - bodyWidth / 2;
      let bodyY = Math.min(closeAsY, openAsY);
      let bodyColor = open > close ? bearishColor : bullishColor;
      u.ctx.fillStyle = shadowColor;
      u.ctx.fillRect(Math.round(bodyX), Math.round(bodyY), Math.round(bodyWidth), Math.round(bodyHeight));
      u.ctx.fillStyle = bodyColor;
      u.ctx.fillRect(Math.round(bodyX + bodyOutline), Math.round(bodyY + bodyOutline), Math.round(bodyWidth - bodyOutline * 2), Math.round(bodyHeight - bodyOutline * 2));
      const volumeColour = open > close ? volumeBearishColor : volumeBullishColor;
      u.ctx.fillStyle = volumeColour;
      u.ctx.fillRect(Math.round(bodyX), Math.round(volAsY), Math.round(bodyWidth), Math.round(vol0AsY - volAsY));
    }
    u.ctx.translate(-offset, -offset);
    u.ctx.restore();
  }
  return {
    opts: (u, opts) => {
      uPlot.assign(opts, {
        cursor: {
          points: {
            show: false
          }
        }
      });
      opts.series.forEach((series) => {
        series.paths = () => null;
        series.points = { show: false };
      });
    },
    hooks: {
      draw: drawCandles
    }
  };
}
function clearChart(elem) {
  const children = elem.querySelectorAll(".uplot");
  children.forEach(function(child) {
    elem.removeChild(child);
  });
  if (resizeCallback) {
    window.removeEventListener("resize", resizeCallback);
    resizeCallback = null;
  }
}
function drawCandleStickChart(_uPlot, title, elem, data) {
  console.log("Starting drawCandleStickChart", title);
  uPlot = _uPlot;
  clearChart(elem);
  let maxVol = Math.max.apply(null, data[5]);
  uPlot.fmtDate("{YYYY}-{MM}-{DD}");
  const tzDate = (ts) => uPlot.tzDate(new Date(ts * 1e3), "Etc/UTC");
  function getSize() {
    return {
      width: elem.offsetWidth,
      height: elem.offsetHeight
    };
  }
  const size = getSize();
  const largeScreen = size.width > 900;
  let axes;
  if (largeScreen) {
    axes = [
      {},
      {
        label: "Price",
        space: 40,
        size: 60,
        gap: 0,
        values: (u2, vals) => vals.map((v) => fmtUSD(v, 0))
      },
      {
        label: "Volume",
        side: 1,
        space: 40,
        size: 80,
        scale: "vol",
        grid: { show: false },
        values: (u2, vals) => vals.map((v) => formatDollar(v, 1, 1))
      }
    ];
  } else {
    axes = [
      {},
      {
        space: 40,
        size: 40,
        gap: 0,
        values: (u2, vals) => vals.map((v) => fmtUSD(v, 0))
      },
      {
        side: 1,
        space: 40,
        size: 40,
        scale: "vol",
        grid: { show: false }
      }
    ];
  }
  const opts = __spreadProps(__spreadValues({}, size), {
    title,
    tzDate,
    plugins: [
      columnHighlightPlugin(),
      legendAsTooltipPlugin(),
      candlestickPlugin()
    ],
    scales: {
      x: {
        distr: 2
      },
      vol: {
        range: [0, maxVol * 3]
      }
    },
    series: [
      {
        label: "Time",
        value: (u2, ts) => formatUnixTimestamp(ts)
      },
      {
        label: "Open",
        value: (u2, v) => fmtUSD(v, 2)
      },
      {
        label: "High",
        value: (u2, v) => fmtUSD(v, 2)
      },
      {
        label: "Low",
        value: (u2, v) => fmtUSD(v, 2)
      },
      {
        label: "Close",
        value: (u2, v) => fmtUSD(v, 2)
      },
      {
        label: "Volume",
        scale: "vol",
        value: (u2, v) => formatDollar(v)
      }
    ],
    axes
  });
  let u = new uPlot(opts, data, elem);
  resizeCallback = throttle(() => u.setSize(getSize()), 100);
  window.addEventListener("resize", resizeCallback);
}
var uPlotCandlestickCore = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  clearChart,
  drawCandleStickChart
});
function toClassName$1(value) {
  let result = "";
  if (typeof value === "string" || typeof value === "number") {
    result += value;
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      result = value.map(toClassName$1).filter(Boolean).join(" ");
    } else {
      for (let key in value) {
        if (value[key]) {
          result && (result += " ");
          result += key;
        }
      }
    }
  }
  return result;
}
function classnames$1(...args) {
  return args.map(toClassName$1).filter(Boolean).join(" ");
}
var Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let classes;
  let defaultAriaLabel;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "active",
    "block",
    "children",
    "close",
    "color",
    "disabled",
    "href",
    "outline",
    "size",
    "style",
    "value"
  ]);
  let { class: className = "" } = $$props;
  let { active = false } = $$props;
  let { block = false } = $$props;
  let { children = void 0 } = $$props;
  let { close = false } = $$props;
  let { color = "secondary" } = $$props;
  let { disabled = false } = $$props;
  let { href = "" } = $$props;
  let { outline = false } = $$props;
  let { size = null } = $$props;
  let { style = "" } = $$props;
  let { value = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.block === void 0 && $$bindings.block && block !== void 0)
    $$bindings.block(block);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  if ($$props.close === void 0 && $$bindings.close && close !== void 0)
    $$bindings.close(close);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.outline === void 0 && $$bindings.outline && outline !== void 0)
    $$bindings.outline(outline);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  ariaLabel = $$props["aria-label"];
  classes = classnames$1(className, { close }, close || "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "btn-block" : false, { active });
  defaultAriaLabel = close ? "Close" : null;
  return `${href ? `<a${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { disabled: disabled || null },
    { href: escape_attribute_value(href) },
    {
      "aria-label": escape_attribute_value(ariaLabel || defaultAriaLabel)
    },
    { style: escape_attribute_value(style) }
  ])}>${children ? `${escape(children)}` : `${slots.default ? slots.default({}) : ``}`}</a>` : `<button${spread([
    escape_object($$restProps),
    { class: escape_attribute_value(classes) },
    { disabled: disabled || null },
    { value: escape_attribute_value(value) },
    {
      "aria-label": escape_attribute_value(ariaLabel || defaultAriaLabel)
    },
    { style: escape_attribute_value(style) }
  ])}>${slots.default ? slots.default({}) : `
      ${close ? `<span aria-hidden="${"true"}">\xD7</span>` : `${children ? `${escape(children)}` : `${slots.default ? slots.default({}) : ``}`}`}
    `}</button>`}`;
});
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
var createContext = () => writable({});
var Dropdown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let subItemIsActive;
  let classes;
  let handleToggle;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "active",
    "addonType",
    "direction",
    "dropup",
    "group",
    "inNavbar",
    "isOpen",
    "nav",
    "setActiveFromChild",
    "size",
    "toggle"
  ]);
  let context = createContext();
  setContext("dropdownContext", context);
  let { class: className = "" } = $$props;
  let { active = false } = $$props;
  let { addonType = false } = $$props;
  let { direction = "down" } = $$props;
  let { dropup = false } = $$props;
  let { group = false } = $$props;
  let { inNavbar = false } = $$props;
  let { isOpen = false } = $$props;
  let { nav = false } = $$props;
  let { setActiveFromChild = false } = $$props;
  let { size = "" } = $$props;
  let { toggle = void 0 } = $$props;
  const validDirections = ["up", "down", "left", "right"];
  if (validDirections.indexOf(direction) === -1) {
    throw new Error(`Invalid direction sent: '${direction}' is not one of 'up', 'down', 'left', 'right'`);
  }
  let component;
  function handleDocumentClick(e) {
    if (e && (e.which === 3 || e.type === "keyup" && e.which !== 9))
      return;
    if (component.contains(e.target) && component !== e.target && (e.type !== "keyup" || e.which === 9)) {
      return;
    }
    handleToggle(e);
  }
  onDestroy(() => {
    if (typeof document !== "undefined") {
      ["click", "touchstart", "keyup"].forEach((event) => document.removeEventListener(event, handleDocumentClick, true));
    }
  });
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.addonType === void 0 && $$bindings.addonType && addonType !== void 0)
    $$bindings.addonType(addonType);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0)
    $$bindings.direction(direction);
  if ($$props.dropup === void 0 && $$bindings.dropup && dropup !== void 0)
    $$bindings.dropup(dropup);
  if ($$props.group === void 0 && $$bindings.group && group !== void 0)
    $$bindings.group(group);
  if ($$props.inNavbar === void 0 && $$bindings.inNavbar && inNavbar !== void 0)
    $$bindings.inNavbar(inNavbar);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.nav === void 0 && $$bindings.nav && nav !== void 0)
    $$bindings.nav(nav);
  if ($$props.setActiveFromChild === void 0 && $$bindings.setActiveFromChild && setActiveFromChild !== void 0)
    $$bindings.setActiveFromChild(setActiveFromChild);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle !== void 0)
    $$bindings.toggle(toggle);
  subItemIsActive = !!(setActiveFromChild && component && typeof component.querySelector === "function" && component.querySelector(".active"));
  handleToggle = toggle || (() => isOpen = !isOpen);
  classes = classnames$1("d-inline-flex", className, direction !== "down" && `drop${direction}`, nav && active ? "active" : false, setActiveFromChild && subItemIsActive ? "active" : false, {
    [`input-group-${addonType}`]: addonType,
    "btn-group": group,
    [`btn-group-${size}`]: !!size,
    dropdown: !group && !addonType,
    show: isOpen,
    "nav-item": nav
  });
  {
    {
      if (typeof document !== "undefined") {
        if (isOpen) {
          ["click", "touchstart", "keyup"].forEach((event) => document.addEventListener(event, handleDocumentClick, true));
        } else {
          ["click", "touchstart", "keyup"].forEach((event) => document.removeEventListener(event, handleDocumentClick, true));
        }
      }
    }
  }
  {
    {
      context.update(() => {
        return {
          toggle: handleToggle,
          isOpen,
          direction: direction === "down" && dropup ? "up" : direction,
          inNavbar
        };
      });
    }
  }
  return `${nav ? `<li${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}${add_attribute("this", component, 0)}>${slots.default ? slots.default({}) : ``}</li>` : `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}${add_attribute("this", component, 0)}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
var DropdownItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "active", "disabled", "divider", "header", "toggle", "href"]);
  let $$unsubscribe_context;
  const context = getContext("dropdownContext");
  $$unsubscribe_context = subscribe(context, (value) => value);
  let { class: className = "" } = $$props;
  let { active = false } = $$props;
  let { disabled = false } = $$props;
  let { divider = false } = $$props;
  let { header = false } = $$props;
  let { toggle = true } = $$props;
  let { href = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.divider === void 0 && $$bindings.divider && divider !== void 0)
    $$bindings.divider(divider);
  if ($$props.header === void 0 && $$bindings.header && header !== void 0)
    $$bindings.header(header);
  if ($$props.toggle === void 0 && $$bindings.toggle && toggle !== void 0)
    $$bindings.toggle(toggle);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  classes = classnames$1(className, {
    disabled,
    "dropdown-item": !divider && !header,
    active,
    "dropdown-header": header,
    "dropdown-divider": divider
  });
  $$unsubscribe_context();
  return `${header ? `<h6${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</h6>` : `${divider ? `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>` : `${href ? `<a${spread([
    escape_object($$restProps),
    { click: true },
    { href: escape_attribute_value(href) },
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : ``}</a>` : `<button${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</button>`}`}`}`;
});
var DropdownMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "right"]);
  let $context, $$unsubscribe_context;
  const context = getContext("dropdownContext");
  $$unsubscribe_context = subscribe(context, (value) => $context = value);
  let { class: className = "" } = $$props;
  let { right = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.right === void 0 && $$bindings.right && right !== void 0)
    $$bindings.right(right);
  classes = classnames$1(className, "dropdown-menu", {
    "dropdown-menu-right": right,
    show: $context.isOpen
  });
  $$unsubscribe_context();
  return `<div${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});
var DropdownToggle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "caret",
    "color",
    "disabled",
    "ariaHaspopup",
    "ariaLabel",
    "split",
    "nav",
    "size",
    "tag",
    "outline"
  ]);
  let $$unsubscribe_context;
  const context = getContext("dropdownContext");
  $$unsubscribe_context = subscribe(context, (value) => value);
  let { class: className = "" } = $$props;
  let { caret = false } = $$props;
  let { color = "secondary" } = $$props;
  let { disabled = false } = $$props;
  let { ariaHaspopup = true } = $$props;
  let { ariaLabel = "Toggle Dropdown" } = $$props;
  let { split = false } = $$props;
  let { nav = false } = $$props;
  let { size = "" } = $$props;
  let { tag = null } = $$props;
  let { outline = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.caret === void 0 && $$bindings.caret && caret !== void 0)
    $$bindings.caret(caret);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.ariaHaspopup === void 0 && $$bindings.ariaHaspopup && ariaHaspopup !== void 0)
    $$bindings.ariaHaspopup(ariaHaspopup);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.split === void 0 && $$bindings.split && split !== void 0)
    $$bindings.split(split);
  if ($$props.nav === void 0 && $$bindings.nav && nav !== void 0)
    $$bindings.nav(nav);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  if ($$props.outline === void 0 && $$bindings.outline && outline !== void 0)
    $$bindings.outline(outline);
  classes = classnames$1(className, {
    "dropdown-toggle": caret || split,
    "dropdown-toggle-split": split,
    "nav-link": nav
  });
  $$unsubscribe_context();
  return `${nav ? `<a${spread([
    escape_object($$restProps),
    { href: "#nav" },
    {
      ariahaspopup: escape_attribute_value(ariaHaspopup)
    },
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : `
      <span class="${"sr-only"}">${escape(ariaLabel)}</span>
    `}</a>` : `${tag === "span" ? `<span${spread([
    escape_object($$restProps),
    {
      ariahaspopup: escape_attribute_value(ariaHaspopup)
    },
    { class: escape_attribute_value(classes) },
    { color: escape_attribute_value(color) },
    { size: escape_attribute_value(size) }
  ])}>${slots.default ? slots.default({}) : `
      <span class="${"sr-only"}">${escape(ariaLabel)}</span>
    `}</span>` : `${validate_component(Button, "Button").$$render($$result, Object.assign($$restProps, { ariaHaspopup }, { class: classes }, { color }, { size }, { outline }), {}, {
    default: () => `${slots.default ? slots.default({}) : `
      <span class="${"sr-only"}">${escape(ariaLabel)}</span>
    `}`
  })}`}`}`;
});
function getVerticalClass(vertical) {
  if (vertical === false) {
    return false;
  } else if (vertical === true || vertical === "xs") {
    return "flex-column";
  }
  return `flex-${vertical}-column`;
}
var Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, [
    "class",
    "tabs",
    "pills",
    "vertical",
    "horizontal",
    "justified",
    "fill",
    "navbar",
    "card"
  ]);
  let { class: className = "" } = $$props;
  let { tabs = false } = $$props;
  let { pills = false } = $$props;
  let { vertical = false } = $$props;
  let { horizontal = "" } = $$props;
  let { justified = false } = $$props;
  let { fill = false } = $$props;
  let { navbar = false } = $$props;
  let { card = false } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.tabs === void 0 && $$bindings.tabs && tabs !== void 0)
    $$bindings.tabs(tabs);
  if ($$props.pills === void 0 && $$bindings.pills && pills !== void 0)
    $$bindings.pills(pills);
  if ($$props.vertical === void 0 && $$bindings.vertical && vertical !== void 0)
    $$bindings.vertical(vertical);
  if ($$props.horizontal === void 0 && $$bindings.horizontal && horizontal !== void 0)
    $$bindings.horizontal(horizontal);
  if ($$props.justified === void 0 && $$bindings.justified && justified !== void 0)
    $$bindings.justified(justified);
  if ($$props.fill === void 0 && $$bindings.fill && fill !== void 0)
    $$bindings.fill(fill);
  if ($$props.navbar === void 0 && $$bindings.navbar && navbar !== void 0)
    $$bindings.navbar(navbar);
  if ($$props.card === void 0 && $$bindings.card && card !== void 0)
    $$bindings.card(card);
  classes = classnames$1(className, navbar ? "navbar-nav" : "nav", horizontal ? `justify-content-${horizontal}` : false, getVerticalClass(vertical), {
    "nav-tabs": tabs,
    "card-header-tabs": card && tabs,
    "nav-pills": pills,
    "card-header-pills": card && pills,
    "nav-justified": justified,
    "nav-fill": fill
  });
  return `<ul${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</ul>`;
});
function getExpandClass(expand) {
  if (expand === false) {
    return false;
  } else if (expand === true || expand === "xs") {
    return "navbar-expand";
  }
  return `navbar-expand-${expand}`;
}
var Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class", "light", "dark", "fixed", "sticky", "color", "expand"]);
  let { class: className = "" } = $$props;
  let { light = false } = $$props;
  let { dark = false } = $$props;
  let { fixed = "" } = $$props;
  let { sticky = "" } = $$props;
  let { color = "" } = $$props;
  let { expand = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.dark === void 0 && $$bindings.dark && dark !== void 0)
    $$bindings.dark(dark);
  if ($$props.fixed === void 0 && $$bindings.fixed && fixed !== void 0)
    $$bindings.fixed(fixed);
  if ($$props.sticky === void 0 && $$bindings.sticky && sticky !== void 0)
    $$bindings.sticky(sticky);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.expand === void 0 && $$bindings.expand && expand !== void 0)
    $$bindings.expand(expand);
  classes = classnames$1(className, "navbar", getExpandClass(expand), {
    "navbar-light": light,
    "navbar-dark": dark,
    [`bg-${color}`]: color,
    [`fixed-${fixed}`]: fixed,
    [`sticky-${sticky}`]: sticky
  });
  return `<nav${spread([escape_object($$restProps), { class: escape_attribute_value(classes) }])}>${slots.default ? slots.default({}) : ``}</nav>`;
});
var NavbarToggler = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  classes = classnames$1(className, "navbar-toggler");
  return `${validate_component(Button, "Button").$$render($$result, Object.assign($$restProps, { class: classes }), {}, {
    default: () => `${slots.default ? slots.default({}) : `
    <span class="${"navbar-toggler-icon"}"></span>
  `}`
  })}`;
});
function toClassName(value) {
  let result = "";
  if (typeof value === "string" || typeof value === "number") {
    result += value;
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      result = value.map(toClassName).filter(Boolean).join(" ");
    } else {
      for (let key in value) {
        if (value[key]) {
          result && (result += " ");
          result += key;
        }
      }
    }
  }
  return result;
}
function classnames(...args) {
  return args.map(toClassName).filter(Boolean).join(" ");
}
var HorribleCollapse = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classes;
  let $$restProps = compute_rest_props($$props, [
    "isOpen",
    "class",
    "navbar",
    "onEntering",
    "onEntered",
    "onExiting",
    "onExited",
    "expand",
    "toggler"
  ]);
  const noop22 = () => void 0;
  let { isOpen = true } = $$props;
  let { class: className = "" } = $$props;
  let { navbar = true } = $$props;
  let { onEntering = noop22 } = $$props;
  let { onEntered = noop22 } = $$props;
  let { onExiting = noop22 } = $$props;
  let { onExited = noop22 } = $$props;
  let { expand = "md" } = $$props;
  let { toggler = null } = $$props;
  let windowWidth = 0;
  let _wasMaximized = false;
  const minWidth = {};
  minWidth["xs"] = 0;
  minWidth["sm"] = 576;
  minWidth["md"] = 768;
  minWidth["lg"] = 992;
  minWidth["xl"] = 1200;
  const dispatch = createEventDispatcher();
  function notify() {
    console.log("Notify", isOpen);
    dispatch("update", { isOpen });
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.navbar === void 0 && $$bindings.navbar && navbar !== void 0)
    $$bindings.navbar(navbar);
  if ($$props.onEntering === void 0 && $$bindings.onEntering && onEntering !== void 0)
    $$bindings.onEntering(onEntering);
  if ($$props.onEntered === void 0 && $$bindings.onEntered && onEntered !== void 0)
    $$bindings.onEntered(onEntered);
  if ($$props.onExiting === void 0 && $$bindings.onExiting && onExiting !== void 0)
    $$bindings.onExiting(onExiting);
  if ($$props.onExited === void 0 && $$bindings.onExited && onExited !== void 0)
    $$bindings.onExited(onExited);
  if ($$props.expand === void 0 && $$bindings.expand && expand !== void 0)
    $$bindings.expand(expand);
  if ($$props.toggler === void 0 && $$bindings.toggler && toggler !== void 0)
    $$bindings.toggler(toggler);
  classes = classnames(className, navbar && "navbar-collapse");
  {
    if (navbar && expand) {
      console.log("Expand", expand);
      if (windowWidth >= minWidth[expand] && !isOpen) {
        isOpen = true;
        _wasMaximized = true;
        notify();
      } else if (windowWidth < minWidth[expand] && _wasMaximized) {
        isOpen = false;
        _wasMaximized = false;
        notify();
      }
    }
  }
  return `

${isOpen ? `<div${spread([
    {
      style: escape_attribute_value(navbar ? void 0 : "overflow: hidden;")
    },
    escape_object($$restProps),
    { class: escape_attribute_value(classes) }
  ])}>${slots.default ? slots.default({}) : ``}</div>` : ``}`;
});
var logo = "/_app/assets/logo-web-beta-0277ede1.svg";
var logoMobile = "/_app/assets/logo-two-lines-e75c034a.png";
var css$f = {
  code: ".img-logo.svelte-1vdcc0o{height:36px}.img-logo-mobile.svelte-1vdcc0o{display:none;max-width:200px}@media(max-width: 960px){.img-logo-mobile.svelte-1vdcc0o{display:block }.img-logo-desktop.svelte-1vdcc0o{display:none }}.hacky-navbar.svelte-1vdcc0o .navbar{background-color:#FFF1E5 !important}.hacky-navbar.svelte-1vdcc0o .nav-link{transition:none}.hacky-navbar.svelte-1vdcc0o .navbar-toggler{z-index:2000;background-color:#FFF1E5}@media(max-width: 960px){.hacky-navbar.svelte-1vdcc0o .navbar-collapse.opened{background-color:#FFF1E5;padding-top:40px}.hacky-navbar.svelte-1vdcc0o .nav-link-arrow{display:none}}.hacky-navbar.svelte-1vdcc0o .d-inline-flex{display:block !important}",
  map: `{"version":3,"file":"Navbar.svelte","sources":["Navbar.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { Navbar, NavbarToggler, Nav, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'sveltestrap';\\nimport HorribleCollapse from \\"./HorribleCollapse.svelte\\";\\nimport logo from '../../lib/assets/logo-web-beta.svg';\\nimport logoMobile from '../../lib/assets/logo-two-lines.png';\\nlet isOpen = false;\\nfunction handleUpdate(event) {\\n    isOpen = event.detail.isOpen;\\n}\\n<\/script>\\n\\n<!--\\n<div class=\\"container\\">\\n    <Navbar color=\\"light\\" light expand=\\"md\\">\\n      <NavbarBrand href=\\"/\\">sveltestrap</NavbarBrand>\\n      <NavbarToggler on:click={() => (isOpen = !isOpen)} />\\n      <Collapse {isOpen} navbar expand=\\"md\\" on:update={handleUpdate}>\\n        <Nav class=\\"ml-auto\\" navbar>\\n          <NavItem>\\n            <NavLink href=\\"#components/\\">Components</NavLink>\\n          </NavItem>\\n          <NavItem>\\n            <NavLink href=\\"https://github.com/bestguy/sveltestrap\\">GitHub</NavLink>\\n          </NavItem>\\n          <Dropdown nav inNavbar>\\n            <DropdownToggle nav caret>Options</DropdownToggle>\\n            <DropdownMenu right>\\n              <DropdownItem>Option 1</DropdownItem>\\n              <DropdownItem>Option 2</DropdownItem>\\n              <DropdownItem divider />\\n              <DropdownItem>Reset</DropdownItem>\\n            </DropdownMenu>\\n          </Dropdown>\\n        </Nav>\\n      </Collapse>\\n    </Navbar>\\n</div> -->\\n\\n<div class=\\"container hacky-navbar\\">\\n    <Navbar color=\\"light\\" light expand=\\"md\\">\\n      <a class=\\"navbar-brand\\" href=\\"/\\">\\n        <img class=\\"img-logo img-logo-desktop\\" src={logo} alt=\\"On-chain quantitative finance\\" />\\n        <img class=\\"img-logo img-logo-mobile\\" src={logoMobile} alt=\\"On-chain quantitative finance\\" />\\n      </a>\\n      <NavbarToggler on:click={() => (isOpen = !isOpen)} />\\n      <HorribleCollapse {isOpen} class={isOpen ? \\"opened\\" : \\"closed\\"} navbar expand=\\"md\\" on:update={handleUpdate}>\\n        <Nav class=\\"ms-auto\\" navbar>\\n\\n          <Dropdown nav inNavbar>\\n            <DropdownToggle nav caret>Market data <span class=\\"fas fa-angle-down nav-link-arrow ml-2\\"></span></DropdownToggle>\\n            <DropdownMenu end>\\n              <DropdownItem disabled>Blockchains <span class=\\"badge text-uppercase\\">Soon</span></DropdownItem>\\n              <DropdownItem disabled>Exchanges <span class=\\"badge text-uppercase\\">Soon</span></DropdownItem>\\n              <DropdownItem disabled>Trading pairs <span class=\\"badge text-uppercase\\">Soon</span></DropdownItem>\\n              <DropdownItem divider />\\n              <DropdownItem href=\\"/datasets\\">Backtesting</DropdownItem>\\n            </DropdownMenu>\\n          </Dropdown>\\n\\n          <Dropdown nav inNavbar>\\n            <DropdownToggle nav caret>Options</DropdownToggle>\\n            <DropdownMenu end>\\n              <DropdownItem>Option 1</DropdownItem>\\n              <DropdownItem>Option 2</DropdownItem>\\n              <DropdownItem divider />\\n              <DropdownItem>Reset</DropdownItem>\\n            </DropdownMenu>\\n          </Dropdown>\\n        </Nav>\\n      </HorribleCollapse>\\n    </Navbar>\\n</div>\\n\\n\\n<style>\\n\\n    /* Fix left aligment issues */\\n    .navbar {\\n      padding: 5px;\\n    }\\n\\n    .img-logo {\\n        height: 36px;\\n    }\\n\\n    .img-logo-mobile {\\n      display: none;\\n      max-width: 200px;\\n    }\\n\\n    .dropdown-menu.disabled {\\n        color: #aaa;\\n        cursor: not-allowed;\\n    }\\n\\n\\t/* Switch logos */\\n\\t@media (max-width: 960px) {\\n      .img-logo-mobile { display: block }\\n      .img-logo-desktop { display: none }\\n\\t}\\n\\n    .hacky-navbar :global(.navbar) {\\n      background-color: #FFF1E5 !important;\\n    }\\n\\n    .hacky-navbar :global(.nav-link) {\\n      transition: none;\\n    }\\n\\n    .hacky-navbar :global(.navbar-toggler) {\\n      z-index: 2000;\\n      background-color: #FFF1E5;\\n    }\\n\\n    @media (max-width: 960px) {\\n      .hacky-navbar :global(.navbar-collapse.opened) {\\n        background-color: #FFF1E5;\\n        padding-top: 40px;\\n      }\\n\\n      .hacky-navbar :global(.nav-link-arrow) {\\n        display: none;\\n      }\\n    }\\n\\n    .hacky-navbar :global(.d-inline-flex) {\\n      display: block !important;\\n    }\\n</style>\\n"],"names":[],"mappings":"AAgFI,SAAS,eAAC,CAAC,AACP,MAAM,CAAE,IAAI,AAChB,CAAC,AAED,gBAAgB,eAAC,CAAC,AAChB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,KAAK,AAClB,CAAC,AAQJ,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACtB,gBAAgB,eAAC,CAAC,AAAC,OAAO,CAAE,KAAK,CAAC,CAAC,AACnC,iBAAiB,eAAC,CAAC,AAAC,OAAO,CAAE,IAAI,CAAC,CAAC,AACxC,CAAC,AAEE,4BAAa,CAAC,AAAQ,OAAO,AAAE,CAAC,AAC9B,gBAAgB,CAAE,OAAO,CAAC,UAAU,AACtC,CAAC,AAED,4BAAa,CAAC,AAAQ,SAAS,AAAE,CAAC,AAChC,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,4BAAa,CAAC,AAAQ,eAAe,AAAE,CAAC,AACtC,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,4BAAa,CAAC,AAAQ,uBAAuB,AAAE,CAAC,AAC9C,gBAAgB,CAAE,OAAO,CACzB,WAAW,CAAE,IAAI,AACnB,CAAC,AAED,4BAAa,CAAC,AAAQ,eAAe,AAAE,CAAC,AACtC,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AAED,4BAAa,CAAC,AAAQ,cAAc,AAAE,CAAC,AACrC,OAAO,CAAE,KAAK,CAAC,UAAU,AAC3B,CAAC"}`
};
var Navbar_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isOpen = false;
  $$result.css.add(css$f);
  return `

<div class="${"container hacky-navbar svelte-1vdcc0o"}">${validate_component(Navbar, "Navbar").$$render($$result, {
    color: "light",
    light: true,
    expand: "md"
  }, {}, {
    default: () => `<a class="${"navbar-brand"}" href="${"/"}"><img class="${"img-logo img-logo-desktop svelte-1vdcc0o"}"${add_attribute("src", logo, 0)} alt="${"On-chain quantitative finance"}">
        <img class="${"img-logo img-logo-mobile svelte-1vdcc0o"}"${add_attribute("src", logoMobile, 0)} alt="${"On-chain quantitative finance"}"></a>
      ${validate_component(NavbarToggler, "NavbarToggler").$$render($$result, {}, {}, {})}
      ${validate_component(HorribleCollapse, "HorribleCollapse").$$render($$result, {
      isOpen,
      class: "closed",
      navbar: true,
      expand: "md"
    }, {}, {
      default: () => `${validate_component(Nav, "Nav").$$render($$result, { class: "ms-auto", navbar: true }, {}, {
        default: () => `${validate_component(Dropdown, "Dropdown").$$render($$result, { nav: true, inNavbar: true }, {}, {
          default: () => `${validate_component(DropdownToggle, "DropdownToggle").$$render($$result, { nav: true, caret: true }, {}, {
            default: () => `Market data <span class="${"fas fa-angle-down nav-link-arrow ml-2"}"></span>`
          })}
            ${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, { end: true }, {}, {
            default: () => `${validate_component(DropdownItem, "DropdownItem").$$render($$result, { disabled: true }, {}, {
              default: () => `Blockchains <span class="${"badge text-uppercase"}">Soon</span>`
            })}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, { disabled: true }, {}, {
              default: () => `Exchanges <span class="${"badge text-uppercase"}">Soon</span>`
            })}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, { disabled: true }, {}, {
              default: () => `Trading pairs <span class="${"badge text-uppercase"}">Soon</span>`
            })}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, { divider: true }, {}, {})}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, { href: "/datasets" }, {}, { default: () => `Backtesting` })}`
          })}`
        })}

          ${validate_component(Dropdown, "Dropdown").$$render($$result, { nav: true, inNavbar: true }, {}, {
          default: () => `${validate_component(DropdownToggle, "DropdownToggle").$$render($$result, { nav: true, caret: true }, {}, { default: () => `Options` })}
            ${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, { end: true }, {}, {
            default: () => `${validate_component(DropdownItem, "DropdownItem").$$render($$result, {}, {}, { default: () => `Option 1` })}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, {}, {}, { default: () => `Option 2` })}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, { divider: true }, {}, {})}
              ${validate_component(DropdownItem, "DropdownItem").$$render($$result, {}, {}, { default: () => `Reset` })}`
          })}`
        })}`
      })}`
    })}`
  })}
</div>`;
});
var favicon = "/_app/assets/brand-mark-320e5590.svg";
var AppHead = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<link rel="${"icon"}" type="${"image/svg+xml"}"${add_attribute("href", favicon, 0)} data-svelte="svelte-c45uvp">`, ""}`;
});
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(AppHead, "AppHead").$$render($$result, {}, {}, {})}
${validate_component(Navbar_1, "Navbar").$$render($$result, {}, {}, {})}

${slots.default ? slots.default({}) : ``}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load$4({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load: load$4
});
var css$e = {
  code: ".info.svelte-1tva239{font-size:80%;font-weight:bold}.data.svelte-1tva239{font-weight:normal}.buttons.svelte-1tva239{text-align:right}.btn.svelte-1tva239{margin-left:10px}",
  map: '{"version":3,"file":"PoolPreview.svelte","sources":["PoolPreview.svelte"],"sourcesContent":["<script>\\n    export let title;\\n    export let description;\\n    export let tradesOn;\\n    export let learnLink;\\n    export let preview;\\n<\/script>\\n\\n<div class=\\"card bg-primary shadow-soft border-light\\">\\n    <div class=\\"card-body\\">\\n        <h3 class=\\"h5 card-title\\">{ title }</h3>\\n\\n        <p class=\\"card-text\\">\\n            { description }\\n        </p>\\n\\n        <p class=\\"info\\">Currently invested: <span class=\\"badge text-uppercase\\">Coming soon</span></p>\\n\\n        <p class=\\"info\\">\\n            Trades on: <span class=\\"data\\">{ tradesOn }</span>\\n        </p>\\n\\n        <div class=\\"buttons\\">\\n            {#if learnLink}\\n                <a rel=\\"external\\" href=\\"https://tradingstrategy.ai/docs/programming/algorithms/double-7.html\\" class=\\"btn btn-primary\\">\\n                    Learn more\\n                </a>\\n            {:else}\\n                <button class=\\"btn\\" disabled>\\n                    Learn more\\n                </button>\\n            {/if}\\n\\n            <button class=\\"btn\\" disabled>\\n                Invest now\\n            </button>\\n        </div>\\n    </div>\\n\\n</div>\\n\\n<style>\\n    .info {\\n        font-size: 80%;\\n        font-weight: bold;\\n    }\\n\\n    .data {\\n        font-weight: normal;\\n    }\\n\\n    .buttons {\\n        text-align: right;\\n    }\\n\\n    .btn {\\n        margin-left: 10px;\\n    }\\n</style>"],"names":[],"mappings":"AA0CI,KAAK,eAAC,CAAC,AACH,SAAS,CAAE,GAAG,CACd,WAAW,CAAE,IAAI,AACrB,CAAC,AAED,KAAK,eAAC,CAAC,AACH,WAAW,CAAE,MAAM,AACvB,CAAC,AAED,QAAQ,eAAC,CAAC,AACN,UAAU,CAAE,KAAK,AACrB,CAAC,AAED,IAAI,eAAC,CAAC,AACF,WAAW,CAAE,IAAI,AACrB,CAAC"}'
};
var PoolPreview = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { description } = $$props;
  let { tradesOn } = $$props;
  let { learnLink } = $$props;
  let { preview } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.tradesOn === void 0 && $$bindings.tradesOn && tradesOn !== void 0)
    $$bindings.tradesOn(tradesOn);
  if ($$props.learnLink === void 0 && $$bindings.learnLink && learnLink !== void 0)
    $$bindings.learnLink(learnLink);
  if ($$props.preview === void 0 && $$bindings.preview && preview !== void 0)
    $$bindings.preview(preview);
  $$result.css.add(css$e);
  return `<div class="${"card bg-primary shadow-soft border-light"}"><div class="${"card-body"}"><h3 class="${"h5 card-title"}">${escape(title)}</h3>

        <p class="${"card-text"}">${escape(description)}</p>

        <p class="${"info svelte-1tva239"}">Currently invested: <span class="${"badge text-uppercase"}">Coming soon</span></p>

        <p class="${"info svelte-1tva239"}">Trades on: <span class="${"data svelte-1tva239"}">${escape(tradesOn)}</span></p>

        <div class="${"buttons svelte-1tva239"}">${learnLink ? `<a rel="${"external"}" href="${"https://tradingstrategy.ai/docs/programming/algorithms/double-7.html"}" class="${"btn btn-primary svelte-1tva239"}">Learn more
                </a>` : `<button class="${"btn svelte-1tva239"}" disabled>Learn more
                </button>`}

            <button class="${"btn svelte-1tva239"}" disabled>Invest now
            </button></div></div>

</div>`;
});
var css$d = {
  code: "main.svelte-1yrwgf2.svelte-1yrwgf2{min-height:100vw;background-size:cover;background-repeat:no-repeat;background-position:center center}.card-jumbo.svelte-1yrwgf2.svelte-1yrwgf2{background:#F2DFCE;box-shadow:none;padding:60px 0}.card-jumbo.svelte-1yrwgf2 p.svelte-1yrwgf2{text-align:center}h1.svelte-1yrwgf2.svelte-1yrwgf2{width:100%;color:black;text-align:center}.pool-preview.svelte-1yrwgf2 .card{margin:60px 0}.network-status.svelte-1yrwgf2.svelte-1yrwgf2{margin:60px 0;background:#80DEEA;padding:60px 0}.learn-more.svelte-1yrwgf2.svelte-1yrwgf2{padding-bottom:60px}.pulse.svelte-1yrwgf2.svelte-1yrwgf2{display:inline-block;width:16px;height:16px;border-radius:50%;background:#f0f0f0;cursor:pointer;box-shadow:0 0 0 rgba(255,255,255, 0.4);animation:svelte-1yrwgf2-pulse 2s infinite}.pulse.svelte-1yrwgf2.svelte-1yrwgf2:hover{animation:none}@-webkit-keyframes svelte-1yrwgf2-pulse{0%{-webkit-box-shadow:0 0 0 0 rgba(0, 0, 255, 0.4)}70%{-webkit-box-shadow:0 0 0 10px rgba(0,0,255, 0)}100%{-webkit-box-shadow:0 0 0 0 rgba(0,0,255, 0)}}@keyframes svelte-1yrwgf2-pulse{0%{-moz-box-shadow:0 0 0 0 rgba(0,0,255, 0.4);box-shadow:0 0 0 0 rgba(0,0,255, 0.4)}70%{-moz-box-shadow:0 0 0 10px rgba(0,0,255, 0);box-shadow:0 0 0 10px rgba(0,0,255, 0)}100%{-moz-box-shadow:0 0 0 0 rgba(0,0,255, 0);box-shadow:0 0 0 0 rgba(0,0,255, 0)}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\n\\timport PoolPreview from '$lib//pool/PoolPreview.svelte';\\n\\timport '$lib/styles/bodytext.css';\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>\\n\\t<meta name=\\"description\\" content=\\"On-chain systematic investing and trading\\">\\n</svelte:head>\\n\\n\\n<main>\\n\\t<section class=\\"card-home card-jumbo\\">\\n\\t\\t<div class=\\"container\\">\\n\\t\\t\\t<h1>Algorithmic trading strategy protocol</h1>\\n\\n\\t\\t\\t<p>Invest and offer active trading strategies run by a decentralised oracle network</p>\\n\\t\\t</div>\\n\\t</section>\\n\\n\\t<section class=\\"pool-preview\\">\\n\\t\\t<div class=\\"container\\">\\n\\t\\t\\t<div class=\\"row\\">\\n\\t\\t\\t\\t<div class=\\"col-md-12 strategy-cards\\">\\n\\t\\t\\t\\t\\t<PoolPreview\\n\\t\\t\\t\\t\\t\\ttitle=\\"ETH-USDC double seven\\"\\n\\t\\t\\t\\t\\t\\tdescription=\\"A school book strategy for a single trading pair volatility trading by using closing price momentum.\\"\\n\\t\\t\\t\\t\\t\\ttradesOn=\\"Sushiswap on Ethereum\\"\\n\\t\\t\\t\\t\\t\\tlearnLink=\\"https://tradingstrategy.ai/docs/programming/algorithms/double-7.html\\"\\n\\t\\t\\t\\t\\t\\tpreview={true} />\\n\\n\\t\\t\\t\\t\\t<PoolPreview\\n\\t\\t\\t\\t\\t\\ttitle=\\"Pancake momentum\\"\\n\\t\\t\\t\\t\\t\\tdescription=\\"A momentum portfolio strategy for low cap tokens.\\"\\n\\t\\t\\t\\t\\t\\ttradesOn=\\"PancakeSwap on Binance Smart Chain\\"\\n\\t\\t\\t\\t\\t\\tlearnLink={null}\\n\\t\\t\\t\\t\\t\\tpreview={true} />\\n\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</section>\\n\\n\\t<section class=\\"network-status\\">\\n\\t\\t<div class=\\"container\\">\\n\\t\\t\\t<div class=\\"row\\">\\n\\t\\t\\t\\t<div class=\\"col-md-12\\">\\n\\t\\t\\t\\t\\t<h3>Trading Strategy network status</h3>\\n\\n\\t\\t\\t\\t\\t<p class=\\"lead\\">\\n\\t\\t\\t\\t\\t\\t<span class=\\"pulse\\"></span> Currently running <strong>1</strong> oracle nodes, connected to <strong>1</strong> blockchains, <strong>264</strong> decentralised exchanges with <strong>57,359</strong> trading pairs and <strong>48,863</strong> tokens.\\n\\t\\t\\t\\t\\t\\tAutomated trading strategies make decisions based on <strong>181 GB</strong> oracle data.\\n\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</section>\\n\\n\\t<section class=\\"learn-more\\">\\n\\t\\t<div class=\\"container\\">\\n\\t\\t\\t<div class=\\"row\\">\\n\\t\\t\\t\\t<div class=\\"col-md-12\\">\\n\\t\\t\\t\\t\\t<h3>About Trading Strategy</h3>\\n\\n\\t\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\t\\tTrading Strategy is a decentralised protocol for the next generation quantitative finance.\\n\\t\\t\\t\\t\\t\\tDecentralised automated trading strategies allow investing with more profit and lower risk, as investors get direct access to high quality investing strategies and real-time control over their assets.\\n\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\t\\tAs the first in the world, Trading Strategy covers everything from market connectivity, trading signals, backtesting, trade execution, fund management and rewarding quantitative finance experts in a single permissionless protocol.\\n\\t\\t\\t\\t\\t\\tThis disrupts centralised exchanges and hedge funds by replacing their roles with smart contracts based asset management.\\n\\t\\t\\t\\t\\t\\tOpen ecosystem around the protocol nurtures fast community growth, so that strategy developers reach global earning potential not possible otherwise.\\n\\t\\t\\t\\t\\t</p>\\n\\n\\t\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\t\\t<a class=\\"body-link\\" rel=\\"external\\" href=\\"https://tradingstrategy.ai/docs/protocol/comparison.html\\">How is Trading Strategy different</a>\\n\\t\\t\\t\\t\\t\\t\u2022\\n\\t\\t\\t\\t\\t\\t<a class=\\"body-link\\" rel=\\"external\\"  href=\\"https://tradingstrategy.ai/docs/index.html\\">Learn how the protocol works</a>\\n\\t\\t\\t\\t\\t\\t\u2022\\n\\t\\t\\t\\t\\t\\t<a class=\\"body-link\\" rel=\\"external\\" href=\\"https://tradingstrategy.ai/docs/programming/examples/getting-started.html\\">Develop strategies to earn</a>\\n\\t\\t\\t\\t\\t\\t\u2022\\n\\t\\t\\t\\t\\t\\t<a class=\\"body-link\\" href=\\"mailto:info@tradingstrategy.ai\\">Contact for business inquiries</a>\\n\\n\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</section>\\n</main>\\n\\n<style>\\n\\n\\tmain {\\n\\t\\tmin-height: 100vw;\\n\\t\\tbackground-size: cover;\\n\\t\\tbackground-repeat: no-repeat;\\n\\t\\tbackground-position: center center;\\n\\t}\\n\\n\\t.card-jumbo {\\n\\t\\tbackground: #F2DFCE;\\n\\t\\tbox-shadow: none;\\n\\t\\tpadding: 60px 0;\\n\\t}\\n\\n\\t.card-jumbo p {\\n\\t\\ttext-align: center;\\n\\t}\\n\\n\\th1 {\\n\\t\\twidth: 100%;\\n\\t\\tcolor: black;\\n\\t\\ttext-align: center;\\n\\t}\\n\\t.pool-preview :global(.card) {\\n\\t\\tmargin: 60px 0;\\n\\t}\\n\\n\\t.network-status {\\n\\t\\tmargin: 60px 0;\\n\\t\\tbackground: #80DEEA;\\n\\t\\tpadding: 60px 0;\\n\\t}\\n\\n\\t.learn-more {\\n\\t\\tpadding-bottom: 60px;\\n\\t}\\n\\n\\t.pulse {\\n\\t  display: inline-block;\\n\\t  width: 16px;\\n\\t  height: 16px;\\n\\t  border-radius: 50%;\\n\\t  background: #f0f0f0;\\n\\t  cursor: pointer;\\n\\t  box-shadow: 0 0 0 rgba(255,255,255, 0.4);\\n\\t  animation: pulse 2s infinite;\\n\\t}\\n\\t.pulse:hover {\\n\\t  animation: none;\\n\\t}\\n\\n\\t@-webkit-keyframes pulse {\\n\\t  0% {\\n\\t\\t-webkit-box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.4);\\n\\t  }\\n\\t  70% {\\n\\t\\t  -webkit-box-shadow: 0 0 0 10px rgba(0,0,255, 0);\\n\\t  }\\n\\t  100% {\\n\\t\\t  -webkit-box-shadow: 0 0 0 0 rgba(0,0,255, 0);\\n\\t  }\\n\\t}\\n\\t@keyframes pulse {\\n\\t  0% {\\n\\t\\t-moz-box-shadow: 0 0 0 0 rgba(0,0,255, 0.4);\\n\\t\\tbox-shadow: 0 0 0 0 rgba(0,0,255, 0.4);\\n\\t  }\\n\\t  70% {\\n\\t\\t  -moz-box-shadow: 0 0 0 10px rgba(0,0,255, 0);\\n\\t\\t  box-shadow: 0 0 0 10px rgba(0,0,255, 0);\\n\\t  }\\n\\t  100% {\\n\\t\\t  -moz-box-shadow: 0 0 0 0 rgba(0,0,255, 0);\\n\\t\\t  box-shadow: 0 0 0 0 rgba(0,0,255, 0);\\n\\t  }\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA4FC,IAAI,8BAAC,CAAC,AACL,UAAU,CAAE,KAAK,CACjB,eAAe,CAAE,KAAK,CACtB,iBAAiB,CAAE,SAAS,CAC5B,mBAAmB,CAAE,MAAM,CAAC,MAAM,AACnC,CAAC,AAED,WAAW,8BAAC,CAAC,AACZ,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,IAAI,CAAC,CAAC,AAChB,CAAC,AAED,0BAAW,CAAC,CAAC,eAAC,CAAC,AACd,UAAU,CAAE,MAAM,AACnB,CAAC,AAED,EAAE,8BAAC,CAAC,AACH,KAAK,CAAE,IAAI,CACX,KAAK,CAAE,KAAK,CACZ,UAAU,CAAE,MAAM,AACnB,CAAC,AACD,4BAAa,CAAC,AAAQ,KAAK,AAAE,CAAC,AAC7B,MAAM,CAAE,IAAI,CAAC,CAAC,AACf,CAAC,AAED,eAAe,8BAAC,CAAC,AAChB,MAAM,CAAE,IAAI,CAAC,CAAC,CACd,UAAU,CAAE,OAAO,CACnB,OAAO,CAAE,IAAI,CAAC,CAAC,AAChB,CAAC,AAED,WAAW,8BAAC,CAAC,AACZ,cAAc,CAAE,IAAI,AACrB,CAAC,AAED,MAAM,8BAAC,CAAC,AACN,OAAO,CAAE,YAAY,CACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,OAAO,CACnB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CACxC,SAAS,CAAE,oBAAK,CAAC,EAAE,CAAC,QAAQ,AAC9B,CAAC,AACD,oCAAM,MAAM,AAAC,CAAC,AACZ,SAAS,CAAE,IAAI,AACjB,CAAC,AAED,mBAAmB,oBAAM,CAAC,AACxB,EAAE,AAAC,CAAC,AACL,kBAAkB,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,AAC/C,CAAC,AACD,GAAG,AAAC,CAAC,AACJ,kBAAkB,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,AAChD,CAAC,AACD,IAAI,AAAC,CAAC,AACL,kBAAkB,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,AAC7C,CAAC,AACH,CAAC,AACD,WAAW,oBAAM,CAAC,AAChB,EAAE,AAAC,CAAC,AACL,eAAe,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAC3C,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,AACrC,CAAC,AACD,GAAG,AAAC,CAAC,AACJ,eAAe,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAC5C,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,AACxC,CAAC,AACD,IAAI,AAAC,CAAC,AACL,eAAe,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CACzC,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,AACrC,CAAC,AACH,CAAC"}`
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$d);
  return `${$$result.head += `${$$result.title = `<title>TradingStrategy.ai - Algorithmic trading strategy protocol</title>`, ""}<meta name="${"description"}" content="${"On-chain systematic investing and trading"}" data-svelte="svelte-1iw5a0q">`, ""}


<main class="${"svelte-1yrwgf2"}"><section class="${"card-home card-jumbo svelte-1yrwgf2"}"><div class="${"container"}"><h1 class="${"svelte-1yrwgf2"}">Algorithmic trading strategy protocol</h1>

			<p class="${"svelte-1yrwgf2"}">Invest and offer active trading strategies run by a decentralised oracle network</p></div></section>

	<section class="${"pool-preview svelte-1yrwgf2"}"><div class="${"container"}"><div class="${"row"}"><div class="${"col-md-12 strategy-cards"}">${validate_component(PoolPreview, "PoolPreview").$$render($$result, {
    title: "ETH-USDC double seven",
    description: "A school book strategy for a single trading pair volatility trading by using closing price momentum.",
    tradesOn: "Sushiswap on Ethereum",
    learnLink: "https://tradingstrategy.ai/docs/programming/algorithms/double-7.html",
    preview: true
  }, {}, {})}

					${validate_component(PoolPreview, "PoolPreview").$$render($$result, {
    title: "Pancake momentum",
    description: "A momentum portfolio strategy for low cap tokens.",
    tradesOn: "PancakeSwap on Binance Smart Chain",
    learnLink: null,
    preview: true
  }, {}, {})}</div></div></div></section>

	<section class="${"network-status svelte-1yrwgf2"}"><div class="${"container"}"><div class="${"row"}"><div class="${"col-md-12"}"><h3>Trading Strategy network status</h3>

					<p class="${"lead"}"><span class="${"pulse svelte-1yrwgf2"}"></span> Currently running <strong>1</strong> oracle nodes, connected to <strong>1</strong> blockchains, <strong>264</strong> decentralised exchanges with <strong>57,359</strong> trading pairs and <strong>48,863</strong> tokens.
						Automated trading strategies make decisions based on <strong>181 GB</strong> oracle data.
					</p></div></div></div></section>

	<section class="${"learn-more svelte-1yrwgf2"}"><div class="${"container"}"><div class="${"row"}"><div class="${"col-md-12"}"><h3>About Trading Strategy</h3>

					<p>Trading Strategy is a decentralised protocol for the next generation quantitative finance.
						Decentralised automated trading strategies allow investing with more profit and lower risk, as investors get direct access to high quality investing strategies and real-time control over their assets.
					</p>
					<p>As the first in the world, Trading Strategy covers everything from market connectivity, trading signals, backtesting, trade execution, fund management and rewarding quantitative finance experts in a single permissionless protocol.
						This disrupts centralised exchanges and hedge funds by replacing their roles with smart contracts based asset management.
						Open ecosystem around the protocol nurtures fast community growth, so that strategy developers reach global earning potential not possible otherwise.
					</p>

					<p><a class="${"body-link"}" rel="${"external"}" href="${"https://tradingstrategy.ai/docs/protocol/comparison.html"}">How is Trading Strategy different</a>
						\u2022
						<a class="${"body-link"}" rel="${"external"}" href="${"https://tradingstrategy.ai/docs/index.html"}">Learn how the protocol works</a>
						\u2022
						<a class="${"body-link"}" rel="${"external"}" href="${"https://tradingstrategy.ai/docs/programming/examples/getting-started.html"}">Develop strategies to earn</a>
						\u2022
						<a class="${"body-link"}" href="${"mailto:info@tradingstrategy.ai"}">Contact for business inquiries</a></p></div></div></div></section>
</main>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var Input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value } = $$props;
  let { placeholder } = $$props;
  let { label } = $$props;
  let { name } = $$props;
  let { id } = $$props;
  let { required } = $$props;
  let { errors } = $$props;
  const getStyles = () => {
    if (name && errors[name]) {
      return `is-invalid`;
    }
    return ``;
  };
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.errors === void 0 && $$bindings.errors && errors !== void 0)
    $$bindings.errors(errors);
  return `<label${add_attribute("for", id, 0)}>${required ? `*` : ``} ${escape(label)}</label>
<input${add_attribute("class", `form-control ${getStyles()}`, 0)}${add_attribute("placeholder", placeholder, 0)}${add_attribute("id", id, 0)}${add_attribute("name", name, 0)} ${required ? "required" : ""} type="${"text"}"${add_attribute("value", value, 0)}>`;
});
var css$c = {
  code: ".error-message.svelte-c064o2{color:red}",
  map: `{"version":3,"file":"InputEmail.svelte","sources":["InputEmail.svelte"],"sourcesContent":["<script>\\n    export let value;\\n    export let placeholder;\\n    export let label;\\n    export let name;\\n    export let id;\\n    export let required;\\n    export let errors = {};\\n<\/script>\\n  \\n<label for={id}>\\n  {#if required }*{/if} {label} \\n</label>\\n<input class=\\"form-control\\" bind:value {placeholder} {id} {name} {required} type=\\"email\\" />\\n<small id=\\"emailHelp\\" class=\\"form-text text-muted\\">We'll never share your email with anyone else.</small>\\n{#if errors[name] && errors[name]}\\n    <p class=\\"error-message\\">Email is required</p>\\n{/if}\\n\\n<style>\\n    .error-message {\\n      color: red;\\n    }\\n</style>"],"names":[],"mappings":"AAoBI,cAAc,cAAC,CAAC,AACd,KAAK,CAAE,GAAG,AACZ,CAAC"}`
};
var InputEmail = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value } = $$props;
  let { placeholder } = $$props;
  let { label } = $$props;
  let { name } = $$props;
  let { id } = $$props;
  let { required } = $$props;
  let { errors = {} } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.errors === void 0 && $$bindings.errors && errors !== void 0)
    $$bindings.errors(errors);
  $$result.css.add(css$c);
  return `<label${add_attribute("for", id, 0)}>${required ? `*` : ``} ${escape(label)}</label>
<input class="${"form-control"}"${add_attribute("placeholder", placeholder, 0)}${add_attribute("id", id, 0)}${add_attribute("name", name, 0)} ${required ? "required" : ""} type="${"email"}"${add_attribute("value", value, 0)}>
<small id="${"emailHelp"}" class="${"form-text text-muted"}">We&#39;ll never share your email with anyone else.</small>
${errors[name] && errors[name] ? `<p class="${"error-message svelte-c064o2"}">Email is required</p>` : ``}`;
});
var css$b = {
  code: "input, select{margin:5px}",
  map: `{"version":3,"file":"Form.svelte","sources":["Form.svelte"],"sourcesContent":["<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\nimport Input from \\"./Input.svelte\\";\\nimport InputEmail from \\"./InputEmail.svelte\\";\\nexport let onSubmit;\\nexport let fields;\\nexport let formErrors = {};\\nexport let submitted = false;\\nfunction isFormValid(data) {\\n    let isValid = true;\\n    const isRequiredFieldValid = (value) => {\\n        return value != null && value !== \\"\\";\\n    };\\n    data.forEach((field) => {\\n        if (!isRequiredFieldValid(field)) {\\n            formErrors[field] = Object.assign(Object.assign({}, formErrors[field]), { requiredError: true });\\n            isValid = false;\\n        }\\n        else {\\n            formErrors[field] = Object.assign(Object.assign({}, formErrors[field]), { requiredError: false });\\n        }\\n    });\\n    return isValid;\\n}\\nconst clientRequest = (fields) => __awaiter(void 0, void 0, void 0, function* () {\\n    const response = yield fetch('https://httpbin.org/post', {\\n        method: 'POST',\\n        body: JSON.stringify(fields)\\n    });\\n    const json = yield response.json();\\n    const result = JSON.stringify(json);\\n    submitted = true;\\n    console.log(result);\\n});\\nconst fieldsToObject = (fields) => fields.reduce((p, c) => (Object.assign(Object.assign({}, p), { [c.name]: c.value })), {});\\nconst handleSubmit = () => {\\n    if (isFormValid(fields)) {\\n        clientRequest(fields);\\n        onSubmit(fieldsToObject(fields));\\n    }\\n};\\n<\/script>\\n  \\n  <style>\\n    :global(input, select) {\\n      margin: 5px;\\n    }\\n  </style>\\n  \\n\\n  {#if !submitted }\\n    <form on:submit|preventDefault={() => handleSubmit()}>\\n        {#each fields as field}\\n            {#if field.type === 'Input'}\\n              <div class=\\"form-group mb-3\\">\\n                <Input bind:value={field.value} label={field.label} placeholder={field.placeholder} required={field.required} formErrors={formErrors} />\\n              </div>\\n            {:else if field.type === 'Email'}\\n              <div class=\\"form-group mb-3\\">\\n                <InputEmail bind:value={field.value} label={field.label} placeholder={field.placeholder} required={field.required} formErrors={formErrors}/>  \\n              </div>\\n            {/if}\\n        {/each}\\n        <button type=\\"submit\\" class=\\"btn btn-primary form-group-api-key-item\\">Submit</button>\\n    </form>\\n  {:else}\\n    <h3>Please check your email you should have received and email with an Api Key</h3>\\n  {/if}\\n\\n\\n  "],"names":[],"mappings":"AAmDY,aAAa,AAAE,CAAC,AACtB,MAAM,CAAE,GAAG,AACb,CAAC"}`
};
var Form = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve22) {
        resolve22(value);
      });
    }
    return new (P || (P = Promise))(function(resolve22, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve22(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { onSubmit } = $$props;
  let { fields } = $$props;
  let { formErrors = {} } = $$props;
  let { submitted = false } = $$props;
  if ($$props.onSubmit === void 0 && $$bindings.onSubmit && onSubmit !== void 0)
    $$bindings.onSubmit(onSubmit);
  if ($$props.fields === void 0 && $$bindings.fields && fields !== void 0)
    $$bindings.fields(fields);
  if ($$props.formErrors === void 0 && $$bindings.formErrors && formErrors !== void 0)
    $$bindings.formErrors(formErrors);
  if ($$props.submitted === void 0 && $$bindings.submitted && submitted !== void 0)
    $$bindings.submitted(submitted);
  $$result.css.add(css$b);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${!submitted ? `<form>${each(fields, (field) => `${field.type === "Input" ? `<div class="${"form-group mb-3"}">${validate_component(Input, "Input").$$render($$result, {
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      formErrors,
      value: field.value
    }, {
      value: ($$value) => {
        field.value = $$value;
        $$settled = false;
      }
    }, {})}
              </div>` : `${field.type === "Email" ? `<div class="${"form-group mb-3"}">${validate_component(InputEmail, "InputEmail").$$render($$result, {
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      formErrors,
      value: field.value
    }, {
      value: ($$value) => {
        field.value = $$value;
        $$settled = false;
      }
    }, {})}  
              </div>` : ``}`}`)}
        <button type="${"submit"}" class="${"btn btn-primary form-group-api-key-item"}">Submit</button></form>` : `<h3>Please check your email you should have received and email with an Api Key</h3>`}`;
  } while (!$$settled);
  return $$rendered;
});
var Credentials = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let fields = [
    {
      name: "email",
      type: "Email",
      value: "",
      placeholder: "Enter email...",
      label: "Email",
      required: true
    },
    {
      name: "firstName",
      type: "Input",
      value: "",
      placeholder: "Enter first name...",
      label: "First name",
      required: true
    },
    {
      name: "lastName",
      type: "Input",
      value: "",
      placeholder: "Enter last name...",
      label: "Last name",
      required: true
    }
  ];
  return `


  <div class="${"container"}"><div class="${"row"}"><div class="${"col-8"}"><div class="${"card bg-primary shadow-soft border-light px-4 py-5"}"><h1>Request your Api Key</h1>
                ${validate_component(Form, "Form").$$render($$result, {
    onSubmit: (body) => {
    },
    fields
  }, {}, {})}</div></div></div></div>`;
});
var credentials = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Credentials
});
var css$a = {
  code: "h1.svelte-umvrva{margin:30px 0}",
  map: '{"version":3,"file":"community.svelte","sources":["community.svelte"],"sourcesContent":["<svelte:head>\\n    <title>TradingStrategy.ai community resources</title>\\n    <meta name=\\"description\\" content=\\"Resources to learn algorithmic trading for crypto\\">\\n</svelte:head>\\n\\n\\n<main>\\n    <section>\\n        <div class=\\"container\\">\\n\\n            <div class=\\"row\\">\\n                <div class=\\"col-md-12\\">\\n                    <h1>Learn more</h1>\\n                </div>\\n            </div>\\n\\n            <div class=\\"row\\">\\n\\n                <div class=\\"col-12 col-md-6 col-lg-4 mb-5\\">\\n                    <div class=\\"card bg-primary shadow-soft text-center border-light\\">\\n                        <div class=\\"card-body\\">\\n                            <h3 class=\\"h5 card-title\\">\\n                                <i class=\\"fas fa-chart-line\\"></i>\\n                                Backtesting\\n                            </h3>\\n\\n                            <p class=\\"card-text\\">Learn how to run backtests with DEX trading data</p>\\n\\n                            <a rel=\\"external\\" href=\\"https://tradingstrategy.ai/docs/algorithms/ape-in.html\\" class=\\"btn btn-primary btn-sm\\">View example</a>\\n                        </div>\\n                    </div>\\n                </div>\\n\\n                <div class=\\"col-12 col-md-6 col-lg-4 mb-5\\">\\n                    <div class=\\"card bg-primary shadow-soft text-center border-light\\">\\n                        <div class=\\"card-body\\">\\n                            <h3 class=\\"h5 card-title\\">\\n                                <span aria-hidden=\\"true\\" class=\\"fab fa-github\\"></span> Github\\n                            </h3>\\n\\n                            <p class=\\"card-text\\">Browser source code and discuss technical issues</p>\\n\\n                            <a rel=\\"external\\" href=\\"https://github.com/tradingstrategy-ai/client\\" class=\\"btn btn-primary btn-sm\\">View repository</a>\\n                        </div>\\n                    </div>\\n                </div>\\n\\n\\n            </div>\\n        </div>\\n    </section>\\n</main>\\n\\n<style>\\n    h1 {\\n        margin: 30px 0;\\n    }\\n</style>\\n"],"names":[],"mappings":"AAsDI,EAAE,cAAC,CAAC,AACA,MAAM,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC"}'
};
var Community = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$a);
  return `${$$result.head += `${$$result.title = `<title>TradingStrategy.ai community resources</title>`, ""}<meta name="${"description"}" content="${"Resources to learn algorithmic trading for crypto"}" data-svelte="svelte-2dp05q">`, ""}


<main><section><div class="${"container"}"><div class="${"row"}"><div class="${"col-md-12"}"><h1 class="${"svelte-umvrva"}">Learn more</h1></div></div>

            <div class="${"row"}"><div class="${"col-12 col-md-6 col-lg-4 mb-5"}"><div class="${"card bg-primary shadow-soft text-center border-light"}"><div class="${"card-body"}"><h3 class="${"h5 card-title"}"><i class="${"fas fa-chart-line"}"></i>
                                Backtesting
                            </h3>

                            <p class="${"card-text"}">Learn how to run backtests with DEX trading data</p>

                            <a rel="${"external"}" href="${"https://tradingstrategy.ai/docs/algorithms/ape-in.html"}" class="${"btn btn-primary btn-sm"}">View example</a></div></div></div>

                <div class="${"col-12 col-md-6 col-lg-4 mb-5"}"><div class="${"card bg-primary shadow-soft text-center border-light"}"><div class="${"card-body"}"><h3 class="${"h5 card-title"}"><span aria-hidden="${"true"}" class="${"fab fa-github"}"></span> Github
                            </h3>

                            <p class="${"card-text"}">Browser source code and discuss technical issues</p>

                            <a rel="${"external"}" href="${"https://github.com/tradingstrategy-ai/client"}" class="${"btn btn-primary btn-sm"}">View repository</a></div></div></div></div></div></section>
</main>`;
});
var community = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Community
});
var browser = false;
var dev = false;
var css$9 = {
  code: "nav.svelte-1xnq9vj>ul.svelte-1xnq9vj{list-style-type:none;display:flex}button.svelte-1xnq9vj.svelte-1xnq9vj{margin-right:6px}",
  map: `{"version":3,"file":"Table.svelte","sources":["Table.svelte"],"sourcesContent":["<script lang=\\"typescript\\">import { onMount } from 'svelte';\\nimport { formatNumber } from '$lib/helpers/formatters';\\nexport let rows = [];\\nexport let apiError;\\nlet page = 0;\\nlet totalPages = [];\\nlet currentPageRows = [];\\nlet itemsPerPage = 50;\\nlet loading = true;\\n$: currentPageRows = totalPages.length > 0 ? totalPages[page] : [];\\nconst paginate = (items) => {\\n    const pages = Math.ceil(items.length / itemsPerPage);\\n    const paginatedItems = Array.from({ length: pages }, (_, index) => {\\n        const start = index * itemsPerPage;\\n        return items.slice(start, start + itemsPerPage);\\n    });\\n    totalPages = [...paginatedItems];\\n};\\nonMount(() => {\\n    paginate(rows);\\n});\\nconst setPage = (p) => {\\n    if (p >= 0 && p < totalPages.length) {\\n        page = p;\\n    }\\n};\\n<\/script>\\n\\n<table class=\\"table table-datasets\\">\\n\\t<thead>\\n\\t\\t<tr>\\n\\t\\t\\t<th>id</th>\\n\\t\\t\\t<th>name</th>\\n\\t\\t\\t<th>USD Volume</th>\\n\\t\\t</tr>\\n\\t</thead>\\n\\n\\t<tbody>\\n\\t\\t{#each currentPageRows as row, i}\\n\\t\\t\\t<tr>\\n\\t\\t\\t\\t<td>{row.exchange_id}</td>\\n\\t\\t\\t\\t<td><a class=\\"nav-link\\" href=\\"/ethereum/uniswap-v2\\">{row.human_readable_name}</a></td>\\n\\t\\t\\t\\t<td>{formatNumber(row.usd_volume_30d)}</td>\\n\\t\\t\\t</tr>\\n\\t\\t{:else}\\n\\t\\t\\t{#if apiError}\\n\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t<td>\\n\\t\\t\\t\\t\\t\\t<h5 class=\\"text-center\\">Api unavailabe, {apiError} </h5>\\n\\t\\t\\t\\t\\t</td>\\n\\t\\t\\t\\t</tr>\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t<td>\\n\\t\\t\\t\\t\\t\\t<h5 class=\\"text-center\\">There is no data to display here.</h5>\\n\\t\\t\\t\\t\\t</td>\\n\\t\\t\\t\\t</tr>\\n\\t\\t\\t{/if}\\n\\t\\t{/each}\\n\\t</tbody>\\n</table>\\n<nav class=\\"pagination\\">\\n\\t<ul>\\n\\t\\t<li>\\n\\t\\t\\t<button\\n\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\tclass=\\"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev\\"\\n\\t\\t\\t\\ton:click={() => setPage(page - 1)}\\n\\t\\t\\t>\\n\\t\\t\\t\\tPREV\\n\\t\\t\\t</button>\\n\\t\\t</li>\\n\\n\\t\\t{#each totalPages as page, i}\\n\\t\\t\\t<li>\\n\\t\\t\\t\\t<button\\n\\t\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\t\\tclass=\\"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-page-number\\"\\n\\t\\t\\t\\t\\ton:click={() => setPage(i)}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t{i + 1}\\n\\t\\t\\t\\t</button>\\n\\t\\t\\t</li>\\n\\t\\t{/each}\\n\\n\\t\\t<li>\\n\\t\\t\\t<button\\n\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\tclass=\\"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev\\"\\n\\t\\t\\t\\ton:click={() => setPage(page + 1)}\\n\\t\\t\\t>\\n\\t\\t\\t\\tNEXT\\n\\t\\t\\t</button>\\n\\t\\t</li>\\n\\t</ul>\\n</nav>\\n\\n<style>\\n\\tnav > ul {\\n\\t\\tlist-style-type: none;\\n\\t\\tdisplay: flex;\\n\\t}\\n\\tbutton {\\n\\t\\tmargin-right: 6px;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAkGC,kBAAG,CAAG,EAAE,eAAC,CAAC,AACT,eAAe,CAAE,IAAI,CACrB,OAAO,CAAE,IAAI,AACd,CAAC,AACD,MAAM,8BAAC,CAAC,AACP,YAAY,CAAE,GAAG,AAClB,CAAC"}`
};
var Table$2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { rows = [] } = $$props;
  let { apiError } = $$props;
  let page = 0;
  let totalPages = [];
  let currentPageRows = [];
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.apiError === void 0 && $$bindings.apiError && apiError !== void 0)
    $$bindings.apiError(apiError);
  $$result.css.add(css$9);
  currentPageRows = totalPages.length > 0 ? totalPages[page] : [];
  return `<table class="${"table table-datasets"}"><thead><tr><th>id</th>
			<th>name</th>
			<th>USD Volume</th></tr></thead>

	<tbody>${currentPageRows.length ? each(currentPageRows, (row, i) => `<tr><td>${escape(row.exchange_id)}</td>
				<td><a class="${"nav-link"}" href="${"/ethereum/uniswap-v2"}">${escape(row.human_readable_name)}</a></td>
				<td>${escape(formatNumber$1(row.usd_volume_30d))}</td>
			</tr>`) : `${apiError ? `<tr><td><h5 class="${"text-center"}">Api unavailabe, ${escape(apiError)} </h5></td>
				</tr>` : `<tr><td><h5 class="${"text-center"}">There is no data to display here.</h5></td>
				</tr>`}`}</tbody></table>
<nav class="${"pagination svelte-1xnq9vj"}"><ul class="${"svelte-1xnq9vj"}"><li><button type="${"button"}" class="${"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev svelte-1xnq9vj"}">PREV
			</button></li>

		${each(totalPages, (page2, i) => `<li><button type="${"button"}" class="${"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-page-number svelte-1xnq9vj"}">${escape(i + 1)}</button>
			</li>`)}

		<li><button type="${"button"}" class="${"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev svelte-1xnq9vj"}">NEXT
			</button></li></ul>
</nav>`;
});
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve22) {
      resolve22(value);
    });
  }
  return new (P || (P = Promise))(function(resolve22, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve22(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var hydrate$1 = dev;
var router$1 = browser;
function load$3({ fetch: fetch2 }) {
  return __awaiter(this, void 0, void 0, function* () {
    const url = `https://matilda.tradingstrategy.ai/exchanges`;
    const res = yield fetch2(url);
    if (res.ok) {
      const exchanges2 = yield res.json();
      return {
        props: {
          exchanges: exchanges2.exchanges,
          apiError: void 0
        }
      };
    }
    const errorTypes = {
      "404": {
        status: 404,
        message: `can get exchanges data from our API, our team is probably already working to solve this issue`
      }
    };
    return {
      props: {
        exchanges: [],
        apiError: `Could not load, ${errorTypes[res.status].message}`
      }
    };
  });
}
var Exchanges = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve22) {
        resolve22(value);
      });
    }
    return new (P || (P = Promise))(function(resolve22, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve22(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { exchanges: exchanges2 = [] } = $$props;
  let { apiError } = $$props;
  if ($$props.exchanges === void 0 && $$bindings.exchanges && exchanges2 !== void 0)
    $$bindings.exchanges(exchanges2);
  if ($$props.apiError === void 0 && $$bindings.apiError && apiError !== void 0)
    $$bindings.apiError(apiError);
  return `${$$result.head += `${$$result.title = `<title>DEX trading and quantative finance datasets</title>`, ""}<meta name="${"description"}" content="${"Download OHLCV and liquidity data for DEXes"}" data-svelte="svelte-1gorc3y">`, ""}

<div class="${"container container-main"}"><section class="${"md-12"}"><div class="${"card"}"><div class="${"card-body"}"><h1>Exchanges</h1>
					${validate_component(Table$2, "Table").$$render($$result, { rows: exchanges2, apiError }, {}, {})}</div></div></section>
</div>`;
});
var exchanges = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Exchanges,
  hydrate: hydrate$1,
  router: router$1,
  load: load$3
});
var SECONDS_A_MINUTE = 60;
var SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
var SECONDS_A_DAY = SECONDS_A_HOUR * 24;
var SECONDS_A_WEEK = SECONDS_A_DAY * 7;
var MILLISECONDS_A_SECOND = 1e3;
var MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND;
var MS = "millisecond";
var S = "second";
var MIN = "minute";
var H = "hour";
var D = "day";
var W = "week";
var M = "month";
var Q = "quarter";
var Y = "year";
var DATE = "date";
var FORMAT_DEFAULT = "YYYY-MM-DDTHH:mm:ssZ";
var INVALID_DATE_STRING = "Invalid Date";
var REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/;
var REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
var en = {
  name: "en",
  weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
  months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_")
};
var padStart = function padStart2(string, length, pad) {
  var s2 = String(string);
  if (!s2 || s2.length >= length)
    return string;
  return "" + Array(length + 1 - s2.length).join(pad) + string;
};
var padZoneStr = function padZoneStr2(instance) {
  var negMinutes = -instance.utcOffset();
  var minutes = Math.abs(negMinutes);
  var hourOffset = Math.floor(minutes / 60);
  var minuteOffset = minutes % 60;
  return "" + (negMinutes <= 0 ? "+" : "-") + padStart(hourOffset, 2, "0") + ":" + padStart(minuteOffset, 2, "0");
};
var monthDiff = function monthDiff2(a, b) {
  if (a.date() < b.date())
    return -monthDiff2(b, a);
  var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
  var anchor = a.clone().add(wholeMonthDiff, M);
  var c = b - anchor < 0;
  var anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), M);
  return +(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)) || 0);
};
var absFloor = function absFloor2(n) {
  return n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
};
var prettyUnit = function prettyUnit2(u) {
  var special = {
    M,
    y: Y,
    w: W,
    d: D,
    D: DATE,
    h: H,
    m: MIN,
    s: S,
    ms: MS,
    Q
  };
  return special[u] || String(u || "").toLowerCase().replace(/s$/, "");
};
var isUndefined = function isUndefined2(s2) {
  return s2 === void 0;
};
var U = {
  s: padStart,
  z: padZoneStr,
  m: monthDiff,
  a: absFloor,
  p: prettyUnit,
  u: isUndefined
};
var L = "en";
var Ls = {};
Ls[L] = en;
var isDayjs = function isDayjs2(d2) {
  return d2 instanceof Dayjs;
};
var parseLocale = function parseLocale2(preset, object, isLocal) {
  var l;
  if (!preset)
    return L;
  if (typeof preset === "string") {
    if (Ls[preset]) {
      l = preset;
    }
    if (object) {
      Ls[preset] = object;
      l = preset;
    }
  } else {
    var name = preset.name;
    Ls[name] = preset;
    l = name;
  }
  if (!isLocal && l)
    L = l;
  return l || !isLocal && L;
};
var dayjs = function dayjs2(date, c) {
  if (isDayjs(date)) {
    return date.clone();
  }
  var cfg = typeof c === "object" ? c : {};
  cfg.date = date;
  cfg.args = arguments;
  return new Dayjs(cfg);
};
var wrapper = function wrapper2(date, instance) {
  return dayjs(date, {
    locale: instance.$L,
    utc: instance.$u,
    x: instance.$x,
    $offset: instance.$offset
  });
};
var Utils = U;
Utils.l = parseLocale;
Utils.i = isDayjs;
Utils.w = wrapper;
var parseDate = function parseDate2(cfg) {
  var date = cfg.date, utc = cfg.utc;
  if (date === null)
    return new Date(NaN);
  if (Utils.u(date))
    return new Date();
  if (date instanceof Date)
    return new Date(date);
  if (typeof date === "string" && !/Z$/i.test(date)) {
    var d2 = date.match(REGEX_PARSE);
    if (d2) {
      var m = d2[2] - 1 || 0;
      var ms = (d2[7] || "0").substring(0, 3);
      if (utc) {
        return new Date(Date.UTC(d2[1], m, d2[3] || 1, d2[4] || 0, d2[5] || 0, d2[6] || 0, ms));
      }
      return new Date(d2[1], m, d2[3] || 1, d2[4] || 0, d2[5] || 0, d2[6] || 0, ms);
    }
  }
  return new Date(date);
};
var Dayjs = /* @__PURE__ */ function() {
  function Dayjs2(cfg) {
    this.$L = parseLocale(cfg.locale, null, true);
    this.parse(cfg);
  }
  var _proto = Dayjs2.prototype;
  _proto.parse = function parse3(cfg) {
    this.$d = parseDate(cfg);
    this.$x = cfg.x || {};
    this.init();
  };
  _proto.init = function init2() {
    var $d = this.$d;
    this.$y = $d.getFullYear();
    this.$M = $d.getMonth();
    this.$D = $d.getDate();
    this.$W = $d.getDay();
    this.$H = $d.getHours();
    this.$m = $d.getMinutes();
    this.$s = $d.getSeconds();
    this.$ms = $d.getMilliseconds();
  };
  _proto.$utils = function $utils() {
    return Utils;
  };
  _proto.isValid = function isValid() {
    return !(this.$d.toString() === INVALID_DATE_STRING);
  };
  _proto.isSame = function isSame(that, units) {
    var other = dayjs(that);
    return this.startOf(units) <= other && other <= this.endOf(units);
  };
  _proto.isAfter = function isAfter(that, units) {
    return dayjs(that) < this.startOf(units);
  };
  _proto.isBefore = function isBefore(that, units) {
    return this.endOf(units) < dayjs(that);
  };
  _proto.$g = function $g(input, get, set) {
    if (Utils.u(input))
      return this[get];
    return this.set(set, input);
  };
  _proto.unix = function unix() {
    return Math.floor(this.valueOf() / 1e3);
  };
  _proto.valueOf = function valueOf() {
    return this.$d.getTime();
  };
  _proto.startOf = function startOf(units, _startOf) {
    var _this = this;
    var isStartOf = !Utils.u(_startOf) ? _startOf : true;
    var unit = Utils.p(units);
    var instanceFactory = function instanceFactory2(d2, m) {
      var ins = Utils.w(_this.$u ? Date.UTC(_this.$y, m, d2) : new Date(_this.$y, m, d2), _this);
      return isStartOf ? ins : ins.endOf(D);
    };
    var instanceFactorySet = function instanceFactorySet2(method, slice) {
      var argumentStart = [0, 0, 0, 0];
      var argumentEnd = [23, 59, 59, 999];
      return Utils.w(_this.toDate()[method].apply(_this.toDate("s"), (isStartOf ? argumentStart : argumentEnd).slice(slice)), _this);
    };
    var $W = this.$W, $M = this.$M, $D = this.$D;
    var utcPad = "set" + (this.$u ? "UTC" : "");
    switch (unit) {
      case Y:
        return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);
      case M:
        return isStartOf ? instanceFactory(1, $M) : instanceFactory(0, $M + 1);
      case W: {
        var weekStart = this.$locale().weekStart || 0;
        var gap = ($W < weekStart ? $W + 7 : $W) - weekStart;
        return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M);
      }
      case D:
      case DATE:
        return instanceFactorySet(utcPad + "Hours", 0);
      case H:
        return instanceFactorySet(utcPad + "Minutes", 1);
      case MIN:
        return instanceFactorySet(utcPad + "Seconds", 2);
      case S:
        return instanceFactorySet(utcPad + "Milliseconds", 3);
      default:
        return this.clone();
    }
  };
  _proto.endOf = function endOf(arg) {
    return this.startOf(arg, false);
  };
  _proto.$set = function $set(units, _int) {
    var _C$D$C$DATE$C$M$C$Y$C;
    var unit = Utils.p(units);
    var utcPad = "set" + (this.$u ? "UTC" : "");
    var name = (_C$D$C$DATE$C$M$C$Y$C = {}, _C$D$C$DATE$C$M$C$Y$C[D] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[DATE] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[M] = utcPad + "Month", _C$D$C$DATE$C$M$C$Y$C[Y] = utcPad + "FullYear", _C$D$C$DATE$C$M$C$Y$C[H] = utcPad + "Hours", _C$D$C$DATE$C$M$C$Y$C[MIN] = utcPad + "Minutes", _C$D$C$DATE$C$M$C$Y$C[S] = utcPad + "Seconds", _C$D$C$DATE$C$M$C$Y$C[MS] = utcPad + "Milliseconds", _C$D$C$DATE$C$M$C$Y$C)[unit];
    var arg = unit === D ? this.$D + (_int - this.$W) : _int;
    if (unit === M || unit === Y) {
      var date = this.clone().set(DATE, 1);
      date.$d[name](arg);
      date.init();
      this.$d = date.set(DATE, Math.min(this.$D, date.daysInMonth())).$d;
    } else if (name)
      this.$d[name](arg);
    this.init();
    return this;
  };
  _proto.set = function set(string, _int2) {
    return this.clone().$set(string, _int2);
  };
  _proto.get = function get(unit) {
    return this[Utils.p(unit)]();
  };
  _proto.add = function add(number, units) {
    var _this2 = this, _C$MIN$C$H$C$S$unit;
    number = Number(number);
    var unit = Utils.p(units);
    var instanceFactorySet = function instanceFactorySet2(n) {
      var d2 = dayjs(_this2);
      return Utils.w(d2.date(d2.date() + Math.round(n * number)), _this2);
    };
    if (unit === M) {
      return this.set(M, this.$M + number);
    }
    if (unit === Y) {
      return this.set(Y, this.$y + number);
    }
    if (unit === D) {
      return instanceFactorySet(1);
    }
    if (unit === W) {
      return instanceFactorySet(7);
    }
    var step = (_C$MIN$C$H$C$S$unit = {}, _C$MIN$C$H$C$S$unit[MIN] = MILLISECONDS_A_MINUTE, _C$MIN$C$H$C$S$unit[H] = MILLISECONDS_A_HOUR, _C$MIN$C$H$C$S$unit[S] = MILLISECONDS_A_SECOND, _C$MIN$C$H$C$S$unit)[unit] || 1;
    var nextTimeStamp = this.$d.getTime() + number * step;
    return Utils.w(nextTimeStamp, this);
  };
  _proto.subtract = function subtract(number, string) {
    return this.add(number * -1, string);
  };
  _proto.format = function format2(formatStr) {
    var _this3 = this;
    var locale = this.$locale();
    if (!this.isValid())
      return locale.invalidDate || INVALID_DATE_STRING;
    var str = formatStr || FORMAT_DEFAULT;
    var zoneStr = Utils.z(this);
    var $H = this.$H, $m = this.$m, $M = this.$M;
    var weekdays = locale.weekdays, months = locale.months, meridiem = locale.meridiem;
    var getShort = function getShort2(arr, index2, full, length) {
      return arr && (arr[index2] || arr(_this3, str)) || full[index2].substr(0, length);
    };
    var get$H = function get$H2(num) {
      return Utils.s($H % 12 || 12, num, "0");
    };
    var meridiemFunc = meridiem || function(hour, minute, isLowercase) {
      var m = hour < 12 ? "AM" : "PM";
      return isLowercase ? m.toLowerCase() : m;
    };
    var matches = {
      YY: String(this.$y).slice(-2),
      YYYY: this.$y,
      M: $M + 1,
      MM: Utils.s($M + 1, 2, "0"),
      MMM: getShort(locale.monthsShort, $M, months, 3),
      MMMM: getShort(months, $M),
      D: this.$D,
      DD: Utils.s(this.$D, 2, "0"),
      d: String(this.$W),
      dd: getShort(locale.weekdaysMin, this.$W, weekdays, 2),
      ddd: getShort(locale.weekdaysShort, this.$W, weekdays, 3),
      dddd: weekdays[this.$W],
      H: String($H),
      HH: Utils.s($H, 2, "0"),
      h: get$H(1),
      hh: get$H(2),
      a: meridiemFunc($H, $m, true),
      A: meridiemFunc($H, $m, false),
      m: String($m),
      mm: Utils.s($m, 2, "0"),
      s: String(this.$s),
      ss: Utils.s(this.$s, 2, "0"),
      SSS: Utils.s(this.$ms, 3, "0"),
      Z: zoneStr
    };
    return str.replace(REGEX_FORMAT, function(match, $1) {
      return $1 || matches[match] || zoneStr.replace(":", "");
    });
  };
  _proto.utcOffset = function utcOffset() {
    return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
  };
  _proto.diff = function diff(input, units, _float) {
    var _C$Y$C$M$C$Q$C$W$C$D$;
    var unit = Utils.p(units);
    var that = dayjs(input);
    var zoneDelta = (that.utcOffset() - this.utcOffset()) * MILLISECONDS_A_MINUTE;
    var diff2 = this - that;
    var result = Utils.m(this, that);
    result = (_C$Y$C$M$C$Q$C$W$C$D$ = {}, _C$Y$C$M$C$Q$C$W$C$D$[Y] = result / 12, _C$Y$C$M$C$Q$C$W$C$D$[M] = result, _C$Y$C$M$C$Q$C$W$C$D$[Q] = result / 3, _C$Y$C$M$C$Q$C$W$C$D$[W] = (diff2 - zoneDelta) / MILLISECONDS_A_WEEK, _C$Y$C$M$C$Q$C$W$C$D$[D] = (diff2 - zoneDelta) / MILLISECONDS_A_DAY, _C$Y$C$M$C$Q$C$W$C$D$[H] = diff2 / MILLISECONDS_A_HOUR, _C$Y$C$M$C$Q$C$W$C$D$[MIN] = diff2 / MILLISECONDS_A_MINUTE, _C$Y$C$M$C$Q$C$W$C$D$[S] = diff2 / MILLISECONDS_A_SECOND, _C$Y$C$M$C$Q$C$W$C$D$)[unit] || diff2;
    return _float ? result : Utils.a(result);
  };
  _proto.daysInMonth = function daysInMonth() {
    return this.endOf(M).$D;
  };
  _proto.$locale = function $locale() {
    return Ls[this.$L];
  };
  _proto.locale = function locale(preset, object) {
    if (!preset)
      return this.$L;
    var that = this.clone();
    var nextLocaleName = parseLocale(preset, object, true);
    if (nextLocaleName)
      that.$L = nextLocaleName;
    return that;
  };
  _proto.clone = function clone2() {
    return Utils.w(this.$d, this);
  };
  _proto.toDate = function toDate() {
    return new Date(this.valueOf());
  };
  _proto.toJSON = function toJSON() {
    return this.isValid() ? this.toISOString() : null;
  };
  _proto.toISOString = function toISOString() {
    return this.$d.toISOString();
  };
  _proto.toString = function toString() {
    return this.$d.toUTCString();
  };
  return Dayjs2;
}();
var proto = Dayjs.prototype;
dayjs.prototype = proto;
[["$ms", MS], ["$s", S], ["$m", MIN], ["$H", H], ["$W", D], ["$M", M], ["$y", Y], ["$D", DATE]].forEach(function(g) {
  proto[g[1]] = function(input) {
    return this.$g(input, g[0], g[1]);
  };
});
dayjs.extend = function(plugin, option) {
  if (!plugin.$i) {
    plugin(option, Dayjs, dayjs);
    plugin.$i = true;
  }
  return dayjs;
};
dayjs.locale = parseLocale;
dayjs.isDayjs = isDayjs;
dayjs.unix = function(timestamp) {
  return dayjs(timestamp * 1e3);
};
dayjs.en = Ls[L];
dayjs.Ls = Ls;
dayjs.p = {};
var relativeTime = function(o, c, d2) {
  o = o || {};
  var proto2 = c.prototype;
  var relObj = {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  };
  d2.en.relativeTime = relObj;
  proto2.fromToBase = function(input, withoutSuffix, instance, isFrom, postFormat) {
    var loc = instance.$locale().relativeTime || relObj;
    var T = o.thresholds || [{
      l: "s",
      r: 44,
      d: S
    }, {
      l: "m",
      r: 89
    }, {
      l: "mm",
      r: 44,
      d: MIN
    }, {
      l: "h",
      r: 89
    }, {
      l: "hh",
      r: 21,
      d: H
    }, {
      l: "d",
      r: 35
    }, {
      l: "dd",
      r: 25,
      d: D
    }, {
      l: "M",
      r: 45
    }, {
      l: "MM",
      r: 10,
      d: M
    }, {
      l: "y",
      r: 17
    }, {
      l: "yy",
      d: Y
    }];
    var Tl = T.length;
    var result;
    var out;
    var isFuture;
    for (var i = 0; i < Tl; i += 1) {
      var t = T[i];
      if (t.d) {
        result = isFrom ? d2(input).diff(instance, t.d, true) : instance.diff(input, t.d, true);
      }
      var abs = (o.rounding || Math.round)(Math.abs(result));
      isFuture = result > 0;
      if (abs <= t.r || !t.r) {
        if (abs <= 1 && i > 0)
          t = T[i - 1];
        var format2 = loc[t.l];
        if (postFormat) {
          abs = postFormat("" + abs);
        }
        if (typeof format2 === "string") {
          out = format2.replace("%d", abs);
        } else {
          out = format2(abs, withoutSuffix, t.l, isFuture);
        }
        break;
      }
    }
    if (withoutSuffix)
      return out;
    var pastOrFuture = isFuture ? loc.future : loc.past;
    if (typeof pastOrFuture === "function") {
      return pastOrFuture(out);
    }
    return pastOrFuture.replace("%s", out);
  };
  function fromTo(input, withoutSuffix, instance, isFrom) {
    return proto2.fromToBase(input, withoutSuffix, instance, isFrom);
  }
  proto2.to = function(input, withoutSuffix) {
    return fromTo(input, withoutSuffix, this, true);
  };
  proto2.from = function(input, withoutSuffix) {
    return fromTo(input, withoutSuffix, this);
  };
  var makeNow = function makeNow2(thisDay) {
    return thisDay.$u ? d2.utc() : d2();
  };
  proto2.toNow = function(withoutSuffix) {
    return this.to(makeNow(this), withoutSuffix);
  };
  proto2.fromNow = function(withoutSuffix) {
    return this.from(makeNow(this), withoutSuffix);
  };
};
dayjs.extend(relativeTime);
var Time = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let title;
  let $$restProps = compute_rest_props($$props, ["timestamp", "format", "relative", "live", "formatted"]);
  let { timestamp = new Date().toISOString() } = $$props;
  let { format: format2 = "MMM DD, YYYY" } = $$props;
  let { relative = false } = $$props;
  let { live = false } = $$props;
  let { formatted = "" } = $$props;
  if ($$props.timestamp === void 0 && $$bindings.timestamp && timestamp !== void 0)
    $$bindings.timestamp(timestamp);
  if ($$props.format === void 0 && $$bindings.format && format2 !== void 0)
    $$bindings.format(format2);
  if ($$props.relative === void 0 && $$bindings.relative && relative !== void 0)
    $$bindings.relative(relative);
  if ($$props.live === void 0 && $$bindings.live && live !== void 0)
    $$bindings.live(live);
  if ($$props.formatted === void 0 && $$bindings.formatted && formatted !== void 0)
    $$bindings.formatted(formatted);
  formatted = relative ? dayjs(timestamp).from() : dayjs(timestamp).format(format2);
  title = relative ? timestamp : void 0;
  return `<time${spread([
    escape_object($$restProps),
    { title: escape_attribute_value(title) },
    {
      datetime: escape_attribute_value(timestamp)
    }
  ])}>${escape(formatted)}</time>`;
});
var css$8 = {
  code: ".svelte-spinner.svelte-1bbsd2f{transition-property:transform;animation-name:svelte-1bbsd2f-svelte-spinner_infinite-spin;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes svelte-1bbsd2f-svelte-spinner_infinite-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script>\\n  export let size = 25;\\n  export let speed = 750;\\n  export let color = 'rgba(0,0,0,0.4)';\\n  export let thickness = 2;\\n  export let gap = 40;\\n  export let radius = 10;\\n\\n  let dash;\\n  $: dash = 2 * Math.PI * radius * (100 - gap) / 100\\n<\/script>\\n\\n<svg\\n  height=\\"{size}\\"\\n  width=\\"{size}\\"\\n  style=\\"animation-duration:{speed}ms;\\"\\n  class=\\"svelte-spinner\\"\\n  viewbox=\\"0 0 32 32\\"\\n>\\n  <circle\\n    role=\\"presentation\\"\\n    cx=\\"16\\"\\n    cy=\\"16\\"\\n    r=\\"{radius}\\"\\n    stroke=\\"{color}\\"\\n    fill=\\"none\\"\\n    stroke-width=\\"{thickness}\\"\\n    stroke-dasharray=\\"{dash},100\\"\\n    stroke-linecap=\\"round\\"\\n  />\\n</svg>\\n\\n<style>\\n  .svelte-spinner {\\n    transition-property: transform;\\n    animation-name: svelte-spinner_infinite-spin;\\n    animation-iteration-count: infinite;\\n    animation-timing-function: linear;\\n  }\\n  @keyframes svelte-spinner_infinite-spin {\\n    from { transform: rotate(0deg); }\\n    to { transform: rotate(360deg); }\\n  }\\n</style>\\n"],"names":[],"mappings":"AAiCE,eAAe,eAAC,CAAC,AACf,mBAAmB,CAAE,SAAS,CAC9B,cAAc,CAAE,2CAA4B,CAC5C,yBAAyB,CAAE,QAAQ,CACnC,yBAAyB,CAAE,MAAM,AACnC,CAAC,AACD,WAAW,2CAA6B,CAAC,AACvC,IAAI,AAAC,CAAC,AAAC,SAAS,CAAE,OAAO,IAAI,CAAC,AAAE,CAAC,AACjC,EAAE,AAAC,CAAC,AAAC,SAAS,CAAE,OAAO,MAAM,CAAC,AAAE,CAAC,AACnC,CAAC"}`
};
var Src = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { size = 25 } = $$props;
  let { speed = 750 } = $$props;
  let { color = "rgba(0,0,0,0.4)" } = $$props;
  let { thickness = 2 } = $$props;
  let { gap = 40 } = $$props;
  let { radius = 10 } = $$props;
  let dash;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.speed === void 0 && $$bindings.speed && speed !== void 0)
    $$bindings.speed(speed);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.thickness === void 0 && $$bindings.thickness && thickness !== void 0)
    $$bindings.thickness(thickness);
  if ($$props.gap === void 0 && $$bindings.gap && gap !== void 0)
    $$bindings.gap(gap);
  if ($$props.radius === void 0 && $$bindings.radius && radius !== void 0)
    $$bindings.radius(radius);
  $$result.css.add(css$8);
  dash = 2 * Math.PI * radius * (100 - gap) / 100;
  return `<svg${add_attribute("height", size, 0)}${add_attribute("width", size, 0)} style="${"animation-duration:" + escape(speed) + "ms;"}" class="${"svelte-spinner svelte-1bbsd2f"}" viewBox="${"0 0 32 32"}"><circle role="${"presentation"}" cx="${"16"}" cy="${"16"}"${add_attribute("r", radius, 0)}${add_attribute("stroke", color, 0)} fill="${"none"}"${add_attribute("stroke-width", thickness, 0)} stroke-dasharray="${escape(dash) + ",100"}" stroke-linecap="${"round"}"></circle></svg>`;
});
var css$7 = {
  code: ".card-body.svelte-1ra4b4o.svelte-1ra4b4o{padding:0}.card-body.svelte-1ra4b4o a.svelte-1ra4b4o{color:var(--link-color);text-decoration:none;font-weight:bold;transition:0.3s}.card-body.svelte-1ra4b4o a.svelte-1ra4b4o:hover{text-decoration:underline;color:var(--link-color)}.table-datasets.svelte-1ra4b4o time{white-space:nowrap}.action-link.svelte-1ra4b4o.svelte-1ra4b4o{font-size:80%;text-transform:uppercase}.action-link[disabled].svelte-1ra4b4o.svelte-1ra4b4o{opacity:0.5;cursor:not-allowed}#form-group-api-key.svelte-1ra4b4o.svelte-1ra4b4o{display:flex}#form-group-api-key.svelte-1ra4b4o input.svelte-1ra4b4o{max-width:400px;margin-right:20px}",
  map: '{"version":3,"file":"datasets.svelte","sources":["datasets.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\timport { browser, dev } from \'$app/env\';\\n\\n\\texport const hydrate = true;\\n\\n\\t// ...but if the client-side router is already loaded\\n\\t// (i.e. we came here from elsewhere in the app), use it\\n\\texport const router = browser;\\n\\n\\t// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a\\n\\texport async function load({ page, session, fetch, context }) {\\n\\t\\tconst url = `https://candlelightdinner.tradingstrategy.ai/datasets`;\\n\\t\\tconst res = await fetch(url);\\n\\n\\t\\tconst datasets = await res.json();\\n\\n\\t\\tif (res.ok) {\\n\\t\\t\\treturn {\\n\\t\\t\\t\\tprops: {\\n\\t\\t\\t\\t\\tdatasets\\n\\t\\t\\t\\t}\\n\\t\\t\\t};\\n\\t\\t}\\n\\n\\t\\treturn {\\n\\t\\t\\tstatus: res.status,\\n\\t\\t\\terror: new Error(`Could not load ${url}`)\\n\\t\\t};\\n\\t}\\n\\n<\/script>\\n\\n<script>\\n\\timport Time from \\"svelte-time\\";\\n\\timport Spinner from \'svelte-spinner\';\\n\\n\\texport let datasets;\\n\\texport let submitting = false;\\n\\texport let validApiKey = null;\\n\\texport let apiKeyError = null;\\n\\n\\n\\tconst apiUrl = \\"https://candlelightdinner.tradingstrategy.ai\\";\\n\\n\\tfunction formatNumber(n) {\\n\\t\\tif(n <= 1000) {\\n\\t\\t\\treturn (n/1000).toLocaleString(\\"en\\",  {minimumFractionDigits: 3, maximumFractionDigits: 3})\\n\\t\\t} else{\\n\\t\\t\\treturn (n/1000).toLocaleString(\\"en\\",  {minimumFractionDigits: 0, maximumFractionDigits: 0})\\n\\t\\t}\\n\\t}\\n\\n\\tfunction formatSize(n) {\\n\\t\\tif(n <= 1024*1024) {\\n\\t\\t\\treturn (n/(1024*1024)).toLocaleString(\\"en\\",  {minimumFractionDigits: 3, maximumFractionDigits: 3})\\n\\t\\t} else{\\n\\t\\t\\treturn (n/(1024*1024)).toLocaleString(\\"en\\",  {minimumFractionDigits: 0, maximumFractionDigits: 0})\\n\\t\\t}\\n\\t}\\n\\n\\tfunction formatDownloadLink(key, link) {\\n\\t\\t// Cannot downlaod without API key\\n\\t\\tif(!validApiKey) {\\n\\t\\t\\treturn \\"javascript:\\";\\n\\t\\t}\\n\\n\\t\\tconst url = new URL(link);\\n\\t\\turl.searchParams.set(\\"api-key\\", key);\\n\\t\\treturn url.toString();\\n\\t}\\n\\n\\tasync function handleSubmit(event) {\\n\\n\\t\\tconst url = `${apiUrl}/validate-api-key`;\\n\\t\\tlet key = event.target.apiKey.value;\\n\\n\\t\\t// Avoid whitespace issues\\n\\t\\tkey = key.trim();\\n\\n\\t\\tapiKeyError = null;\\n\\t\\tsubmitting = true;\\n\\n\\t\\ttry {\\n\\n\\t\\t\\t// https://stackoverflow.com/a/53189376/315168\\n\\t\\t\\tconsole.log(\\"Posting to\\", url);\\n\\t\\t\\tconst res = await fetch(url, {\\n\\t\\t\\t\\tmethod: \'POST\',\\n\\t\\t\\t\\tbody: new URLSearchParams({key})\\n\\t\\t\\t});\\n\\n\\t\\t\\tif(res.status != 200) {\\n\\t\\t\\t\\tapiKeyError = `Server failure: ${res.status} ${res.statusText}`;\\n\\t\\t\\t\\treturn;\\n\\t\\t\\t}\\n\\n\\t\\t\\tconst data = await res.json();\\n\\n\\t\\t\\tconsole.log(\\"Got validation response\\", data);\\n\\n\\t\\t\\tif(!data.valid) {\\n\\t\\t\\t\\tapiKeyError = \\"The API key is not valid\\";\\n\\t\\t\\t}\\n\\n\\t\\t\\tvalidApiKey = key;\\n\\n\\t\\t} catch(e) {\\n\\t\\t\\tapiKeyError = e.toString();\\n\\t\\t} finally {\\n\\t\\t\\tsubmitting = false;\\n\\t\\t}\\n\\t}\\n\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>DEX trading and quantative finance datasets</title>\\n\\t<meta name=\\"description\\" content=\\"Download OHLCV and liquidity data for DEXes\\">\\n</svelte:head>\\n\\n<div class=\\"container container-main\\">\\n\\t<section class=\\"md-12\\">\\n\\t\\t<div class=\\"card\\">\\n\\t\\t\\t<div class=\\"card-body\\">\\n\\t\\t\\t\\t<h1>On-chain trading data for backtesting</h1>\\n\\n\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\tThe following on-chain trade and liquidity datasets are available for decentralised finance (DeFi) research,\\n\\t\\t\\t\\t\\tcryptocurrency algorithmic trading, automated trading strategy research and execution.\\n\\t\\t\\t\\t</p>\\n\\n\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\tYou can download the datasets with an API key. Request an API key via Telegram or <a href=\\"https://tradingstrategy.ai/docs/\\">Python client registration.</a>\\n\\t\\t\\t\\t</p>\\n\\n\\t\\t\\t\\t<h2>Supported blockchains and DEXes</h2>\\n\\n\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\tThese datasets contain trade and liquidity data from several blockchains and\\n\\t\\t\\t\\t\\t<a href=\\"https://tradingstrategy.ai/docs/glossary.html#term-AMM\\">automatic market maker (AMM)</a> exchanges. The supported blockchains include popular\\n\\t\\t\\t\\t\\tEthereum, Binance Smart Chain <span class=\\"badge text-uppercase\\">Coming soon</span>, Polygon <span class=\\"badge text-uppercase\\">Coming soon</span>\\n\\t\\t\\t\\t\\tand Avalanche <span class=\\"badge text-uppercase\\">Coming soon</span>.\\n\\t\\t\\t\\t</p>\\n\\n\\t\\t\\t\\t<h2>Data logistics</h2>\\n\\n\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\tDatasets are distributed in <a href=\\"https://parquet.apache.org/\\">Parquet</a> file format\\n\\t\\t\\t\\t\\tdesigned for data research. Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.\\n\\t\\t\\t\\t</p>\\n\\n\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\tDatasets are large. Datasets are compressed using Parquet built-in Snappy compression and may be considerably larger when expanded to RAM.\\n\\t\\t\\t\\t\\tWe expect you to download the dataset, cache the resulting file on a local disk and\\n\\t\\t\\t\\t\\tperform your own strategy specific trading pair filtering before using the data. Uncompressed one minute\\n\\t\\t\\t\\t\\tcandle data takes several gigabyte of memory.\\n\\t\\t\\t\\t</p>\\n\\n\\t\\t\\t\\t<h2>Learn more</h2>\\n\\n\\t\\t\\t\\t<ul>\\n\\t\\t\\t\\t\\t<li>\\n\\t\\t\\t\\t\\t\\t<a href=\\"https://tradingstrategy.ai/docs/\\">Getting started</a>\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t<li>\\n\\t\\t\\t\\t\\t\\t<a href=\\"https://tradingstrategy.ai/docs/\\">Documentation</a>\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t<li>\\n\\t\\t\\t\\t\\t\\t<a href=\\"https://github.com/tradingstrategy-ai/client\\">Github</a>\\n\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t</ul>\\n\\n\\t\\t\\t\\t<h2>Available datasets</h2>\\n\\n\\t\\t\\t\\t{#if !validApiKey}\\n\\t\\t\\t\\t\\t<form id=\\"form-api-key\\" class=\\"form-group\\" on:submit|preventDefault=\\"{handleSubmit}\\">\\n\\n\\t\\t\\t\\t\\t\\t<label for=\\"apiKey\\">Enter API key to enable download</label>\\n\\n\\t\\t\\t\\t\\t\\t<!-- <div class=\\"d-flex flex-row justify-content-center\\"> -->\\n\\t\\t\\t\\t\\t\\t<div id=\\"form-group-api-key\\">\\n\\n\\t\\t\\t\\t\\t\\t\\t<input class=\\"form-control form-group-api-key-item\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t   id=\\"apiKey\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t   placeholder=\\"secret-token:tradingstrategy-\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t   type=\\"text\\">\\n\\n\\n\\t\\t\\t\\t\\t\\t\\t<button type=\\"submit\\" class=\\"btn btn-primary form-group-api-key-item\\" disabled={submitting}>Enter</button>\\n\\n\\t\\t\\t\\t\\t\\t\\t{#if submitting}\\n\\t\\t\\t\\t\\t\\t\\t\\t<Spinner />\\n\\t\\t\\t\\t\\t\\t\\t{/if}\\n\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</form>\\n\\t\\t\\t\\t{/if}\\n\\n\\t\\t\\t\\t{#if apiKeyError}\\n\\t\\t\\t\\t\\t<div class=\\"alert alert-danger shadow-soft\\" role=\\"alert\\">\\n            \\t\\t\\t<span class=\\"alert-inner--text\\">{apiKeyError}</span>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t{/if}\\n\\n\\t\\t\\t\\t{#if validApiKey}\\n\\t\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\t\\tUsing API key <strong>{validApiKey}</strong>\\n\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t{/if}\\n\\n\\t\\t\\t\\t<div class=\\"table-responsive\\">\\n\\t\\t\\t\\t\\t<table class=\\"table table-datasets\\">\\n\\t\\t\\t\\t\\t\\t<thead>\\n\\t\\t\\t\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Name</th>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Tag</th>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Entry count (k)</th>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Size (MBytes)</th>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Format</th>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Last updated</th>\\n\\t\\t\\t\\t\\t\\t\\t\\t<th>Links</th>\\n\\t\\t\\t\\t\\t\\t\\t</tr>\\n\\t\\t\\t\\t\\t\\t</thead>\\n\\n\\t\\t\\t\\t\\t\\t<tbody>\\n\\t\\t\\t\\t\\t\\t\\t{#each datasets as row }\\n\\t\\t\\t\\t\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>{row.name}</td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>{row.designation}</td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>{formatNumber(row.entries)}</td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>{formatSize(row.size)}</td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>{row.format}</td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t<Time relative timestamp=\\"{new Date(row.last_updated_at * 1000)}\\" />\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t</td>\\n\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t<td>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t<a class=action-link href={row.documentation}>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tDocumentation\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t</a>\\n\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t<a class=action-link target=\\"{validApiKey ? `_blank` : undefined}\\" href=\\"{formatDownloadLink(validApiKey, row.download_link)}\\" disabled=\\"{validApiKey ? undefined : \'disabled\'}\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tDownload\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t</td>\\n\\n\\t\\t\\t\\t\\t\\t\\t\\t</tr>\\n\\t\\t\\t\\t\\t\\t\\t{/each}\\n\\t\\t\\t\\t\\t\\t</tbody>\\n\\t\\t\\t\\t\\t</table>\\n\\t\\t\\t\\t</div>\\n\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</section>\\n</div>\\n\\n<style>\\n\\n\\t.card-body {\\n\\t\\t/* Align text left edge with logo */\\n\\t\\tpadding: 0;\\n\\t}\\n\\n\\t.card-body a {\\n\\t  \\tcolor: var(--link-color);\\n\\t  \\ttext-decoration: none;\\n\\t  \\tfont-weight: bold;\\n\\t\\ttransition: 0.3s;\\n\\t}\\n\\n\\t.card-body a:hover {\\n\\t  text-decoration: underline;\\n\\t  color: var(--link-color);\\n\\t}\\n\\n\\t.table-datasets :global(time) {\\n\\t\\twhite-space: nowrap;\\n\\t}\\n\\n\\t.action-link {\\n\\t\\tfont-size: 80%;\\n\\t\\ttext-transform: uppercase;\\n\\t}\\n\\n\\t.action-link[disabled] {\\n\\t\\topacity: 0.5;\\n\\t\\tcursor: not-allowed;\\n\\t}\\n\\n\\t#form-group-api-key {\\n\\t\\tdisplay: flex;\\n\\t}\\n\\n\\t#form-group-api-key input {\\n\\t\\tmax-width: 400px;\\n\\t\\tmargin-right: 20px;\\n\\t}\\n\\n</style>\\n"],"names":[],"mappings":"AAmQC,UAAU,8BAAC,CAAC,AAEX,OAAO,CAAE,CAAC,AACX,CAAC,AAED,yBAAU,CAAC,CAAC,eAAC,CAAC,AACX,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,eAAe,CAAE,IAAI,CACrB,WAAW,CAAE,IAAI,CACnB,UAAU,CAAE,IAAI,AACjB,CAAC,AAED,yBAAU,CAAC,gBAAC,MAAM,AAAC,CAAC,AAClB,eAAe,CAAE,SAAS,CAC1B,KAAK,CAAE,IAAI,YAAY,CAAC,AAC1B,CAAC,AAED,8BAAe,CAAC,AAAQ,IAAI,AAAE,CAAC,AAC9B,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,YAAY,8BAAC,CAAC,AACb,SAAS,CAAE,GAAG,CACd,cAAc,CAAE,SAAS,AAC1B,CAAC,AAED,YAAY,CAAC,QAAQ,CAAC,8BAAC,CAAC,AACvB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WAAW,AACpB,CAAC,AAED,mBAAmB,8BAAC,CAAC,AACpB,OAAO,CAAE,IAAI,AACd,CAAC,AAED,kCAAmB,CAAC,KAAK,eAAC,CAAC,AAC1B,SAAS,CAAE,KAAK,CAChB,YAAY,CAAE,IAAI,AACnB,CAAC"}'
};
var hydrate = true;
var router = browser;
async function load$2({ page, session, fetch: fetch2, context }) {
  const url = `https://candlelightdinner.tradingstrategy.ai/datasets`;
  const res = await fetch2(url);
  const datasets2 = await res.json();
  if (res.ok) {
    return { props: { datasets: datasets2 } };
  }
  return {
    status: res.status,
    error: new Error(`Could not load ${url}`)
  };
}
function formatNumber(n) {
  if (n <= 1e3) {
    return (n / 1e3).toLocaleString("en", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  } else {
    return (n / 1e3).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}
function formatSize(n) {
  if (n <= 1024 * 1024) {
    return (n / (1024 * 1024)).toLocaleString("en", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  } else {
    return (n / (1024 * 1024)).toLocaleString("en", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}
var Datasets = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { datasets: datasets2 } = $$props;
  let { submitting = false } = $$props;
  let { validApiKey = null } = $$props;
  let { apiKeyError = null } = $$props;
  function formatDownloadLink(key, link) {
    if (!validApiKey) {
      return "javascript:";
    }
    const url = new URL(link);
    url.searchParams.set("api-key", key);
    return url.toString();
  }
  if ($$props.datasets === void 0 && $$bindings.datasets && datasets2 !== void 0)
    $$bindings.datasets(datasets2);
  if ($$props.submitting === void 0 && $$bindings.submitting && submitting !== void 0)
    $$bindings.submitting(submitting);
  if ($$props.validApiKey === void 0 && $$bindings.validApiKey && validApiKey !== void 0)
    $$bindings.validApiKey(validApiKey);
  if ($$props.apiKeyError === void 0 && $$bindings.apiKeyError && apiKeyError !== void 0)
    $$bindings.apiKeyError(apiKeyError);
  $$result.css.add(css$7);
  return `${$$result.head += `${$$result.title = `<title>DEX trading and quantative finance datasets</title>`, ""}<meta name="${"description"}" content="${"Download OHLCV and liquidity data for DEXes"}" data-svelte="svelte-1z0fwv1">`, ""}

<div class="${"container container-main"}"><section class="${"md-12"}"><div class="${"card"}"><div class="${"card-body svelte-1ra4b4o"}"><h1>On-chain trading data for backtesting</h1>

				<p>The following on-chain trade and liquidity datasets are available for decentralised finance (DeFi) research,
					cryptocurrency algorithmic trading, automated trading strategy research and execution.
				</p>

				<p>You can download the datasets with an API key. Request an API key via Telegram or <a href="${"https://tradingstrategy.ai/docs/"}" class="${"svelte-1ra4b4o"}">Python client registration.</a></p>

				<h2>Supported blockchains and DEXes</h2>

				<p>These datasets contain trade and liquidity data from several blockchains and
					<a href="${"https://tradingstrategy.ai/docs/glossary.html#term-AMM"}" class="${"svelte-1ra4b4o"}">automatic market maker (AMM)</a> exchanges. The supported blockchains include popular
					Ethereum, Binance Smart Chain <span class="${"badge text-uppercase"}">Coming soon</span>, Polygon <span class="${"badge text-uppercase"}">Coming soon</span>
					and Avalanche <span class="${"badge text-uppercase"}">Coming soon</span>.
				</p>

				<h2>Data logistics</h2>

				<p>Datasets are distributed in <a href="${"https://parquet.apache.org/"}" class="${"svelte-1ra4b4o"}">Parquet</a> file format
					designed for data research. Parquet is a columnar data format for high performance in-memory datasets from Apache Arrow project.
				</p>

				<p>Datasets are large. Datasets are compressed using Parquet built-in Snappy compression and may be considerably larger when expanded to RAM.
					We expect you to download the dataset, cache the resulting file on a local disk and
					perform your own strategy specific trading pair filtering before using the data. Uncompressed one minute
					candle data takes several gigabyte of memory.
				</p>

				<h2>Learn more</h2>

				<ul><li><a href="${"https://tradingstrategy.ai/docs/"}" class="${"svelte-1ra4b4o"}">Getting started</a></li>
					<li><a href="${"https://tradingstrategy.ai/docs/"}" class="${"svelte-1ra4b4o"}">Documentation</a></li>
					<li><a href="${"https://github.com/tradingstrategy-ai/client"}" class="${"svelte-1ra4b4o"}">Github</a></li></ul>

				<h2>Available datasets</h2>

				${!validApiKey ? `<form id="${"form-api-key"}" class="${"form-group"}"><label for="${"apiKey"}">Enter API key to enable download</label>

						
						<div id="${"form-group-api-key"}" class="${"svelte-1ra4b4o"}"><input class="${"form-control form-group-api-key-item svelte-1ra4b4o"}" id="${"apiKey"}" placeholder="${"secret-token:tradingstrategy-"}" type="${"text"}">


							<button type="${"submit"}" class="${"btn btn-primary form-group-api-key-item"}" ${submitting ? "disabled" : ""}>Enter</button>

							${submitting ? `${validate_component(Src, "Spinner").$$render($$result, {}, {}, {})}` : ``}</div></form>` : ``}

				${apiKeyError ? `<div class="${"alert alert-danger shadow-soft"}" role="${"alert"}"><span class="${"alert-inner--text"}">${escape(apiKeyError)}</span></div>` : ``}

				${validApiKey ? `<p>Using API key <strong>${escape(validApiKey)}</strong></p>` : ``}

				<div class="${"table-responsive"}"><table class="${"table table-datasets svelte-1ra4b4o"}"><thead><tr><th>Name</th>
								<th>Tag</th>
								<th>Entry count (k)</th>
								<th>Size (MBytes)</th>
								<th>Format</th>
								<th>Last updated</th>
								<th>Links</th></tr></thead>

						<tbody>${each(datasets2, (row) => `<tr><td>${escape(row.name)}</td>
									<td>${escape(row.designation)}</td>
									<td>${escape(formatNumber(row.entries))}</td>
									<td>${escape(formatSize(row.size))}</td>
									<td>${escape(row.format)}</td>
									<td>${validate_component(Time, "Time").$$render($$result, {
    relative: true,
    timestamp: new Date(row.last_updated_at * 1e3)
  }, {}, {})}</td>

									<td><a class="${"action-link svelte-1ra4b4o"}"${add_attribute("href", row.documentation, 0)}>Documentation
										</a>

										<a class="${"action-link svelte-1ra4b4o"}"${add_attribute("target", validApiKey ? `_blank` : void 0, 0)}${add_attribute("href", formatDownloadLink(validApiKey, row.download_link), 0)} ${(validApiKey ? void 0 : "disabled") ? "disabled" : ""}>Download
										</a></td>

								</tr>`)}</tbody></table></div></div></div></section>
</div>`;
});
var datasets = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Datasets,
  hydrate,
  router,
  load: load$2
});
var backendUrl = "https://tradingstrategy.ai/api";
if (backendUrl.endsWith("/")) {
  throw new Error(`Backend URL cannot end with slash: ${backendUrl}`);
}
var css$6 = {
  code: "a.svelte-bc6n0p{font-weight:normal;border-bottom:1px dotted black;margin-left:10px;display:inline-block;min-width:30px}.active.svelte-bc6n0p{font-weight:bold;border-bottom:1px solid black}",
  map: `{"version":3,"file":"TimeBucketSelector.svelte","sources":["TimeBucketSelector.svelte"],"sourcesContent":["<script context=\\"module\\" lang=\\"ts\\">const validBuckets = [\\"1m\\", \\"5m\\", \\"15m\\", \\"1h\\", \\"4h\\", \\"1d\\", \\"7d\\", \\"30d\\"];\\n/**\\n * Figure out from the URL fragment which time bucket to choose\\n */\\nexport function fromHashToTimeBucket(hash) {\\n    if (hash) {\\n        if (!hash.startsWith(\\"#\\")) {\\n            throw new Error(\`Does not look like a hash \${hash}\`);\\n        }\\n        const b = hash.substring(1).toLowerCase();\\n        if (validBuckets.includes(b)) {\\n            return b;\\n        }\\n    }\\n    return \\"4h\\";\\n}\\n<\/script>\\n\\n\\n<script lang=\\"ts\\">export let activeBucket = null;\\nfunction onBucketClick(bucket) {\\n    window.location.hash = bucket;\\n    // Strip leading #\\n    activeBucket = fromHashToTimeBucket('#' + bucket);\\n}\\n<\/script>\\n\\n\\n<div class=\\"time-bucket-selector\\">\\n    <span>Candle stick time: </span>\\n    {#each validBuckets as bucket}\\n        <a href={'#' + bucket} class={bucket === activeBucket ? \\"active\\" : \\"\\"} on:click|preventDefault={() => onBucketClick(bucket)}>\\n            {bucket}\\n        </a>\\n    {/each}\\n</div>\\n\\n<style>\\n\\n    a {\\n        font-weight: normal;\\n        border-bottom: 1px dotted black;\\n        margin-left: 10px;\\n        display: inline-block;\\n        min-width: 30px; /* Needed because bold text */\\n    }\\n\\n    .active {\\n        font-weight: bold;\\n        border-bottom: 1px solid black;\\n    }\\n</style>"],"names":[],"mappings":"AAuCI,CAAC,cAAC,CAAC,AACC,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,GAAG,CAAC,MAAM,CAAC,KAAK,CAC/B,WAAW,CAAE,IAAI,CACjB,OAAO,CAAE,YAAY,CACrB,SAAS,CAAE,IAAI,AACnB,CAAC,AAED,OAAO,cAAC,CAAC,AACL,WAAW,CAAE,IAAI,CACjB,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,AAClC,CAAC"}`
};
var validBuckets = ["1m", "5m", "15m", "1h", "4h", "1d", "7d", "30d"];
function fromHashToTimeBucket(hash2) {
  if (hash2) {
    if (!hash2.startsWith("#")) {
      throw new Error(`Does not look like a hash ${hash2}`);
    }
    const b = hash2.substring(1).toLowerCase();
    if (validBuckets.includes(b)) {
      return b;
    }
  }
  return "4h";
}
var TimeBucketSelector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { activeBucket = null } = $$props;
  if ($$props.activeBucket === void 0 && $$bindings.activeBucket && activeBucket !== void 0)
    $$bindings.activeBucket(activeBucket);
  $$result.css.add(css$6);
  return `<div class="${"time-bucket-selector"}"><span>Candle stick time: </span>
    ${each(validBuckets, (bucket) => `<a${add_attribute("href", "#" + bucket, 0)} class="${escape(null_to_empty(bucket === activeBucket ? "active" : "")) + " svelte-bc6n0p"}">${escape(bucket)}
        </a>`)}
</div>`;
});
var TimeBucketSelector$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": TimeBucketSelector,
  fromHashToTimeBucket
});
var css$5 = {
  code: ".skeleton.svelte-1ftty70{width:100%;max-height:80vh}",
  map: `{"version":3,"file":"Skeleton.svelte","sources":["Skeleton.svelte"],"sourcesContent":["<script>\\n    /*\\n\\n        Based on the original work of Denis Stasyev = https://github.com/denisstasyev/svelte-skeleton\\n\\n        Modified for resizeablility and mobile friendliness.\\n\\n     */\\n\\t// export let secondaryColor = '#F5F5F7' // do not use rgba() - not working in Safari on iOS 11\\n\\t// export let primaryColor = '#EBECEF'\\n\\n\\texport let secondaryColor = '#FFF1E5' // do not use rgba() - not working in Safari on iOS 11\\n\\texport let primaryColor = '#CCBEB3'\\n\\n\\texport let height = 200\\n\\texport let width = 400\\n\\texport let speed = 2\\n\\texport let animate = true\\n\\texport let secondaryColorPercentWidth = 100\\n\\n\\tlet idClip = getUniqueId()\\n\\tlet idGradient = getUniqueId()\\n\\n\\tfunction getUniqueId() {\\n\\t\\treturn Math.random().toString(36).substring(2)\\n\\t}\\n<\/script>\\n\\n<svg viewBox=\\"0 0 100 100\\" class=\\"skeleton\\" aria-labelledby=\\"loading-aria\\" preserveAspectRatio=\\"none\\">\\n\\t<rect fill=\\"url(#{idGradient})\\" clip-path=\\"url(#{idClip})\\" {width} {height} x=\\"0\\" y=\\"0\\" />\\n\\t<defs>\\n\\t\\t<clipPath id={idClip}>\\n\\t\\t\\t<slot>\\n\\t\\t\\t\\t<rect width=\\"100%\\" height=\\"100%\\" x=\\"0\\" y=\\"0\\" rx=\\"1\\" ry=\\"1\\" />\\n\\t\\t\\t</slot>\\n\\t\\t</clipPath>\\n\\t\\t<linearGradient\\n\\t\\t\\tid={idGradient}\\n\\t\\t\\tx1=\\"-{secondaryColorPercentWidth}%\\"\\n\\t\\t\\ty1=\\"50%\\"\\n\\t\\t\\tx2=\\"0%\\"\\n\\t\\t\\ty2=\\"50%\\"\\n\\t\\t>\\n\\t\\t\\t{#if animate}\\n\\t\\t\\t\\t<animate\\n\\t\\t\\t\\t\\tattributeName=\\"x1\\"\\n\\t\\t\\t\\t\\tfrom=\\"-{secondaryColorPercentWidth}%\\"\\n\\t\\t\\t\\t\\tto=\\"100%\\"\\n\\t\\t\\t\\t\\tdur=\\"{speed}s\\"\\n\\t\\t\\t\\t\\trepeatCount=\\"indefinite\\"\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<animate\\n\\t\\t\\t\\t\\tattributeName=\\"x2\\"\\n\\t\\t\\t\\t\\tfrom=\\"0%\\"\\n\\t\\t\\t\\t\\tto=\\"{100 + secondaryColorPercentWidth}%\\"\\n\\t\\t\\t\\t\\tdur=\\"{speed}s\\"\\n\\t\\t\\t\\t\\trepeatCount=\\"indefinite\\"\\n\\t\\t\\t\\t/>\\n\\t\\t\\t{/if}\\n\\n\\t\\t\\t<stop stop-color={primaryColor} offset=\\"0%\\" />\\n\\t\\t\\t<stop stop-color={secondaryColor} offset=\\"50%\\" />\\n\\t\\t\\t<stop stop-color={primaryColor} offset=\\"100%\\" />\\n\\t\\t</linearGradient>\\n\\t</defs>\\n</svg>\\n\\n<style>\\n\\t.skeleton {\\n\\t\\twidth: 100%;\\n\\t\\tmax-height: 80vh;\\n\\t}\\n</style>"],"names":[],"mappings":"AAoEC,SAAS,eAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IAAI,AACjB,CAAC"}`
};
function getUniqueId$1() {
  return Math.random().toString(36).substring(2);
}
var Skeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { secondaryColor = "#FFF1E5" } = $$props;
  let { primaryColor = "#CCBEB3" } = $$props;
  let { height = 200 } = $$props;
  let { width = 400 } = $$props;
  let { speed = 2 } = $$props;
  let { animate = true } = $$props;
  let { secondaryColorPercentWidth = 100 } = $$props;
  let idClip = getUniqueId$1();
  let idGradient = getUniqueId$1();
  if ($$props.secondaryColor === void 0 && $$bindings.secondaryColor && secondaryColor !== void 0)
    $$bindings.secondaryColor(secondaryColor);
  if ($$props.primaryColor === void 0 && $$bindings.primaryColor && primaryColor !== void 0)
    $$bindings.primaryColor(primaryColor);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.speed === void 0 && $$bindings.speed && speed !== void 0)
    $$bindings.speed(speed);
  if ($$props.animate === void 0 && $$bindings.animate && animate !== void 0)
    $$bindings.animate(animate);
  if ($$props.secondaryColorPercentWidth === void 0 && $$bindings.secondaryColorPercentWidth && secondaryColorPercentWidth !== void 0)
    $$bindings.secondaryColorPercentWidth(secondaryColorPercentWidth);
  $$result.css.add(css$5);
  return `<svg viewBox="${"0 0 100 100"}" class="${"skeleton svelte-1ftty70"}" aria-labelledby="${"loading-aria"}" preserveAspectRatio="${"none"}"><rect fill="${"url(#" + escape(idGradient) + ")"}" clip-path="${"url(#" + escape(idClip) + ")"}"${add_attribute("width", width, 0)}${add_attribute("height", height, 0)} x="${"0"}" y="${"0"}"></rect><defs><clipPath${add_attribute("id", idClip, 0)}>${slots.default ? slots.default({}) : `
				<rect width="${"100%"}" height="${"100%"}" x="${"0"}" y="${"0"}" rx="${"1"}" ry="${"1"}"></rect>
			`}</clipPath><linearGradient${add_attribute("id", idGradient, 0)} x1="${"-" + escape(secondaryColorPercentWidth) + "%"}" y1="${"50%"}" x2="${"0%"}" y2="${"50%"}">${animate ? `<animate attributeName="${"x1"}" from="${"-" + escape(secondaryColorPercentWidth) + "%"}" to="${"100%"}" dur="${escape(speed) + "s"}" repeatCount="${"indefinite"}"></animate>
				<animate attributeName="${"x2"}" from="${"0%"}" to="${escape(100 + secondaryColorPercentWidth) + "%"}" dur="${escape(speed) + "s"}" repeatCount="${"indefinite"}"></animate>` : ``}<stop${add_attribute("stop-color", primaryColor, 0)} offset="${"0%"}"></stop><stop${add_attribute("stop-color", secondaryColor, 0)} offset="${"50%"}"></stop><stop${add_attribute("stop-color", primaryColor, 0)} offset="${"100%"}"></stop></linearGradient></defs></svg>`;
});
var css$4 = {
  code: "#uplot-wrapper.svelte-18dce2g{width:100%;min-height:600px}",
  map: `{"version":3,"file":"CandleStickChart.svelte","sources":["CandleStickChart.svelte"],"sourcesContent":["<script lang=\\"ts\\">/*\\n\\n    Render candlestick chart using uPlot\\n\\n    https://github.com/leeoniya/uPlot\\n\\n    Because uPlot is client-only library using <canvas> we need to dynamically import it on the client-side.\\n\\n */\\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\nimport Skeleton from '$lib/Skeleton.svelte';\\nimport { browser } from '$app/env';\\nimport { onMount } from 'svelte';\\nimport \\"uplot/dist/uPlot.min.css\\";\\nimport { clearChart, drawCandleStickChart } from \\"./uPlotCandlestickCore.js\\";\\n// See CandleList https://tradingstrategy.ai/api/explorer/\\nexport let candles = null;\\nexport let title = \\"\\";\\n// Dynamically imported uplot\\nlet uPlot;\\nfunction redrawCandles(candles, uPlot) {\\n    if (!uPlot) {\\n        // console.log(\\"uplot not loaded, won't draw candles\\");\\n        return;\\n    }\\n    const elem = document.getElementById(\\"uplot-wrapper\\");\\n    if (!candles) {\\n        // console.log(\\"Skipping candle draw - no candles loaded\\");\\n        clearChart(elem);\\n        return;\\n    }\\n    console.log(\\"Redrawing candles\\", candles);\\n    drawCandleStickChart(uPlot, title, elem, candles);\\n}\\n// https://stackoverflow.com/questions/57030895/whats-the-best-way-to-run-some-code-only-client-side\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\n    if (browser) {\\n        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports\\n        const uplotModule = yield import('uplot');\\n        console.log(\\"uplot dynamically imported\\", uplotModule, uplotModule.default);\\n        // This will trigger candle redraw if candles data was raced faster than uplot\\n        uPlot = uplotModule.default;\\n    }\\n}));\\n$: redrawCandles(candles, uPlot);\\n<\/script>\\n\\n\\n<div class=\\"candle-stick-chart\\">\\n    <div id=\\"uplot-wrapper\\">\\n        {#if candles}\\n            {#if candles.length === 0 }\\n                <p>No data available for the selected period</p>\\n            {:else}\\n                <!-- We should place uplot-wapper here but there is a race condition with uPlot renderer -->\\n            {/if}\\n        {:else}\\n            <Skeleton />\\n        {/if}\\n    </div>\\n</div>\\n\\n<style>\\n    #uplot-wrapper {\\n        width: 100%;\\n        min-height: 600px;\\n    }\\n\\n</style>"],"names":[],"mappings":"AAuEI,cAAc,eAAC,CAAC,AACZ,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,KAAK,AACrB,CAAC"}`
};
var CandleStickChart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve22) {
        resolve22(value);
      });
    }
    return new (P || (P = Promise))(function(resolve22, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve22(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { candles = null } = $$props;
  let { title = "" } = $$props;
  let uPlot2;
  function redrawCandles(candles2, uPlot3) {
    if (!uPlot3) {
      return;
    }
    const elem = document.getElementById("uplot-wrapper");
    if (!candles2) {
      clearChart(elem);
      return;
    }
    console.log("Redrawing candles", candles2);
    drawCandleStickChart(uPlot3, title, elem, candles2);
  }
  if ($$props.candles === void 0 && $$bindings.candles && candles !== void 0)
    $$bindings.candles(candles);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  $$result.css.add(css$4);
  {
    redrawCandles(candles, uPlot2);
  }
  return `<div class="${"candle-stick-chart"}"><div id="${"uplot-wrapper"}" class="${"svelte-18dce2g"}">${candles ? `${candles.length === 0 ? `<p>No data available for the selected period</p>` : ``}` : `${validate_component(Skeleton, "Skeleton").$$render($$result, {}, {}, {})}`}</div>
</div>`;
});
var CandleStickChart$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": CandleStickChart
});
var css$3 = {
  code: ".skeleton-line.svelte-1o1axca{width:100%;min-width:60px;max-height:1rem;display:inline-block}",
  map: `{"version":3,"file":"SkeletonLine.svelte","sources":["SkeletonLine.svelte"],"sourcesContent":["<script>\\n    /*\\n\\n        Based on the original work of Denis Stasyev = https://github.com/denisstasyev/svelte-skeleton\\n\\n        Modified for resizeablility and mobile friendliness.\\n\\n     */\\n\\t// export let secondaryColor = '#F5F5F7' // do not use rgba() - not working in Safari on iOS 11\\n\\t// export let primaryColor = '#EBECEF'\\n\\n\\texport let secondaryColor = '#FFF1E5' // do not use rgba() - not working in Safari on iOS 11\\n\\texport let primaryColor = '#CCBEB3'\\n\\n\\texport let height = 200\\n\\texport let width = 400\\n\\texport let speed = 2\\n\\texport let animate = true\\n\\texport let secondaryColorPercentWidth = 100\\n\\n\\tlet idClip = getUniqueId()\\n\\tlet idGradient = getUniqueId()\\n\\n\\tfunction getUniqueId() {\\n\\t\\treturn Math.random().toString(36).substring(2)\\n\\t}\\n<\/script>\\n\\n<svg viewBox=\\"0 0 100 100\\" class=\\"skeleton-line\\" aria-labelledby=\\"loading-aria\\" preserveAspectRatio=\\"none\\">\\n\\t<rect fill=\\"url(#{idGradient})\\" clip-path=\\"url(#{idClip})\\" {width} {height} x=\\"0\\" y=\\"0\\" />\\n\\t<defs>\\n\\t\\t<clipPath id={idClip}>\\n\\t\\t\\t<slot>\\n\\t\\t\\t\\t<rect width=\\"100%\\" height=\\"100%\\" x=\\"0\\" y=\\"0\\" rx=\\"1\\" ry=\\"1\\" />\\n\\t\\t\\t</slot>\\n\\t\\t</clipPath>\\n\\t\\t<linearGradient\\n\\t\\t\\tid={idGradient}\\n\\t\\t\\tx1=\\"-{secondaryColorPercentWidth}%\\"\\n\\t\\t\\ty1=\\"50%\\"\\n\\t\\t\\tx2=\\"0%\\"\\n\\t\\t\\ty2=\\"50%\\"\\n\\t\\t>\\n\\t\\t\\t{#if animate}\\n\\t\\t\\t\\t<animate\\n\\t\\t\\t\\t\\tattributeName=\\"x1\\"\\n\\t\\t\\t\\t\\tfrom=\\"-{secondaryColorPercentWidth}%\\"\\n\\t\\t\\t\\t\\tto=\\"100%\\"\\n\\t\\t\\t\\t\\tdur=\\"{speed}s\\"\\n\\t\\t\\t\\t\\trepeatCount=\\"indefinite\\"\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<animate\\n\\t\\t\\t\\t\\tattributeName=\\"x2\\"\\n\\t\\t\\t\\t\\tfrom=\\"0%\\"\\n\\t\\t\\t\\t\\tto=\\"{100 + secondaryColorPercentWidth}%\\"\\n\\t\\t\\t\\t\\tdur=\\"{speed}s\\"\\n\\t\\t\\t\\t\\trepeatCount=\\"indefinite\\"\\n\\t\\t\\t\\t/>\\n\\t\\t\\t{/if}\\n\\n\\t\\t\\t<stop stop-color={primaryColor} offset=\\"0%\\" />\\n\\t\\t\\t<stop stop-color={secondaryColor} offset=\\"50%\\" />\\n\\t\\t\\t<stop stop-color={primaryColor} offset=\\"100%\\" />\\n\\t\\t</linearGradient>\\n\\t</defs>\\n</svg>\\n\\n<style>\\n\\t.skeleton-line {\\n\\t\\twidth: 100%;\\n\\t\\tmin-width: 60px;\\n\\t\\tmax-height: 1rem;\\n\\t\\tdisplay: inline-block;\\n\\t}\\n</style>"],"names":[],"mappings":"AAoEC,cAAc,eAAC,CAAC,AACf,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,YAAY,AACtB,CAAC"}`
};
function getUniqueId() {
  return Math.random().toString(36).substring(2);
}
var SkeletonLine = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { secondaryColor = "#FFF1E5" } = $$props;
  let { primaryColor = "#CCBEB3" } = $$props;
  let { height = 200 } = $$props;
  let { width = 400 } = $$props;
  let { speed = 2 } = $$props;
  let { animate = true } = $$props;
  let { secondaryColorPercentWidth = 100 } = $$props;
  let idClip = getUniqueId();
  let idGradient = getUniqueId();
  if ($$props.secondaryColor === void 0 && $$bindings.secondaryColor && secondaryColor !== void 0)
    $$bindings.secondaryColor(secondaryColor);
  if ($$props.primaryColor === void 0 && $$bindings.primaryColor && primaryColor !== void 0)
    $$bindings.primaryColor(primaryColor);
  if ($$props.height === void 0 && $$bindings.height && height !== void 0)
    $$bindings.height(height);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.speed === void 0 && $$bindings.speed && speed !== void 0)
    $$bindings.speed(speed);
  if ($$props.animate === void 0 && $$bindings.animate && animate !== void 0)
    $$bindings.animate(animate);
  if ($$props.secondaryColorPercentWidth === void 0 && $$bindings.secondaryColorPercentWidth && secondaryColorPercentWidth !== void 0)
    $$bindings.secondaryColorPercentWidth(secondaryColorPercentWidth);
  $$result.css.add(css$3);
  return `<svg viewBox="${"0 0 100 100"}" class="${"skeleton-line svelte-1o1axca"}" aria-labelledby="${"loading-aria"}" preserveAspectRatio="${"none"}"><rect fill="${"url(#" + escape(idGradient) + ")"}" clip-path="${"url(#" + escape(idClip) + ")"}"${add_attribute("width", width, 0)}${add_attribute("height", height, 0)} x="${"0"}" y="${"0"}"></rect><defs><clipPath${add_attribute("id", idClip, 0)}>${slots.default ? slots.default({}) : `
				<rect width="${"100%"}" height="${"100%"}" x="${"0"}" y="${"0"}" rx="${"1"}" ry="${"1"}"></rect>
			`}</clipPath><linearGradient${add_attribute("id", idGradient, 0)} x1="${"-" + escape(secondaryColorPercentWidth) + "%"}" y1="${"50%"}" x2="${"0%"}" y2="${"50%"}">${animate ? `<animate attributeName="${"x1"}" from="${"-" + escape(secondaryColorPercentWidth) + "%"}" to="${"100%"}" dur="${escape(speed) + "s"}" repeatCount="${"indefinite"}"></animate>
				<animate attributeName="${"x2"}" from="${"0%"}" to="${escape(100 + secondaryColorPercentWidth) + "%"}" dur="${escape(speed) + "s"}" repeatCount="${"indefinite"}"></animate>` : ``}<stop${add_attribute("stop-color", primaryColor, 0)} offset="${"0%"}"></stop><stop${add_attribute("stop-color", secondaryColor, 0)} offset="${"50%"}"></stop><stop${add_attribute("stop-color", primaryColor, 0)} offset="${"100%"}"></stop></linearGradient></defs></svg>`;
});
var IntersectionObserver_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { element = null } = $$props;
  let { once = false } = $$props;
  let { root = null } = $$props;
  let { rootMargin = "0px" } = $$props;
  let { threshold = 0 } = $$props;
  let { entry = null } = $$props;
  let { intersecting = false } = $$props;
  let { observer = null } = $$props;
  createEventDispatcher();
  if ($$props.element === void 0 && $$bindings.element && element !== void 0)
    $$bindings.element(element);
  if ($$props.once === void 0 && $$bindings.once && once !== void 0)
    $$bindings.once(once);
  if ($$props.root === void 0 && $$bindings.root && root !== void 0)
    $$bindings.root(root);
  if ($$props.rootMargin === void 0 && $$bindings.rootMargin && rootMargin !== void 0)
    $$bindings.rootMargin(rootMargin);
  if ($$props.threshold === void 0 && $$bindings.threshold && threshold !== void 0)
    $$bindings.threshold(threshold);
  if ($$props.entry === void 0 && $$bindings.entry && entry !== void 0)
    $$bindings.entry(entry);
  if ($$props.intersecting === void 0 && $$bindings.intersecting && intersecting !== void 0)
    $$bindings.intersecting(intersecting);
  if ($$props.observer === void 0 && $$bindings.observer && observer !== void 0)
    $$bindings.observer(observer);
  return `${slots.default ? slots.default({ intersecting, entry, observer }) : ``}`;
});
var css$2 = {
  code: "th.svelte-15n5kof{text-align:right;padding-right:5px}.data-row.svelte-15n5kof{font-size:80%}td.svelte-15n5kof{text-align:left}.title.svelte-15n5kof{text-align:center}",
  map: `{"version":3,"file":"TimeSpanPerformance.svelte","sources":["TimeSpanPerformance.svelte"],"sourcesContent":["<script context=\\"module\\">\\n    import { backendUrl } from '$lib/config';\\n<\/script>\\n\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\nimport SkeletonLine from '$lib/SkeletonLine.svelte';\\nimport IntersectionObserver from \\"svelte-intersection-observer\\";\\nimport { formatDollar, formatAmount, formatPriceChange } from \\"$lib/helpers/formatters\\";\\nimport '$lib/styles/price.css';\\n// TimeSpanTradeData, see https://tradingstrategy.ai/api/explorer/#/Pair/web_candles\\n// Set null to have a skeleton loader\\nexport let timeSpanTradeData = null;\\nexport let loadingStarted = false;\\nexport let period = null;\\nexport let title;\\nexport let pairId = null;\\nlet element;\\nlet intersecting = false;\\nfunction loadData() {\\n    return __awaiter(this, void 0, void 0, function* () {\\n        // https://tradingstrategy.ai/api/explorer/#/Pair/web_candles\\n        const params = {\\n            pair_id: pairId,\\n            period: period,\\n        };\\n        const encoded = new URLSearchParams(params);\\n        const apiUrl = \`\${backendUrl}/pair-trade-data?\${encoded}\`;\\n        const resp = yield fetch(apiUrl);\\n        if (!resp.ok) {\\n            console.error(resp);\\n            return;\\n        }\\n        const data = yield resp.json();\\n        timeSpanTradeData = data;\\n    });\\n}\\nfunction triggerLoadWhenVisible(visible) {\\n    return __awaiter(this, void 0, void 0, function* () {\\n        // console.log(\\"Triggered\\", visible);\\n        if (visible) {\\n            // console.log(\\"Visible\\");\\n            if (!timeSpanTradeData && !loadingStarted) {\\n                loadingStarted = true;\\n                yield loadData();\\n            }\\n        }\\n    });\\n}\\nfunction determinePriceChangeClass(timeSpanTradeData) {\\n    if (!timeSpanTradeData) {\\n        return \\"price-change-black\\"; // Data not loaded\\n    }\\n    if (timeSpanTradeData.price_open == timeSpanTradeData.price_close) {\\n        return \\"price-change-black\\";\\n    }\\n    else if (timeSpanTradeData.price_close > timeSpanTradeData.price_open) {\\n        return \\"price-change-green\\";\\n    }\\n    else {\\n        return \\"price-change-red\\";\\n    }\\n}\\n$: triggerLoadWhenVisible(intersecting);\\n// close > open determines if the period was succesful\\n$: priceChangeColorClass = determinePriceChangeClass(timeSpanTradeData);\\n<\/script>\\n\\n<div class=\\"time-span-stats\\">\\n    <IntersectionObserver {element} bind:intersecting once>\\n        <table bind:this={element}>\\n            <tr>\\n                <th class={\\"title \\" + priceChangeColorClass} colspan=\\"2\\">\\n                    {title}\\n                </th>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Change</th>\\n                <td>\\n                    <span class={priceChangeColorClass}>\\n                        {#if timeSpanTradeData}\\n                            {formatPriceChange(timeSpanTradeData.price_close / timeSpanTradeData.price_open - 1)}\\n                        {:else}\\n                            <SkeletonLine />\\n                        {/if}\\n                    </span>\\n                </td>\\n            </tr>\\n\\n\\n            <tr class=\\"data-row\\">\\n                <th>Open price</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatDollar(timeSpanTradeData.price_open)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Highest price</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatDollar(timeSpanTradeData.price_high)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Lowest price</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatDollar(timeSpanTradeData.price_low)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Close price</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatDollar(timeSpanTradeData.price_close)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Highest liquidity</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatDollar(timeSpanTradeData.liquidity_high)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Lowest liquidity</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatDollar(timeSpanTradeData.liquidity_low)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n\\n            <tr class=\\"data-row\\">\\n                <th>Buying trades</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatAmount(timeSpanTradeData.buys)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n            <tr class=\\"data-row\\">\\n                <th>Selling trades</th>\\n                <td>\\n                    {#if timeSpanTradeData}\\n                        {formatAmount(timeSpanTradeData.sells)}\\n                    {:else}\\n                        <SkeletonLine />\\n                    {/if}\\n                </td>\\n            </tr>\\n\\n        </table>\\n    </IntersectionObserver>\\n</div>\\n\\n\\n    <style>\\n\\n        th {\\n            text-align: right;\\n            padding-right: 5px;\\n        }\\n\\n    .data-row {\\n        font-size: 80%;\\n    }\\n\\n    td {\\n        text-align: left;\\n    }\\n\\n    .title {\\n        text-align: center;\\n    }\\n\\n\\n</style>"],"names":[],"mappings":"AAkMQ,EAAE,eAAC,CAAC,AACA,UAAU,CAAE,KAAK,CACjB,aAAa,CAAE,GAAG,AACtB,CAAC,AAEL,SAAS,eAAC,CAAC,AACP,SAAS,CAAE,GAAG,AAClB,CAAC,AAED,EAAE,eAAC,CAAC,AACA,UAAU,CAAE,IAAI,AACpB,CAAC,AAED,MAAM,eAAC,CAAC,AACJ,UAAU,CAAE,MAAM,AACtB,CAAC"}`
};
function determinePriceChangeClass(timeSpanTradeData) {
  if (!timeSpanTradeData) {
    return "price-change-black";
  }
  if (timeSpanTradeData.price_open == timeSpanTradeData.price_close) {
    return "price-change-black";
  } else if (timeSpanTradeData.price_close > timeSpanTradeData.price_open) {
    return "price-change-green";
  } else {
    return "price-change-red";
  }
}
var TimeSpanPerformance = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let priceChangeColorClass;
  var __awaiter2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve22) {
        resolve22(value);
      });
    }
    return new (P || (P = Promise))(function(resolve22, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve22(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  let { timeSpanTradeData = null } = $$props;
  let { loadingStarted = false } = $$props;
  let { period = null } = $$props;
  let { title } = $$props;
  let { pairId = null } = $$props;
  let element;
  let intersecting = false;
  function loadData() {
    return __awaiter2(this, void 0, void 0, function* () {
      const params = { pair_id: pairId, period };
      const encoded = new URLSearchParams(params);
      const apiUrl = `${backendUrl}/pair-trade-data?${encoded}`;
      const resp = yield fetch(apiUrl);
      if (!resp.ok) {
        console.error(resp);
        return;
      }
      const data = yield resp.json();
      timeSpanTradeData = data;
    });
  }
  function triggerLoadWhenVisible(visible) {
    return __awaiter2(this, void 0, void 0, function* () {
      if (visible) {
        if (!timeSpanTradeData && !loadingStarted) {
          loadingStarted = true;
          yield loadData();
        }
      }
    });
  }
  if ($$props.timeSpanTradeData === void 0 && $$bindings.timeSpanTradeData && timeSpanTradeData !== void 0)
    $$bindings.timeSpanTradeData(timeSpanTradeData);
  if ($$props.loadingStarted === void 0 && $$bindings.loadingStarted && loadingStarted !== void 0)
    $$bindings.loadingStarted(loadingStarted);
  if ($$props.period === void 0 && $$bindings.period && period !== void 0)
    $$bindings.period(period);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.pairId === void 0 && $$bindings.pairId && pairId !== void 0)
    $$bindings.pairId(pairId);
  $$result.css.add(css$2);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      triggerLoadWhenVisible(intersecting);
    }
    priceChangeColorClass = determinePriceChangeClass(timeSpanTradeData);
    $$rendered = `<div class="${"time-span-stats"}">${validate_component(IntersectionObserver_1, "IntersectionObserver").$$render($$result, { element, once: true, intersecting }, {
      intersecting: ($$value) => {
        intersecting = $$value;
        $$settled = false;
      }
    }, {
      default: () => `<table${add_attribute("this", element, 0)}><tr><th class="${escape(null_to_empty("title " + priceChangeColorClass)) + " svelte-15n5kof"}" colspan="${"2"}">${escape(title)}</th></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Change</th>
                <td class="${"svelte-15n5kof"}"><span class="${escape(null_to_empty(priceChangeColorClass)) + " svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatPriceChange(timeSpanTradeData.price_close / timeSpanTradeData.price_open - 1))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</span></td></tr>


            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Open price</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatDollar(timeSpanTradeData.price_open))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Highest price</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatDollar(timeSpanTradeData.price_high))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Lowest price</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatDollar(timeSpanTradeData.price_low))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Close price</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatDollar(timeSpanTradeData.price_close))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Highest liquidity</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatDollar(timeSpanTradeData.liquidity_high))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Lowest liquidity</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatDollar(timeSpanTradeData.liquidity_low))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>


            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Buying trades</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatAmount(timeSpanTradeData.buys))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr>

            <tr class="${"data-row svelte-15n5kof"}"><th class="${"svelte-15n5kof"}">Selling trades</th>
                <td class="${"svelte-15n5kof"}">${timeSpanTradeData ? `${escape(formatAmount(timeSpanTradeData.sells))}` : `${validate_component(SkeletonLine, "SkeletonLine").$$render($$result, {}, {}, {})}`}</td></tr></table>`
    })}
</div>`;
  } while (!$$settled);
  return $$rendered;
});
var TimeSpanPerformance$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": TimeSpanPerformance
});
var css$1 = {
  code: ".chart-wrapper.svelte-lckpo2{margin:20px 0}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\n    /*\\n        Render the pair trading page\\n\\n        - Load pair core data on the SSR.\\n\\n        - Candle data loading is delayed to the client side (though in theory the first run could be done on the SSR)\\n\\n        - Selected candle stick time bucket is carried over in URL fragment - this could be moved to SvelteKit routing query parameter\\n    */\\n\\n    import { backendUrl } from \'$lib/config\';\\n    import \'$lib/styles/price.css\';\\n    import \'$lib/styles/bodytext.css\';\\n\\n    export async function load({ page }) {\\n\\n        const exchange_slug = page.params.exchange;\\n        const chain_slug = page.params.chain;\\n        const pair_slug = page.params.pair;\\n        const encoded = new URLSearchParams({exchange_slug, chain_slug, pair_slug});\\n        const apiUrl = `${backendUrl}/pair-details?${encoded}`;\\n\\n        console.log(\\"Loading\\", page, apiUrl);\\n\\n        const resp = await fetch(apiUrl);\\n\\n        if(!resp.ok) {\\n            if(resp.status === 404) {\\n                return {\\n                    status: 404,\\n                    error: `Trading pair not found: ${pair_slug}`\\n                }\\n            } else {\\n                console.error(resp);\\n                return {\\n                    status: resp.status,\\n                    error: new Error(`Could not load data for trading pair: ${apiUrl}. See console for details.`)\\n                };\\n            }\\n        }\\n\\n        const pairDetails = await resp.json()\\n\\n        const summary = pairDetails.summary;\\n        const details = pairDetails.additional_details;\\n        const daily = pairDetails.daily;\\n\\n        console.log(\\"Pair details\\", pairDetails);\\n\\n        // const urlDetails = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;\\n        // const urlTopPairs = `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`;\\n        // const pairs = await fetch(urlTopPairs);\\n        // const exchangesPairs = await pairs.json();\\n        // const details = await fetch(urlDetails);\\n        // const exchangesDetails = await details.json();\\n\\n        return {\\n            props: {\\n                exchange_slug,\\n                chain_slug,\\n                pair_slug,\\n                summary,\\n                details,\\n                daily\\n            }\\n        }\\n    }\\n<\/script>\\n\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\n// import TradingViewWidget from \\"svelte-tradingview-widget\\";\\n//import TablePairs from \'../../../components/table_quote_summary/Table.svelte\';\\n// export let pairId;\\n// export let chain;\\n// export let exchangeId;\\n// export let pairs;\\nimport Time from \\"svelte-time\\";\\nimport { formatDollar } from \'$lib/helpers/formatters\';\\nimport { formatPriceChange } from \'$lib/helpers/formatters\';\\nimport { fromHashToTimeBucket } from \'./TimeBucketSelector.svelte\';\\nimport { browser } from \'$app/env\';\\nimport TimeBucketSelector from \'./TimeBucketSelector.svelte\';\\nimport CandleStickChart from \'./CandleStickChart.svelte\';\\nimport TimeSpanPerformance from \'./TimeSpanPerformance.svelte\';\\nexport let exchange_slug;\\nexport let chain_slug;\\nexport let pair_slug;\\nexport let summary; // PairSummary OpenAPI\\nexport let details; // PairAdditionalDetails OpenAPI\\nexport let hourly, daily, weekly, monthly; // TimeSpanTradeData OpenAPI\\n// Loaded candle data\\n// See Candle OpenAPI\\nexport let candles = null;\\n// Resolve the initial candle stick chart from the fragment parameter\\nlet hash;\\nif (browser) {\\n    hash = window.location.hash;\\n}\\nelse {\\n    hash = null;\\n}\\n/**\\n * Convert candle data to internal uPlot format.\\n *\\n * Candles from from the server as descripted in OpenAPI\\n * https://tradingstrategy.ai/api/explorer/\\n *\\n * The server returns one list of JavaScript objects (o, h, l, c, v).\\n * uPlot wants x-array (time) and five separate y arrays (o, h, l, c, v).\\n *\\n */\\nfunction massageCandles(candles) {\\n    const cols = candles.length;\\n    const rows = 6;\\n    // Try to be smart and hint typed arrays and length for JavaScript VM\\n    // So sad JavaScript can\'t do even this basic shit.\\n    // https://stackoverflow.com/a/68411296/315168\\n    let matrix = Array(rows).fill().map(entry => Array(cols));\\n    candles.forEach(function (obj, idx) {\\n        // Time series\\n        const unixTime = Date.parse(obj.ts) / 1000;\\n        matrix[0][idx] = unixTime;\\n        // OHLCV core data\\n        matrix[1][idx] = obj.o;\\n        matrix[2][idx] = obj.h;\\n        matrix[3][idx] = obj.l;\\n        matrix[4][idx] = obj.c;\\n        matrix[5][idx] = obj.v;\\n        //matrix[5][idx] = 0\\n    });\\n    return matrix;\\n}\\n/**\\n * Reload new candle data from the server and update the candle stick chart compontent.\\n *\\n * @param bucket\\n */\\nfunction reloadCandlesOnBucketChange(bucket) {\\n    return __awaiter(this, void 0, void 0, function* () {\\n        if (!bucket) {\\n            // Only start loading after we get a valid bucket on the client side\\n            return;\\n        }\\n        // Switch to skeleton loader on the candle view\\n        candles = null;\\n        // https://tradingstrategy.ai/api/explorer/#/Pair/web_candles\\n        const params = {\\n            pair_id: summary.pair_id,\\n            time_bucket: bucket,\\n        };\\n        const encoded = new URLSearchParams(params);\\n        const apiUrl = `${backendUrl}/candles?${encoded}`;\\n        console.log(\\"Fetching candles for bucket\\", bucket, apiUrl);\\n        const resp = yield fetch(apiUrl);\\n        if (!resp.ok) {\\n            console.error(resp);\\n            return;\\n        }\\n        const rawCandles = yield resp.json();\\n        candles = massageCandles(rawCandles);\\n    });\\n}\\nexport let bucket = fromHashToTimeBucket(hash);\\nconsole.log(\\"Got hash\\", hash, \\"bucket\\", bucket);\\n$: console.log(`The active bucket is ${bucket}`);\\n// Price text\\n$: priceChangeColorClass = summary.price_change_24h >= 0 ? \\"price-change-green\\" : \\"price-change-red\\";\\n$: reloadCandlesOnBucketChange(bucket);\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>\\n        {summary.pair_symbol} trading on {details.exchange_name} on {details.chain_name}\\n    </title>\\n\\t<meta name=\\"description\\" content={\\"Price chart and technical analysis for trading \\" + summary.pair_symbol + \\" on \\" + details.exchange_name + \\" on \\" + details.chain_name}>\\n</svelte:head>\\n\\n<div class=\\"container\\">\\n    <h1>\\n        {summary.pair_symbol} trading on\\n        <a href=\\"/{chain_slug}/{exchange_slug}\\">{details.exchange_name}</a>\\n        on <a href=\\"/{chain_slug}\\">{details.chain_name}</a>\\n    </h1>\\n\\n    <p>\\n        <strong>{summary.pair_name}</strong> trades as <strong>{summary.pair_symbol}</strong> on <a class=body-link href=\\"/{chain_slug}/{exchange_slug}\\">{details.exchange_name}</a>\\n        on <a class=body-link href=\\"/{chain_slug}\\">{details.chain_name}</a>.\\n    </p>\\n\\n    <p>\\n        The price of <strong>{summary.base_token_symbol_friendly}</strong> in <strong>{summary.pair_symbol}</strong> pair is <strong class=\\"{priceChangeColorClass}\\">{formatDollar(summary.usd_price_latest)}</strong> and is\\n        <strong class=\\"{priceChangeColorClass}\\">{formatPriceChange(summary.price_change_24h)} {summary.price_change_24h > 0 ? \\"up\\" : \\"down\\"}</strong> for the last 24h.\\n    </p>\\n\\n    <p>\\n        The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong> 24h trading volume with <strong>{formatDollar(summary.usd_liquidity_latest)}</strong> liquidity available at the moment.\\n\\n        The trading of {summary.pair_symbol} started at <strong><Time relative timestamp=\\"{Date.parse(details.first_trade_at)}\\" /></strong>.\\n    </p>\\n\\n    <h2>Price chart</h2>\\n    <TimeBucketSelector bind:activeBucket={bucket} />\\n\\n    <div class=\\"chart-wrapper\\">\\n        <CandleStickChart title={summary.pair_name + \\" converted to USD\\"} bind:candles={candles} />\\n    </div>\\n\\n\\n    <h2>Price and liquidity movement</h2>\\n\\n    <p>\\n        The price and liquidity of <strong>{summary.base_token_symbol_friendly}</strong> in this trading pair. The amounts are converted to US dollar through  <strong>{summary.quote_token_symbol_friendly}/USD</strong>.\\n    </p>\\n\\n    <div class=\\"row\\">\\n        <div class=\\"col-md-3\\">\\n            <TimeSpanPerformance pairId={summary.pair_id} title=\\"Hourly\\" timeSpanTradeData={hourly} period=\\"hourly\\"/>\\n        </div>\\n        <div class=\\"col-md-3\\">\\n            <TimeSpanPerformance pairId={summary.pair_id} title=\\"Daily\\" timeSpanTradeData={daily} period=\\"daily\\"/>\\n        </div>\\n        <div class=\\"col-md-3\\">\\n            <TimeSpanPerformance pairId={summary.pair_id} title=\\"Weekly\\" timeSpanTradeData={weekly} period=\\"weekly\\" />\\n        </div>\\n        <div class=\\"col-md-3\\">\\n            <TimeSpanPerformance pairId={summary.pair_id} title=\\"Monthly\\" timeSpanTradeData={monthly} period=\\"monthly\\" />\\n        </div>\\n    </div>\\n\\n</div>\\n\\n<style>\\n    .chart-wrapper {\\n        margin: 20px 0;\\n    }\\n</style>\\n"],"names":[],"mappings":"AAiPI,cAAc,cAAC,CAAC,AACZ,MAAM,CAAE,IAAI,CAAC,CAAC,AAClB,CAAC"}'
};
async function load$1({ page }) {
  const exchange_slug = page.params.exchange;
  const chain_slug = page.params.chain;
  const pair_slug = page.params.pair;
  const encoded = new URLSearchParams({ exchange_slug, chain_slug, pair_slug });
  const apiUrl = `${backendUrl}/pair-details?${encoded}`;
  console.log("Loading", page, apiUrl);
  const resp = await fetch(apiUrl);
  if (!resp.ok) {
    if (resp.status === 404) {
      return {
        status: 404,
        error: `Trading pair not found: ${pair_slug}`
      };
    } else {
      console.error(resp);
      return {
        status: resp.status,
        error: new Error(`Could not load data for trading pair: ${apiUrl}. See console for details.`)
      };
    }
  }
  const pairDetails = await resp.json();
  const summary = pairDetails.summary;
  const details = pairDetails.additional_details;
  const daily = pairDetails.daily;
  console.log("Pair details", pairDetails);
  return {
    props: {
      exchange_slug,
      chain_slug,
      pair_slug,
      summary,
      details,
      daily
    }
  };
}
function massageCandles(candles) {
  const cols = candles.length;
  const rows = 6;
  let matrix = Array(rows).fill().map((entry) => Array(cols));
  candles.forEach(function(obj, idx) {
    const unixTime = Date.parse(obj.ts) / 1e3;
    matrix[0][idx] = unixTime;
    matrix[1][idx] = obj.o;
    matrix[2][idx] = obj.h;
    matrix[3][idx] = obj.l;
    matrix[4][idx] = obj.c;
    matrix[5][idx] = obj.v;
  });
  return matrix;
}
var U5Bpairu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let priceChangeColorClass;
  var __awaiter2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve22) {
        resolve22(value);
      });
    }
    return new (P || (P = Promise))(function(resolve22, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve22(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  let { exchange_slug } = $$props;
  let { chain_slug } = $$props;
  let { pair_slug } = $$props;
  let { summary } = $$props;
  let { details } = $$props;
  let { hourly, daily, weekly, monthly } = $$props;
  let { candles = null } = $$props;
  let hash2;
  {
    hash2 = null;
  }
  function reloadCandlesOnBucketChange(bucket2) {
    return __awaiter2(this, void 0, void 0, function* () {
      if (!bucket2) {
        return;
      }
      candles = null;
      const params = {
        pair_id: summary.pair_id,
        time_bucket: bucket2
      };
      const encoded = new URLSearchParams(params);
      const apiUrl = `${backendUrl}/candles?${encoded}`;
      console.log("Fetching candles for bucket", bucket2, apiUrl);
      const resp = yield fetch(apiUrl);
      if (!resp.ok) {
        console.error(resp);
        return;
      }
      const rawCandles = yield resp.json();
      candles = massageCandles(rawCandles);
    });
  }
  let { bucket = fromHashToTimeBucket(hash2) } = $$props;
  console.log("Got hash", hash2, "bucket", bucket);
  if ($$props.exchange_slug === void 0 && $$bindings.exchange_slug && exchange_slug !== void 0)
    $$bindings.exchange_slug(exchange_slug);
  if ($$props.chain_slug === void 0 && $$bindings.chain_slug && chain_slug !== void 0)
    $$bindings.chain_slug(chain_slug);
  if ($$props.pair_slug === void 0 && $$bindings.pair_slug && pair_slug !== void 0)
    $$bindings.pair_slug(pair_slug);
  if ($$props.summary === void 0 && $$bindings.summary && summary !== void 0)
    $$bindings.summary(summary);
  if ($$props.details === void 0 && $$bindings.details && details !== void 0)
    $$bindings.details(details);
  if ($$props.hourly === void 0 && $$bindings.hourly && hourly !== void 0)
    $$bindings.hourly(hourly);
  if ($$props.daily === void 0 && $$bindings.daily && daily !== void 0)
    $$bindings.daily(daily);
  if ($$props.weekly === void 0 && $$bindings.weekly && weekly !== void 0)
    $$bindings.weekly(weekly);
  if ($$props.monthly === void 0 && $$bindings.monthly && monthly !== void 0)
    $$bindings.monthly(monthly);
  if ($$props.candles === void 0 && $$bindings.candles && candles !== void 0)
    $$bindings.candles(candles);
  if ($$props.bucket === void 0 && $$bindings.bucket && bucket !== void 0)
    $$bindings.bucket(bucket);
  $$result.css.add(css$1);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      console.log(`The active bucket is ${bucket}`);
    }
    priceChangeColorClass = summary.price_change_24h >= 0 ? "price-change-green" : "price-change-red";
    {
      reloadCandlesOnBucketChange(bucket);
    }
    $$rendered = `${$$result.head += `${$$result.title = `<title>
        ${escape(summary.pair_symbol)} trading on ${escape(details.exchange_name)} on ${escape(details.chain_name)}
    </title>`, ""}<meta name="${"description"}"${add_attribute("content", "Price chart and technical analysis for trading " + summary.pair_symbol + " on " + details.exchange_name + " on " + details.chain_name, 0)} data-svelte="svelte-113bnp">`, ""}

<div class="${"container"}"><h1>${escape(summary.pair_symbol)} trading on
        <a href="${"/" + escape(chain_slug) + "/" + escape(exchange_slug)}">${escape(details.exchange_name)}</a>
        on <a href="${"/" + escape(chain_slug)}">${escape(details.chain_name)}</a></h1>

    <p><strong>${escape(summary.pair_name)}</strong> trades as <strong>${escape(summary.pair_symbol)}</strong> on <a class="${"body-link"}" href="${"/" + escape(chain_slug) + "/" + escape(exchange_slug)}">${escape(details.exchange_name)}</a>
        on <a class="${"body-link"}" href="${"/" + escape(chain_slug)}">${escape(details.chain_name)}</a>.
    </p>

    <p>The price of <strong>${escape(summary.base_token_symbol_friendly)}</strong> in <strong>${escape(summary.pair_symbol)}</strong> pair is <strong class="${escape(null_to_empty(priceChangeColorClass)) + " svelte-lckpo2"}">${escape(formatDollar(summary.usd_price_latest))}</strong> and is
        <strong class="${escape(null_to_empty(priceChangeColorClass)) + " svelte-lckpo2"}">${escape(formatPriceChange(summary.price_change_24h))} ${escape(summary.price_change_24h > 0 ? "up" : "down")}</strong> for the last 24h.
    </p>

    <p>The pair has <strong>${escape(formatDollar(summary.usd_volume_24h))}</strong> 24h trading volume with <strong>${escape(formatDollar(summary.usd_liquidity_latest))}</strong> liquidity available at the moment.

        The trading of ${escape(summary.pair_symbol)} started at <strong>${validate_component(Time, "Time").$$render($$result, {
      relative: true,
      timestamp: Date.parse(details.first_trade_at)
    }, {}, {})}</strong>.
    </p>

    <h2>Price chart</h2>
    ${validate_component(TimeBucketSelector, "TimeBucketSelector").$$render($$result, { activeBucket: bucket }, {
      activeBucket: ($$value) => {
        bucket = $$value;
        $$settled = false;
      }
    }, {})}

    <div class="${"chart-wrapper svelte-lckpo2"}">${validate_component(CandleStickChart, "CandleStickChart").$$render($$result, {
      title: summary.pair_name + " converted to USD",
      candles
    }, {
      candles: ($$value) => {
        candles = $$value;
        $$settled = false;
      }
    }, {})}</div>


    <h2>Price and liquidity movement</h2>

    <p>The price and liquidity of <strong>${escape(summary.base_token_symbol_friendly)}</strong> in this trading pair. The amounts are converted to US dollar through  <strong>${escape(summary.quote_token_symbol_friendly)}/USD</strong>.
    </p>

    <div class="${"row"}"><div class="${"col-md-3"}">${validate_component(TimeSpanPerformance, "TimeSpanPerformance").$$render($$result, {
      pairId: summary.pair_id,
      title: "Hourly",
      timeSpanTradeData: hourly,
      period: "hourly"
    }, {}, {})}</div>
        <div class="${"col-md-3"}">${validate_component(TimeSpanPerformance, "TimeSpanPerformance").$$render($$result, {
      pairId: summary.pair_id,
      title: "Daily",
      timeSpanTradeData: daily,
      period: "daily"
    }, {}, {})}</div>
        <div class="${"col-md-3"}">${validate_component(TimeSpanPerformance, "TimeSpanPerformance").$$render($$result, {
      pairId: summary.pair_id,
      title: "Weekly",
      timeSpanTradeData: weekly,
      period: "weekly"
    }, {}, {})}</div>
        <div class="${"col-md-3"}">${validate_component(TimeSpanPerformance, "TimeSpanPerformance").$$render($$result, {
      pairId: summary.pair_id,
      title: "Monthly",
      timeSpanTradeData: monthly,
      period: "monthly"
    }, {}, {})}</div></div>

</div>`;
  } while (!$$settled);
  return $$rendered;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bpairu5D,
  load: load$1
});
var css = {
  code: "nav.svelte-1xnq9vj>ul.svelte-1xnq9vj{list-style-type:none;display:flex}button.svelte-1xnq9vj.svelte-1xnq9vj{margin-right:6px}",
  map: `{"version":3,"file":"Table.svelte","sources":["Table.svelte"],"sourcesContent":["<script lang=\\"typescript\\">import { onMount } from 'svelte';\\nimport { formatNumber } from '$lib/helpers/formatters';\\nexport let rows = [];\\nexport let apiError;\\nlet page = 0;\\nlet totalPages = [];\\nlet currentPageRows = [];\\nlet itemsPerPage = 50;\\nlet loading = true;\\n$: currentPageRows = totalPages.length > 0 ? totalPages[page] : [];\\nconst paginate = (items) => {\\n    const pages = Math.ceil(items.length / itemsPerPage);\\n    const paginatedItems = Array.from({ length: pages }, (_, index) => {\\n        const start = index * itemsPerPage;\\n        return items.slice(start, start + itemsPerPage);\\n    });\\n    totalPages = [...paginatedItems];\\n};\\nonMount(() => {\\n    paginate(rows);\\n});\\nconst setPage = (p) => {\\n    if (p >= 0 && p < totalPages.length) {\\n        page = p;\\n    }\\n};\\n<\/script>\\n\\n<table class=\\"table table-datasets\\">\\n\\t<thead>\\n\\t\\t<tr>\\n\\t\\t\\t<th>Quote</th>\\n\\t\\t\\t<th>Volume 24h</th>\\n\\t\\t\\t<th>Liquidity</th>\\n\\t\\t\\t<th>Price</th>\\n\\t\\t</tr>\\n\\t</thead>\\n\\n\\t<tbody>\\n\\t\\t{#each currentPageRows as row, i}\\n\\t\\t\\t<tr>\\n\\t\\t\\t\\t<td>{row.base_token_symbol}/{row.quote_token_symbol}</td>\\n\\t\\t\\t\\t<td>{formatNumber(row.usd_volume_1d)}</td>\\n\\t\\t\\t\\t<td>{formatNumber(row.usd_liquidity_high_24h)}</td>\\n\\t\\t\\t\\t<td>{formatNumber(row.usd_price_15m_close)}</td>\\n\\t\\t\\t</tr>\\n\\t\\t{:else}\\n\\t\\t\\t{#if apiError}\\n\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t<td>\\n\\t\\t\\t\\t\\t\\t<h5 class=\\"text-center\\">Api unavailabe, {apiError} </h5>\\n\\t\\t\\t\\t\\t</td>\\n\\t\\t\\t\\t</tr>\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<tr>\\n\\t\\t\\t\\t\\t<td>\\n\\t\\t\\t\\t\\t\\t<h5 class=\\"text-center\\">There is no data to display here.</h5>\\n\\t\\t\\t\\t\\t</td>\\n\\t\\t\\t\\t</tr>\\n\\t\\t\\t{/if}\\n\\t\\t{/each}\\n\\t</tbody>\\n</table>\\n<nav class=\\"pagination\\">\\n\\t<ul>\\n\\t\\t<li>\\n\\t\\t\\t<button\\n\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\tclass=\\"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev\\"\\n\\t\\t\\t\\ton:click={() => setPage(page - 1)}\\n\\t\\t\\t>\\n\\t\\t\\t\\tPREV\\n\\t\\t\\t</button>\\n\\t\\t</li>\\n\\n\\t\\t{#each totalPages as page, i}\\n\\t\\t\\t<li>\\n\\t\\t\\t\\t<button\\n\\t\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\t\\tclass=\\"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-page-number\\"\\n\\t\\t\\t\\t\\ton:click={() => setPage(i)}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t{i + 1}\\n\\t\\t\\t\\t</button>\\n\\t\\t\\t</li>\\n\\t\\t{/each}\\n\\n\\t\\t<li>\\n\\t\\t\\t<button\\n\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\tclass=\\"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev\\"\\n\\t\\t\\t\\ton:click={() => setPage(page + 1)}\\n\\t\\t\\t>\\n\\t\\t\\t\\tNEXT\\n\\t\\t\\t</button>\\n\\t\\t</li>\\n\\t</ul>\\n</nav>\\n\\n<style>\\n\\tnav > ul {\\n\\t\\tlist-style-type: none;\\n\\t\\tdisplay: flex;\\n\\t}\\n\\tbutton {\\n\\t\\tmargin-right: 6px;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAoGC,kBAAG,CAAG,EAAE,eAAC,CAAC,AACT,eAAe,CAAE,IAAI,CACrB,OAAO,CAAE,IAAI,AACd,CAAC,AACD,MAAM,8BAAC,CAAC,AACP,YAAY,CAAE,GAAG,AAClB,CAAC"}`
};
var Table$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { rows = [] } = $$props;
  let { apiError } = $$props;
  let page = 0;
  let totalPages = [];
  let currentPageRows = [];
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.apiError === void 0 && $$bindings.apiError && apiError !== void 0)
    $$bindings.apiError(apiError);
  $$result.css.add(css);
  currentPageRows = totalPages.length > 0 ? totalPages[page] : [];
  return `<table class="${"table table-datasets"}"><thead><tr><th>Quote</th>
			<th>Volume 24h</th>
			<th>Liquidity</th>
			<th>Price</th></tr></thead>

	<tbody>${currentPageRows.length ? each(currentPageRows, (row, i) => `<tr><td>${escape(row.base_token_symbol)}/${escape(row.quote_token_symbol)}</td>
				<td>${escape(formatNumber$1(row.usd_volume_1d))}</td>
				<td>${escape(formatNumber$1(row.usd_liquidity_high_24h))}</td>
				<td>${escape(formatNumber$1(row.usd_price_15m_close))}</td>
			</tr>`) : `${apiError ? `<tr><td><h5 class="${"text-center"}">Api unavailabe, ${escape(apiError)} </h5></td>
				</tr>` : `<tr><td><h5 class="${"text-center"}">There is no data to display here.</h5></td>
				</tr>`}`}</tbody></table>
<nav class="${"pagination svelte-1xnq9vj"}"><ul class="${"svelte-1xnq9vj"}"><li><button type="${"button"}" class="${"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev svelte-1xnq9vj"}">PREV
			</button></li>

		${each(totalPages, (page2, i) => `<li><button type="${"button"}" class="${"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-page-number svelte-1xnq9vj"}">${escape(i + 1)}</button>
			</li>`)}

		<li><button type="${"button"}" class="${"btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev svelte-1xnq9vj"}">NEXT
			</button></li></ul>
</nav>`;
});
var Table = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { rows = [] } = $$props;
  let { apiError } = $$props;
  let page = 0;
  let totalPages = [];
  let currentPageRows = [];
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.apiError === void 0 && $$bindings.apiError && apiError !== void 0)
    $$bindings.apiError(apiError);
  currentPageRows = totalPages.length > 0 ? totalPages[page] : [];
  return `<table class="${"table table-datasets"}"><thead><tr><th></th>
			<th>Volume (USD)</th>
			<th>Trades</th></tr></thead>

	<tbody>${currentPageRows.length ? each(currentPageRows, (row, i) => `<tr><td>${escape(row.period)}</td>
				<td>${escape(formatNumber$1(row.volume))}</td>
				<td>${escape(formatNumber$1(row.trade))}</td>
			</tr>`) : `${apiError ? `<tr><td><h5 class="${"text-center"}">Api unavailabe, ${escape(apiError)} </h5></td>
				</tr>` : `<tr><td><h5 class="${"text-center"}">There is no data to display here.</h5></td>
				</tr>`}`}</tbody>
</table>`;
});
async function load({ page }) {
  const exchangeId = page.params.exchange_id;
  const chain = page.params.chain;
  const urlDetails = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
  const urlTopPairs = `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`;
  const pairs = await fetch(urlTopPairs);
  if (!pairs.ok) {
    console.error(pairs);
    throw new Error(`Could not load {urlTopPairs}`);
  }
  const exchangesPairs = await pairs.json();
  const details = await fetch(urlDetails);
  const exchangesDetails = await details.json();
  const monthlyData = {
    period: "Monthly",
    volume: exchangesDetails.buy_volume_30d,
    trade: 0
  };
  const allTimeData = {
    period: "All Time",
    volume: exchangesDetails.buy_volume_all_time,
    trade: exchangesDetails.buy_count_all_time
  };
  const exchangeSummary = [monthlyData, allTimeData];
  return {
    props: {
      exchangeSummary,
      exchangesPairs,
      exchangeId
    }
  };
}
var U5Bexchange_idu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { exchangesPairs } = $$props;
  let { exchangeId } = $$props;
  let { exchangeSummary } = $$props;
  if ($$props.exchangesPairs === void 0 && $$bindings.exchangesPairs && exchangesPairs !== void 0)
    $$bindings.exchangesPairs(exchangesPairs);
  if ($$props.exchangeId === void 0 && $$bindings.exchangeId && exchangeId !== void 0)
    $$bindings.exchangeId(exchangeId);
  if ($$props.exchangeSummary === void 0 && $$bindings.exchangeSummary && exchangeSummary !== void 0)
    $$bindings.exchangeSummary(exchangeSummary);
  return `<div class="${"container"}"><h1>${escape(exchangeId)}</h1>
    <h2>Summary</h2>
    ${validate_component(Table, "TableExchangeDetails").$$render($$result, { rows: exchangeSummary }, {}, {})}
    <h2>Top Pairs</h2>
    ${validate_component(Table$1, "TablePairs").$$render($$result, { rows: exchangesPairs.results }, {}, {})}</div>`;
});
var _exchange_id_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bexchange_idu5D,
  load
});

// .svelte-kit/node/middlewares.js
import {
  createReadStream,
  existsSync,
  statSync
} from "fs";
import fs__default, { readdirSync, statSync as statSync2 } from "fs";
import { resolve as resolve2, join, normalize as normalize2, dirname } from "path";
import {
  parse
} from "querystring";
import { fileURLToPath } from "url";
function getRawBody(req) {
  return new Promise((fulfil, reject) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil(null);
    }
    req.on("error", reject);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil(null);
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject({
            status: 413,
            reason: 'Exceeded "Content-Length" limit'
          });
        }
        data.set(chunk, offset);
        offset = new_len;
      });
    } else {
      req.on("data", (chunk) => {
        const new_data = new Uint8Array(data.length + chunk.length);
        new_data.set(data, 0);
        new_data.set(chunk, data.length);
        data = new_data;
      });
    }
    req.on("end", () => {
      fulfil(data);
    });
  });
}
function create_kit_middleware({ render: render2 }) {
  return async (req, res) => {
    const parsed = new URL(req.url || "", "http://localhost");
    let body;
    try {
      body = await getRawBody(req);
    } catch (err) {
      res.statusCode = err.status || 400;
      return res.end(err.reason || "Invalid request body");
    }
    const rendered = await render2({
      method: req.method,
      headers: req.headers,
      path: parsed.pathname,
      query: parsed.searchParams,
      rawBody: body
    });
    if (rendered) {
      res.writeHead(rendered.status, rendered.headers);
      if (rendered.body) {
        res.write(rendered.body);
      }
      res.end();
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  };
}
function parse2(req, toDecode) {
  let raw = req.url;
  if (raw == null)
    return;
  let prev = req._parsedUrl, encoded = !req._decoded;
  if (prev && prev.raw === raw && !toDecode === encoded)
    return prev;
  let pathname = raw, search = "", query;
  if (raw.length > 1) {
    let idx = raw.indexOf("?", 1);
    if (idx !== -1) {
      search = raw.substring(idx);
      pathname = raw.substring(0, idx);
      if (search.length > 1) {
        query = parse(search.substring(1));
      }
    }
    if (!!toDecode && encoded) {
      req._decoded = true;
      if (pathname.indexOf("%") !== -1) {
        try {
          pathname = decodeURIComponent(pathname);
        } catch (e) {
        }
      }
    }
  }
  return req._parsedUrl = { pathname, search, query, raw };
}
function list(dir, callback, pre = "") {
  dir = resolve2(".", dir);
  let arr = readdirSync(dir);
  let i = 0, abs, stats;
  for (; i < arr.length; i++) {
    abs = join(dir, arr[i]);
    stats = statSync2(abs);
    stats.isDirectory() ? list(abs, callback, join(pre, arr[i])) : callback(join(pre, arr[i]), abs, stats);
  }
}
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);
  for (let i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }
  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}
Mime.prototype.define = function(typeMap, force) {
  for (let type in typeMap) {
    let extensions = typeMap[type].map(function(t) {
      return t.toLowerCase();
    });
    type = type.toLowerCase();
    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i];
      if (ext[0] === "*") {
        continue;
      }
      if (!force && ext in this._types) {
        throw new Error('Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".');
      }
      this._types[ext] = type;
    }
    if (force || !this._extensions[type]) {
      const ext = extensions[0];
      this._extensions[type] = ext[0] !== "*" ? ext : ext.substr(1);
    }
  }
};
Mime.prototype.getType = function(path) {
  path = String(path);
  let last = path.replace(/^.*[/\\]/, "").toLowerCase();
  let ext = last.replace(/^.*\./, "").toLowerCase();
  let hasPath = last.length < path.length;
  let hasDot = ext.length < last.length - 1;
  return (hasDot || !hasPath) && this._types[ext] || null;
};
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};
var Mime_1 = Mime;
var standard = { "application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomdeleted+xml": ["atomdeleted"], "application/atomsvc+xml": ["atomsvc"], "application/atsc-dwd+xml": ["dwd"], "application/atsc-held+xml": ["held"], "application/atsc-rsat+xml": ["rsat"], "application/bdoc": ["bdoc"], "application/calendar+xml": ["xcs"], "application/ccxml+xml": ["ccxml"], "application/cdfx+xml": ["cdfx"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["ecma", "es"], "application/emma+xml": ["emma"], "application/emotionml+xml": ["emotionml"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/fdt+xml": ["fdt"], "application/font-tdpfr": ["pfr"], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hjson": ["hjson"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/its+xml": ["its"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lgr+xml": ["lgr"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mmt-aei+xml": ["maei"], "application/mmt-usd+xml": ["musd"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/mrb-consumer+xml": ["*xdf"], "application/mrb-publish+xml": ["*xdf"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/n-quads": ["nq"], "application/n-triples": ["nt"], "application/node": ["cjs"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/p2p-overlay+xml": ["relo"], "application/patch-ops-error+xml": ["*xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/provenance+xml": ["provx"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf", "owl"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/route-apd+xml": ["rapd"], "application/route-s-tsid+xml": ["sls"], "application/route-usd+xml": ["rusd"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/senml+xml": ["senmlx"], "application/sensml+xml": ["sensmlx"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/sieve": ["siv", "sieve"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/swid+xml": ["swidtag"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/toml": ["toml"], "application/ttml+xml": ["ttml"], "application/ubjson": ["ubj"], "application/urc-ressheet+xml": ["rsheet"], "application/urc-targetdesc+xml": ["td"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/xaml+xml": ["xaml"], "application/xcap-att+xml": ["xav"], "application/xcap-caps+xml": ["xca"], "application/xcap-diff+xml": ["xdf"], "application/xcap-el+xml": ["xel"], "application/xcap-error+xml": ["xer"], "application/xcap-ns+xml": ["xns"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xliff+xml": ["xlf"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["*xsl", "xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": ["*3gpp"], "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp3": ["*mp3"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/wave": ["*wav"], "audio/webm": ["weba"], "audio/xm": ["xm"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/aces": ["exr"], "image/apng": ["apng"], "image/avif": ["avif"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/dicom-rle": ["drle"], "image/emf": ["emf"], "image/fits": ["fits"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/heic": ["heic"], "image/heic-sequence": ["heics"], "image/heif": ["heif"], "image/heif-sequence": ["heifs"], "image/hej2k": ["hej2"], "image/hsj2": ["hsj2"], "image/ief": ["ief"], "image/jls": ["jls"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jph": ["jph"], "image/jphc": ["jhc"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/jxr": ["jxr"], "image/jxra": ["jxra"], "image/jxrs": ["jxrs"], "image/jxs": ["jxs"], "image/jxsc": ["jxsc"], "image/jxsi": ["jxsi"], "image/jxss": ["jxss"], "image/ktx": ["ktx"], "image/ktx2": ["ktx2"], "image/png": ["png"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/t38": ["t38"], "image/tiff": ["tif", "tiff"], "image/tiff-fx": ["tfx"], "image/webp": ["webp"], "image/wmf": ["wmf"], "message/disposition-notification": ["disposition-notification"], "message/global": ["u8msg"], "message/global-delivery-status": ["u8dsn"], "message/global-disposition-notification": ["u8mdn"], "message/global-headers": ["u8hdr"], "message/rfc822": ["eml", "mime"], "model/3mf": ["3mf"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/mtl": ["mtl"], "model/obj": ["obj"], "model/stl": ["stl"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["*x3db", "x3dbz"], "model/x3d+fastinfoset": ["x3db"], "model/x3d+vrml": ["*x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "model/x3d-vrml": ["x3dv"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/mdx": ["mdx"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/richtext": ["rtx"], "text/rtf": ["*rtf"], "text/sgml": ["sgml", "sgm"], "text/shex": ["shex"], "text/slim": ["slim", "slm"], "text/spdx": ["spdx"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vtt": ["vtt"], "text/xml": ["*xml"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/iso.segment": ["m4s"], "video/jpeg": ["jpgv"], "video/jpm": ["*jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/webm": ["webm"] };
var lite = new Mime_1(standard);
var noop2 = () => {
};
function isMatch(uri, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].test(uri))
      return true;
  }
}
function toAssume(uri, extns) {
  let i = 0, x, len = uri.length - 1;
  if (uri.charCodeAt(len) === 47) {
    uri = uri.substring(0, len);
  }
  let arr = [], tmp = `${uri}/index`;
  for (; i < extns.length; i++) {
    x = extns[i] ? `.${extns[i]}` : "";
    if (uri)
      arr.push(uri + x);
    arr.push(tmp + x);
  }
  return arr;
}
function viaCache(cache, uri, extns) {
  let i = 0, data, arr = toAssume(uri, extns);
  for (; i < arr.length; i++) {
    if (data = cache[arr[i]])
      return data;
  }
}
function viaLocal(dir, isEtag, uri, extns) {
  let i = 0, arr = toAssume(uri, extns);
  let abs, stats, name, headers;
  for (; i < arr.length; i++) {
    abs = normalize2(join(dir, name = arr[i]));
    if (abs.startsWith(dir) && existsSync(abs)) {
      stats = statSync(abs);
      if (stats.isDirectory())
        continue;
      headers = toHeaders(name, stats, isEtag);
      headers["Cache-Control"] = isEtag ? "no-cache" : "no-store";
      return { abs, stats, headers };
    }
  }
}
function is404(req, res) {
  return res.statusCode = 404, res.end();
}
function send(req, res, file, stats, headers) {
  let code = 200, tmp, opts = {};
  headers = __spreadValues({}, headers);
  for (let key in headers) {
    tmp = res.getHeader(key);
    if (tmp)
      headers[key] = tmp;
  }
  if (tmp = res.getHeader("content-type")) {
    headers["Content-Type"] = tmp;
  }
  if (req.headers.range) {
    code = 206;
    let [x, y] = req.headers.range.replace("bytes=", "").split("-");
    let end = opts.end = parseInt(y, 10) || stats.size - 1;
    let start = opts.start = parseInt(x, 10) || 0;
    if (start >= stats.size || end >= stats.size) {
      res.setHeader("Content-Range", `bytes */${stats.size}`);
      res.statusCode = 416;
      return res.end();
    }
    headers["Content-Range"] = `bytes ${start}-${end}/${stats.size}`;
    headers["Content-Length"] = end - start + 1;
    headers["Accept-Ranges"] = "bytes";
  }
  res.writeHead(code, headers);
  createReadStream(file, opts).pipe(res);
}
function isEncoding(name, type, headers) {
  headers["Content-Encoding"] = type;
  headers["Content-Type"] = lite.getType(name.replace(/\.([^.]*)$/, "")) || "";
}
function toHeaders(name, stats, isEtag) {
  let headers = {
    "Content-Length": stats.size,
    "Content-Type": lite.getType(name) || "",
    "Last-Modified": stats.mtime.toUTCString()
  };
  if (isEtag)
    headers["ETag"] = `W/"${stats.size}-${stats.mtime.getTime()}"`;
  if (/\.br$/.test(name))
    isEncoding(name, "br", headers);
  if (/\.gz$/.test(name))
    isEncoding(name, "gzip", headers);
  return headers;
}
function sirv(dir, opts = {}) {
  dir = resolve2(dir || ".");
  let isNotFound = opts.onNoMatch || is404;
  let setHeaders = opts.setHeaders || noop2;
  let extensions = opts.extensions || ["html", "htm"];
  let gzips = opts.gzip && extensions.map((x) => `${x}.gz`).concat("gz");
  let brots = opts.brotli && extensions.map((x) => `${x}.br`).concat("br");
  const FILES = {};
  let fallback = "/";
  let isEtag = !!opts.etag;
  let isSPA = !!opts.single;
  if (typeof opts.single === "string") {
    let idx = opts.single.lastIndexOf(".");
    fallback += !!~idx ? opts.single.substring(0, idx) : opts.single;
  }
  let ignores = [];
  if (opts.ignores !== false) {
    ignores.push(/[/]([A-Za-z\s\d~$._-]+\.\w+){1,}$/);
    if (opts.dotfiles)
      ignores.push(/\/\.\w/);
    else
      ignores.push(/\/\.well-known/);
    [].concat(opts.ignores || []).forEach((x) => {
      ignores.push(new RegExp(x, "i"));
    });
  }
  let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
  if (cc && opts.immutable)
    cc += ",immutable";
  else if (cc && opts.maxAge === 0)
    cc += ",must-revalidate";
  if (!opts.dev) {
    list(dir, (name, abs, stats) => {
      if (/\.well-known[\\+\/]/.test(name))
        ;
      else if (!opts.dotfiles && /(^\.|[\\+|\/+]\.)/.test(name))
        return;
      let headers = toHeaders(name, stats, isEtag);
      if (cc)
        headers["Cache-Control"] = cc;
      FILES["/" + name.normalize().replace(/\\+/g, "/")] = { abs, stats, headers };
    });
  }
  let lookup = opts.dev ? viaLocal.bind(0, dir, isEtag) : viaCache.bind(0, FILES);
  return function(req, res, next) {
    let extns = [""];
    let val = req.headers["accept-encoding"] || "";
    if (gzips && val.includes("gzip"))
      extns.unshift(...gzips);
    if (brots && /(br|brotli)/i.test(val))
      extns.unshift(...brots);
    extns.push(...extensions);
    let pathname = !!req._decoded && req.path || parse2(req, true).pathname;
    let data = lookup(pathname, extns) || isSPA && !isMatch(pathname, ignores) && lookup(fallback, extns);
    if (!data)
      return next ? next() : isNotFound(req, res);
    if (isEtag && req.headers["if-none-match"] === data.headers["ETag"]) {
      res.writeHead(304);
      return res.end();
    }
    if (gzips || brots) {
      res.setHeader("Vary", "Accept-Encoding");
    }
    setHeaders(res, pathname, data.stats);
    send(req, res, data.abs, data.stats, data.headers);
  };
}
var __dirname = dirname(fileURLToPath(import.meta.url));
var noop_handler = (_req, _res, next) => next();
var paths = {
  assets: join(__dirname, "/assets"),
  prerendered: join(__dirname, "/prerendered")
};
var prerenderedMiddleware = fs__default.existsSync(paths.prerendered) ? sirv(paths.prerendered, {
  etag: true,
  maxAge: 0,
  gzip: true,
  brotli: true
}) : noop_handler;
var assetsMiddleware = fs__default.existsSync(paths.assets) ? sirv(paths.assets, {
  setHeaders: (res, pathname) => {
    if (pathname.startsWith("/_app/")) {
      res.setHeader("cache-control", "public, max-age=31536000, immutable");
    }
  },
  gzip: true,
  brotli: true
}) : noop_handler;
var kitMiddleware = function() {
  init();
  return create_kit_middleware({ render });
}();
export {
  assetsMiddleware,
  kitMiddleware,
  prerenderedMiddleware
};
