import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../contracts/config';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initWallet = async () => {
            if (window.ethereum) {
                try {
                    const browserProvider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(browserProvider);

                    const accounts = await browserProvider.listAccounts();
                    if (accounts.length > 0) {
                        const signer = await browserProvider.getSigner();
                        setAccount(accounts[0].address);
                        setSigner(signer);
                        // Initialize contract with config
                        const newContract = new ethers.Contract(contractAddress, contractABI, signer);
                        setContract(newContract);
                    }
                } catch (error) {
                    console.error("Error connecting to wallet:", error);
                }
            } else {
                console.log("Please install MetaMask!");
            }
            setLoading(false);
        };

        initWallet();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await browserProvider.send("eth_requestAccounts", []);
                const signer = await browserProvider.getSigner();
                setAccount(accounts[0]);
                setSigner(signer);
                setProvider(browserProvider);

                const newContract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(newContract);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <WalletContext.Provider value={{ account, provider, signer, contract, connectWallet, loading }}>
            {children}
        </WalletContext.Provider>
    );
};
