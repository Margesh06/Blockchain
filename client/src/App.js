import React from 'react';
import FileUpload from './components/FileUpload';
import ViewSharedFile from './components/ViewSharedFile';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-4xl font-bold text-blue-600 text-center">
            Decentralized File Sharing
          </h1>
          <p className="text-lg text-gray-600 text-center mt-2">
            Securely upload and share your files on the blockchain.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="bg-white p-8 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Upload Files</h2>
            <FileUpload />
          </section>
          
          <section className="bg-white p-8 shadow-lg rounded-lg">
            
            <ViewSharedFile />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 shadow-md">
        <div className="max-w-4xl mx-auto text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Decentralized File Sharing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
