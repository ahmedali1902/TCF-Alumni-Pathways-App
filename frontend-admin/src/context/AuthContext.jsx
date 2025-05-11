import React, { createContext, useContext, useState, useEffect} from "react";
import PropTypes from "prop-types";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        setUser(null);
        if (!email || !password) {
            setError("All fields are required");
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, { email, password });
            const { token, user_id } = response.data.data;

            localStorage.setItem("authToken", token);
            setUser({ id: user_id, email });
        }
        catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.message || "An error occurred");
        }
        finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setIsLoading(true);
        setError(null);
        try {
            localStorage.removeItem("authToken");
            setUser(null);
        } catch (err) {
            console.error("Logout failed:", err);
            setError("Logout failed");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/auth/admin/verify-token`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const { id, email } = response.data;
                setUser({ id, email });
            } catch (err) {
                console.error("Token verification failed:", err);
                localStorage.removeItem("authToken");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyToken();
    }, []);

    const value = {
        user,
        isLoading,
        error,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
