var _useridkey, _usernamekey, _passwordkey, _userid, _token;

export function init(useridkey, usernamekey, passwordkey) {
    _useridkey = useridkey;
    _usernamekey = usernamekey;
    _passwordkey = passwordkey;
};

export async function login(username, password) {
    var result = await post('/api/auth/login', { username: username, password: password });
    if (result.id) {
        // Login succeeded
        _userid = result.id;
        _token = result.token;
        _storeusercredentials(_userid, username, password);
        window.dispatchEvent(new CustomEvent('login', { detail: { success: true, userid: _userid, token: _token } }));
    } else {
        // Clear stored credentials on failure
        _storeusercredentials();
        window.dispatchEvent(new CustomEvent('login', { detail: { success: false } }));
    }
}

export async function logout() {
    // Simply clear the local storage of user credentials
    _storeusercredentials();
    window.dispatchEvent(new Event('logout'));
}

export async function post(url, data) {
    var response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "x-access-token": _token,
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function register(username, password) {
    var result = await post('/api/auth/register', { username: username, password: password });
    if (result.id) {
        // Registration and login succeeded
        _userid = result.id;
        _token = result.token;
        _storeusercredentials(_userid, username, password);
        window.dispatchEvent(new CustomEvent('login', { detail: { success: true, userid: _userid, token: _token } }));
    } else {
        // Clear stored credentials on failure
        _storeusercredentials();
        window.dispatchEvent(new CustomEvent('login', { detail: { success: false } }));
    }
}

// Store username and password after successful login for future auto login
// Call without parameters to clear the storage after logout
function _storeusercredentials(userid, username, password) {
    if (!userid) localStorage.removeItem(_useridkey);
    else localStorage.setItem(_useridkey, userid);
    if (!username) localStorage.removeItem(_usernamekey);
    else localStorage.setItem(_usernamekey, username);
    if (!password) localStorage.removeItem(_passwordkey);
    else localStorage.setItem(_passwordkey, password);
}

// Tries to login with the credentials stored in local memory.
// Returns true on success, false otherwise.
export async function tryautologin() {
    var username = localStorage.getItem(_usernamekey);
    var password = localStorage.getItem(_passwordkey);
    if (!username || !password) {
        console.log("No username or password stored");
        window.dispatchEvent(new CustomEvent('login', { detail: { success: false } }));
        return;
    }
    try {
        var result = await post('/api/auth/login', { username: username, password: password });
        if (!result.id) {
            // Clear stored credentials on failure
            window.dispatchEvent(new CustomEvent('login', { detail: { success: false } }));
            return;
        }
        _userid = result.id;
        _token = result.token;
        _storeusercredentials(_userid, username, password);
        window.dispatchEvent(new CustomEvent('login', { detail: { success: true, userid: _userid, token: _token } }));
    } catch (err) {
        // Offline
        window.dispatchEvent(new CustomEvent('offline', { detail: { userid: localStorage.getItem(_useridkey) } }));
    }
}
