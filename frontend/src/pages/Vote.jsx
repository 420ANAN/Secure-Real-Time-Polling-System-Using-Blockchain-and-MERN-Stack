import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { WalletContext } from '../context/WalletContext';

const Vote = () => {
  const { contract, account } = useContext(WalletContext);
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/polls');
        setPolls(res.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };
    fetchPolls();
  }, []);

  const handleVote = async () => {
    if (!selectedPoll || selectedOption === null) {
      alert("Please select a poll and an option.");
      return;
    }
    if (!contract) {
      alert("Please connect your wallet.");
      return;
    }

    setLoading(true);
    try {
      // blockchainId is required for the smart contract
      const pollId = selectedPoll.blockchainId;
      console.log("Voting on poll:", pollId, "Option:", selectedOption);

      const tx = await contract.vote(pollId, selectedOption);
      await tx.wait(); // Wait for transaction to be mined

      // Update backend
      await axios.post(`http://localhost:5000/api/polls/${selectedPoll._id}/vote`, { optionIndex: selectedOption });

      alert("Vote submitted successfully!");
      setSelectedOption(null); // Reset selection
    } catch (error) {
      console.error("Voting error:", error);
      alert("Failed to vote. " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Active Polls</h2>
      <div className="row">
        <div className="col-md-5">
          <div className="list-group">
            {polls.map(poll => (
              <button
                key={poll._id}
                className={`list-group-item list-group-item-action ${selectedPoll?._id === poll._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPoll(poll);
                  setSelectedOption(null);
                }}
              >
                {poll.question}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-7">
          {selectedPoll ? (
            <div className="card">
              <div className="card-header">
                <h5>{selectedPoll.question}</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">Creator: {selectedPoll.creator}</p>
                <h6>Select an option:</h6>
                {selectedPoll.options.map((opt, index) => (
                  <div key={index} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pollOptions"
                      id={`option-${index}`}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                    />
                    <label className="form-check-label" htmlFor={`option-${index}`}>
                      {opt.text}
                    </label>
                  </div>
                ))}

                <button
                  className="btn btn-success mt-3"
                  onClick={handleVote}
                  disabled={loading || selectedOption === null}
                >
                  {loading ? "Processing..." : "Vote Now"}
                </button>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              Select a poll from the list to vote.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vote;
