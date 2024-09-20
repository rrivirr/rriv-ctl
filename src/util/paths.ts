import path from 'path'

export function getRRIVDir() {
    const homedir = require('os').homedir();
    return path.join(homedir, ".rriv");
}

export function getRrivCtlDir() {
    return path.join(getRRIVDir(), '.rrivctl');
}

export function defaultSerialFile() {
    return path.join(getRrivCtlDir(), 'default_serial');
}

export default {
    getRRIVDir,
    getRrivCtlDir,
    defaultSerialFile
}