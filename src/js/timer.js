// helper
const toDigitTime = time => `${time < 10 ? '0' : ''}${time}`;

const parseTime = time => {
  const minutes = toDigitTime(Math.floor(time / 60) % 60);
  const seconds = toDigitTime(time % 60);
  return `${minutes}:${seconds}`;
};

const timer = (() => {
  let measureTime = 0;
  let interval;

  return {
    getTime() {
      return measureTime;
    },
    setTime(time) {
      measureTime = time;
    },
    updateTime() {
      if (measureTime === 0) clearInterval(interval);
      measureTime -= 1;
      return parseTime(measureTime + 1);
    },
    start(predicate, time) {
      predicate();
      interval = setInterval(predicate, time);
    },
    stop() {
      clearInterval(interval);
    },
    reset(time) {
      measureTime = time;
    },
  };
})();

export default timer;
