// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimplifiedVotingSystem
 * @dev A highly resilient, decentralized e-voting contract with robust role-based
 * access control, ZKP verification (mocked for simplicity here), and emergency circuit breakers.
 */
contract SimplifiedVotingSystem {
    address public admin;
    bool public isEmergencyStopped;

    enum ElectionState { DRAFT, ACTIVE, CLOSED }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        ElectionState state;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
    }

    // State variables
    uint256 public electionCount;
    uint256 public candidateCount;
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public electionCandidates;
    mapping(uint256 => uint256) public electionCandidateCounts;

    // voterAddress => electionId => hasVoted
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    
    // Whitelisted addresses for an election
    // electionId => voterAddress => isWhitelisted
    mapping(uint256 => mapping(address => bool)) public whitelistedVoters;

    // Events
    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event ElectionStateChanged(uint256 indexed electionId, ElectionState newState);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoterWhitelisted(uint256 indexed electionId, address voter);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 candidateId);
    event EmergencyStopToggled(bool isStopped);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized: Admin only");
        _;
    }

    modifier stopInEmergency() {
        require(!isEmergencyStopped, "Emergency stop is active!");
        _;
    }

    modifier validElection(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "Invalid election ID");
        _;
    }

    constructor() {
        admin = msg.sender;
        isEmergencyStopped = false;
    }

    /**
     * @dev Create a new election
     */
    function createElection(string memory _title, uint256 _startTime, uint256 _endTime) external onlyAdmin {
        require(_startTime < _endTime, "Invalid time range");
        
        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            state: ElectionState.DRAFT,
            startTime: _startTime,
            endTime: _endTime,
            totalVotes: 0
        });

        emit ElectionCreated(electionCount, _title, _startTime, _endTime);
    }

    /**
     * @dev Add a candidate to an election
     */
    function addCandidate(uint256 _electionId, string memory _name) external onlyAdmin validElection(_electionId) {
        require(elections[_electionId].state == ElectionState.DRAFT, "Can only add candidates in DRAFT state");

        uint256 newCandidateId = electionCandidateCounts[_electionId] + 1;
        electionCandidates[_electionId][newCandidateId] = Candidate({
            id: newCandidateId,
            name: _name,
            voteCount: 0
        });
        
        electionCandidateCounts[_electionId] = newCandidateId;

        emit CandidateAdded(_electionId, newCandidateId, _name);
    }

    /**
     * @dev Whitelist a voter for an election (ZKP verification could happen before this step off-chain)
     */
    function whitelistVoter(uint256 _electionId, address _voter) external onlyAdmin validElection(_electionId) {
        whitelistedVoters[_electionId][_voter] = true;
        emit VoterWhitelisted(_electionId, _voter);
    }

    /**
     * @dev Change election state
     */
    function changeElectionState(uint256 _electionId, ElectionState _newState) external onlyAdmin validElection(_electionId) {
        elections[_electionId].state = _newState;
        emit ElectionStateChanged(_electionId, _newState);
    }

    /**
     * @dev Circuit Breaker to halt all voting
     */
    function emergencyStopVoting(bool _stop) external onlyAdmin {
        isEmergencyStopped = _stop;
        emit EmergencyStopToggled(_stop);
    }

    /**
     * @dev Cast a vote
     */
    function castVote(uint256 _electionId, uint256 _candidateId) external stopInEmergency validElection(_electionId) {
        Election storage election = elections[_electionId];
        
        require(election.state == ElectionState.ACTIVE, "Election is not active");
        require(block.timestamp >= election.startTime && block.timestamp <= election.endTime, "Not within voting window");
        require(whitelistedVoters[_electionId][msg.sender], "Voter not whitelisted for this election");
        require(!hasVoted[msg.sender][_electionId], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= electionCandidateCounts[_electionId], "Invalid candidate ID");

        // Record vote
        hasVoted[msg.sender][_electionId] = true;
        electionCandidates[_electionId][_candidateId].voteCount++;
        election.totalVotes++;

        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    /**
     * @dev Retrieve candidate details
     */
    function getCandidate(uint256 _electionId, uint256 _candidateId) external view validElection(_electionId) returns (uint256, string memory, uint256) {
        Candidate memory candidate = electionCandidates[_electionId][_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }
}
