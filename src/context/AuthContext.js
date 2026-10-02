import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);   // tanan nga registered users
  const [user, setUser] = useState(null);   // current logged-in user

  // REGISTER: i-store ang bag-ong user sa users array
  const register = (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || password.length < 6)
      return 'Fill all fields (password min 6 characters).';
    if (users.some((u) => u.email === cleanEmail))
      return 'Email already registered.';
    setUsers((prev) => [...prev, { name: name.trim(), email: cleanEmail, password }]);
    return null;
  };

  // LOGIN: pangitaa ang user sa users array
  const login = (email, password) => {
    const found = users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) return 'Invalid email or password. Register first if you have no account.';
    setUser(found);
    return null;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}