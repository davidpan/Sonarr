import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { kinds } from 'Helpers/Props';
import Card from 'Components/Card';
import Label from 'Components/Label';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import EditQualityProfileModalConnector from './EditQualityProfileModalConnector';
import styles from './QualityProfile.css';

class QualityProfile extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditQualityProfileModalOpen: false,
      isDeleteQualityProfileModalOpen: false
    };
  }

  //
  // Listeners

  onEditQualityProfilePress = () => {
    this.setState({ isEditQualityProfileModalOpen: true });
  }

  onEditQualityProfileModalClose = () => {
    this.setState({ isEditQualityProfileModalOpen: false });
  }

  onDeleteQualityProfilePress = () => {
    this.setState({
      isEditQualityProfileModalOpen: false,
      isDeleteQualityProfileModalOpen: true
    });
  }

  onDeleteQualityProfileModalClose = () => {
    this.setState({ isDeleteQualityProfileModalOpen: false });
  }

  onConfirmDeleteQualityProfile = () => {
    this.props.onConfirmDeleteQualityProfile(this.props.id);
  }

  //
  // Render

  render() {
    const {
      advancedSettings,
      id,
      name,
      cutoff,
      items,
      isDeleting
    } = this.props;

    return (
      <Card
        className={styles.qualityProfile}
        onPress={this.onEditQualityProfilePress}
      >
        <div className={styles.name}>
          {name}
        </div>

        <div className={styles.qualities}>
          {
            items.map((item) => {
              if (!item.allowed) {
                return null;
              }

              if (item.quality) {
                const isCutoff = item.quality.id === cutoff;

                return (
                  <Label
                    key={item.quality.id}
                    kind={isCutoff ? kinds.INFO : kinds.default}
                    title={isCutoff ? 'Cutoff' : null}
                  >
                    {item.quality.name}
                  </Label>
                );
              }

              const isCutoff = item.id === cutoff;

              if (advancedSettings) {
                return item.items.map((groupItem) => {
                  return (
                    <Label
                      key={groupItem.quality.id}
                      kind={isCutoff ? kinds.INFO : kinds.default}
                      title={isCutoff ? 'Cutoff' : null}
                    >
                      {groupItem.quality.name}
                    </Label>
                  );
                });
              }

              return (
                <Label
                  key={item.id}
                  kind={isCutoff ? kinds.INFO : kinds.default}
                  title={isCutoff ? 'Cutoff' : null}
                >
                  {item.name}
                </Label>
              );
            })
          }
        </div>

        <EditQualityProfileModalConnector
          id={id}
          isOpen={this.state.isEditQualityProfileModalOpen}
          onModalClose={this.onEditQualityProfileModalClose}
          onDeleteQualityProfilePress={this.onDeleteQualityProfilePress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteQualityProfileModalOpen}
          kind={kinds.DANGER}
          title="Delete Quality Profile"
          message={`Are you sure you want to delete the quality profile '${name}'?`}
          confirmLabel="Delete"
          isSpinning={isDeleting}
          onConfirm={this.onConfirmDeleteQualityProfile}
          onCancel={this.onDeleteQualityProfileModalClose}
        />
      </Card>
    );
  }
}

QualityProfile.propTypes = {
  advancedSettings: PropTypes.bool.isRequired,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  cutoff: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDeleting: PropTypes.bool.isRequired,
  onConfirmDeleteQualityProfile: PropTypes.func.isRequired
};

export default QualityProfile;
