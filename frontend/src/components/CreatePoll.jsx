import React, { useState, useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { getContract } from '../utils/contract'; // Helper to get contract instance

const CreatePoll = () => {
    const { contract, account } = useContext(WalletContext);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contract) {
            alert("Please connect your wallet!");
            return;
        }

        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            alert("Please provide at least two valid options.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Poll on Blockchain
            const tx = await contract.createPoll(question, validOptions);
            const receipt = await tx.wait();

            // 2. Extract Poll ID from events
            // Event signature: event PollCreated(uint256 indexed pollId, string question, address creator);
            // This depends on how we parse logs. ethers.js v6 makes it easier if ABI is correct.
            let blockchainId = null;

            // Basic parsing logic (adjust based on actual event structure)
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog.name === 'PollCreated') {
                        blockchainId = parsedLog.args[0].toString();
                        break;
                    }
                } catch (err) {
                    console.error("Log parse error", err);
                }
            }

            if (blockchainId === null) {
                throw new Error("Failed to retrieve Poll ID from transaction events.");
            }

            // 3. Save to Backend
            await axios.post('http://localhost:5000/api/polls', {
                question,
                options: validOptions,
                creator: account,
                blockchainId
            });

            alert('Poll created successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error creating poll:", error);
            alert("Failed to create poll. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Create a New Poll</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Question</label>
                    <input
                        type="text"
                        className="form-control"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Options</label>
                    {options.map((opt, index) => (
                        <div key={index} className="input-group mb-2">
                            <input
                                type="text"
                                className="form-control"
                                value={opt}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                            {options.length > 2 && (
                                <button type="button" className="btn btn-outline-danger" onClick={() => removeOption(index)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>
                        + Add Option
                    </button>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Poll'}
                </button>
            </form>
        </div>
    );
};

export default CreatePoll;
