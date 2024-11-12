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
      const fileIds = await contractInstance.methods.getSharedFiles().call({ from: userAddress, gas: 50000000 });
      console.log('Raw file IDs:', fileIds);

      if (!fileIds || fileIds.length === 0) {
        setError('No shared files available.');
        return;
      }

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
      setSharedFiles(files.filter(Boolean));
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
    <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-6">View Shared Files</h1>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded p-4 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Shared Files</h2>
        {sharedFiles.length > 0 ? (
          <ul className="space-y-4">
            {sharedFiles.map((file, index) => (
              <li key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-900">{file.fileName}</p>
                </div>
                <button
                  onClick={() => viewFile(file.ipfsHash)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                >
                  View File
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-600 text-center py-6">No shared files available.</div>
        )}
      </div>
    </div>
  );
};

export default ViewSharedFile;
