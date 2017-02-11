import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { scrollDirections } from 'Helpers/Props';
import styles from './Scroller.css';

class Scroller extends Component {

  //
  // Render

  render() {
    const {
      className,
      scrollDirection,
      autoScroll,
      children,
      scrollTop,
      onScroll,
      ...otherProps
    } = this.props;

    return (
      <div
        className={classNames(
          className,
          styles.scroller,
          styles[scrollDirection],
          autoScroll && styles.autoScroll
        )}
        {...otherProps}
      >
        {children}
      </div>
    );
  }

}

Scroller.propTypes = {
  className: PropTypes.string,
  scrollDirection: PropTypes.oneOf([scrollDirections.NONE, scrollDirections.HORIZONTAL, scrollDirections.VERTICAL]).isRequired,
  autoScroll: PropTypes.bool.isRequired,
  scrollTop: PropTypes.number,
  children: PropTypes.node,
  onScroll: PropTypes.func
};

Scroller.defaultProps = {
  scrollDirection: scrollDirections.VERTICAL,
  autoScroll: true
};

export default Scroller;
