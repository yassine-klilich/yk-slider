let step = 2
let min = -10
let max = 10
let range = [11, 37]
let lastMax = 0
let value = [6, 37] // range values
let configLimit = [[NaN, 3], [NaN, NaN]] // limit/range of each thumb
let limit = [[NaN, NaN], [NaN, NaN]]
let _thumbToAdjust = '' // left - right
let _sliderDOMRect


const slider = document.querySelector(".slider")
const progress = document.querySelector(".progress")
const thumbLeft = document.querySelector(".thumbLeft")
const thumbRight = document.querySelector(".thumbRight")

slider.addEventListener('pointerdown', _onPointerDown)


function _init() {
  _adjustMinMaxValues()
  _adjustLimitValues()
  _adjustValueToLimit()
  setLeftValue(value[0])
  setRightValue(value[1])
}

/**
 * 
 * @param {PointerEvent} event 
 */
function _onPointerDown(event) {
  _thumbToAdjust = _whichThumbToAdjust(event.clientX)
  _sliderDOMRect = slider.getBoundingClientRect()

  // Update UI on click
  _updateUI(event.clientX)

  // Attach dragging events
  document.addEventListener('pointermove', _onPointerMove)
  document.addEventListener('pointerup', _onPointerUp)
}

function _onPointerUp() {
  _thumbToAdjust = ''
  _sliderDOMRect = null

  // Detach dragging events
  document.removeEventListener('pointermove', _onPointerMove)
  document.removeEventListener('pointerup', _onPointerUp)
}

/**
 * On pointer move
 * @param {PointerEvent} event 
 */
function _onPointerMove(event) {
  // Update UI on pointer move
  _updateUI(event.clientX)

  console.log(value);
  
}

/**
 * Update UI
 * @param {number} pointerX 
 */
function _updateUI(pointerX) {
  const percentage = _getPercentage(pointerX)
  const _value = mapPercentageToMinMaxRange(percentage)
  
  switch (_thumbToAdjust) {
    case 'left': {
      setLeftValue(_value)
    } break;
    case 'right': {
      setRightValue(_value)
    } break;
  }

  updateInputs()
}

/**
 * Get percentage value
 * @param {number} pointerX 
 */
function _getPercentage(pointerX) {
  return Math.min(
    100,
    Math.max(
      0,
      ((pointerX - _sliderDOMRect.left) / _sliderDOMRect.width) * 100
    )
  )
}

/**
 * Map percentage value (0-100) to min max range value
 * @param {number} value 
 * @returns 
 */
function mapPercentageToMinMaxRange(value) {
  return min + (max - min) * (value / 100);
}

/**
 * Map value to percentage range (0-100)
 * @param {number} value 
 * @returns percentage value
 */
function mapValueToPercentageValue(value) {
  const rangeFrom = max - min;
  const rangeTo = 100;
  
  // Calculate the position of the value within the initial range
  const relativePosition = (value - min) / (rangeFrom || 1);
  
  // Map the position to the new range with the defined step
  const steps = Math.round(relativePosition * (rangeTo / step));
  const mappedValue = steps * step;
  
  return mappedValue;
}

/**
 * Update left thumb
 * @param {number} percentage 
 */
function _updateLeftThumb(percentage) {
  thumbLeft.style.left = percentage + "%"
  progress.style.left = percentage + "%"
}

/**
 * Update right thumb
 * @param {number} percentage 
 */
function _updateRightThumb(percentage) {
  thumbRight.style.left = percentage + "%"
  progress.style.right = (0 + (100 - percentage)) + "%"
}

/**
 * Set minimum and maximum value
 * @param {number} min 
 * @param {number} max 
 */
function _setValue(min, max) {
  value[0] = min
  value[1] = max
}

/**
 * 
 * @param {*} _value 
 */
function setLeftValue(_value) {
  const correctValue = _getValueInRange(_value)
  if (
    correctValue <= value[1] &&
    (limit[0][0] <= correctValue) &&
    (limit[0][1] >= correctValue))
  {
    value[0] = correctValue
    _updateLeftThumb(mapValueToPercentageValue(correctValue))
  }
}

/**
 * 
 * @param {*} _value 
 */
function setRightValue(_value) {
  const correctValue = _getValueInRange(_value)
  console.log(correctValue);
  if (
    correctValue >= value[0] &&
    (isNaN(limit[1][0]) || limit[1][0] <= correctValue) &&
    (isNaN(limit[1][1]) || limit[1][1] >= correctValue))
  {
    value[1] = correctValue
    _updateRightThumb(mapValueToPercentageValue(correctValue))
  }
}

/**
 * Adjust min and max values.
 */
function _adjustMinMaxValues() {
  if (min > max) {
    const tempMax = max
    max = min
    min = tempMax
  }
  lastMax = min + (step * Math.round((max - min) / step))

  if (lastMax > max) {
    lastMax -= step
  }
}

/**
 * Adjust the limit option to be adapted with min and max value 
 * and if the limit values are in the range specified with step.
 */
function _adjustLimitValues() {
  limit[0][0] = _getValueInRange(Math.max(min, configLimit[0][0] || -Infinity))
  limit[0][1] = _getValueInRange(Math.min(configLimit[0][1] || Infinity, lastMax))

  limit[1][0] = _getValueInRange(Math.max(min, configLimit[1][0] || -Infinity))
  limit[1][1] = _getValueInRange(Math.min(configLimit[1][1] || Infinity, lastMax))
}

function _adjustValueToLimit() {
  // Adjust left value
  if (value[0] < limit[0][0]) {
    value[0] = limit[0][0]
  }
  if (value[0] > limit[0][1]) {
    value[0] = limit[0][1]
  }

  // Adjust right value
  if (value[1] < limit[1][0]) {
    value[1] = limit[1][0]
  }
  if (value[1] > limit[1][1]) {
    value[1] = limit[1][1]
  }
}

/**
 * Find which thumb to adjust.
 * @param {number} pointerX
 * 
 * @returns {string} left or right
 */
function _whichThumbToAdjust(pointerX) {
  const rectThumbLeft = thumbLeft.getBoundingClientRect()
  const rectThumbRight = thumbRight.getBoundingClientRect()

  const distanceBetweenTwoThumbs = rectThumbRight.left - rectThumbLeft.right
  const distanceBetweenPointerAndLeftThumb = pointerX - rectThumbLeft.right

  return (distanceBetweenPointerAndLeftThumb > (distanceBetweenTwoThumbs / 2)) ? 'right' : 'left';
}


function _getValueInRange(x) {
  if (x <= min) {
    return min;
  } else if (x >= lastMax) {
    return lastMax;
  } else {
    const lower = Math.floor((x - min) / step) * step + min;
    const upper = Math.ceil((x - min) / step) * step + min;
    
    return x - lower < upper - x ? lower : upper;
  }
}

_init();