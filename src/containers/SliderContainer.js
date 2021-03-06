import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';


const SliderContainer = props =>
  <div style={{display: 'table', width: '100%'}}>
    <div className='left-slider-value'>
      {props.min}
    </div>
    <div style={{
      display: 'table-cell',
      position: 'relative',
      top: '5px',
    }}
    onWheel={(e) => {
      e.preventDefault(); // Cancels the event
      const valueToAdd = e.deltaY > 0 ? props.step : -props.step;
      const valueToEmit = props.value + valueToAdd;
      if (valueToEmit < props.max && valueToEmit > props.min) {
        props.onChange(valueToEmit);
      }
    }}
    >
      <Slider
        min={props.min}
        max={props.max}
        defaultValue={props.defaultValue}
        value={props.value}
        step={props.step}
        marks={{}}
        handle={props.handle}
        disabled={props.disabled}
        onChange={props.onChange}
        trackStyle={{visibility: 'hidden'}}
        railStyle={{
          borderRadius: 0,
          height: '1.2px',
          backgroundColor: 'black',
        }}
        handleStyle={{
          borderWidth: 0,
          backgroundColor: 'black',
          width: '10px',
          height: '10px',
          marginTop: '-4.5px',
        }}
      />
    </div>
    <div className='right-slider-value'>
      {props.max}
    </div>
  </div>;

SliderContainer.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  defaultValue: PropTypes.number.isRequired,
  step: PropTypes.number,
  handle: PropTypes.any,
  disabled: PropTypes.bool,
  onChange: PropTypes.any,
  value: PropTypes.number,
};

export default SliderContainer;
