// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PollingSystem {
    struct Option {
        string text;
        uint256 voteCount;
    }

    struct Poll {
        uint256 id;
        string question;
        address creator;
        bool isActive;
        Option[] options;
    }

    uint256 public nextPollId;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event PollCreated(uint256 indexed pollId, string question, address creator);
    event Voted(uint256 indexed pollId, address indexed voter, uint256 optionIndex);

    function createPoll(string memory _question, string[] memory _options) external {
        require(_options.length > 1, "At least two options required");

        Poll storage newPoll = polls[nextPollId];
        newPoll.id = nextPollId;
        newPoll.question = _question;
        newPoll.creator = msg.sender;
        newPoll.isActive = true;

        for (uint256 i = 0; i < _options.length; i++) {
            newPoll.options.push(Option({
                text: _options[i],
                voteCount: 0
            }));
        }

        emit PollCreated(nextPollId, _question, msg.sender);
        nextPollId++;
    }

    function vote(uint256 _pollId, uint256 _optionIndex) external {
        require(_pollId < nextPollId, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        require(poll.isActive, "Poll is not active");
        require(!hasVoted[_pollId][msg.sender], "Already voted");
        require(_optionIndex < poll.options.length, "Invalid option");

        poll.options[_optionIndex].voteCount++;
        hasVoted[_pollId][msg.sender] = true;

        emit Voted(_pollId, msg.sender, _optionIndex);
    }

    function getOptions(uint256 _pollId) external view returns (Option[] memory) {
        require(_pollId < nextPollId, "Poll does not exist");
        return polls[_pollId].options;
    }

    function getPoll(uint256 _pollId) external view returns (
        uint256 id,
        string memory question,
        address creator,
        bool isActive,
        uint256 optionCount
    ) {
        require(_pollId < nextPollId, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        return (
            poll.id,
            poll.question,
            poll.creator,
            poll.isActive,
            poll.options.length
        );
    }
}
