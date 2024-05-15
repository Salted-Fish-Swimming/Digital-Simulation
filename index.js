import { bindMain } from "./js/bind/main.js";
import { getCircuit, getGates, getWires } from "./js/model.js";

bindMain();

globalThis.model = {
  getGates, getWires,
  getCircuit,
}