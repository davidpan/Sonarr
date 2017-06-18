import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { icons } from 'Helpers/Props';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import QualityProfileItemDragSource from './QualityProfileItemDragSource';
import styles from './QualityProfileItemGroup.css';

class QualityProfileItemGroup extends Component {

  //
  // Listeners

  onAllowedChange = ({ value }) => {
    const {
      groupId,
      onItemGroupAllowedChange
    } = this.props;

    onItemGroupAllowedChange(groupId, value);
  }

  onNameChange = ({ value }) => {
    const {
      groupId,
      onItemGroupNameChange
    } = this.props;

    onItemGroupNameChange(groupId, value);
  }

  onDeleteGroupPress = ({ value }) => {
    const {
      groupId,
      onDeleteGroupPress
    } = this.props;

    onDeleteGroupPress(groupId, value);
  }

  //
  // Render

  render() {
    const {
      advancedSettings,
      groupId,
      name,
      allowed,
      items,
      sortIndex,
      isDragging,
      isDraggingUp,
      isDraggingDown,
      connectDragSource,
      onQualityProfileItemAllowedChange,
      onQualityProfileItemDragMove,
      onQualityProfileItemDragEnd
    } = this.props;

    return (
      <div
        className={classNames(
          styles.qualityProfileItemGroup,
          isDragging && styles.isDragging,
        )}
      >
        <div className={styles.qualityProfileItemGroupInfo}>
          <label
            className={styles.qualityName}
          >
            <CheckInput
              containerClassName={styles.checkContainer}
              name="allowed"
              value={allowed}
              onChange={this.onAllowedChange}
            />

            {
              advancedSettings ?
                <TextInput
                  className={styles.name}
                  name="name"
                  value={name}
                  onChange={this.onNameChange}
                /> :
              name
            }
          </label>

          {
          advancedSettings &&
            <IconButton
              className={styles.deleteGroupButton}
              name={icons.REMOVE}
              onPress={this.onDeleteGroupPress}
            />
        }

          {
            advancedSettings &&
              connectDragSource(
                <div className={styles.dragHandle}>
                  <Icon
                    className={styles.dragIcon}
                    name={icons.REORDER}
                  />
                </div>
              )
          }
        </div>

        {
          advancedSettings &&
            <div className={styles.items}>
              {
                items.map(({ quality }, index) => {
                  return (
                    <QualityProfileItemDragSource
                      key={quality.id}
                      advancedSettings={advancedSettings}
                      groupId={groupId}
                      qualityId={quality.id}
                      name={quality.name}
                      allowed={allowed}
                      items={items}
                      sortIndex={index}
                      groupIndex={sortIndex}
                      isDragging={isDragging}
                      isDraggingUp={isDraggingUp}
                      isDraggingDown={isDraggingDown}
                      isInGroup={true}
                      onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
                      onQualityProfileItemDragMove={onQualityProfileItemDragMove}
                      onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
                    />
                  );
                }).reverse()
              }
            </div>
        }
      </div>
    );
  }
}

QualityProfileItemGroup.propTypes = {
  advancedSettings: PropTypes.bool,
  groupId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortIndex: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isDraggingUp: PropTypes.bool.isRequired,
  isDraggingDown: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func,
  onItemGroupAllowedChange: PropTypes.func.isRequired,
  onQualityProfileItemAllowedChange: PropTypes.func.isRequired,
  onItemGroupNameChange: PropTypes.func.isRequired,
  onDeleteGroupPress: PropTypes.func.isRequired,
  onQualityProfileItemDragMove: PropTypes.func.isRequired,
  onQualityProfileItemDragEnd: PropTypes.func.isRequired
};

QualityProfileItemGroup.defaultProps = {
  // The drag preview will not connect the drag handle.
  connectDragSource: (node) => node
};

export default QualityProfileItemGroup;
