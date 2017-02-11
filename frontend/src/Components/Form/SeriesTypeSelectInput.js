import PropTypes from 'prop-types';
import React from 'react';
import SelectInput from './SelectInput';

const seriesTypeOptions = [
  { key: 'standard', value: 'Standard' },
  { key: 'daily', value: 'Daily' },
  { key: 'anime', value: 'Anime' }
];

function SeriesTypeSelectInput(props) {
  const values = [...seriesTypeOptions];

  if (props.includeMixed) {
    values.unshift({
      key: 'mixed',
      value: '(Mixed)',
      disabled: true
    });
  }

  return (
    <SelectInput
      {...props}
      values={values}
    />
  );
}

SeriesTypeSelectInput.propTypes = {
  includeMixed: PropTypes.bool.isRequired
};

SeriesTypeSelectInput.defaultProps = {
  includeMixed: false
};

export default SeriesTypeSelectInput;
