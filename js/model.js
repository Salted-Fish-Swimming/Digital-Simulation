import { etcOutGate, extractCircuitFromInput } from "./extract.js";

const gates = [];

const wires = [];

export const regGate = (gate) => gates.push(gate);
export const regWire = (wire) => wires.push(wire);

export const getGates = () => [ ...gates ];
export const getWires = () => [ ...wires ];

const getInput = (gatelist) => {
  return gatelist.filter(gate =>
    gate.type === 'in-gate'
  );
}

const logCircuit = (circuit) => {
  const logGate = g => ({
    type: g.type,
    gate: g.gate.body,
    ins: g.ins.map(w => w.index),
    outs: g.outs.map(w => w.index),
  })
  for (const ingate of circuit.inputs) {
    console.log(logGate(ingate));
  }
  for (const gate of circuit.gates) {
    console.log(logGate(gate));
  }
  for (const wire of circuit.wires) {
    console.log({
      type: 'wire',
      wire: wire.wire.getLines().map(l => l.body),
      outs: wire.outs.map(logGate),
    });
    console.log(etcOutGate(wire.wire));
  }
}

// let curState = undefined;
// export const setCurState = (state) => {
//   curState = state;
// }
// export const getCurState = () => curState;

export const getCircuit = () => {
  const nativeGates = getGates();
  const inputGates = getInput(nativeGates);
  const circuit = extractCircuitFromInput(inputGates);
  return circuit;
}
