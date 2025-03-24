import React, { useState } from 'react';

function App() {
    const [mode, setMode] = useState(null); // Track user's choice (host or join)
    const [groupName, setGroupName] = useState('');
    const [safeKey, setSafeKey] = useState('');
    const [isInGroup, setIsInGroup] = useState(false); // Track if user is in a group
    const [photos, setPhotos] = useState([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [file, setFile] = useState(null); // For file input

    const hostGroup = async (e) => {
        e.preventDefault();
        const host = 'user@example.com'; // Replace with logged-in user's email

        try {
            const response = await fetch('https://trying-bzx8.onrender.com/host-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupName, safeKey, host }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setIsInGroup(true); // Mark the user as being in a group
            }
        } catch (error) {
            console.error('Error hosting group:', error);
        }
    };

    const joinGroup = async (e) => {
        e.preventDefault();
        const user = 'user@example.com'; // Replace with logged-in user's email

        try {
            const response = await fetch('https://trying-bzx8.onrender.com/join-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ safeKey, user }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setIsInGroup(true); // Mark the user as being in a group
            }
        } catch (error) {
            console.error('Error joining group:', error);
        }
    };

    const uploadPhoto = async (e) => {
        e.preventDefault();
        const user = 'user@example.com'; // Replace with logged-in user's email
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('safeKey', safeKey);
        formData.append('user', user);

        try {
            const response = await fetch('https://trying-bzx8.onrender.com/upload-photo', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setUploadMessage(data.message);
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    };

    const fetchPhotos = async () => {
        const user = 'user@example.com'; // Replace with logged-in user's email

        try {
            const response = await fetch(`https://trying-bzx8.onrender.com/group-photos?safeKey=${safeKey}&user=${user}`);
            const data = await response.json();
            setPhotos(data.photos);
        } catch (error) {
            console.error('Error fetching photos:', error);
        }
    };

    return (
        <div>
            <header style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#333', color: '#fff' }}>
                <h1>Photo Exhibition Platform</h1>
            </header>

            {!isInGroup ? (
                !mode ? (
                    <div style={{ textAlign: 'center', margin: '20px' }}>
                        <button onClick={() => setMode('host')}>Host a Group</button>
                        <button onClick={() => setMode('join')}>Join a Group</button>
                    </div>
                ) : mode === 'host' ? (
                    <form onSubmit={hostGroup} style={{ textAlign: 'center' }}>
                        <input type="text" placeholder="Group Name" onChange={(e) => setGroupName(e.target.value)} required />
                        <input type="text" placeholder="Safe Key" onChange={(e) => setSafeKey(e.target.value)} required />
                        <button type="submit">Host Group</button>
                    </form>
                ) : (
                    <form onSubmit={joinGroup} style={{ textAlign: 'center' }}>
                        <input type="text" placeholder="Safe Key" onChange={(e) => setSafeKey(e.target.value)} required />
                        <button type="submit">Join Group</button>
                    </form>
                )
            ) : (
                <div style={{ textAlign: 'center', margin: '20px' }}>
                    <h2>Welcome to the Group</h2>
                    <form onSubmit={uploadPhoto}>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                        <button type="submit">Upload Photo</button>
                    </form>
                    {uploadMessage && <p>{uploadMessage}</p>}

                    <button onClick={fetchPhotos}>Fetch Photos</button>
                    <div>
                        {photos.map((photo, index) => (
                            <img
                                key={index}
                                src={photo.url}
                                alt={`Uploaded by ${photo.uploadedBy}`}
                                style={{ margin: '10px', width: '200px' }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
