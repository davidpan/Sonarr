import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { addRootFolder } from 'Store/Actions/rootFolderActions';
import RootFolderSelectInput from './RootFolderSelectInput';

const ADD_NEW_KEY = 'addNew';

function createMapStateToProps() {
  return createSelector(
    (state) => state.rootFolders,
    (state, { includeNoChange }) => includeNoChange,
    (rootFolders, includeNoChange) => {
      const values = _.map(rootFolders.items, (rootFolder) => {
        return {
          key: rootFolder.path,
          value: rootFolder.path
        };
      });

      if (includeNoChange) {
        values.unshift({
          key: 'noChange',
          value: 'No Change'
        });
      }

      if (!values.length) {
        values.push({
          key: '',
          value: '',
          disabled: true
        });
      }

      values.push({
        key: ADD_NEW_KEY,
        value: 'Add a new path'
      });

      return {
        values
      };
    }
  );
}

const mapDispatchToProps = {
  addRootFolder
};

class RootFolderSelectInputConnector extends Component {

  //
  // Lifecycle

  componentWillMount() {
    const {
      name,
      value,
      values,
      onChange
    } = this.props;

    if (!value || !_.some(values, (v) => v.hasOwnProperty(value)) || value === ADD_NEW_KEY) {
      const defaultValue = _.keys(values[0])[0];

      if (defaultValue === ADD_NEW_KEY) {
        onChange({ name, value: '' });
      } else {
        onChange({ name, value: _.keys(values[0])[0] });
      }
    }
  }

  //
  // Listeners

  onNewRootFolderSelect = (path) => {
    this.props.addRootFolder({ path });
  }

  //
  // Render

  render() {
    return (
      <RootFolderSelectInput
        {...this.props}
        onNewRootFolderSelect={this.onNewRootFolderSelect}
      />
    );
  }
}

RootFolderSelectInputConnector.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  includeNoChange: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  addRootFolder: PropTypes.func.isRequired
};

RootFolderSelectInputConnector.defaultProps = {
  includeNoChange: false
};

export default connect(createMapStateToProps, mapDispatchToProps)(RootFolderSelectInputConnector);
