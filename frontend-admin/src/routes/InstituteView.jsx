import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import axios from "axios";

const InstituteView = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [instituteData, setInstituteData] = useState({});
    const [message, setMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    const fetchInstituteData = async () => {
        try {
            setMessage("Loading institute data...");
            const response = await axios.get(`${API_BASE_URL}/dashboard/institute/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
        } catch (error) {
            console.error(error);
            setMessage("An error occurred while fetching story data.");
        }
    };

    return (
        <div>InstituteView</div>
    )
}

export default InstituteView