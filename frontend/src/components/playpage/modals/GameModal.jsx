import React from 'react';
import { Modal } from 'react-bootstrap';
import DinoGame from '../../../games/dino/DinoGame';

const GameModal = ({ show, onHide, selectedCompetition, onGameEnd }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="lg-down"
      className="cyber-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedCompetition?.title} - Game Arena
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {selectedCompetition && (
          <DinoGame onGameEnd={onGameEnd} />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default GameModal;