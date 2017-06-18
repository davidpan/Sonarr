import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createSelector } from 'reselect';
import createProfileInUseSelector from 'Store/Selectors/createProfileInUseSelector';
import createProviderSettingsSelector from 'Store/Selectors/createProviderSettingsSelector';
import { fetchQualityProfileSchema, setQualityProfileValue, saveQualityProfile } from 'Store/Actions/settingsActions';
import connectSection from 'Store/connectSection';
import EditQualityProfileModalContent from './EditQualityProfileModalContent';

function getQualityItemGroupId(qualityProfile) {
  // Get items with an `id` and filter out null/undefined values
  const ids = _.filter(_.map(qualityProfile.items.value, 'id'), (i) => i != null);

  return Math.max(1000, ...ids) + 1;
}

function createQualitiesSelector() {
  return createSelector(
    createProviderSettingsSelector(),
    (qualityProfile) => {
      const items = qualityProfile.item.items;
      if (!items || !items.value) {
        return [];
      }

      return _.reduceRight(items.value, (result, { allowed, id, name, quality }) => {
        if (allowed) {
          if (id) {
            result.push({
              key: id,
              value: name
            });
          } else {
            result.push({
              key: quality.id,
              value: quality.name
            });
          }
        }

        return result;
      }, []);
    }
  );
}

function createMapStateToProps() {
  return createSelector(
    createProviderSettingsSelector(),
    createQualitiesSelector(),
    createProfileInUseSelector('qualityProfileId'),
    (qualityProfile, qualities, isInUse) => {
      return {
        qualities,
        ...qualityProfile,
        isInUse
      };
    }
  );
}

const mapDispatchToProps = {
  fetchQualityProfileSchema,
  setQualityProfileValue,
  saveQualityProfile
};

class EditQualityProfileModalContentConnector extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      dragIndex: null,
      dragGroupId: null,
      dropIndex: null,
      dropGroupId: null
    };
  }

  componentWillMount() {
    if (!this.props.id) {
      this.props.fetchQualityProfileSchema();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSaving && !this.props.isSaving && !this.props.saveError) {
      this.props.onModalClose();
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setQualityProfileValue({ name, value });
  }

  onCutoffChange = ({ name, value }) => {
    const id = parseInt(value);
    const item = _.find(this.props.item.items.value, (i) => {
      if (i.quality) {
        return i.quality.id === id;
      }

      return i.id === id;
    });

    const cutoffId = item.quality ? item.quality.id : item.id;

    this.props.setQualityProfileValue({ name, value: cutoffId });
  }

  onSavePress = () => {
    this.props.saveQualityProfile({ id: this.props.id });
  }

  onQualityProfileItemAllowedChange = (id, allowed) => {
    const qualityProfile = _.cloneDeep(this.props.item);
    const items = qualityProfile.items.value;
    const item = _.find(qualityProfile.items.value, (i) => i.quality && i.quality.id === id);

    item.allowed = allowed;

    this.props.setQualityProfileValue({
      name: 'items',
      value: items
    });

    this.ensureCutoff(qualityProfile);
  }

  onItemGroupAllowedChange = (id, allowed) => {
    const qualityProfile = _.cloneDeep(this.props.item);
    const items = qualityProfile.items.value;
    const item = _.find(qualityProfile.items.value, (i) => i.id === id);

    item.allowed = allowed;

    // Update each item in the group (for consistency only)
    item.items.forEach((i) => {
      i.allowed = allowed;
    });

    this.props.setQualityProfileValue({
      name: 'items',
      value: items
    });

    this.ensureCutoff(qualityProfile);
  }

  onItemGroupNameChange = (id, name) => {
    const qualityProfile = _.cloneDeep(this.props.item);
    const items = qualityProfile.items.value;
    const group = _.find(items, (i) => i.id === id);

    group.name = name;

    this.props.setQualityProfileValue({
      name: 'items',
      value: items
    });
  }

  onCreateGroupPress = (id) => {
    const qualityProfile = _.cloneDeep(this.props.item);
    const items = qualityProfile.items.value;
    const item = _.find(items, (i) => i.quality && i.quality.id === id);
    const index = items.indexOf(item);
    const groupId = getQualityItemGroupId(qualityProfile);

    const group = {
      id: groupId,
      name: item.quality.name,
      allowed: item.allowed,
      items: [
        item
      ]
    };

    // Add the group in the same location the quality item was in.
    items.splice(index, 1, group);

    this.props.setQualityProfileValue({
      name: 'items',
      value: items
    });

    this.ensureCutoff(qualityProfile);
  }

  onDeleteGroupPress = (id) => {
    const qualityProfile = _.cloneDeep(this.props.item);
    const items = qualityProfile.items.value;
    const group = _.find(items, (i) => i.id === id);
    const index = items.indexOf(group);

    // Add the items in the same location the group was in
    items.splice(index, 1, ...group.items);

    this.props.setQualityProfileValue({
      name: 'items',
      value: items
    });

    this.ensureCutoff(qualityProfile);
  }

  onQualityProfileItemDragMove = ({ dragIndex, dragGroupIndex, dragGroupId, dropIndex, dropGroupIndex, dropGroupId }) => {
    // If we're dragging between different groups we use the group indexes,
    // not the item indexes.

    // Can't drag from a group to a position in the main list with the same index.
    // Not relying on indexes and calculating location based on group/quality IDs would help with this I think.

    if (dragGroupIndex != null && dropGroupIndex != null && dragGroupIndex !== dropGroupIndex) {
      dragIndex = dragGroupIndex;
      dropIndex = dropGroupIndex;
    }

    if (
      this.state.dragIndex !== dragIndex ||
      this.state.dragGroupId !== dragGroupId ||
      this.state.dropIndex !== dropIndex ||
      this.state.dropGroupId !== dropGroupId
    ) {
      this.setState({
        dragIndex,
        dragGroupId,
        dropIndex,
        dropGroupId
      });
    }
  }

  onQualityProfileItemDragEnd = ({ groupId, qualityId, sortIndex }, didDrop) => {
    const {
      dropIndex,
      dropGroupId
    } = this.state;

    if (didDrop && dropIndex != null) {
      const qualityProfile = _.cloneDeep(this.props.item);
      const items = qualityProfile.items.value;
      let item = null;
      let adjustedDropIndex = dropIndex;

      if (groupId && qualityId != null) {
        const group = _.find(items, (i) => i.id === groupId);
        item = group.items.splice(sortIndex, 1)[0];

        if (!dropGroupId && dropIndex > 0) {
          adjustedDropIndex = dropIndex + 1;
        }

        if (!group.items.length) {
          const index = items.indexOf(group);
          items.splice(index, 1);
        }
      } else {
        item = items.splice(sortIndex, 1)[0];
      }

      if (dropGroupId) {
        const group = _.find(items, (i) => i.id === dropGroupId);
        group.items.splice(dropIndex, 0, item);
      } else {
        items.splice(adjustedDropIndex, 0, item);
      }

      this.props.setQualityProfileValue({
        name: 'items',
        value: items
      });

      this.ensureCutoff(qualityProfile);
    }

    this.setState({
      dragIndex: null,
      dragGroupId: null,
      dropIndex: null,
      dropGroupId: null
    });
  }

  //
  // Control

  ensureCutoff = (qualityProfile) => {
    const cutoff = qualityProfile.cutoff.value;

    const cutoffItem = _.find(qualityProfile.items.value, (i) => {
      if (!cutoff) {
        return false;
      }

      return i.id === cutoff || (i.quality && i.quality.id === cutoff);
    });

    // If the cutoff isn't allowed anymore or there isn't a cutoff set one
    if (!cutoff || !cutoffItem || !cutoffItem.allowed) {
      const firstAllowed = _.find(qualityProfile.items.value, { allowed: true });
      let cutoffId = null;

      if (firstAllowed) {
        cutoffId = firstAllowed.quality ? firstAllowed.quality.id : firstAllowed.id;
      }

      this.props.setQualityProfileValue({ name: 'cutoff', value: cutoffId });
    }
  }

  //
  // Render

  render() {
    if (_.isEmpty(this.props.item.items) && !this.props.isFetching) {
      return null;
    }

    return (
      <EditQualityProfileModalContent
        {...this.state}
        {...this.props}
        onSavePress={this.onSavePress}
        onInputChange={this.onInputChange}
        onCutoffChange={this.onCutoffChange}
        onCreateGroupPress={this.onCreateGroupPress}
        onDeleteGroupPress={this.onDeleteGroupPress}
        onQualityProfileItemAllowedChange={this.onQualityProfileItemAllowedChange}
        onItemGroupAllowedChange={this.onItemGroupAllowedChange}
        onItemGroupNameChange={this.onItemGroupNameChange}
        onQualityProfileItemDragMove={this.onQualityProfileItemDragMove}
        onQualityProfileItemDragEnd={this.onQualityProfileItemDragEnd}
      />
    );
  }
}

EditQualityProfileModalContentConnector.propTypes = {
  id: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  setQualityProfileValue: PropTypes.func.isRequired,
  fetchQualityProfileSchema: PropTypes.func.isRequired,
  saveQualityProfile: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default connectSection(
  createMapStateToProps,
  mapDispatchToProps,
  undefined,
  undefined,
  { section: 'qualityProfiles' }
)(EditQualityProfileModalContentConnector);
