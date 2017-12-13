import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import KeyCode from 'rc-util/lib/KeyCode';
import { getOffsetLeft } from './util';
import Star from './Star';

function noop() {
}

export default class Rate extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    count: PropTypes.number,
    allowHalf: PropTypes.bool,
    allowClear: PropTypes.bool,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    onChange: PropTypes.func,
    onHoverChange: PropTypes.func,
    className: PropTypes.string,
    character: PropTypes.node,
    tabIndex: PropTypes.number,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyDown: PropTypes.func,
    autoFocus: PropTypes.bool,
  };

  static defaultProps = {
    defaultValue: 0,
    count: 5,
    allowHalf: false,
    allowClear: true,
    style: {},
    prefixCls: 'rc-rate',
    onChange: noop,
    character: '★',
    onHoverChange: noop,
    tabIndex: 0,
  };

  constructor(props) {
    super(props);
    let value = props.value;
    if (value === undefined) {
      value = props.defaultValue;
    }

    this.stars = {};

    this.state = {
      value,
      focused: false,
      CleanedValue: null,
    };
  }

  componentDidMount() {
    if (this.props.autoFocus && !this.props.disabled) {
      this.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      let value = nextProps.value;
      if (value === undefined) {
        value = nextProps.defaultValue;
      }
      this.setState({
        value,
      });
    }
  }

  onHover = (event, index) => {
    const hoverValue = this.getStarValue(index, event.pageX);
    const { CleanedValue } = this.state;
    if (hoverValue !== CleanedValue) {
      this.setState({
        hoverValue,
        CleanedValue: null,
      });
    }
    this.props.onHoverChange(hoverValue);
  }

  onMouseLeave = () => {
    this.setState({
      hoverValue: undefined,
      CleanedValue: null,
    });
    this.props.onHoverChange(undefined);
  }

  onClick = (event, index) => {
    const value = this.getStarValue(index, event.pageX);
    let isReset = false;
    if (this.props.allowClear) {
      isReset = value === this.state.value;
    }
    this.onMouseLeave(true);
    this.changeValue(isReset ? 0 : value);
    this.setState({
      CleanedValue: isReset ? value : null,
    });
  }

  onFocus = () => {
    const { onFocus } = this.props;
    this.setState({
      focused: true,
    });
    if (onFocus) {
      onFocus();
    }
  }

  onBlur = () => {
    const { onBlur } = this.props;
    this.setState({
      focused: false,
    });
    if (onBlur) {
      onBlur();
    }
  }

  onKeyDown = (event) => {
    const { keyCode } = event;
    const { count, allowHalf, onKeyDown } = this.props;
    let { value } = this.state;
    if (keyCode === KeyCode.RIGHT && value < count) {
      if (allowHalf) {
        value += 0.5;
      } else {
        value += 1;
      }
      this.changeValue(value);
      event.preventDefault();
    } else if (keyCode === KeyCode.LEFT && value > 0) {
      if (allowHalf) {
        value -= 0.5;
      } else {
        value -= 1;
      }
      this.changeValue(value);
      event.preventDefault();
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  }

  getStarDOM(index) {
    return ReactDOM.findDOMNode(this.stars[index]);
  }

  getStarValue(index, x) {
    let value = index + 1;
    if (this.props.allowHalf) {
      const starEle = this.getStarDOM(index);
      const leftDis = getOffsetLeft(starEle);
      const width = starEle.clientWidth;
      if ((x - leftDis) < width / 2) {
        value -= 0.5;
      }
    }
    return value;
  }

  focus() {
    if (!this.props.disabled) {
      this.rate.focus();
    }
  }

  blur() {
    if (!this.props.disabled) {
      this.rate.focus();
    }
  }

  changeValue(value) {
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }
    this.props.onChange(value);
  }

  saveRef = (index) => (node) => {
    this.stars[index] = node;
  }

  saveRate = (node) => {
    this.rate = node;
  }

  render() {
    const {
      count,
      allowHalf,
      style,
      prefixCls,
      disabled,
      className,
      character,
      tabIndex,
    } = this.props;
    const { value, hoverValue, focused } = this.state;
    const stars = [];
    const disabledClass = disabled ? `${prefixCls}-disabled` : '';
    for (let index = 0; index < count; index++) {
      stars.push(
        <Star
          ref={this.saveRef(index)}
          index={index}
          disabled={disabled}
          prefixCls={`${prefixCls}-star`}
          allowHalf={allowHalf}
          value={hoverValue === undefined ? value : hoverValue}
          onClick={this.onClick}
          onHover={this.onHover}
          key={index}
          character={character}
          focused={focused}
        />
      );
    }
    return (
      <ul
        className={classNames(prefixCls, disabledClass, className)}
        style={style}
        onMouseLeave={disabled ? null : this.onMouseLeave}
        tabIndex={disabled ? -1 : tabIndex}
        onFocus={disabled ? null : this.onFocus}
        onBlur={disabled ? null : this.onBlur}
        onKeyDown={disabled ? null : this.onKeyDown}
        ref={this.saveRate}
      >
        {stars}
      </ul>
    );
  }
}
