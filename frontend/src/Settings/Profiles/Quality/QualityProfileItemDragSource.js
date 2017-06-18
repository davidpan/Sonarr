import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import classNames from 'classnames';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import QualityProfileItem from './QualityProfileItem';
import QualityProfileItemGroup from './QualityProfileItemGroup';
import styles from './QualityProfileItemDragSource.css';

const qualityProfileItemDragSource = {
  beginDrag({ groupId, qualityId, sortIndex, groupIndex, name, allowed }) {
    return {
      groupId,
      qualityId,
      sortIndex,
      groupIndex,
      name,
      allowed
    };
  },

  endDrag(props, monitor, component) {
    props.onQualityProfileItemDragEnd(monitor.getItem(), monitor.didDrop());
  }
};

const qualityProfileItemDropTarget = {
  hover(props, monitor, component) {
    const {
      groupId: dragGroupId,
      qualityId: dragQualityId,
      sortIndex: dragIndex,
      groupIndex: dragGroupIndex
    } = monitor.getItem();

    const hoverIndex = props.sortIndex;
    const hoverGroupIndex = props.groupIndex;
    const hoverGroupId = props.isInGroup ? props.groupId : null;

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // If we're hovering over a child don't trigger on the parent
    if (!monitor.isOver({ shallow: true })) {
      return;
    }

    // Moving up, only trigger if drag position is above 50%
    if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Moving down, only trigger if drag position is below 50%
    if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    props.onQualityProfileItemDragMove({
      dragIndex,
      dragGroupId,
      dragQualityId,
      dragGroupIndex,
      dropIndex: hoverIndex,
      dropGroupIndex: hoverGroupIndex,
      dropGroupId: hoverGroupId
    });
  }
};

function collectDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

function collectDropTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true })
  };
}

class QualityProfileItemDragSource extends Component {

  //
  // Render

  render() {
    const {
      groupId,
      qualityId,
      name,
      allowed,
      items,
      sortIndex,
      isDragging,
      isDraggingUp,
      isDraggingDown,
      isOverCurrent,
      connectDragSource,
      connectDropTarget,
      onCreateGroupPress,
      onDeleteGroupPress,
      onQualityProfileItemAllowedChange,
      onItemGroupAllowedChange,
      onItemGroupNameChange,
      onQualityProfileItemDragMove,
      onQualityProfileItemDragEnd
    } = this.props;

    const isBefore = !isDragging && isDraggingUp && isOverCurrent;
    const isAfter = !isDragging && isDraggingDown && isOverCurrent;

    return connectDropTarget(
      <div
        className={classNames(
          styles.qualityProfileItemDragSource,
          isBefore && styles.isDraggingUp,
          isAfter && styles.isDraggingDown
        )}
      >
        {
          isBefore &&
            <div
              className={classNames(
                styles.qualityProfileItemPlaceholder,
                styles.qualityProfileItemPlaceholderBefore
              )}
            />
        }

        {
          !!groupId && qualityId == null &&
            <QualityProfileItemGroup
              groupId={groupId}
              name={name}
              allowed={allowed}
              items={items}
              sortIndex={sortIndex}
              isDragging={isDragging}
              isDraggingUp={isDraggingUp}
              isDraggingDown={isDraggingDown}
              connectDragSource={connectDragSource}
              onDeleteGroupPress={onDeleteGroupPress}
              onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
              onItemGroupAllowedChange={onItemGroupAllowedChange}
              onItemGroupNameChange={onItemGroupNameChange}
              onQualityProfileItemDragMove={onQualityProfileItemDragMove}
              onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
            />
        }

        {
          qualityId != null &&
            <QualityProfileItem
              groupId={groupId}
              qualityId={qualityId}
              name={name}
              allowed={allowed}
              sortIndex={sortIndex}
              isDragging={isDragging}
              connectDragSource={connectDragSource}
              onCreateGroupPress={onCreateGroupPress}
              onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
            />
        }

        {
          isAfter &&
            <div
              className={classNames(
                styles.qualityProfileItemPlaceholder,
                styles.qualityProfileItemPlaceholderAfter
              )}
            />
        }
      </div>
    );
  }
}

QualityProfileItemDragSource.propTypes = {
  groupId: PropTypes.number,
  qualityId: PropTypes.number,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  sortIndex: PropTypes.number.isRequired,
  isDragging: PropTypes.bool,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  isOverCurrent: PropTypes.bool,
  isInGroup: PropTypes.bool,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  onCreateGroupPress: PropTypes.func,
  onDeleteGroupPress: PropTypes.func,
  onQualityProfileItemAllowedChange: PropTypes.func.isRequired,
  onItemGroupAllowedChange: PropTypes.func,
  onItemGroupNameChange: PropTypes.func,
  onQualityProfileItemDragMove: PropTypes.func.isRequired,
  onQualityProfileItemDragEnd: PropTypes.func.isRequired
};

export default DropTarget(
  QUALITY_PROFILE_ITEM,
  qualityProfileItemDropTarget,
  collectDropTarget
)(DragSource(
  QUALITY_PROFILE_ITEM,
  qualityProfileItemDragSource,
  collectDragSource
)(QualityProfileItemDragSource));
