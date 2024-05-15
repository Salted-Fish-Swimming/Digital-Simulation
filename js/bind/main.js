import { AndGate, InGate, NotGate, OrGate, OutGate } from "../logate.js";
import { bindDrag, bindMove } from "./bind.js";
import { bindAdsiteOnGate } from "./bind-line.js";
import { getCircuit, regGate } from "../model.js";
import { simulate, updateByClick } from "../simulate.js";

const GateBuilders = [ AndGate, OrGate, NotGate, InGate, OutGate ];

const menuDiv = document.getElementById('menu');
const optionDivs = [ ...menuDiv.getElementsByClassName('option') ];

const root = {
  canvaSvg: document.querySelector('#canvas'),
  layer1: document.querySelector('#layer-1'),
  layer2: document.querySelector('#layer-2'),
  layer3: document.querySelector('#layer-3'),
};

const computeXY = (type, event, offsetX, offsetY) => {
  const nx = event.pageX - offsetX;
  const ny = event.pageY - offsetY;
  if (type === 'in-gate') {
    return [ nx + 20, ny + 25 ];
  } else if (type === 'out-gate') {
    return [ nx + 15, ny + 25 ];
  } else {
    return [ nx + 30, ny + 30 ];
  }
}

const bindMenu = () => {

  menuDiv.addEventListener("mousedown", (event) => {
    const Index = optionDivs.findIndex(x => x.contains(event.target));

    if (Index >= 0) {
      const { offsetX, offsetY, pageX, pageY } = event;

      const gate = GateBuilders[Index](pageX, pageY);
      gate.render(root);

      bindDrag((event) => {
        const [ x, y ] = computeXY(gate.type, event, offsetX, offsetY);
        const rxd = Math.round(x / 5) * 5;
        const ryd = Math.round(y / 5) * 5;
        gate.setPos(rxd, ryd);
      }, (event) => {
        if (root.canvaSvg.contains(event.target)) {
          // place logic gate !
          bindGate(gate);
          // gates.push(gate);
        } else {
          gate.remove();
        }
      })
    } 
  });

}

const bindSimulate = () => {
  const button = document.querySelector('#button');
  button.addEventListener('click', () => {
    console.log('simulated');
    const circuit = getCircuit();
    simulate(circuit);
  });
}

export const bindMain = () => {
  bindMenu();
  bindSimulate();
}

const bindInput = (gate) => {
  gate.status = false;
  gate.button.addEventListener('click', (event) => {
    if (gate.status) {
      gate.status = false;
      gate.button.classList.add('off');
      gate.button.classList.remove('on');
    } else {
      gate.status = true;
      gate.button.classList.add('on');
      gate.button.classList.remove('off');
    }
    updateByClick(gate, gate.status);
  });
}

const bindOutput = (gate) => {
  gate.status = false;
  // gate.light.addEventListener('click', (event) => {
  //   if (gate.status) {
  //     gate.button.classList.remove('on');
  //     gate.status = false;
  //   } else {
  //     gate.button.classList.add('on');
  //     gate.status = true;
  //   }
  // });
}

const bindGate = (gate) => {
  bindMove(gate);
  regGate(gate);
  if (gate.type === 'and-gate') {
    bindAdsiteOnGate(gate.out, gate);
    bindAdsiteOnGate(gate.in1, gate);
    bindAdsiteOnGate(gate.in2, gate);
  } else if (gate.type === 'or-gate') {
    bindAdsiteOnGate(gate.out, gate);
    bindAdsiteOnGate(gate.in1, gate);
    bindAdsiteOnGate(gate.in2, gate);
  } else if (gate.type === 'not-gate') {
    bindAdsiteOnGate(gate.out, gate);
    bindAdsiteOnGate(gate.in, gate);
  } else if (gate.type === 'in-gate') {
    bindAdsiteOnGate(gate.out, gate);
    bindInput(gate);
  } else if (gate.type === 'out-gate') {
    bindAdsiteOnGate(gate.in, gate);
    bindOutput(gate);
  }
}