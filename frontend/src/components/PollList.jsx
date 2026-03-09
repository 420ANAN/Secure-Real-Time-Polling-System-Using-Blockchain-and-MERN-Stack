import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { WalletContext } from '../context/WalletContext';

const PollList = () => {
    const [polls, setPolls] = useState([]);
    const { contract } = useContext(WalletContext);

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

    const handleVote = async (pollId, optionIndex) => {
        if (!contract) return alert("Connect Wallet first!");
        try {
            const tx = await contract.vote(pollId, optionIndex);
            await tx.wait();
            alert("Voted successfully!");
            // Refresh polls or update locally
        } catch (err) {
            console.error(err);
            alert("Voting failed!");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Active Polls</h2>
            <div className="row">
                {polls.map((poll) => (
                    <div className="col-md-4 mb-3" key={poll._id}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{poll.question}</h5>
                                <p className="card-text"><small className="text-muted">ID: {poll.blockchainId}</small></p>
                                <ul className="list-group list-group-flush">
                                    {poll.options.map((opt, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                            {opt.text}
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleVote(poll.blockchainId, idx)}
                                            >
                                                Vote
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PollList;
