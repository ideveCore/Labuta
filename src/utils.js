export const format_time = (timer) => {
  let hours = Math.floor(timer / 60 / 60)
  let minutes = Math.floor(timer / 60) % 60;
  let seconds = timer % 60;
  if (hours.toString().split('').length < 2) {
    hours = `0${hours}`
  }
  if (minutes.toString().split('').length < 2) {
    minutes = `0${minutes}`
  }
  if (seconds.toString().split('').length < 2) {
    seconds = `0${seconds}`
  }
  return `${hours}:${minutes}:${seconds}`
}
