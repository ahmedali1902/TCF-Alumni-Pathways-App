import React, { use, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Institutes = () => {
    const { user } = useAuth();
	const [institutes, setInstitutes] = useState([]);
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");
	const [deleteId, setDeleteId] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

	const getInstitutes = async (currentPage, perPage, searchQuery) => {
		try {
			setMessage("Loading...");
			const response = await axios.get(`${API_BASE_URL}/dashboard/institute`, {
				params: {
					page: currentPage,
					limit: perPage,
                    search: searchQuery ? searchQuery : undefined
				},
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = response.data.data;
			setInstitutes(data.data);
			if (data.page == data.total_pages) {
				setHasNext(false);
			} else {
				setHasNext(true);
			}
			if (data.page == 1) {
				setHasPrev(false);
			} else {
				setHasPrev(true);
			}
			setMessage("");
		} catch (error) {
			console.error(error);
			setMessage("Error loading data" + error.response.data.message);
		}
	};

	const handleDeleteClick = (id) => {
		setDeleteId(id);
		setDeleteModalMessage("Are you sure you want to delete this institute?");
		setShowDeleteModal(true);
	}

	const handleDeleteConfirm = async () => {
		try {
			const response = await axios.delete(`${API_BASE_URL}/institute/${deleteId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			setDeleteModalMessage("Institute deleted successfully");
			setTimeout(() => {
				setDeleteModalMessage("");
				setShowDeleteModal(false);
                getInstitutes(currentPage, perPage, searchQuery);
			}, 2000);
		} catch (error) {
			setDeleteModalMessage("Error deleting institute: " + error.response.data.message);
			setTimeout(() => {
				setDeleteModalMessage("");
				setShowDeleteModal(false);
			}, 2000);
		}
	};

	useEffect(() => {
		if (!user) {
			setMessage("Please login first!");
		} else {
            console.log(user);
			getInstitutes(currentPage, perPage, searchQuery);
            console.log(institutes);
		}
	}, [user, currentPage, perPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterApply = () => {
		getInstitutes(currentPage, perPage, searchQuery);
	}

	return (
		<Container fluid className="p-0">
			<Sidebar />
			<Container className="text-center mt-5"></Container>
                <h1 className="text-blue-900 fw-semibold">Institutes</h1>
                <Row className="justify-content-center mt-4">
                    {message ? (
                        <h4 className="alert alert-danger">{message}</h4>
                    ) : (
                        <Col xs={12}>
                            <Button variant="primary" as={Link} to="/" className="mb-3"><i className="fa-solid fa-arrow-left me-2" />Back to Dashboard</Button>
                            <div className="d-flex justify-content-between align-items-center mb-3 alert alert-secondary p-2">
                                <div className="d-flex align-items-center">
									<Form.Control
                                        type="text"
                                        name="searchQuery"
                                        placeholder="Search by name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="ms-2"
                                        style={{ width: "150px" }}
                                    />
                                    <Button
                                        variant="primary"
                                        className="ms-3"
                                        onClick={handleFilterApply}
                                    >
                                        Search
                                    </Button>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Form.Label className="mb-0 me-2 fw-bold">Records per page:</Form.Label>
                                    <Form.Control as="select" value={perPage} onChange={handlePerPageChange} style={{ width: '80px' }}>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </Form.Control>
                                </div>
                            </div>
							<Table striped bordered hover className="text-start">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
								<tbody>
                                    {institutes.map((institute) => (
										<tr key={institute.id}>
											<td>{institute.id}</td>
											<td>{institute.name}</td>
                                            <td>
                                                <Button variant="primary" className="me-2" as={Link} to={`/institutes/${institute.id}`}><i className="fa-solid fa-eye" /></Button>
                                                <Button variant="danger" onClick={() => handleDeleteClick(institute.id)}><i className="fa-solid fa-trash" /></Button>
                                            </td>
                                        </tr>
									))}
								</tbody>
							</Table>
                            <Pagination className="justify-content-center">
                                {hasPrev && <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />}
                                <Pagination.Item active>{currentPage}</Pagination.Item>
                                {hasNext && <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />}
                            </Pagination>
                        </Col>
					)}
				</Row>

				<Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
					<Modal.Header closeButton>
						<Modal.Title>Delete Institute</Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {deleteModalMessage && <p className="">{deleteModalMessage}</p>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                    </Modal.Footer>
                </Modal>
        </Container>
    );
};

export default Institutes;