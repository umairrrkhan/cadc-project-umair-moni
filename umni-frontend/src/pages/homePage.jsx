const homepage = () => {
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };
    return (
        <div style={{padding:20}}>
            <h2>Welcome to UmNi Home Page</h2>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default homepage;