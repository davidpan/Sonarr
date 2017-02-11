import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { kinds } from 'Helpers/Props';
import SelectInput from 'Components/Form/SelectInput';
import LanguageProfileSelectInputConnector from 'Components/Form/LanguageProfileSelectInputConnector';
import QualityProfileSelectInputConnector from 'Components/Form/QualityProfileSelectInputConnector';
import RootFolderSelectInputConnector from 'Components/Form/RootFolderSelectInputConnector';
import SpinnerButton from 'Components/Link/SpinnerButton';
import PageContentFooter from 'Components/Page/PageContentFooter';
import DeleteSeriesModal from './Delete/DeleteSeriesModal';
import styles from './SeriesEditorFooter.css';

const NO_CHANGE = 'noChange';

class SeriesEditorFooter extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      monitored: NO_CHANGE,
      qualityProfileId: NO_CHANGE,
      languageProfileId: NO_CHANGE,
      rootFolderPath: NO_CHANGE,
      seasonFolder: NO_CHANGE,
      isDeleteSeriesModalOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isSaving && this.props.isSaving && !nextProps.saveError) {
      this.setState({
        monitored: NO_CHANGE,
        qualityProfileId: NO_CHANGE,
        languageProfileId: NO_CHANGE,
        rootFolderPath: NO_CHANGE,
        seasonFolder: NO_CHANGE
      });
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.setState({ [name]: value });
  }

  onSaveSelectedPress = () => {
    const {
      monitored,
      qualityProfileId,
      languageProfileId,
      rootFolderPath,
      seasonFolder
    } = this.state;

    const changes = {};

    if (monitored !== NO_CHANGE) {
      changes.monitored = monitored === 'monitored';
    }

    if (qualityProfileId !== NO_CHANGE) {
      changes.qualityProfileId = qualityProfileId;
    }

    if (languageProfileId !== NO_CHANGE) {
      changes.languageProfileId = languageProfileId;
    }

    if (rootFolderPath !== NO_CHANGE) {
      changes.rootFolderPath = rootFolderPath;
    }

    if (seasonFolder !== NO_CHANGE) {
      changes.seasonFolder = seasonFolder === 'yes';
    }

    this.props.onSaveSelectedPress(changes);
  }

  onDeleteSelectedPress = () => {
    this.setState({ isDeleteSeriesModalOpen: true });
  }

  onDeleteSeriesModalClose = () => {
    this.setState({ isDeleteSeriesModalOpen: false });
  }

  //
  // Render

  render() {
    const {
      seriesIds,
      selectedCount,
      isSaving,
      isDeleting,
      isOrganizingSeries,
      showLanguageProfile,
      onOrganizeSeriesPress
    } = this.props;

    const {
      monitored,
      qualityProfileId,
      languageProfileId,
      seasonFolder,
      rootFolderPath,
      monitor,
      isDeleteSeriesModalOpen
    } = this.state;

    const monitoredOptions = [
      { key: NO_CHANGE, value: 'No Change' },
      { key: 'monitored', value: 'Monitored' },
      { key: 'unmonitored', value: 'Unmonitored' }
    ];

    const seasonFolderOptions = [
      { key: NO_CHANGE, value: 'No Change' },
      { key: 'yes', value: 'Yes' },
      { key: 'no', value: 'No' }
    ];

    const noChanges = monitored === NO_CHANGE && monitor === NO_CHANGE;

    return (
      <PageContentFooter>
        <div className={styles.inputContainer}>
          <div className={styles.label}>
            Monitor Series
          </div>

          <SelectInput
            name="monitored"
            value={monitored}
            values={monitoredOptions}
            isDisabled={!selectedCount}
            onChange={this.onInputChange}
          />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.label}>
            Quality Profile
          </div>

          <QualityProfileSelectInputConnector
            name="qualityProfileId"
            value={qualityProfileId}
            includeNoChange={true}
            isDisabled={!selectedCount}
            onChange={this.onInputChange}
          />
        </div>

        {
          showLanguageProfile &&
            <div className={styles.inputContainer}>
              <div className={styles.label}>
                Language Profile
              </div>

              <LanguageProfileSelectInputConnector
                name="languageProfileId"
                value={languageProfileId}
                includeNoChange={true}
                isDisabled={!selectedCount}
                onChange={this.onInputChange}
              />
            </div>
        }

        <div className={styles.inputContainer}>
          <div className={styles.label}>
            Season Folder
          </div>

          <SelectInput
            name="seasonFolder"
            value={seasonFolder}
            values={seasonFolderOptions}
            isDisabled={!selectedCount}
            onChange={this.onInputChange}
          />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.label}>
            Root Folder
          </div>

          <RootFolderSelectInputConnector
            name="rootFolderPath"
            value={rootFolderPath}
            includeNoChange={true}
            isDisabled={!selectedCount}
            onChange={this.onInputChange}
          />
        </div>

        <div className={styles.buttonContainer}>
          <div className={styles.label}>
            {selectedCount} Series Selected
          </div>

          <div className={styles.buttons}>
            <SpinnerButton
              className={styles.saveSelectedButton}
              kind={kinds.PRIMARY}
              isSpinning={isSaving}
              isDisabled={!selectedCount || noChanges}
              onPress={this.onSaveSelectedPress}
            >
              Save
            </SpinnerButton>

            <SpinnerButton
              className={styles.organizeSelectedButton}
              isSpinning={isOrganizingSeries}
              isDisabled={!selectedCount || isOrganizingSeries}
              onPress={onOrganizeSeriesPress}
            >
              Organize
            </SpinnerButton>

            <SpinnerButton
              className={styles.deleteSelectedButton}
              kind={kinds.DANGER}
              isSpinning={isDeleting}
              isDisabled={!selectedCount || isDeleting}
              onPress={this.onDeleteSelectedPress}
            >
              Delete
            </SpinnerButton>
          </div>
        </div>

        <DeleteSeriesModal
          isOpen={isDeleteSeriesModalOpen}
          seriesIds={seriesIds}
          onModalClose={this.onDeleteSeriesModalClose}
        />
      </PageContentFooter>
    );
  }
}

SeriesEditorFooter.propTypes = {
  seriesIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedCount: PropTypes.number.isRequired,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  isDeleting: PropTypes.bool.isRequired,
  deleteError: PropTypes.object,
  isOrganizingSeries: PropTypes.bool.isRequired,
  showLanguageProfile: PropTypes.bool.isRequired,
  onSaveSelectedPress: PropTypes.func.isRequired,
  onOrganizeSeriesPress: PropTypes.func.isRequired
};

export default SeriesEditorFooter;
