import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import SeriesTitleLink from 'Series/SeriesTitleLink';
import SeriesStatusCell from 'Series/Index/Table/SeriesStatusCell';
import styles from './SeriesEditorRow.css';

class SeriesEditorRow extends Component {

  //
  // Listeners

  onSeasonFolderChange = () => {
    // Mock handler to satisfy `onChange` being required for `CheckInput`.
    //
  }

  //
  // Render

  render() {
    const {
      id,
      status,
      titleSlug,
      title,
      monitored,
      languageProfile,
      qualityProfile,
      seasonFolder,
      path,
      columns,
      isSelected,
      onSelectedChange
    } = this.props;

    return (
      <TableRow>
        <TableSelectCell
          id={id}
          isSelected={isSelected}
          onSelectedChange={onSelectedChange}
        />

        <SeriesStatusCell
          monitored={monitored}
          status={status}
        />

        <TableRowCell className={styles.title}>
          <SeriesTitleLink
            titleSlug={titleSlug}
            title={title}
          />
        </TableRowCell>

        <TableRowCell>
          {qualityProfile.name}
        </TableRowCell>

        {
          _.find(columns, { name: 'languageProfileId' }).isVisible &&
            <TableRowCell>
              {languageProfile.name}
            </TableRowCell>
        }

        <TableRowCell className={styles.seasonFolder}>
          <CheckInput
            name="seasonFolder"
            value={seasonFolder}
            isDisabled={true}
            onChange={this.onSeasonFolderChange}
          />
        </TableRowCell>

        <TableRowCell>
          {path}
        </TableRowCell>
      </TableRow>
    );
  }
}

SeriesEditorRow.propTypes = {
  id: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  titleSlug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  monitored: PropTypes.bool.isRequired,
  languageProfile: PropTypes.object.isRequired,
  qualityProfile: PropTypes.object.isRequired,
  seasonFolder: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSelected: PropTypes.bool,
  onSelectedChange: PropTypes.func.isRequired
};

export default SeriesEditorRow;
