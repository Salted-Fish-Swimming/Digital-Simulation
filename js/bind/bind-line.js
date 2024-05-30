import { bindDrag } from "./bind.js";
import { AdsorptionSite } from "../logate.js";
import { Line, Wire } from "../line.js";
import { S, defaultAttrs } from "../svg.js";
import { regWire } from "../model.js";

const root = {
  canvaSvg: document.querySelector('#canvas'),
  layer1: document.querySelector('#layer-1'),
  layer2: document.querySelector('#layer-2'),
  layer3: document.querySelector('#layer-3'),
};

const rangeOf = ([a, b], x) => {
  if (a < b) {
    return Math.min(Math.max(a, x), b);
  } else {
    return Math.min(Math.max(b, x), a);
  }
}

const squr = x => x * x;
const disqur = (a, b) => squr(a.x - b.x) + squr(a.y - b.y);

const computeLineAdsite = (line, mx, my) => {
  const start = line.getStartPos();
  const end = line.getEndPos();
  const diff = { x: end.x - start.x, y: end.y - start.y };
  if (diff.x === 0) {
    const y = Math.round(my / 5) * 5;
    return {
      x: start.x,
      y: rangeOf([start.y, end.y], y),
    }
  } else if (diff.y === 0) {
    const x = Math.round(mx / 5) * 5;
    return {
      x: rangeOf([start.x, end.x], x),
      y: start.y,
    }
  } else {
    const vof = p => disqur({ x: mx, y: my }, p);
    if (vof(start) > vof(end)) {
      return end;
    } else {
      return start;
    }
  }
}

const bindLineAndWire = (wire, line) => {
  wire.pushLine(line);
  line.wire = wire;
}

const bindLine = (line) => {
  line.sdom.addEventListener('mouseenter', (event) => {
    const { pageX: mx, pageY: my } = event;
    const { x, y } = computeLineAdsite(line, mx, my);
    const adsite = AdsorptionSite(x, y);
    adsite.render(root);
    adsite.sdom.classList.add('hover');

    bindAdsiteOnLine(adsite, line);
  });
}

const bindLineAndGate = (line, gate, adsite) => {
  if (line.wire) {
    line.wire.pushGate(gate);
  } else {
    line.wire = Wire(gate);
    regWire(line.wire);
  }
  line.wire.pushLine(line);
  gate.pushWire([ line.wire, adsite ]);
}

// connect current line and adsite;
let currentConnect = () => {};
const bindAdsiteOnLine = (adsite, oldline) => {
  const Id = setTimeout(() => adsite.remove(), 200);
  adsite.sdom.addEventListener('mouseenter', () => {
    clearTimeout(Id);
    currentConnect = (line) => {
      const { x, y } = adsite.getPos();
      line.setEndPos(x, y);
      bindLineAndWire(oldline.wire, line);
    }
    adsite.sdom.classList.add('hover');
  });
  adsite.sdom.addEventListener('mouseleave', () => {
    currentConnect = () => {};
    adsite.remove();
  });
  adsite.sdom.addEventListener('mousedown', (event) => {
    const { x, y } = adsite.getPos();
    const newline = Line(x, y);
    newline.render(root);
    bindDrag((event) => {
      const x = Math.round(event.pageX / 5) * 5;
      const y = Math.round(event.pageY / 5) * 5;
      newline.setEndPos(x, y);
    }, (event) => {
      bindLineAndWire(oldline.wire, newline);
      currentConnect(newline);
      bindLine(newline);
    });
  });
}

export const bindAdsiteOnGate = (adsite, gate) => {
  adsite.sdom.addEventListener('mouseenter', () => {
    currentConnect = (line) => {
      const { x, y } = adsite.getPos();
      line.setEndPos(x, y);
      bindLineAndGate(line, gate, adsite);
    }
    adsite.sdom.classList.add('hover');
  });
  adsite.sdom.addEventListener('mouseleave', () => {
    currentConnect = () => {};
    adsite.sdom.classList.remove('hover');
  });
  adsite.sdom.addEventListener('mousedown', (event) => {
    const { x, y } = adsite.getPos();
    const line = Line(x, y);
    line.render(root);
    bindDrag((event) => {
      const x = Math.round(event.pageX / 5) * 5;
      const y = Math.round(event.pageY / 5) * 5;
      line.setEndPos(x, y);
    }, (event) => {
      bindLineAndGate(line, gate, adsite);
      currentConnect(line);
      bindLine(line);
    });
  });
}
