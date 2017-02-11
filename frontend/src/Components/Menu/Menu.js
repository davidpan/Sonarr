import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styles from './Menu.css';

class Menu extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isMenuOpen: false,
      maxHeight: 0
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
    this.setMaxHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  //
  // Control

  setMaxHeight() {
    if (!this.props.enforceMaxHeight) {
      return;
    }

    const menu = ReactDOM.findDOMNode(this.refs.menu);
    const { bottom } = menu.getBoundingClientRect();
    const maxHeight = window.innerHeight - bottom;

    this.setState({
      maxHeight
    });
  }

  _addListener() {
    window.addEventListener('click', this.onWindowClick);
  }

  _removeListener() {
    window.removeEventListener('click', this.onWindowClick);
  }

  //
  // Listeners

  onWindowClick = (event) => {
    const menu = ReactDOM.findDOMNode(this.refs.menu);
    const menuContent = ReactDOM.findDOMNode(this.refs.menuContent);

    if (!menu) {
      return;
    }

    if ((!menu.contains(event.target) || menuContent.contains(event.target)) && this.state.isMenuOpen) {
      this.setState({ isMenuOpen: false });
      this._removeListener();
    }
  }

  onWindowResize = () => {
    this.setMaxHeight();
  }

  onMenuButtonPress = () => {
    if (this.state.isMenuOpen) {
      this._removeListener();
    } else {
      this._addListener();
    }

    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  //
  // Render

  render() {
    const {
      className,
      children
    } = this.props;

    const childrenArray = React.Children.toArray(children);
    const button = React.cloneElement(
      childrenArray[0],
      {
        onPress: this.onMenuButtonPress
      }
    );

    const content = React.cloneElement(
      childrenArray[1],
      {
        ref: 'menuContent',
        maxHeight: this.state.maxHeight,
        isOpen: this.state.isMenuOpen
      }
    );

    return (
      <div
        ref="menu"
        className={className}
      >
        {button}
        {content}
      </div>
    );
  }
}

Menu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  enforceMaxHeight: PropTypes.bool.isRequired
};

Menu.defaultProps = {
  className: styles.menu,
  enforceMaxHeight: true
};

export default Menu;
