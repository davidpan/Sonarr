import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Measure from 'react-measure';
import { Grid, WindowScroller } from 'react-virtualized';
import dimensions from 'Styles/Variables/dimensions';
import { sortDirections } from 'Helpers/Props';
import SeriesIndexItemConnector from 'Series/Index/SeriesIndexItemConnector';
import SeriesIndexPoster from './SeriesIndexPoster';

// Poster container dimensions
const columnPadding = 20;
const maxiumColumnWidth = 182;
const progressBarHeight = parseInt(dimensions.progressBarSmallHeight);
const detailedProgressBarHeight = parseInt(dimensions.progressBarMediumHeight);

const additionalColumnCount = {
  small: 3,
  medium: 2,
  large: 1
};

function calculateColumnWidth(width, posterSize) {
  const columns = Math.floor(width / maxiumColumnWidth);
  const remainder = width % maxiumColumnWidth;

  if (remainder === 0 && posterSize === 'large') {
    return maxiumColumnWidth;
  }

  return Math.floor(width / (columns + additionalColumnCount[posterSize]));
}

function calculateRowHeight(posterHeight, sortKey, posterOptions) {
  const {
    detailedProgressBar,
    showTitle
  } = posterOptions;

  const nextAiringHeight = 19;

  const heights = [
    posterHeight,
    detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
    nextAiringHeight,
    columnPadding
  ];

  if (showTitle) {
    heights.push(19);
  }

  switch (sortKey) {
    case 'network':
    case 'qualityProfileId':
    case 'seasons':
    case 'previousAiring':
    case 'added':
    case 'path':
    case 'sizeOnDisk':
      heights.push(19);
      break;
  }

  return heights.reduce((acc, height) => acc + height, 0);
}

function calculatePosterHeight(posterWidth) {
  return Math.ceil((250 / 170) * posterWidth);
}

class SeriesIndexPosters extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      width: 0,
      columnWidth: 182,
      columnCount: 1,
      posterWidth: 162,
      posterHeight: 238,
      rowHeight: calculateRowHeight(238, null, {})
    };

    this._isInitialized = false;
    this._grid = null;
  }

  componentDidMount() {
    this._contentBodyNode = ReactDOM.findDOMNode(this.props.contentBody);
  }

  componentDidUpdate(prevProps) {
    const {
      filterKey,
      filterValue,
      sortKey,
      sortDirection,
      posterOptions
    } = this.props;

    if (
      prevProps.sortKey !== sortKey ||
      prevProps.posterOptions !== posterOptions
    ) {
      this.calculateGrid();
    }

    if (
      prevProps.filterKey !== filterKey ||
      prevProps.filterValue !== filterValue ||
      prevProps.sortKey !== sortKey ||
      prevProps.sortDirection !== sortDirection
    ) {
      this._grid.recomputeGridSize();
    }
  }

  //
  // Control

  scrollToFirstCharacter(character) {
    const items = this.props.items;
    const {
      columnCount,
      rowHeight
    } = this.state;

    const index = _.findIndex(items, (item) => {
      const firstCharacter = item.sortTitle.charAt(0);

      if (character === '#') {
        return !isNaN(firstCharacter);
      }

      return firstCharacter === character;
    });

    if (index != null) {
      const row = Math.floor(index / columnCount);
      const scrollTop = rowHeight * row;

      this.props.onScroll({ scrollTop });
    }
  }

  setGridRef = (ref) => {
    this._grid = ref;
  }

  calculateGrid = (width = this.state.width) => {
    const {
      sortKey,
      posterOptions
    } = this.props;

    const columnWidth = calculateColumnWidth(width, this.props.posterOptions.size);
    const columnCount = Math.max(Math.floor(width / columnWidth), 1);
    const posterWidth = columnWidth - columnPadding;
    const posterHeight = calculatePosterHeight(posterWidth);
    const rowHeight = calculateRowHeight(posterHeight, sortKey, posterOptions);

    this.setState({
      width,
      columnWidth,
      columnCount,
      posterWidth,
      posterHeight,
      rowHeight
    });
  }

  cellRenderer = ({ key, rowIndex, columnIndex, style }) => {
    const {
      items,
      sortKey,
      posterOptions,
      showRelativeDates,
      shortDateFormat,
      timeFormat
    } = this.props;

    const {
      posterWidth,
      posterHeight
    } = this.state;

    const {
      detailedProgressBar,
      showTitle
    } = posterOptions;

    const series = items[rowIndex * this.state.columnCount + columnIndex];

    if (!series) {
      return null;
    }

    return (
      <SeriesIndexItemConnector
        key={key}
        component={SeriesIndexPoster}
        sortKey={sortKey}
        posterWidth={posterWidth}
        posterHeight={posterHeight}
        detailedProgressBar={detailedProgressBar}
        showTitle={showTitle}
        showRelativeDates={showRelativeDates}
        shortDateFormat={shortDateFormat}
        timeFormat={timeFormat}
        style={style}
        {...series}
      />
    );
  }

  //
  // Listeners

  onMeasure = ({ width }) => {
    this.calculateGrid(width);
  }

  onSectionRendered = () => {
    if (!this._isInitialized && this._contentBodyNode) {
      this.props.onRender();
      this._isInitialized = true;
    }
  }

  //
  // Render

  render() {
    const {
      items,
      scrollTop,
      isSmallScreen,
      onScroll
    } = this.props;

    const {
      width,
      columnWidth,
      columnCount,
      rowHeight
    } = this.state;

    const rowCount = Math.ceil(items.length / columnCount);

    return (
      <Measure onMeasure={this.onMeasure}>
        <WindowScroller
          scrollElement={isSmallScreen ? null : this._contentBodyNode}
          onScroll={onScroll}
        >
          {({ height, isScrolling }) => {
            return (
              <Grid
                ref={this.setGridRef}
                autoHeight={true}
                height={height}
                columnCount={columnCount}
                columnWidth={columnWidth}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
                scrollTop={scrollTop}
                overscanRowCount={2}
                cellRenderer={this.cellRenderer}
                onSectionRendered={this.onSectionRendered}
              />
            );
          }
        }
        </WindowScroller>
      </Measure>
    );
  }
}

SeriesIndexPosters.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  filterKey: PropTypes.string,
  filterValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
  sortKey: PropTypes.string,
  sortDirection: PropTypes.oneOf(sortDirections.all),
  posterOptions: PropTypes.object.isRequired,
  scrollTop: PropTypes.number.isRequired,
  contentBody: PropTypes.object.isRequired,
  showRelativeDates: PropTypes.bool.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  timeFormat: PropTypes.string.isRequired,
  onRender: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired
};

export default SeriesIndexPosters;
