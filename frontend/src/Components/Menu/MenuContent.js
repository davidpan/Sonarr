import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { align } from 'Helpers/Props';
import Scroller from 'Components/Scroller/Scroller';
import styles from './MenuContent.css';

class MenuContent extends Component {

  //
  // Render

  render() {
    const {
      className,
      children,
      alignMenu,
      maxHeight,
      isOpen
    } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <div
        className={classNames(
          className,
          styles[alignMenu]
        )}
        style={{
          maxHeight: maxHeight ? `${maxHeight}px` : undefined
        }}
      >
        <Scroller className={styles.scroller}>
          {children}
        </Scroller>
      </div>
    );
  }
}

MenuContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  alignMenu: PropTypes.oneOf([align.LEFT, align.RIGHT]),
  maxHeight: PropTypes.number,
  isOpen: PropTypes.bool
};

MenuContent.defaultProps = {
  className: styles.menuContent,
  alignMenu: align.LEFT
};

export default MenuContent;
