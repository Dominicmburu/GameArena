// COMPLETE FILE - Replace your entire CompetitionsTabs.js:

import React from 'react';
import { Tabs, Tab, Card, Button } from 'react-bootstrap';
import { GamepadIcon, Medal, UserPlus } from 'lucide-react';
import CompetitionCard from './CompetitionCard';

const CompetitionsTabs = ({
  activeTab,
  setActiveTab,
  activeCompetitions,
  completedCompetitions,
  onPlay,
  onInvite,
  onCopyCode,
  onLeave,        // ADD THIS PROP
  copiedCode,
  onJoinClick
}) => {
  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(tab) => setActiveTab(tab)}
      className="cyber-tabs mb-4"
    >
      <Tab eventKey="active" title={`Active (${activeCompetitions.length})`}>
        <div className="competitions-list">
          {activeCompetitions.length === 0 ? (
            <Card className="cyber-card text-center py-5">
              <Card.Body>
                <GamepadIcon size={48} className="text-grey mb-3" />
                <h5 className="text-white mb-2">No Active Competitions</h5>
                <p className="text-grey mb-3">Join or create a competition to start playing!</p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button className="btn-cyber" onClick={onJoinClick}>
                    <UserPlus size={20} className="me-2" />
                    Join Competition
                  </Button>
                  <Button variant="outline-light" href="/create">
                    Create Competition
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            activeCompetitions.map(comp => (
              <CompetitionCard
                key={comp.id}
                competition={comp}
                onPlay={onPlay}
                onInvite={onInvite}
                onCopyCode={onCopyCode}
                onLeave={onLeave}      // PASS THE PROP HERE
                copiedCode={copiedCode}
                isActive={true}
              />
            ))
          )}
        </div>
      </Tab>

      <Tab eventKey="completed" title={`Completed (${completedCompetitions.length})`}>
        <div className="competitions-list">
          {completedCompetitions.length === 0 ? (
            <Card className="cyber-card text-center py-5">
              <Card.Body>
                <Medal size={48} className="text-grey mb-3" />
                <h5 className="text-white mb-2">No Completed Competitions</h5>
                <p className="text-grey">Complete some competitions to see your history here!</p>
              </Card.Body>
            </Card>
          ) : (
            completedCompetitions.map(comp => (
              <CompetitionCard
                key={comp.id}
                competition={comp}
                onPlay={onPlay}
                onInvite={onInvite}
                onCopyCode={onCopyCode}
                copiedCode={copiedCode}
                isActive={false}
              />
            ))
          )}
        </div>
      </Tab>
    </Tabs>
  );
};

export default CompetitionsTabs;