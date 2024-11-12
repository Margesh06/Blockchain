import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import FileSharingContract from '../contracts/FileSharing.json';

const ViewSharedFile = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [sharedFiles, setSharedFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
  
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
  
        // Dynamically fetch the network ID
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = FileSharingContract.networks[networkId];
  
        if (!deployedNetwork) {
          throw new Error(`Contract not deployed on the current network (${networkId}). Please deploy your contract first.`);
        }
  
        const contractInstance = new web3Instance.eth.Contract(
          FileSharingContract.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);
  
        await loadSharedFiles(contractInstance, accounts[0]);
      } catch (err) {
        setError(err.message);
        console.error('Error initializing web3 or contract:', err);
      }
    };
    init();
  }, []);
  

  const loadSharedFiles = async (contractInstance, userAddress) => {
    try {
      // Call getSharedFiles to get the file IDs shared with the user
      const fileIds = await contractInstance.methods.getSharedFiles().call({ from: userAddress, gas: 50000000 });
      console.log('Raw file IDs:', fileIds); // Log the returned value for inspection

      if (!fileIds || fileIds.length === 0) {
        setError('No shared files available.');
        return;
      }

      // Fetch details for each file
      const files = await Promise.all(
        fileIds.map(async (fileId) => {
          try {
            const file = await contractInstance.methods.getFile(fileId).call();
            console.log('File details:', file);
            return { fileId, fileName: file[1], ipfsHash: file[0] };
          } catch (err) {
            console.error('Error fetching file details:', err);
            return null;
          }
        })
      );
      setSharedFiles(files.filter(Boolean)); // Filter out any null results from failed file fetches
    } catch (err) {
      setError('Error loading shared files. Please try again.');
      console.error('Error loading shared files:', err);
    }
  };
  
  

  const viewFile = (ipfsHash) => {
    const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
    window.open(ipfsUrl, '_blank');
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">View Shared Files</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display errors */}

      <div className="bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Your Shared Files</h2>
        <ul>
          {sharedFiles.length > 0 ? (
            sharedFiles.map((file, index) => (
              <li key={index} className="mb-2">
                <p>{file.fileName}</p>
                <button
                  onClick={() => viewFile(file.ipfsHash)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md"
                >
                  View File
                </button>
              </li>
            ))
          ) : (
            <li>No shared files available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ViewSharedFile;
