export const bindDrag = (handleMove, handleUp) => {
  const wrappedHandleUP = (event) => {
    handleUp(event);
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", wrappedHandleUP);
  }
  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseup", wrappedHandleUP);
}

const roundFive = (x) => Math.floor(x / 5) * 5;

export const bindMove = (gate) => {
  gate.body.addEventListener('mousedown', (event) => {
    const { pageX, pageY } = event;
    const start = gate.getPos();

    bindDrag((event) => {
      const dx = event.pageX - pageX;
      const dy = event.pageY - pageY;
      const x = roundFive(dx + start.x);
      const y = roundFive(dy + start.y);
      gate.setPos(x, y);
    }, (event) => {
      if (gate.body.contains(event.target)) {} else {
        gate.remove();
      }
    })
  })
}