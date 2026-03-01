import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is in localStorage
        const savedUser = localStorage.getItem("spotifyUser");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, email, password) => {
        const res = await api.post("/auth/login", { username, email, password });
        setUser(res.data.user);
        localStorage.setItem("spotifyUser", JSON.stringify(res.data.user));
        return res.data;
    };

    const register = async (username, email, password, role) => {
        const res = await api.post("/auth/register", { username, email, password, role });
        setUser(res.data.user);
        localStorage.setItem("spotifyUser", JSON.stringify(res.data.user));
        return res.data;
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
        localStorage.removeItem("spotifyUser");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
