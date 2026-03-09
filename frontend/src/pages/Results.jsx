import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { WalletContext } from '../context/WalletContext';

const Results = () => {
  const [polls, setPolls] = useState([]);
  const { contract } = useContext(WalletContext);

  const fetchPolls = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/polls');
      setPolls(res.data);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 5000); // Poll every 5 seconds for updates
    return () => clearInterval(interval);
  }, []);

  // Fetch live counts from blockchain if contract is available
  useEffect(() => {
    if (!contract || polls.length === 0) return;

    const updateCounts = async () => {
      const updatedPolls = [...polls];
      let hasUpdates = false;

      for (let i = 0; i < polls.length; i++) {
        if (polls[i].blockchainId !== undefined && polls[i].blockchainId !== null) {
          try {
            // blockchainId must be a number or string that the contract accepts
            const pollId = polls[i].blockchainId;
            const options = await contract.getOptions(pollId);

            // options is array of structs or tuples [text, voteCount]
            // Map specific option counts to local state
            // Note: This matches arrays by index
            const newOptions = polls[i].options.map((opt, idx) => ({
              ...opt,
              votes: Number(options[idx].voteCount)
            }));

            // Check for changes (deep comparison or just assume update if votes differ)
            const currentVotes = polls[i].options.map(o => o.votes).join(',');
            const newVotes = newOptions.map(o => o.votes).join(',');

            if (currentVotes !== newVotes) {
              updatedPolls[i] = { ...polls[i], options: newOptions };
              hasUpdates = true;
            }

          } catch (err) {
            console.error(`Error fetching poll ${polls[i].blockchainId}:`, err);
          }
        }
      }

      if (hasUpdates) {
        setPolls(updatedPolls);
      }
    };

    updateCounts();
    // Optional: set up an interval for live updates, or listen to events
    const interval = setInterval(updateCounts, 10000); // Check blockchain every 10s
    return () => clearInterval(interval);

  }, [contract, polls.length]); // Re-run when contract loads or polls list changes size

  return (
    <div className="container mt-4">
      <h2>Live Results</h2>
      <div className="row">
        {polls.map((poll) => (
          <div className="col-md-6 mb-4" key={poll._id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{poll.question}</h5>
                {poll.options.map((opt, idx) => {
                  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                  const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                  return (
                    <div key={idx} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <span>{opt.text}</span>
                        <span>{opt.votes} votes ({percentage}%)</span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${percentage}%` }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
