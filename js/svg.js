const URI = "http://www.w3.org/2000/svg";

export const defaultAttrs = {
  fill: '#ffffff',
  stroke: 'black',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': 4,
};

export const S = (name, attrs, children = []) => {
  const sdom = document.createElementNS(URI, name);
  for (const name in attrs) {
    const value = attrs[name];
    sdom.setAttribute(name, value);
  }
  for (const child of children) {
    sdom.append(child);
  }
  return sdom;
};