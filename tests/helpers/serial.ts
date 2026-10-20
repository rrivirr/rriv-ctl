import { EventEmitter } from "node:events";

/** Stand-in for serialport's ReadlineParser (an EventEmitter). */
export class FakeReadlineParser extends EventEmitter {
  constructor(_options?: unknown) {
    super();
  }
}

/**
 * In-memory stand-in for serialport's SerialPort. Tests grab the instance from
 * `FakeSerialPort.instances` and drive the parser directly.
 */
export class FakeSerialPort extends EventEmitter {
  static instances: FakeSerialPort[] = [];

  static reset(): void {
    FakeSerialPort.instances = [];
  }

  written: string[] = [];
  parser?: FakeReadlineParser;
  closed = false;

  constructor(public options: { path: string; baudRate: number }) {
    super();
    FakeSerialPort.instances.push(this);
  }

  flush(callback?: () => void): void {
    callback?.();
  }

  drain(callback?: () => void): void {
    callback?.();
  }

  pipe(parser: FakeReadlineParser): FakeReadlineParser {
    this.parser = parser;
    return parser;
  }

  write(data: string): boolean {
    this.written.push(data);
    return true;
  }

  close(callback?: () => void): void {
    this.closed = true;
    callback?.();
  }
}
