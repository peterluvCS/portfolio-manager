import React, { useEffect, useState } from 'react';

const Header = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8081/api/example')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <header>
            <h1>Portfolio Manager</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
            {data && <p>Data from server: {data}</p>}
        </header>
    );
};

export default Header;