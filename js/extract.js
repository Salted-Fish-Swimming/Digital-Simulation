export const etcOutWire = (gate) => {
  const wires = [];
  for (const [ wire, adsite ] of gate.getWires()) {
    if (adsite === gate.out) {
      wires.push(wire);
    }
  }
  return wires;
}

const isInOf = (adsite, gate) => {
  if (gate.type === 'or-gate' || gate.type === 'and-gate') {
    return gate.in1 === adsite || gate.in2 === adsite;
  } else if (gate.type === 'out-gate' || gate.type === 'not-gate') {
    return gate.in === adsite;
  } else {
    return false;
  }
}

export const etcInWire = (gate) => {
  const wires =[];
  for (const [ wire, adsite ] of gate.getWires()) {
    if (isInOf(adsite, gate)) {
      wires.push(wire);
    }
  }
  return wires;
}

const isInAdsite = (gate, adsite) => {
  if (gate.type === 'and-gate' || gate.type === 'or-gate') {
    return gate.in1 === adsite || gate.in2 === adsite;
  } else {
    return gate.in === adsite;
  }
}

const isOutOf = (gate, oWire) => {
  for (const [ wire, adsite ] of gate.getWires()) {
    if (oWire === wire) {
      return isInAdsite(gate, adsite);
    }
  }
  return false;
}

export const etcOutGate = (wire) => {
  const gates = [];
  for (const gate of wire.getGates()) {
    if (isOutOf(gate, wire)) {
      gates.push(gate);
    }
  }
  return gates;
}

const indexful = (inputs, gates, wires, outMap, inMap) => {
  const xinputs = inputs.map(ig => {
    const gatesIndex = gates.findIndex(g => g === ig);
    return {
      gate: ig,
      index: gatesIndex,
    }
  });

  const xgates = gates.map(g => {
    const outWires = outMap.get(g);
    const inWires = inMap.get(g);
    const outIndexs = outWires.map(w => wires.findIndex(x => w === x));
    const inIndexs = inWires.map(w => wires.findIndex(x => w === x));
    return {
      gate: g, outIndexs, inIndexs,
    }
  });

  const xwires = wires.map(w => {
    const outGates = outMap.get(w);
    const indexs = outGates.map(g => gates.findIndex(x => g === x));
    return {
      wire: w, outIndexs: indexs,
    }
  });

  return [ xinputs, xgates, xwires ];
}

const unIndexful = (inputs, gates, wires) => {
  const xgates = gates.map(({ gate, outIndexs, inIndexs }) => {
    return ({
      type: gate.type, gate, outs: outIndexs, ins: inIndexs,
    });
  }
    );
  const xwires = wires.map(({ wire, outIndexs }, index) => ({
    type: 'wire', wire, index,
    outs: outIndexs.map(i => xgates[i])
  }));
  xgates.forEach(g => {
    g.outs = g.outs.map(i => xwires[i]);
    g.ins = g.ins.map(i => xwires[i]);
  });
  const xinputs = inputs.map(({ gate, index }) => xgates[index]);
  return [ xinputs, xgates, xwires ];
}

const buildCircuit = (inputs, gates, wires, outMap, inMap) => {
  const [
    indexfulInputs, indexfulGates, indexfulWires
  ] = indexful(inputs, gates, wires, outMap, inMap);
  const [
    xinputs, xgates, xwires
  ] = unIndexful(indexfulInputs, indexfulGates, indexfulWires);
  return {
    inputs: xinputs,
    gates: xgates,
    wires: xwires,
  };
}

export const extractCircuitFromInput = (inputs) => {
  const gates = [ ...inputs ];
  const wires = [];
  const outMap = new Map();
  const inMap = new Map();

  const etcGate = (gate) => {
    const outWires = etcOutWire(gate);
    const inWires = etcInWire(gate);
    const tecWires = [];
    for (const wire of outWires) {
      if (wires.includes(wire)) {} else {
        wires.push(wire);
        tecWires.push(wire);
      }
    }
    for (const wire of inWires) {
      if (wires.includes(wire)) {} else {
        wires.push(wire);
        tecWires.push(wire);
      }
    }
    outMap.set(gate, outWires);
    inMap.set(gate, inWires);
    tecWires.forEach(w => etcWire(w));
  }

  const etcWire = (wire) => {
    const outGates = etcOutGate(wire);
    const tecGates = [];
    for (const gate of outGates) {
      if (gates.includes(gate)) {} else {
        gates.push(gate);
        tecGates.push(gate);
      }
    }
    outMap.set(wire, outGates);
    tecGates.forEach(g => etcGate(g));
  }

  inputs.forEach(g => etcGate(g));

  return buildCircuit(inputs, gates, wires, outMap, inMap);
}
