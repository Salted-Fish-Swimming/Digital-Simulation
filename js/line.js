import { S, defaultAttrs } from "./svg.js";

export const Wire = (gate) => {
  const lines = [];
  const gates = [ gate ];
  return {
    type: 'wire',
    getLines () {
      return [ ...lines ];
    },
    getGates () {
      return [ ...gates ];
    },
    pushLine (line) {
      if (lines.includes(line)) {} else {
        lines.push(line);
      }
    },
    pushGate (gate) {
      if (gates.includes(gate)) {} else {
        gates.push(gate);
      }
    },
    setStatus (v) {
      for (const line of lines) {
        line.setStatus(v);
      }
    },
    clear () {
      for (const line of lines) {
        line.clear();
      }
    }
  };
}

export const Line = (x, y) => {
  const pos = { start: { x, y }, end: { x, y } };
  const body = S('line', {
    class: 'wire',
    x1: pos.start.x, x2: pos.end.x,
    y1: pos.start.y, y2: pos.end.y,
    ...defaultAttrs,
  });
  const sdom = S('g', {}, [
    body,
  ]);
  return {
    type: 'line',
    sdom, body,
    render (root) {
      root.layer3.append(sdom);
    },
    setStartPos (x, y) {
      pos.start.x = x, pos.start.y = y;
      body.setAttribute('x1', x);
      body.setAttribute('y1', y);
    },
    getStartPos () {
      return { ...pos.start };
    },
    setEndPos (x, y) {
      pos.end.x = x, pos.end.y = y;
      body.setAttribute('x2', x);
      body.setAttribute('y2', y);
    },
    getEndPos () {
      return { ...pos.end };
    },
    setStatus (v) {
      if (v) {
        body.classList.add('on');
        body.classList.remove('off');
      } else {
        body.classList.add('off');
        body.classList.remove('on');
      }
    },
    clear () {
      body.classList.remove('on');
      body.classList.remove('off');
    }
  };
}
