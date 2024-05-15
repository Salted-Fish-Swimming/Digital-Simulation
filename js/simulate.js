
const btoi = b => b ? 1 : 0;
const noti = i => (i + 1) % 2;

const States = (initState) => {
  const states = [ initState ];
  const self = {};
  return Object.assign(self, {
    push (state) {
      if (self.has(state)) {} else {
        states.push([ ...state ]);
      }
    },
    has (state) {
      states.some(s => {
        return s.every((v, i) => v === state[i])
      });
    },
    spawn () {
      const nStates = States(initState);
      for (const st of states) {
        nStates.push(st);
      }
      return nStates;
    }
  });
}

export const updateByClick = (ingate, value) => {
  if (outCurState) {
    const states = States(outCurState);
    const chgGate = outCurCircuit.gates.find(({ gate }) => gate === ingate);
    updateLoop(states, outCurState, [ chgGate ]);
  }
}

export const simulate = (circuit) => {
  const { inputs, wires } = circuit;
  const bitWidth = wires.length;
  const curState = Array(bitWidth).fill(-1);
  const states = States(curState);
  for (const w of wires) {
    w.wire.clear();
  }
  outCurCircuit = circuit;
  updateLoop(states, curState, inputs);
}

let outCurState = undefined;
let outCurCircuit = undefined;

const updateLoop = async (states, curState, inputs) => {
  let chgGates = inputs;
  let chgWires = undefined;
  while (true) {
    outCurState = [ ...curState ];
    [ curState, chgWires ] = await updateByGates(states, curState, chgGates);
    if (chgWires.length === 0) {
      break;
    }
    [ curState, chgGates ] = await updateByWires(states, curState, chgWires);
    if (chgGates.length === 0) {
      break;
    }
  }
}

const updateByWires = async (states, preState, chgWires) => {
  const curState = [ ...preState ];
  const chgGates = [];
  for (const cwire of chgWires) {
    for (const gate of cwire.outs) {
      if (chgGates.includes(gate)) {} else {
        chgGates.push(gate);
      }
    }
  }
  return [ curState, chgGates ];
}

const updateByGates = async (states, preState, chgGates) => {
  const curState = [ ...preState ];
  const chgWires = [];
  for (const gate of chgGates) {
    if (gate.type === 'in-gate') {
      const outv = btoi(gate.gate.status);
      for (const owire of gate.outs) {
        if (curState[owire.index] === outv) {} else {
          curState[owire.index] = outv;
          owire.wire.setStatus(outv);
          if (states.has(curState)) {
            throw { type: 'cycle-error', state: [ ...curState ] };
          } else {
            states.push(curState);
            chgWires.push(owire);
          }
        }
      }
    } else if (gate.type === 'and-gate') {
      const [ in1Wire, in2Wire ] = gate.ins;
      let inv1 = curState[in1Wire.index];
      let inv2 = curState[in2Wire.index];
      if (inv1 === -1) {
        curState[in1Wire.index] = 0;
        in1Wire.wire.setStatus(0);
        inv1 = 0;
        if (states.has(curState)) {
          throw { type: 'cycle-error', state: [ ...curState ] };
        } else {
          states.push(curState);
          chgWires.push(in1Wire);
        }
      }
      if (inv2 === -1) {
        curState[in2Wire.index] = 0;
        in2Wire.wire.setStatus(0);
        inv2 = 0;
        if (states.has(curState)) {
          throw { type: 'cycle-error', state: [ ...curState ] };
        } else {
          states.push(curState);
          chgWires.push(in2Wire);
        }
      }
      const outv = inv1 & inv2;
      for (const owire of gate.outs) {
        if (curState[owire.index] === outv) {} else {
          curState[owire.index] = outv;
          owire.wire.setStatus(outv);
          if (states.has(curState)) {
            throw { type: 'cycle-error', state: [ ...curState ] };
          } else {
            states.push([ ...curState ]);
            chgWires.push(owire);
          }
        }
      }
    } else if (gate.type === 'or-gate') {
      const [ in1Wire, in2Wire ] = gate.ins;
      let inv1 = curState[in1Wire.index];
      let inv2 = curState[in2Wire.index];
      if (inv1 === -1) {
        curState[in1Wire.index] = 0;
        in1Wire.wire.setStatus(0);
        inv1 = 0;
        if (states.has(curState)) {
          throw { type: 'cycle-error', state: [ ...curState ] };
        } else {
          states.push(curState);
          chgWires.push(in1Wire);
        }
      }
      if (inv2 === -1) {
        curState[in2Wire.index] = 0;
        in2Wire.wire.setStatus(0);
        inv2 = 0;
        if (states.has(curState)) {
          throw { type: 'cycle-error', state: [ ...curState ] };
        } else {
          states.push(curState);
          chgWires.push(in2Wire);
        }
      }
      const outv = inv1 | inv2;
      for (const owire of gate.outs) {
        if (curState[owire.index] === outv) {} else {
          curState[owire.index] = outv;
          owire.wire.setStatus(outv);
          if (states.has(curState)) {
            throw { type: 'cycle-error', state: [ ...curState ] };
          } else {
            states.push([ ...curState ]);
            chgWires.push(owire);
          }
        }
      }
    } else if (gate.type === 'not-gate') {
      const [ iWire ] = gate.ins;
      const inv = curState[iWire.index];
      const outv = noti(inv);
      for (const owire of gate.outs) {
        if (curState[owire.index] === outv) {} else {
          curState[owire.index] = outv;
          owire.wire.setStatus(outv);
          if (states.has(curState)) {
            throw { type: 'cycle-error', state: [ ...curState ] };
          } else {
            states.push([ ...curState ]);
            chgWires.push(owire);
          }
        }
      }
    } else if (gate.type === 'out-gate') {
      const [ iWire ] = gate.ins;
      const inv = curState[iWire.index];
      updateOutput(gate.gate, inv);
    }
  }
  return [ curState, chgWires ];
}

const updateOutput = (gate, v) => {
  gate.setStatus(v);
}

// const updateByChgWires = (states, preState, chgWires) => {
//   const curState = [ ...preState ];
//   const chgGates = [];
//   for (const [ index, value, wire ] of chgWires) {
//     if (curState[index] === value) {} else {
//       // change wires status;
//       curState[index] = value;
//       for (const outGate of wire.outs) {
//         if (chgGates.includes(outGate)) {} else {
//           chgGates.push(outGate);
//         }
//       }
//     }
//   }
//   if (states.has(curState)) {
//     return [];
//   } else {
//     return chgGates;
//   }
// } 

// const pushSingle = (list, item) => {
//   if (list.includes(item)) {} else {
//     list.push(item);
//   }
// }

// const updateDoubleInputGate = (states, gate, curState, pushedList) => {
//   const [ in1, in2 ] = gate.ins;
//   const in1v = curState[in1.index];
//   const in2v = curState[in2.index];
//   if (in1v === -1) {
//     pushSingle(pushedList, in1);
//     curState[in1.index] = 0;
//     states.push([ ...curState ]);
//   }
//   if (in2v === -1) {
//     pushSingle(pushedList, in2);
//     curState[in2.index] = 0;
//     states.push([ ...curState ]);
//   }
//   return [ in1v, in2v ];
// }

// const updateByChgGates = (states, preState, chgGates) => {
//   const curState = [ ...preState ];
//   const chgWires = [];
//   for (const gate of chgGates) {
//     const { outs } = gate;
//     if (gate.type === 'and-gate') {
//       const [ in1v, in2v ] = updateDoubleInputGate(states, gate, curState, chgWires);
//       for (const owire of outs) {
//         const outv = in1v & in2v;
//         if (curState[owire.index] === outv) {} else {
//           curState[owire.index]
//           if (chgWires.includes(owire)) {} else {
//             chgWires.push(owire);
//           }
//         } 
//       }
//     } else if (gate.type === 'or-gate') {
//       const [ in1v, in2v ] = updateDoubleInputGate(states, gate, curState, chgWires);
//       for (const owire of outs) {
//         const outv = in1v | in2v;
//         if (curState[owire.index] === outv) {} else {
//           if (chgWires.includes(owire)) {} else {
//             chgWires.push(owire);
//           }
//         } 
//       }
//     } else if (gate.type === 'not-gate') {
//       const inv = updateSingleInputGate(states, gate, curState, chgWires);
//       for (const owire of outs) {
//         const outv = (inv + 1) % 2; // not
//         if (curState[owire.index] === outv) {} else {
//           if (chgWires.includes(owire)) {} else {
//             chgWires.push(owire);
//           }
//         }
//       }
//     } else if (gate.type === 'in-gate') {
//     }
//   }
// }

// const updateSingleInputGate = (states, gate, curState, pushedList) => {
//   const [ input ] = gate.ins;
//   const inv = curState[input.index];
//   if (inv === -1) {
//     pushSingle(pushedList, in1);
//     curState[in1.index] = 0;
//     states.push([ ...curState ]);
//   }
//   return inv;
// }
