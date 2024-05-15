import { defaultAttrs, S } from "./svg.js";

export const AdsorptionSite = (x, y) => {
  const pos = { x, y };
  const sdom = S('rect', {
    class: 'adsorption-site',
    x: x - 5, y: y - 5,
    height: 10, width: 10,
    ...defaultAttrs, stroke: 'none',
  });

  return {
    type: 'adsorption-site',
    sdom,
    render (root) {
      root.layer1.append(sdom);
    },
    setPos (x, y) {
      pos.x = x, pos.y = y;
      sdom.setAttribute('x', x - 5);
      sdom.setAttribute('y', y - 5);
    },
    getPos () {
      return { ...pos };
    },
    remove () {
      sdom.remove();
    }
  }
}

export const AndGate = (x, y) => {
  const d = (x, y) => `M ${x} ${y} l 0 40 l 20 0 a 20 20 0 0 0 0 -40 Z`;
  const pos = { x, y };
  const body = S('path', {
    d: d(pos.x, pos.y), ...defaultAttrs,
  });
  const out = AdsorptionSite(x + 40, y + 20);
  const in1 = AdsorptionSite(x, y + 10);
  const in2 = AdsorptionSite(x, y + 30);
  const wires = [];

  return {
    type: 'and-gate',
    body, out, in1, in2,
    render (root) {
      root.layer2.append(body);
      out.render(root);
      in1.render(root);
      in2.render(root);
    },
    setPos (x, y) {
      pos.x = x, pos.y = y;
      body.setAttribute('d', d(x, y));
      out.setPos(x + 40, y + 20);
      in1.setPos(x, y + 10);
      in2.setPos(x, y + 30);
    },
    getPos () {
      return { ...pos };
    },
    pushWire (wire) {
      wires.push(wire);
    },
    getWires () {
      return [ ...wires ];
    },
    remove () {
      body.remove();
      out.remove();
      in1.remove();
      in2.remove();
    }
  }
}

export const OrGate = (x, y) => {
  const d = (x, y) => `M ${x} ${y} a 40 40 0 0 1 0 40 l 20 0 a 20 20 0 0 0 0 -40 Z`;
  const pos = { x, y };
  const body = S('path', {
    d: d(pos.x, pos.y), ...defaultAttrs,
  });
  const out = AdsorptionSite(x + 40, y + 20);
  const in1 = AdsorptionSite(x + 4, y + 10);
  const in2 = AdsorptionSite(x + 4, y + 30);
  const wires = [];

  return {
    type: 'or-gate',
    body, out, in1, in2,
    render (root) {
      root.layer2.append(body);
      out.render(root);
      in1.render(root);
      in2.render(root);
    },
    setPos (x, y) {
      pos.x = x, pos.y = y;
      body.setAttribute('d', d(x, y));
      out.setPos(x + 40, y + 20);
      in1.setPos(x + 4, y + 10);
      in2.setPos(x + 4, y + 30);
    },
    getPos () {
      return { ...pos };
    },
    pushWire (wire) {
      wires.push(wire);
    },
    getWires () {
      return [ ...wires ];
    },
    remove () {
      body.remove();
      out.remove();
      in1.remove();
      in2.remove();
    }
  }
}

export const NotGate = (x, y) => {
  const d = (x, y) => `M ${x} ${y} l 0 40 l 30 -20 Z`;
  const cpos = (x, y) => ({ cx: x + 36, cy: y + 20 });
  const pos = { x, y };
  const triangle = S('path', { d: d(x, y), ...defaultAttrs });
  const circle = S('circle', {
    r: 5, ...cpos(x, y),
    ...defaultAttrs
  });
  const body = S('g', {},[
    triangle, circle,
  ]);
  const input = AdsorptionSite(x, y + 20);
  const out = AdsorptionSite(x + 40, y + 20);
  const wires = [];

  return {
    type: 'not-gate',
    body, in: input, out,
    render (root) {
      root.layer2.append(body);
      input.render(root);
      out.render(root);
    },
    setPos (x, y) {
      pos.x = x, pos.y = y;
      triangle.setAttribute('d', d(x, y));
      const { cx, cy } = cpos(x, y);
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      input.setPos(x, y + 20);
      out.setPos(x + 40, y + 20);
    },
    getPos () {
      return { ...pos };
    },
    pushWire (wire) {
      wires.push(wire);
    },
    getWires () {
      return [ ...wires ];
    },
    remove () {
      body.remove();
      out.remove();
      input.remove();
    }
  };
}

export const InGate = (x, y) => {
  const d1 = (x, y) => `M ${x} ${y} l 50 0 l 20 20 l 0 10 l -20 20 l -50 0 Z`;
  const d2 = (x, y) => `M ${x + 10} ${y + 10} l 30 0 l 0 30 l -30 0 Z`;
  const d3 = (x, y) => `M ${x + 50} ${y + 15} l 10 10 l -10 10 Z`;
  const part1 = S('path', { d: d1(x, y), ...defaultAttrs });
  const button = S('path', { class: 'input', d: d2(x, y), ...defaultAttrs });
  const part3 = S('path', { d: d3(x, y), ...defaultAttrs });
  const body = S('g', {}, [
    part1, button, part3,
  ]);
  const out = AdsorptionSite(x + 70, y + 25);
  const pos = { x, y };
  const wires = [];
  return {
    type: 'in-gate',
    body, out, button,
    render (root) {
      root.layer2.append(body);
      out.render(root);
    },
    setPos (x, y) {
      pos.x = x, pos.y = y;
      part1.setAttribute('d', d1(x, y));
      button.setAttribute('d', d2(x, y));
      part3.setAttribute('d', d3(x, y));
      out.setPos(x + 70, y + 25);
    },
    getPos () {
      return { ...pos };
    },
    pushWire (wire) {
      wires.push(wire);
    },
    getWires () {
      return [ ...wires ];
    },
    remove () {
      body.remove();
      out.remove();
    }
  }
}

export const OutGate = (x, y) => {
  const d1 = (x, y) => `M ${x + 16} ${y} l 50 0 l 0 50 l -50 0 l -16 -12 l 0 -26 Z`;
  const d2 = (x, y) => `M ${x + 26} ${y + 10} l 30 0 l 0 30 l -30 0 Z`;
  const d3 = (x, y) => `M ${x + 8} ${y + 15} l 10 10 l -10 10 Z`;
  const part1 = S('path', { d: d1(x, y), ...defaultAttrs });
  const light = S('path', { class: 'light', d: d2(x, y), ...defaultAttrs });
  const part3 = S('path', { d: d3(x, y), ...defaultAttrs });
  const body = S('g', {}, [
    part1, light, part3,
  ]);
  const input = AdsorptionSite(x, y + 25);
  const pos = { x, y };
  const wires = [];
  return {
    type: 'out-gate',
    body, in: input,
    render (root) {
      root.layer2.append(body);
      input.render(root);
    },
    setPos (x, y) {
      pos.x = x, pos.y = y;
      part1.setAttribute('d', d1(x, y));
      light.setAttribute('d', d2(x, y));
      part3.setAttribute('d', d3(x, y));
      input.setPos(x, y + 25);
    },
    getPos () {
      return { ...pos };
    },
    pushWire (wire) {
      wires.push(wire);
    },
    getWires () {
      return [ ...wires ];
    },
    remove () {
      body.remove();
      input.remove();
    },
    setStatus (v) {
      if (v) {
        light.classList.add('on');
        light.classList.remove('off');
      } else {
        light.classList.add('off');
        light.classList.remove('on');
      }
    }
  };
}